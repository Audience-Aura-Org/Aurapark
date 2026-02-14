import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Settlement from '@/lib/models/Settlement';
import Booking from '@/lib/models/Booking';
import Shipment from '@/lib/models/Shipment';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/agency/settlements - Get agency settlements
export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession();

        if (!session || session.role !== 'AGENCY_STAFF') {
            console.warn('[Settlements] Unauthorized or non-agency access');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const agencyId = session.agencyId;
        if (!agencyId) {
            return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const settlementPage = parseInt(searchParams.get('settlementPage') || '1');
        const transactionPage = parseInt(searchParams.get('transactionPage') || '1');
        const limit = 10;

        // 1. Get paginated settlements for this agency
        const settlements = await Settlement.find({ agencyId: agencyId })
            .sort({ createdAt: -1 })
            .skip((settlementPage - 1) * limit)
            .limit(limit);

        const totalSettlements = await Settlement.countDocuments({ agencyId: agencyId });

        // 2. Get combined recent transactions (Bookings + Shipments)
        const [rawBookings, rawShipments] = await Promise.all([
            Booking.find({ agencyId }).sort({ createdAt: -1 }).limit(limit),
            Shipment.find({ agencyId }).sort({ createdAt: -1 }).limit(limit)
        ]);

        const transactions = [...rawBookings.map(b => ({ ...b.toObject(), txType: 'BOOKING' })),
        ...rawShipments.map(s => ({ ...s.toObject(), txType: 'SHIPMENT' }))]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);

        const totalTransactions = await Booking.countDocuments({ agencyId }) + await Shipment.countDocuments({ agencyId });

        // 3. Calculate all-time totals (Gross and Net)
        const allBookings = await Booking.find({ agencyId, status: 'CONFIRMED', paymentStatus: 'PAID' });
        const allShipments = await Shipment.find({ agencyId, paymentStatus: 'PAID' });

        const totalBookingGross = allBookings.reduce((sum, b) => sum + b.totalAmount, 0);
        const totalShipmentGross = allShipments.reduce((sum, s) => sum + s.price, 0);
        const totalAllTimeGross = totalBookingGross + totalShipmentGross;

        // Assuming 10% platform fee if not specifically stored
        const totalNetEarnings = totalAllTimeGross * 0.9;

        // 4. Calculate current month stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthBookings = allBookings.filter(b => b.createdAt >= startOfMonth && b.createdAt <= endOfMonth);
        const monthShipments = allShipments.filter(s => s.createdAt >= startOfMonth && s.createdAt <= endOfMonth);

        const monthBookingGross = monthBookings.reduce((sum, b) => sum + b.totalAmount, 0);
        const monthShipmentGross = monthShipments.reduce((sum, s) => sum + s.price, 0);
        const monthGross = monthBookingGross + monthShipmentGross;
        const monthNet = monthGross * 0.9;

        // 5. Calculate pending payout (everything PENDING)
        const pendingBookings = await Booking.find({ agencyId, status: 'CONFIRMED', paymentStatus: 'PENDING' });
        const pendingShipments = await Shipment.find({ agencyId, paymentStatus: 'PENDING' });

        const pendingPayout = (pendingBookings.reduce((sum, b) => sum + b.totalAmount, 0) +
            pendingShipments.reduce((sum, s) => sum + s.price, 0)) * 0.9;

        return NextResponse.json({
            settlements,
            transactions,
            pagination: {
                settlements: {
                    total: totalSettlements,
                    page: settlementPage,
                    pages: Math.ceil(totalSettlements / limit)
                },
                transactions: {
                    total: totalTransactions,
                    page: transactionPage,
                    pages: Math.ceil(totalTransactions / limit)
                }
            },
            stats: {
                totalRevenue: totalAllTimeGross,
                totalEarnings: totalNetEarnings,
                bookingRevenue: totalBookingGross,
                shipmentRevenue: totalShipmentGross,
                netRevenue: monthNet,
                grossRevenue: monthGross,
                pendingPayout,
                currentMonth: {
                    period: startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    bookings: monthBookings.length,
                    shipments: monthShipments.length
                }
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching settlements:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

// POST /api/agency/settlements - Request payout
export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession();

        if (!session || session.role !== 'AGENCY_STAFF' || !session.agencyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { amount, paymentMethod } = body;

        await dbConnect();

        // Create settlement request
        const now = new Date();
        const settlement = await Settlement.create({
            agencyId: session.agencyId,
            period: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
            grossRevenue: amount,
            platformFee: amount * 0.1,
            netRevenue: amount * 0.9,
            status: 'PENDING',
            paymentMethod
        });

        return NextResponse.json({
            success: true,
            message: 'Payout request submitted successfully',
            settlement
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error requesting payout:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
