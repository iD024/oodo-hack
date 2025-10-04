const pool = require('./config/database');

(async () => {
  try {
    console.log('=== Current System State ===\n');
    
    // Check all users and their manager assignments
    const users = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.manager_id, 
             m.name as manager_name, m.email as manager_email
      FROM users u 
      LEFT JOIN users m ON u.manager_id = m.id 
      ORDER BY u.role DESC, u.name
    `);
    
    console.log('👥 USERS:');
    users.rows.forEach(user => {
      console.log(`  ${user.role.toUpperCase()}: ${user.name} (${user.email})`);
      console.log(`     ID: ${user.id}`);
      console.log(`     Manager: ${user.manager_name ? `${user.manager_name} (${user.manager_email})` : 'None'}`);
      console.log('');
    });
    
    // Check recent expenses
    const expenses = await pool.query(`
      SELECT e.id, e.amount, e.category, e.status, e.submitted_at,
             u.name as submitter, u.email as submitter_email
      FROM expenses e 
      JOIN users u ON e.user_id = u.id 
      ORDER BY e.submitted_at DESC 
      LIMIT 5
    `);
    
    console.log('💰 RECENT EXPENSES:');
    if (expenses.rows.length === 0) {
      console.log('  No expenses found');
    } else {
      expenses.rows.forEach(expense => {
        console.log(`  $${expense.amount} - ${expense.category} - ${expense.status}`);
        console.log(`    Submitted by: ${expense.submitter} (${expense.submitter_email})`);
        console.log(`    Date: ${expense.submitted_at}`);
        console.log(`    ID: ${expense.id}`);
        console.log('');
      });
    }
    
    // Check approval workflow setup
    const approvals = await pool.query(`
      SELECT ea.id, ea.status, ea.sequence,
             e.id as expense_id, e.amount,
             u.name as approver_name, u.email as approver_email
      FROM expense_approvals ea
      JOIN expenses e ON ea.expense_id = e.id
      JOIN users u ON ea.approver_id = u.id
      ORDER BY ea.created_at DESC
      LIMIT 5
    `);
    
    console.log('✅ APPROVAL WORKFLOW:');
    if (approvals.rows.length === 0) {
      console.log('  No approval records found');
    } else {
      approvals.rows.forEach(approval => {
        console.log(`  Expense $${approval.amount} - ${approval.status}`);
        console.log(`    Approver: ${approval.approver_name} (${approval.approver_email})`);
        console.log(`    Sequence: ${approval.sequence}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();