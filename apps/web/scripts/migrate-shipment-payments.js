const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://audienceauraorg_db_user:Talktome387@clustertransportation.ttzk4q2.mongodb.net/transport-platform?retryWrites=true&w=majority';

// Minimal Schema definitions
const ShipmentSchema = new mongoose.Schema({
    trackingNumber: String,
    userId: mongoose.Schema.Types.ObjectId,
    agencyId: mongoose.Schema.Types.ObjectId,
    tripId: mongoose.Schema.Types.ObjectId,
    price: Number,
    paymentStatus: String,
    status: String,
    createdAt: Date,
    updatedAt: Date
});

const PaymentSchema = new mongoose.Schema({
    type: { type: String, enum: ['BOOKING', 'SHIPMENT'], default: 'BOOKING' },
    bookingId: mongoose.Schema.Types.ObjectId,
    shipmentId: mongoose.Schema.Types.ObjectId,
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

async function migrateShipmentPayments() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Shipment = mongoose.model('Shipment', ShipmentSchema);
        const Payment = mongoose.model('Payment', PaymentSchema);

        const shipments = await Shipment.find({});
        console.log(`Found ${shipments.length} shipments.`);

        let createdCount = 0;

        for (const shipment of shipments) {
            const existingPayment = await Payment.findOne({ shipmentId: shipment._id });

            if (!existingPayment) {
                console.log(`Creating payment for Shipment: ${shipment.trackingNumber}`);

                const amount = shipment.price || 0;

                // Map status to payment status
                let paymentStatus = 'PENDING';
                if (shipment.paymentStatus === 'PAID') paymentStatus = 'PAID';

                await Payment.create({
                    type: 'SHIPMENT',
                    shipmentId: shipment._id,
                    agencyId: shipment.agencyId,
                    userId: shipment.userId,
                    amount: amount,
                    platformFee: 0, // Assuming 0 for now as per current logic
                    agencyAmount: amount,
                    currency: 'XAF',
                    paymentMethod: 'CASH', // Default/Fallback
                    status: paymentStatus,
                    transactionId: `SHP-${shipment.trackingNumber}`,
                    createdAt: shipment.createdAt, // Preserve original date
                    updatedAt: shipment.updatedAt
                });
                createdCount++;
            } else {
                console.log(`Payment already exists for Shipment: ${shipment.trackingNumber}`);
            }
        }

        console.log(`Migration complete. Created ${createdCount} missing shipment payment records.`);

    } catch (error) {
        console.error('Migration Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrateShipmentPayments();
