// backend/routes/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { protect } = require('../middleware/authMiddleware');

// This is a protected route, only logged-in users can access it.
// It will be useful for features like an admin fetching all users.
router.get('/', protect, async (req, res) => {
  try {
    // Example: only allow admins to see all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const users = await User.findAll(); // Assuming you have a findAll method in your model
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;