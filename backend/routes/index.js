import express from 'express';
import userRoutes from './userRoutes.js';
import trackRoutes from './trackRoutes.js';
import trackRequestRoutes from './trackRequestRoutes.js';
import locationRoutes from './locationRoutes.js';
const router = express.Router();

router.use('/users', userRoutes);
router.use('/tracks', trackRoutes);
router.use('/track-requests', trackRequestRoutes);
router.use('/locations', locationRoutes);
export default router;