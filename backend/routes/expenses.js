// backend/routes/expenses.js

const express = require('express');
const router = express.Router();
const Expense = require('../models/expenseModel');
const { protect } = require('../middleware/authMiddleware'); // Corrected this line

// Route to create a new expense
router.post('/', protect, async (req, res) => {
  try {
    const { amount, currency, category, description } = req.body;
    const newExpense = await Expense.create({
      user_id: req.user.id,
      amount,
      currency,
      category,
      description,
    });
    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ... other expense-related routes can go here

module.exports = router;