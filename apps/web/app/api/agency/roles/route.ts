import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import User from '@/lib/models/User';
import Agency from '@/lib/models/Agency';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch agency details to find the owner/staff
        // In a real scenario, staff might be linked by agencyId in User model
        // For now, let's find users with AGENCY_STAFF role as a mock representation
        const staff = await User.find({ role: 'AGENCY_STAFF' })
            .select('-passwordHash')
            .sort({ createdAt: -1 });

        return NextResponse.json({ staff });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
