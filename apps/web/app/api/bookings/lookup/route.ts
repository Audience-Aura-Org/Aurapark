import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';
import Trip from '@/lib/models/Trip';
import Route from '@/lib/models/Route';
import Bus from '@/lib/models/Bus';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import Agency from '@/lib/models/Agency';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const pnr = searchParams.get('pnr');

        if (!pnr) {
            return NextResponse.json({ error: 'PNR required' }, { status: 400 });
        }

        await dbConnect();

        // Security: Get agencyId from logged in user
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const agency = await Agency.findOne({ ownerId: decoded.id });
        if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 403 });

        const booking = await Booking.findOne({ pnr: pnr.toUpperCase() })
            .populate({
                path: 'tripId',
                populate: [
                    { path: 'routeId', select: 'routeName stops' },
                    { path: 'busId', select: 'busNumber type seatMap capacity registrationNumber model' }
                ]
            });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Verify booking belongs to this agency
        if (booking.tripId.agencyId.toString() !== agency._id.toString()) {
            return NextResponse.json({ error: 'Unauthorized access to this booking' }, { status: 403 });
        }

        return NextResponse.json({ booking }, { status: 200 });
    } catch (error: any) {
        console.error('PNR Lookup Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
