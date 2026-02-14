import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Stop from '@/lib/models/Stop';

// GET /api/stops - List all stops (with optional agency filter)
export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const agencyId = searchParams.get('agencyId');

        const filter: any = {};
        if (agencyId) {
            filter.agencyId = agencyId;
        }

        const stops = await Stop.find(filter).sort({ name: 1 });

        return NextResponse.json({ stops }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching stops:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/stops - Create new stop
export async function POST(req: Request) {
    try {
        const { name, description, agencyId, coordinates, pickupPoints } = await req.json();

        if (!name || !agencyId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const newStop = await Stop.create({
            name,
            description,
            agencyId,
            coordinates,
            pickupPoints: pickupPoints || []
        });

        return NextResponse.json({
            message: 'Stop created successfully',
            stop: newStop
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating stop:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
