import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';
import Trip from '@/lib/models/Trip';
import Route from '@/lib/models/Route';
import Agency from '@/lib/models/Agency';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();

        const booking = await Booking.findById(id)
            .populate({
                path: 'tripId',
                populate: [
                    { path: 'routeId', select: 'routeName' },
                    { path: 'agencyId', select: 'name' },
                    { path: 'busId', select: 'busNumber model type seatMap' }
                ]
            });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({ booking }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching booking details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
