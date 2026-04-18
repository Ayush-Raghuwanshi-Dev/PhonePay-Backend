import mongoose from "mongoose";
import crypto from "crypto";

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      // Receiver is not required for BILL_PAYMENT
      return this.types !== 'BILL_PAYMENT';
    }
  },
  amount: {
    type: Number,
    required: true
  },
  billerName: {
    type: String,
    required: false
  },
  note: {
    type: String,
    maxlength: 100
  },
  txnId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID()
  },
  types: {
    type: String,
    enum: ['TRANSFER', 'ADD_MONEY', 'BILL_PAYMENT', "WITHDRAW"],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  }
}, { timestamps: true });

transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ receiver: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
