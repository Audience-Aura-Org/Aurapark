import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';
import Trip from '@/lib/models/Trip';
import Bus from '@/lib/models/Bus';
import Payment from '@/lib/models/Payment';
import Route from '@/lib/models/Route';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const agencyId = searchParams.get('agencyId');

        if (!agencyId) {
            return NextResponse.json({ error: 'Agency ID required' }, { status: 400 });
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

        // Net earnings (assume 100% for now or apply logic)
        const totalRevenue = revenueData[0]?.totalRevenue || 0;
        const totalAgencyAmount = totalRevenue; // Simple for now

        // 2. Booking Stats (Counting CONFIRMED Tickets/Seats from current/future missions only)
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
                    ticketCount: { $sum: { $size: "$passengers" } },
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
            routeId: { $ne: null },
            busId: { $ne: null },
            status: 'EN_ROUTE'
        });

        // 5. Revenue Chart Data (Last 7 Days)
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
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 6. Performance Score Calculation (Dynamic)
        const mockKeywords = ['John Doe', 'Jane Smith', 'Alice Traveler', 'Bob Commuter', 'Charlie Hopper', 'Test Passenger'];

        // Fetch all trips for this agency to scope bookings
        const agencyTrips = await Trip.find({ agencyId: oid }).select('_id');
        const agencyTripIds = agencyTrips.map(t => t._id);

        // Fetch all bookings for agency to calculate check-in rate
        const allAgencyBookings = await Booking.find({ tripId: { $in: agencyTripIds } }).lean();

        const realBookings = allAgencyBookings.filter((b: any) =>
            Array.isArray(b.passengers) && !b.passengers.some((p: any) =>
                mockKeywords.some(kw => p.name?.includes(kw))
            )
        );

        let totalRealPassengers = 0;
        let checkedInRealPassengers = 0;
        realBookings.forEach((b: any) => {
            totalRealPassengers += b.passengers.length;
            checkedInRealPassengers += b.passengers.filter((p: any) => p.checkedIn).length;
        });

        const checkInRate = totalRealPassengers > 0 ? (checkedInRealPassengers / totalRealPassengers) * 100 : 100;

        // Reliability: completed trips vs total missions (excluding current/future ones)
        const completedTrips = await Trip.countDocuments({ agencyId: oid, status: 'COMPLETED' });
        const failedTrips = await Trip.countDocuments({ agencyId: oid, status: { $in: ['CANCELLED'] } });
        const reliabilityScore = (completedTrips + failedTrips) > 0 ? (completedTrips / (completedTrips + failedTrips)) * 100 : 100;

        // Final trust score: 40% check-in, 60% reliability
        const dynamicTrustScore = Math.round((checkInRate * 0.4) + (reliabilityScore * 0.6));

        // 4. Recent Bookings (Strictly real data, scoped to agency trips)
        const agencyRecentBookings = await Booking.find({
            tripId: { $in: agencyTripIds },
            'passengers.name': { $nin: mockKeywords.map(kw => new RegExp(kw, 'i')) }
        })
            .populate({
                path: 'tripId',
                populate: { path: 'routeId' }
            })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        // 6. Fleet Stats
        const busCount = await Bus.countDocuments({ agencyId: oid });

        return NextResponse.json({
            revenue: revenueData[0] || { totalAgencyAmount: 0, totalRevenue: 0 },
            bookings: bookingStats,
            activeTrips: activeTripsCount,
            inTransitCount: inTransitCount,
            recentBookings: agencyRecentBookings,
            chartData,
            busCount,
            trustScore: dynamicTrustScore
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching agency stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
