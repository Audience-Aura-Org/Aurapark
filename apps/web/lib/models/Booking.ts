import mongoose, { Schema, Document } from 'mongoose';
import { BookingStatus, PaymentStatus } from '../types';

export interface IPassenger {
    name: string;
    age: number;
    gender?: string;
    seatNumber: string;
    ticketNumber: string;
    checkedIn: boolean;
}

export interface IBooking extends Document {
    pnr: string;
    tripId: mongoose.Types.ObjectId;
    agencyId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    passengers: IPassenger[];
    totalAmount: number;
    paymentStatus: PaymentStatus;
    status: BookingStatus;
    contactEmail: string;
    contactPhone: string;
    createdAt: Date;
    updatedAt: Date;
}

const PassengerSchema = new Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String },
    seatNumber: { type: String, required: true },
    ticketNumber: { type: String, unique: true },
    checkedIn: { type: Boolean, default: false }
}, { _id: false });

const BookingSchema: Schema = new Schema({
    pnr: { type: String, required: true, unique: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    passengers: [PassengerSchema],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING
    },
    status: {
        type: String,
        enum: Object.values(BookingStatus),
        default: BookingStatus.CONFIRMED
    },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true }
}, { timestamps: true });

// Index for lookup
BookingSchema.index({ pnr: 1 });
BookingSchema.index({ userId: 1 });
BookingSchema.index({ tripId: 1 });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
