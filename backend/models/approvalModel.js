const pool = require('../config/database');

const Approval = {
  /**
   * Creates a new approval rule for expense workflows.
   * @param {object} ruleData - The data for the approval rule.
   * @returns {Promise<object>} The newly created approval rule.
   */
  async createRule({ rule_name, rule_type, rule_config, created_by }) {
    const result = await pool.query(
      'INSERT INTO approval_rules (rule_name, rule_type, rule_config, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [rule_name, rule_type, JSON.stringify(rule_config), created_by]
    );
    return result.rows[0];
  },

  /**
   * Retrieves all active approval rules.
   * @returns {Promise<Array>} A list of active approval rules.
   */
  async getActiveRules() {
    const result = await pool.query('SELECT * FROM approval_rules WHERE is_active = true');
    return result.rows;
  },

  /**
   * Initiates the approval process for a new expense.
   * This function would determine the first approver based on the rules.
   * @param {string} expenseId - The ID of the expense to start the process for.
   * @param {string} firstApproverId - The ID of the first user to approve the expense.
   * @returns {Promise<object>} The initial expense approval record.
   */
  async startApprovalProcess(expenseId, firstApproverId) {
    const result = await pool.query(
      `INSERT INTO expense_approvals (expense_id, approver_id, approval_level, status)
       VALUES ($1, $2, 1, 'pending')
       RETURNING *`,
      [expenseId, firstApproverId]
    );
    return result.rows[0];
  },

  /**
   * Records an approval or rejection action in the progress log.
   * @param {object} approvalData - Data about the approval action.
   * @returns {Promise<object>} The updated expense approval record.
   */
  async recordApprovalAction({ expense_id, approver_id, status, comment = null }) {
    const result = await pool.query(
      `UPDATE expense_approvals
       SET status = $1, comment = $2, approved_at = CURRENT_TIMESTAMP
       WHERE expense_id = $3 AND approver_id = $4 AND status = 'pending'
       RETURNING *`,
      [status, comment, expense_id, approver_id]
    );
    return result.rows[0];
  },

  /**
   * Gets the entire approval history (the progress) for a specific expense.
   * @param {string} expenseId - The ID of the expense.
   * @returns {Promise<Array>} A list of approval steps for the expense.
   */
  async getExpenseProgress(expenseId) {
    const result = await pool.query(
      `SELECT ea.*, u.name as approver_name
       FROM expense_approvals ea
       JOIN users u ON ea.approver_id = u.id
       WHERE ea.expense_id = $1
       ORDER BY ea.approval_level ASC`,
      [expenseId]
    );
    return result.rows;
  },
};

module.exports = Approval;