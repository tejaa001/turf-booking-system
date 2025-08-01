// src/middleware/validation.js
import Joi from 'joi';

// Returns a middleware function for validating req.body against a Joi schema
export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(d => d.message),
    });
  }
  req.body = value;
  next();
};

// Example usage: validateBody(userRegistrationSchema)

/**
 * Validates the request query parameters against a Joi schema.
 * @param {Joi.Schema} schema The Joi schema to validate against.
 * @returns {Function} An Express middleware function.
 */
export const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true, // Remove any query params not defined in the schema
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ status: 'error', message: 'Invalid query parameters', errors });
  }

  req.query = value; // Replace query with validated and sanitized values
  next();
};
