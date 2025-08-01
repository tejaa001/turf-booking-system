// src/routes/reviewRoutes.js
import express from 'express';
import { isAdmin } from '../middleware/auth.js';
import { getTurfReviews } from '../controllers/reviewController.js';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

// Review viewing for admins
router.get('/turf/:turfId', getTurfReviews);

// Add reply/comment as needed
// router.post('/:reviewId/reply', authenticateAdmin, reviewController.respondToReview);

export default router;
