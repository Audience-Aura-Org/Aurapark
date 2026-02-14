import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';
import Trip from '@/lib/models/Trip';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
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

        const body = await req.json();
        const { tripId, seatNumber, passengerName, passengerPhone, reason } = body;

        if (!tripId || !seatNumber || !passengerName || !passengerPhone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Get the trip
        const trip = await Trip.findById(tripId).populate('busId');
        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Verify agency owns this trip
        if (trip.agencyId.toString() !== decoded.agencyId) {
            return NextResponse.json({ error: 'Unauthorized - Not your trip' }, { status: 403 });
        }

        // Check if seat is available
        if (!trip.availableSeats.includes(seatNumber)) {
            return NextResponse.json({ error: 'Seat not available' }, { status: 400 });
        }

        // Create or get user (for walk-in customers, create a basic user)
        let user = await User.findOne({ phone: passengerPhone });
        if (!user) {
            user = await User.create({
                name: passengerName,
                phone: passengerPhone,
                email: `${passengerPhone}@walkin.local`,
                role: 'USER',
                password: 'N/A' // Walk-in users don't have passwords
            });
        }

        // Generate PNR
        const pnr = `AG${Date.now().toString().slice(-8)}`;

        // Create booking
        const booking = await Booking.create({
            userId: user._id,
            tripId: trip._id,
            agencyId: trip.agencyId,
            pnr,
            passengers: [{
                name: passengerName,
                seatNumber,
                checkedIn: false
            }],
            contactPhone: passengerPhone,
            contactEmail: user.email,
            totalAmount: trip.basePrice,
            platformFee: trip.basePrice * 0.1,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paymentMethod: 'CASH',
            bookingType: 'MANUAL',
            notes: reason || 'Walk-in booking'
        });

        // Remove seat from available seats
        trip.availableSeats = trip.availableSeats.filter((seat: string) => seat !== seatNumber);
        await trip.save();

        return NextResponse.json({
            success: true,
            message: 'Manual booking created successfully',
            booking,
            pnr
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating manual booking:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
