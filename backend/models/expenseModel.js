const pool = require('../config/database');

const Expense = {
  /**
   * Creates a new expense record.
   * @param {object} expenseData - The expense data.
   * @returns {Promise<object>} The newly created expense.
   */
  async create({ user_id, amount, currency, category, description, receipt_url = null, status = 'pending' }, client = pool) {
    const result = await client.query(
      `INSERT INTO expenses (user_id, amount, currency, category, description, receipt_url, status, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [user_id, amount, currency, category, description, receipt_url, status]
    );
    return result.rows[0];
  },

  /**
   * Finds expenses submitted by a specific user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array>} A list of expenses for the user.
   */
  async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY submitted_at DESC',
      [userId]
    );
    return result.rows;
  },

  /**
   * Finds a single expense by its ID.
   * @param {string} id - The expense ID.
   * @returns {Promise<object|null>} The expense object or null if not found.
   */
  async findById(id) {
    const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    return result.rows[0];
  },

  /**
   * Updates the status of an expense (e.g., 'approved', 'rejected').
   * @param {string} id - The expense ID.
   * @param {string} status - The new status.
   * @param {string} approverId - The ID of the user approving/rejecting.
   * @returns {Promise<object|null>} The updated expense object.
   */
  async updateStatus(id, status, approverId) {
    const timestampField = status === 'approved' ? 'approved_at' : 'rejected_at';
    const approverField = status === 'approved' ? 'approved_by' : 'rejected_by';

    const result = await pool.query(
      `UPDATE expenses
       SET status = $1, ${timestampField} = CURRENT_TIMESTAMP, ${approverField} = $2
       WHERE id = $3
       RETURNING *`,
      [status, approverId, id]
    );
    return result.rows[0];
  },
};

module.exports = Expense;