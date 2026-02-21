import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errors';

// TODO: Install isomorphic-dompurify when needed
// import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * TODO: Install isomorphic-dompurify: npm install isomorphic-dompurify
 */
export function sanitizeInput(input: any): any {
    if (typeof input === 'string') {
        // Remove HTML tags and special characters
        return input
            .replace(/[<>]/g, '')
            .trim();
    }

    if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    }

    if (input !== null && typeof input === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(input)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }

    return input;
}

/**
 * Validate and sanitize request body against a Zod schema
 */
export async function validateBody<T extends ZodSchema>(
    request: NextRequest,
    schema: T
): Promise<{ valid: true; data: any } | { valid: false; error: ValidationError }> {
    try {
        const body = await request.json();
        const sanitized = sanitizeInput(body);

        const result = schema.safeParse(sanitized);

        if (!result.success) {
            const errors = result.error.issues.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message
            }));

            return {
                valid: false,
                error: new ValidationError('Validation failed', errors)
            };
        }

        return {
            valid: true,
            data: result.data
        };
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            return {
                valid: false,
                error: new ValidationError('Invalid JSON in request body')
            };
        }

        return {
            valid: false,
            error: new ValidationError('Failed to parse request')
        };
    }
}

/**
 * Validate and sanitize query parameters against a Zod schema
 */
export function validateQuery(
    searchParams: URLSearchParams,
    schema: ZodSchema
): { valid: true; data: any } | { valid: false; error: ValidationError } {
    try {
        const params: Record<string, any> = {};

        for (const [key, value] of searchParams) {
            if (params[key]) {
                if (!Array.isArray(params[key])) {
                    params[key] = [params[key]];
                }
                params[key].push(value);
            } else {
                params[key] = value;
            }
        }

        // Try to parse numeric and boolean values
        const parsed = Object.entries(params).reduce(
            (acc, [key, value]) => {
                if (value === 'true') {
                    acc[key] = true;
                } else if (value === 'false') {
                    acc[key] = false;
                } else if (!isNaN(Number(value)) && value !== '') {
                    acc[key] = Number(value);
                } else {
                    acc[key] = value;
                }
                return acc;
            },
            {} as Record<string, any>
        );

        const sanitized = sanitizeInput(parsed);

        const result = schema.safeParse(sanitized);

        if (!result.success) {
            const errors = result.error.issues.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message
            }));

            return {
                valid: false,
                error: new ValidationError('Query validation failed', errors)
            };
        }

        return {
            valid: true,
            data: result.data
        };
    } catch (error: any) {
        return {
            valid: false,
            error: new ValidationError('Failed to parse query parameters')
        };
    }
}

/**
 * Wrapper function for API route handlers with validation
 * Usage: export const POST = withValidation(handler, bodySchema);
 */
export function withValidation(
    handler: (
        request: NextRequest,
        validatedData: any
    ) => Promise<NextResponse>,
    schema: ZodSchema
) {
    return async (request: NextRequest) => {
        try {
            const validation = await validateBody(request, schema);

            if (!validation.valid) {
                return NextResponse.json(
                    {
                        error: validation.error.message,
                        code: validation.error.code,
                        details: validation.error.details
                    },
                    { status: 400 }
                );
            }

            return await handler(request, validation.data);
        } catch (error: any) {
            console.error('Route handler error:', error);
            return NextResponse.json(
                {
                    error: error.message || 'Internal server error',
                    code: error.code || 'INTERNAL_SERVER_ERROR'
                },
                { status: error.statusCode || 500 }
            );
        }
    };
}

/**
 * Generic error response formatter
 */
export function errorResponse(
    error: any,
    statusCode: number = 500
): NextResponse {
    const response = {
        error: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_SERVER_ERROR',
        ...(error.details && { details: error.details })
    };

    return NextResponse.json(response, { status: statusCode });
}

/**
 * Success response formatter
 */
export function successResponse(
    data: any,
    statusCode: number = 200,
    message?: string
): NextResponse {
    const response = {
        ...(message && { message }),
        data
    };

    return NextResponse.json(response, { status: statusCode });
}
