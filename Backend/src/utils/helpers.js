// src/utils/helpers.js
import { randomBytes } from 'crypto';

/**
 * Generates a unique booking ID (prefix + timestamp + random hex)
 * Example: BK20240716-4f3d2c
 */
export const generateBookingId = (prefix = 'BK') => {
  return (
    prefix +
    new Date().toISOString().slice(0, 10).replace(/-/g, '') +
    '-' +
    randomBytes(3).toString('hex')
  );
};

/**
 * Simple date formatting (YYYY-MM-DD)
 */
export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};
