// src/validators/bookingValidator.js
import Joi from 'joi';

// Schema for a single time slot object
const timeSlotSchema = Joi.object({
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(), // "09:00"
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
});

// Booking creation
export const create = Joi.object({
  turfId: Joi.string().hex().length(24).required(),
  bookingDate: Joi.date().iso().required(),
  // The payload should now contain an array of time slots, not a single object.
  // We validate that it's an array and contains at least one valid time slot.
  timeSlots: Joi.array().items(timeSlotSchema).min(1).required(),
  totalAmount: Joi.number().positive().required(),
  paymentMethod: Joi.string().valid('online', 'cash').required(),
  playerCount: Joi.number().integer().min(1),
});

// Booking cancellation
export const cancel = Joi.object({
  cancellationReason: Joi.string().min(2).required(),
});

// Booking review
export const review = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().min(2).max(500).optional(),
});
