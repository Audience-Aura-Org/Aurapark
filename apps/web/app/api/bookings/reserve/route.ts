import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import SeatReservation from '@/lib/models/SeatReservation';
import Trip from '@/lib/models/Trip';
import { ReservationStatus } from '@/lib/types';

// POST /api/bookings/reserve - Temporary seat hold
export async function POST(req: Request) {
    try {
        const { tripId, seatNumbers, userId, sessionId } = await req.json();

        if (!tripId || !seatNumbers || !seatNumbers.length || !sessionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // 1. Check if seats are currently available in the Trip model
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        const unavail = seatNumbers.filter((s: string) => !trip.availableSeats.includes(s));
        if (unavail.length > 0) {
            return NextResponse.json({
                error: 'One or more seats are no longer available',
                unavailableSeats: unavail
            }, { status: 409 });
        }

        // 2. Check if there are any active PENDING reservations for these seats
        const existingReservations = await SeatReservation.find({
            tripId,
            seatNumbers: { $in: seatNumbers },
            status: ReservationStatus.PENDING,
            expiresAt: { $gt: new Date() }
        });

        if (existingReservations.length > 0) {
            return NextResponse.json({
                error: 'One or more seats are temporarily held by another user'
            }, { status: 409 });
        }

        // 3. Create reservation (expires in 10 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        const reservation = await SeatReservation.create({
            tripId,
            seatNumbers,
            userId,
            sessionId,
            status: ReservationStatus.PENDING,
            expiresAt
        });

        return NextResponse.json({
            message: 'Seats reserved temporarily',
            reservationId: reservation._id,
            expiresAt: reservation.expiresAt
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error reserving seats:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
