const Expense = require('../models/expenseModel');
const User = require('../models/userModel');
const ExpenseApproval = require('../models/expenseApprovalModel');
const ApprovalRule = require('../models/approvalRuleModel');
const Tesseract = require('tesseract.js');
const pool = require('../config/database');



// @desc    Process a receipt image with OCR
// @route   POST /api/expenses/process-receipt
// @access  Private
const processReceipt = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      'eng', // language
      { logger: m => console.log(m) } // Optional: log progress
    );

    // --- Basic Parsing Logic ---
    // This is a simplified example. Real-world parsing is complex and may require more advanced NLP techniques.
    
    let total = null;
    let date = null;

    // Look for lines containing "total" or "amount" and extract a number
    const totalRegex = /(?:total|amount)[\s:]*(\d+\.\d{2})/i;
    const totalMatch = text.match(totalRegex);
    if (totalMatch && totalMatch[1]) {
      total = parseFloat(totalMatch[1]);
    }

    // Look for a date in MM/DD/YYYY or YYYY-MM-DD format
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch && dateMatch[1]) {
      date = dateMatch[1];
    }
    
    res.json({
      extractedText: text,
      parsedData: {
        total,
        date,
        // You could add logic here to parse vendor name, items, etc.
      },
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({ message: 'Failed to process receipt image.' });
  }
};




// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, currency, category, description } = req.body;

    // Validate required fields
    if (!amount || !currency || !category) {
      console.warn('createExpense: missing fields', { body: req.body, file: req.file && req.file.filename });
      return res.status(400).json({
        message: 'Missing required fields',
        missing: {
          amount: !amount,
          currency: !currency,
          category: !category
        }
      });
    }

    console.log('Creating expense for user ID:', req.user.id);
    const user = await User.findById(req.user.id);
    console.log('Found user:', user ? { id: user.id, name: user.name, role: user.role, manager_id: user.manager_id } : 'null');

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    await client.query('BEGIN');

    // Parse amount to ensure it's a number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      console.warn('createExpense: invalid amount', { amount });
      return res.status(400).json({ message: 'Invalid amount format', received: amount });
    }

    const newExpense = await Expense.create({
      user_id: user.id,
      amount: parsedAmount,
      currency: currency.toUpperCase(),
      category,
      description,
      status: 'pending',
      receipt_url: req.file ? req.file.path : null
    }, client); // Pass client for transaction

    if (!user.manager_id) {
        // No manager, auto-approve with the user as approver
        await Expense.updateStatus(newExpense.id, 'approved', user.id, client);
        await client.query('COMMIT');
        return res.status(201).json({ ...newExpense, status: 'approved' });
    }

    await ExpenseApproval.create({
        expense_id: newExpense.id,
        approver_id: user.manager_id,
        sequence: 1,
    }, client); // Pass client for transaction

    await client.query('COMMIT');
    res.status(201).json(newExpense);
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (e) { console.error('Rollback error', e); }
    console.error('createExpense error', error);
    // If the error includes a detail from PG (e.g., not-null violations), return 400
    if (error.code === '23502') {
      return res.status(400).json({ message: 'Database constraint error', detail: error.detail });
    }
    res.status(500).json({ message: 'Server error while creating expense' });
  } finally {
    client.release();
  }
};

// @desc    Get all expenses for the logged-in user
// @route   GET /api/expenses
// @access  Private
const getUserExpenses = async (req, res) => {
  try {
    console.log('getUserExpenses: User ID from token:', req.user.id);
    console.log('getUserExpenses: User info:', { id: req.user.id, name: req.user.name, email: req.user.email });
    const expenses = await Expense.findByUserId(req.user.id);
    console.log('getUserExpenses: Found expenses:', expenses.length);
    res.json(expenses);
  } catch (error) {
    console.error('getUserExpenses error:', error);
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
const getPendingSubordinateExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findPendingByManagerId(req.user.id);
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve or reject an expense
// @route   PATCH /api/expenses/:id/status
// @access  Private/Manager
// REPLACE your existing approveOrRejectExpense function with this new one
const approveOrRejectExpense = async (req, res) => {
  const client = await pool.connect();
  try {
    const { status, comments } = req.body;
    const expenseId = req.params.id;
    
    await client.query('BEGIN');

    const currentApproval = await ExpenseApproval.getCurrentApprover(expenseId);

    if (!currentApproval || currentApproval.approver_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Not authorized or no pending approval found' });
    }

    await ExpenseApproval.updateStatus(currentApproval.id, { status, comments }, client);

    if (status === 'rejected') {
      const rejectedExpense = await Expense.updateStatus(expenseId, 'rejected', client);
      await client.query('COMMIT');
      return res.json(rejectedExpense);
    }
    
    const expense = await Expense.findById(expenseId);
    const matchingRules = await ApprovalRule.getMatchingRules(expense);
    
    const requiresNextApproval = matchingRules.length > 0;
    
    if (requiresNextApproval) {
        // Use the role from the first matching rule to find the next approver
        const nextRole = matchingRules[0].next_approver_role;
        const nextApprover = await User.findByRole(nextRole); 
        
        if (nextApprover) {
            await ExpenseApproval.create({
                expense_id: expenseId,
                approver_id: nextApprover.id,
                sequence: currentApproval.sequence + 1,
            }, client);

            await client.query('COMMIT');
            return res.json({ message: `Expense approved and forwarded to ${nextRole}.` });
        }
    }
    
    const finalExpense = await Expense.updateStatus(expenseId, 'approved', client);
    await client.query('COMMIT');
    res.json(finalExpense);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error during approval process' });
  } finally {
    client.release();
  }
};


// @desc    Get all expenses in the system
// @route   GET /api/expenses/all
// @access  Private/Admin
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {
  createExpense,
  approveOrRejectExpense,
  getUserExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
    getPendingSubordinateExpenses,
  approveOrRejectExpense,
  getAllExpenses,
   processReceipt
};