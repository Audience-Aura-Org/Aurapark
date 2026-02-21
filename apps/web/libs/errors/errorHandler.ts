/**
 * Error Handler
 * Centralized error response formatting
 */

import { NextResponse } from 'next/server';
import { AppError } from './AppError';

export function handleError(error: any, context?: { route?: string; userId?: string }) {
  console.error('[Error Handler]', error);

  // TODO: Log to Sentry in production (Phase 5)
  // Sentry.captureException(error, { tags: { route }, extra: { userId } });

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.statusCode }
    );
  }

  // Unexpected error
  console.error('[Unexpected Error]', error);
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  );
}

/**
 * Wrapper for route handlers to automatically handle errors
 * Usage: export async function POST(req: Request) { return withErrorHandler(req, handler); }
 */
export function withErrorHandler(
  handler: (req: Request) => Promise<Response>,
  context?: { route?: string }
) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error: any) {
      const userId = req.headers.get('x-user-id');
      return handleError(error, { route: context?.route, userId: userId || undefined });
    }
  };
}
