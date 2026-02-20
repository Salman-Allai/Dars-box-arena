const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupPhone() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all users with empty phone
    const result = await mongoose.connection.collection('users').deleteMany({ phone: '' });
    console.log(`🗑️ Deleted ${result.deletedCount} documents with empty phone`);

    await mongoose.disconnect();
    console.log('✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupPhone();