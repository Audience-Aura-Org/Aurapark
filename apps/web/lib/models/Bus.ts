import mongoose, { Schema, Document } from 'mongoose';
import { SeatType, BusType } from '../types';

export { SeatType, BusType };

export interface ISeat {
    seatNumber: string;
    type: SeatType;
    row: number;
    column: number;
    isAvailable: boolean;
}

export interface IBus extends Document {
    busNumber: string;
    agencyId: mongoose.Types.ObjectId;
    type: BusType;
    busModel?: string;
    registrationNumber?: string;
    capacity: number;
    seatMap: {
        rows: number;
        columns: number;
        seats: ISeat[];
    };
    amenities?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SeatSchema = new Schema({
    seatNumber: { type: String, required: true },
    type: { type: String, enum: Object.values(SeatType), default: SeatType.STANDARD },
    row: { type: Number, required: true },
    column: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true }
}, { _id: false });

const BusSchema: Schema = new Schema({
    busNumber: { type: String, required: true },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    type: {
        type: String,
        enum: Object.values(BusType),
        default: BusType.STANDARD
    },
    busModel: { type: String },
    registrationNumber: { type: String },
    capacity: { type: Number, required: true },
    seatMap: {
        rows: { type: Number, required: true },
        columns: { type: Number, required: true },
        seats: [SeatSchema]
    },

    amenities: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure bus numbers are unique per agency
BusSchema.index({ busNumber: 1, agencyId: 1 }, { unique: true });

export default mongoose.models.Bus || mongoose.model<IBus>('Bus', BusSchema);
