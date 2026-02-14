import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Dispute from '@/lib/models/Dispute';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import Agency from '@/lib/models/Agency';
import Trip from '@/lib/models/Trip';
import Route from '@/lib/models/Route';
import Bus from '@/lib/models/Bus';
import Stop from '@/lib/models/Stop';

// GET /api/disputes - List disputes
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const agencyId = searchParams.get('agencyId');

        const filter: any = {};
        if (userId && userId !== 'undefined') {
            if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
                return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
            }
            filter.userId = userId;
        }
        if (agencyId && agencyId !== 'undefined') {
            if (!/^[0-9a-fA-F]{24}$/.test(agencyId)) {
                return NextResponse.json({ error: 'Invalid Agency ID format' }, { status: 400 });
            }
            filter.agencyId = agencyId;
        }

        const disputes = await Dispute.find(filter)
            .populate('bookingId')
            .populate('userId', 'name email')
            .populate('agencyId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ disputes }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching disputes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/disputes - Create a new dispute
export async function POST(req: Request) {
    try {
        const { bookingId, reason, description, amountRequested } = await req.json();

        if (!bookingId || !reason || !description || !amountRequested) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const dispute = await Dispute.create({
            bookingId,
            userId: booking.userId,
            agencyId: booking.agencyId,
            reason,
            description,
            amountRequested,
            status: 'OPEN'
        });

        return NextResponse.json({
            message: 'Dispute created successfully',
            dispute
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating dispute:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
