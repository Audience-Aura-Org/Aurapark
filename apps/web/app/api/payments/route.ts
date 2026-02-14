import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Payment from '@/lib/models/Payment';
import Booking from '@/lib/models/Booking';
import Agency from '@/lib/models/Agency';
import { AuditService } from '@/lib/services/AuditService';
import { PaymentStatus } from '@/lib/types';

// POST /api/payments/initiate
export async function POST(req: Request) {
    try {
        const { bookingId, amount, paymentMethod } = await req.json();

        if (!bookingId || !amount || !paymentMethod) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // 1. Get Booking and Agency to calculate platform fee
        const booking = await Booking.findById(bookingId).populate('tripId');
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const trip = booking.tripId as any;
        const agency = await Agency.findById(trip.agencyId);

        const platformFeePercentage = agency?.settings?.platformFeePercentage || 10;
        const platformFee = (amount * platformFeePercentage) / 100;
        const agencyAmount = amount - platformFee;

        // 2. Create Payment Record
        const payment = await Payment.create({
            bookingId,
            tripId: trip._id,
            agencyId: trip.agencyId,
            userId: booking.userId,
            amount,
            platformFee,
            agencyAmount,
            paymentMethod,
            status: PaymentStatus.PENDING
        });

        // 3. Audit Logging
        await AuditService.log({
            userId: payment.userId,
            action: 'PAYMENT_INITIATED',
            resource: 'Payment',
            resourceId: payment._id.toString(),
            details: { amount: payment.amount, platformFee: payment.platformFee, bookingId: payment.bookingId },
            req
        });

        return NextResponse.json({
            message: 'Payment initiated',
            paymentId: payment._id,
            platformFee,
            total: amount
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error initiating payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
