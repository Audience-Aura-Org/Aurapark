import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Shipment from '@/lib/models/Shipment';
import Booking from '@/lib/models/Booking';
import Trip from '@/lib/models/Trip';
import Agency from '@/lib/models/Agency';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Tracking ID or PNR required' }, { status: 400 });
        }

        await dbConnect();

        const searchId = id.trim().toUpperCase();

        // 1. Try tracking as a Shipment
        if (searchId.startsWith('SHP-') || searchId.length >= 8) {
            const shipment = await Shipment.findOne({ trackingNumber: searchId })
                .populate('agencyId', 'name')
                .populate('tripId')
                .lean();

            if (shipment) {
                return NextResponse.json({
                    type: 'SHIPMENT',
                    data: shipment
                });
            }
        }

        // 2. Try tracking as a PNR (Booking)
        const booking = await Booking.findOne({ pnr: searchId })
            .populate({
                path: 'tripId',
                populate: [
                    { path: 'routeId', select: 'routeName' },
                    { path: 'busId', select: 'busNumber' }
                ]
            })
            .populate('agencyId', 'name')
            .lean();

        if (booking) {
            // For PNR tracking, we return trip status and basic info
            return NextResponse.json({
                type: 'BOOKING',
                data: {
                    pnr: booking.pnr,
                    status: booking.status,
                    trip: booking.tripId,
                    agencyName: booking.agencyId?.name,
                    passengerCount: booking.passengers?.length || 0
                }
            });
        }

        return NextResponse.json({ error: 'No record found with this identifier' }, { status: 404 });

    } catch (error: any) {
        console.error('Tracking API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
