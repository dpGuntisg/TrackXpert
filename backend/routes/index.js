import express from 'express';
import userRoutes from './userRoutes.js';
import trackRoutes from './trackRoutes.js';
import trackRequestRoutes from './trackRequestRoutes.js';
import locationRoutes from './locationRoutes.js';
import eventRoutes from './eventRoutes.js';
import eventRegistrationRoutes from './eventRegistrationRoutes.js';
import pdfTicketRoutes from './pdfTicketRoutes.js';
import adminRoutes from './adminRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/tracks', trackRoutes);
router.use('/track-requests', trackRequestRoutes);
router.use('/locations', locationRoutes);
router.use('/events', eventRoutes);
router.use('/event-registrations', eventRegistrationRoutes);
router.use('/tickets', pdfTicketRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);

export default router;