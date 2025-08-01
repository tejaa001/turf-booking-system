/**
 * A higher-order function to wrap async route handlers and catch errors.
 * This avoids the need for repetitive try-catch blocks in every controller.
 * @param {Function} fn The async controller function to execute.
 * @returns {Function} An Express route handler function.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;