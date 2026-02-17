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

        // Platform revenue calculation
        const confirmedBookings = await Booking.find({ status: 'CONFIRMED' });
        const totalVolume = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const platformRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0) * 0.1, 0);

        // Active Refunds
        const activeRefunds = await Booking.countDocuments({ status: 'REFUNDED' });

        // Pending Disputes
        const Dispute = (await import('@/lib/models/Dispute')).default;
        const pendingDisputes = await Dispute.countDocuments({ status: 'OPEN' });

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
            totalVolume: Math.round(totalVolume),
            platformRevenue: Math.round(platformRevenue),
            activeRefunds,
            recentAgencies,
            activeUsers: activeUsers.length,
            pendingDisputes
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
