// src/controllers/paymentController.js
import * as paymentService from '../services/paymentService.js';
import * as bookingService from '../services/bookingService.js';
import * as slotService from '../services/slotService.js';
import logger from '../utils/logger.js';
import asyncHandler from '../middleware/asyncHandler.js';

/**
 * @desc    Create a Razorpay order
 * @route   POST /api/payments/create-order
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  // NOTE: This endpoint is for ad-hoc payment order creation.
  // For booking-related payments, the primary entry point is POST /api/bookings/create,
  // which internally creates a booking and then a corresponding payment order.
  const order = await paymentService.createOrder(req.body);

  // The service layer throws an error on failure, which is caught by asyncHandler.
  // Convert amount from paise back to the major currency unit for the client response.
  const clientResponse = {
    ...order,
    amount: order.amount / 100,
    amount_due: order.amount_due / 100,
    amount_paid: order.amount_paid / 100,
  };

  res.status(201).json(clientResponse);
});

/**
 * @desc    Verify a Razorpay payment
 * @route   POST /api/payments/verify
 * @access  Private
 */
export const verify = asyncHandler(async (req, res) => {
  const isVerified = paymentService.verifyPayment(req.body);

  if (!isVerified) {
    return res.status(400).json({ status: 'error', message: 'Payment verification failed: Invalid signature.' });
  }

  // Fetch the order from Razorpay to get the receipt (our bookingId)
  const order = await paymentService.fetchOrder(req.body.razorpay_order_id);
  const bookingId = order.receipt;

  // Confirm the booking in our database
  const booking = await bookingService.confirmOnlineBooking(bookingId, req.body.razorpay_payment_id);
  if (!booking) {
    logger.error(`Payment verified but booking not found for bookingId: ${bookingId}`);
    return res.status(404).json({ status: 'error', message: 'Booking not found for this payment.' });
  }

  // Mark all time slots in the booking as booked.
  // This was a latent bug that would have occurred after fixing the validation.
  for (const slot of booking.timeSlots) {
    const timeSlotString = `${slot.start_time}-${slot.end_time}`;
    await slotService.markSlotAsBooked(booking.turfId, booking.bookingDate, timeSlotString, booking._id);
  }

  res.status(200).json({ status: 'success', message: 'Payment verified and booking confirmed successfully.' });
});

export const paymentStatus = asyncHandler(async (req, res) => {
  const order = await paymentService.fetchOrder(req.params.id);

  // The service layer throws an error if the order is not found, which is caught by asyncHandler.
  const clientResponse = {
    ...order,
    amount: order.amount / 100,
    amount_due: order.amount_due / 100,
    amount_paid: order.amount_paid / 100,
  };
  res.status(200).json(clientResponse);
});