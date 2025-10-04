const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  /**
   * Creates a new user in the database.
   * @param {object} userData - The user data.
   * @returns {Promise<object>} The newly created user.
   */
  async create({ name, email, password, role, manager_id = null }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, manager_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, manager_id, created_at',
      [name, email, hashedPassword, role, manager_id]
    );
    return result.rows[0];
  },

  /**
   * Finds a user by their email address.
   * @param {string} email - The user's email.
   * @returns {Promise<object|null>} The user object or null if not found.
   */
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  /**
   * Finds a user by their ID.
   * @param {string} id - The user's ID.
   * @returns {Promise<object|null>} The user object or null if not found.
   */
  async findById(id) {
    const result = await pool.query('SELECT id, name, email, role, manager_id FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  /**
   * Finds all users in the database.
   * @returns {Promise<Array>} Array of all users.
   */
  async findAll() {
    const result = await pool.query('SELECT id, name, email, role, manager_id, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  },

  /**
   * Finds users by their role.
   * @param {string} role - The user role to search for.
   * @returns {Promise<Array>} Array of users with the specified role.
   */
  async findByRole(role) {
    const result = await pool.query('SELECT id, name, email, role, manager_id, created_at FROM users WHERE role = $1 ORDER BY name', [role]);
    return result.rows;
  },

  /**
   * Finds users who report to a specific manager.
   * @param {string} managerId - The manager's user ID.
   * @returns {Promise<Array>} Array of subordinate users.
   */
  async findByManagerId(managerId) {
    const result = await pool.query('SELECT id, name, email, role, manager_id, created_at FROM users WHERE manager_id = $1 ORDER BY name', [managerId]);
    return result.rows;
  },
};

module.exports = User;