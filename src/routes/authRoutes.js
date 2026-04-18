
import express from 'express';

const router = express.Router();

import { registerUser, loginUser, setupMpin, getUserProfile } from '../controllers/userController.js';
import protect from '../middleware/protect.js';

// @route   POST /api/auth/register
router.post('/register', registerUser);
// @route   POST /api/auth/login
router.post('/login', loginUser);
router.post('/set-mpin', protect, setupMpin);
router.get('/profile', protect, getUserProfile);

export default router;