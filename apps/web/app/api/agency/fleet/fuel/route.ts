import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import FuelLog from '@/lib/models/FuelLog';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const busId = searchParams.get('busId');

        const query: any = { agencyId: session.agencyId };
        if (busId) query.busId = busId;

        const fuelLogs = await FuelLog.find(query)
            .populate('busId', 'busNumber busModel')
            .populate('driverId', 'name')
            .sort({ date: -1 });

        return NextResponse.json({ fuelLogs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const fuelLog = await FuelLog.create({
            ...body,
            agencyId: session.agencyId,
            driverId: session.userId // Assuming the person logging is the user or a driver
        });

        return NextResponse.json({ fuelLog });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
