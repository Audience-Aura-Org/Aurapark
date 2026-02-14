import mongoose, { Schema, Document } from 'mongoose';

export interface ISettlement extends Document {
    agencyId: mongoose.Types.ObjectId;
    period: string; // e.g., "January 2026"
    startDate: Date;
    endDate: Date;
    grossRevenue: number;
    platformFee: number;
    netRevenue: number;
    status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
    paidOn?: Date;
    paymentMethod?: string;
    transactionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SettlementSchema = new Schema<ISettlement>({
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    period: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    grossRevenue: { type: Number, required: true, default: 0 },
    platformFee: { type: Number, required: true, default: 0 },
    netRevenue: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    paidOn: { type: Date },
    paymentMethod: { type: String },
    transactionId: { type: String },
}, { timestamps: true });

// Index for efficient queries
SettlementSchema.index({ agencyId: 1, createdAt: -1 });
SettlementSchema.index({ status: 1 });

export default mongoose.models.Settlement || mongoose.model<ISettlement>('Settlement', SettlementSchema);
