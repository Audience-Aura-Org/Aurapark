import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import User from '@/lib/models/User';
import Agency from '@/lib/models/Agency';
import { verifyToken } from '@/lib/auth';

export async function GET() {
    console.log('[API/ME] GET Request started');
    try {
        let cookieStore;
        try {
            cookieStore = await cookies();
        } catch (cookieErr) {
            console.error('[API/ME] Error getting cookies:', cookieErr);
            return NextResponse.json({ error: 'Cookie Access Error', details: String(cookieErr) }, { status: 500 });
        }

        const tokenToken = cookieStore.get('token');
        const authToken = cookieStore.get('auth_token');
        const token = tokenToken?.value || authToken?.value;

        if (!token) {
            console.log('[API/ME] No token found in cookies');
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.id) {
            console.log('[API/ME] Token verification failed or no ID in token');
            return NextResponse.json({ user: null }, { status: 200 });
        }

        // Validate decoded.id is a valid ObjectId string to prevent Mongoose crash
        if (typeof decoded.id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(decoded.id)) {
            console.warn('[API/ME] Invalid ID format in token:', decoded.id);
            return NextResponse.json({ user: null }, { status: 200 });
        }

        try {
            await dbConnect();
        } catch (dbErr) {
            console.error('[API/ME] Database connection error:', dbErr);
            return NextResponse.json({ error: 'Database Connection Error', details: String(dbErr) }, { status: 500 });
        }

        const user = await User.findById(decoded.id).select('-passwordHash');
        if (!user) {
            console.log('[API/ME] User not found in database for ID:', decoded.id);
            return NextResponse.json({ user: null }, { status: 200 });
        }

        let agency = null;
        try {
            if (user.role === 'AGENCY_STAFF') {
                agency = await Agency.findOne({ ownerId: user._id });
            }
        } catch (agencyError) {
            console.error('[API/ME] Agency lookup failed:', agencyError);
            // Non-critical, continue without agency info
        }

        return NextResponse.json({ user, agency }, { status: 200 });
    } catch (error) {
        console.error('[API/ME] Fatal Auth Me Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
