import crypto from 'crypto';
import IdempotencyKey from '../models/IdempotencyKey';
import { AppError } from './errors';

interface IdempotencyOptions {
    ttlHours?: number;
}

export class IdempotencyService {
    private static readonly DEFAULT_TTL_HOURS = 24;

    /**
     * Generate a hash from request body for duplicate detection
     */
    static generateRequestHash(body: any): string {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(body))
            .digest('hex');
    }

    /**
     * Get or create an idempotency key entry
     * If the key already exists with a successful response, return the cached response
     * If it's still pending, wait or throw error based on timeout
     */
    static async getOrCreate(
        key: string,
        userId: string,
        method: string,
        endpoint: string,
        requestBody: any,
        handler: () => Promise<any>,
        options: IdempotencyOptions = {}
    ) {
        try {
            const ttlHours = options.ttlHours || this.DEFAULT_TTL_HOURS;
            const requestHash = this.generateRequestHash(requestBody);
            const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

            // Check if key already exists
            const existingKey = await IdempotencyKey.findOne({
                key,
                userId
            });

            // If key exists and is successful, return cached response
            if (existingKey && existingKey.status === 'SUCCESS') {
                return {
                    isRetry: true,
                    status: existingKey.responseStatus,
                    data: existingKey.responseData,
                    message: 'Response from cache (idempotent replay)'
                };
            }

            // If key exists and is still pending, throw error
            if (existingKey && existingKey.status === 'PENDING') {
                throw new AppError(
                    'Request is still being processed. Please wait.',
                    409,
                    { code: 'REQUEST_IN_PROGRESS' }
                );
            }

            // If key exists and failed, allow retry with new attempt
            if (existingKey && existingKey.status === 'FAILED') {
                // Delete the failed entry to allow retry
                await IdempotencyKey.deleteOne({ _id: existingKey._id });
            }

            // Create new idempotency key entry with PENDING status
            const keyEntry = await IdempotencyKey.create({
                key,
                userId,
                method,
                endpoint,
                requestHash,
                status: 'PENDING',
                responseStatus: 202, // Accepted
                expiresAt
            });

            try {
                // Execute the handler
                const responseData = await handler();

                // Update key entry with success
                const updatedKey = await IdempotencyKey.findByIdAndUpdate(
                    keyEntry._id,
                    {
                        status: 'SUCCESS',
                        responseData,
                        responseStatus: 200
                    },
                    { new: true }
                );

                return {
                    isRetry: false,
                    status: 200,
                    data: responseData
                };
            } catch (error: any) {
                // Update key entry with failure
                await IdempotencyKey.findByIdAndUpdate(
                    keyEntry._id,
                    {
                        status: 'FAILED',
                        error: error.message || 'Unknown error',
                        responseStatus: error.statusCode || 500
                    }
                );

                throw error;
            }
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Idempotency check failed', 500, { cause: error });
        }
    }

    /**
     * Verify that a request matches a stored idempotency key
     */
    static async verify(key: string, userId: string, requestHash: string) {
        try {
            const storedKey = await IdempotencyKey.findOne({
                key,
                userId
            });

            if (!storedKey) {
                throw new AppError('Idempotency key not found', 404);
            }

            if (storedKey.requestHash !== requestHash) {
                throw new AppError(
                    'Request body does not match original request',
                    422,
                    { code: 'IDEMPOTENCY_KEY_MISMATCH' }
                );
            }

            return storedKey;
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Idempotency verification failed', 500, { cause: error });
        }
    }

    /**
     * Clean up expired idempotency keys (can be run as scheduled job)
     */
    static async cleanupExpiredKeys() {
        try {
            const result = await IdempotencyKey.deleteMany({
                expiresAt: { $lte: new Date() }
            });

            return {
                deletedCount: result.deletedCount,
                message: `Deleted ${result.deletedCount} expired idempotency keys`
            };
        } catch (error: any) {
            throw new AppError('Failed to cleanup expired keys', 500, { cause: error });
        }
    }

    /**
     * Get idempotency key stats for debugging
     */
    static async getStats() {
        try {
            const total = await IdempotencyKey.countDocuments();
            const pending = await IdempotencyKey.countDocuments({ status: 'PENDING' });
            const successful = await IdempotencyKey.countDocuments({ status: 'SUCCESS' });
            const failed = await IdempotencyKey.countDocuments({ status: 'FAILED' });

            return {
                total,
                pending,
                successful,
                failed,
                successRate: ((successful / total) * 100).toFixed(2) + '%'
            };
        } catch (error: any) {
            throw new AppError('Failed to get idempotency stats', 500, { cause: error });
        }
    }
}
