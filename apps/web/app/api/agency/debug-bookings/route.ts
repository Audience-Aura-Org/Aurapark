import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';
import Trip from '@/lib/models/Trip';
import Agency from '@/lib/models/Agency';
import User from '@/lib/models/User';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Get authenticated user
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const agency = await Agency.findOne({ ownerId: decoded.id });
        if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 403 });

        // Get all trips for this agency
        const trips = await Trip.find({ agencyId: agency._id });
        const tripIds = trips.map(t => t._id);

        // Get all bookings for these trips
        const allBookings = await Booking.find({ tripId: { $in: tripIds } })
            .populate('tripId', 'routeId busId departureTime')
            .sort({ createdAt: -1 });

        const confirmedBookings = allBookings.filter(b => b.status === 'CONFIRMED');

        const bookingDetails = confirmedBookings.map(b => ({
            pnr: b.pnr,
            status: b.status,
            passengerCount: b.passengers.length,
            createdAt: b.createdAt,
            hasValidTrip: !!(b.tripId?.routeId && b.tripId?.busId),
            tripId: b.tripId?._id
        }));

        const totalSeats = confirmedBookings.reduce((sum, b) => sum + b.passengers.length, 0);

        return NextResponse.json({
            agencyName: agency.name,
            totalBookings: confirmedBookings.length,
            totalSeats,
            bookings: bookingDetails
        }, { status: 200 });

    } catch (error: any) {
        console.error('Debug Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
