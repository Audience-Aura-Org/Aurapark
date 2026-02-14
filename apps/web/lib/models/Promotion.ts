import mongoose, { Schema, Document } from 'mongoose';
import { PromoStatus } from '../types';

export interface IPromotion extends Document {
    code: string;
    agencyId: mongoose.Types.ObjectId;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
    description: string;
    startDate: Date;
    endDate: Date;
    usageLimit?: number;
    usageCount: number;
    minBookingAmount?: number;
    maxDiscountAmount?: number;
    status: PromoStatus;
    createdAt: Date;
    updatedAt: Date;
}

const PromotionSchema: Schema = new Schema({
    code: { type: String, required: true, uppercase: true },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    type: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
    value: { type: Number, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    minBookingAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    status: { type: String, enum: Object.values(PromoStatus), default: PromoStatus.ACTIVE }
}, { timestamps: true });

// Index for performance
PromotionSchema.index({ code: 1, agencyId: 1 }, { unique: true });

export default mongoose.models.Promotion || mongoose.model<IPromotion>('Promotion', PromotionSchema);
