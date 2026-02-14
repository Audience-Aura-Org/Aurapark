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

// Minimal Schemas for seeding
const UserSchema = new mongoose.Schema({ email: String, role: String, name: String }, { strict: false });
const AgencySchema = new mongoose.Schema({ name: String, ownerId: mongoose.Types.ObjectId }, { strict: false });
const BusSchema = new mongoose.Schema({ busNumber: String, agencyId: mongoose.Types.ObjectId, seatMap: Object }, { strict: false });
const StopSchema = new mongoose.Schema({ name: String, agencyId: mongoose.Types.ObjectId }, { strict: false });
const RouteSchema = new mongoose.Schema({ routeName: String, agencyId: mongoose.Types.ObjectId, stops: Array }, { strict: false });
const TripSchema = new mongoose.Schema({ agencyId: mongoose.Types.ObjectId, routeId: mongoose.Types.ObjectId, busId: mongoose.Types.ObjectId }, { strict: false });
const BookingSchema = new mongoose.Schema({ userId: mongoose.Types.ObjectId, tripId: mongoose.Types.ObjectId }, { strict: false });
const ReviewSchema = new mongoose.Schema({ userId: mongoose.Types.ObjectId, agencyId: mongoose.Types.ObjectId, rating: Number }, { strict: false });

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

        // 1. Find Agency Owner
        const agencyUser = await User.findOne({ email: 'agency@continental.com' });
        if (!agencyUser) throw new Error('Agency user not found. Run seed-users.ts first.');

        const driverUser = await User.findOne({ email: 'driver@transit.net' });
        const passengerUser = await User.findOne({ email: 'passenger@travel.com' });

        // 2. Create Agency
        console.log('Creating Agency...');
        let continental = await Agency.findOne({ ownerId: agencyUser._id });
        if (!continental) {
            continental = await Agency.create({
                name: 'Continental Express',
                email: 'ops@continental.com',
                phone: '+1 800-TRANSIT',
                address: 'Sector 7, Transit Hub',
                status: 'ACTIVE',
                trustScore: 88,
                ownerId: agencyUser._id,
                settings: {
                    pricingRules: { platformFeePercentage: 10, allowDynamicPricing: true },
                    tripOverrides: { allowManualBooking: true }
                }
            });
        }

        // 3. Create Buses
        console.log('Creating Fleet...');
        const busesData = [
            { number: 'BUS-A101', seats: 40, rows: 10, cols: 4 },
            { number: 'BUS-G502', seats: 24, rows: 6, cols: 4 }
        ];

        const buses = [];
        for (const b of busesData) {
            let bus = await Bus.findOne({ busNumber: b.number, agencyId: continental._id });
            if (!bus) {
                const seatList = [];
                for (let r = 1; r <= b.rows; r++) {
                    for (let c = 1; c <= b.cols; c++) {
                        seatList.push({
                            seatNumber: `${String.fromCharCode(64 + c)}${r}`,
                            type: 'STANDARD',
                            row: r,
                            column: c,
                            isAvailable: true
                        });
                    }
                }
                bus = await Bus.create({
                    busNumber: b.number,
                    agencyId: continental._id,
                    capacity: b.seats,
                    seatMap: { rows: b.rows, columns: b.cols, seats: seatList },
                    amenities: ['WiFi', 'Air Conditioning', 'USB Ports', 'Comfort Seats'],
                    isActive: true
                });
            }
            buses.push(bus);
        }

        // 4. Create Stops
        console.log('Mapping Stops...');
        const stopsData = [
            { name: 'Central Terminal', lat: 40.7128, lng: -74.0060 },
            { name: 'East Corridor P7', lat: 40.7306, lng: -73.9352 },
            { name: 'Northern Gateway', lat: 40.7589, lng: -73.9851 }
        ];

        const stops = [];
        for (const s of stopsData) {
            let stop = await Stop.findOne({ name: s.name, agencyId: continental._id });
            if (!stop) {
                stop = await Stop.create({
                    name: s.name,
                    agencyId: continental._id,
                    coordinates: { latitude: s.lat, longitude: s.lng },
                    pickupPoints: [{ name: 'Main Gate', description: 'Under the digital clock' }]
                });
            }
            stops.push(stop);
        }

        // 5. Create Route
        console.log('Establishing Routes...');
        let mainRoute = await Route.findOne({ routeName: 'Express Alpha (Central-North)', agencyId: continental._id });
        if (!mainRoute) {
            mainRoute = await Route.create({
                routeName: 'Express Alpha (Central-North)',
                agencyId: continental._id,
                stops: [stops[0]._id, stops[1]._id, stops[2]._id],
                isActive: true
            });
        }

        // 6. Create Trips
        console.log('Scheduling Trips...');
        const now = new Date();
        const tripsData = [
            { dep: new Date(now.getTime() + 3600000), arr: new Date(now.getTime() + 7200000), price: 45 },
            { dep: new Date(now.getTime() + 86400000), arr: new Date(now.getTime() + 90000000), price: 55 }
        ];

        for (const t of tripsData) {
            const trip = await Trip.create({
                routeId: mainRoute._id,
                busId: buses[0]._id,
                driverId: driverUser?._id,
                agencyId: continental._id,
                departureTime: t.dep,
                arrivalTime: t.arr,
                status: 'SCHEDULED',
                basePrice: t.price,
                availableSeats: buses[0].seatMap.seats.map((s: any) => s.seatNumber)
            });

            // If it's the past trip (simulation), add a booking
            if (t.dep < now && passengerUser) {
                await Booking.create({
                    userId: passengerUser._id,
                    tripId: trip._id,
                    pnr: 'CONF-SIM-001',
                    totalAmount: t.price,
                    status: 'CONFIRMED'
                });

                await Review.create({
                    userId: passengerUser._id,
                    tripId: trip._id,
                    agencyId: continental._id,
                    rating: 5,
                    comment: 'Exceptional service, true glassmorphism comfort.'
                });
            }
        }

        console.log('Full data seeding completed successfully.');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
