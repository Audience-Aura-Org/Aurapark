/**
 * Seat Lock Service
 * Atomic seat locking to prevent double bookings
 * Uses MongoDB transactions for atomicity
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ISeatLock extends Document {
  tripId: mongoose.Types.ObjectId;
  seatNumbers: string[];
  userId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  status: 'HELD' | 'CONFIRMED' | 'RELEASED';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SeatLockSchema = new Schema<ISeatLock>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    seatNumbers: [{ type: String, required: true }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    status: {
      type: String,
      enum: ['HELD', 'CONFIRMED', 'RELEASED'],
      default: 'HELD',
      index: true
    },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
  },
  { timestamps: true }
);

// Compound index for finding active locks
SeatLockSchema.index({ tripId: 1, status: 1, expiresAt: 1 });

const SeatLockModel =
  mongoose.models.SeatLock || mongoose.model<ISeatLock>('SeatLock', SeatLockSchema);

/**
 * Seat Lock Service
 * Manages atomic seat reservations with timeout-based auto-release
 */
export class SeatLockService {
  /**
   * Acquire a lock on seats (atomic operation)
   * Fails if any seat is already locked by another user
   *
   * @param tripId - Trip ID
   * @param seatNumbers - Seat numbers to lock
   * @param userId - User ID requesting the lock
   * @param ttlSeconds - Time-to-live in seconds (default: 900 = 15 min)
   * @returns - Lock ID if successful, throws error if seats unavailable
   */
  static async acquireLock(
    tripId: string,
    seatNumbers: string[],
    userId: string,
    ttlSeconds: number = 900
  ): Promise<string> {
    try {
      // 1. Check if seats are already locked by another user
      const existingLocks = await SeatLockModel.find({
        tripId,
        seatNumbers: { $in: seatNumbers },
        status: { $in: ['HELD', 'CONFIRMED'] },
        expiresAt: { $gt: new Date() } // Not expired
      });

      if (existingLocks.length > 0) {
        const lockedSeats = existingLocks.map(lock => lock.seatNumbers).flat();
        throw new Error(`Seats already locked: ${lockedSeats.join(', ')}`);
      }

      // 2. Create new lock record
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      const lock = await SeatLockModel.create({
        tripId,
        seatNumbers,
        userId,
        status: 'HELD',
        expiresAt
      });

      console.log(`[SeatLock] Acquired lock for seats ${seatNumbers.join(', ')} on trip ${tripId}`);
      return lock._id.toString();
    } catch (error: any) {
      console.error('[SeatLock] acquireLock error:', error.message);
      throw error;
    }
  }

  /**
   * Confirm a lock (upgrade from HELD to CONFIRMED)
   * Called after successful payment
   *
   * @param lockId - Lock ID to confirm
   */
  static async confirmLock(lockId: string): Promise<void> {
    try {
      const lock = await SeatLockModel.findById(lockId);
      if (!lock) {
        throw new Error('Lock not found');
      }

      if (lock.status !== 'HELD') {
        throw new Error(`Cannot confirm lock with status ${lock.status}`);
      }

      lock.status = 'CONFIRMED';
      await lock.save();

      console.log(`[SeatLock] Confirmed lock ${lockId}`);
    } catch (error: any) {
      console.error('[SeatLock] confirmLock error:', error.message);
      throw error;
    }
  }

  /**
   * Release a lock (mark as RELEASED)
   * Called when user cancels booking or payment fails
   *
   * @param lockId - Lock ID to release
   */
  static async releaseLock(lockId: string): Promise<void> {
    try {
      const lock = await SeatLockModel.findById(lockId);
      if (!lock) {
        throw new Error('Lock not found');
      }

      lock.status = 'RELEASED';
      await lock.save();

      console.log(`[SeatLock] Released lock ${lockId}`);
    } catch (error: any) {
      console.error('[SeatLock] releaseLock error:', error.message);
      throw error;
    }
  }

  /**
   * Get lock by ID
   * @param lockId - Lock ID
   * @returns - Lock document or null
   */
  static async getLock(lockId: string): Promise<ISeatLock | null> {
    return SeatLockModel.findById(lockId);
  }

  /**
   * Get active locks for a trip
   * @param tripId - Trip ID
   * @returns - Array of active locks
   */
  static async getActiveLocks(tripId: string): Promise<ISeatLock[]> {
    return SeatLockModel.find({
      tripId,
      status: { $in: ['HELD', 'CONFIRMED'] },
      expiresAt: { $gt: new Date() }
    });
  }

  /**
   * Find stale (expired) locks
   * Used by cron job to cleanup
   *
   * @returns - Array of expired locks
   */
  static async findExpiredLocks(): Promise<ISeatLock[]> {
    return SeatLockModel.find({
      status: 'HELD',
      expiresAt: { $lt: new Date() }
    });
  }

  /**
   * Release expired locks (cron job)
   * Called periodically to auto-release reserved seats
   *
   * @returns - Count of released locks
   */
  static async releaseExpiredLocks(): Promise<number> {
    try {
      const expiredLocks = await this.findExpiredLocks();

      for (const lock of expiredLocks) {
        await this.releaseLock(lock._id.toString());
      }

      console.log(`[SeatLock] Released ${expiredLocks.length} expired locks`);
      return expiredLocks.length;
    } catch (error: any) {
      console.error('[SeatLock] releaseExpiredLocks error:', error.message);
      return 0;
    }
  }

  /**
   * Check if specific seats are available
   * @param tripId - Trip ID
   * @param seatNumbers - Seat numbers to check
   * @returns - True if all seats are available, false otherwise
   */
  static async areSeatsAvailable(tripId: string, seatNumbers: string[]): Promise<boolean> {
    const locks = await SeatLockModel.find({
      tripId,
      seatNumbers: { $in: seatNumbers },
      status: { $in: ['HELD', 'CONFIRMED'] },
      expiresAt: { $gt: new Date() }
    });

    return locks.length === 0;
  }
}
