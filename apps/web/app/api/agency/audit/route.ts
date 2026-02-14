import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import AuditLog from '@/lib/models/AuditLog';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch logs 관련 to this agency's resources or users
        // Since AuditLog uses userId or resourceId, we might need a better filtering strategy.
        // For now, let's fetch recent logs for context.
        const logs = await AuditLog.find({})
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100);

        return NextResponse.json({ logs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
