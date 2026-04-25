import mongoose from 'mongoose';
import User from './src/modules/users/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    try {
      await User.collection.dropIndex('email_1');
      console.log('Successfully dropped old email_1 index');
    } catch (e) {}
    
    try {
      await User.collection.dropIndex('phone_1');
      console.log('Successfully dropped old phone_1 index');
    } catch (e) {}

    // Clean up duplicates
    await User.deleteMany({ phone: "1234567890" });
    await User.deleteMany({ phone: null });
    console.log('Cleaned up duplicate/null phone numbers');
    
    await User.syncIndexes();
    console.log('Successfully synced indexes');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixIndexes();
