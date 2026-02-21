import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Payment from '@/lib/models/Payment';
import Booking from '@/lib/models/Booking';
import Trip from '@/lib/models/Trip';
import { SeatLockService } from '@/lib/services/SeatLockService';
import { getPaymentGateway } from '@/lib/services/PaymentGateway';
import { PaymentCallbackSchema } from '@/lib/services/validationSchemas';
import { validateBody, errorResponse, successResponse } from '@/lib/services/validationMiddleware';
import { AuditService } from '@/lib/services/AuditService';
import { AppError, PaymentError } from '@/lib/services/errors';
import { PaymentStatus } from '@/lib/types';

/**
 * POST /api/payments/webhook/flutterwave
 * Webhook handler for Flutterwave payment callbacks
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Get signature from header
        const signature = request.headers.get('Verifi-Hash');
        if (!signature) {
            return errorResponse(
                new AppError('Missing webhook signature', 401),
                401
            );
        }

        // Get raw body for signature verification
        const body = await request.text();

        // Verify signature
        const gateway = getPaymentGateway();
        if (!(gateway as any).verifyWebhookSignature) {
            return errorResponse(
                new AppError('Gateway does not support webhook verification', 500),
                500
            );
        }

        const isValid = (gateway as any).verifyWebhookSignature(body, signature);
        if (!isValid) {
            console.warn('Invalid webhook signature from Flutterwave');
            return errorResponse(
                new AppError('Invalid webhook signature', 401),
                401
            );
        }

        // Parse JSON body
        const data = JSON.parse(body);

        // Validate against schema (without signature this time)
        const payloadData = {
            transactionId: data.data?.id,
            reference: data.data?.tx_ref,
            status: data.data?.status,
            amount: data.data?.amount,
            currency: data.data?.currency,
            customerEmail: data.data?.customer?.email,
            signature
        };

        // Find payment by reference
        const payment = await Payment.findOne({
            transactionId: payloadData.transactionId
        });

        if (!payment) {
            console.warn('Payment not found for webhook:', payloadData.transactionId);
            return successResponse({
                message: 'Webhook received but payment not found'
            });
        }

        // Update payment status based on callback
        if (payloadData.status === 'successful' && payment.status !== PaymentStatus.PAID) {
            payment.status = PaymentStatus.PAID;
            payment.transactionId = payloadData.transactionId;
            await payment.save();

            // Confirm seat lock if exists
            if (payment.bookingId) {
                try {
                    const booking = await Booking.findById(payment.bookingId);
                    if (booking && (booking as any).seatLockId) {
                        await SeatLockService.confirmLock(
                            (booking as any).seatLockId,
                            payment.bookingId.toString()
                        );
                    }
                } catch (error) {
                    console.error('Failed to confirm seat lock:', error);
                }
            }

            // Audit log
            await AuditService.log({
                userId: payment.userId.toString(),
                action: 'PAYMENT_COMPLETED',
                resource: 'Payment',
                resourceId: payment._id.toString(),
                details: {
                    bookingId: payment.bookingId.toString(),
                    amount: payment.amount,
                    transactionId: payloadData.transactionId,
                    status: payloadData.status
                }
            });

            // TODO: Send confirmation email / WhatsApp notification
            console.log(`Payment ${payment._id} completed successfully`);
        } else if (
            (payloadData.status === 'failed' || payloadData.status === 'cancelled') &&
            payment.status !== PaymentStatus.FAILED
        ) {
            payment.status = PaymentStatus.FAILED;
            await payment.save();

            // Release seat lock
            if (payment.bookingId) {
                try {
                    const booking = await Booking.findById(payment.bookingId);
                    if (booking && (booking as any).seatLockId) {
                        await SeatLockService.releaseLock((booking as any).seatLockId);
                    }
                } catch (error) {
                    console.error('Failed to release seat lock:', error);
                }
            }

            // Audit log
            await AuditService.log({
                userId: payment.userId.toString(),
                action: 'PAYMENT_FAILED',
                resource: 'Payment',
                resourceId: payment._id.toString(),
                details: {
                    bookingId: payment.bookingId.toString(),
                    amount: payment.amount,
                    transactionId: payloadData.transactionId,
                    status: payloadData.status
                }
            });

            console.log(`Payment ${payment._id} failed with status: ${payloadData.status}`);
        }

        // Always return 200 to acknowledge receipt
        return successResponse({
            message: 'Webhook processed successfully',
            paymentId: payment._id,
            status: payment.status
        });
    } catch (error: any) {
        console.error('Webhook processing error:', error);
        // Still return 200 to prevent retry loops
        return successResponse({
            message: 'Webhook received and logged',
            error: error.message
        });
    }
}

/**
 * GET /api/payments/webhook/flutterwave
 * Health check endpoint
 */
export async function GET() {
    return successResponse({
        message: 'Flutterwave webhook endpoint is active',
        endpoint: '/api/payments/webhook/flutterwave'
    });
}
