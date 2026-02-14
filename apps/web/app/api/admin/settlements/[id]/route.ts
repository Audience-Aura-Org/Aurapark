import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Settlement from '@/lib/models/Settlement';
import { AuditService } from '@/lib/services/AuditService';

// PATCH /api/admin/settlements/[id] - Process a settlement (Mark as PAID/FAILED)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { status, transactionId, paymentMethod } = await req.json();

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        await dbConnect();

        const updates: any = { status };
        if (transactionId) updates.transactionId = transactionId;
        if (paymentMethod) updates.paymentMethod = paymentMethod;
        if (status === 'PAID') updates.paidOn = new Date();

        const settlement = await Settlement.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        ).populate('agencyId', 'name');

        if (!settlement) {
            return NextResponse.json({ error: 'Settlement not found' }, { status: 404 });
        }

        // Audit Logging
        await AuditService.log({
            userId: 'SYSTEM_ADMIN', // We'll replace with actual admin user ID when auth is integrated
            action: 'SETTLEMENT_UPDATED',
            resource: 'Settlement',
            resourceId: id,
            details: { previousStatus: settlement.status, newStatus: status, agencyId: settlement.agencyId },
            req
        });

        return NextResponse.json({
            message: `Settlement marked as ${status}`,
            settlement
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating settlement:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
