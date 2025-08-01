// src/controllers/turfController.js
import * as turfService from '../services/turfService.js';
import * as slotService from '../services/slotService.js';
import asyncHandler from '../middleware/asyncHandler.js';

// Helper to escape regex special characters to prevent injection or errors
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// ───── PUBLIC ROUTES ─────
const getAllTurfs = asyncHandler(async (req, res, next) => {
  // Explicitly pick allowed query params for filtering to prevent NoSQL injection
  const { page = 1, limit = 10, name, location, priceMin, priceMax, amenities } = req.query;
  const filters = {
    isActive: true,
  };

  if (name) filters.turfName = new RegExp(escapeRegex(name), 'i');
  if (location) filters.address = new RegExp(escapeRegex(location), 'i');
  if (priceMin) filters.pricePerHour = { ...filters.pricePerHour, $gte: Number(priceMin) };
  if (priceMax) filters.pricePerHour = { ...filters.pricePerHour, $lte: Number(priceMax) };
  // The `validateQuery` middleware now transforms the comma-separated `amenities` string
  // into an array, so we can use it directly in the `$in` operator.
  if (amenities && amenities.length > 0) {
    filters.amenities = { $in: amenities };
  }

  const options = { page: parseInt(page, 10), limit: parseInt(limit, 10) };
  const data = await turfService.getAllTurfs(filters, options);
  res.json({ status: 'success', data });
});

const getTurfDetails = asyncHandler(async (req, res, next) => {
  const turf = await turfService.getTurfById(req.params.id);
  res.json({ status: 'success', data: { turf } });
});

const getTurfAvailability = asyncHandler(async (req, res, next) => {
  const { id: turfId, date } = req.params;
  // Use the service to find or create the timesheet for the day.
  // This ensures consistency with the booking logic.
  const timeSlotDoc = await slotService.createTimeSlotsForDate(turfId, new Date(date));
  res.json({
    status: 'success',
    data: {
      slots: timeSlotDoc ? timeSlotDoc.slots : [],
    },
  });
});

// ✅ Export all functions properly
export {
  getAllTurfs,
  getTurfAvailability,
  getTurfDetails,
};
