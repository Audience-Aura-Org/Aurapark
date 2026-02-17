import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';

// PATCH /api/admin/users/[id] - Update user (admin only)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { name, email, role, phone } = await req.json();
        const userId = params.id;

        await dbConnect();

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, role, phone },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: updatedUser });
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/users/[id] - Delete user (admin only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const userId = params.id;

        await dbConnect();

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
