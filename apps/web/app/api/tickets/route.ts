import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';

// GET /api/tickets - Get ticket info and QR code
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const pnr = searchParams.get('pnr');

        if (!pnr) {
            return NextResponse.json({ error: 'PNR required' }, { status: 400 });
        }

        await dbConnect();

        const booking = await Booking.findOne({ pnr }).populate('tripId');

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Generate QR codes for each passenger ticket
        const ticketDetails = await Promise.all(booking.passengers.map(async (p: any) => {
            const qrData = JSON.stringify({
                pnr: booking.pnr,
                ticketNumber: p.ticketNumber,
                seat: p.seatNumber
            });
            const qrCode = await QRCode.toDataURL(qrData);
            return {
                ...p,
                qrCode
            };
        }));

        return NextResponse.json({
            pnr: booking.pnr,
            trip: booking.tripId,
            passengers: ticketDetails,
            status: booking.status,
            paymentStatus: booking.paymentStatus
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error generating tickets:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
