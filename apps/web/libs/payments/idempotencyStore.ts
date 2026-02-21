import { z } from 'zod';

/**
 * Idempotency Key Store
 * Prevents double-charges by caching request responses
 * Stores in MongoDB with TTL (24 hours)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IIdempotencyKey extends Document {
  key: string;
  userId: mongoose.Types.ObjectId;
  method: string;
  route: string;
  request: any;
  response: any;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: Date;
  expiresAt: Date;
}

const IdempotencySchema = new Schema<IIdempotencyKey>(
  {
    key: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    method: { type: String, required: true },
    route: { type: String, required: true },
    request: { type: Schema.Types.Mixed },
    response: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING'
    },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 86400000), index: { expireAfterSeconds: 0 } }
  },
  { timestamps: true }
);

const IdempotencyKeyModel =
  mongoose.models.IdempotencyKey ||
  mongoose.model<IIdempotencyKey>('IdempotencyKey', IdempotencySchema);

/**
 * Idempotency Service
 * Ensures payment requests are idempotent (safe to retry)
 */
export class IdempotencyService {
  /**
   * Get cached response or execute handler and cache result
   * @param key - Unique idempotency key (UUID)
   * @param userId - User ID making request
   * @param method - HTTP method (POST, PUT, etc.)
   * @param route - API route path
   * @param request - Request body
   * @param handler - Async function to execute if no cache hit
   * @returns - Cached or newly computed response
   */
  static async getOrCreate(
    key: string,
    userId: string,
    method: string,
    route: string,
    request: any,
    handler: () => Promise<any>
  ): Promise<any> {
    try {
      // 1. Check if idempotency key already exists
      const existing = await IdempotencyKeyModel.findOne({ key });

      if (existing) {
        if (existing.status === 'PENDING') {
          // Still processing - return error to avoid waiting
          throw new Error('Request already in progress. Please wait.');
        }

        if (existing.status === 'SUCCESS') {
          // Return cached successful response
          console.log(`[Idempotency] Cache HIT for key: ${key}`);
          return existing.response;
        }

        if (existing.status === 'FAILED') {
          // Return previous error response
          throw new Error(existing.response?.error || 'Previous request failed');
        }
      }

      // 2. Create PENDING record
      let idempotencyRecord = await IdempotencyKeyModel.create({
        key,
        userId,
        method,
        route,
        request,
        status: 'PENDING'
      });

      // 3. Execute handler
      let response;
      try {
        response = await handler();
        idempotencyRecord.status = 'SUCCESS';
        idempotencyRecord.response = response;
      } catch (error: any) {
        idempotencyRecord.status = 'FAILED';
        idempotencyRecord.response = {
          error: error.message || 'Request failed',
          code: error.code || 'UNKNOWN_ERROR'
        };
        throw error;
      } finally {
        // 4. Update record with final status
        await idempotencyRecord.save();
      }

      console.log(`[Idempotency] Cache MISS, executed handler for key: ${key}`);
      return response;
    } catch (error) {
      console.error(`[Idempotency] Error in getOrCreate for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Extract idempotency key from request headers
   * @param req - Next.js Request object
   * @returns - Idempotency key or null
   */
  static extractKey(req: Request): string | null {
    return req.headers.get('idempotency-key') || null;
  }

  /**
   * Clean up old idempotency records (manual cleanup)
   * Called by cron job or admin command
   */
  static async cleanup(daysOld: number = 1): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const result = await IdempotencyKeyModel.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    return result.deletedCount || 0;
  }
}
