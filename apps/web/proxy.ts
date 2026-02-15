import { NextResponse, NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    // 1. Check for authentication
    const isAuthPage = pathname === '/login' || pathname === '/register';

    // Protected paths
    const isAdminPath = pathname.startsWith('/admin');
    const isAgencyPath = pathname.startsWith('/agency');
    const isDriverPath = pathname.startsWith('/driver');
    const isUserPath = pathname.startsWith('/orders') || pathname.startsWith('/profile') || pathname.startsWith('/bookings');

    if (!token) {
        // Not logged in
        if (isAdminPath || isAgencyPath || isDriverPath || isUserPath) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    try {
        // 2. Verify token and check roles
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        const userRole = payload.role as string;

        // Prevent logged in users from visiting login/register
        if (isAuthPage) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Route protection based on role
        if (isAdminPath && userRole !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        if (isAgencyPath && userRole !== 'AGENCY_STAFF') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        if (isDriverPath && userRole !== 'DRIVER') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    } catch (error) {
        // Invalid token
        if (isAdminPath || isAgencyPath || isDriverPath || isUserPath) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            return response;
        }
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/agency/:path*',
        '/driver/:path*',
        '/orders/:path*',
        '/profile/:path*',
        '/bookings/:path*',
        '/login',
        '/register'
    ],
};
