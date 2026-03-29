import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { login } from './src/modules/auth/auth.service.js';

dotenv.config({ path: 'c:/Users/karan chaubey/OneDrive/Desktop/INFRALINK/infralink-backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  try {
    const result = await login({ email: 'abhi@gmail.com', password: 'password123' });
    console.log('Login successful:', result.user.email);
  } catch (err) {
    console.error('Login Error:', err.message);
  }
  process.exit(0);
}

check().catch(console.error);
