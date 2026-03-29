import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/karan chaubey/OneDrive/Desktop/INFRALINK/infralink-backend/.env' });

async function resetAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB:', mongoose.connection.db.databaseName);
  
  const db = mongoose.connection.db;
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  // Reset ALL user passwords to password123
  const result = await db.collection('users').updateMany(
    {},
    { $set: { password: hashedPassword } }
  );

  console.log(`Reset passwords for ${result.modifiedCount} users to: password123`);
  
  const users = await db.collection('users').find({}).project({ email: 1 }).toArray();
  console.log('All users:', users.map(u => u.email));
  
  process.exit(0);
}
resetAll();
