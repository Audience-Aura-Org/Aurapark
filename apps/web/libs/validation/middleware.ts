/**
 * Validation Middleware
 * Wrapper for validating request payloads with Zod
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidationError } from '@/libs/errors/AppError';

/**
 * Validate request body against a Zod schema
 * @param req - Next.js Request
 * @param schema - Zod schema to validate against
 * @returns [validated_data, error_response] tuple
 */
export async function withValidation<T>(
  req: Request,
  schema: z.ZodSchema
): Promise<[T | null, NextResponse | null]> {
  try {
    const body = await req.json();
    const validated = await schema.parseAsync(body);
    return [validated as T, null];
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = error.flatten();
      const details = Object.fromEntries(
        Object.entries(formatted.fieldErrors).map(([key, messages]: [string, any]) => [
          key,
          messages?.[0] || 'Invalid value'
        ])
      );

      return [
        null,
        NextResponse.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details
          },
          { status: 400 }
        )
      ];
    }

    return [
      null,
      NextResponse.json(
        {
          error: 'Invalid request format',
          code: 'PARSE_ERROR'
        },
        { status: 400 }
      )
    ];
  }
}

/**
 * Parse and validate query parameters
 * @param url - Request URL
 * @param schema - Zod schema to validate against
 * @returns [validated_data, error] tuple
 */
export function validateQuery<T>(url: string, schema: z.ZodSchema): [T | null, Error | null] {
  try {
    const { searchParams } = new URL(url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const validated = schema.parse(queryObj);
    return [validated as T, null];
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues
        .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      return [null, new Error(message)];
    }
    return [null, error as Error];
  }
}
