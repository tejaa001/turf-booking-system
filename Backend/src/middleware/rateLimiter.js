import rateLimit from 'express-rate-limit';
import config from '../config/env.js';

/**
 * Configurable rate limiter that applies different rules for production and development environments.
 * This prevents hitting rate limits during development while protecting the production API.
 */
const apiLimiter = rateLimit({
  windowMs: config.NODE_ENV === 'production' ? 15 * 60 * 1000 : 1 * 60 * 1000, // 15 mins in prod, 1 min in dev
  max: config.NODE_ENV === 'production' ? 100 : 1000, // 100 requests per window in prod, 1000 in dev
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  // To use your Redis store in production, you can install `rate-limit-redis`
  // and configure it like this:
  //
  // import { RedisStore } from 'rate-limit-redis';
  // import { getRedisClient } from '../config/redis.js';
  //
  // store: new RedisStore({
  //   sendCommand: (...args) => getRedisClient().sendCommand(args),
  // }),
});

export default apiLimiter;
