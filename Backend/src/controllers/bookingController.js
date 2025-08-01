// src/controllers/bookingController.js
import * as bookingService from '../services/bookingService.js';
import * as slotService from '../services/slotService.js';
import * as paymentService from '../services/paymentService.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const createBooking = asyncHandler(async (req, res, next) => {
  // The booking service already checks for slot availability.
  const bookingData = {
    ...req.body,
    userId: req.user.id, // Securely inject the authenticated user's ID
  };

  // Create the booking with a 'pending' payment status.
  const booking = await bookingService.createBooking(bookingData);

  // If payment is online, create a Razorpay order and return it.
  // The slot will only be marked as booked after successful payment verification.
  if (booking.paymentMethod === 'online') {
    const order = await paymentService.createOrder({
      amount: booking.totalAmount,
      currency: 'INR',
      receipt: booking.bookingId, // Use our internal bookingId as the receipt
    });
    res.status(201).json({ status: 'success', data: { booking, order } });
  } else {
    // If payment is cash, mark all slots in the booking as booked immediately.
    // This was a latent bug that would have occurred after fixing the validation.
    for (const slot of booking.timeSlots) {
      const timeSlotString = `${slot.start_time}-${slot.end_time}`;
      await slotService.markSlotAsBooked(booking.turfId, booking.bookingDate, timeSlotString, booking._id);
    }
    res.status(201).json({ status: 'success', data: { booking } });
  }
});

export const getBooking = asyncHandler(async (req, res, next) => {
  const booking = await bookingService.getBookingById(req.params.id);

  if (!booking) {
    return res.status(404).json({ status: 'error', message: 'Booking not found' });
  }

  res.status(200).json({
    status: 'success',
    data: { booking },
  });
});

export const cancelBooking = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const booking = await bookingService.cancelBooking(id, cancellationReason);

    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Booking has been cancelled.',
      data: { booking },
    });
  } catch (error) {
    // Handle specific business logic errors with a client-friendly response.
    if (error.message === 'Cannot cancel a booking that has already passed.') {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    // For other unexpected errors, let the asyncHandler's catch block handle it.
    throw error;
  }
});

// User booking history/upcoming delegated to userController
export const submitReview = asyncHandler(async (req, res, next) => {
  try {
    const { id: bookingId } = req.params;
    const booking = await bookingService.submitReview(bookingId, req.body);

    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Thank you for your review!',
      data: { booking },
    });
  } catch (error) {
    // Handle specific business logic errors with a client-friendly 400 response.
    if (error.message.includes('Cannot submit a review') || error.message.includes('A review has already been submitted')) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    // For other unexpected errors, let the asyncHandler's catch block handle it.
    throw error;
  }
});
