const pool = require('../config/database');

const ExpenseApproval = {
  async create({ expense_id, approver_id, sequence }) {
    const result = await pool.query(
      'INSERT INTO expense_approvals (expense_id, approver_id, status, sequence) VALUES ($1, $2, $3, $4) RETURNING *',
      [expense_id, approver_id, 'pending', sequence]
    );
    return result.rows[0];
  },

  async findByExpenseId(expense_id) {
    const result = await pool.query('SELECT * FROM expense_approvals WHERE expense_id = $1 ORDER BY sequence', [expense_id]);
    return result.rows;
  },
  
  async updateStatus(id, { status, comments }) {
      const result = await pool.query(
          'UPDATE expense_approvals SET status = $1, comments = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
          [status, comments, id]
      );
      return result.rows[0];
  },

  async getCurrentApprover(expense_id) {
      const result = await pool.query(
          "SELECT * FROM expense_approvals WHERE expense_id = $1 AND status = 'pending' ORDER BY sequence LIMIT 1",
          [expense_id]
      );
      return result.rows[0];
  }
};

module.exports = ExpenseApproval;