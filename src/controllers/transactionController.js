import Transaction from "../models/transaction.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const sendMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { recipientUpiId, amount, mpin, note } = req.body;
    const senderId = req.user._id;
    const numericAmount = Number(amount);

    if (!recipientUpiId || !numericAmount || numericAmount <= 0 || !mpin) {
      return res.status(400).json({ message: "Please provide recipient UPI ID, a valid amount greater than 0, and MPIN" });
    }

    const sender = await User.findById(senderId).session(session);
    const recipient = await User.findOne({ upiId: recipientUpiId }).session(session);

    if (!recipient) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Recipient not found" });
    }

    const isMpinMatch = await bcrypt.compare(mpin, sender.mpin);
    if (!isMpinMatch) {
      await session.abortTransaction();
      return res.status(401).json({ message: "Invalid MPIN" });
    }

    if (sender.upiId === recipientUpiId) {
      await session.abortTransaction();
      return res.status(400).json({ message: "You cannot send money to yourself" });
    }

    if (sender.balance < numericAmount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    sender.balance -= numericAmount;
    recipient.balance += numericAmount;

    await sender.save({ session });
    await recipient.save({ session });

    const newTxn = await Transaction.create([{
      sender: sender._id,
      receiver: recipient._id,
      amount: numericAmount,
      types: "TRANSFER",
      status: "COMPLETED",
      note
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Money sent successfully", transaction: newTxn[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { filter, sort = 'desc', page = 1, limit = 10 } = req.query;
    
    let dateFilter = {};
    if (filter === 'weekly') {
      dateFilter = { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) };
    } else if (filter === 'monthly') {
      dateFilter = { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) };
    } else if (filter === 'yearly') {
      dateFilter = { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) };
    }

    let query = { $or: [{ sender: userId }, { receiver: userId }] };
    if(Object.keys(dateFilter).length > 0) query.createdAt = dateFilter;

    const skip = (Number(page) - 1) * Number(limit);
    
    const transactions = await Transaction.find(query)
      .populate("sender", "name upiId")
      .populate("receiver", "name upiId")
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

    res.json({ 
        transactions, 
        pagination: { current: Number(page), total: Math.ceil(total / Number(limit)), totalRecords: total }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const sentStats = await Transaction.aggregate([
      { $match: { sender: userId, types: "TRANSFER", status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const receivedStats = await Transaction.aggregate([
      { $match: { receiver: userId, types: "TRANSFER", status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const monthlySent = await Transaction.aggregate([
      { $match: { sender: userId, types: "TRANSFER", status: "COMPLETED", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const monthlyReceived = await Transaction.aggregate([
      { $match: { receiver: userId, types: "TRANSFER", status: "COMPLETED", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const topSender = await Transaction.aggregate([
        { $match: { receiver: userId, types: "TRANSFER", status: "COMPLETED" } },
        { $group: { _id: "$sender", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
        { $limit: 1 }
    ]);
    const topSenderDetails = topSender.length > 0 ? await User.findById(topSender[0]._id, 'name upiId') : null;

    res.json({
      totalSent: sentStats[0]?.total || 0,
      totalReceived: receivedStats[0]?.total || 0,
      thisMonthSent: monthlySent[0]?.total || 0,
      thisMonthReceived: monthlyReceived[0]?.total || 0,
      topSender: topSenderDetails ? { user: topSenderDetails, amount: topSender[0].total } : null
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
