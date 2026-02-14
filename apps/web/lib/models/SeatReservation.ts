import mongoose, { Schema, Document } from 'mongoose';
import { ReservationStatus } from '../types';

export interface ISeatReservation extends Document {
    tripId: mongoose.Types.ObjectId;
    seatNumbers: string[];
    userId?: mongoose.Types.ObjectId;
    sessionId: string; // To track guest reservations
    status: ReservationStatus;
    expiresAt: Date;
}

const SeatReservationSchema: Schema = new Schema({
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    seatNumbers: [{ type: String, required: true }],
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(ReservationStatus),
        default: ReservationStatus.PENDING
    },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

// TTL index to automatically delete expired reservations
// Note: expiresAt is the absolute time when the document should be removed
SeatReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for quick availability checks
SeatReservationSchema.index({ tripId: 1, status: 1 });

export default mongoose.models.SeatReservation || mongoose.model<ISeatReservation>('SeatReservation', SeatReservationSchema);
