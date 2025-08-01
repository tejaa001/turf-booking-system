import { verifyToken } from '../services/authService.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import asyncHandler from './asyncHandler.js';

// Helper to extract and verify the token from the request header.
const getVerifiedPayload = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Authentication token is required. Please log in.');
    err.statusCode = 401;
    throw err;
  }
  const token = authHeader.split(' ')[1];
  // verifyToken will throw an error if the token is invalid or expired.
  return verifyToken(token);
};

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const payload = getVerifiedPayload(req);

  // This route is for users only.
  if (payload.isAdmin) {
    return res.status(403).json({ status: 'error', message: 'Forbidden: This route is for users only.' });
  }

  const user = await User.findById(payload.id).select('-password');
  if (!user || !user.isActive) {
    return res.status(401).json({ status: 'error', message: 'User not found or account is disabled.' });
  }

  req.user = user;
  next();
});

export const isAdmin = asyncHandler(async (req, res, next) => {
  const payload = getVerifiedPayload(req);

  if (!payload.isAdmin) {
    return res.status(403).json({ status: 'error', message: 'Forbidden: Admin access required.' });
  }

  const admin = await Admin.findById(payload.id).select('-password');
  if (!admin || !admin.isActive) {
    return res.status(401).json({ status: 'error', message: 'Admin not found or account is disabled.' });
  }

  req.admin = admin; // Attach admin object to the request
  next();
});
