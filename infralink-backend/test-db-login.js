import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/modules/users/user.model.js';

dotenv.config({ path: 'c:/Users/karan chaubey/OneDrive/Desktop/INFRALINK/infralink-backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ email: 'abhi@gmail.com' }).select('+password');
  console.log('Found user:', user ? user.email : 'No user found');
  if (user) {
    const isMatch = await bcrypt.compare('password123', user.password);
    console.log('Password match:', isMatch);
    console.log('User password length:', user.password.length);
  }
  process.exit(0);
}

check().catch(console.error);
