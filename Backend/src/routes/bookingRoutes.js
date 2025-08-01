// src/routes/bookingRoutes.js
import express from 'express';
import { validateBody } from '../middleware/validation.js';
import { isAuthenticated } from '../middleware/auth.js';

import * as bookingValidator from '../validators/bookingValidator.js';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

// 🔒 All routes below require authentication
router.use(isAuthenticated);

router.post('/create', validateBody(bookingValidator.create), bookingController.createBooking);
router.get('/:id', bookingController.getBooking);
router.put('/:id/cancel', validateBody(bookingValidator.cancel), bookingController.cancelBooking);
router.post('/:id/review', validateBody(bookingValidator.review), bookingController.submitReview);

export default router;
