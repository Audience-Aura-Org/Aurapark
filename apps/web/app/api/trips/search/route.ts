import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Trip from '@/lib/models/Trip';
import Route from '@/lib/models/Route';
import Stop from '@/lib/models/Stop';
import '@/lib/models/Bus';
import '@/lib/models/Agency';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const fromStopName = searchParams.get('from');
        const toStopName = searchParams.get('to');
        const dateStr = searchParams.get('date');
        const passengers = parseInt(searchParams.get('passengers') || '1');

        if (!fromStopName && !toStopName && !dateStr) {
            // "Explore" mode: Return upcoming trips
            // "Explore" mode: Return recently created trips (prioritizing user's new data)
            await dbConnect();
            const trips = await Trip.find({
                departureTime: { $gte: new Date() },
                status: 'SCHEDULED',
                routeId: { $ne: null },
                busId: { $ne: null },
                agencyId: { $ne: null }
            })
                .populate({
                    path: 'agencyId',
                    select: 'name status trustScore',
                    match: { status: 'ACTIVE' }
                })
                .populate({
                    path: 'routeId',
                    populate: {
                        path: 'stops',
                        select: 'name'
                    }
                })
                .populate('busId', 'busNumber busModel type amenities')
                .sort({ createdAt: -1 })
                .limit(20);

            // Filter out trips where critical data is missing (or agency is not active/is mock)
            const filteredTrips = trips.filter(t =>
                t.agencyId &&
                t.routeId &&
                t.busId &&
                t.agencyId.name !== 'Ocean Lines'
            );

            return NextResponse.json({ trips: filteredTrips }, { status: 200 });
        }

        if (!fromStopName || !toStopName || !dateStr) {
            return NextResponse.json({ error: 'Missing search parameters' }, { status: 400 });
        }

        await dbConnect();

        // 1. Find the stops to get IDs
        const stops = await Stop.find({
            name: { $in: [new RegExp(fromStopName, 'i'), new RegExp(toStopName, 'i')] }
        });

        const fromStop = stops.find(s => s.name.toLowerCase().includes(fromStopName.toLowerCase()));
        const toStop = stops.find(s => s.name.toLowerCase().includes(toStopName.toLowerCase()));

        if (!fromStop || !toStop) {
            return NextResponse.json({ trips: [] });
        }

        // 2. Find routes containing both stops in the correct order
        // A route is valid if:
        // - fromStop is originStopId AND (toStop is destinationStopId OR toStop is in stops)
        // - fromStop is in stops AND (toStop is destinationStopId OR toStop is in stops LATER)

        const routes = await Route.find({
            $or: [
                { originStopId: fromStop._id, $or: [{ destinationStopId: toStop._id }, { stops: toStop._id }] },
                { stops: fromStop._id, $or: [{ destinationStopId: toStop._id }, { stops: toStop._id }] }
            ]
        });

        const validRoutes = routes.filter(r => {
            const stopIds = [
                r.originStopId.toString(),
                ...r.stops.map((s: any) => s.toString()),
                r.destinationStopId.toString()
            ];

            const fromIdx = stopIds.indexOf(fromStop._id.toString());
            const toIdx = stopIds.indexOf(toStop._id.toString());

            return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
        });

        if (validRoutes.length === 0) {
            return NextResponse.json({ trips: [] });
        }

        // 3. Find trips for these routes on the specific date
        const startOfDay = new Date(dateStr);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59, 999);

        const trips = await Trip.find({
            routeId: { $in: validRoutes.map(r => r._id) },
            departureTime: { $gte: startOfDay, $lte: endOfDay },
            status: 'SCHEDULED',
            $expr: { $gte: [{ $size: "$availableSeats" }, passengers] }
        })
            .populate({
                path: 'agencyId',
                select: 'name status trustScore',
                match: { status: 'ACTIVE' }
            })
            .populate({
                path: 'routeId',
                populate: {
                    path: 'stops',
                    select: 'name'
                }
            })
            .populate('busId', 'busNumber busModel type amenities');

        // Filter out trips where critical data is missing or agency is inactive/mock
        const finalTrips = trips.filter(t =>
            t.agencyId &&
            t.routeId &&
            t.busId &&
            t.agencyId.name !== 'Ocean Lines'
        );

        return NextResponse.json({ trips: finalTrips }, { status: 200 });

    } catch (error: any) {
        console.error('Error searching trips:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
