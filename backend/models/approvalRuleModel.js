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

  // SECURE IMPLEMENTATION of getMatchingRules
  async getMatchingRules(expense) {
    const allRules = await this.findAll();
    const matchingRules = allRules.filter(rule => {
      try {
        // Safe, manual parsing of the condition string
        const parts = rule.condition.match(/(amount|category)\s*([<>=!]+)\s*'?([^']+)'?/);
        if (!parts || parts.length < 4) {
          console.error(`Invalid rule condition format: "${rule.condition}"`);
          return false;
        }
        
        const [, field, operator, value] = parts;

        const expenseValue = expense[field];
        const ruleValue = field === 'amount' ? parseFloat(value) : value;

        switch (operator) {
          case '>': return expenseValue > ruleValue;
          case '>=': return expenseValue >= ruleValue;
          case '<': return expenseValue < ruleValue;
          case '<=': return expenseValue <= ruleValue;
          case '==': return expenseValue == ruleValue;
          case '!=': return expenseValue != ruleValue;
          default:
            console.error(`Unsupported operator in rule: "${operator}"`);
            return false;
        }
      } catch (e) {
        console.error(`Error evaluating rule "${rule.name}":`, e);
        return false;
      }
    });
    return matchingRules;
  }
};

module.exports = ApprovalRule;