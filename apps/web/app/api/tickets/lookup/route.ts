import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';

// POST /api/tickets/lookup - Find booking by PNR and phone
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { pnr, phone } = body;

        if (!pnr || !phone) {
            return NextResponse.json({ error: 'PNR and phone number required' }, { status: 400 });
        }

        await dbConnect();

        // Find booking by PNR and phone
        const booking = await Booking.findOne({
            pnr: pnr.toUpperCase(),
            contactPhone: phone
        })
            .populate('tripId')
            .populate('agencyId', 'name');

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found. Please check your PNR and phone number.' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            booking
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error looking up booking:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
