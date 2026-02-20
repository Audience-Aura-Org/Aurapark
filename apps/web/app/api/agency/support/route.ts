import { NextRequest, NextResponse } from 'next/server';
import mongoConnection from '@/lib/mongo';
import SupportTicket from '@/lib/models/SupportTicket';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tickets = await SupportTicket.find({ agencyId: session.agencyId })
            .populate('userId', 'name email')
            .sort({ updatedAt: -1 });

        return NextResponse.json({ tickets });
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
        const { id, status, message } = body;

        const ticket = await SupportTicket.findOne({ _id: id, agencyId: session.agencyId });
        if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

        if (status) ticket.status = status;
        if (message) {
            ticket.messages.push({
                senderId: session.userId,
                text: message,
                timestamp: new Date()
            });
        }

        await ticket.save();

        return NextResponse.json({ ticket });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await mongoConnection();
        const session = await getServerSession();
        if (!session?.agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { subject, description, priority } = await req.json();

        if (!subject || !description) {
            return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 });
        }

        const ticket = await SupportTicket.create({
            agencyId: session.agencyId,
            userId: session.userId,
            subject,
            description,
            category: 'AGENCY',
            priority: priority || 'MEDIUM',
            status: 'OPEN',
        });

        return NextResponse.json({ ticket }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
