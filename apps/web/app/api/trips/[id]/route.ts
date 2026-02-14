import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Trip from '@/lib/models/Trip';
import Booking from '@/lib/models/Booking';
import Route from '@/lib/models/Route';
import Bus from '@/lib/models/Bus';
import User from '@/lib/models/User';
import Stop from '@/lib/models/Stop';
import Agency from '@/lib/models/Agency';
import mongoose from 'mongoose';
import SeatReservation from '@/lib/models/SeatReservation';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: tripId } = await params;
        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return NextResponse.json({ error: 'Invalid Trip ID format' }, { status: 400 });
        }
        await dbConnect();

        const trip = await Trip.findById(tripId)
            .populate({
                path: 'routeId',
                populate: {
                    path: 'stops',
                    select: 'name'
                }
            })
            .populate({
                path: 'stops.stopId',
                select: 'name'
            })
            .populate('busId', 'busNumber registrationNumber busModel type capacity amenities seatMap')
            .populate('driverId', 'name phone');

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // 2. Fetch active PENDING reservations to show seats as "Taken"
        const activeReservations = await SeatReservation.find({
            tripId: tripId,
            status: 'PENDING',
            expiresAt: { $gt: new Date() }
        });

        const reservedSeats = activeReservations.flatMap((r: any) => r.seatNumbers);

        // Use a plain object to avoid Mangoose document issues when modifying
        const tripObj = trip.toObject();

        // Mark reserved seats as unavailable for the UI
        tripObj.availableSeats = tripObj.availableSeats.filter(
            (s: string) => !reservedSeats.includes(s)
        );

        return NextResponse.json({ trip: tripObj }, { status: 200 });
    } catch (error: any) {
        console.error('SERVER_ERROR_TRIP_DETAILS:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const updates = await req.json();
        await dbConnect();

        // 1. Fetch current trip state
        const trip = await Trip.findById(id);
        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // 2. Handle Schedule Updates (Shift Stops)
        if (updates.departureTime) {
            const newDeparture = new Date(updates.departureTime);
            const oldDeparture = new Date(trip.departureTime);
            const timeDiff = newDeparture.getTime() - oldDeparture.getTime();

            // Only shift if there is a difference and we have stops
            if (timeDiff !== 0 && trip.stops && trip.stops.length > 0) {
                // Determine if arrival time is also manually updated. 
                // If not, we should probably shift it too? 
                // Usually "DELAY" implies shifting everything. 
                // "RESCHEDULE" might mean everything shifts.
                // If the user provided both dep and arr, we assume they calculated duration.
                // Ideally, we shift stops relative to the start.

                // Update stops
                trip.stops.forEach((stop: any) => {
                    if (stop.arrivalTime) {
                        stop.arrivalTime = new Date(stop.arrivalTime.getTime() + timeDiff);
                    }
                    if (stop.departureTime) {
                        stop.departureTime = new Date(stop.departureTime.getTime() + timeDiff);
                    }
                });
            }
        }

        // 3. Apply updates
        Object.keys(updates).forEach(key => {
            // Special handling for dates to ensure types
            if (key === 'departureTime' || key === 'arrivalTime') {
                trip[key] = new Date(updates[key]);
            } else {
                trip[key] = updates[key];
            }
        });

        // 4. Validate & Save
        await trip.save();

        return NextResponse.json({ message: 'Trip updated successfully', trip }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating trip:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const force = searchParams.get('force') === 'true'; // Allow admin override via query param ?force=true

        await dbConnect();

        // Check for active bookings
        const bookingCount = await Booking.countDocuments({
            tripId: id,
            status: { $in: ['CONFIRMED', 'PENDING'] }
        });

        if (bookingCount > 0 && !force) {
            return NextResponse.json({
                error: 'Cannot delete trip with active bookings. Cancel the trip instead or use admin override.',
                bookingCount
            }, { status: 403 });
        }

        const trip = await Trip.findByIdAndDelete(id);

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Trip deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting trip:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
