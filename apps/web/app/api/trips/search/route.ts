import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Trip from '@/lib/models/Trip';
import Route from '@/lib/models/Route';
import Stop from '@/lib/models/Stop';
import '@/lib/models/Bus';
import '@/lib/models/Agency';

export async function GET(req: Request) {
    try {
        console.log('Received request:', req.url);

        const { searchParams } = new URL(req.url);
        const fromStopName = searchParams.get('from');
        const toStopName = searchParams.get('to');
        const dateStr = searchParams.get('date');
        const passengers = parseInt(searchParams.get('passengers') || '1');

        console.log('Parsed parameters:', { fromStopName, toStopName, dateStr, passengers });

        if (!fromStopName && !toStopName && !dateStr) {
            console.log('Explore mode: Fetching upcoming trips');
            await dbConnect();
            console.log('Database connected');

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

            console.log('Fetched trips:', trips);

            const filteredTrips = trips.filter(t =>
                t.agencyId &&
                t.routeId &&
                t.busId &&
                t.agencyId.name !== 'Ocean Lines'
            );

            console.log('Filtered trips:', filteredTrips);

            return NextResponse.json({ trips: filteredTrips }, { status: 200 });
        }

        if (!fromStopName || !toStopName || !dateStr) {
            console.error('Missing search parameters:', { fromStopName, toStopName, dateStr });
            return NextResponse.json({ error: 'Missing search parameters' }, { status: 400 });
        }

        await dbConnect();
        console.log('Database connected');

        const stops = await Stop.find({
            name: { $in: [new RegExp(fromStopName, 'i'), new RegExp(toStopName, 'i')] }
        });

        console.log('Fetched stops:', stops);

        const fromStop = stops.find(s => s.name.toLowerCase().includes(fromStopName.toLowerCase()));
        const toStop = stops.find(s => s.name.toLowerCase().includes(toStopName.toLowerCase()));

        console.log('Matched stops:', { fromStop, toStop });

        if (!fromStop || !toStop) {
            console.warn('No matching stops found');
            return NextResponse.json({ trips: [] });
        }

        const routes = await Route.find({
            $or: [
                { originStopId: fromStop._id, destinationStopId: toStop._id },
                { originStopId: fromStop._id, stops: toStop._id },
                { stops: fromStop._id, destinationStopId: toStop._id },
                { stops: { $all: [fromStop._id, toStop._id] } }
            ]
        });

        console.log('Fetched routes:', routes);

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

        console.log('Valid routes:', validRoutes);

        if (validRoutes.length === 0) {
            console.warn('No valid routes found');
            return NextResponse.json({ trips: [] });
        }

        const startOfDay = new Date(dateStr);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59, 999);

        console.log('Date range:', { startOfDay, endOfDay });

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

        console.log('Fetched trips for valid routes:', trips);

        const finalTrips = trips.filter(t =>
            t.agencyId &&
            t.routeId &&
            t.busId &&
            t.agencyId.name !== 'Ocean Lines'
        );

        console.log('Final filtered trips:', finalTrips);

        return NextResponse.json({ trips: finalTrips }, { status: 200 });

    } catch (error: any) {
        console.error('Error searching trips:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
