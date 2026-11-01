/**
 * Centralized error-handling middleware.
 * Formats errors into consistent JSON responses.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'An unexpected internal server error occurred',
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    },
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found at ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
};
