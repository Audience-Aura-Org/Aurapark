import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Route from '@/lib/models/Route';
import Stop from '@/lib/models/Stop';

// GET /api/routes - List all routes (with optional agency filter)
export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const agencyId = searchParams.get('agencyId');

        const filter: any = {};
        if (agencyId) {
            filter.agencyId = agencyId;
        }

        const routes = await Route.find(filter)
            .populate('stops', 'name description')
            .sort({ routeName: 1 });

        return NextResponse.json({ routes }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching routes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/routes - Create new route
export async function POST(req: Request) {
    try {
        const { routeName, agencyId, origin, destination, stops, defaultPrice, departureTimes, distance, duration } = await req.json();

        if (!routeName || !agencyId || !origin || !destination) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Helper to resolve stop name to ID
        const resolveStop = async (name: string) => {
            const stopName = name.trim();
            if (!stopName) return null;
            let stop = await Stop.findOne({
                name: { $regex: new RegExp(`^${stopName}$`, 'i') },
                agencyId
            });
            if (!stop) {
                stop = await Stop.create({ name: stopName, agencyId });
            }
            return stop._id;
        };

        const originStopId = await resolveStop(origin);
        const destinationStopId = await resolveStop(destination);

        // Process interim stops
        let stopIds: any[] = [];
        if (stops && Array.isArray(stops)) {
            stopIds = await Promise.all(stops.map(resolveStop));
            stopIds = stopIds.filter(id => id);
        }

        const newRoute = await Route.create({
            routeName,
            agencyId,
            originStopId,
            destinationStopId,
            stops: stopIds,
            defaultPrice,
            departureTimes,
            distance,
            duration
        });

        return NextResponse.json({
            message: 'Route created successfully',
            route: newRoute
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating route:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
