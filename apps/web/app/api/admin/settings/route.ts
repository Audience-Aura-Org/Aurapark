import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import SystemSettings from '@/lib/models/SystemSettings';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/settings - Get system settings
export async function GET() {
    try {
        const cookieStore = await cookies();
        const tokenToken = cookieStore.get('token');
        const authToken = cookieStore.get('auth_token');
        const token = tokenToken?.value || authToken?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden - Admin access only' }, { status: 403 });
        }

        await dbConnect();

        // Get settings (there should only be one document)
        let settings = await SystemSettings.findOne();

        // If no settings exist, create default settings
        if (!settings) {
            settings = await SystemSettings.create({
                platformFeePercentage: 10,
                bookingCancellationHours: 24,
                refundProcessingDays: 7,
                smsNotifications: true,
                emailNotifications: true,
                autoApproveAgencies: false,
                maintenanceMode: false
            });
        }

        return NextResponse.json({ settings }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies();
        const tokenToken = cookieStore.get('token');
        const authToken = cookieStore.get('auth_token');
        const token = tokenToken?.value || authToken?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden - Admin access only' }, { status: 403 });
        }

        const body = await req.json();
        const adminId = decoded.id || decoded.userId;

        await dbConnect();

        // Get existing settings
        let settings = await SystemSettings.findOne();

        if (!settings) {
            // Create new settings if none exist
            settings = await SystemSettings.create({
                ...body,
                updatedBy: adminId
            });
        } else {
            // Update existing settings
            Object.assign(settings, body);
            settings.updatedBy = adminId;
            await settings.save();
        }

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully',
            settings
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
