import Joi from 'joi';
import { ROLES } from '../utils/constants.js';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.base': 'Name should be a type of text',
    'string.empty': 'Name cannot be an empty field',
    'string.min': 'Name should have a minimum length of {#limit}',
    'string.max': 'Name should have a maximum length of {#limit}',
    'any.required': 'Name is a required field'
  }),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\- ]{7,15}$/).required().messages({
    'string.pattern.base': 'Please provide a valid phone number.',
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required().messages({
    'string.pattern.base': 'Password must be between 3 and 30 characters and contain only letters and numbers',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid(ROLES.USER, ROLES.ADMIN).default(ROLES.USER),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  }),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\- ]{7,15}$/),
  // Note: Updating email might require a verification flow in a real-world app.
  email: Joi.string().email(),
})
.min(1) // Ensures that the request body is not empty
.messages({ 'object.min': 'You must provide at least one field to update.' });