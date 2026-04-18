import express from 'express';

const router = express.Router();

import protect from '../middleware/protect.js';

import { sendMoney, getTransactionHistory } from '../controllers/transactionController.js';

// @route   POST /api/transactions/send
router.post('/send', protect, sendMoney);

// @route   GET /api/transactions/history
router.get('/history', protect, getTransactionHistory);

export default router;