import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../apps/web/.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
}

// Schemas
const UserSchema = new mongoose.Schema({ email: String, role: String, name: String, passwordHash: String, phoneVerified: Boolean }, { strict: false });
const AgencySchema = new mongoose.Schema({ name: String, ownerId: mongoose.Types.ObjectId, status: String, trustScore: Number }, { strict: false });
const BusSchema = new mongoose.Schema({ busNumber: String, agencyId: mongoose.Types.ObjectId, seatMap: Object, capacity: Number }, { strict: false });
const StopSchema = new mongoose.Schema({ name: String, agencyId: mongoose.Types.ObjectId, coordinates: Object }, { strict: false });
const RouteSchema = new mongoose.Schema({ routeName: String, agencyId: mongoose.Types.ObjectId, stops: Array }, { strict: false });
const TripSchema = new mongoose.Schema({ agencyId: mongoose.Types.ObjectId, routeId: mongoose.Types.ObjectId, busId: mongoose.Types.ObjectId, departureTime: Date, arrivalTime: Date, status: String, basePrice: Number, availableSeats: Array }, { strict: false });
const BookingSchema = new mongoose.Schema({ userId: mongoose.Types.ObjectId, tripId: mongoose.Types.ObjectId, pnr: String, totalAmount: Number, status: String, passengers: Array, contactEmail: String, contactPhone: String }, { strict: false, timestamps: true }); // Enable timestamps for real analytics
const ReviewSchema = new mongoose.Schema({ userId: mongoose.Types.ObjectId, tripId: mongoose.Types.ObjectId, agencyId: mongoose.Types.ObjectId, rating: Number, comment: String }, { strict: false, timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Agency = mongoose.models.Agency || mongoose.model('Agency', AgencySchema);
const Bus = mongoose.models.Bus || mongoose.model('Bus', BusSchema);
const Stop = mongoose.models.Stop || mongoose.model('Stop', StopSchema);
const Route = mongoose.models.Route || mongoose.model('Route', RouteSchema);
const Trip = mongoose.models.Trip || mongoose.model('Trip', TripSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected.');

        // --- USERS ---
        console.log('Seeding Users...');
        const passwordHash = await bcrypt.hash('password123', 12);

        const users = [
            { name: 'Admin Zero', email: 'admin@system.com', role: 'ADMIN' },
            { name: 'Sarah Connor', email: 'agency@continental.com', role: 'AGENCY_STAFF' },
            { name: 'John Wick', email: 'agency@oceanlines.com', role: 'AGENCY_STAFF' },
            { name: 'Driver Joe', email: 'driver@continental.com', role: 'DRIVER' },
            { name: 'Driver Mike', email: 'driver@oceanlines.com', role: 'DRIVER' },
            { name: 'Alice Traveler', email: 'alice@test.com', role: 'USER' },
            { name: 'Bob Commuter', email: 'bob@test.com', role: 'USER' },
            { name: 'Charlie Hopper', email: 'charlie@test.com', role: 'USER' }
        ];

        const userDocs: Record<string, any> = {};

        for (const u of users) {
            let doc = await User.findOne({ email: u.email });
            if (!doc) {
                doc = await User.create({ ...u, passwordHash, phoneVerified: true });
            }
            userDocs[u.email] = doc;
        }

        // --- AGENCIES ---
        console.log('Seeding Agencies...');
        const agenciesData = [
            { name: 'Continental Express', email: 'agency@continental.com', trust: 92, status: 'ACTIVE' },
            { name: 'Ocean Lines', email: 'agency@oceanlines.com', trust: 85, status: 'ACTIVE' },
            { name: 'Swift Travel', email: 'ops@swift.com', trust: 78, status: 'PENDING' } // No user owner for this one in this script simplicity
        ];

        const agencyDocs: Record<string, any> = {};

        for (const a of agenciesData) {
            if (!userDocs[a.email] && a.status !== 'PENDING') continue; // Skip if owner not created above

            // For Swift Travel, assign to Admin temporarily just for existence
            const ownerId = userDocs[a.email]?._id || userDocs['admin@system.com']._id;

            let doc = await Agency.findOne({ name: a.name });
            if (!doc) {
                doc = await Agency.create({
                    name: a.name,
                    ownerId: ownerId,
                    email: a.email || 'info@agency.com',
                    phone: '+1 555-0100',
                    status: a.status,
                    trustScore: a.trust
                });
            }
            agencyDocs[a.name] = doc;
        }

        // --- BUSES ---
        console.log('Seeding Fleet...');
        const fleetConfig = [
            { agency: 'Continental Express', number: 'CON-101', seats: 40 },
            { agency: 'Continental Express', number: 'CON-102', seats: 24 },
            { agency: 'Ocean Lines', number: 'OCN-88', seats: 50 },
            { agency: 'Ocean Lines', number: 'OCN-99', seats: 30 }
        ];

        const busDocs: any[] = [];

        for (const f of fleetConfig) {
            const agency = agencyDocs[f.agency];
            if (!agency) continue;

            let bus = await Bus.findOne({ busNumber: f.number, agencyId: agency._id });
            if (!bus) {
                const seatList = [];
                // Simple grid logic
                const rows = Math.ceil(f.seats / 4);
                for (let r = 1; r <= rows; r++) {
                    for (let c = 1; c <= 4; c++) {
                        if (seatList.length < f.seats) {
                            seatList.push({ seatNumber: `${r}${String.fromCharCode(64 + c)}`, isAvailable: true, type: 'STANDARD', row: r, column: c });
                        }
                    }
                }

                bus = await Bus.create({
                    busNumber: f.number,
                    agencyId: agency._id,
                    capacity: f.seats,
                    seatMap: { rows, columns: 4, seats: seatList },
                    isActive: true
                });
            }
            busDocs.push(bus);
        }

        // --- STOPS & ROUTES ---
        console.log('Seeding Routes...');
        // Define Locations
        const locations = [
            { city: 'New York', lat: 40.7128, lng: -74.0060 },
            { city: 'Boston', lat: 42.3601, lng: -71.0589 },
            { city: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
            { city: 'Washington DC', lat: 38.9072, lng: -77.0369 }
        ];

        const stops: any[] = [];
        for (const loc of locations) {
            // Continental Stops
            let s1 = await Stop.findOne({ name: `${loc.city} Central`, agencyId: agencyDocs['Continental Express']._id });
            if (!s1) s1 = await Stop.create({ name: `${loc.city} Central`, agencyId: agencyDocs['Continental Express']._id, coordinates: { latitude: loc.lat, longitude: loc.lng } });
            stops.push(s1);

            // Ocean Stops
            let s2 = await Stop.findOne({ name: `${loc.city} Harbor`, agencyId: agencyDocs['Ocean Lines']._id });
            if (!s2) s2 = await Stop.create({ name: `${loc.city} Harbor`, agencyId: agencyDocs['Ocean Lines']._id, coordinates: { latitude: loc.lat + 0.01, longitude: loc.lng + 0.01 } });
            stops.push(s2);
        }

        // Routes
        // Continental: NY -> Philly -> DC
        const route1 = await createRoute('Northeast Corridor', 'Continental Express', [`New York Central`, `Philadelphia Central`, `Washington DC Central`]);
        // Ocean: Boston -> NY
        const route2 = await createRoute('Coastal Link', 'Ocean Lines', [`Boston Harbor`, `New York Harbor`]);


        // --- TRIPS (Past & Future) ---
        console.log('Scheduling Trips...');
        const tripsToCreate = [];
        const now = new Date();

        // 5 Past Trips (for analytics)
        for (let i = 1; i <= 5; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            tripsToCreate.push({ route: route1, busIndex: 0, dep: date, price: 45, status: 'COMPLETED' });
        }

        // 10 Future Trips
        for (let i = 0; i < 5; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            date.setHours(8, 0, 0, 0); // 8 AM
            tripsToCreate.push({ route: route1, busIndex: 1, dep: new Date(date), price: 50, status: 'SCHEDULED' });

            date.setHours(14, 0, 0, 0); // 2 PM
            tripsToCreate.push({ route: route2, busIndex: 2, dep: new Date(date), price: 35, status: 'SCHEDULED' });
        }

        const tripDocs = [];
        for (const t of tripsToCreate) {
            if (!t.route) continue;
            const arr = new Date(t.dep);
            arr.setHours(arr.getHours() + 4); // 4 hour trip

            // Find bus by agency
            const bus = await Bus.findOne({ agencyId: t.route.agencyId }); // Just grab first bus of agency

            let trip = await Trip.create({
                routeId: t.route._id,
                busId: bus._id,
                agencyId: t.route.agencyId,
                departureTime: t.dep,
                arrivalTime: arr,
                status: t.status,
                basePrice: t.price,
                availableSeats: bus.seatMap.seats.map((s: any) => s.seatNumber)
            });
            tripDocs.push(trip);
        }

        // --- BOOKINGS & REVIEWS ---
        console.log('Generating Traffic...');
        const passengers = [userDocs['alice@test.com'], userDocs['bob@test.com'], userDocs['charlie@test.com']];

        for (const trip of tripDocs) {
            // Randomly book 0-3 seats
            const numBookings = Math.floor(Math.random() * 4);
            const isPast = trip.status === 'COMPLETED';

            for (let i = 0; i < numBookings; i++) {
                if (i >= passengers.length) break;
                const user = passengers[i];
                if (!user) continue;

                // Take a seat
                const seat = trip.availableSeats.pop();
                if (!seat) break;
                await trip.save();

                // Create Booking
                const booking = await Booking.create({
                    userId: user._id,
                    tripId: trip._id,
                    pnr: `PNR-${Math.random().toString(36).substring(7).toUpperCase()}`,
                    totalAmount: trip.basePrice,
                    status: 'CONFIRMED',
                    paymentStatus: 'PAID',
                    passengers: [{
                        name: user.name,
                        age: 25 + i,
                        gender: 'other',
                        seatNumber: seat,
                        ticketNumber: `TIX-${Math.random().toString(36).substring(7).toUpperCase()}`,
                        checkedIn: isPast // Auto check-in only past trips
                    }],
                    contactEmail: user.email,
                    contactPhone: '+1 555 0000',
                    createdAt: trip.departureTime, // Backdate booking to trip time
                    updatedAt: trip.departureTime
                });

                // Add Review if past
                if (isPast && Math.random() > 0.5) {
                    await Review.create({
                        userId: user._id,
                        tripId: trip._id,
                        agencyId: trip.agencyId,
                        rating: 3 + Math.floor(Math.random() * 3), // 3-5 stars
                        comment: ['Great ride!', 'Comfortable but late.', 'Amazing service!', 'Clean bus.'][Math.floor(Math.random() * 4)],
                        createdAt: new Date(trip.departureTime.getTime() + 86400000)
                    });
                }
            }
        }

        async function createRoute(name: string, agencyName: string, stopNames: string[]) {
            const agency = agencyDocs[agencyName];
            if (!agency) return null;

            const routeStops = [];
            for (const sName of stopNames) {
                const stop = await Stop.findOne({ name: sName, agencyId: agency._id });
                if (stop) routeStops.push(stop._id);
            }

            let route = await Route.findOne({ routeName: name, agencyId: agency._id });
            if (!route) {
                route = await Route.create({
                    routeName: name,
                    agencyId: agency._id,
                    stops: routeStops,
                    isActive: true
                });
            }
            return route;
        }

        console.log('Mega Seed Complete. The platform is now buzzing with activity.');

    } catch (error) {
        console.error('Seeding Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
