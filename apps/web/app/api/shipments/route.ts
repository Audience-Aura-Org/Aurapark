import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Shipment from '@/lib/models/Shipment';
import User from '@/lib/models/User';
import Agency from '@/lib/models/Agency';
import Trip from '@/lib/models/Trip';
import Bus from '@/lib/models/Bus';
import Route from '@/lib/models/Route';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        // Security: Passengers can only see their own shipments.
        // We force the userId to be the session user if they are a passenger.
        let effectiveUserId = session.userId.toString();

        if (session.role !== 'USER' && userId && userId !== 'undefined') {
            if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
                return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
            }
            effectiveUserId = userId;
        }

        const query: any = { userId: effectiveUserId };

        const shipments = await Shipment.find(query)
            .sort({ createdAt: -1 });

        return NextResponse.json({ shipments });
    } catch (error: any) {
        console.error('Error fetching passenger shipments:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
