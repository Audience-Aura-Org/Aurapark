import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import Agency from '@/lib/models/Agency';
import Trip from '@/lib/models/Trip';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const tokenToken = cookieStore.get('token');
        const authToken = cookieStore.get('auth_token');
        const token = tokenToken?.value || authToken?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Get counts
        const totalAgencies = await Agency.countDocuments();
        const activeAgencies = await Agency.countDocuments({ status: 'ACTIVE' });
        const totalTrips = await Trip.countDocuments();
        const activeTrips = await Trip.countDocuments({ status: 'SCHEDULED', departureTime: { $gte: new Date() } });
        const totalBookings = await Booking.countDocuments();

        // Today's bookings
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const todayBookings = await Booking.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Platform revenue (sum of all confirmed bookings * platform fee 10%)
        const bookings = await Booking.find({ status: 'CONFIRMED' });
        const platformRevenue = bookings.reduce((sum: number, booking: any) => sum + (booking.totalAmount * 0.1), 0);

        // Recent agencies
        const recentAgencies = await Agency.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name email status trustScore createdAt');

        // Active users (users who made bookings in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = await Booking.distinct('userId', {
            createdAt: { $gte: thirtyDaysAgo }
        });

        return NextResponse.json({
            totalAgencies,
            activeAgencies,
            totalTrips,
            activeTrips,
            totalBookings,
            todayBookings,
            platformRevenue: Math.round(platformRevenue),
            recentAgencies,
            activeUsers: activeUsers.length,
            pendingDisputes: 0 // TODO: Implement when Dispute model is ready
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
