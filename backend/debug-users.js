const pool = require('./config/database');

(async () => {
  try {
    console.log('=== User Management Debug ===');
    
    // Get all users
    const allUsers = await pool.query('SELECT id, name, email, role, manager_id FROM users ORDER BY role, name');
    console.log('All users:');
    allUsers.rows.forEach(user => {
      console.log(`  ${user.role.toUpperCase()}: ${user.name} (${user.email}) - ID: ${user.id.substr(0, 8)}... - Manager: ${user.manager_id ? user.manager_id.substr(0, 8) + '...' : 'None'}`);
    });
    
    // Get managers/admins
    const managers = await pool.query('SELECT id, name, email, role FROM users WHERE role IN ($1, $2)', ['manager', 'admin']);
    console.log('\nAvailable managers/admins:');
    managers.rows.forEach(manager => {
      console.log(`  ${manager.name} (${manager.email}) - ${manager.role} - ID: ${manager.id.substr(0, 8)}...`);
    });
    
    // Check expense approval workflow setup
    const expenses = await pool.query('SELECT id, user_id, status, approved_by FROM expenses ORDER BY submitted_at DESC LIMIT 3');
    console.log('\nRecent expenses:');
    expenses.rows.forEach(expense => {
      console.log(`  Expense ${expense.id.substr(0, 8)}... - Status: ${expense.status} - User: ${expense.user_id.substr(0, 8)}... - Approved by: ${expense.approved_by ? expense.approved_by.substr(0, 8) + '...' : 'None'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();