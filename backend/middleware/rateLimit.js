import rateLimit from 'express-rate-limit';

export const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many accounts created from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });

  export const signInLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many login attempts, please try again later',
  });

  export const trackCreationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // max 3 tracks per 10 minutes
    message: 'Too many tracks created in a short period. Please wait a bit before creating more.',
  });

  export const eventCreationLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 2, // max 2 events per 30 minutes
    message: 'Too many events created. Try again later.',
  });

  export const updateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    message: 'Too many updates in a short time. Slow down!',
  });