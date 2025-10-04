import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import apiService from '../services/apiService';

const AdminGlobalExpenses = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalAmount: 0,
    approvedAmount: 0,
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        // Get all expenses for admin view
        const expensesResponse = await apiService.get('/expenses/all');
        
        setExpenses(expensesResponse.data);
        
        // Calculate stats from the data
        const allExpenses = expensesResponse.data;
        const calculatedStats = {
          totalCount: allExpenses.length,
          pendingCount: allExpenses.filter(e => e.status === 'pending').length,
          approvedCount: allExpenses.filter(e => e.status === 'approved').length,
          rejectedCount: allExpenses.filter(e => e.status === 'rejected').length,
          totalAmount: allExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
          approvedAmount: allExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + parseFloat(e.amount), 0),
          pendingAmount: allExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + parseFloat(e.amount), 0)
        };
        setStats(calculatedStats);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpenses();
  }, []);

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const viewExpense = (expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedExpense(null);
    setShowModal(false);
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
            <div className="text-3xl font-bold text-blue-600">{stats.totalCount}</div>
            <div className="text-sm text-gray-600">Total Claims</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pendingCount}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.approvedCount}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {stats.rejectedCount}
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
              {formatCurrency(stats.approvedAmount, 'USD')}
            </div>
            <div className="text-sm text-gray-600">Total Approved</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats.pendingAmount, 'USD')}
            </div>
            <div className="text-sm text-gray-600">Pending Approval</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalAmount, 'USD')}
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
              All ({stats.totalCount})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pending ({stats.pendingCount})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Approved ({stats.approvedCount})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Rejected ({stats.rejectedCount})
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
        {(() => {
          // Filter expenses based on current filter and search
          const filteredExpenses = expenses.filter(expense => {
            const matchesFilter = filter === 'all' || expense.status.toLowerCase() === filter.toLowerCase();
            const matchesSearch = !searchTerm || 
              expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (expense.submitter_name && expense.submitter_name.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesFilter && matchesSearch;
          });
          
          return filteredExpenses.length === 0 ? (
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
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
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
                      <td className="py-3 px-4 text-sm text-gray-600">{expense.submitter_name || 'Unknown'}</td>
                      <td className="py-3 px-4">
                        {new Date(expense.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={expense.status} />
                      </td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => viewExpense(expense)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </Card>
      
      {/* Expense Details Modal */}
      {showModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Expense Details</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="bg-gray-100 px-3 py-2 rounded">{selectedExpense.category}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="py-1">
                    <StatusBadge status={selectedExpense.status} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
                  <p className="text-gray-900">{selectedExpense.submitter_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{selectedExpense.submitter_email || ''}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submitted Date</label>
                  <p className="text-gray-900">
                    {new Date(selectedExpense.submitted_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                {selectedExpense.approved_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Approved Date</label>
                    <p className="text-gray-900">
                      {new Date(selectedExpense.approved_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="bg-gray-50 p-4 rounded-lg text-gray-900">
                  {selectedExpense.description || 'No description provided'}
                </p>
              </div>
              
              {selectedExpense.receipt_url && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt</label>
                  <a 
                    href={selectedExpense.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Receipt
                  </a>
                </div>
              )}
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGlobalExpenses;
