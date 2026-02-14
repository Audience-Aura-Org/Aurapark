import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import Notification from '@/lib/models/Notification';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Notifications often target recipients (phone/email), 
        // but for agency log we might want to filter by related entities if available.
        // For now, let's fetch recent notifications for the system context.
        const notifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .limit(100);

        return NextResponse.json({ notifications });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
