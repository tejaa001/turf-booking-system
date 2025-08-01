import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getBookings,
} from '../controllers/userController.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/userValidator.js';
import { validateBody } from '../middleware/validation.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Define the user registration route
// POST /api/users/register
router.post('/register', validateBody(registerSchema), registerUser);

// Define the user login route
// POST /api/users/login
router.post('/login', validateBody(loginSchema), loginUser);

// GET /api/users/profile - Requires authentication
router.get('/profile', isAuthenticated, getUserProfile);

// PUT /api/users/profile - Requires authentication
router.put('/profile', isAuthenticated, validateBody(updateProfileSchema), updateUserProfile);

// GET /api/users/bookings/upcoming - Get user's upcoming bookings.
router.get('/bookings/upcoming', isAuthenticated, getBookings);

// GET /api/users/bookings - Get all of a user's bookings.
// NOTE: This route is placed after '/bookings/upcoming' to ensure correct route matching.
router.get('/bookings', isAuthenticated, getBookings);

export default router;