import Transaction from "../models/transaction.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// @desc    Send money from one user to another
// @route   POST /api/transactions/send
// @access  Private
const sendMoney = async (req, res) => {
  try {
    const { recipientUpiId, amount, mpin } = req.body;
    const senderId = req.user._id;

    const numericAmount = Number(amount);

    // Validate input
    if (!recipientUpiId || !numericAmount || numericAmount <= 0 || !mpin) {
      return res.status(400).json({ message: "Please provide recipient UPI ID, a valid amount greater than 0, and MPIN" });
    }

    // Find sender and recipient
    const sender = await User.findById(senderId);
    const recipient = await User.findOne({ upiId: recipientUpiId });

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Validate MPIN
    const isMpinMatch = await bcrypt.compare(mpin, sender.mpin);
    if (!isMpinMatch) {
      return res.status(401).json({ message: "Invalid MPIN" });
    }

    //check if sender put his own upi id
    if (sender.upiId === recipientUpiId) {
      return res.status(400).json({ message: "You cannot send money to yourself" });
    }

    if(sender.balance < numericAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Perform transaction
    sender.balance -= numericAmount;
    recipient.balance += numericAmount;

    // Save updated user balances
    await sender.save();
    await recipient.save();

    // Create transaction record
    await Transaction.create({
      sender: sender._id,
      receiver: recipient._id,
      amount: numericAmount,
      types: "TRANSFER",
      status: "COMPLETED"
    });

    res.json({ message: "Money sent successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user transaction history
// @route   GET /api/transactions/history
// @access  Private
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).populate("sender", "name upiId").populate("receiver", "name upiId");

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { sendMoney, getTransactionHistory };