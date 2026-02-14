import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Trip from '@/lib/models/Trip';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const cookieStore = await (await import('next/headers')).cookies();
        const token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;

        if (!token) {
            console.log('[API/DRIVER/TRIPS] Token missing');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'DRIVER') {
            console.log('[API/DRIVER/TRIPS] Forbidden - Role:', decoded?.role);
            return NextResponse.json({ error: 'Forbidden - Driver access only' }, { status: 403 });
        }

        await dbConnect();

        // Filter by driverId from token
        // Also populate booking information to get passenger counts
        const trips = await Trip.find({
            driverId: decoded.id,
            departureTime: { $gte: new Date() },
            status: { $in: ['SCHEDULED', 'EN_ROUTE', 'DELAYED'] }
        })
            .populate('routeId', 'routeName stops')
            .populate('busId', 'busNumber capacity')
            .populate('agencyId', 'name')
            .sort({ departureTime: 1 })
            .limit(20);

        // Enhance trip objects with booked seat counts
        // We'll need to count booked seats from the availableSeats array or fetch bookings
        // For simplicity, let's calculate booked seats from bus capacity vs availableSeats length
        const Booking = (await import('@/lib/models/Booking')).default;

        const enhancedTrips = await Promise.all(trips.map(async (trip) => {
            const totalSeats = trip.busId.capacity;
            const bookingCount = await Booking.countDocuments({
                tripId: trip._id,
                status: 'CONFIRMED'
            });

            // We still derive bookedSeats from manifest count for accuracy
            const passengers = await Booking.find({ tripId: trip._id, status: 'CONFIRMED' });
            const totalPassengers = passengers.reduce((sum, b) => sum + b.passengers.length, 0);

            return {
                ...trip.toObject(),
                totalSeats,
                bookedSeats: totalPassengers
            };
        }));

        return NextResponse.json({ trips: enhancedTrips }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching driver trips:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
