import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Booking from '@/lib/models/Booking';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Verify agency authentication
        const cookiesHeader = req.headers.get('cookie') || '';
        let token = '';

        // Robust cookie parsing
        const cookiePairs = cookiesHeader.split(';').map(p => p.trim());
        const tokenCookie = cookiePairs.find(p => p.startsWith('token='));
        const authTokenCookie = cookiePairs.find(p => p.startsWith('auth_token='));

        token = tokenCookie?.split('=')[1] || authTokenCookie?.split('=')[1] || '';

        if (!token) {
            console.warn('[Booking/PATCH] Missing token in cookies');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'AGENCY_STAFF') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Robust Agency ID resolution
        let agencyId = decoded.agencyId;
        if (!agencyId) {
            console.log(`[Booking/PATCH] Missing agencyId in token for user ${decoded.id}, resolving from DB...`);
            const Agency = (await import('@/lib/models/Agency')).default;
            const agency = await Agency.findOne({ ownerId: new mongoose.Types.ObjectId(decoded.id) });
            if (agency) {
                agencyId = agency._id.toString();
                console.log(`[Booking/PATCH] Resolved agencyId: ${agencyId}`);
            } else {
                console.error(`[Booking/PATCH] No agency found for ownerId: ${decoded.id}`);
            }
        }

        if (!agencyId) {
            return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 });
        }

        const body = await req.json();
        const { totalAmount, paymentStatus, status } = body;

        // Ensure the booking belongs to this agency
        const booking = await Booking.findOne({ _id: id, agencyId: agencyId });
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Update fields
        if (totalAmount !== undefined) booking.totalAmount = totalAmount;
        if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;
        if (status !== undefined) booking.status = status;

        await booking.save();

        return NextResponse.json({
            success: true,
            message: 'Booking updated successfully',
            booking
        });

    } catch (error: any) {
        console.error('Error updating booking:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
