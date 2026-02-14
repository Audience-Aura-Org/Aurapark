import dbConnect from './lib/mongo';
import Trip from './lib/models/Trip';
import Agency from './lib/models/Agency';

async function listActive() {
    await dbConnect();
    const oid = '6983a468e93ca6cab0d6dc30'; // Continental Express
    const now = new Date();

    const trips = await Trip.find({
        agencyId: oid,
        status: { $in: ['SCHEDULED', 'EN_ROUTE'] },
        arrivalTime: { $gte: now }
    }).lean();

    console.log(`--- ACTIVE TRIPS FOR CONTINENTAL (${trips.length}) ---`);
    trips.forEach(t => {
        console.log(`ID: ${t._id} | Status: ${t.status} | Departure: ${t.departureTime} | Arrival: ${t.arrivalTime}`);
    });

    const allTrips = await Trip.find({ agencyId: oid }).lean();
    console.log(`\n--- ALL TRIPS FOR CONTINENTAL (${allTrips.length}) ---`);
    allTrips.forEach(t => {
        console.log(`ID: ${t._id} | Status: ${t.status} | Departure: ${t.departureTime} | Arrival: ${t.arrivalTime}`);
    });

    process.exit(0);
}

listActive();
