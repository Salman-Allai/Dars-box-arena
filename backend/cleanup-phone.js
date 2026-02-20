const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupPhone() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all users with empty phone
    const result = await mongoose.connection.collection('users').deleteMany({ phone: '' });
    console.log(`🗑️ Deleted ${result.deletedCount} documents with empty phone`);

    // Update remaining empty phones to null
    const updateResult = await mongoose.connection.collection('users').updateMany(
      { phone: '' },
      { $set: { phone: null } }
    );
    console.log(`📝 Updated ${updateResult.modifiedCount} documents`);

    await mongoose.disconnect();
    console.log('✅ Cleanup complete! You can now run npm run dev');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupPhone();