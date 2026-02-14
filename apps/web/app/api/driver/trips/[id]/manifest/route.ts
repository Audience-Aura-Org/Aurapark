import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Trip from '@/lib/models/Trip';
import Booking from '@/lib/models/Booking';
import { verifyToken } from '@/lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await (await import('next/headers')).cookies();
        const token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'DRIVER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Verify trip ownership
        const trip = await Trip.findOne({
            _id: id,
            driverId: decoded.id
        })
            .populate('routeId', 'routeName')
            .populate('busId', 'busNumber capacity seatMap'); // Populate seatMap

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Fetch bookings for this trip
        const bookings = await Booking.find({
            tripId: id,
            status: 'CONFIRMED'
        });

        // Helper to get sequential seat number
        const busSeats = trip.busId?.seatMap?.seats || [];
        const getDisplaySeatNumber = (seatId: string) => {
            const index = busSeats.findIndex((s: any) => s.seatNumber === seatId);
            return index !== -1 ? (index + 1).toString() : seatId;
        };

        // Flatten passengers from all bookings
        const passengers: any[] = [];
        bookings.forEach((booking: any) => {
            booking.passengers.forEach((p: any) => {
                passengers.push({
                    name: p.name,
                    seatNumber: p.seatNumber,
                    displaySeatNumber: getDisplaySeatNumber(p.seatNumber),
                    ticketNumber: p.ticketNumber,
                    pnr: booking.pnr,
                    paymentStatus: booking.paymentStatus,
                    checkedIn: p.checkedIn || false,
                    gender: p.gender,
                    age: p.age
                });
            });
        });

        // Sort by display seat number
        passengers.sort((a, b) => {
            return (parseInt(a.displaySeatNumber) || 0) - (parseInt(b.displaySeatNumber) || 0);
        });

        const manifest = {
            tripId: trip._id,
            routeName: trip.routeId.routeName,
            busNumber: trip.busId.busNumber,
            departureTime: trip.departureTime,
            passengers,
            checkedIn: passengers.filter(p => p.checkedIn).length
        };

        return NextResponse.json({ manifest }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching manifest:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
