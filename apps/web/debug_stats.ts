import dbConnect from './lib/mongo';
import User from './lib/models/User';
import Agency from './lib/models/Agency';
import Booking from './lib/models/Booking';
import Trip from './lib/models/Trip';
import mongoose from 'mongoose';

async function debugBookings() {
    await dbConnect();

    // 1. Find the user
    const user = await User.findOne({ email: 'brandonasah11@gmail.com' });
    if (!user) {
        console.log('User not found');
        return;
    }
    console.log('User ID:', user._id);

    // 2. Find the agency
    const agency = await Agency.findOne({ ownerId: user._id });
    if (!agency) {
        console.log('Agency not found for user');
        return;
    }
    console.log('Agency ID:', agency._id);
    console.log('Agency Name:', agency.name);

    // 3. Find all trips for this agency
    const trips = await Trip.find({ agencyId: agency._id });
    const tripIds = trips.map(t => t._id);
    console.log('Total Agency Trips:', trips.length);

    // 4. Find all bookings for these trips
    const bookings = await Booking.find({
        tripId: { $in: tripIds }
    });

    console.log('Total Bookings for this agency:', bookings.length);

    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
    console.log('Confirmed Bookings:', confirmedBookings.length);

    let ticketCount = 0;
    confirmedBookings.forEach(b => {
        ticketCount += b.passengers.length;
    });
    console.log('Confirmed Ticket/Seat Count:', ticketCount);

    // 5. Look for suspicious bookings
    console.log('\nBooking Audit:');
    confirmedBookings.forEach(b => {
        console.log(`- PNR: ${b.pnr}, Status: ${b.status}, Passengers: ${b.passengers.length}, CreatedAt: ${b.createdAt}`);
    });

    process.exit(0);
}

debugBookings();
