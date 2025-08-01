// src/services/authService.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js'
import config from '../config/env.js';

export const hashPassword = async (plainPwd) => {
  const saltRounds = 10;
  return await bcrypt.hash(plainPwd, saltRounds);
};

export const comparePassword = async (plainPwd, hash) => {
  return await bcrypt.compare(plainPwd, hash);
};

export const generateToken = (payload, expiresIn = config.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

// User Registration
export const registerUser = async (data) => {
  const hash = await hashPassword(data.password);
  const createdUser = await User.create({
    ...data,
    password: hash,
  });
  return createdUser;
};

// Admin Registration
export const registerAdmin = async (data) => {
  const hash = await hashPassword(data.password);
  const createdAdmin = await Admin.create({
    ...data,
    password: hash,
    isAdmin: true,
  });
  return createdAdmin;
};

// Login (User/Admin)
export const login = async ({ email, password, isAdmin = false }) => {
  const Model = isAdmin ? Admin : User;
  const user = await Model.findOne({ email });
  if (!user) throw new Error('Account not found');
  if (!user.isActive) throw new Error('Account disabled');
  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error('Incorrect password');
  const payload = { id: user._id, email: user.email, isAdmin };
  const token = generateToken(payload);
  return { user, token };
};
