import dbConnect from './lib/mongo';
import Trip from './lib/models/Trip';

async function checkTypes() {
    await dbConnect();
    const oid = '6983a468e93ca6cab0d6dc30'; // Continental Express

    const trips = await Trip.find({ agencyId: oid }).lean();
    console.log(`Checking ${trips.length} trips...`);

    trips.forEach(t => {
        const arrival = t.arrivalTime;
        const arrivalType = arrival instanceof Date ? 'Date' : typeof arrival;
        console.log(`ID: ${t._id} | Type: ${arrivalType} | Value: ${arrival}`);
    });

    process.exit(0);
}

checkTypes();
