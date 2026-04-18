import rateLimit from 'express-rate-limit';

// Standard rate limiter for all API routes (e.g. 100 requests per 15 minutes)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Stricter rate limiter specifically for crucial operations like login or money transfer
export const specificLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 auth/transfer requests per `window`
  message: {
    success: false,
    message: "Maximum security limit reached. Please try again after an hour."
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});
