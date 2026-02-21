import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Payment from '@/lib/models/Payment';
import Booking from '@/lib/models/Booking';
import Agency from '@/lib/models/Agency';
import { AuditService } from '@/lib/services/AuditService';
import { IdempotencyService } from '@/lib/services/IdempotencyService';
import { getPaymentGateway } from '@/lib/services/PaymentGateway';
import { SeatLockService } from '@/lib/services/SeatLockService';
import { InitiatePaymentSchema, PaymentStatusSchema } from '@/lib/services/validationSchemas';
import { validateBody, validateQuery, errorResponse, successResponse } from '@/lib/services/validationMiddleware';
import { AppError, ValidationError, PaymentError } from '@/lib/services/errors';
import { PaymentStatus } from '@/lib/types';

/**
 * POST /api/payments/initiate
 * Initiate a payment for a booking
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Get user from auth (implement your auth logic)
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return errorResponse(new AppError('User not authenticated', 401), 401);
        }

        // Validate request body
        const validation = await validateBody(request, InitiatePaymentSchema);
        if (!validation.valid) {
            return errorResponse(validation.error, 400);
        }

        const { bookingId, amount, paymentMethod, idempotencyKey } = validation.data;

        // Check idempotency
        let idempotencyResult;
        if (idempotencyKey) {
            idempotencyResult = await IdempotencyService.getOrCreate(
                idempotencyKey,
                userId,
                'POST',
                '/api/payments/initiate',
                validation.data,
                async () => {
                    return await initiatePaymentHandler(bookingId, userId, amount, paymentMethod);
                }
            );

            if (idempotencyResult.isRetry) {
                return successResponse(
                    idempotencyResult.data,
                    idempotencyResult.status,
                    'Idempotent replay - using cached response'
                );
            }
        } else {
            // Process without idempotency
            const result = await initiatePaymentHandler(bookingId, userId, amount, paymentMethod);
            return successResponse(result, 201);
        }

        return successResponse(idempotencyResult.data, 201);
    } catch (error: any) {
        console.error('Payment initiation error:', error);
        if (error instanceof AppError) {
            return errorResponse(error, error.statusCode);
        }
        return errorResponse(new AppError('Payment initiation failed', 500), 500);
    }
}

/**
 * GET /api/payments/status
 * Check payment status
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get user from auth
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return errorResponse(new AppError('User not authenticated', 401), 401);
        }

        // Validate query parameters
        const { searchParams } = new URL(request.url);
        const validation = validateQuery(searchParams, PaymentStatusSchema);
        if (!validation.valid) {
            return errorResponse(validation.error, 400);
        }

        const { transactionId } = validation.data;

        // Find payment
        const payment = await Payment.findOne({
            transactionId,
            userId
        });

        if (!payment) {
            return errorResponse(new AppError('Payment not found', 404), 404);
        }

        // If status is pending, check with payment gateway
        if (payment.status === PaymentStatus.PENDING) {
            try {
                const gateway = getPaymentGateway();
                const gatewayStatus = await gateway.getPaymentStatus(transactionId);

                // Update payment status if changed
                if (gatewayStatus && gatewayStatus.status === 'successful' && payment.status !== PaymentStatus.PAID) {
                    payment.status = PaymentStatus.PAID;
                    if (gatewayStatus.transactionId) payment.transactionId = gatewayStatus.transactionId;
                    await payment.save();

                    // Confirm seat lock
                    if (payment.bookingId) {
                        const booking = await Booking.findById(payment.bookingId);
                        if (booking && (booking as any).seatLockId) {
                            await SeatLockService.confirmLock(
                                (booking as any).seatLockId,
                                payment.bookingId.toString()
                            );
                        }
                    }
                } else if (gatewayStatus && gatewayStatus.status === 'failed' && payment.status !== PaymentStatus.FAILED) {
                    payment.status = PaymentStatus.FAILED;
                    await payment.save();

                    // Release seat lock
                    if (payment.bookingId) {
                        const booking = await Booking.findById(payment.bookingId);
                        if (booking && (booking as any).seatLockId) {
                            await SeatLockService.releaseLock((booking as any).seatLockId);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to check payment status with gateway:', error);
            }
        }

        return successResponse({
            paymentId: payment._id,
            bookingId: payment.bookingId,
            amount: payment.amount,
            platformFee: payment.platformFee,
            agencyAmount: payment.agencyAmount,
            status: payment.status,
            transactionId: payment.transactionId,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt
        });
    } catch (error: any) {
        console.error('Payment status check error:', error);
        if (error instanceof AppError) {
            return errorResponse(error, error.statusCode);
        }
        return errorResponse(new AppError('Failed to check payment status', 500), 500);
    }
}

/**
 * Helper function to initiate payment
 */
async function initiatePaymentHandler(
    bookingId: string,
    userId: string,
    amount: number,
    paymentMethod: string
) {
    // Get Booking
    const booking = await Booking.findById(bookingId).populate('tripId');
    if (!booking) {
        throw new AppError('Booking not found', 404);
    }

    if (booking.userId.toString() !== userId) {
        throw new AppError('Unauthorized - this booking does not belong to you', 403);
    }

    const trip = booking.tripId as any;
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    // Get Agency
    const agency = await Agency.findById(trip.agencyId);
    if (!agency) {
        throw new AppError('Agency not found', 404);
    }

    // Calculate fees
    const platformFeePercentage = (agency as any)?.settings?.platformFeePercentage || 10;
    const platformFee = (amount * platformFeePercentage) / 100;
    const agencyAmount = amount - platformFee;

    // Create Payment Record
    const payment = await Payment.create({
        bookingId,
        tripId: trip._id,
        agencyId: trip.agencyId,
        userId,
        amount,
        platformFee,
        agencyAmount,
        paymentMethod,
        status: PaymentStatus.PENDING
    });

    // Get payment gateway
    const gateway = getPaymentGateway();

    // Initiate payment with gateway
    const paymentInitiation = await gateway.initiatePayment({
        amount,
        currency: 'XAF', // TODO: Make configurable
        reference: payment._id.toString(),
        customerEmail: (booking as any).contactEmail,
        customerName: (booking as any).passengers?.[0]?.name || 'Customer',
        customerPhone: (booking as any).contactPhone,
        redirectUrl: `${process.env.APP_URL}/api/payments/callback`,
        callbackUrl: `${process.env.APP_URL}/api/payments/webhook`,
        metadata: {
            bookingId: booking._id.toString(),
            tripId: trip._id.toString(),
            agencyId: trip.agencyId.toString(),
            paymentId: payment._id.toString()
        }
    });

    // Update payment with gateway info
    if (paymentInitiation && 'transactionId' in paymentInitiation) {
        payment.transactionId = paymentInitiation.transactionId;
        await payment.save();

        // Audit log
        await AuditService.log({
            userId,
            action: 'PAYMENT_INITIATED',
            resource: 'Payment',
            resourceId: payment._id.toString(),
            details: {
                bookingId: booking._id.toString(),
                amount,
                paymentMethod,
                transactionId: paymentInitiation.transactionId
            }
        });

        return {
            paymentId: payment._id,
            bookingId: booking._id,
            paymentLink: paymentInitiation.paymentLink,
            amount,
            platformFee,
            agencyAmount,
            status: PaymentStatus.PENDING,
            transactionId: paymentInitiation.transactionId,
            redirectUrl: paymentInitiation.paymentLink
        };
    }

    throw new PaymentError('Failed to initiate payment');
}
