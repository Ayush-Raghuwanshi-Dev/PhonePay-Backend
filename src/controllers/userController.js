import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate phone number (must be exactly 10 digits)
    if (!phone || !/^\d{10}$/.test(phone.toString())) {
      return res.status(400).json({ message: "Phone number must contain exactly 10 digits" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({$or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sanitizedname = email.toLowerCase();
    const upiId = `${sanitizedname.split('@')[0]}@phonepe`; // UPI iD format :- username@axis123@phonepe

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      upiId
    });

    if(user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        upiId: user.upiId,
        hasMpinSet: false,
        token: generateToken(user)
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      upiId: user.upiId,
      hasMpinSet: user.hasMpinSet,
      token: generateToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Set MPIN for user transactions
// @route   POST /api/auth/set-mpin
// @access  Private
export const setupMpin = async (req, res) => {
  try {
    const { mpin } = req.body;
    if(!mpin || !/^\d{4}$/.test(mpin.toString())) {
      return res.status(400).json({ message: "MPIN must be a 4-digit number" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedMpin = await bcrypt.hash(mpin, salt);
    
    const user = await User.findByIdAndUpdate(req.user._id, { mpin : hashedMpin}, { new: true});

    if(user){
      res.json({ message: "MPIN set successfully" });
    } else {
      res.status(400).json({ message: "Failed to set MPIN" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user profile data
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -mpin');
    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

