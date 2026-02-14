import dotenv from 'dotenv';
import path from 'path';

// Manual env load since we're running this script directly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testConnection() {
    // Dynamically import to ensure env vars are loaded first
    const { default: dbConnect } = await import('../lib/mongo.ts');

    console.log('Testing connection to:', process.env.MONGODB_URI);
    try {
        const conn = await dbConnect();
        console.log('✅ Successfully connected to MongoDB!');
        console.log('Database Name:', conn.db?.databaseName);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

testConnection();
