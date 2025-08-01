// src/services/slotService.js
import TimeSlot from "../models/TimeSlot.js";
import Turf from "../models/Turf.js";

// Helper: Generate slots
export const generateSlots = (open, close, slotDuration = 60) => {
  const toMinutes = (t) =>
    Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);
  let slots = [];
  let cur = toMinutes(open);
  const end = toMinutes(close);
  while (cur + slotDuration <= end) {
    const start = `${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(
      cur % 60
    ).padStart(2, "0")}`;
    cur += slotDuration;
    const finish = `${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(
      cur % 60
    ).padStart(2, "0")}`;
    slots.push({ time: `${start}-${finish}`, isBooked: false });
  }
  return slots;
};

// Create slots for a turf and date
export const createTimeSlotsForDate = async (turfId, date) => {
  const turf = await Turf.findById(turfId);
  if (!turf) throw new Error("Turf not found");
  const existing = await TimeSlot.findOne({ turfId, date });
  if (existing) return existing;
  const slots = generateSlots(
    turf.operatingHours.open_time,
    turf.operatingHours.close_time
  );
  const timeSlot = await TimeSlot.create({ turfId, date, slots });
  return timeSlot;
};

export const checkSlotAvailability = async (turfId, date, slotTime) => {
  // Find or create the timeslot document for the given day.
  let timeSlotDoc = await TimeSlot.findOne({ turfId, date });
  if (!timeSlotDoc) {
    timeSlotDoc = await createTimeSlotsForDate(turfId, date);
    if (!timeSlotDoc) {
      // This would happen if the turfId is invalid, for example.
      throw new Error(
        "Could not create or find time slots for the given turf and date."
      );
    }
  }
  const slot = timeSlotDoc.slots.find(
    (s) => s.time === slotTime && !s.isBooked
  );
  return !!slot;
};

export const markSlotAsBooked = async (turfId, date, slotTime, bookingId) => {
  // This operation is now atomic. It will only update a slot if it finds one that is NOT already booked.
  // This is crucial for preventing race conditions where two users try to book the same slot simultaneously.
  const updated = await TimeSlot.updateOne(
    { turfId, date, "slots.time": slotTime, "slots.isBooked": false },
    { $set: { "slots.$.isBooked": true, "slots.$.bookingId": bookingId } }
  );
  // If modifiedCount is 0, it means the slot was not available (either didn't exist or was already booked).
  // This check correctly handles the error reported from the payment controller.
  if (updated.modifiedCount === 0) {
    throw new Error(
      "Slot update failed. The slot may have been booked by another user or is otherwise unavailable."
    );
  }
};

export const freeSlot = async (turfId, date, slotTime) => {
  const updated = await TimeSlot.updateOne(
    // Only attempt to free a slot that is currently marked as booked.
    { turfId, date, "slots.time": slotTime, "slots.isBooked": true },
    { $set: { "slots.$.isBooked": false }, $unset: { "slots.$.bookingId": "" } }
  );
  // If modifiedCount is 0, it means no slot was found that matched the criteria (i.e., it was already free or didn't exist).
  // We no longer throw an error if the slot was already free.
  // This makes the freeSlot operation idempotent, meaning it can be called multiple times without causing an error.
  // This gracefully handles cases where a cancellation is re-attempted or if data is in an inconsistent state.
};
