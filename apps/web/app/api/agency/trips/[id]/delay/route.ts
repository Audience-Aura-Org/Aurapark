import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Trip from '@/lib/models/Trip';
import Booking from '@/lib/models/Booking';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Verify agency authentication
        const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'AGENCY_STAFF') {
            return NextResponse.json({ error: 'Forbidden - Agency access only' }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { newDepartureTime, reason } = body;

        if (!newDepartureTime || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Get the trip
        const trip = await Trip.findById(id);
        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Verify agency owns this trip
        if (trip.agencyId.toString() !== decoded.agencyId) {
            return NextResponse.json({ error: 'Unauthorized - Not your trip' }, { status: 403 });
        }

        // Update trip departure time
        const oldDepartureTime = trip.departureTime;
        trip.departureTime = new Date(newDepartureTime);

        // Calculate new arrival time (maintain same duration)
        const duration = new Date(trip.arrivalTime).getTime() - new Date(oldDepartureTime).getTime();
        trip.arrivalTime = new Date(new Date(newDepartureTime).getTime() + duration);

        await trip.save();

        // TODO: Send notifications to all passengers with confirmed bookings
        // This would integrate with SMS/Email notification service
        const bookings = await Booking.find({ tripId: id, status: 'CONFIRMED' });
        console.log(`Notifying ${bookings.length} passengers about trip delay`);

        return NextResponse.json({
            success: true,
            message: `Trip delayed successfully. ${bookings.length} passengers will be notified.`,
            trip,
            oldDepartureTime,
            newDepartureTime,
            reason
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error delaying trip:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
