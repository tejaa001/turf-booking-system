import { createClient } from 'redis';
import logger from '../utils/logger.js';
import config from './env.js';

let redisClient;

export const connectRedis = async () => {
  if (!config.REDIS_ENABLED) {
    logger.info('Redis is disabled. Skipping connection.');
    return;
  }

  // The config/env.js file will throw an error if REDIS_URL is missing when REDIS_ENABLED is true (implicitly)
  redisClient = createClient({ url: config.REDIS_URL });

  redisClient.on('error', (err) => logger.error('Redis Client Error', err));

  await redisClient.connect();
  logger.info('✅ Redis connected successfully.');
};

export const getRedisClient = () => {
  if (!config.REDIS_ENABLED || !redisClient) return null;
  return redisClient;
};