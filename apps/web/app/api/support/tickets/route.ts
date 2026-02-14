import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import SupportTicket from '@/lib/models/SupportTicket';

export async function POST(req: Request) {
    try {
        const { contactEmail, subject, description, priority, category, agencyId } = await req.json();

        if (!contactEmail || !subject || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Create a new support ticket
        const ticket = await SupportTicket.create({
            contactEmail: contactEmail.toLowerCase(),
            subject,
            description,
            priority: priority || 'MEDIUM',
            category: category || 'GENERAL',
            agencyId,
            status: 'OPEN',
            messages: [{
                text: description,
                timestamp: new Date()
            }]
        });

        return NextResponse.json({
            message: 'Support ticket created successfully',
            ticketNumber: ticket.ticketNumber
        }, { status: 201 });

    } catch (error: any) {
        console.error('Support Ticket API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}
