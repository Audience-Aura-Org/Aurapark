import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const bookings = await Booking.find({ tripId: id, status: 'CONFIRMED' })
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        return NextResponse.json({ bookings }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching trip bookings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
