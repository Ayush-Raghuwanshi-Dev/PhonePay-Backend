import express from 'express';
const router = express.Router();
import protect from '../middleware/protect.js';
import { specificLimit } from '../middleware/rateLimiter.js';
import { sendMoney, getTransactionHistory, getAnalytics } from '../controllers/transactionController.js';

router.post('/send', protect, specificLimit, sendMoney);
router.get('/history', protect, getTransactionHistory);
router.get('/analytics', protect, getAnalytics);

export default router;
