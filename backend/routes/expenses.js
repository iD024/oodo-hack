const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get user's expenses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        e.id, e.amount, e.currency, e.category, e.description, e.receipt_url,
        e.status, e.submitted_at, e.approved_at, e.rejected_at,
        e.approval_comment, e.rejection_reason,
        approver.name as approved_by_name,
        rejector.name as rejected_by_name
      FROM expenses e
      LEFT JOIN users approver ON e.approved_by = approver.id
      LEFT JOIN users rejector ON e.rejected_by = rejector.id
      WHERE e.user_id = $1
    `;
    
    const params = [req.user.id];
    
    if (status && status !== 'all') {
      query += ' AND e.status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY e.submitted_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({ expenses: result.rows });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all expenses (Manager/Admin only)
router.get('/all', authenticateToken, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        e.id, e.amount, e.currency, e.category, e.description, e.receipt_url,
        e.status, e.submitted_at, e.approved_at, e.rejected_at,
        e.approval_comment, e.rejection_reason,
        u.name as user_name, u.email as user_email,
        approver.name as approved_by_name,
        rejector.name as rejected_by_name
      FROM expenses e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN users approver ON e.approved_by = approver.id
      LEFT JOIN users rejector ON e.rejected_by = rejector.id
    `;
    
    const params = [];
    
    if (status && status !== 'all') {
      query += ' WHERE e.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY e.submitted_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({ expenses: result.rows });
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new expense
router.post('/', [
  authenticateToken,
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency = 'USD', category, description, receiptUrl } = req.body;

    const result = await pool.query(`
      INSERT INTO expenses (user_id, amount, currency, category, description, receipt_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, amount, currency, category, description, status, submitted_at
    `, [req.user.id, amount, currency, category, description, receiptUrl || null]);

    const expense = result.rows[0];

    res.status(201).json({
      message: 'Expense submitted successfully',
      expense
    });

  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get expense by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        e.id, e.user_id, e.amount, e.currency, e.category, e.description, e.receipt_url,
        e.status, e.submitted_at, e.approved_at, e.rejected_at,
        e.approval_comment, e.rejection_reason,
        u.name as user_name, u.email as user_email,
        approver.name as approved_by_name,
        rejector.name as rejected_by_name
      FROM expenses e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN users approver ON e.approved_by = approver.id
      LEFT JOIN users rejector ON e.rejected_by = rejector.id
      WHERE e.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const expense = result.rows[0];

    // Check if user can view this expense
    if (expense.user_id !== req.user.id && !['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve expense (Manager/Admin only)
router.post('/:id/approve', [
  authenticateToken,
  requireRole(['manager', 'admin']),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    // Check if expense exists
    const expenseResult = await pool.query('SELECT id, status FROM expenses WHERE id = $1', [id]);
    if (expenseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const expense = expenseResult.rows[0];
    if (expense.status !== 'pending') {
      return res.status(400).json({ message: 'Expense is not pending approval' });
    }

    // Approve expense
    await pool.query(`
      UPDATE expenses 
      SET status = 'approved',
          approved_by = $1,
          approved_at = CURRENT_TIMESTAMP,
          approval_comment = $2
      WHERE id = $3
    `, [req.user.id, comment || null, id]);

    res.json({ message: 'Expense approved successfully' });

  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject expense (Manager/Admin only)
router.post('/:id/reject', [
  authenticateToken,
  requireRole(['manager', 'admin']),
  body('reason').trim().isLength({ min: 1 }).withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if expense exists
    const expenseResult = await pool.query('SELECT id, status FROM expenses WHERE id = $1', [id]);
    if (expenseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const expense = expenseResult.rows[0];
    if (expense.status !== 'pending') {
      return res.status(400).json({ message: 'Expense is not pending approval' });
    }

    // Reject expense
    await pool.query(`
      UPDATE expenses 
      SET status = 'rejected',
          rejected_by = $1,
          rejected_at = CURRENT_TIMESTAMP,
          rejection_reason = $2
      WHERE id = $3
    `, [req.user.id, reason, id]);

    res.json({ message: 'Expense rejected successfully' });

  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get expense statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount END), 0) as total_approved_amount
      FROM expenses
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [req.user.id]);
    const stats = result.rows[0];

    res.json({ stats });
  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
