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

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;