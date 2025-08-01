// src/models/TimeSlot.js
import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const SlotDetailSchema = new Schema(
  {
    time: { type: String, required: true }, // e.g. "09:00-10:00"
    isBooked: { type: Boolean, default: false },
    bookingId: { type: Types.ObjectId, ref: 'Booking' },
  },
  { _id: false }
);

const TimeSlotSchema = new Schema(
  {
    turfId: { type: Types.ObjectId, ref: 'Turf', required: true, index: true },
    date: { type: Date, required: true, index: true },
    slots: [SlotDetailSchema],
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    collection: 'timeslots',
    timestamps: false,
  }
);

export default model('TimeSlot', TimeSlotSchema);
