import mongoose, { Schema, Document } from 'mongoose';

export interface IIdempotencyKey extends Document {
    key: string;
    userId: mongoose.Types.ObjectId;
    method: string;
    endpoint: string;
    requestHash: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    responseData?: any;
    responseStatus: number;
    error?: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const IdempotencyKeySchema: Schema = new Schema(
    {
        key: {
            type: String,
            required: true,
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        method: {
            type: String,
            required: true,
            enum: ['POST', 'PUT', 'PATCH', 'DELETE']
        },
        endpoint: {
            type: String,
            required: true
        },
        requestHash: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['PENDING', 'SUCCESS', 'FAILED'],
            default: 'PENDING'
        },
        responseData: {
            type: Schema.Types.Mixed
        },
        responseStatus: {
            type: Number,
            default: 200
        },
        error: {
            type: String
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

// TTL index to automatically delete expired keys after 24 hours
IdempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for lookups by user and key
IdempotencyKeySchema.index({ userId: 1, key: 1 });

export default mongoose.models.IdempotencyKey ||
    mongoose.model<IIdempotencyKey>('IdempotencyKey', IdempotencyKeySchema);
