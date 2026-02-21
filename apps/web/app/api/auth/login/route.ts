import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import User from '@/lib/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';
import { serialize } from 'cookie';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // If agency staff, find their agencyId
        let agencyId = null;
        if (user.role === 'AGENCY_STAFF') {
            try {
                const Agency = (await import('@/lib/models/Agency')).default;
                const agency = await Agency.findOne({ ownerId: user._id });
                if (agency) {
                    agencyId = agency._id.toString();
                }
            } catch (agencyError) {
                console.warn('Warning: Could not fetch agency info:', agencyError);
                // Continue without agency info
            }
        }

        const token = generateToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            agencyId: agencyId // Now included in the token
        });

        // Create HttpOnly Cookie
        const cookie = serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Relaxed for better compatibility
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
        });

        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        response.headers.set('Set-Cookie', cookie);

        return response;

    } catch (error: any) {
        console.error('Login error:', error.message || error);
        
        // Provide more specific error messages
        if (error.message?.includes('connect')) {
            return NextResponse.json(
                { error: 'Database connection failed. Please try again.' },
                { status: 503 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal Server Error', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
            { status: 500 }
        );
    }
}
