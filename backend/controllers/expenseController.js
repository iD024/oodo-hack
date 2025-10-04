const Expense = require('../models/expenseModel');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { amount, currency, category, description } = req.body;

    if (!amount || !currency || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newExpense = await Expense.create({
      user_id: req.user.id,
      amount,
      currency,
      category,
      description,
      status: 'pending', // Default status
    });

    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating expense' });
  }
};

// @desc    Get all expenses for the logged-in user
// @route   GET /api/expenses
// @access  Private
const getUserExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findByUserId(req.user.id);
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching expenses' });
  }
};

// @desc    Get a single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Ensure the expense belongs to the logged-in user
    if (expense.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this expense' });
    }

    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching expense' });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const { amount, currency, category, description } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Ensure the expense belongs to the logged-in user
    if (expense.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this expense' });
    }

    // Only allow updates if the status is 'pending'
    if (expense.status !== 'pending') {
      return res.status(400).json({ message: `Cannot update expense with status: ${expense.status}` });
    }

    const updatedExpense = await Expense.update(req.params.id, {
      amount,
      currency,
      category,
      description,
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating expense' });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Ensure the expense belongs to the logged-in user
    if (expense.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await Expense.delete(req.params.id);
    res.json({ message: 'Expense removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting expense' });
  }
};


module.exports = {
  createExpense,
  getUserExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};