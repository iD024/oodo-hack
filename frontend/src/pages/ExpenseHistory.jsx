import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

const ExpenseHistory = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load demo data for demonstration purposes
    const loadDemoData = () => {
      setLoading(true);
      
      setTimeout(() => {
        const demoExpenses = [
          {
            id: '1',
            amount: 125.50,
            currency: 'USD',
            category: 'Meals',
            description: 'Client lunch meeting at downtown restaurant',
            date: new Date().toISOString(),
            status: 'Pending',
            submittedAt: new Date().toISOString(),
            receipt: 'receipt_001.pdf'
          },
          {
            id: '2',
            amount: 45.00,
            currency: 'USD',
            category: 'Transportation',
            description: 'Taxi ride to client site',
            date: new Date(Date.now() - 86400000).toISOString(),
            status: 'Approved',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            receipt: 'receipt_002.pdf',
            approvedBy: 'John Manager',
            approvedAt: new Date(Date.now() - 43200000).toISOString()
          },
          {
            id: '3',
            amount: 89.99,
            currency: 'USD',
            category: 'Office Supplies',
            description: 'Printer paper, pens, and notebooks',
            date: new Date(Date.now() - 172800000).toISOString(),
            status: 'Approved',
            submittedAt: new Date(Date.now() - 172800000).toISOString(),
            receipt: 'receipt_003.pdf',
            approvedBy: 'Sarah Finance',
            approvedAt: new Date(Date.now() - 129600000).toISOString()
          },
          {
            id: '4',
            amount: 250.00,
            currency: 'USD',
            category: 'Travel',
            description: 'Hotel booking for conference (exceeded daily limit)',
            date: new Date(Date.now() - 259200000).toISOString(),
            status: 'Rejected',
            submittedAt: new Date(Date.now() - 259200000).toISOString(),
            receipt: 'receipt_004.pdf',
            rejectedBy: 'Mike Director',
            rejectedAt: new Date(Date.now() - 216000000).toISOString(),
            rejectionReason: 'Exceeds daily hotel allowance of $200'
          },
          {
            id: '5',
            amount: 75.30,
            currency: 'USD',
            category: 'Meals',
            description: 'Team dinner after project completion',
            date: new Date(Date.now() - 345600000).toISOString(),
            status: 'Approved',
            submittedAt: new Date(Date.now() - 345600000).toISOString(),
            receipt: 'receipt_005.pdf',
            approvedBy: 'Lisa Team Lead',
            approvedAt: new Date(Date.now() - 302400000).toISOString()
          },
          {
            id: '6',
            amount: 32.50,
            currency: 'USD',
            category: 'Transportation',
            description: 'Uber ride to airport',
            date: new Date(Date.now() - 432000000).toISOString(),
            status: 'Pending',
            submittedAt: new Date(Date.now() - 432000000).toISOString(),
            receipt: 'receipt_006.pdf'
          },
          {
            id: '7',
            amount: 156.75,
            currency: 'USD',
            category: 'Meals',
            description: 'Business dinner with potential client',
            date: new Date(Date.now() - 518400000).toISOString(),
            status: 'Approved',
            submittedAt: new Date(Date.now() - 518400000).toISOString(),
            receipt: 'receipt_007.pdf',
            approvedBy: 'David VP',
            approvedAt: new Date(Date.now() - 475200000).toISOString()
          },
          {
            id: '8',
            amount: 45.00,
            currency: 'USD',
            category: 'Office Supplies',
            description: 'Software license renewal',
            date: new Date(Date.now() - 604800000).toISOString(),
            status: 'Rejected',
            submittedAt: new Date(Date.now() - 604800000).toISOString(),
            receipt: 'receipt_008.pdf',
            rejectedBy: 'IT Department',
            rejectedAt: new Date(Date.now() - 561600000).toISOString(),
            rejectionReason: 'Software purchases require IT approval first'
          }
        ];
        
        setExpenses(demoExpenses);
        setLoading(false);
      }, 1000);
    };

    loadDemoData();
  }, [user]);

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true;
    return expense.status.toLowerCase() === filter.toLowerCase();
  });

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Expense History</h1>
        <p className="text-gray-600">View all your submitted expense claims</p>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex space-x-4">
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
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{expenses.length}</div>
            <div className="text-sm text-gray-600">Total Expenses</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {expenses.filter(e => e.status === 'Pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {expenses.filter(e => e.status === 'Approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {expenses.filter(e => e.status === 'Rejected').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">No expenses found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filter or submit a new expense</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(expense.amount, expense.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="truncate" title={expense.description}>
                        {expense.description}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(expense.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View
                        </button>
                        {expense.receipt && (
                          <button className="text-green-600 hover:text-green-800 text-sm">
                            Receipt
                          </button>
                        )}
                      </div>
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

export default ExpenseHistory;
