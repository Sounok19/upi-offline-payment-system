// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models/schemas');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { upiId, name, phone, password } = req.body;

    // Validation
    if (!upiId || !name || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ upiId: upiId.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'UPI ID already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with initial balance
    const user = new User({
      upiId: upiId.toLowerCase(),
      name,
      phone,
      password: hashedPassword,
      balance: 10000  // Initial balance: ₹10,000
    });

    await user.save();

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      user: { 
        upiId: user.upiId, 
        name: user.name,
        balance: user.balance 
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/auth/login
 * Login user and get session
 */
router.post('/login', async (req, res) => {
  try {
    const { upiId, password } = req.body;

    // Validation
    if (!upiId || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'UPI ID and password required' 
      });
    }

    // Find user
    const user = await User.findOne({ upiId: upiId.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid UPI ID or password' 
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid UPI ID or password' 
      });
    }

    res.json({ 
      success: true,
      message: 'Login successful',
      user: { 
        upiId: user.upiId, 
        name: user.name, 
        balance: user.balance 
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;

/*
AUTHENTICATION FLOW:

REGISTRATION:
1. User enters: UPI ID, Name, Phone, Password
2. Server validates all fields present
3. Server checks if UPI ID already exists
4. Server hashes password with bcryptjs (10 salt rounds)
5. Server creates user with initial ₹10,000 balance
6. Server saves to MongoDB

LOGIN:
1. User enters: UPI ID, Password
2. Server finds user by UPI ID
3. Server compares password with hashed password
4. If match: return user data (no session token - demo version)
5. Frontend saves user data to local state

SECURITY NOTES:
- Passwords are hashed, never stored in plain text
- bcryptjs uses 10 salt rounds (slow on purpose)
- UPI IDs are case-insensitive (converted to lowercase)
- Each registration starts with ₹10,000 balance
*/
