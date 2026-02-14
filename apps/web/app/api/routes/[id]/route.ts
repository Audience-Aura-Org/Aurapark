import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Route from '@/lib/models/Route';

// GET /api/routes/[id] - Get single route
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const route = await Route.findById(id)
            .populate('stops', 'name description coordinates pickupPoints')
            .populate('agencyId', 'name');

        if (!route) {
            return NextResponse.json({ error: 'Route not found' }, { status: 404 });
        }

        return NextResponse.json({ route }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/routes/[id] - Update route
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const updates = await req.json();

        await dbConnect();

        // Fetch existing route to get agencyId
        const existingRoute = await Route.findById(id);
        if (!existingRoute) return NextResponse.json({ error: 'Route not found' }, { status: 404 });

        const agencyId = existingRoute.agencyId;
        const Stop = (await import('@/lib/models/Stop')).default;

        // Helper to resolve stop name to ID
        const resolveStop = async (nameInput: any) => {
            const name = typeof nameInput === 'string' ? nameInput.trim() : '';
            if (!name) return null;
            let stop = await Stop.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                agencyId
            });
            if (!stop) {
                stop = await Stop.create({ name, agencyId });
            }
            return stop._id;
        };

        // Process origin/destination if provided
        if (updates.origin) {
            updates.originStopId = await resolveStop(updates.origin);
        }
        if (updates.destination) {
            updates.destinationStopId = await resolveStop(updates.destination);
        }

        // Process stops if provided
        if (updates.stops && Array.isArray(updates.stops)) {
            const stopIds = await Promise.all(updates.stops.map(resolveStop));
            updates.stops = stopIds.filter(Boolean);
        }

        const route = await Route.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!route) {
            return NextResponse.json({ error: 'Route not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Route updated successfully',
            route
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating route:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/routes/[id] - Delete route
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const route = await Route.findByIdAndDelete(id);

        if (!route) {
            return NextResponse.json({ error: 'Route not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Route deleted successfully'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error deleting route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
