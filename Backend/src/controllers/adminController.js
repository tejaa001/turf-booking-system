// src/controllers/adminController.js
import * as authService from '../services/authService.js';
import * as turfService from '../services/turfService.js';
import * as revenueService from '../services/revenueService.js';
import * as bookingService from '../services/bookingService.js';
import Booking from '../models/Booking.js';
import Admin from '../models/Admin.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const register = asyncHandler(async (req, res, next) => {
  const admin = await authService.registerAdmin(req.body);
  const adminResponse = {
    id: admin._id,
    name: admin.name,
    email: admin.email,
  };
  res.status(201).json({
    status: 'success',
    message: 'Admin registered successfully.',
    data: { admin: adminResponse },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { user: admin, token } = await authService.login({ ...req.body, isAdmin: true });
  admin.lastLogin = new Date();
  await admin.save();
  // Sanitize the admin object to avoid sending the password hash
  const adminResponse = {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    phoneNumber: admin.phoneNumber,
    lastLogin: admin.lastLogin,
  };
  res.status(200).json({
    status: 'success',
    data: { admin: adminResponse, token },
  });
});

export const getProfile = asyncHandler(async (req, res, next) => {
  // The `isAdmin` middleware already fetches and attaches the admin.
  // It's also sanitized (password is excluded).
  res.status(200).json({
    status: 'success',
    data: { admin: req.admin },
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findByIdAndUpdate(req.admin.id, req.body, { new: true }).select('-password');
  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully.',
    data: { admin },
  });
});

// Turfs
export const addTurf = asyncHandler(async (req, res, next) => {
  // The `processFormData` middleware has already parsed nested fields (like location and operatingHours)
  // from the multipart/form-data request into the `req.body` object.
  // We can now construct the complete turfData object to be sent to the service layer.
  const turfData = {
    ...req.body, // Spread all text fields from the validated and processed body
    adminId: req.admin.id,
    images: req.files, // Pass file data to the service layer
  };

  const turf = await turfService.addTurf(turfData);
  res.status(201).json({
    status: 'success',
    message: 'Turf added successfully.',
    data: { turf },
  });
});

export const getTurfs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const filter = { adminId: req.admin.id };
  const options = { page, limit };
  const data = await turfService.getAllTurfs(filter, options);
  res.status(200).json({
    status: 'success',
    data,
  });
});

export const getTurf = asyncHandler(async (req, res, next) => {
  const turf = await turfService.getTurfById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { turf },
  });
});

export const updateTurf = asyncHandler(async (req, res, next) => {
  // Combine text fields from body and new files from multer
  const updateData = {
    ...req.body,
    images: req.files, // Pass new file data to the service layer
  };

  const turf = await turfService.updateTurf(req.params.id, updateData);
  res.status(200).json({
    status: 'success',
    message: 'Turf updated successfully.',
    data: { turf },
  });
});

export const deleteTurf = asyncHandler(async (req, res, next) => {
  await turfService.deleteTurf(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Turf deleted successfully.',
  });
});

export const toggleTurfStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;
  const turf = await turfService.toggleTurfStatus(req.params.id, isActive);
  res.status(200).json({
    status: 'success',
    message: `Turf has been ${isActive ? 'activated' : 'deactivated'}.`,
    data: { turf },
  });
});

// Bookings by Turf
export const getTurfBookings = asyncHandler(async (req, res, next) => {
  const { id: turfId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const options = { page: parseInt(page, 10), limit: parseInt(limit, 10) };

  const data = await bookingService.getBookingsByTurfId(turfId, options);

  res.status(200).json({
    status: 'success',
    data,
  });
});

// Revenue endpoints
export const getDailyRevenue = asyncHandler(async (req, res, next) => {
  const { date } = req.params; // YYYY-MM-DD
  const revenue = await revenueService.calculateRevenueForDate(req.query.turfId, new Date(date));
  res.status(200).json({
    status: 'success',
    data: { revenue },
  });
});

export const getRevenueReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, turfId } = req.query;
  const report = await revenueService.getRevenueReport(turfId, {
    from: new Date(startDate),
    to: new Date(endDate),
  });
  res.status(200).json({
    status: 'success',
    data: { report },
  });
});
