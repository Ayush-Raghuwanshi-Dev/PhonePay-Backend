import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Transaction from './src/models/transaction.js';

dotenv.config();

// ANSI escape codes for beautiful console colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m"
};

const seedData = async () => {
  try {
    console.log(`${colors.cyan}\n==========================================${colors.reset}`);
    console.log(`${colors.cyan}🚀 Initializing Database Seeding Process...${colors.reset}`);
    console.log(`${colors.cyan}==========================================\n${colors.reset}`);

    await connectDB();
    
    console.log(`${colors.yellow}🧹 Clearing existing data...${colors.reset}`);
    await Transaction.deleteMany({});
    await User.deleteMany({});
    console.log(`${colors.green}  ✅ DB successfully wiped.\n${colors.reset}`);

    // Generate Common hashed password and MPIN for easy testing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);
    const hashedMpin = await bcrypt.hash("1234", salt);

    console.log(`${colors.yellow}👤 Creating Dummy Users...${colors.reset}`);
    
    // Seed Users List
    const users = [
      {
        name: "Ayush Raghuwanshi",
        email: "ayush@example.com",
        phone: "9876543210",
        password: hashedPassword,
        upiId: "ayush@phonepe",
        mpin: hashedMpin,
        hasMpinSet: true,
        balance: 50000,
      },
      {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "9876543211",
        password: hashedPassword,
        upiId: "jane@phonepe",
        mpin: hashedMpin,
        hasMpinSet: true,
        balance: 25000,
      },
      {
        name: "John Smith",
        email: "john@example.com",
        phone: "9876543212",
        password: hashedPassword,
        upiId: "john@phonepe",
        mpin: hashedMpin,
        hasMpinSet: true,
        balance: 10500,
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`${colors.green}  ✅ ${createdUsers.length} Dummy users created.${colors.reset}`);
    console.log(`${colors.magenta}     -> Test Password: "password123" | Test MPIN: "1234"\n${colors.reset}`);

    console.log(`${colors.yellow}💸 Generating Dummy Transactions...${colors.reset}`);
    
    // Seed Transactions mapped to created Users
    const transactions = [
      {
        sender: createdUsers[0]._id,
        receiver: createdUsers[1]._id,
        amount: 5000,
        types: "TRANSFER",
        status: "COMPLETED"
      },
      {
        sender: createdUsers[1]._id,
        receiver: createdUsers[2]._id,
        amount: 2000,
        types: "TRANSFER",
        status: "COMPLETED"
      },
      {
        sender: createdUsers[0]._id,
        billerName: "Electricity Board",
        amount: 1500,
        types: "BILL_PAYMENT",
        status: "COMPLETED"
      },
      {
        sender: createdUsers[2]._id,
        receiver: createdUsers[2]._id,
        amount: 5000,
        types: "ADD_MONEY_WALLET",
        status: "COMPLETED"
      }
    ];

    const createdTransactions = await Transaction.insertMany(transactions);
    console.log(`${colors.green}  ✅ ${createdTransactions.length} Dummy transactions mapped.\n${colors.reset}`);

    console.log(`${colors.green}==========================================${colors.reset}`);
    console.log(`${colors.green}🎉 SEEDING COMPLETED SUCCESSFULLY! Exiting...${colors.reset}`);
    console.log(`${colors.green}==========================================\n${colors.reset}`);
    
    process.exit();

  } catch (error) {
    console.error(`${colors.red}\n==========================================${colors.reset}`);
    console.error(`${colors.red}❌ ERROR EXECUTING SEED DATA:${colors.reset}`);
    console.error(`${colors.red}  -> ${error.message}${colors.reset}`);
    console.error(`${colors.red}==========================================\n${colors.reset}`);
    process.exit(1);
  }
};

seedData();