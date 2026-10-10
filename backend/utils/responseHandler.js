/**
 * Centralized API Response Formatter
 */

const sendSuccess = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'An error occurred', error = null, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? (typeof error === 'string' ? error : error.message) : message
  });
};

module.exports = {
  sendSuccess,
  sendError
};
