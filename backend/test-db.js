// backend/test-db.js
require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
    try {
        console.log('⏳ Connecting to MongoDB Atlas...');

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing from your .env file!');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`\n✅ Successfully Connected!`);
        console.log(`  • Host: ${conn.connection.host}`);
        console.log(`  • Database Name: ${conn.connection.name}`);

        // Clean disconnect
        await mongoose.connection.close();
        console.log('🔌 Connection closed cleanly.\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Connection Error:', error.message);
        process.exit(1);
    }
};

testConnection();