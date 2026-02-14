import dbConnect from './lib/mongo';
import User from './lib/models/User';
import Agency from './lib/models/Agency';
import Booking from './lib/models/Booking';
import Trip from './lib/models/Trip';
import mongoose from 'mongoose';

async function listRaw() {
    await dbConnect();

    console.log('--- ALL BOOKINGS (RAW) ---');
    const bookings = await Booking.find().lean();
    for (const b of bookings) {
        console.log(`PNR: ${b.pnr} | Contact: ${b.contactEmail} | TripID: ${b.tripId} | Seats: ${b.passengers?.length} | Status: ${b.status}`);

        const isBrandon = (b.contactEmail && b.contactEmail.includes('brandon')) ||
            (b.passengers && b.passengers.some((p: any) => p.name.toLowerCase().includes('brandon')));

        if (isBrandon) {
            console.log('>> BRANDON DATA FOUND <<');
            console.log(JSON.stringify(b, null, 2));
        }
    }

    console.log('\n--- ALL TRIPS (RAW) ---');
    const trips = await Trip.find().lean();
    for (const t of trips) {
        console.log(`TripID: ${t._id} | AgencyID: ${t.agencyId} | Status: ${t.status} | Departure: ${t.departureTime}`);
    }

    console.log('\n--- ALL AGENCIES (RAW) ---');
    const agencies = await Agency.find().lean();
    for (const a of agencies) {
        console.log(`AgencyID: ${a._id} | Name: ${a.name} | OwnerID: ${a.ownerId}`);
    }

    process.exit(0);
}

listRaw();
