import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/users - list users with optional filters (admin only)
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenToken = cookieStore.get('token');
    const authToken = cookieStore.get('auth_token');
    const token = tokenToken?.value || authToken?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50', 10), 200);

    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

