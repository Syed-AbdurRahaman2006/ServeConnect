/**
 * Async handler wrapper for Express route handlers.
 * Eliminates the need for try/catch blocks in every controller.
 *
 * @param {Function} fn - Async route handler function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
