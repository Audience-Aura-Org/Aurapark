import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
    platformFeePercentage: number;
    bookingCancellationHours: number;
    refundProcessingDays: number;
    smsNotifications: boolean;
    emailNotifications: boolean;
    autoApproveAgencies: boolean;
    maintenanceMode: boolean;
    // Branding
    platformName: string;
    primaryColor: string;
    logoUrl: string;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>({
    platformFeePercentage: { type: Number, required: true, default: 10, min: 0, max: 100 },
    bookingCancellationHours: { type: Number, required: true, default: 24, min: 0 },
    refundProcessingDays: { type: Number, required: true, default: 7, min: 1, max: 30 },
    smsNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    autoApproveAgencies: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    platformName: { type: String, default: 'Transport Platform' },
    primaryColor: { type: String, default: '#3b82f6' },
    logoUrl: { type: String, default: '/logo.png' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
