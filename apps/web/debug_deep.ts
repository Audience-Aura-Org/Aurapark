import dbConnect from './lib/mongo';
import User from './lib/models/User';
import Agency from './lib/models/Agency';
import Booking from './lib/models/Booking';
import Trip from './lib/models/Trip';
import mongoose from 'mongoose';

async function deepSearch() {
    await dbConnect();

    console.log('--- ALL BOOKINGS (PNR, EMAIL, AGENCY) ---');
    const bookings = await Booking.find().populate('tripId');
    for (const b of bookings) {
        const trip = b.tripId as any;
        const agency = trip ? await Agency.findById(trip.agencyId) : null;
        console.log(`PNR: ${b.pnr} | Contact: ${b.contactEmail} | Agency: ${agency?.name} | Seats: ${b.passengers.length} | Status: ${b.status}`);

        if (b.contactEmail.includes('brandon') || (b.passengers && b.passengers.some((p: any) => p.name.toLowerCase().includes('brandon')))) {
            console.log('>> FOUND BRANDON RELATED BOOKING <<');
            console.log(JSON.stringify(b, null, 2));
            if (trip) {
                console.log('>> ASSOCIATED TRIP <<');
                console.log(JSON.stringify(trip, null, 2));
            }
        }
    }

    console.log('\n--- ALL AGENCIES ---');
    const agencies = await Agency.find();
    for (const a of agencies) {
        console.log(`- ${a.name} (${a._id}) | OwnerID: ${a.ownerId}`);
    }

    process.exit(0);
}

deepSearch();
