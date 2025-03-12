import express from 'express';
import userRoutes from './userRoutes.js';
import trackRoutes from './trackRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/tracks', trackRoutes);

export default router;