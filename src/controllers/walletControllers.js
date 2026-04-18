import User from '../models/User.js';
import Transaction from '../models/transaction.js';
import bcrypt from 'bcryptjs';

// @desc    add money to wallet
// @route   POST /api/wallet/addmoney
// @access  Private

export const addMoney = async (req, res) => {
  try {
    const { amount, mpin } = req.body;
    const userId = req.user._id;

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: "Please provide a valid amount greater than 0" });
    }
    const user = await User.findById(userId);
    user.balance += numericAmount;
    await user.save();

    const transaction = await Transaction.create({
      sender: user._id,
      receiver: user._id,
      amount: numericAmount,
      types: "ADD_MONEY",
      status: "COMPLETED"
    });
    res.json({ message: "Money added to wallet successfully", balance: user.balance });
  } catch (error) {   
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Pay bill using wallet balance
// @route   POST /api/wallet/paybill
// @access  Private
export const paybill = async (req, res) => {
  try {
    const { billerUpiId, amount, mpin } = req.body;
    const userId = req.user._id;

    const numericAmount = Number(amount);

    if (!billerUpiId || !numericAmount || !mpin) {
      return res.status(400).json({ message: "Please provide biller UPI ID, amount, and MPIN" });
    }
    const user = await User.findById(userId);
    const isMpinMatch = await bcrypt.compare(mpin, user.mpin);
    if (!isMpinMatch) {
      return res.status(401).json({ message: "Invalid MPIN" });
    }
    if(user.balance < numericAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
    }
    user.balance -= numericAmount;
    await user.save();  
    await Transaction.create({
        sender: user._id,
  receiver: user._id, // dummy (self)
  billerName: billerUpiId,
  amount: numericAmount,
  types: "BILL_PAYMENT",
  status: "COMPLETED"
    });
    res.json({ message: "Bill paid successfully", balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};