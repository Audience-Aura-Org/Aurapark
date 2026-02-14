import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Trip from '@/lib/models/Trip';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await (await import('next/headers')).cookies();
        const token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'DRIVER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { status } = await req.json();

        // Validate status transition
        const validStatuses = ['SCHEDULED', 'EN_ROUTE', 'COMPLETED', 'DELAYED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await dbConnect();

        const trip = await Trip.findOne({
            _id: id,
            driverId: decoded.id
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found or not assigned to you' }, { status: 404 });
        }

        // Update status
        trip.status = status;

        // If completing, set arrival time to now (optional, depending on business logic)
        if (status === 'COMPLETED') {
            trip.arrivalTime = new Date();
        }

        await trip.save();

        return NextResponse.json({
            message: 'Trip status updated',
            trip
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating trip status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
