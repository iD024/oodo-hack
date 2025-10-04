const express = require('express');
const router = express.Router();
const { getRules, createRule, updateRule, deleteRule } = require('../controllers/approvalRuleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');

router.use(protect, authorize('admin'));

router.route('/')
    .get(getRules)
    .post(createRule);

router.route('/:id')
    .put(updateRule)
    .delete(deleteRule);

module.exports = router;