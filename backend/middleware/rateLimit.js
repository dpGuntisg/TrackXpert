import rateLimit from 'express-rate-limit';

export const createAccountLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15, // limit each IP to 15 account creation attempts per minute
    message: 'Too many account creation attempts from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

export const signInLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 login attempts per minute
    message: 'Too many login attempts, please try again later',
});

export const trackCreationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 tracks per minute
    message: 'Too many tracks created in a short period. Please wait a bit before creating more.',
});

export const eventCreationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 events per minute
    message: 'Too many events created. Try again later.',
});

export const updateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 updates per minute
    message: 'Too many updates in a short time. Slow down!',
});