// src/services/revenueService.js
import Booking from '../models/Booking.js';
import Revenue from '../models/Revenue.js';
import mongoose from 'mongoose';

/**
 * Calculates and stores the revenue for a specific turf on a given date.
 * This function aggregates data directly from the Bookings collection to ensure accuracy.
 * @param {string} turfId - The ID of the turf.
 * @param {Date} date - The date for which to calculate revenue.
 * @returns {Promise<Document>} The updated or newly created revenue document.
 */
export const calculateRevenueForDate = async (turfId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Aggregate booking data for the specified day and turf.
  const stats = await Booking.aggregate([
    {
      $match: {
        turfId: new mongoose.Types.ObjectId(turfId),
        bookingDate: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          // Only sum the amount if the payment status is 'paid'.
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] },
        },
        totalBookings: {
          // Count bookings that are either 'confirmed' or 'completed'.
          $sum: { $cond: [{ $in: ['$bookingStatus', ['confirmed', 'completed']] }, 1, 0] },
        },
        totalCancellations: {
          // Count bookings that are 'cancelled'.
          $sum: { $cond: [{ $eq: ['$bookingStatus', 'cancelled'] }, 1, 0] },
        },
      },
    },
  ]);

  const calculatedData = {
    totalRevenue: stats[0]?.totalRevenue || 0,
    totalBookings: stats[0]?.totalBookings || 0,
    totalCancellations: stats[0]?.totalCancellations || 0,
    lastCalculated: new Date(),
  };

  // Use findOneAndUpdate with upsert to create or update the revenue document for the day.
  const revenueDoc = await Revenue.findOneAndUpdate(
    { turfId, date: startOfDay },
    { $set: calculatedData },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return revenueDoc;
};

/**
 * Generates a revenue report for a given date range and optional turfId.
 * @param {string|null} turfId - The ID of a specific turf, or null for all turfs.
 * @param {object} dateRange - An object with `from` and `to` Date objects.
 * @returns {Promise<Array>} An array of report objects.
 */
export const getRevenueReport = async (turfId, dateRange) => {
  const { from, to } = dateRange;
  const matchQuery = { date: { $gte: from, $lte: to } };
  if (turfId) {
    matchQuery.turfId = new mongoose.Types.ObjectId(turfId);
  }

  // This aggregates from the pre-calculated daily Revenue documents, which is efficient for reports.
  const report = await Revenue.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$turfId',
        totalRevenue: { $sum: '$totalRevenue' },
        totalBookings: { $sum: '$totalBookings' },
        totalCancellations: { $sum: '$totalCancellations' },
      },
    },
    // You can add a $lookup stage here to populate turf details if needed.
  ]);

  return report;
};