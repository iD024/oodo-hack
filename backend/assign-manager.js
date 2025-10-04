const pool = require('./config/database');

(async () => {
  try {
    console.log('=== Assigning Manager ===');
    
    // Get admin user as manager
    const adminResult = await pool.query('SELECT id, name FROM users WHERE email = $1', ['admin@company.com']);
    const admin = adminResult.rows[0];
    
    if (!admin) {
      console.error('Admin user not found');
      process.exit(1);
    }
    
    // Update test user to have admin as manager
    const updateResult = await pool.query(
      'UPDATE users SET manager_id = $1 WHERE email = $2 RETURNING name, email, manager_id',
      [admin.id, 'test@gmail.com']
    );
    
    if (updateResult.rows.length === 0) {
      console.error('Test user not found');
      process.exit(1);
    }
    
    console.log(`✅ Assigned ${admin.name} as manager for ${updateResult.rows[0].name}`);
    
    // Verify the assignment
    const verifyResult = await pool.query(`
      SELECT u.name, u.email, u.role, m.name as manager_name, m.email as manager_email 
      FROM users u 
      LEFT JOIN users m ON u.manager_id = m.id 
      WHERE u.email = $1
    `, ['test@gmail.com']);
    
    console.log('Updated user info:', verifyResult.rows[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();