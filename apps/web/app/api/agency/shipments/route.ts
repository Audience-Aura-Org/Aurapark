import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import Shipment from '@/lib/models/Shipment';
import Payment from '@/lib/models/Payment';
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

        const shipments = await Shipment.find(query)
            .sort({ createdAt: -1 });

        return NextResponse.json({ shipments });
    } catch (error: any) {
        console.error('Error fetching shipments:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();

        // Server-side validation
        const {
            sender,
            receiver,
            origin,
            destination,
            content,
            weight,
            price,
            status
        } = body || {};

        if (!sender?.name || !sender?.phone ||
            !receiver?.name || !receiver?.phone ||
            !origin || !destination || !content ||
            (price === undefined || price === null)) {
            return NextResponse.json(
                { error: 'Missing required shipment fields' },
                { status: 400 }
            );
        }

        const numericPrice = Number(price);
        const numericWeight = weight !== undefined && weight !== null ? Number(weight) : undefined;

        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            return NextResponse.json(
                { error: 'Invalid price value for shipment' },
                { status: 400 }
            );
        }

        const shipment = await Shipment.create({
            ...body,
            price: numericPrice,
            ...(numericWeight !== undefined ? { weight: numericWeight } : {}),
            agencyId: session.agencyId,
            history: [{
                status: status || 'PENDING',
                timestamp: new Date(),
                notes: 'Shipment initialized'
            }]
        });

        // Create Payment record for shipment
        await Payment.create({
            type: 'SHIPMENT',
            shipmentId: shipment._id,
            agencyId: session.agencyId,
            userId: session.userId, // Link to agency staff creating it? Or maybe leave empty if it's just a shipment
            amount: numericPrice,
            platformFee: 0, // No platform fee for shipments currently? Or 10%? Let's assume 0 for now or same as booking
            agencyAmount: numericPrice,
            currency: 'XAF',
            paymentMethod: body.paymentMethod || 'CASH', // Default to CASH
            status: body.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
            transactionId: `SHP-${shipment.trackingNumber}`
        });

        return NextResponse.json({ shipment });
    } catch (error: any) {
        console.error('Error creating shipment:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, status, notes, paymentStatus, location } = body;

        if (!id) return NextResponse.json({ error: 'Shipment ID required' }, { status: 400 });

        const shipment = await Shipment.findOne({ _id: id, agencyId: session.agencyId });
        if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

        const updateData: any = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (notes) updateData.notes = notes;

        // Add to history if status changed
        if (status && status !== shipment.status) {
            shipment.history.push({
                status,
                timestamp: new Date(),
                location: location || shipment.destination,
                notes: notes || `Shipment status updated to ${status}`
            });
            updateData.history = shipment.history;
        }

        const updatedShipment = await Shipment.findByIdAndUpdate(id, updateData, { new: true });

        return NextResponse.json({ shipment: updatedShipment });
    } catch (error: any) {
        console.error('Error updating shipment:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
