import mongoose, { Schema, Document } from 'mongoose';
import { ShipmentStatus } from '../types';

export interface IShipment extends Document {
    trackingNumber: string;
    userId?: mongoose.Types.ObjectId;
    agencyId: mongoose.Types.ObjectId;
    tripId?: mongoose.Types.ObjectId;
    busId?: mongoose.Types.ObjectId;

    sender: {
        name: string;
        phone: string;
        idNumber?: string;
    };
    receiver: {
        name: string;
        phone: string;
    };

    origin: string;
    destination: string;

    content: string;
    weight?: number;
    dimensions?: string;

    price: number;
    paymentStatus: 'PENDING' | 'PAID';

    status: ShipmentStatus;
    history: {
        status: ShipmentStatus;
        timestamp: Date;
        location?: string;
        notes?: string;
    }[];

    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ShipmentSchema: Schema = new Schema({
    trackingNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus' },

    sender: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        idNumber: { type: String }
    },
    receiver: {
        name: { type: String, required: true },
        phone: { type: String, required: true }
    },

    origin: { type: String, required: true },
    destination: { type: String, required: true },

    content: { type: String, required: true },
    weight: { type: Number },
    dimensions: { type: String },

    price: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },

    status: { type: String, enum: Object.values(ShipmentStatus), default: ShipmentStatus.PENDING },
    history: [{
        status: { type: String, enum: Object.values(ShipmentStatus), required: true },
        timestamp: { type: Date, default: Date.now },
        location: { type: String },
        notes: { type: String }
    }],

    notes: { type: String }
}, { timestamps: true });

// Auto-generate tracking number
ShipmentSchema.pre('validate', function () {
    if (this.isNew && !this.trackingNumber) {
        this.trackingNumber = 'SHP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }
});

export default mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema);
