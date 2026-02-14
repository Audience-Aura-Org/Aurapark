import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: tripId } = await params;
        await dbConnect();

        const bookings = await Booking.find({ tripId, status: 'CONFIRMED' })
            .populate('userId', 'name email phone');

        // Flatten passengers from all bookings
        const manifest = bookings.flatMap(b => b.passengers.map((p: any) => ({
            ...p,
            contactEmail: b.contactEmail,
            contactPhone: b.contactPhone,
            pnr: b.pnr
        })));

        return NextResponse.json({ manifest }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching manifest:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
