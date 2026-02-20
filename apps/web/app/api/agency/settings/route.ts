import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import Agency from '@/lib/models/Agency';
import { getServerSession } from '@/lib/auth';

export async function GET() {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const agency = await Agency.findById(session.agencyId);
        return NextResponse.json({
            settings: agency?.settings || {},
            agencyName: agency?.name || '',
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();

        // Build a dot-notation $set so we only update the specific sub-keys sent,
        // without wiping out other settings fields (e.g. saving branding won't delete whatsappTemplates)
        const setPayload: Record<string, any> = {};

        const subKeys = ['whatsappTemplates', 'pricingRules', 'tripOverrides', 'branding'];
        for (const key of subKeys) {
            if (body[key] && typeof body[key] === 'object') {
                for (const [field, value] of Object.entries(body[key])) {
                    setPayload[`settings.${key}.${field}`] = value;
                }
            }
        }

        // If nothing matched the known sub-keys, fall back to direct field updates
        if (Object.keys(setPayload).length === 0) {
            for (const [key, value] of Object.entries(body)) {
                setPayload[`settings.${key}`] = value;
            }
        }

        const agency = await Agency.findByIdAndUpdate(
            session.agencyId,
            { $set: setPayload },
            { new: true }
        );

        return NextResponse.json({ settings: agency?.settings });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
