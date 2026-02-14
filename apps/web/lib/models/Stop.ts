import mongoose, { Schema, Document } from 'mongoose';

export interface IPickupPoint {
    name: string;
    description?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface IStop extends Document {
    name: string;
    description?: string;
    agencyId: mongoose.Types.ObjectId;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    pickupPoints: IPickupPoint[];
    createdAt: Date;
    updatedAt: Date;
}

const PickupPointSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    }
}, { _id: false });

const StopSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    pickupPoints: [PickupPointSchema]
}, { timestamps: true });

export default mongoose.models.Stop || mongoose.model<IStop>('Stop', StopSchema);
