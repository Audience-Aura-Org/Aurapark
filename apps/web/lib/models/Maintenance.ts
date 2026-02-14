import mongoose, { Schema, Document } from 'mongoose';
import { MaintenanceType, MaintenanceStatus } from '../types';

export interface IMaintenance extends Document {
    busId: mongoose.Types.ObjectId;
    agencyId: mongoose.Types.ObjectId;
    type: MaintenanceType;
    status: MaintenanceStatus;
    description: string;
    cost: number;
    startDate: Date;
    completionDate?: Date;
    odometerReading?: number;
    nextServiceOdometer?: number;
    nextServiceDate?: Date;
    performedBy?: string; // Mechanic/Service Center name
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MaintenanceSchema: Schema = new Schema({
    busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    type: { type: String, enum: Object.values(MaintenanceType), required: true },
    status: { type: String, enum: Object.values(MaintenanceStatus), default: MaintenanceStatus.SCHEDULED },
    description: { type: String, required: true },
    cost: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now, required: true },
    completionDate: { type: Date },
    odometerReading: { type: Number },
    nextServiceOdometer: { type: Number },
    nextServiceDate: { type: Date },
    performedBy: { type: String },
    notes: { type: String }
}, { timestamps: true });

// Standard Next.js singleton model pattern
export default mongoose.models.Maintenance || mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);
