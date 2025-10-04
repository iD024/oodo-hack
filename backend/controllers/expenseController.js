const Expense = require('../models/expenseModel');
const User = require('../models/userModel');
const ExpenseApproval = require('../models/expenseApprovalModel');
const ApprovalRule = require('../models/approvalRuleModel');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { amount, currency, category, description } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // 1. Create the expense
    const newExpense = await Expense.create({
      user_id: user.id,
      amount,
      currency,
      category,
      description,
      status: 'pending', // Initial status
    });
    
    // 2. Start the approval workflow
    if (!user.manager_id) {
        // If user has no manager, maybe auto-approve or send to a default pool
        await Expense.update(newExpense.id, { status: 'approved' });
        return res.status(201).json({ ...newExpense, status: 'approved' });
    }

    // 3. Create the first approval step for the manager
    await ExpenseApproval.create({
        expense_id: newExpense.id,
        approver_id: user.manager_id,
        sequence: 1,
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
  try {
    const { status, comments } = req.body; // 'approved' or 'rejected'
    const expenseId = req.params.id;
    
    // 1. Find the current pending approval for this expense
    const currentApproval = await ExpenseApproval.getCurrentApprover(expenseId);

    if (!currentApproval || currentApproval.approver_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized or no pending approval found' });
    }

    // 2. Update the current approval step
    await ExpenseApproval.updateStatus(currentApproval.id, { status, comments });

    // 3. If rejected, stop the workflow and update the main expense
    if (status === 'rejected') {
      const rejectedExpense = await Expense.updateStatus(expenseId, 'rejected');
      return res.json(rejectedExpense);
    }
    
    // 4. If approved, check for the next approver
    const expense = await Expense.findById(expenseId);
    const matchingRules = await ApprovalRule.getMatchingRules(expense);
    
    // For simplicity, we assume rules imply a second-level approver (e.g., admin or finance)
    // A more complex system would have sequences/steps defined in the rules themselves.
    const requiresNextApproval = matchingRules.length > 0;
    
    if (requiresNextApproval) {
        // Find a user for the next level (e.g., the first admin user)
        const nextApprover = await User.findByRole('admin'); // Simplified logic
        if (nextApprover) {
            await ExpenseApproval.create({
                expense_id: expenseId,
                approver_id: nextApprover.id,
                sequence: currentApproval.sequence + 1,
            });
            return res.json({ message: 'Expense approved and moved to next level.' });
        }
    }
    
    // 5. If no more approvals are needed, finalize the expense
    const finalExpense = await Expense.updateStatus(expenseId, 'approved');
    res.json(finalExpense);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during approval process' });
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
    createExpense,
  approveOrRejectExpense,
  getUserExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
    getPendingSubordinateExpenses,
  approveOrRejectExpense,
  getAllExpenses
};