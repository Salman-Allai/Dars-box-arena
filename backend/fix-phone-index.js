import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixPhoneIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // Drop the problematic phone index
    try {
      await collection.dropIndex('phone_1');
      console.log('✅ Dropped phone_1 index');
    } catch (error) {
      console.log('ℹ️ phone_1 index does not exist or already dropped');
    }
    
    try {
      await collection.dropIndex('phone_1_sparse');
      console.log('✅ Dropped phone_1_sparse index');
    } catch (error) {
      console.log('ℹ️ phone_1_sparse index does not exist or already dropped');
    }
    
    // Update all users with empty phone to null
    const result = await collection.updateMany(
      { phone: '' },
      { $set: { phone: null } }
    );
    console.log(`✅ Updated ${result.modifiedCount} users with empty phone to null`);
    
    // Create a new sparse unique index that allows multiple nulls
    await collection.createIndex(
      { phone: 1 },
      { 
        unique: true, 
        sparse: true,
        partialFilterExpression: { phone: { $type: 'string', $ne: null } }
      }
    );
    console.log('✅ Created new sparse unique index on phone');
    
    await mongoose.connection.close();
    console.log('✅ Done! Phone index fixed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixPhoneIndex();