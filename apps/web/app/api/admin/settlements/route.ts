import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import Settlement from '@/lib/models/Settlement';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/settlements - List all payout requests/history across platform
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
        const agencyId = searchParams.get('agencyId');

        const filter: any = {};
        if (status) filter.status = status;
        if (agencyId) filter.agencyId = agencyId;

        const settlements = await Settlement.find(filter)
            .populate('agencyId', 'name email settings')
            .sort({ createdAt: -1 });

        return NextResponse.json({ settlements }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Settlements API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/admin/settlements/[id] - Update settlement status (e.g., mark as PAID)
// This will be handled in a separate dynamic route if needed,
// but for now I'll include it here or create the file.
