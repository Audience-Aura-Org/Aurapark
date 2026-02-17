import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import Payment from '@/lib/models/Payment';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/payments - Platform-wide payment logs
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const tokenToken = cookieStore.get('token');
        const authToken = cookieStore.get('auth_token');
        const token = tokenToken?.value || authToken?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const agencyId = searchParams.get('agencyId');
        const status = searchParams.get('status');
        const date = searchParams.get('date');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;

        const filter: any = {};
        if (agencyId) filter.agencyId = agencyId;
        if (status) filter.status = status;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: start, $lte: end };
        }

        const payments = await Payment.find(filter)
            .populate('agencyId', 'name')
            .populate('userId', 'name email')
            .populate({
                path: 'bookingId',
                select: 'pnr',
                populate: { path: 'tripId', select: 'routeId', populate: { path: 'routeId', select: 'routeName' } }
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Payment.countDocuments(filter);

        return NextResponse.json({
            payments,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Payments API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
