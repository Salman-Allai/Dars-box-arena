import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // Drop old indexes
    try {
      await collection.dropIndex('phone_1');
      console.log('✅ Dropped phone_1 index');
    } catch (e) {
      console.log('ℹ️ phone_1 index not found');
    }
    
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped email_1 index');
    } catch (e) {
      console.log('ℹ️ email_1 index not found');
    }
    
    // Create new sparse indexes
    await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('✅ Created sparse email index');
    
    await collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
    console.log('✅ Created sparse phone index');
    
    console.log('✅ Index fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixIndexes();