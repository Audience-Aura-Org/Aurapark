import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import Promotion from '@/lib/models/Promotion';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const promotions = await Promotion.find({ agencyId: session.agencyId })
            .sort({ createdAt: -1 });

        return NextResponse.json({ promotions });
    } catch (error: any) {
        console.error('[GET /api/agency/marketing] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();

        // Basic validation
        if (!body.code || !body.type || !body.value || !body.startDate || !body.endDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if code already exists for this agency
        const existing = await Promotion.findOne({
            code: body.code.toUpperCase(),
            agencyId: session.agencyId
        });

        if (existing) {
            return NextResponse.json({ error: 'Promotion code already exists' }, { status: 400 });
        }

        const promotion = await Promotion.create({
            ...body,
            code: body.code.toUpperCase(),
            agencyId: session.agencyId
        });

        return NextResponse.json({ promotion });
    } catch (error: any) {
        console.error('[POST /api/agency/marketing] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
