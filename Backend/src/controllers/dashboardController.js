// src/controllers/dashboardController.js
import Booking from '../models/Booking.js';
import Turf from '../models/Turf.js';
import Revenue from '../models/Revenue.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const overview = asyncHandler(async (req, res, next) => {
  const adminId = req.admin.id;
  const turfs = await Turf.find({ adminId });
  const turfIds = turfs.map((t) => t._id);

  const totalBookings = await Booking.countDocuments({ turfId: { $in: turfIds } });
  const totalRevenue = await Revenue.aggregate([
    { $match: { turfId: { $in: turfIds } } },
    { $group: { _id: null, sum: { $sum: '$totalRevenue' } } },
  ]);

  res.json({
    totalTurfs: turfs.length,
    totalBookings,
    totalRevenue: totalRevenue?.[0]?.sum || 0,
  });
});

// Additional dashboard analytics can be added here (occupancy rates, popular slots, etc)
