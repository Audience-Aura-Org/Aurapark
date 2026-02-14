import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    userId: mongoose.Types.ObjectId;
    tripId: mongoose.Types.ObjectId;
    agencyId: mongoose.Types.ObjectId;
    rating: number; // 1 to 5
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
}, {
    timestamps: true
});

// Ensure a user can only review a trip once
ReviewSchema.index({ userId: 1, tripId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
