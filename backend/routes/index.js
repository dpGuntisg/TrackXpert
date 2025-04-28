import express from 'express';
import userRoutes from './userRoutes.js';
import trackRoutes from './trackRoutes.js';
import trackRequestRoutes from './trackRequestRoutes.js';
import locationRoutes from './locationRoutes.js';
import eventRoutes from './eventRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/tracks', trackRoutes);
router.use('/track-requests', trackRequestRoutes);
router.use('/locations', locationRoutes);
router.use('/events', eventRoutes);
export default router;