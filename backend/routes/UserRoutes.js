import express from 'express';
import { createUser, getAllUsers, logUserOut, signInUser, userProfile, updateUser } from '../controllers/UserController.js';
import { createTrack, deleteTrack, getAllTracks, getTrackById, updateTrack , getTracksByUserId} from '../controllers/TrackController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/signup', createUser);
router.get('/users', verifyToken, getAllUsers);
router.post('/signin', signInUser);
router.get('/profile', verifyToken, userProfile);
router.patch('/profile/update', verifyToken ,updateUser)
router.get('/profile/:userId/tracks', verifyToken, getTracksByUserId);
router.post('/signout', logUserOut);
router.get('/verifyToken', verifyToken);

router.post('/createtrack', verifyToken, createTrack);
router.get('/tracks', getAllTracks);
router.delete('/tracks/:id', verifyToken, deleteTrack);
router.get('/tracks/:id', getTrackById);
router.patch('/tracks/:id', verifyToken, updateTrack);



export default router;
