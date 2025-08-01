// src/models/Booking.js
import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const TimeSlotSchema = new Schema(
  {
    start_time: { type: String, required: true }, // eg "09:00"
    end_time: { type: String, required: true },   // eg "10:00"
  },
  { _id: false }
);

const BookingSchema = new Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    turfId: {
      type: Types.ObjectId,
      ref: 'Turf',
      required: true,
      index: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    timeSlots: {
      type: [TimeSlotSchema],
      required: true,
      // Ensure at least one slot is provided
      validate: [val => Array.isArray(val) && val.length > 0, 'At least one time slot is required.'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cash'],
      required: true,
    },
    paymentId: {
      type: String,
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    cancellationReason: {
      type: String,
    },
    playerCount: {
      type: Number,
      min: 1,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    collection: 'bookings',
    timestamps: false,
  }
);

export default model('Booking', BookingSchema);
