import mongoose, { Schema, Document } from 'mongoose';

export interface IRoute extends Document {
    routeName: string;
    agencyId: mongoose.Types.ObjectId;
    stops: mongoose.Types.ObjectId[];
    originStopId: mongoose.Types.ObjectId;
    destinationStopId: mongoose.Types.ObjectId;
    defaultPrice?: number;
    departureTimes?: string[];
    distance?: number;
    duration?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RouteSchema: Schema = new Schema({
    routeName: { type: String, required: true },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    stops: [{ type: Schema.Types.ObjectId, ref: 'Stop' }],
    originStopId: { type: Schema.Types.ObjectId, ref: 'Stop', required: true },
    destinationStopId: { type: Schema.Types.ObjectId, ref: 'Stop', required: true },
    defaultPrice: { type: Number },
    departureTimes: [{ type: String }],
    distance: { type: Number },
    duration: { type: Number },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure route names are unique per agency
RouteSchema.index({ routeName: 1, agencyId: 1 }, { unique: true });

export default mongoose.models.Route || mongoose.model<IRoute>('Route', RouteSchema);
