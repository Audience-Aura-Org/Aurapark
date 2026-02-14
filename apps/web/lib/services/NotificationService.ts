import Notification from '@/lib/models/Notification';
import { NotificationType, NotificationStatus } from '@/lib/types';

export class NotificationService {
    /**
     * Mock WhatsApp sender that saves to database
     */
    static async sendWhatsApp({
        recipient,
        type,
        message,
        bookingId,
        tripId
    }: {
        recipient: string;
        type: NotificationType;
        message: string;
        bookingId?: any;
        tripId?: any;
    }) {
        try {
            // 1. Create PENDING record
            const notification = await Notification.create({
                recipient,
                type,
                message,
                bookingId,
                tripId,
                provider: 'WHATSAPP_MOCK',
                status: NotificationStatus.PENDING
            });

            // 2. Simulate API call to WhatsApp provider
            console.log(`[WhatsApp Mock] Sending to ${recipient}: ${message}`);

            // Artificial delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. Update status to SENT
            notification.status = NotificationStatus.SENT;
            notification.providerDetails = { sentAt: new Date(), messageId: `msg_${Math.random().toString(36).substr(2, 9)}` };
            await notification.save();

            return notification;
        } catch (error) {
            console.error('Error in NotificationService:', error);
            throw error;
        }
    }

    /**
     * Generate message templates
     */
    static getBookingConfirmationTemplate(pnr: string, seats: string[]) {
        return `*Booking Confirmed!* ✅\n\nYour PNR: *${pnr}*\nSeats: ${seats.join(', ')}\n\nThank you for choosing our platform! Check your ticket here: ${process.env.NEXT_PUBLIC_APP_URL}/tickets?pnr=${pnr}`;
    }

    static getCancellationTemplate(pnr: string) {
        return `*Cancellation Notice* ⚠️\n\nYour booking *${pnr}* has been cancelled. A refund has been initiated and should reflect in your account soon.`;
    }
}
