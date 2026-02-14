import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from apps/web/.env.local
dotenv.config({ path: path.join(__dirname, '../apps/web/.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

// User Schema (Simplified for seeding)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String },
    phoneVerified: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const sampleUsers = [
    {
        name: 'System Administrator',
        email: 'admin@busapp.io',
        password: 'password123',
        role: 'ADMIN',
        phone: '+1000000000'
    },
    {
        name: 'Agency Manager',
        email: 'agency@continental.com',
        password: 'password123',
        role: 'AGENCY_STAFF',
        phone: '+1111111111'
    },
    {
        name: 'Fleet Driver',
        email: 'driver@transit.net',
        password: 'password123',
        role: 'DRIVER',
        phone: '+1222222222'
    },
    {
        name: 'Regular Passenger',
        email: 'passenger@travel.com',
        password: 'password123',
        role: 'USER',
        phone: '+1333333333'
    }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected.');

        for (const u of sampleUsers) {
            const existingUser = await User.findOne({ email: u.email });
            if (existingUser) {
                console.log(`User ${u.email} already exists. Skipping.`);
                continue;
            }

            console.log(`Creating user: ${u.email} [${u.role}]`);
            const passwordHash = await bcrypt.hash(u.password, 10);

            await User.create({
                name: u.name,
                email: u.email,
                passwordHash,
                role: u.role,
                phone: u.phone,
                phoneVerified: true
            });
        }

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
