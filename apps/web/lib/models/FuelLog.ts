import mongoose, { Schema, Document } from 'mongoose';
import { FuelType } from '../types';

export interface IFuelLog extends Document {
    busId: mongoose.Types.ObjectId;
    agencyId: mongoose.Types.ObjectId;
    driverId: mongoose.Types.ObjectId;
    date: Date;
    quantity: number; // in Litres
    costPerLitre: number;
    totalCost: number;
    fuelType: FuelType;
    odometerReading: number;
    stationName?: string;
    location?: string;
    receiptUrl?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FuelLogSchema: Schema = new Schema({
    busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now, required: true },
    quantity: { type: Number, required: true },
    costPerLitre: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    fuelType: { type: String, enum: Object.values(FuelType), default: FuelType.DIESEL },
    odometerReading: { type: Number, required: true },
    stationName: { type: String },
    location: { type: String },
    receiptUrl: { type: String },
    notes: { type: String }
}, { timestamps: true });

// Next.js development: Force re-registration of the model if schema changed
if (mongoose.models.FuelLog) {
    delete (mongoose.models as any).FuelLog;
}

export default mongoose.model<IFuelLog>('FuelLog', FuelLogSchema);
