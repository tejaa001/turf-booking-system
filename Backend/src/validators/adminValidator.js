// src/validators/adminValidator.js
import Joi from 'joi';

// Register
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string()
    .pattern(/^[+]?[\d\- ]{7,15}$/)
    .required(),
});

// Login
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Profile Update
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\- ]{7,15}$/),
  email: Joi.string().email(),
}).min(1);

export const toggleTurfStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});
