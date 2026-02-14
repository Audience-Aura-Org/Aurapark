import mongoose, { Schema, Document } from 'mongoose';

export interface IOverrideLog extends Document {
    adminId: mongoose.Types.ObjectId;
    adminName: string;
    action: string;
    entityType: string;
    entityId: string;
    reason: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    previousValue?: any;
    newValue?: any;
    timestamp: Date;
}

const OverrideLogSchema = new Schema<IOverrideLog>({
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    reason: { type: String, required: true },
    impact: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        required: true
    },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, required: true },
});

// Index for efficient queries
OverrideLogSchema.index({ timestamp: -1 });
OverrideLogSchema.index({ adminId: 1 });
OverrideLogSchema.index({ entityType: 1, entityId: 1 });

export default mongoose.models.OverrideLog || mongoose.model<IOverrideLog>('OverrideLog', OverrideLogSchema);
