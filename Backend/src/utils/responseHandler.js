// src/utils/responseHandler.js

export const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const sendError = (res, error = 'Internal server error', statusCode = 500) => {
  return res.status(statusCode).json({
    status: 'error',
    message: error instanceof Error ? error.message : error,
  });
};
