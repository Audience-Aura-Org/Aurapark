import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Trip from '@/lib/models/Trip';
import Bus from '@/lib/models/Bus';
import Route from '@/lib/models/Route';
import Stop from '@/lib/models/Stop';
import User from '@/lib/models/User';
import Agency from '@/lib/models/Agency';

// GET /api/trips - List trips with advanced filtering
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);

        const agencyId = searchParams.get('agencyId');
        const routeId = searchParams.get('routeId');
        const busId = searchParams.get('busId');
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const search = searchParams.get('search');
        const date = searchParams.get('date');

        const filter: any = {};
        if (agencyId) filter.agencyId = agencyId;
        if (routeId) filter.routeId = routeId;
        if (busId) filter.busId = busId;
        if (startDate || endDate) {
            filter.departureTime = { ...filter.departureTime };
            if (startDate) filter.departureTime.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.departureTime.$lte = end;
            }
        }
        if (status) {
            const now = new Date();
            if (status === 'SCHEDULED') {
                filter.status = { $ne: 'CANCELLED' };
                filter.departureTime = { ...filter.departureTime, $gt: now };
            } else if (status === 'EN_ROUTE') {
                filter.status = { $ne: 'CANCELLED' };
                // Live: Departure has passed, Arrival has NOT passed
                filter.departureTime = { ...filter.departureTime, $lte: now };
                filter.arrivalTime = { $gte: now };
            } else if (status === 'COMPLETED') {
                // Completed: explicitly set or time has passed
                filter.$or = [
                    { status: 'COMPLETED' },
                    { arrivalTime: { $lt: now } }
                ];
            } else {
                filter.status = status;
            }
        }

        let tripsData = await Trip.find(filter)
            .populate({
                path: 'routeId',
                select: 'routeName stops',
                populate: { path: 'stops', select: 'name city' }
            })
            .populate('busId', 'busNumber registrationNumber capacity model type')
            .populate('driverId', 'name')
            .sort({ departureTime: -1 });

        const Booking = (await import('@/lib/models/Booking')).default;

        // Enhance trips with real-time booking counts and actual revenue
        const enhancedTrips = await Promise.all(tripsData.map(async (trip: any) => {
            const bookings = await Booking.find({ tripId: trip._id, status: 'CONFIRMED' });
            const totalPassengers = bookings.reduce((sum, b) => sum + (b.passengers?.length || 0), 0);
            const actualRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

            return {
                ...trip.toObject(),
                bookedCount: totalPassengers,
                actualRevenue: actualRevenue
            };
        }));

        let filteredTrips = enhancedTrips;

        if (search) {
            const searchLower = search.toLowerCase();
            filteredTrips = filteredTrips.filter(trip => {
                const routeName = trip.routeId?.routeName?.toLowerCase() || '';
                const tripId = trip._id.toString().toLowerCase();
                const busNumber = trip.busId?.busNumber?.toLowerCase() || '';
                const status = trip.status?.toLowerCase() || '';
                const driverName = trip.driverId?.name?.toLowerCase() || '';

                return routeName.includes(searchLower) ||
                    tripId.includes(searchLower) ||
                    busNumber.includes(searchLower) ||
                    status.includes(searchLower) ||
                    driverName.includes(searchLower);
            });
        }

        return NextResponse.json({ trips: filteredTrips }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching trips:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/trips - Schedule a new trip
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            routeId,
            busId,
            driverId,
            agencyId,
            departureTime,
            arrivalTime,
            basePrice,
            autoCreateRoute,
            stops: requestStops,
            origin,
            destination
        } = body;

        if (!busId || !agencyId || !departureTime || !arrivalTime || !basePrice) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const bus = await Bus.findById(busId);
        if (!bus) {
            return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
        }

        let processedStops: any[] = [];
        if (requestStops && Array.isArray(requestStops)) {
            processedStops = await Promise.all(requestStops.map(async (s: any) => {
                // If we have a real MongoDB ID, use it. 
                // Manual stops from frontend start with 'manual-'
                if (s.stopId && typeof s.stopId === 'string' && !s.stopId.startsWith('manual-')) {
                    return s;
                }

                // If no valid ID but we have a name, resolve or create it
                if (s.name) {
                    const name = s.name.trim();
                    let stop = await Stop.findOne({
                        name: { $regex: new RegExp(`^${name}$`, 'i') },
                        agencyId
                    });

                    if (!stop) {
                        stop = await Stop.create({ name, agencyId });
                    }
                    return { ...s, stopId: stop._id };
                }
                return null;
            }));
            processedStops = processedStops.filter(Boolean);
        }

        let finalRouteId = routeId;

        if (!finalRouteId && autoCreateRoute && origin && destination) {
            const getOrCreateStop = async (name: string) => {
                let stop = await Stop.findOne({
                    name: { $regex: new RegExp(`^${name}$`, 'i') },
                    agencyId
                });
                if (!stop) {
                    stop = await Stop.create({ name, agencyId });
                }
                return stop;
            };

            const originStop = await getOrCreateStop(origin);
            const destStop = await getOrCreateStop(destination);

            const routeName = `${origin} - ${destination}`;
            let route = await Route.findOne({ routeName, agencyId });
            if (!route) {
                route = await Route.create({
                    routeName,
                    agencyId,
                    stops: [originStop._id, destStop._id]
                });
            }
            finalRouteId = route._id;
        }

        if (!finalRouteId) {
            return NextResponse.json({ error: 'Route ID is required if auto-creation is not possible' }, { status: 400 });
        }

        const availableSeats = bus.seatMap.seats
            .filter((s: any) => s.type !== 'EMPTY')
            .map((s: any) => s.seatNumber);

        const newTrip = await Trip.create({
            routeId: finalRouteId,
            busId,
            driverId,
            agencyId,
            departureTime: new Date(departureTime),
            arrivalTime: new Date(arrivalTime),
            basePrice,
            availableSeats,
            stops: processedStops
        });

        return NextResponse.json({
            message: 'Trip scheduled successfully',
            trip: newTrip
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error scheduling trip:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
