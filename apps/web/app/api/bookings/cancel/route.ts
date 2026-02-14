import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';
import Trip from '@/lib/models/Trip';
import Payment from '@/lib/models/Payment';
import { BookingStatus, PaymentStatus, NotificationType } from '@/lib/types';
import { NotificationService } from '@/lib/services/NotificationService';

// POST /api/bookings/cancel - Cancel booking and restore seat availability
export async function POST(req: Request) {
    try {
        const { bookingId, reason } = await req.json();

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
        }

        await dbConnect();

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.status === BookingStatus.CANCELLED) {
            return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 });
        }

        // 1. Restore seat availability in Trip
        const seatNumbers = booking.passengers.map((p: any) => p.seatNumber);
        await Trip.findByIdAndUpdate(booking.tripId, {
            $addToSet: { availableSeats: { $each: seatNumbers } }
        });

        // 2. Update Booking Status
        booking.status = BookingStatus.CANCELLED;
        await booking.save();

        // 3. Update Payment Status (Initiate Refund)
        const payment = await Payment.findOne({ bookingId });
        if (payment) {
            payment.status = PaymentStatus.REFUND_INITIATED;
            await payment.save();
        }

        // 4. Trigger Notification (Async)
        NotificationService.sendWhatsApp({
            recipient: booking.contactPhone,
            type: NotificationType.CANCELLATION_NOTICE,
            message: NotificationService.getCancellationTemplate(booking.pnr),
            bookingId: booking._id,
            tripId: booking.tripId
        }).catch(err => console.error('Cancellation notification failed', err));

        return NextResponse.json({
            message: 'Booking cancelled and refund initiated',
            bookingStatus: booking.status,
            paymentStatus: payment ? payment.status : 'N/A'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error cancelling booking:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
