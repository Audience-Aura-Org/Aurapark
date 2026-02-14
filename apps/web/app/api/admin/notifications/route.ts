import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/notifications - Get all system notification logs
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
        const status = searchParams.get('status');
        const recipient = searchParams.get('recipient');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;

        const filter: any = {};
        if (status) filter.status = status;
        if (recipient) filter.recipient = { $regex: new RegExp(recipient, 'i') };

        const logs = await Notification.find(filter)
            .populate('bookingId', 'pnr')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Notification.countDocuments(filter);

        return NextResponse.json({
            logs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Notifications API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
