import mongoose, { Schema, Document } from 'mongoose';
import { AgencyStatus } from '../types';

export { AgencyStatus };

export interface IAgency extends Document {
    name: string;
    email: string;
    phone: string;
    address?: string;
    status: AgencyStatus;
    trustScore: number; // 0-100
    ownerId: mongoose.Types.ObjectId; // Reference to User with AGENCY_STAFF role
    settings: {
        whatsappTemplates?: {
            bookingConfirmation?: string;
            tripDelay?: string;
            tripCancellation?: string;
            checkInReminder?: string;
        };
        pricingRules?: {
            platformFeePercentage?: number;
            allowDynamicPricing?: boolean;
        };
        tripOverrides?: {
            allowManualBooking?: boolean;
            requireApprovalForCancellation?: boolean;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

const AgencySchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String },
    status: {
        type: String,
        enum: Object.values(AgencyStatus),
        default: AgencyStatus.PENDING
    },
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    settings: {
        whatsappTemplates: {
            bookingConfirmation: { type: String },
            tripDelay: { type: String },
            tripCancellation: { type: String },
            checkInReminder: { type: String }
        },
        pricingRules: {
            platformFeePercentage: { type: Number, default: 10 },
            allowDynamicPricing: { type: Boolean, default: false }
        },
        tripOverrides: {
            allowManualBooking: { type: Boolean, default: true },
            requireApprovalForCancellation: { type: Boolean, default: false }
        }
    }
}, { timestamps: true });

export default mongoose.models.Agency || mongoose.model<IAgency>('Agency', AgencySchema);
