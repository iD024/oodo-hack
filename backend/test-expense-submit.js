const pool = require('./config/database');
const User = require('./models/userModel');
const Expense = require('./models/expenseModel');
const ExpenseApproval = require('./models/expenseApprovalModel');

(async () => {
  try {
    console.log('🧪 Testing Expense Submission...\n');
    
    // Get the test user
    const testUser = await User.findByEmail('test@gmail.com');
    if (!testUser) {
      console.error('❌ Test user not found');
      process.exit(1);
    }
    
    console.log('👤 Test User:', {
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
      role: testUser.role,
      manager_id: testUser.manager_id
    });
    
    // Test creating an expense
    const client = await pool.connect();
    await client.query('BEGIN');
    
    console.log('\n💰 Creating test expense...');
    const testExpenseData = {
      user_id: testUser.id,
      amount: 99.99,
      currency: 'USD',
      category: 'Testing',
      description: 'Test expense submission',
      status: 'pending'
    };
    
    const newExpense = await Expense.create(testExpenseData, client);
    console.log('✅ Expense created:', {
      id: newExpense.id,
      amount: newExpense.amount,
      status: newExpense.status
    });
    
    // Test approval workflow
    if (testUser.manager_id) {
      console.log('\n🔄 Creating approval workflow...');
      const approval = await ExpenseApproval.create({
        expense_id: newExpense.id,
        approver_id: testUser.manager_id,
        sequence: 1
      }, client);
      
      console.log('✅ Approval created:', {
        id: approval.id,
        approver_id: approval.approver_id,
        status: approval.status
      });
    } else {
      console.log('\n⚠️  No manager assigned - would auto-approve');
    }
    
    await client.query('COMMIT');
    client.release();
    
    console.log('\n✅ Test completed successfully!');
    console.log('You should now be able to submit expenses through the frontend.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    
    // Try to rollback if we have a client
    try {
      if (client) {
        await client.query('ROLLBACK');
        client.release();
      }
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError.message);
    }
  } finally {
    await pool.end();
    process.exit(0);
  }
})();