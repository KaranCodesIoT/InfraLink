import mongoose from 'mongoose';
import logger from '../utils/logger.js';

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
