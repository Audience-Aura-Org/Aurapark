import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Dispute from '@/lib/models/Dispute';
import Booking from '@/lib/models/Booking';
import Payment from '@/lib/models/Payment';
import { AuditService } from '@/lib/services/AuditService';

// GET /api/disputes/[id] - Get single dispute detail
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const dispute = await Dispute.findById(id)
            .populate({
                path: 'bookingId',
                populate: { path: 'tripId', populate: { path: 'routeId' } }
            })
            .populate('userId', 'name email')
            .populate('agencyId', 'name email');

        if (!dispute) {
            return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        }

        return NextResponse.json({ dispute }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching dispute:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/disputes/[id] - Resolve dispute
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { status, resolutionSummary, refundAmount } = await req.json();

        await dbConnect();

        const dispute = await Dispute.findById(id);
        if (!dispute) {
            return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        }

        dispute.status = status;
        if (resolutionSummary) dispute.resolutionSummary = resolutionSummary;
        if (refundAmount) dispute.refundAmount = refundAmount;
        // Only stamp resolvedAt when truly finalized
        if (status === 'RESOLVED' || status === 'REJECTED') {
            dispute.resolvedAt = new Date();
        }
        await dispute.save();

        // If status is REFUNDED, we should ideally trigger a payment refund here
        // For now, we'll mark the original booking/payment status if applicable

        // Audit Logging
        await AuditService.log({
            userId: 'SYSTEM_ADMIN',
            action: 'DISPUTE_RESOLVED',
            resource: 'Dispute',
            resourceId: id,
            details: { status, refundAmount },
            req
        });

        return NextResponse.json({
            message: `Dispute marked as ${status}`,
            dispute
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error resolving dispute:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
