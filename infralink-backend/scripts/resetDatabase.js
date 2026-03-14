import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const reset = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('⚠️  Connected. Resetting database...');
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database dropped successfully.');
    await mongoose.disconnect();
};

reset().catch((e) => { console.error(e); process.exit(1); });
