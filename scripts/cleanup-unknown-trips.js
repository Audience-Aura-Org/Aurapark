/**
 * Cleanup Script: Delete trips with "Unknown" destination
 * 
 * This script identifies and deletes all trips where:
 * - The route name contains "Unknown"
 * - The stops array has "Unknown" as origin or destination
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env.local') });

// Import models - using dynamic require with absolute paths
const Trip = require(path.join(__dirname, '../apps/web/lib/models/Trip.ts'));
const Route = require(path.join(__dirname, '../apps/web/lib/models/Route.ts'));

async function cleanupUnknownTrips() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find trips with Unknown destination
        console.log('🔍 Searching for trips with "Unknown" destination...\n');

        const tripsToDelete = await Trip.find({})
            .populate('routeId')
            .populate('stops');

        const unknownTrips = [];

        for (const trip of tripsToDelete) {
            let hasUnknown = false;

            // Check route name
            if (trip.routeId?.routeName?.includes('Unknown')) {
                hasUnknown = true;
            }

            // Check stops
            if (trip.stops && trip.stops.length > 0) {
                const lastStop = trip.stops[trip.stops.length - 1];
                if (lastStop?.name === 'Unknown' || lastStop?.name?.includes('Unknown')) {
                    hasUnknown = true;
                }
            }

            if (hasUnknown) {
                unknownTrips.push(trip);
                console.log(`📍 Found: Trip ${trip._id}`);
                console.log(`   Route: ${trip.routeId?.routeName || 'N/A'}`);
                console.log(`   Status: ${trip.status}`);
                console.log(`   Departure: ${trip.departureTime}`);
                console.log('');
            }
        }

        if (unknownTrips.length === 0) {
            console.log('✨ No trips with "Unknown" destination found!');
            await mongoose.connection.close();
            return;
        }

        console.log(`\n⚠️  Found ${unknownTrips.length} trip(s) with "Unknown" destination\n`);

        // Delete the trips
        console.log('🗑️  Deleting trips...\n');

        for (const trip of unknownTrips) {
            await Trip.findByIdAndDelete(trip._id);
            console.log(`✅ Deleted trip ${trip._id}`);
        }

        console.log(`\n✨ Successfully deleted ${unknownTrips.length} trip(s)!`);

        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

cleanupUnknownTrips();
