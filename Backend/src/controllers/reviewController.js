// src/controllers/reviewController.js
import Booking from '../models/Booking.js';
import asyncHandler from '../middleware/asyncHandler.js';

// View all reviews for a turf (admin-view)
export const getTurfReviews = asyncHandler(async (req, res, next) => {
  const { turfId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = { turfId, review: { $exists: true, $ne: '' } };

  const bookings = await Booking.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalReviews = await Booking.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      reviews: bookings.map((b) => ({ user: b.userId, rating: b.rating, review: b.review, date: b.createdAt })),
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: parseInt(page, 10),
    },
  });
});

// Admin/user respond to a review (optional - as comment / reply)
export const respondToReview = async (req, res, next) => {
  // Implementation depends on schema (add field if replies needed)
  res.status(501).json({ message: "Review replies not implemented." });
};
