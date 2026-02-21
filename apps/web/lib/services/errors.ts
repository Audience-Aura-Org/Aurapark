/**
 * Custom error class for application errors
 * Provides structured error handling with status codes and error codes
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: any;
    public readonly cause?: Error;

    constructor(
        message: string,
        statusCode: number = 500,
        options: {
            code?: string;
            details?: any;
            cause?: Error;
        } = {}
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = options.code || this.getDefaultCode(statusCode);
        this.details = options.details;
        this.cause = options.cause;

        // Maintain proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }

    private getDefaultCode(statusCode: number): string {
        const codeMap: Record<number, string> = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'UNPROCESSABLE_ENTITY',
            429: 'RATE_LIMIT_EXCEEDED',
            500: 'INTERNAL_SERVER_ERROR',
            503: 'SERVICE_UNAVAILABLE'
        };

        return codeMap[statusCode] || 'UNKNOWN_ERROR';
    }

    public toJSON() {
        return {
            error: this.message,
            code: this.code,
            statusCode: this.statusCode,
            ...(this.details && { details: this.details })
        };
    }
}

/**
 * Validation error - 400 Bad Request
 */
export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, {
            code: 'VALIDATION_ERROR',
            details
        });
    }
}

/**
 * Authentication error - 401 Unauthorized
 */
export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, {
            code: 'AUTHENTICATION_REQUIRED'
        });
    }
}

/**
 * Authorization error - 403 Forbidden
 */
export class AuthorizationError extends AppError {
    constructor(message: string = 'Access denied') {
        super(message, 403, {
            code: 'FORBIDDEN'
        });
    }
}

/**
 * Not found error - 404 Not Found
 */
export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404, {
            code: 'NOT_FOUND'
        });
    }
}

/**
 * Conflict error - 409 Conflict
 */
export class ConflictError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 409, {
            code: 'CONFLICT',
            details
        });
    }
}

/**
 * Payment error - 402 Payment Required (or 500 for processing errors)
 */
export class PaymentError extends AppError {
    constructor(message: string, statusCode: number = 500, details?: any) {
        super(message, statusCode, {
            code: 'PAYMENT_ERROR',
            details
        });
    }
}

/**
 * Rate limit error - 429 Too Many Requests
 */
export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests', retryAfter?: number) {
        super(message, 429, {
            code: 'RATE_LIMIT_EXCEEDED',
            details: retryAfter ? { retryAfter } : undefined
        });
    }
}
