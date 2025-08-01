// src/utils/logger.js
import { createLogger, format, transports } from 'winston';

const ENV = process.env.NODE_ENV || 'development';

const logger = createLogger({
  level: ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      let msg = `[${timestamp}] ${level}: ${message}`;
      if (Object.keys(meta).length) msg += ` ${JSON.stringify(meta)}`;
      return msg;
    })
  ),
  transports: [new transports.Console()],
});

export default logger;
