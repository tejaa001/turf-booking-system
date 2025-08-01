// src/validators/paymentValidator.js
import Joi from 'joi';

export const createOrder = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('INR').required(),
  receipt: Joi.string().required(),
});

export const verify = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});