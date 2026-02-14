import mongoose, { Schema, Document } from 'mongoose';
import { SupportTicketStatus, SupportTicketPriority } from '../types';

export interface ISupportTicket extends Document {
    ticketNumber: string;
    userId?: mongoose.Types.ObjectId;
    contactEmail?: string;
    agencyId?: mongoose.Types.ObjectId;
    subject: string;
    description: string;
    category: string;
    status: SupportTicketStatus;
    priority: SupportTicketPriority;
    messages: {
        senderId: mongoose.Types.ObjectId;
        text: string;
        timestamp: Date;
        attachments?: string[];
    }[];
    assignedTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema({
    ticketNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    contactEmail: { type: String },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: Object.values(SupportTicketStatus), default: SupportTicketStatus.OPEN },
    priority: { type: String, enum: Object.values(SupportTicketPriority), default: SupportTicketPriority.MEDIUM },
    messages: [{
        senderId: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional for guests
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        attachments: [{ type: String }]
    }],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-generate ticket number
SupportTicketSchema.pre('save', function () {
    if (this.isNew && !this.ticketNumber) {
        this.ticketNumber = 'TKT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }
});

export default mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
