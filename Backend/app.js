// Core dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './src/config/env.js';

// Custom middlewares
import rateLimiter from './src/middleware/rateLimiter.js';
import errorHandler from './src/middleware/errorHandler.js';

// Route imports
import adminRoutes from './src/routes/adminRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import turfRoutes from './src/routes/turfRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';

// Initialize Express app
const app = express();

// --- Global Middleware ---
app.use(cors({
  origin:["http://localhost:5173"]
}));
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimiter);

// Security: Hide X-Powered-By to prevent tech stack leaks
app.disable('x-powered-by');

// --- API Routes ---
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// --- 404 Handler for Unknown Routes ---
app.use((req, res, next) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// --- Global Error Handler ---
app.use(errorHandler);

export default app;
