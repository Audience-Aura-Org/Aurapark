import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import User from '@/lib/models/User';
import Agency from '@/lib/models/Agency';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

export const generateToken = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * server-side session helper
 */
export async function getServerSession() {
    try {
        const cookieStore = await cookies();
        const tokenToken = cookieStore.get('token');
        const authToken = cookieStore.get('auth_token');
        const token = tokenToken?.value || authToken?.value;

        if (!token) return null;

        const decoded = verifyToken(token);
        if (!decoded || !decoded.id) return null;

        await dbConnect();
        const user: any = await User.findById(decoded.id).select('-passwordHash');
        if (!user) return null;

        let agencyId = null;
        if (user.role === 'AGENCY_STAFF') {
            const agency = await Agency.findOne({ ownerId: user._id });
            agencyId = agency?._id;
        }

        return {
            userId: user._id,
            email: user.email,
            role: user.role,
            agencyId
        };
    } catch (error) {
        console.error('getServerSession Error:', error);
        return null;
    }
}
