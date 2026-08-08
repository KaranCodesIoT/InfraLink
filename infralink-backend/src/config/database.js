import mongoose from 'mongoose';
import dns from 'dns';
import logger from '../utils/logger.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS set errors
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    if (process.env.MOCK_SERVICES === 'true') {
      logger.warn('⚠️  Running in MOCK MODE for database. No data will be persisted.');
      return;
    }
    process.exit(1);
  }
};

export default connectDB;
