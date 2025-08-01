// src/models/Revenue.js
import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const RevenueSchema = new Schema({
  date: { type: Date, required: true },
  turfId: { type: Types.ObjectId, ref: 'Turf', required: true },
  totalRevenue: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  totalCancellations: { type: Number, default: 0 },
  lastCalculated: { type: Date, default: Date.now },
});

// Compound index to ensure one revenue doc per turf per day, which improves query performance.
RevenueSchema.index({ turfId: 1, date: 1 }, { unique: true });

export default model('Revenue', RevenueSchema);