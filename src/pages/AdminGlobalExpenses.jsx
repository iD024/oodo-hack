import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

const AdminGlobalExpenses = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const db = getFirestore();
    const expensesRef = collection(db, 'artifacts', 'expense-management-app', 'expenses');
    const q = query(expensesRef, orderBy('submittedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = [];
      snapshot.forEach((doc) => {
        expensesData.push({ id: doc.id, ...doc.data() });
      });
      setExpenses(expensesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredExpenses = expenses.filter(expense => {
    const matchesFilter = filter === 'all' || expense.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getTotalAmount = (status) => {
    return expenses
      .filter(expense => status === 'all' || expense.status.toLowerCase() === status.toLowerCase())
      .reduce((total, expense) => total + expense.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Global Expenses View</h1>
        <p className="text-gray-600">View and monitor all expense claims across the organization</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{expenses.length}</div>
            <div className="text-sm text-gray-600">Total Claims</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {expenses.filter(e => e.status === 'Pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {expenses.filter(e => e.status === 'Approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {expenses.filter(e => e.status === 'Rejected').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalAmount('approved'), 'USD')}
            </div>
            <div className="text-sm text-gray-600">Total Approved</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(getTotalAmount('pending'), 'USD')}
            </div>
            <div className="text-sm text-gray-600">Pending Approval</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(getTotalAmount('all'), 'USD')}
            </div>
            <div className="text-sm text-gray-600">Total Submitted</div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({expenses.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pending ({expenses.filter(e => e.status === 'Pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Approved ({expenses.filter(e => e.status === 'Approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Rejected ({expenses.filter(e => e.status === 'Rejected').length})
            </button>
          </div>
          
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </Card>

      {/* Expenses Table */}
      <Card>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No expenses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Submitted By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Current Approver</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(expense.amount, expense.currency)}
                    </td>
                    <td className="py-3 px-4">{expense.category}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{expense.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{expense.submittedBy}</td>
                    <td className="py-3 px-4">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {expense.currentApproverId || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminGlobalExpenses;
