import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
    mongoose.connection.on('reconnected',  () => logger.info('MongoDB reconnected'));
    mongoose.connection.on('error', (err) => logger.error(`MongoDB error: ${err.message}`));
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    logger.warn('Retrying in 10 seconds...');
    setTimeout(connectDB, 10000);
  }
};

export default connectDB;
