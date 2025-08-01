// src/config/database.js
import mongoose from 'mongoose';
import config from './env.js';

export const connectDatabase = async () => {
  try {
    // The config/env.js file already validates that MONGODB_URI is present.
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Exit process on DB failure
  }
};

export default mongoose;
