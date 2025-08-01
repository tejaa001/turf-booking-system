import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  addTurf,
  getTurfs,
  getTurf,
  updateTurf,
  deleteTurf,
  toggleTurfStatus,
  getTurfBookings,
  getDailyRevenue,
  getRevenueReport,
} from '../controllers/adminController.js';
import { overview as dashboardOverview } from '../controllers/dashboardController.js';
import { isAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  toggleTurfStatusSchema,
} from '../validators/adminValidator.js';
import { createTurfSchema, updateTurfSchema } from '../validators/turfValidator.js';
import { uploadTurfImages } from '../middleware/upload.js';
import { processFormData } from '../middleware/formDataHandler.js';

const router = express.Router();

// Admin Auth & Profile
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/profile', isAdmin, getProfile);
router.put('/profile', isAdmin, validateBody(updateProfileSchema), updateProfile);

// Turf Management by Admin (RESTful approach)
router.post(
  '/turfs',
  isAdmin,
  uploadTurfImages, // 1. Handle file uploads
  processFormData, // 2. Parse nested form-data fields
  validateBody(createTurfSchema), // 3. Validate the populated req.body
  addTurf
);

router.get('/turfs', isAdmin, getTurfs);
router.get('/turfs/:id', isAdmin, getTurf);

router.put(
  '/turfs/:id',
  isAdmin,
  uploadTurfImages, // 1. Handle file uploads
  processFormData, // 2. Parse nested form-data fields
  validateBody(updateTurfSchema), // 3. Use the correct update schema
  updateTurf
);

router.delete('/turfs/:id', isAdmin, deleteTurf);

// Note: Corrected path to be more RESTful and fixed validation
router.patch(
  '/turfs/:id/status',
  isAdmin,
  validateBody(toggleTurfStatusSchema),
  toggleTurfStatus
);

// Bookings
router.get('/turfs/:id/bookings', isAdmin, getTurfBookings);

// Revenue
router.get('/revenue/daily/:date', isAdmin, getDailyRevenue);
router.get('/revenue/report', isAdmin, getRevenueReport);

// Dashboard
router.get('/dashboard/overview', isAdmin, dashboardOverview);

export default router;
