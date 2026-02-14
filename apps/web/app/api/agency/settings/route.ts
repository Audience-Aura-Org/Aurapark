import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import Agency from '@/lib/models/Agency';
import { getServerSession } from '@/lib/auth';

export async function GET() {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const agency = await Agency.findById(session.agencyId);
        return NextResponse.json({ settings: agency?.settings || {} });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const agency = await Agency.findByIdAndUpdate(
            session.agencyId,
            { $set: { settings: body } },
            { new: true }
        );

        return NextResponse.json({ settings: agency?.settings });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
