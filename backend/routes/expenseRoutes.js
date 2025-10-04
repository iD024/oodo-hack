const express = require('express');
const upload = require('../config/multerConfig');
const { processReceipt } = require('../controllers/expenseController');

const router = express.Router();
const {
  createExpense,
  getUserExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getPendingSubordinateExpenses,
  getSubordinateExpenses,
  approveOrRejectExpense,
  getAllExpenses,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');

// All expense routes are protected
router.use(protect);

// Admin route
router.get('/all', authorize('admin'), getAllExpenses);

// Manager routes
router.get('/subordinates/pending', authorize(['manager', 'admin']), getPendingSubordinateExpenses);
// Backward-compatible endpoint used by frontend
router.get('/pending', authorize(['manager', 'admin']), getPendingSubordinateExpenses);
// New: generalized subordinate expenses listing with optional status filter
router.get('/subordinates', authorize(['manager', 'admin']), getSubordinateExpenses);
router.patch('/:id/status', authorize(['manager', 'admin']), approveOrRejectExpense);

router.post('/process-receipt', upload.single('receipt'), processReceipt);

// Temporary debug route (protected) to inspect multipart parsing
router.post('/debug', upload.single('receipt'), (req, res) => {
  res.json({ body: req.body, file: req.file || null });
});

// Employee routes (already created in Phase 3)
// Ensure multipart/form-data is parsed so req.body contains the form fields
router.route('/')
  .post(upload.single('receipt'), createExpense)
  .get(getUserExpenses);

// Only match UUIDs for the :id param to avoid conflicts with named routes like /pending
router.route('/:id([0-9a-fA-F-]{36})')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

// Convenience endpoints for manager actions
router.post('/:id([0-9a-fA-F-]{36})/approve', authorize(['manager', 'admin']), async (req, res, next) => {
  req.body = { status: 'approved', comments: req.body.comments || '' };
  return approveOrRejectExpense(req, res, next);
});

router.post('/:id([0-9a-fA-F-]{36})/reject', authorize(['manager', 'admin']), async (req, res, next) => {
  req.body = { status: 'rejected', comments: req.body.comments || '' };
  return approveOrRejectExpense(req, res, next);
});

module.exports = router;