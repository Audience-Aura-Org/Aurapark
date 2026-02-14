import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import OverrideLog from '@/lib/models/OverrideLog';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/overrides - Get override logs
export async function GET() {
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
            return NextResponse.json({ error: 'Forbidden - Admin access only' }, { status: 403 });
        }

        await dbConnect();

        // Get override logs (last 100)
        const logs = await OverrideLog.find()
            .sort({ timestamp: -1 })
            .limit(100)
            .populate('adminId', 'name email');

        return NextResponse.json({ logs }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching override logs:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
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
            return NextResponse.json({ error: 'Forbidden - Admin access only' }, { status: 403 });
        }

        const body = await req.json();
        const adminId = decoded.id || decoded.userId;
        const { action, entityType, entityId, reason, impact, previousValue, newValue } = body;

        if (!action || !entityType || !entityId || !reason || !impact) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Create override log
        const log = await OverrideLog.create({
            adminId: adminId,
            adminName: decoded.name || decoded.email || 'Admin',
            action,
            entityType,
            entityId,
            reason,
            impact,
            previousValue,
            newValue,
            timestamp: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'Override logged successfully',
            log
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating override log:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
