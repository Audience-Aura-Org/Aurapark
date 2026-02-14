import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import Agency from '@/lib/models/Agency';
import { verifyToken } from '@/lib/auth';

// GET /api/agencies - List all agencies (with optional filters)
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
        // Agencies list might be needed by others? 
        // But the filter/admin view should be protected.
        // For now, let's keep it ADMIN only as it's the admin list.
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const filter: any = {};
        if (status) {
            filter.status = status;
        }

        const agencies = await Agency.find(filter)
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ agencies }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching agencies:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/agencies - Create new agency
export async function POST(req: Request) {
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

        const { name, email, phone, address, ownerId } = await req.json();

        if (!name || !email || !phone || !ownerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const existingAgency = await Agency.findOne({ email });
        if (existingAgency) {
            return NextResponse.json({ error: 'Agency with this email already exists' }, { status: 409 });
        }

        const newAgency = await Agency.create({
            name,
            email,
            phone,
            address,
            ownerId
        });

        return NextResponse.json({
            message: 'Agency created successfully',
            agency: newAgency
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating agency:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
