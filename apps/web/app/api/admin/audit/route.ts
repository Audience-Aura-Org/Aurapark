import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import AuditLog from '@/lib/models/AuditLog';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/audit - Get system audit logs with filtering
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
        const resource = searchParams.get('resource');
        const action = searchParams.get('action');
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 50;

        const filter: any = {};
        if (resource) filter.resource = resource;
        if (action) filter.action = action;
        if (userId) filter.userId = userId;

        const logs = await AuditLog.find(filter)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await AuditLog.countDocuments(filter);

        // Simple security flagging logic for the dashboard
        const securityAlerts = await AuditLog.find({
            action: { $in: ['LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'LARGE_REFUND', 'SETTLEMENT_REJECTED'] }
        })
            .sort({ createdAt: -1 })
            .limit(5);

        return NextResponse.json({
            logs,
            securityAlerts,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Audit API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
