import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // Show all current indexes
    console.log('📋 Current indexes:');
    const currentIndexes = await collection.indexes();
    currentIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, idx.key, idx.unique ? '(unique)' : '', idx.sparse ? '(sparse)' : '');
    });
    
    // Drop ALL indexes except _id
    console.log('\n🗑️ Dropping ALL indexes (except _id_)...');
    const indexNames = currentIndexes
      .map(idx => idx.name)
      .filter(name => name !== '_id_');
    
    for (const name of indexNames) {
      try {
        await collection.dropIndex(name);
        console.log(`✅ Dropped: ${name}`);
      } catch (e) {
        console.log(`⚠️ Could not drop ${name}:`, e.message);
      }
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create new sparse unique indexes
    console.log('\n✨ Creating new sparse unique indexes...');
    
    await collection.createIndex(
      { email: 1 }, 
      { unique: true, sparse: true, name: 'email_1_sparse' }
    );
    console.log('✅ Created: email_1_sparse (unique, sparse)');
    
    await collection.createIndex(
      { phone: 1 }, 
      { unique: true, sparse: true, name: 'phone_1_sparse' }
    );
    console.log('✅ Created: phone_1_sparse (unique, sparse)');
    
    // Show final indexes
    console.log('\n📋 Final indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, idx.key, idx.unique ? '(unique)' : '', idx.sparse ? '(sparse)' : '');
    });
    
    console.log('\n✅ Fix complete! You can now restart your backend.\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

fixIndexes();