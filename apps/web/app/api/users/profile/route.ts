import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';

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
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, phone } = await req.json();

        await dbConnect();
        const user = await User.findById(decoded.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
