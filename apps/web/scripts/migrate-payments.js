const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://audienceauraorg_db_user:Talktome387@clustertransportation.ttzk4q2.mongodb.net/transport-platform?retryWrites=true&w=majority';

// Minimal Schema definitions to avoid importing the entire app structure
const BookingSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    agencyId: mongoose.Schema.Types.ObjectId,
    tripId: mongoose.Schema.Types.ObjectId,
    totalAmount: Number,
    paymentStatus: String,
    pnr: String,
    createdAt: Date,
    updatedAt: Date
});

const PaymentSchema = new mongoose.Schema({
    bookingId: mongoose.Schema.Types.ObjectId,
    tripId: mongoose.Schema.Types.ObjectId,
    agencyId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    platformFee: Number,
    agencyAmount: Number,
    currency: String,
    paymentMethod: String,
    transactionId: String,
    status: String
}, { timestamps: true });

async function migratePayments() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Booking = mongoose.model('Booking', BookingSchema);
        const Payment = mongoose.model('Payment', PaymentSchema);

        const bookings = await Booking.find({});
        console.log(`Found ${bookings.length} bookings.`);

        let createdCount = 0;

        for (const booking of bookings) {
            const existingPayment = await Payment.findOne({ bookingId: booking._id });

            if (!existingPayment) {
                console.log(`Creating payment for Booking PNR: ${booking.pnr}`);

                const totalAmount = booking.totalAmount || 0;
                const platformFee = totalAmount * 0.10;
                const agencyAmount = totalAmount - platformFee;

                // Map booking status to payment status
                let paymentStatus = 'PENDING';
                if (booking.paymentStatus === 'PAID') paymentStatus = 'PAID';
                if (booking.paymentStatus === 'FAILED') paymentStatus = 'FAILED';

                await Payment.create({
                    bookingId: booking._id,
                    tripId: booking.tripId,
                    agencyId: booking.agencyId,
                    userId: booking.userId,
                    amount: totalAmount,
                    platformFee,
                    agencyAmount,
                    currency: 'XAF',
                    paymentMethod: 'CASH_ON_BOARD', // Default/Fallback
                    status: paymentStatus,
                    transactionId: `TXN-MIGRATE-${booking.pnr}`,
                    createdAt: booking.createdAt, // Preserve original date
                    updatedAt: booking.updatedAt
                });
                createdCount++;
            } else {
                console.log(`Payment already exists for Booking PNR: ${booking.pnr}`);
            }
        }

        console.log(`Migration complete. Created ${createdCount} missing payment records.`);

    } catch (error) {
        console.error('Migration Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migratePayments();
