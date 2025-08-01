// src/services/paymentService.js
import razorpayInstance from '../config/razorpay.js';
import crypto from 'crypto';
import config from '../config/env.js';

export const createOrder = async ({ amount, currency, receipt }) => {
  // Razorpay expects the amount in the smallest currency unit (e.g., paise for INR).
  // We'll assume the amount comes in as the main currency unit (e.g., rupees) and convert it.
  const amountInSmallestUnit = Math.round(amount * 100);

  const options = { amount: amountInSmallestUnit, currency, receipt, payment_capture: 1 };
  try {
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (err) {
    console.error("Razorpay API Error:", err); // Log the full error for debugging
    // The actual error message from Razorpay is often nested.
    const errorMessage = err.error?.description || err.message || 'An unknown error occurred with the payment provider.';
    throw new Error(`Failed to create payment order: ${errorMessage}`);
  }
};

export const fetchOrder = async (orderId) => {
  try {
    // Fetches order details from Razorpay API
    return await razorpayInstance.orders.fetch(orderId);
  } catch (err) {
    console.error(`Failed to fetch Razorpay order ${orderId}:`, err);
    const errorMessage = err.error?.description || err.message || 'Could not fetch order details from payment provider.';
    throw new Error(errorMessage);
  }
};

export const verifyPayment = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const hmac = crypto.createHmac('sha256', config.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = hmac.digest('hex');
  return digest === razorpay_signature;
};

export const initiateRefund = async (paymentId, amount) => {
  try {
    // Razorpay expects amount in smallest unit
    const amountInSmallestUnit = Math.round(amount * 100);
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: amountInSmallestUnit,
      speed: 'normal', // 'normal' takes 5-7 days, 'optimum' is faster but may cost more
      notes: {
        reason: 'Customer requested cancellation via turf booking system.',
      },
    });
    return refund;
  } catch (err) {
    const errorMessage = err.error?.description || err.message || 'Could not process refund with payment provider.';
    throw new Error(`Refund failed: ${errorMessage}`);
  }
};
