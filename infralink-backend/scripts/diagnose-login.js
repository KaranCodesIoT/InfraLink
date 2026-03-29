import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/karan chaubey/OneDrive/Desktop/INFRALINK/infralink-backend/.env' });

async function check() {
  // Connect without dbName override - use the one from URI (InfraLink)
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB:', mongoose.connection.db.databaseName);
  
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).project({ email: 1, password: 1 }).toArray();
  console.log(`Found ${users.length} users:`);
  
  for (const u of users) {
    const match = await bcrypt.compare('password123', u.password);
    console.log(`  ${u.email} -> password match: ${match}`);
  }
  
  process.exit(0);
}
check();
