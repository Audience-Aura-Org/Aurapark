import SeatLock from '../models/SeatLock';
import Trip from '../models/Trip';
import { AppError } from './errors';

export class SeatLockService {
    /**
     * Acquire a lock on specific seats for a trip
     * This prevents other users from booking the same seats simultaneously
     */
    static async acquireLock(
        tripId: string,
        userId: string,
        seatNumbers: string[],
        holdDurationMinutes: number = 15
    ) {
        try {
            // Check if seats are available
            const trip = await Trip.findById(tripId);
            if (!trip) {
                throw new AppError('Trip not found', 404);
            }

            // Check if seats exist in availableSeats
            const unavailableSeats = seatNumbers.filter(
                (seat) => !trip.availableSeats.includes(seat)
            );

            if (unavailableSeats.length > 0) {
                throw new AppError(
                    `Seats not available: ${unavailableSeats.join(', ')}`,
                    409
                );
            }

            // Check for existing active locks on these seats
            const existingLocks = await SeatLock.findOne({
                tripId,
                seatNumbers: { $in: seatNumbers },
                status: { $in: ['HELD', 'CONFIRMED'] },
                expiresAt: { $gt: new Date() }
            });

            if (existingLocks) {
                throw new AppError(
                    'Some seats are already reserved by another user',
                    409
                );
            }

            // Create lock
            const expiresAt = new Date(
                Date.now() + holdDurationMinutes * 60 * 1000
            );

            const lock = await SeatLock.create({
                tripId,
                userId,
                seatNumbers,
                status: 'HELD',
                expiresAt
            });

            return {
                lockId: lock._id,
                seatNumbers: lock.seatNumbers,
                expiresAt: lock.expiresAt
            };
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to acquire seat lock', 500, { cause: error });
        }
    }

    /**
     * Confirm a lock (upgrade from HELD to CONFIRMED)
     * Called after successful payment
     */
    static async confirmLock(lockId: string, bookingId: string) {
        try {
            const lock = await SeatLock.findByIdAndUpdate(
                lockId,
                {
                    status: 'CONFIRMED',
                    bookingId
                },
                { new: true }
            );

            if (!lock) {
                throw new AppError('Seat lock not found', 404);
            }

            if (lock.status === 'RELEASED') {
                throw new AppError('Seat lock has been released', 409);
            }

            return lock;
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to confirm seat lock', 500, { cause: error });
        }
    }

    /**
     * Release a lock (when payment fails or booking is cancelled)
     */
    static async releaseLock(lockId: string) {
        try {
            const lock = await SeatLock.findByIdAndUpdate(
                lockId,
                {
                    status: 'RELEASED',
                    expiresAt: new Date() // Expire immediately
                },
                { new: true }
            );

            if (!lock) {
                throw new AppError('Seat lock not found', 404);
            }

            return lock;
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to release seat lock', 500, { cause: error });
        }
    }

    /**
     * Get all active locks for a trip
     */
    static async getActiveLocks(tripId: string) {
        try {
            const locks = await SeatLock.find({
                tripId,
                status: { $in: ['HELD', 'CONFIRMED'] },
                expiresAt: { $gt: new Date() }
            });

            return locks;
        } catch (error: any) {
            throw new AppError('Failed to get active locks', 500, { cause: error });
        }
    }

    /**
     * Get locked seat numbers for a trip
     */
    static async getLockedSeats(tripId: string) {
        try {
            const locks = await this.getActiveLocks(tripId);
            const lockedSeats = locks.flatMap((lock) => lock.seatNumbers);
            return [...new Set(lockedSeats)];
        } catch (error: any) {
            throw new AppError('Failed to get locked seats', 500, { cause: error });
        }
    }

    /**
     * Check if specific seats are available (not locked)
     */
    static async areSeatsAvailable(tripId: string, seatNumbers: string[]) {
        try {
            const lockedSeats = await this.getLockedSeats(tripId);
            const unavailable = seatNumbers.filter((seat) =>
                lockedSeats.includes(seat)
            );

            return {
                available: unavailable.length === 0,
                unavailableSeats: unavailable
            };
        } catch (error: any) {
            throw new AppError('Failed to check seat availability', 500, { cause: error });
        }
    }

    /**
     * Find expired locks for cleanup (run as scheduled job)
     */
    static async findExpiredLocks() {
        try {
            const expiredLocks = await SeatLock.find({
                status: { $in: ['HELD', 'CONFIRMED'] },
                expiresAt: { $lte: new Date() }
            });

            return expiredLocks;
        } catch (error: any) {
            throw new AppError('Failed to find expired locks', 500, { cause: error });
        }
    }

    /**
     * Release all expired locks (cleanup job)
     */
    static async releaseExpiredLocks() {
        try {
            const result = await SeatLock.updateMany(
                {
                    status: { $in: ['HELD', 'CONFIRMED'] },
                    expiresAt: { $lte: new Date() }
                },
                {
                    status: 'RELEASED'
                }
            );

            return {
                modifiedCount: result.modifiedCount,
                message: `Released ${result.modifiedCount} expired seat locks`
            };
        } catch (error: any) {
            throw new AppError('Failed to release expired locks', 500, { cause: error });
        }
    }

    /**
     * Get seats reserved by a user on a trip
     */
    static async getUserReservedSeats(tripId: string, userId: string) {
        try {
            const locks = await SeatLock.find({
                tripId,
                userId,
                status: { $in: ['HELD', 'CONFIRMED'] },
                expiresAt: { $gt: new Date() }
            });

            const seatNumbers = locks.flatMap((lock) => lock.seatNumbers);
            return [...new Set(seatNumbers)];
        } catch (error: any) {
            throw new AppError('Failed to get user reserved seats', 500, { cause: error });
        }
    }

    /**
     * Cancel all locks for a user (when user logs out or session expires)
     */
    static async cancelUserLocks(userId: string) {
        try {
            const result = await SeatLock.updateMany(
                {
                    userId,
                    status: { $in: ['HELD', 'CONFIRMED'] }
                },
                {
                    status: 'RELEASED',
                    expiresAt: new Date()
                }
            );

            return {
                modifiedCount: result.modifiedCount,
                message: `Cancelled ${result.modifiedCount} seat locks for user`
            };
        } catch (error: any) {
            throw new AppError('Failed to cancel user locks', 500, { cause: error });
        }
    }
}
