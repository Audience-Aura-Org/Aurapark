import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import SupportTicket from '@/lib/models/SupportTicket';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/support — all tickets, admin scoped
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;

        const query: any = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;

        const [tickets, total] = await Promise.all([
            SupportTicket.find(query)
                .populate('userId', 'name email')
                .populate('agencyId', 'name')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            SupportTicket.countDocuments(query),
        ]);

        // Summary stats
        const [openCount, pendingCount, resolvedCount] = await Promise.all([
            SupportTicket.countDocuments({ status: 'OPEN' }),
            SupportTicket.countDocuments({ status: 'PENDING' }),
            SupportTicket.countDocuments({ status: 'RESOLVED' }),
        ]);

        return NextResponse.json({
            tickets,
            pagination: { page, pages: Math.ceil(total / limit), total },
            stats: { open: openCount, pending: pendingCount, resolved: resolvedCount, total: openCount + pendingCount + resolvedCount },
        });
    } catch (error: any) {
        console.error('Error fetching support tickets:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/admin/support — update ticket status or assign
export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const { id, status, message } = await req.json();

        const ticket = await SupportTicket.findById(id);
        if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

        if (status) ticket.status = status;
        if (message) {
            ticket.messages.push({
                senderId: decoded.id || decoded.userId,
                text: `[Admin] ${message}`,
                timestamp: new Date(),
            });
        }
        await ticket.save();

        return NextResponse.json({ ticket });
    } catch (error: any) {
        console.error('Error updating ticket:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
