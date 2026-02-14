import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongo';
import Bus from '@/lib/models/Bus';
import Trip, { TripStatus } from '@/lib/models/Trip';
import Route from '@/lib/models/Route';

// GET /api/buses - List all buses (with optional agency filter)
export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const agencyId = searchParams.get('agencyId');

        const filter: any = {};
        if (agencyId) {
            if (!mongoose.Types.ObjectId.isValid(agencyId)) {
                return NextResponse.json({ error: 'Invalid Agency ID format' }, { status: 400 });
            }
            filter.agencyId = new mongoose.Types.ObjectId(agencyId);
        }

        const buses = await Bus.find(filter).sort({ busNumber: 1 }).lean();

        // Enrich with nextTrip info - this allows the UI to show deployment status
        const enrichedBuses = await Promise.all(buses.map(async (bus) => {
            const nextTrip = await Trip.findOne({
                busId: bus._id,
                status: { $in: [TripStatus.SCHEDULED, TripStatus.EN_ROUTE] },
                departureTime: { $gte: new Date(Date.now() - 1000 * 60 * 60) } // Include trips from last hour in case of slight delay
            })
                .sort({ departureTime: 1 })
                .populate('routeId', 'routeName')
                .lean();

            return {
                ...bus,
                nextTrip: nextTrip || null
            };
        }));

        return NextResponse.json({ buses: enrichedBuses }, { status: 200 });
    } catch (error: any) {
        console.error('[GET /api/buses] Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// POST /api/buses - Create new bus
export async function POST(req: Request) {
    try {
        const { busNumber, agencyId, capacity, seatMap, amenities, busModel } = await req.json();

        if (!busNumber || !agencyId || !capacity || !seatMap) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const newBus = await Bus.create({
            busNumber,
            agencyId,
            capacity,
            seatMap,
            amenities: amenities || [],
            busModel
        });

        return NextResponse.json({
            message: 'Bus created successfully',
            bus: newBus
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating bus:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
