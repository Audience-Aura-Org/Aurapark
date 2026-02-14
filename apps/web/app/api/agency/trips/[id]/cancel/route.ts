import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Trip from '@/lib/models/Trip';
import Booking from '@/lib/models/Booking';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Verify agency authentication
        const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'AGENCY_STAFF') {
            return NextResponse.json({ error: 'Forbidden - Agency access only' }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { reason, refundPolicy } = body;

        if (!reason) {
            return NextResponse.json({ error: 'Cancellation reason required' }, { status: 400 });
        }

        await dbConnect();

        // Get the trip
        const trip = await Trip.findById(id);
        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Verify agency owns this trip
        if (trip.agencyId.toString() !== decoded.agencyId) {
            return NextResponse.json({ error: 'Unauthorized - Not your trip' }, { status: 403 });
        }

        // Update trip status
        trip.status = 'CANCELLED';
        await trip.save();

        // Get all confirmed bookings
        const bookings = await Booking.find({ tripId: id, status: 'CONFIRMED' });

        // Process refunds
        const refundPercentage = refundPolicy === 'full' ? 1.0 : 0.5;
        let totalRefunded = 0;

        for (const booking of bookings) {
            booking.status = 'CANCELLED';
            booking.refundAmount = booking.totalAmount * refundPercentage;
            booking.refundStatus = 'PENDING';
            await booking.save();
            totalRefunded += booking.refundAmount;
        }

        // TODO: Send notifications to all passengers
        // TODO: Process actual refunds through payment gateway
        console.log(`Trip cancelled. ${bookings.length} passengers will be refunded $${totalRefunded}`);

        return NextResponse.json({
            success: true,
            message: `Trip cancelled successfully. ${bookings.length} bookings refunded.`,
            trip,
            affectedBookings: bookings.length,
            totalRefunded,
            refundPolicy,
            reason
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error cancelling trip:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
