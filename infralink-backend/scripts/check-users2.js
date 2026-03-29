import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/karan chaubey/OneDrive/Desktop/INFRALINK/infralink-backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'infralink' });
  console.log('Connected to infralink DB');
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  console.log('Users in infralink:', users.map(u => ({ email: u.email, passLength: u.password?.length })));
  process.exit(0);
}
check();
