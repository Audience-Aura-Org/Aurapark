import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import User from '@/lib/models/User';
import Trip from '@/lib/models/Trip';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get all drivers for this agency
        const drivers = await User.find({
            agencyId: session.agencyId,
            role: 'DRIVER'
        });

        const stats = await Promise.all(drivers.map(async (driver) => {
            const driverTrips = await Trip.find({
                driverId: driver._id,
                status: 'COMPLETED'
            });

            const totalTrips = driverTrips.length;
            const totalDistance = driverTrips.reduce((acc, t) => acc + (t.distance || 0), 0);

            // This is a placeholder for actual performance metrics
            return {
                driverId: driver._id,
                name: driver.name,
                email: driver.email,
                stats: {
                    totalTrips,
                    totalDistance,
                    rating: 4.8 // Placeholder
                }
            };
        }));

        return NextResponse.json({ stats });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
