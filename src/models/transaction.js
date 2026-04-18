import mongoose from "mongoose";

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
}, { timestamps: true 
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;