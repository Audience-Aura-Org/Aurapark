import mongoose, { Schema, Document } from 'mongoose';
import { DisputeStatus, RefundReason } from '../types';

export interface IDispute extends Document {
    bookingId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    agencyId: mongoose.Types.ObjectId;
    reason: RefundReason;
    description: string;
    amountRequested: number;
    status: DisputeStatus;
    resolutionSummary?: string;
    refundAmount?: number;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const DisputeSchema: Schema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    reason: {
        type: String,
        enum: Object.values(RefundReason),
        required: true
    },
    description: { type: String, required: true },
    amountRequested: { type: Number, required: true },
    status: {
        type: String,
        enum: Object.values(DisputeStatus),
        default: DisputeStatus.OPEN
    },
    adminNotes: { type: String },
    resolutionSummary: { type: String },
    refundAmount: { type: Number, default: 0 },
    resolvedAt: { type: Date }
}, { timestamps: true });

// Indexing
DisputeSchema.index({ bookingId: 1 });
DisputeSchema.index({ status: 1 });
DisputeSchema.index({ agencyId: 1 });

export default mongoose.models.Dispute || mongoose.model<IDispute>('Dispute', DisputeSchema);
