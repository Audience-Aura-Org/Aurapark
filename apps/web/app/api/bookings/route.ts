import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';
import Trip from '@/lib/models/Trip';
import Route from '@/lib/models/Route';
import Bus from '@/lib/models/Bus';
import Agency from '@/lib/models/Agency';
import User from '@/lib/models/User';
import Dispute from '@/lib/models/Dispute';
import Stop from '@/lib/models/Stop';
import SeatReservation from '@/lib/models/SeatReservation';
import { ReservationStatus, PaymentStatus, BookingStatus, NotificationType, UserRole } from '@/lib/types';
import { NotificationService } from '@/lib/services/NotificationService';
import { AuditService } from '@/lib/services/AuditService';
import Notification from '@/lib/models/Notification';
import Payment from '@/lib/models/Payment';
import crypto from 'crypto';

// GET /api/bookings - List bookings (filtered by user or agency)
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const agencyId = searchParams.get('agencyId');
        const status = searchParams.get('status');
        const pnr = searchParams.get('pnr');
        const phone = searchParams.get('phone');
        const date = searchParams.get('date');

        const filter: any = {};
        if (userId && userId !== 'undefined') {
            if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
                return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
            }
            filter.userId = userId;
        }
        if (agencyId && agencyId !== 'undefined') {
            if (!/^[0-9a-fA-F]{24}$/.test(agencyId)) {
                return NextResponse.json({ error: 'Invalid Agency ID format' }, { status: 400 });
            }
            filter.agencyId = agencyId;
        }
        if (status) filter.status = status;
        if (pnr) filter.pnr = { $regex: new RegExp(pnr, 'i') };
        if (phone) filter.contactPhone = { $regex: new RegExp(phone, 'i') };

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const bookings = await Booking.find(filter)
            .populate({
                path: 'tripId',
                populate: [
                    { path: 'routeId', select: 'routeName' },
                    { path: 'busId', select: 'busNumber' },
                    { path: 'agencyId', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 });

        return NextResponse.json({ bookings }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/bookings - Confirm a booking from a reservation
export async function POST(req: Request) {
    try {
        const { reservationId, userId, passengers, contactEmail, contactPhone, totalAmount } = await req.json();

        if (!reservationId || !passengers || !contactEmail || !contactPhone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // 1. Validate reservation
        const reservation = await SeatReservation.findById(reservationId);
        if (!reservation || reservation.status !== ReservationStatus.PENDING) {
            return NextResponse.json({ error: 'Reservation expired or invalid' }, { status: 410 });
        }

        // 2. Fetch Trip to get agencyId
        const trip = await Trip.findById(reservation.tripId);
        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // 3. Find or Create Shadow User (for guests or email matching)
        let finalUserId = userId;

        if (!finalUserId) {
            // Check if user exists by email
            let existingUser = await User.findOne({ email: contactEmail.toLowerCase() });

            if (!existingUser) {
                // Create a "Shadow Account" for the guest
                existingUser = await User.create({
                    name: passengers[0]?.name || 'Guest Passenger',
                    email: contactEmail.toLowerCase(),
                    phone: contactPhone,
                    role: UserRole.USER,
                    // Note: No passwordHash means they must "reset password" or "complete registration" to log in later
                });
            }
            finalUserId = existingUser._id;
        }

        // 4. Create Booking
        const pnr = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 char PNR

        const bookingPassengers = passengers.map((p: any) => ({
            ...p,
            ticketNumber: `${pnr}-${p.seatNumber}`
        }));

        const newBooking = await Booking.create({
            pnr,
            tripId: reservation.tripId,
            agencyId: trip.agencyId,
            userId: finalUserId,
            passengers: bookingPassengers,
            totalAmount,
            contactEmail: contactEmail.toLowerCase(),
            contactPhone,
            paymentStatus: PaymentStatus.PENDING, // Allow Pay on Site
            status: BookingStatus.CONFIRMED
        });

        // 5. Create PENDING Payment Record
        const platformFee = totalAmount * 0.10; // 10% Platform Fee
        const agencyAmount = totalAmount - platformFee;

        await Payment.create({
            bookingId: newBooking._id,
            tripId: reservation.tripId,
            agencyId: trip.agencyId,
            userId: finalUserId,
            amount: totalAmount,
            platformFee,
            agencyAmount,
            currency: 'XAF',
            paymentMethod: 'CASH_ON_BOARD', // Default for now
            status: PaymentStatus.PENDING,
            transactionId: `TXN-${pnr}-${Date.now().toString().slice(-4)}`
        });

        // 3. Update Trip available seats
        await Trip.findByIdAndUpdate(reservation.tripId, {
            $pull: { availableSeats: { $in: reservation.seatNumbers } }
        });

        // 4. Update Reservation status
        reservation.status = ReservationStatus.CONFIRMED;
        await reservation.save();

        // 5. Audit Logging
        await AuditService.log({
            userId,
            action: 'BOOKING_CONFIRMED',
            resource: 'Booking',
            resourceId: newBooking._id.toString(),
            details: { pnr, seatNumbers: reservation.seatNumbers },
            req
        });

        // 6. Trigger Notification (Async)
        NotificationService.sendWhatsApp({
            recipient: contactPhone,
            type: NotificationType.BOOKING_CONFIRMATION,
            message: NotificationService.getBookingConfirmationTemplate(pnr, reservation.seatNumbers),
            bookingId: newBooking._id,
            tripId: reservation.tripId
        }).catch(err => console.error('Delayed notification failed', err));

        return NextResponse.json({
            message: 'Booking confirmed',
            booking: newBooking
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
