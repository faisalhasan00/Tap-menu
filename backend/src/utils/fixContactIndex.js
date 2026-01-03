/**
 * Utility script to fix the Contact collection index issue
 * Run this once to drop the problematic unique index
 * 
 * Usage: node -e "require('./src/utils/fixContactIndex.js')"
 */

const mongoose = require('mongoose');
require('dotenv').config();

const fixContactIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('contacts');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:', indexes.map(idx => idx.name));

    // Drop the problematic unique index if it exists
    try {
      await collection.dropIndex('businessId_1_phoneNumber_1');
      console.log('✅ Dropped problematic index: businessId_1_phoneNumber_1');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index businessId_1_phoneNumber_1 does not exist');
      } else {
        throw error;
      }
    }

    // Create a sparse index instead (only indexes documents where both fields exist)
    try {
      await collection.createIndex(
        { businessId: 1, phoneNumber: 1 },
        { 
          sparse: true, 
          unique: false,
          name: 'businessId_1_phoneNumber_1_sparse'
        }
      );
      console.log('✅ Created sparse index: businessId_1_phoneNumber_1_sparse');
    } catch (error) {
      console.log('⚠️  Could not create sparse index:', error.message);
    }

    console.log('\n✅ Index fix completed!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing index:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  fixContactIndex();
}

module.exports = fixContactIndex;

