import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/karan chaubey/OneDrive/Desktop/INFRALINK/infralink-backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  console.log('Users:', users.map(u => ({ email: u.email, passLength: u.password?.length })));
  process.exit(0);
}
check();
