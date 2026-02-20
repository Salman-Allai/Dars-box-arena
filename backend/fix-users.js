import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // Find users with null or empty phone
    const badUsers = await collection.find({
      $or: [
        { phone: null },
        { phone: '' }
      ]
    }).toArray();
    
    console.log(`📊 Found ${badUsers.length} users with null/empty phone\n`);
    
    if (badUsers.length === 0) {
      console.log('✅ No users to fix\n');
    } else {
      // Delete users with null phone (they're broken registrations)
      const result = await collection.deleteMany({
        $or: [
          { phone: null },
          { phone: '' }
        ]
      });
      
      console.log(`🗑️ Deleted ${result.deletedCount} broken user records\n`);
    }
    
    console.log('✅ Users fixed! You can now register.\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

fixUsers();