import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types';

export { UserRole };

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash?: string;
    role: UserRole;
    phone?: string;
    phoneVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    phone: { type: String },
    phoneVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
