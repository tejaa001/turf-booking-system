// src/utils/constants.js

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
});

export const PAYMENT_METHOD = Object.freeze({
  ONLINE: 'online',
  CASH: 'cash',
});

export const BOOKING_STATUS = Object.freeze({
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
});

export const DEFAULT_PAGE_SIZE = 20;
