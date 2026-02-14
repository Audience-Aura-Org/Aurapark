import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import Booking from '@/lib/models/Booking';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Aggregate unique customers from bookings
        const customers = await Booking.aggregate([
            { $match: { agencyId: session.agencyId } },
            { $unwind: '$passengers' },
            {
                $group: {
                    _id: '$passengers.phone',
                    name: { $first: '$passengers.name' },
                    phone: { $first: '$passengers.phone' },
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    lastBooking: { $max: '$createdAt' }
                }
            },
            { $sort: { lastBooking: -1 } }
        ]);

        return NextResponse.json({ customers });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
