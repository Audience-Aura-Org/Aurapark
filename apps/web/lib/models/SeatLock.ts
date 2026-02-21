import mongoose, { Schema, Document } from 'mongoose';

export interface ISeatLock extends Document {
    tripId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    seatNumbers: string[];
    status: 'HELD' | 'CONFIRMED' | 'RELEASED';
    bookingId?: mongoose.Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SeatLockSchema: Schema = new Schema(
    {
        tripId: {
            type: Schema.Types.ObjectId,
            ref: 'Trip',
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        seatNumbers: {
            type: [String],
            required: true
        },
        status: {
            type: String,
            enum: ['HELD', 'CONFIRMED', 'RELEASED'],
            default: 'HELD'
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: 'Booking'
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

// TTL index to automatically delete expired locks
SeatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for fast lookups
SeatLockSchema.index({ tripId: 1, status: 1 });
SeatLockSchema.index({ userId: 1, status: 1 });
SeatLockSchema.index({ tripId: 1, seatNumbers: 1 });

export default mongoose.models.SeatLock ||
    mongoose.model<ISeatLock>('SeatLock', SeatLockSchema);
