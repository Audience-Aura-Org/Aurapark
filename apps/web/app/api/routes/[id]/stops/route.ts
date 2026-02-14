import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Route from '@/lib/models/Route';

// POST /api/routes/[id]/stops - Add stop to route
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { stopId } = await req.json();

        if (!stopId) {
            return NextResponse.json({ error: 'Missing stopId' }, { status: 400 });
        }

        await dbConnect();

        const route = await Route.findByIdAndUpdate(
            id,
            { $push: { stops: stopId } },
            { new: true }
        ).populate('stops', 'name description');

        if (!route) {
            return NextResponse.json({ error: 'Route not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Stop added to route',
            route
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error adding stop to route:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/routes/[id]/stops - Reorder stops
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { stops } = await req.json();

        if (!stops || !Array.isArray(stops)) {
            return NextResponse.json({ error: 'Invalid stops array' }, { status: 400 });
        }

        await dbConnect();

        const route = await Route.findByIdAndUpdate(
            id,
            { $set: { stops } },
            { new: true }
        ).populate('stops', 'name description');

        if (!route) {
            return NextResponse.json({ error: 'Route not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Stops reordered successfully',
            route
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error reordering stops:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
