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
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new Error(`Invalid UUID format: ${userId}`);
    }
    
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
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }
    
    const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    return result.rows[0];
  },

  /**
   * Updates the status of an expense (e.g., 'approved', 'rejected').
   * @param {string} id - The expense ID.
   * @param {string} status - The new status.
   * @param {string} approverId - The ID of the user approving/rejecting.
   * @param {object} client - Optional database client for transactions.
   * @returns {Promise<object|null>} The updated expense object.
   */
  async updateStatus(id, status, approverId, client = pool) {
    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error(`Invalid expense ID UUID format: ${id}`);
    }
    if (!uuidRegex.test(approverId)) {
      throw new Error(`Invalid approver ID UUID format: ${approverId}`);
    }

    const timestampField = status === 'approved' ? 'approved_at' : 'rejected_at';
    const approverField = status === 'approved' ? 'approved_by' : 'rejected_by';

    const result = await client.query(
      `UPDATE expenses
       SET status = $1, ${timestampField} = CURRENT_TIMESTAMP, ${approverField} = $2
       WHERE id = $3
       RETURNING *`,
      [status, approverId, id]
    );
    return result.rows[0];
  },

  /**
   * Finds pending expenses for subordinates of a manager.
   * @param {string} managerId - The ID of the manager.
   * @returns {Promise<Array>} A list of pending expenses for subordinates.
   */
  async findPendingByManagerId(managerId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(managerId)) {
      throw new Error(`Invalid manager UUID format: ${managerId}`);
    }
    
    const result = await pool.query(`
      SELECT e.*, u.name as submitter_name, u.email as submitter_email 
      FROM expenses e 
      JOIN users u ON e.user_id = u.id 
      WHERE u.manager_id = $1 AND e.status = 'pending' 
      ORDER BY e.submitted_at ASC
    `, [managerId]);
    return result.rows;
  },

  /**
   * Finds expenses for subordinates of a manager, optionally filtered by status.
   * @param {string} managerId - The manager's user ID.
   * @param {string|null} status - Optional status filter ('pending','approved','rejected').
   */
  async findByManagerId(managerId, status = null) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(managerId)) {
      throw new Error(`Invalid manager UUID format: ${managerId}`);
    }

    let query = `
      SELECT e.*, u.name as submitter_name, u.email as submitter_email
      FROM expenses e
      JOIN users u ON e.user_id = u.id
      WHERE u.manager_id = $1
    `;
    const params = [managerId];

    if (status) {
      query += ' AND e.status = $2 ';
      params.push(status);
    }

    query += ' ORDER BY e.submitted_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  /**
   * Finds all expenses (for admin view).
   * @returns {Promise<Array>} A list of all expenses.
   */
  async findAll() {
    const result = await pool.query(`
      SELECT e.*, u.name as submitter_name, u.email as submitter_email 
      FROM expenses e 
      JOIN users u ON e.user_id = u.id 
      ORDER BY e.submitted_at DESC
    `);
    return result.rows;
  },

  /**
   * Updates an existing expense.
   * @param {string} id - The expense ID.
   * @param {object} updates - The fields to update.
   * @returns {Promise<object|null>} The updated expense object.
   */
  async update(id, { amount, currency, category, description }) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error(`Invalid expense UUID format: ${id}`);
    }
    
    const result = await pool.query(
      `UPDATE expenses 
       SET amount = $1, currency = $2, category = $3, description = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING *`,
      [amount, currency, category, description, id]
    );
    return result.rows[0];
  },

  /**
   * Deletes an expense.
   * @param {string} id - The expense ID.
   * @returns {Promise<boolean>} True if deleted successfully.
   */
  async delete(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error(`Invalid expense UUID format: ${id}`);
    }
    
    const result = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    return result.rowCount > 0;
  },
};

module.exports = Expense;
