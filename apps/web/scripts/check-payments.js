const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://audienceauraorg_db_user:Talktome387@clustertransportation.ttzk4q2.mongodb.net/transport-platform?retryWrites=true&w=majority';

async function checkPayments() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const paymentsCollection = mongoose.connection.db.collection('payments');
        const paymentCount = await paymentsCollection.countDocuments();
        console.log(`Total documents in 'payments' collection: ${paymentCount}`);

        if (paymentCount > 0) {
            const sample = await paymentsCollection.findOne();
            console.log('Sample payment document:', JSON.stringify(sample, null, 2));
        } else {
            console.log('No payment documents found. Checking bookings...');
            const bookingsCollection = mongoose.connection.db.collection('bookings');
            const bookingCount = await bookingsCollection.countDocuments();
            console.log(`Total documents in 'bookings' collection: ${bookingCount}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkPayments();
