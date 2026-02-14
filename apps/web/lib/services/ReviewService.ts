import dbConnect from '../mongo';
import Review from '../models/Review';
import Agency from '../models/Agency';
import { AuditService } from './AuditService';
import mongoose from 'mongoose';

export class ReviewService {
    /**
     * Submits a new review and triggers trust score recalibration
     */
    static async submitReview(reviewData: {
        userId: string;
        tripId: string;
        agencyId: string;
        rating: number;
        comment?: string;
    }, req?: Request) {
        await dbConnect();

        // 1. Create the review
        const review = await Review.create(reviewData);

        // 2. Recalculate Agency Trust Score
        await this.recalibrateTrustScore(reviewData.agencyId);

        // 3. Log the action
        await AuditService.log({
            userId: reviewData.userId,
            action: 'SUBMIT_REVIEW',
            resource: 'Review',
            resourceId: review._id.toString(),
            details: { rating: reviewData.rating, agencyId: reviewData.agencyId },
            req
        });

        return review;
    }

    /**
     * Recalculates the trust score based on average ratings
     * Score = (Average Rating / 5) * 100
     */
    static async recalibrateTrustScore(agencyId: string) {
        const stats = await Review.aggregate([
            { $match: { agencyId: new mongoose.Types.ObjectId(agencyId) } },
            {
                $group: {
                    _id: '$agencyId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $count: {} }
                }
            }
        ]);

        if (stats.length > 0) {
            const { averageRating } = stats[0];
            // Scale to 0-100
            const trustScore = Math.round((averageRating / 5) * 100);

            await Agency.findByIdAndUpdate(agencyId, { trustScore });
        }
    }
}
