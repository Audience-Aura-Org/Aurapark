import { SeatLockService } from './SeatLockService';
import { IdempotencyService } from './IdempotencyService';
import { getPaymentGateway } from './PaymentGateway';
import Payment from '../models/Payment';
import Settlement from '../models/Settlement';
import Booking from '../models/Booking';
import { AppError } from './errors';
import { PaymentStatus } from '../types';

export class BackgroundJobService {
    /**
     * Job: Expire seat locks (release reserved seats that haven't been confirmed)
     * Should run every 5 minutes
     */
    static async expireSeatsJob() {
        try {
            console.log('[Job] Starting seat expiry cleanup...');

            const result = await SeatLockService.releaseExpiredLocks();

            console.log(
                `[Job] Seat expiry completed: ${result.modifiedCount} seats released`
            );

            return result;
        } catch (error: any) {
            console.error('[Job] Seat expiry failed:', error);
            throw new AppError('Seat expiry job failed', 500, { cause: error });
        }
    }

    /**
     * Job: Clean up expired idempotency keys
     * Should run daily (midnight)
     */
    static async cleanupIdempotencyKeysJob() {
        try {
            console.log('[Job] Starting idempotency key cleanup...');

            const result = await IdempotencyService.cleanupExpiredKeys();

            console.log(`[Job] Idempotency cleanup completed: ${result.deletedCount} keys deleted`);

            return result;
        } catch (error: any) {
            console.error('[Job] Idempotency cleanup failed:', error);
            throw new AppError('Idempotency cleanup job failed', 500, { cause: error });
        }
    }

    /**
     * Job: Process refunds for failed/cancelled bookings
     * Should run every 10 minutes
     */
    static async processRefundsJob() {
        try {
            console.log('[Job] Starting refund processing...');

            // Find payments that need refund
            const paymentsToRefund = await Payment.find({
                status: PaymentStatus.PAID,
                refundRequested: true,
                refundStatus: { $exists: false }
            })
                .limit(50) // Process max 50 per run
                .populate('bookingId');

            if (paymentsToRefund.length === 0) {
                console.log('[Job] No refunds to process');
                return { processedCount: 0 };
            }

            let processedCount = 0;
            let failedCount = 0;

            const gateway = getPaymentGateway();

            for (const payment of paymentsToRefund) {
                try {
                    // Call payment gateway to process refund
                    const refundResult = await gateway.refund({
                        transactionId: payment.transactionId,
                        amount: payment.amount,
                        reason: payment.refundReason || 'User requested refund'
                    });

                    // Mark as refund processed
                    payment.refundStatus = 'PROCESSED';
                    payment.refundedAt = new Date();
                    if (refundResult && refundResult.refundId) {
                        payment.refundTransactionId = refundResult.refundId;
                    }
                    await payment.save();

                    // Log refund event
                    console.log(
                        `[Job] Refund processed for payment ${payment._id}: ${payment.amount} XAF`
                    );

                    processedCount++;
                } catch (error) {
                    console.error(`Failed to refund payment ${payment._id}:`, error);
                    payment.refundStatus = 'FAILED';
                    payment.refundError = (error as any).message;
                    await payment.save();
                    failedCount++;
                }
            }

            console.log(
                `[Job] Refund processing completed: ${processedCount} successful, ${failedCount} failed`
            );

            return { processedCount, failedCount };
        } catch (error: any) {
            console.error('[Job] Refund processing failed:', error);
            throw new AppError('Refund processing job failed', 500, { cause: error });
        }
    }

    /**
     * Job: Calculate monthly settlements for agencies
     * Should run on 1st of each month
     */
    static async calculateSettlementsJob() {
        try {
            console.log('[Job] Starting settlement calculation...');

            const now = new Date();
            const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            // Get all successful payments from previous month
            const monthlyPayments = await Payment.find({
                status: PaymentStatus.PAID,
                createdAt: {
                    $gte: previousMonth,
                    $lt: currentMonth
                }
            });

            if (monthlyPayments.length === 0) {
                console.log('[Job] No payments to settle');
                return { settlementsCreated: 0 };
            }

            // Group by agency
            const agencyMap = new Map<string, any[]>();
            for (const payment of monthlyPayments) {
                const agencyId = payment.agencyId.toString();
                if (!agencyMap.has(agencyId)) {
                    agencyMap.set(agencyId, []);
                }
                agencyMap.get(agencyId)!.push(payment);
            }

            let settlementsCreated = 0;

            // Create settlement record for each agency
            for (const [agencyId, payments] of agencyMap) {
                const totalGross = payments.reduce((sum, p) => sum + p.amount, 0);
                const totalPlatformFee = payments.reduce((sum, p) => sum + p.platformFee, 0);
                const totalAgencyAmount = payments.reduce(
                    (sum, p) => sum + p.agencyAmount,
                    0
                );

                const settlement = await Settlement.create({
                    agencyId,
                    month: previousMonth,
                    paymentCount: payments.length,
                    totalGross,
                    platformFee: totalPlatformFee,
                    agencyAmount: totalAgencyAmount,
                    status: 'PENDING',
                    payments: payments.map((p) => p._id),
                    calculatedAt: new Date()
                });

                settlementsCreated++;
                console.log(
                    `[Job] Settlement created for agency ${agencyId}: ${totalAgencyAmount} XAF`
                );
            }

            console.log(
                `[Job] Settlement calculation completed: ${settlementsCreated} settlements created`
            );

            return { settlementsCreated };
        } catch (error: any) {
            console.error('[Job] Settlement calculation failed:', error);
            throw new AppError('Settlement calculation job failed', 500, { cause: error });
        }
    }

    /**
     * Job: Send pending notifications (email, SMS, WhatsApp)
     * Should run every minute
     */
    static async sendNotificationsJob() {
        try {
            console.log('[Job] Starting notification sending...');

            // TODO: Implement notification sending
            // const pendingNotifications = await Notification.find({
            //     status: 'PENDING'
            // }).limit(100);
            //
            // for (const notification of pendingNotifications) {
            //     try {
            //         await notification.send();
            //     } catch (error) {
            //         console.error(`Failed to send notification ${notification._id}:`, error);
            //     }
            // }

            console.log('[Job] Notification sending completed');

            return { sentCount: 0 };
        } catch (error: any) {
            console.error('[Job] Notification sending failed:', error);
            // Don't throw - this job should not block other operations
            return { sentCount: 0, error: error.message };
        }
    }

    /**
     * Job: Reconcile payments with gateway
     * Should run every 6 hours
     */
    static async reconcilePaymentsJob() {
        try {
            console.log('[Job] Starting payment reconciliation...');

            // Find pending payments older than 1 hour
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const pendingPayments = await Payment.find({
                status: PaymentStatus.PENDING,
                createdAt: { $lt: oneHourAgo }
            }).limit(100);

            if (pendingPayments.length === 0) {
                console.log('[Job] No payments to reconcile');
                return { reconciled: 0 };
            }

            let reconciled = 0;
            let failed = 0;
            const gateway = getPaymentGateway();

            // Check each payment with gateway
            for (const payment of pendingPayments) {
                try {
                    const gatewayStatus = await gateway.getPaymentStatus(payment.transactionId);
                    
                    if (gatewayStatus && gatewayStatus.status === 'successful') {
                        payment.status = PaymentStatus.PAID;
                        payment.verifiedAt = new Date();
                        await payment.save();

                        // Confirm seat lock if booking exists
                        if (payment.bookingId) {
                            await SeatLockService.confirmLock(payment.bookingId.toString(), payment._id.toString());
                        }

                        reconciled++;
                        console.log(
                            `[Job] Payment ${payment.transactionId} reconciled as PAID`
                        );
                    } else if (gatewayStatus && gatewayStatus.status === 'failed') {
                        payment.status = PaymentStatus.FAILED;
                        payment.failureReason = gatewayStatus.failureReason || 'Gateway verification failed';
                        await payment.save();

                        // Release seat lock
                        if (payment.bookingId) {
                            await SeatLockService.releaseLock(payment.bookingId.toString());
                        }

                        reconciled++;
                        console.log(
                            `[Job] Payment ${payment.transactionId} reconciled as FAILED`
                        );
                    }
                } catch (error) {
                    console.error(`Failed to reconcile payment ${payment.transactionId}:`, error);
                    failed++;
                }
            }

            console.log(
                `[Job] Payment reconciliation completed: ${reconciled} reconciled, ${failed} failed`
            );

            return { reconciled, failed };
        } catch (error: any) {
            console.error('[Job] Payment reconciliation failed:', error);
            throw new AppError('Payment reconciliation job failed', 500, { cause: error });
        }
    }

    /**
     * Health check endpoint for jobs
     */
    static async healthCheck() {
        return {
            status: 'healthy',
            jobs: [
                {
                    name: 'Seat Expiry',
                    interval: '5 minutes',
                    endpoint: '/api/jobs/expire-seats'
                },
                {
                    name: 'Idempotency Cleanup',
                    interval: 'Daily (midnight)',
                    endpoint: '/api/jobs/cleanup-idempotency'
                },
                {
                    name: 'Process Refunds',
                    interval: '10 minutes',
                    endpoint: '/api/jobs/process-refunds'
                },
                {
                    name: 'Calculate Settlements',
                    interval: 'Monthly (1st)',
                    endpoint: '/api/jobs/calculate-settlements'
                },
                {
                    name: 'Send Notifications',
                    interval: '1 minute',
                    endpoint: '/api/jobs/send-notifications'
                },
                {
                    name: 'Reconcile Payments',
                    interval: '6 hours',
                    endpoint: '/api/jobs/reconcile-payments'
                }
            ]
        };
    }
}
