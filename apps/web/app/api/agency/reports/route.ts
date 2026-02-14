import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import Booking from '@/lib/models/Booking';
import Trip from '@/lib/models/Trip';
import FuelLog from '@/lib/models/FuelLog';
import Bus from '@/lib/models/Bus';
import Route from '@/lib/models/Route';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const agencyId = new mongoose.Types.ObjectId(session.agencyId);

        // --- 1. Revenue by Route ---
        const routeRevenue = await Booking.aggregate([
            {
                $lookup: {
                    from: 'trips',
                    localField: 'tripId',
                    foreignField: '_id',
                    as: 'trip'
                }
            },
            { $unwind: '$trip' },
            { $match: { 'trip.agencyId': agencyId, status: 'CONFIRMED' } },
            {
                $lookup: {
                    from: 'routes',
                    localField: 'trip.routeId',
                    foreignField: '_id',
                    as: 'route'
                }
            },
            { $unwind: '$route' },
            {
                $group: {
                    _id: '$route.routeName',
                    revenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // --- 2. Monthly Revenue ---
        const monthlyRevenue = await Booking.aggregate([
            {
                $lookup: {
                    from: 'trips',
                    localField: 'tripId',
                    foreignField: '_id',
                    as: 'trip'
                }
            },
            { $unwind: '$trip' },
            { $match: { 'trip.agencyId': agencyId, status: 'CONFIRMED' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // --- 3. Operational Costs (Fuel) ---
        const fuelCosts = await FuelLog.aggregate([
            { $match: { agencyId: agencyId } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    totalCost: { $sum: "$totalCost" },
                    volume: { $sum: "$quantity" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // --- 4. Occupancy Rate Calculation ---
        const recentTrips = await Trip.find({
            agencyId: agencyId,
            status: 'COMPLETED',
            departureTime: { $lte: new Date() }
        })
            .limit(20)
            .populate('busId', 'capacity')
            .lean();

        let totalCapacity = 0;
        let totalBooked = 0;

        for (const trip of recentTrips) {
            const bookingCount = await Booking.countDocuments({ tripId: trip._id, status: 'CONFIRMED' });
            totalBooked += bookingCount;
            totalCapacity += (trip.busId as any)?.capacity || 0;
        }

        const occupancyRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

        return NextResponse.json({
            routeRevenue,
            monthlyRevenue,
            fuelCosts,
            occupancyRate,
            totalRevenue: monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0),
            totalBookings: monthlyRevenue.reduce((sum, m) => sum + m.bookings, 0)
        });
    } catch (error: any) {
        console.error('[GET /api/agency/reports] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
