import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import { BackgroundJobService } from '@/lib/services/BackgroundJobService';
import { AppError } from '@/lib/services/errors';
import { successResponse, errorResponse } from '@/lib/services/validationMiddleware';

/**
 * Verify job authorization (should be called from cron service with secret key)
 */
function verifyJobAuthorization(request: NextRequest): boolean {
    const jobSecret = request.headers.get('x-job-secret');
    const expectedSecret = process.env.JOB_SECRET_KEY;

    if (!expectedSecret) {
        console.warn('JOB_SECRET_KEY not configured');
        return false;
    }

    return jobSecret === expectedSecret;
}

/**
 * POST /api/jobs/expire-seats
 * Trigger seat expiry cleanup
 */
export async function POST(
    request: NextRequest,
    context: { params: { job: string } }
) {
    try {
        const job = context.params.job;

        // Verify authorization
        if (!verifyJobAuthorization(request)) {
            return errorResponse(
                new AppError('Unauthorized - invalid job secret', 401),
                401
            );
        }

        await dbConnect();

        switch (job) {
            case 'expire-seats':
                const seatResult = await BackgroundJobService.expireSeatsJob();
                return successResponse(seatResult);

            case 'cleanup-idempotency':
                const idempotencyResult = await BackgroundJobService.cleanupIdempotencyKeysJob();
                return successResponse(idempotencyResult);

            case 'process-refunds':
                const refundResult = await BackgroundJobService.processRefundsJob();
                return successResponse(refundResult);

            case 'calculate-settlements':
                const settlementResult = await BackgroundJobService.calculateSettlementsJob();
                return successResponse(settlementResult);

            case 'send-notifications':
                const notificationResult = await BackgroundJobService.sendNotificationsJob();
                return successResponse(notificationResult);

            case 'reconcile-payments':
                const reconcileResult = await BackgroundJobService.reconcilePaymentsJob();
                return successResponse(reconcileResult);

            case 'health':
                const health = await BackgroundJobService.healthCheck();
                return successResponse(health);

            default:
                return errorResponse(
                    new AppError(`Unknown job: ${job}`, 404),
                    404
                );
        }
    } catch (error: any) {
        console.error(`Job ${context.params.job} failed:`, error);
        if (error instanceof AppError) {
            return errorResponse(error, error.statusCode);
        }
        return errorResponse(
            new AppError('Job execution failed', 500, { cause: error }),
            500
        );
    }
}

/**
 * GET /api/jobs/health
 * Health check for all jobs
 */
export async function GET(
    request: NextRequest,
    context: { params: { job: string } }
) {
    const job = context.params.job;

    if (job === 'health') {
        const health = await BackgroundJobService.healthCheck();
        return successResponse(health);
    }

    return errorResponse(
        new AppError('Use POST method to trigger jobs', 405),
        405
    );
}
