import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Trip from '@/lib/models/Trip';
import { SeatLockService } from '@/lib/services/SeatLockService';
import { ReserveSeatsSchema } from '@/lib/services/validationSchemas';
import { validateBody, errorResponse, successResponse } from '@/lib/services/validationMiddleware';
import { AppError } from '@/lib/services/errors';
import { AuditService } from '@/lib/services/AuditService';

/**
 * POST /api/bookings/reserve
 * Reserve seats on a trip (creates a temporary hold)
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Get user from auth
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return errorResponse(new AppError('User not authenticated', 401), 401);
        }

        // Validate request body
        const validation = await validateBody(request, ReserveSeatsSchema);
        if (!validation.valid) {
            return errorResponse(validation.error, 400);
        }

        const { tripId, seatNumbers, holdDurationMinutes } = validation.data;

        // Check if trip exists
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return errorResponse(new AppError('Trip not found', 404), 404);
        }

        // Acquire seat lock
        const lockResult = await SeatLockService.acquireLock(
            tripId,
            userId,
            seatNumbers,
            holdDurationMinutes
        );

        // Audit log
        await AuditService.log({
            userId,
            action: 'SEAT_RESERVED',
            resource: 'SeatLock',
            resourceId: lockResult.lockId.toString(),
            details: {
                tripId,
                seatNumbers,
                expiresAt: lockResult.expiresAt
            }
        });

        return successResponse(
            {
                lockId: lockResult.lockId,
                tripId,
                seatNumbers,
                status: 'HELD',
                expiresAt: lockResult.expiresAt,
                holdDurationMinutes,
                message: `Seats held for ${holdDurationMinutes} minutes`
            },
            201
        );
    } catch (error: any) {
        console.error('Seat reservation error:', error);
        if (error instanceof AppError) {
            return errorResponse(error, error.statusCode);
        }
        return errorResponse(new AppError('Seat reservation failed', 500), 500);
    }
}

/**
 * GET /api/bookings/reserve?tripId=xxx
 * Check available seats on a trip
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const tripId = searchParams.get('tripId');

        if (!tripId) {
            return errorResponse(new AppError('Trip ID required', 400), 400);
        }

        // Get trip
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return errorResponse(new AppError('Trip not found', 404), 404);
        }

        // Get locked seats
        const lockedSeats = await SeatLockService.getLockedSeats(tripId);

        // Calculate available seats
        const availableSeats = trip.availableSeats.filter((seat: number) => !lockedSeats.includes(seat));

        return successResponse({
            tripId,
            totalSeats: trip.availableSeats.length,
            availableSeatsCount: availableSeats.length,
            lockedSeatsCount: lockedSeats.length,
            availableSeats,
            lockedSeats
        });
    } catch (error: any) {
        console.error('Get available seats error:', error);
        if (error instanceof AppError) {
            return errorResponse(error, error.statusCode);
        }
        return errorResponse(new AppError('Failed to get available seats', 500), 500);
    }
}
