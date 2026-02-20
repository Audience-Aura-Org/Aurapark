import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';
import Trip from '@/lib/models/Trip';
import Bus from '@/lib/models/Bus';
// Register Route model so nested populate works
import '@/lib/models/Route';
import mongoose from 'mongoose';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const agencyId = searchParams.get('agencyId');

        if (!agencyId) {
            return NextResponse.json({ error: 'Agency ID required' }, { status: 400 });
        }

        // Validate agencyId is a valid ObjectId before casting
        if (!mongoose.Types.ObjectId.isValid(agencyId)) {
            return NextResponse.json({ error: 'Invalid Agency ID format' }, { status: 400 });
        }

        await dbConnect();
        const oid = new mongoose.Types.ObjectId(agencyId);

        // 1. Revenue Analytics (Confirmed Bookings)
        const revenueData = await Booking.aggregate([
            {
                $lookup: {
                    from: 'trips',
                    localField: 'tripId',
                    foreignField: '_id',
                    as: 'trip'
                }
            },
            { $unwind: '$trip' },
            { $match: { 'trip.agencyId': oid, status: 'CONFIRMED' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueData[0]?.totalRevenue || 0;
        const totalAgencyAmount = totalRevenue;

        // 2. Booking Stats (Upcoming confirmed trips)
        const now = new Date();
        const bookingStats = await Booking.aggregate([
            {
                $lookup: {
                    from: 'trips',
                    localField: 'tripId',
                    foreignField: '_id',
                    as: 'trip'
                }
            },
            { $unwind: '$trip' },
            {
                $match: {
                    'trip.agencyId': oid,
                    'trip.routeId': { $ne: null },
                    'trip.busId': { $ne: null },
                    'trip.status': { $nin: ['COMPLETED', 'CANCELLED'] },
                    'trip.arrivalTime': { $gte: now },
                    status: 'CONFIRMED'
                }
            },
            {
                $group: {
                    _id: '$status',
                    ticketCount: { $sum: { $size: '$passengers' } },
                    recordCount: { $sum: 1 }
                }
            }
        ]);

        // 3. Active & In-Transit Trips
        const activeTripsCount = await Trip.countDocuments({
            agencyId: oid,
            routeId: { $ne: null },
            busId: { $ne: null },
            status: 'SCHEDULED',
            arrivalTime: { $gte: now }
        });

        const inTransitCount = await Trip.countDocuments({
            agencyId: oid,
            status: 'EN_ROUTE'
        });

        // 4. Revenue Chart Data (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const chartData = await Booking.aggregate([
            {
                $lookup: {
                    from: 'trips',
                    localField: 'tripId',
                    foreignField: '_id',
                    as: 'trip'
                }
            },
            { $unwind: '$trip' },
            {
                $match: {
                    'trip.agencyId': oid,
                    status: 'CONFIRMED',
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // 5. Performance Score
        const agencyTrips = await Trip.find({ agencyId: oid }).select('_id').lean();
        const agencyTripIds = agencyTrips.map((t: any) => t._id);

        let totalPassengers = 0;
        let checkedInPassengers = 0;

        if (agencyTripIds.length > 0) {
            const allAgencyBookings = await Booking.find({ tripId: { $in: agencyTripIds } })
                .select('passengers')
                .lean();

            (allAgencyBookings as any[]).forEach((b: any) => {
                if (Array.isArray(b.passengers)) {
                    totalPassengers += b.passengers.length;
                    checkedInPassengers += b.passengers.filter((p: any) => p.checkedIn).length;
                }
            });
        }

        const checkInRate = totalPassengers > 0 ? (checkedInPassengers / totalPassengers) * 100 : 100;

        const completedTrips = await Trip.countDocuments({ agencyId: oid, status: 'COMPLETED' });
        const failedTrips = await Trip.countDocuments({ agencyId: oid, status: 'CANCELLED' });
        const reliabilityScore = (completedTrips + failedTrips) > 0
            ? (completedTrips / (completedTrips + failedTrips)) * 100
            : 100;

        const dynamicTrustScore = Math.round((checkInRate * 0.4) + (reliabilityScore * 0.6));

        // 6. Recent Bookings (scoped to agency trips)
        let agencyRecentBookings: any[] = [];
        if (agencyTripIds.length > 0) {
            agencyRecentBookings = await Booking.find({ tripId: { $in: agencyTripIds } })
                .populate({
                    path: 'tripId',
                    populate: { path: 'routeId', model: 'Route' }
                })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean() as any[];
        }

        // 7. Fleet Stats
        const busCount = await Bus.countDocuments({ agencyId: oid });

        return NextResponse.json({
            revenue: { totalRevenue, totalAgencyAmount },
            bookings: bookingStats,
            activeTrips: activeTripsCount,
            inTransitCount,
            recentBookings: agencyRecentBookings,
            chartData,
            busCount,
            trustScore: dynamicTrustScore
        }, { status: 200 });

    } catch (error: any) {
        console.error('[Agency Stats] Error:', error?.message || error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? error?.message : undefined
        }, { status: 500 });
    }
}
