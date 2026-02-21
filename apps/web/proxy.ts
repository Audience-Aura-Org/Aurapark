import { NextResponse, NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://aurapark-web.vercel.app',
    'https://www.aurapark-web.vercel.app',
];

function handleCors(request: NextRequest, response: NextResponse): NextResponse {
    const origin = request.headers.get('origin');
    const pathname = request.nextUrl.pathname;

    // Add CORS headers for API routes
    if (pathname.startsWith('/api/')) {
        if (origin && ALLOWED_ORIGINS.includes(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-client-id');
            response.headers.set('Access-Control-Allow-Credentials', 'true');
        }
    }

    return response;
}

export default async function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;
    const origin = request.headers.get('origin');

    // Handle CORS preflight requests for API routes
    if (pathname.startsWith('/api/') && request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 204 });
        if (origin && ALLOWED_ORIGINS.includes(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-client-id');
            response.headers.set('Access-Control-Allow-Credentials', 'true');
            response.headers.set('Access-Control-Max-Age', '86400');
        }
        return response;
    }

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
        
        let response = NextResponse.next();
        response = handleCors(request, response);
        return response;
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

        let response = NextResponse.next();
        response = handleCors(request, response);
        return response;
    } catch (error) {
        // Invalid token
        if (isAdminPath || isAgencyPath || isDriverPath || isUserPath) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            return response;
        }
        
        let response = NextResponse.next();
        response = handleCors(request, response);
        return response;
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
