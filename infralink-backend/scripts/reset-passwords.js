import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Users/karan chaubey/OneDrive/Desktop/INFRALINK/infralink-backend/.env' });

async function resetPassword() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'infralink' });
  console.log('Connected to DB');
  
  const db = mongoose.connection.db;
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  await db.collection('users').updateOne(
    { email: 'abhi@gmail.com' },
    { $set: { password: hashedPassword } }
  );
  
  await db.collection('users').updateOne(
    { email: 'rahul@gmail.com' },
    { $set: { password: hashedPassword } }
  );

  console.log('Passwords reset successfully for abhi@gmail.com and rahul@gmail.com to: password123');
  process.exit(0);
}

resetPassword().catch(console.error);
