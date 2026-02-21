/**
 * Zod Validation Schemas
 * Centralized validation for all API endpoints
 */

import { z } from 'zod';

/**
 * Authentication Schemas
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
});

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  role: z.enum(['USER', 'AGENCY_STAFF', 'DRIVER']).optional()
});

/**
 * Trip & Search Schemas
 */
export const SearchTripsSchema = z.object({
  from: z.string().min(2, 'Departure required').trim(),
  to: z.string().min(2, 'Destination required').trim(),
  date: z
    .string()
    .datetime('Invalid date format')
    .refine((d) => new Date(d) > new Date(), 'Date must be in the future'),
  passengers: z
    .number()
    .int('Must be whole number')
    .min(1, 'At least 1 passenger')
    .max(10, 'Maximum 10 passengers'),
  return_date: z.string().datetime().optional(),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional()
});

export const CreateTripSchema = z.object({
  routeId: z.string().uuid('Invalid route ID'),
  busId: z.string().uuid('Invalid bus ID'),
  driverId: z.string().uuid('Invalid driver ID').optional(),
  departureTime: z.string().datetime('Invalid departure time'),
  arrivalTime: z.string().datetime('Invalid arrival time'),
  basePrice: z
    .number()
    .positive('Price must be positive')
    .max(1000000, 'Price too high'),
  stops: z
    .array(
      z.object({
        stopId: z.string().uuid(),
        name: z.string().min(1),
        arrivalTime: z.string().datetime().optional(),
        departureTime: z.string().datetime().optional(),
        price: z.number().positive().optional()
      })
    )
    .optional()
});

/**
 * Booking Schemas
 */
export const ReserveSeatsSchema = z.object({
  tripId: z.string().uuid('Invalid trip ID'),
  seatNumbers: z
    .array(z.string().min(1, 'Invalid seat'))
    .min(1, 'At least 1 seat required')
    .max(10, 'Maximum 10 seats'),
  passengers: z
    .array(
      z.object({
        name: z.string().min(2, 'Name too short').max(100, 'Name too long'),
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone'),
        email: z.string().email('Invalid email').optional(),
        age: z.number().int().min(1, 'Invalid age').max(150, 'Invalid age'),
        gender: z.enum(['M', 'F', 'O']).optional()
      })
    )
    .min(1, 'At least 1 passenger'),
  idempotencyKey: z.string().uuid('Invalid idempotency key')
});

export const CreateBookingSchema = z.object({
  tripId: z.string().uuid('Invalid trip ID'),
  seatLockId: z.string('Lock ID required'),
  passengers: z
    .array(
      z.object({
        name: z.string().min(2).max(100),
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
        email: z.string().email().optional(),
        age: z.number().int().min(1).max(150),
        gender: z.enum(['M', 'F', 'O']).optional()
      })
    )
    .min(1),
  idempotencyKey: z.string().uuid()
});

export const CancelBookingSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  reason: z.string().min(5, 'Please provide a reason').max(500, 'Reason too long').optional()
});

export const ManualBookingSchema = z.object({
  tripId: z.string().uuid('Invalid trip ID'),
  seatNumber: z.string().min(1, 'Invalid seat'),
  passengerName: z.string().min(2, 'Name too short').max(100, 'Name too long'),
  passengerPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone'),
  passengerAge: z.number().int().min(1).max(150).optional(),
  reason: z.string().max(500, 'Reason too long').optional()
});

/**
 * Payment Schemas
 */
export const InitiatePaymentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('XAF'),
  idempotencyKey: z.string().uuid('Invalid idempotency key')
});

export const PaymentCallbackSchema = z.object({
  status: z.enum(['successful', 'pending', 'failed']),
  reference: z.string(),
  transactionId: z.string(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  customer: z
    .object({
      email: z.string().email().optional(),
      phone_number: z.string().optional(),
      name: z.string().optional()
    })
    .optional()
});

/**
 * Dispute Schemas
 */
export const CreateDisputeSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  category: z.enum([
    'PAYMENT_ISSUE',
    'NO_SHOW',
    'SEAT_ISSUE',
    'SAFETY_CONCERN',
    'OTHER'
  ]),
  description: z.string().min(10, 'Description too short').max(1000, 'Description too long'),
  evidence: z.array(z.string().url()).optional()
});

/**
 * Review Schemas
 */
export const CreateReviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be 1-5')
    .max(5, 'Rating must be 1-5'),
  comment: z.string().min(5, 'Comment too short').max(500, 'Comment too long').optional(),
  categories: z
    .object({
      cleanliness: z.number().int().min(1).max(5).optional(),
      driver_behavior: z.number().int().min(1).max(5).optional(),
      punctuality: z.number().int().min(1).max(5).optional(),
      vehicle_condition: z.number().int().min(1).max(5).optional()
    })
    .optional()
});

/**
 * Route & Stop Schemas
 */
export const CreateRouteSchema = z.object({
  routeName: z.string().min(3, 'Route name too short').max(100, 'Route name too long'),
  startCity: z.string().min(2),
  endCity: z.string().min(2),
  distance: z.number().positive('Distance must be positive'),
  estimatedDuration: z.number().positive('Duration must be positive'),
  stops: z.array(z.string().uuid()).optional()
});

export const CreateStopSchema = z.object({
  name: z.string().min(2, 'Stop name too short').max(100, 'Stop name too long'),
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional(),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional(),
  address: z.string().optional(),
  type: z.enum(['MAJOR', 'MINOR']).default('MAJOR')
});

/**
 * Support Ticket Schemas
 */
export const CreateSupportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject too short').max(200, 'Subject too long'),
  description: z.string().min(10, 'Description too short').max(2000, 'Description too long'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  category: z.enum([
    'TECHNICAL',
    'BILLING',
    'BOOKING',
    'REFUND',
    'COMPLAINT',
    'OTHER'
  ]),
  attachments: z.array(z.string().url()).optional()
});

/**
 * Pagination Schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().positive('Page must be positive').default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

export type LoginPayload = z.infer<typeof LoginSchema>;
export type RegisterPayload = z.infer<typeof RegisterSchema>;
export type SearchTripsPayload = z.infer<typeof SearchTripsSchema>;
export type ReserveSeatsPayload = z.infer<typeof ReserveSeatsSchema>;
export type InitiatePaymentPayload = z.infer<typeof InitiatePaymentSchema>;
export type CreateDisputePayload = z.infer<typeof CreateDisputeSchema>;
export type CreateReviewPayload = z.infer<typeof CreateReviewSchema>;
