import mongoose, { Schema, Document } from 'mongoose';
import { TripStatus } from '../types';

export { TripStatus };

export interface ITrip extends Document {
    routeId: mongoose.Types.ObjectId;
    busId: mongoose.Types.ObjectId;
    driverId?: mongoose.Types.ObjectId;
    agencyId: mongoose.Types.ObjectId;
    departureTime: Date;
    arrivalTime: Date;
    status: TripStatus;
    basePrice: number;
    availableSeats: string[]; // Array of seat numbers
    stops?: { // Specific stops for this trip
        stopId: mongoose.Types.ObjectId;
        name: string;
        arrivalTime?: Date;
        departureTime?: Date;
        price?: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const TripSchema: Schema = new Schema({
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    status: {
        type: String,
        enum: Object.values(TripStatus),
        default: TripStatus.SCHEDULED
    },
    basePrice: { type: Number, required: true },
    availableSeats: [{ type: String }], // Initially copied from Bus seatMap
    stops: [{
        stopId: { type: Schema.Types.ObjectId, ref: 'Stop' },
        name: String,
        arrivalTime: Date,
        departureTime: Date,
        price: Number
    }]
}, { timestamps: true });

// Index for common filter queries
TripSchema.index({ routeId: 1, departureTime: 1 });
TripSchema.index({ agencyId: 1, departureTime: 1 });

export default mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);
