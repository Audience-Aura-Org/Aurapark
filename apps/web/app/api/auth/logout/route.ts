import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
    const response = NextResponse.json({ success: true, message: 'Logged out' });

    // Explicitly destroy the cookie across the entire domain
    response.headers.set('Set-Cookie', serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: -1, // Expire immediately
        path: '/'
    }));

    return response;
}
