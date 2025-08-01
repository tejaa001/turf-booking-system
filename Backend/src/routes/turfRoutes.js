import express from 'express';
import * as turfController from '../controllers/turfController.js';
import { validateQuery } from '../middleware/validation.js';
import { search as searchValidator } from '../validators/turfValidator.js';

const router = express.Router();

// Public Routes
router.get('/', validateQuery(searchValidator), turfController.getAllTurfs);

router.get('/:id', turfController.getTurfDetails);
router.get('/:id/availability/:date', turfController.getTurfAvailability);

export default router;
