import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import Dispute from '@/lib/models/Dispute';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const query: any = { agencyId: session.agencyId };
        if (status) query.status = status;

        const disputes = await Dispute.find(query)
            .populate('bookingId', 'pnr totalAmount')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ disputes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, status, resolutionSummary } = body;

        const dispute = await Dispute.findOneAndUpdate(
            { _id: id, agencyId: session.agencyId },
            {
                status,
                resolutionSummary,
                resolvedAt: status === 'RESOLVED' || status === 'REJECTED' ? new Date() : undefined
            },
            { new: true }
        );

        if (!dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });

        return NextResponse.json({ dispute });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
