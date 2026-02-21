import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';

export async function GET() {
    try {
        const response: any = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            checks: {
                database: 'pending',
                mongodb_uri_set: !!process.env.MONGODB_URI,
            },
        };

        // Check database connection
        try {
            await dbConnect();
            response.checks.database = 'connected';
        } catch (dbError: any) {
            response.checks.database = 'failed';
            response.checks.database_error = dbError.message;
            response.status = 'degraded';
        }

        return NextResponse.json(response, {
            status: response.status === 'ok' ? 200 : 503,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                status: 'error',
                message: error.message || 'Health check failed',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
