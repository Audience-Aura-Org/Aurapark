import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Review from '@/lib/models/Review';
import { ReviewService } from '@/lib/services/ReviewService';

// GET /api/reviews?agencyId=... or ?tripId=...
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const agencyId = searchParams.get('agencyId');
        const tripId = searchParams.get('tripId');

        const filter: any = {};
        if (agencyId) filter.agencyId = agencyId;
        if (tripId) filter.tripId = tripId;

        const reviews = await Review.find(filter)
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json({ reviews }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/reviews
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, tripId, agencyId, rating, comment } = body;

        if (!userId || !tripId || !agencyId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const review = await ReviewService.submitReview({
            userId,
            tripId,
            agencyId,
            rating,
            comment
        }, req);

        return NextResponse.json({ message: 'Review submitted successfully', review }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'You have already reviewed this trip' }, { status: 400 });
        }
        console.error('Error submitting review:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
