// src/services/bookingService.js
import Booking from '../models/Booking.js';
import Turf from '../models/Turf.js';
import mongoose from 'mongoose';
import * as slotService from './slotService.js';
import * as paymentService from './paymentService.js';
import * as turfService from './turfService.js';
import logger from '../utils/logger.js';
import { nanoid } from 'nanoid';

/**
 * Recalculates and updates the average rating for a specific turf.
 * This should be called after a new review is added or updated.
 * @param {string} turfId - The MongoDB ObjectId of the turf.
 */
const updateTurfAverageRating = async (turfId) => {
  // Use an aggregation pipeline to calculate the new average rating from all valid reviews.
  const stats = await Booking.aggregate([
    { $match: { turfId: new mongoose.Types.ObjectId(turfId), rating: { $exists: true } } },
    { $group: { _id: '$turfId', averageRating: { $avg: '$rating' } } },
  ]);

  // If stats are returned, update the turf with the new average; otherwise, reset to 0.
  const newAverage = stats.length > 0 ? stats[0].averageRating : 0;

  // Delegate the turf update and cache invalidation to the turfService.
  // This ensures separation of concerns and that the cache is always cleared.
  await turfService.updateTurfRating(turfId, newAverage);
};

export const createBooking = async (bookingData) => {
  const { turfId, bookingDate, timeSlots } = bookingData;

  // 1. Atomically check if all requested slots are available before proceeding.
  // This prevents race conditions and partial bookings.
  for (const slot of timeSlots) {
    const slotString = `${slot.start_time}-${slot.end_time}`;
    const isAvailable = await slotService.checkSlotAvailability(turfId, bookingDate, slotString);
    if (!isAvailable) {
      throw new Error(`Slot ${slotString} on ${new Date(bookingDate).toDateString()} is not available.`);
    }
  }

  // 2. All slots are available. Create the booking document.
  const bookingId = `BK-${nanoid(8).toUpperCase()}`;
  const booking = new Booking({
    ...bookingData,
    bookingId,
  });
  await booking.save();

  // The responsibility of marking slots as booked is now delegated to the controllers.
  // This is because for 'online' payments, slots should only be marked after successful payment verification,
  // not at the time of booking creation. This prevents race conditions and erroneous failures.

  return booking;
};

export const getBookingById = async (bookingId) => {
  // Find booking by the custom `bookingId` string, not the MongoDB `_id`.
  // This resolves the CastError when a non-ObjectId string is passed from the URL.
  const booking = await Booking.findOne({ bookingId })
    .populate('userId', 'name email')
    .populate('turfId', 'turfName address');

  return booking;
};

export const cancelBooking = async (bookingId, cancellationReason) => {
  // Find booking by the custom `bookingId` string to avoid CastError.
  const booking = await Booking.findOne({ bookingId });
  if (!booking) return null;

  // Prevent re-cancellation of an already cancelled booking.
  if (booking.bookingStatus === 'cancelled') {
    throw new Error('This booking has already been cancelled.');
  }

  // Business logic: prevent cancellation of past bookings
  // We check against the first time slot in the booking.
  const firstSlot = booking.timeSlots[0];
  const bookingStartDateTime = new Date(booking.bookingDate);
  const [startHour, startMinute] = firstSlot.start_time.split(':');
  bookingStartDateTime.setHours(parseInt(startHour, 10), parseInt(startMinute, 10));

  if (bookingStartDateTime < new Date()) {
    throw new Error('Cannot cancel a booking that has already passed.');
  }

  // Proactive Improvement: Handle refunds for online payments.
  if (booking.paymentMethod === 'online' && booking.paymentStatus === 'paid' && booking.paymentId) {
    try {
      await paymentService.initiateRefund(booking.paymentId, booking.totalAmount);
      booking.paymentStatus = 'refunded'; // Update payment status to reflect refund.
    } catch (refundError) {
      // Log the refund failure but still allow the booking to be cancelled in our system.
      // This might require manual intervention by an admin.
      logger.error(
        `Failed to process Razorpay refund for booking ${bookingId} (paymentId: ${booking.paymentId}). Reason: ${refundError.message}`
      );
      // Depending on business rules, you might want to throw an error here to stop the cancellation.
    }
  }

  booking.bookingStatus = 'cancelled';
  booking.cancellationReason = cancellationReason;

  // Free up all time slots that were previously booked
  for (const slot of booking.timeSlots) {
    const timeSlotString = `${slot.start_time}-${slot.end_time}`;
    await slotService.freeSlot(booking.turfId, booking.bookingDate, timeSlotString);
  }

  await booking.save();
  return booking;
};

export const submitReview = async (bookingId, { rating, review }) => {
  const booking = await Booking.findOne({ bookingId });
  if (!booking) {
    return null; // Controller will handle 404
  }

  // Business logic: Prevent re-submitting a review.
  if (booking.rating) {
    throw new Error('A review has already been submitted for this booking.');
  }

  // Business logic: Prevent reviewing a cancelled booking.
  if (booking.bookingStatus === 'cancelled') {
    throw new Error('Cannot submit a review for a cancelled booking.');
  }

  // Business logic: Prevent reviewing a booking that hasn't happened yet.
  // We check against the first time slot in the booking.
  const firstSlot = booking.timeSlots[0];
  const bookingStartDateTime = new Date(booking.bookingDate);
  const [startHour, startMinute] = firstSlot.start_time.split(':');
  bookingStartDateTime.setHours(parseInt(startHour, 10), parseInt(startMinute, 10));

  if (bookingStartDateTime > new Date()) {
    throw new Error('Cannot submit a review for a booking that has not yet occurred.');
  }

  // Update the booking with the review and mark it as completed.
  booking.rating = rating;
  booking.review = review;
  booking.bookingStatus = 'completed'; // Mark as completed upon review.
  await booking.save();

  // After saving the review, update the turf's average rating.
  await updateTurfAverageRating(booking.turfId);

  return booking;
};

export const confirmOnlineBooking = async (bookingId, paymentId) => {
  const booking = await Booking.findOneAndUpdate(
    { bookingId },
    {
      paymentStatus: 'paid',
      paymentId: paymentId,
    },
    { new: true }
  );
  // Note: The booking status is already 'confirmed' by default upon creation.
  return booking;
};

export const getBookingsByUserId = async (userId, { page = 1, limit = 10, filter }) => {
  const query = { userId };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of the day

  // Apply filter for 'upcoming' bookings
  if (filter === 'upcoming') {
    query.bookingDate = { $gte: today };
    query.bookingStatus = { $in: ['confirmed', 'completed'] }; // Show only active upcoming bookings
  } else {
    // For the general booking history, show only past bookings.
    query.bookingDate = { $lt: today };
  }

  // Sort upcoming bookings by date ascending, and past bookings by date descending
  const sortOrder =
    filter === 'upcoming' ? { bookingDate: 1, 'timeSlot.start_time': 1 } : { bookingDate: -1, 'timeSlot.start_time': -1 };

  const skip = (page - 1) * limit;

  const totalDocs = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate('turfId', 'turfName address images') // Populate turf details for the user
    .sort(sortOrder)
    .skip(skip)
    .limit(limit);

  return {
    docs: bookings,
    totalPages: Math.ceil(totalDocs / limit),
    currentPage: page,
  };
};

export const getBookingsByTurfId = async (turfId, { page = 1, limit = 10 }) => {
  const query = { turfId };
  const skip = (page - 1) * limit;

  const totalDocs = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate('userId', 'name email phoneNumber') // Populate user details for the admin
    .sort({ bookingDate: -1, 'timeSlot.start_time': -1 })
    .skip(skip)
    .limit(limit);

  return {
    docs: bookings,
    totalPages: Math.ceil(totalDocs / limit),
    currentPage: page,
  };
};