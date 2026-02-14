import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';

// POST /api/tickets/check-in - Mark a passenger as checked-in
export async function POST(req: Request) {
    try {
        const { pnr, ticketNumber } = await req.json();

        if (!pnr || !ticketNumber) {
            return NextResponse.json({ error: 'Missing PNR or Ticket Number' }, { status: 400 });
        }

        await dbConnect();

        const booking = await Booking.findOne({ pnr });
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Update the specific passenger's check-in status
        // Mongoose doesn't support direct sub-document updates easily with findOne, 
        // so we modify the array and save
        const passengerIndex = booking.passengers.findIndex((p: any) => p.ticketNumber === ticketNumber);

        if (passengerIndex === -1) {
            return NextResponse.json({ error: 'Ticket not found in this booking' }, { status: 404 });
        }

        if (booking.passengers[passengerIndex].checkedIn) {
            return NextResponse.json({
                message: 'Passenger already checked in',
                passenger: booking.passengers[passengerIndex]
            }, { status: 200 });
        }

        // Update status
        booking.passengers[passengerIndex].checkedIn = true;
        await booking.save();

        return NextResponse.json({
            message: 'Passenger checked in successfully',
            passenger: booking.passengers[passengerIndex]
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error during check-in:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
