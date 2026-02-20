import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // Count users
    const count = await collection.countDocuments();
    console.log(`📊 Found ${count} users in database\n`);
    
    if (count === 0) {
      console.log('✅ No users to delete\n');
    } else {
      // Delete all users
      const result = await collection.deleteMany({});
      console.log(`🗑️ Deleted ${result.deletedCount} users\n`);
    }
    
    console.log('✅ Database is clean! You can now register fresh users.\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

clearUsers();