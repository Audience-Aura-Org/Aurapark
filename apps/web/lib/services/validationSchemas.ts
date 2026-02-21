import { z } from 'zod';

/**
 * Authentication Schemas
 */
export const LoginSchema = z.object({
    email: z
        .string()
        .email('Invalid email address')
        .toLowerCase(),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
    email: z
        .string()
        .email('Invalid email address')
        .toLowerCase(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
    fullName: z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must be less than 100 characters'),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    role: z
        .enum(['USER', 'AGENCY', 'DRIVER'])
        .default('USER')
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

/**
 * Trip Search Schemas
 */
export const SearchTripsSchema = z.object({
    fromCity: z.string().min(1, 'Origin city required'),
    toCity: z.string().min(1, 'Destination city required'),
    departureDate: z.string().datetime('Invalid date format'),
    returnDate: z.string().datetime('Invalid date format').optional(),
    passengers: z
        .number()
        .min(1, 'At least 1 passenger required')
        .max(10, 'Maximum 10 passengers allowed'),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20)
});

export type SearchTripsInput = z.infer<typeof SearchTripsSchema>;

/**
 * Seat Reservation Schemas
 */
export const ReserveSeatsSchema = z.object({
    tripId: z.string().min(24, 'Invalid trip ID'),
    seatNumbers: z
        .array(z.string())
        .min(1, 'At least one seat must be selected')
        .max(10, 'Maximum 10 seats can be reserved'),
    holdDurationMinutes: z
        .number()
        .min(5, 'Hold duration must be at least 5 minutes')
        .max(120, 'Hold duration cannot exceed 120 minutes')
        .optional()
        .default(15)
});

export type ReserveSeatsInput = z.infer<typeof ReserveSeatsSchema>;

/**
 * Booking Schemas
 */
export const PassengerSchema = z.object({
    name: z
        .string()
        .min(2, 'Passenger name must be at least 2 characters')
        .max(100, 'Passenger name must be less than 100 characters'),
    age: z
        .number()
        .min(1, 'Age must be at least 1')
        .max(150, 'Invalid age'),
    gender: z
        .enum(['MALE', 'FEMALE', 'OTHER'])
        .optional(),
    seatNumber: z.string()
});

export type PassengerInput = z.infer<typeof PassengerSchema>;

export const CreateBookingSchema = z.object({
    tripId: z.string().min(24, 'Invalid trip ID'),
    passengers: z
        .array(PassengerSchema)
        .min(1, 'At least one passenger required'),
    contactEmail: z
        .string()
        .email('Invalid email address'),
    contactPhone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    seatLockId: z.string().min(24, 'Invalid seat lock ID').optional()
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const CancelBookingSchema = z.object({
    bookingId: z.string().min(24, 'Invalid booking ID'),
    reason: z
        .string()
        .min(10, 'Cancellation reason must be at least 10 characters')
        .optional()
});

export type CancelBookingInput = z.infer<typeof CancelBookingSchema>;

export const ManualBookingSchema = z.object({
    tripId: z.string().min(24, 'Invalid trip ID'),
    passengers: z
        .array(PassengerSchema)
        .min(1, 'At least one passenger required'),
    totalAmount: z
        .number()
        .positive('Amount must be greater than 0'),
    paymentMethod: z
        .enum(['CASH', 'CARD', 'TRANSFER', 'MOBILE_MONEY'])
        .default('CASH'),
    contactEmail: z
        .string()
        .email('Invalid email address'),
    contactPhone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    notes: z.string().optional()
});

export type ManualBookingInput = z.infer<typeof ManualBookingSchema>;

/**
 * Payment Schemas
 */
export const InitiatePaymentSchema = z.object({
    bookingId: z.string().min(24, 'Invalid booking ID'),
    amount: z
        .number()
        .positive('Amount must be greater than 0'),
    paymentMethod: z
        .enum(['CARD', 'MOBILE_MONEY', 'BANK_TRANSFER'])
        .default('CARD'),
    idempotencyKey: z
        .string()
        .uuid('Invalid idempotency key')
        .optional()
});

export type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;

export const PaymentCallbackSchema = z.object({
    transactionId: z.string(),
    reference: z.string(),
    status: z.enum(['success', 'pending', 'failed']),
    amount: z.number().positive(),
    currency: z.string().default('XAF'),
    customerEmail: z.string().email().optional(),
    signature: z.string()
});

export type PaymentCallbackInput = z.infer<typeof PaymentCallbackSchema>;

export const PaymentStatusSchema = z.object({
    transactionId: z.string().min(1, 'Transaction ID required')
});

export type PaymentStatusInput = z.infer<typeof PaymentStatusSchema>;

/**
 * Dispute Schemas
 */
export const CreateDisputeSchema = z.object({
    bookingId: z.string().min(24, 'Invalid booking ID'),
    subject: z
        .string()
        .min(5, 'Subject must be at least 5 characters')
        .max(200, 'Subject must be less than 200 characters'),
    description: z
        .string()
        .min(20, 'Description must be at least 20 characters')
        .max(5000, 'Description must be less than 5000 characters'),
    category: z
        .enum(['PAYMENT', 'CANCELLATION', 'NO_SHOW', 'SERVICE_ISSUE', 'OTHER'])
        .default('OTHER')
});

export type CreateDisputeInput = z.infer<typeof CreateDisputeSchema>;

/**
 * Review Schemas
 */
export const CreateReviewSchema = z.object({
    tripId: z.string().min(24, 'Invalid trip ID'),
    agencyId: z.string().min(24, 'Invalid agency ID'),
    rating: z
        .number()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5'),
    comment: z
        .string()
        .max(5000, 'Comment must be less than 5000 characters')
        .optional(),
    categories: z
        .object({
            comfort: z.number().min(1).max(5).optional(),
            driver: z.number().min(1).max(5).optional(),
            punctuality: z.number().min(1).max(5).optional(),
            cleanliness: z.number().min(1).max(5).optional()
        })
        .optional()
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

/**
 * Route & Stop Schemas
 */
export const CreateStopSchema = z.object({
    name: z
        .string()
        .min(2, 'Stop name must be at least 2 characters')
        .max(100, 'Stop name must be less than 100 characters'),
    city: z.string().min(1, 'City required'),
    latitude: z.number().min(-90).max(90, 'Invalid latitude'),
    longitude: z.number().min(-180).max(180, 'Invalid longitude'),
    description: z.string().optional()
});

export type CreateStopInput = z.infer<typeof CreateStopSchema>;

export const CreateRouteSchema = z.object({
    name: z
        .string()
        .min(3, 'Route name must be at least 3 characters')
        .max(200, 'Route name must be less than 200 characters'),
    fromStopId: z.string().min(24, 'Invalid stop ID'),
    toStopId: z.string().min(24, 'Invalid stop ID'),
    stops: z
        .array(z.string().min(24))
        .min(2, 'Route must have at least 2 stops'),
    distance: z.number().positive('Distance must be greater than 0').optional(),
    estimatedDuration: z.number().positive('Duration must be greater than 0').optional(),
    basePrice: z.number().positive('Price must be greater than 0')
});

export type CreateRouteInput = z.infer<typeof CreateRouteSchema>;

/**
 * Support Ticket Schemas
 */
export const CreateSupportTicketSchema = z.object({
    subject: z
        .string()
        .min(5, 'Subject must be at least 5 characters')
        .max(200, 'Subject must be less than 200 characters'),
    description: z
        .string()
        .min(20, 'Description must be at least 20 characters')
        .max(5000, 'Description must be less than 5000 characters'),
    category: z
        .enum(['BOOKING', 'PAYMENT', 'TECHNICAL', 'GENERAL', 'COMPLAINT'])
        .default('GENERAL'),
    priority: z
        .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
        .default('MEDIUM'),
    attachments: z.string().array().optional()
});

export type CreateSupportTicketInput = z.infer<typeof CreateSupportTicketSchema>;

/**
 * Pagination Schemas
 */
export const PaginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['ASC', 'DESC']).default('DESC')
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

/**
 * Filter Schemas
 */
export const TripFilterSchema = z.object({
    status: z
        .array(z.string())
        .optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    rating: z.number().min(0).max(5).optional(),
    availableSeatsMin: z.number().min(1).optional(),
    departureTimeRange: z
        .object({
            start: z.string().datetime().optional(),
            end: z.string().datetime().optional()
        })
        .optional()
});

export type TripFilterInput = z.infer<typeof TripFilterSchema>;

/**
 * Agency Schemas
 */
export const UpdateAgencyProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Agency name must be at least 2 characters')
        .max(200, 'Agency name must be less than 200 characters')
        .optional(),
    registrationNumber: z.string().optional(),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
        .optional(),
    email: z.string().email('Invalid email').optional(),
    description: z.string().max(5000, 'Description too long').optional(),
    logo: z.string().url('Invalid URL').optional(),
    website: z.string().url('Invalid URL').optional()
});

export type UpdateAgencyProfileInput = z.infer<typeof UpdateAgencyProfileSchema>;
