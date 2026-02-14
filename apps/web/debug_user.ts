import dbConnect from './lib/mongo';
import User from './lib/models/User';
import Agency from './lib/models/Agency';
import Booking from './lib/models/Booking';
import Trip from './lib/models/Trip';
import mongoose from 'mongoose';

async function findUser() {
    await dbConnect();

    console.log('Searching for users with brandon in email...');
    const users = await User.find({ email: /brandon/i });
    users.forEach(u => console.log(`- ${u.email} (Role: ${u.role}, ID: ${u._id})`));

    if (users.length > 0) {
        for (const user of users) {
            const agency = await Agency.findOne({ ownerId: user._id });
            if (agency) {
                console.log(`\nAgency found for ${user.email}:`);
                console.log(`- Name: ${agency.name}, ID: ${agency._id}`);

                const trips = await Trip.find({ agencyId: agency._id });
                console.log(`- Total Trips: ${trips.length}`);

                const activeTrips = trips.filter(t => ['SCHEDULED', 'EN_ROUTE'].includes(t.status));
                console.log(`- Active Trips: ${activeTrips.length}`);
                activeTrips.forEach(t => {
                    console.log(`  * Trip ID: ${t._id}, Status: ${t.status}, Departure: ${t.departureTime}`);
                });

                const bookIds = trips.map(t => t._id);
                const bookings = await Booking.find({ tripId: { $in: bookIds }, status: 'CONFIRMED' });
                console.log(`- Total Confirmed Bookings: ${bookings.length}`);

                let seatCount = 0;
                bookings.forEach(b => {
                    seatCount += b.passengers.length;
                    console.log(`  * PNR: ${b.pnr}, Seats: ${b.passengers.length}, TripID: ${b.tripId}`);
                });
                console.log(`- Total Seats Booked: ${seatCount}`);
            }
        }
    } else {
        console.log('No users found with brandon in email.');
        // Try searching all agencies
        const agencies = await Agency.find().limit(10);
        console.log('\nLast 10 agencies:');
        agencies.forEach(a => console.log(`- ${a.name} (${a.email})`));
    }

    process.exit(0);
}

findUser();
