// Remove demo data after backend integration

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

const EmployeeDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and demo data
    const loadDemoData = () => {
      setLoading(true);
      
      setTimeout(() => {
        // Demo stats
        setStats({
          pending: 3,
          approved: 12,
          rejected: 1,
          total: 16
        });
        
        // Demo recent expenses
        setRecentExpenses([
          {
            id: '1',
            amount: 125.50,
            currency: '$',
            category: 'Meals',
            date: new Date().toISOString(),
            status: 'Pending',
            description: 'Client lunch meeting'
          },
          {
            id: '2',
            amount: 45.00,
            currency: '$',
            category: 'Transportation',
            date: new Date(Date.now() - 86400000).toISOString(),
            status: 'Approved',
            description: 'Taxi to client site'
          },
          {
            id: '3',
            amount: 89.99,
            currency: '$',
            category: 'Office Supplies',
            date: new Date(Date.now() - 172800000).toISOString(),
            status: 'Approved',
            description: 'Printer paper and pens'
          },
          {
            id: '4',
            amount: 250.00,
            currency: '$',
            category: 'Travel',
            date: new Date(Date.now() - 259200000).toISOString(),
            status: 'Rejected',
            description: 'Hotel booking (exceeded limit)'
          },
          {
            id: '5',
            amount: 75.30,
            currency: '$',
            category: 'Meals',
            date: new Date(Date.now() - 345600000).toISOString(),
            status: 'Approved',
            description: 'Team dinner'
          }
        ]);
        
        setLoading(false);
      }, 1000);
    };

    loadDemoData();
  }, [user]);

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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Employee Dashboard</h1>
        <p className="text-gray-600">Welcome to your expense management dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending Claims</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved Claims</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected Claims</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Claims</div>
          </div>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card title="Recent Expense Claims">
        {recentExpenses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No expense claims yet</p>
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
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">
                      {expense.currency}{expense.amount}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {expense.description}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={expense.status} />
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

export default EmployeeDashboard;
