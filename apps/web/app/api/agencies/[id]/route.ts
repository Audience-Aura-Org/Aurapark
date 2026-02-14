import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import Agency from '@/lib/models/Agency';
import { verifyToken } from '@/lib/auth';

// GET /api/agencies/[id] - Get single agency
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const tokenToken = cookieStore.get('token');
        const authToken = cookieStore.get('auth_token');
        const token = tokenToken?.value || authToken?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || (decoded.role !== 'ADMIN' && decoded.agencyId !== (await params).id)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        await dbConnect();

        const agency = await Agency.findById(id);

        if (!agency) {
            return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
        }

        // Try to populate owner, but don't fail if it doesn't exist
        try {
            await agency.populate('ownerId', 'name email role');
        } catch (populateError) {
            console.warn('Could not populate ownerId:', populateError);
        }

        return NextResponse.json({ agency }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching agency:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

// PATCH /api/agencies/[id] - Update agency
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const tokenToken = cookieStore.get('token');
        const authToken = cookieStore.get('auth_token');
        const token = tokenToken?.value || authToken?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || (decoded.role !== 'ADMIN' && decoded.agencyId !== (await params).id)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const updates = await req.json();

        await dbConnect();

        const agency = await Agency.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!agency) {
            return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Agency updated successfully',
            agency
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating agency:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/agencies/[id] - Delete agency
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = await params;
        await dbConnect();

        const agency = await Agency.findByIdAndDelete(id);

        if (!agency) {
            return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Agency deleted successfully'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error deleting agency:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
