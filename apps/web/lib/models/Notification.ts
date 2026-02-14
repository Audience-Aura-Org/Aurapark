import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType, NotificationStatus } from '../types';

export interface INotification extends Document {
    recipient: string; // Phone number or email
    type: NotificationType;
    bookingId?: mongoose.Types.ObjectId;
    tripId?: mongoose.Types.ObjectId;
    message: string;
    provider: string; // e.g., 'WHATSAPP_TWILIO', 'MOCK'
    status: NotificationStatus;
    providerDetails?: any;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
    recipient: { type: String, required: true },
    type: {
        type: String,
        enum: Object.values(NotificationType),
        required: true
    },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
    message: { type: String, required: true },
    provider: { type: String, default: 'MOCK' },
    status: {
        type: String,
        enum: Object.values(NotificationStatus),
        default: NotificationStatus.PENDING
    },
    providerDetails: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Indexing for status tracking
NotificationSchema.index({ recipient: 1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ bookingId: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
