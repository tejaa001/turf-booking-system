// src/controllers/authController.js
import * as authService from '../services/authService.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

export const login = async (req, res, next) => {
  try {
    const { email, password, isAdmin = false } = req.body;
    const { user, token } = await authService.login({ email, password, isAdmin });
    res.json({ user, token });
  } catch (e) { next(e); }
};

export const logout = async (req, res, next) => {
  try {
    // You can clear refreshToken from DB here if used.
    res.json({ message: 'Logged out successfully' });
  } catch (e) { next(e); }
};

export const refreshToken = async (req, res, next) => {
  try {
    // Get refreshToken from req.body or cookies
    const { refreshToken } = req.body;
    const payload = authService.verifyToken(refreshToken);
    let user = null;
    if (payload.isAdmin) user = await Admin.findById(payload.id);
    else user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    const token = authService.generateToken(payload);
    res.json({ token });
  } catch (e) { next(e); }
};
