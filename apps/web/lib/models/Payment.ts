import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from '../types';

export interface IPayment extends Document {
    bookingId: mongoose.Types.ObjectId;
    tripId: mongoose.Types.ObjectId;
    agencyId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    amount: number;
    platformFee: number;
    agencyAmount: number;
    currency: string;
    paymentMethod: string;
    transactionId?: string;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
    type: { type: String, enum: ['BOOKING', 'SHIPMENT'], default: 'BOOKING' },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }, // Can be null for guest shipments
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    agencyAmount: { type: Number, required: true },
    currency: { type: String, default: 'XAF' },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String },
    status: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING
    }
}, { timestamps: true });

// Indexing for financial reports
PaymentSchema.index({ agencyId: 1, status: 1 });
PaymentSchema.index({ createdAt: 1 });
PaymentSchema.index({ transactionId: 1 }, { sparse: true });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
