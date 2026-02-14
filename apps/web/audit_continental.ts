import dbConnect from './lib/mongo';
import User from './lib/models/User';
import Agency from './lib/models/Agency';
import Booking from './lib/models/Booking';
import Trip from './lib/models/Trip';
import mongoose from 'mongoose';

async function auditContinental() {
    await dbConnect();

    const agencyId = '6983a468e93ca6cab0d6dc30'; // Continental Express
    console.log('--- AUDITING CONTINENTAL EXPRESS ---');

    const trips = await Trip.find({ agencyId }).lean();
    console.log(`Found ${trips.length} trips.`);

    for (const t of trips) {
        const bookings = await Booking.find({ tripId: t._id, status: 'CONFIRMED' }).lean();
        if (bookings.length > 0) {
            console.log(`\nTrip ID: ${t._id} | Status: ${t.status} | Departure: ${t.departureTime}`);
            console.log(`Confirmed Bookings: ${bookings.length}`);
            bookings.forEach(b => {
                console.log(`- PNR: ${b.pnr} | Contact: ${b.contactEmail} | Seats: ${b.passengers?.length}`);
            });
        }
    }

    process.exit(0);
}

auditContinental();
