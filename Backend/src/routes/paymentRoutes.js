// src/routes/paymentRoutes.js
import express from 'express';
import { validateBody } from '../middleware/validation.js';
import { isAuthenticated } from '../middleware/auth.js'; // ✅ Named import

import * as paymentValidator from '../validators/paymentValidator.js';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

// Payment-related endpoints require authentication
router.use(isAuthenticated);

router.post(
  '/create-order',
  validateBody(paymentValidator.createOrder),
  paymentController.createOrder
);

router.post('/verify', validateBody(paymentValidator.verify), paymentController.verify);
router.get('/:id/status', paymentController.paymentStatus);

export default router;
