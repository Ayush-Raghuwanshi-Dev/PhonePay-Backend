import express from 'express';
const router = express.Router();
import { registerUser, loginUser, setupMpin, getUserProfile } from '../controllers/userController.js';
import protect from '../middleware/protect.js';
import { specificLimit } from '../middleware/rateLimiter.js';

router.post('/register', specificLimit, registerUser);
router.post('/login', specificLimit, loginUser);
router.post('/set-mpin', protect, setupMpin);
router.get('/profile', protect, getUserProfile);

export default router;
