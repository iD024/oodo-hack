const pool = require('./config/database');

(async () => {
  try {
    console.log('🔧 Checking and fixing database schema...\n');
    
    // Check current expense_approvals table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'expense_approvals' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Current expense_approvals table structure:');
    tableInfo.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check if sequence column exists
    const hasSequence = tableInfo.rows.some(col => col.column_name === 'sequence');
    
    if (!hasSequence) {
      console.log('\n⚠️  Missing "sequence" column, adding it...');
      await pool.query(`
        ALTER TABLE expense_approvals 
        ADD COLUMN sequence INTEGER NOT NULL DEFAULT 1
      `);
      console.log('✅ Added sequence column');
    } else {
      console.log('\n✅ sequence column already exists');
    }
    
    // Check if we need to fix the approver_id column type
    const approverIdCol = tableInfo.rows.find(col => col.column_name === 'approver_id');
    if (approverIdCol && approverIdCol.data_type === 'integer') {
      console.log('\n⚠️  approver_id is INTEGER, should be UUID. Fixing...');
      
      // First, check if there's data
      const dataCheck = await pool.query('SELECT COUNT(*) FROM expense_approvals');
      if (parseInt(dataCheck.rows[0].count) > 0) {
        console.log('🗑️  Clearing existing approval data...');
        await pool.query('DELETE FROM expense_approvals');
      }
      
      // Fix the column type
      await pool.query(`
        ALTER TABLE expense_approvals 
        DROP CONSTRAINT IF EXISTS expense_approvals_approver_id_fkey,
        ALTER COLUMN approver_id TYPE UUID USING approver_id::text::uuid,
        ADD CONSTRAINT expense_approvals_approver_id_fkey 
        FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ Fixed approver_id column type');
    }
    
    // Check expense_id column type too
    const expenseIdCol = tableInfo.rows.find(col => col.column_name === 'expense_id');
    if (expenseIdCol && expenseIdCol.data_type === 'integer') {
      console.log('\n⚠️  expense_id is INTEGER, should be UUID. Fixing...');
      
      await pool.query(`
        ALTER TABLE expense_approvals 
        DROP CONSTRAINT IF EXISTS expense_approvals_expense_id_fkey,
        ALTER COLUMN expense_id TYPE UUID USING expense_id::text::uuid,
        ADD CONSTRAINT expense_approvals_expense_id_fkey 
        FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
      `);
      console.log('✅ Fixed expense_id column type');
    }
    
    // Show final table structure
    const finalTableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'expense_approvals' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Final expense_approvals table structure:');
    finalTableInfo.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n✅ Database schema fixed! You can now submit expenses.');
    
  } catch (error) {
    console.error('\n❌ Schema fix failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();