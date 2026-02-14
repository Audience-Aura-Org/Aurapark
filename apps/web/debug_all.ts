import dbConnect from './lib/mongo';
import User from './lib/models/User';
import Agency from './lib/models/Agency';
import Booking from './lib/models/Booking';
import Trip from './lib/models/Trip';
import mongoose from 'mongoose';

async function listAll() {
    await dbConnect();

    console.log('--- ALL AGENCIES ---');
    const agencies = await Agency.find();
    for (const a of agencies) {
        const owner = await User.findById(a.ownerId);
        console.log(`Agency: ${a.name} | Owner: ${owner?.email} | ID: ${a._id}`);
    }

    console.log('\n--- RECENT BOOKINGS ---');
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(20);
    for (const b of bookings) {
        const trip = await Trip.findById(b.tripId);
        const agency = trip ? await Agency.findById(trip.agencyId) : null;
        console.log(`PNR: ${b.pnr} | Seats: ${b.passengers.length} | Agency: ${agency?.name} | Status: ${b.status} | Created: ${b.createdAt} | Contact: ${b.contactEmail}`);
    }

    process.exit(0);
}

listAll();
