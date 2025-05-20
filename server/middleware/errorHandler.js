import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (err, req, res, next) => {
  // Default error object
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Something went wrong, please try again later'
  };

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = Object.values(err.errors)
      .map(item => item.message)
      .join(', ');
  }

  // Mongoose duplicate key error
  if (err.code && err.code === 11000) {
    customError.statusCode = StatusCodes.CONFLICT;
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field`;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    customError.statusCode = StatusCodes.UNAUTHORIZED;
    customError.message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    customError.statusCode = StatusCodes.UNAUTHORIZED;
    customError.message = 'Your token has expired. Please log in again.';
  }

  // Return error response
  return res.status(customError.statusCode).json({
    success: false,
    message: customError.message
  });
};

export default errorHandlerMiddleware;