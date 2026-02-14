import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import Maintenance from '@/lib/models/Maintenance';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const busId = searchParams.get('busId');

        const query: any = { agencyId: session.agencyId };
        if (busId) {
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(busId)) {
                query.busId = busId;
            }
        }

        const maintenance = await Maintenance.find(query)
            .populate('busId', 'busNumber busModel')
            .sort({ startDate: -1 });

        return NextResponse.json({ maintenance });
    } catch (error: any) {
        console.error('[GET /api/agency/fleet/maintenance] Error:', error);
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
        if (!body.busId || !body.description) {
            return NextResponse.json({ error: 'Missing required fields: busId and description' }, { status: 400 });
        }

        // Validate ObjectId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(body.busId)) {
            return NextResponse.json({ error: 'Invalid Bus ID format' }, { status: 400 });
        }

        const maintenance = await Maintenance.create({
            ...body,
            agencyId: session.agencyId
        });

        return NextResponse.json({ maintenance });
    } catch (error: any) {
        console.error('[POST /api/agency/fleet/maintenance] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
