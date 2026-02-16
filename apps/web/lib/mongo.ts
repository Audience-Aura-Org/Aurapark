import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // In production, we'd throw an error. For setup, we'll warn if missing.
    // throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    console.warn('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    console.log('[DB] Connecting to MongoDB...');
    if (cached.conn) {
        console.log('[DB] Using cached connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
        };

        if (!MONGODB_URI) {
            console.error('[DB] MONGODB_URI is missing!');
            throw new Error("MONGODB_URI is not defined");
        }

        console.log('[DB] Creating new connection promise...');
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('[DB] MongoDB Connected successfully');
            return mongoose.connection;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        console.error('[DB] MongoDB Connection Error:', e);
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
