import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import User from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await dbConnect();

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        const passwordHash = await hashPassword(password);

        if (existingUser) {
            // Check if this is a shadow account (created via guest booking)
            if (!existingUser.passwordHash) {
                existingUser.name = name;
                existingUser.passwordHash = passwordHash;
                if (role) existingUser.role = role;
                await existingUser.save();

                return NextResponse.json({
                    message: 'Account activated and registered',
                    userId: existingUser._id
                }, { status: 200 });
            }
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            passwordHash,
            role: role || 'USER'
        });

        return NextResponse.json({
            message: 'User registered successfully',
            userId: newUser._id
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
