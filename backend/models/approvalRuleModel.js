const pool = require('../config/database');

const ApprovalRule = {
  async create({ name, condition }) {
    const result = await pool.query(
      'INSERT INTO approval_rules (name, condition) VALUES ($1, $2) RETURNING *',
      [name, condition]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query('SELECT * FROM approval_rules ORDER BY id');
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM approval_rules WHERE id = $1', [id]);
    return result.rows[0];
  },

  async update(id, { name, condition }) {
    const result = await pool.query(
      'UPDATE approval_rules SET name = $1, condition = $2 WHERE id = $3 RETURNING *',
      [name, condition, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM approval_rules WHERE id = $1', [id]);
  },
  
  // A function to get rules that match a given expense
  async getMatchingRules(expense) {
    const allRules = await this.findAll();
    const matchingRules = allRules.filter(rule => {
      try {
        // A simple way to evaluate the condition against the expense object
        // NOTE: In a real-world app, use a safer evaluation library than eval()
        const conditionFunc = new Function('amount', 'category', `return ${rule.condition}`);
        return conditionFunc(expense.amount, expense.category);
      } catch (e) {
        console.error(`Error evaluating rule "${rule.name}":`, e);
        return false;
      }
    });
    return matchingRules;
  }
};

module.exports = ApprovalRule;