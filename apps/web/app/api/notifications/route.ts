import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Notification from '@/lib/models/Notification';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const bookingId = searchParams.get('bookingId');
        const recipient = searchParams.get('recipient');

        const filter: any = {};
        if (bookingId) filter.bookingId = bookingId;
        if (recipient) filter.recipient = recipient;

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ notifications }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
