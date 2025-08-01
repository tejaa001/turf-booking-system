// ✅ Centralized config loader. This should be the very first import.
import config from './src/config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// (Optional) Log specific variables
console.log('✅ Environment:', {
  NODE_ENV: config.NODE_ENV,
  PORT: config.PORT,
  JWT_SECRET: config.JWT_SECRET ? 'Loaded ✅' : 'Missing ❌',
  MONGODB_URI: config.MONGODB_URI ? 'Loaded ✅' : 'Missing ❌',
  RAZORPAY_KEY_ID: config.RAZORPAY_KEY_ID ? 'Loaded ✅' : 'Missing ❌',
  RAZORPAY_KEY_SECRET: config.RAZORPAY_KEY_SECRET ? 'Loaded ✅' : 'Missing ❌',
  REDIS_ENABLED: config.REDIS_ENABLED,
});

// 🚀 Import AFTER loading env
import app from './app.js';
import logger from './src/utils/logger.js';
import { connectDatabase } from './src/config/database.js';
import { connectRedis } from './src/config/redis.js';

const normalizePort = val => {
  const port = parseInt(val, 10);
  return isNaN(port) ? val : port > 0 ? port : false;
};

const PORT = normalizePort(config.PORT);

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT} [${config.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Fatal startup error:', err);
    process.exit(1);
  }
};

startServer();
