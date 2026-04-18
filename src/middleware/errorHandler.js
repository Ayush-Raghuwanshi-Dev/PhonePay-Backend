export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  const errorResponse = {
    message: err.message,
    success: false,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  };

  // Mongoose validation error parsing
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    res.status(400);
    errorResponse.message = message;
  }

  // Duplicate key error
  if (err.code === 11000) {
    res.status(400);
    errorResponse.message = 'Duplicate field value entered';
  }

  res.json(errorResponse);
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
