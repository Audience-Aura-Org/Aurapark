import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Bus from '@/lib/models/Bus';

// GET /api/buses/[id] - Get single bus
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const bus = await Bus.findById(id).populate('agencyId', 'name');

        if (!bus) {
            return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
        }

        return NextResponse.json({ bus }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching bus:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/buses/[id] - Update bus
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const updates = await req.json();
        await dbConnect();

        // Explicitly include model in the update to ensure persistence
        const bus = await Bus.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true, strict: false }
        );

        if (!bus) {
            return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Bus updated successfully',
            bus
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating bus:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/buses/[id] - Delete bus
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const bus = await Bus.findByIdAndDelete(id);

        if (!bus) {
            return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Bus deleted successfully'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error deleting bus:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
