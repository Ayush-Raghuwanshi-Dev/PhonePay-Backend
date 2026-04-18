import express from 'express';
import protect from '../middleware/protect.js';
import { paybill, addMoney } from '../controllers/walletControllers.js';

const router = express.Router();

// @route   POST /api/wallet/paybill
// @desc    Pay bill using wallet balance
// @access  Private
router.post('/paybill', protect, paybill);

// @route   POST /api/wallet/addmoney
// @desc    Add money to wallet
// @access  Private
router.post('/addmoney', protect, addMoney);

export default router; 


