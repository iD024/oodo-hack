import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import apiService from '../services/apiService';

const ManagerDashboard = ({ user }) => {
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalProcessed: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [pendingResponse, statsResponse] = await Promise.all([
          apiService.get('/expenses/pending'),
          apiService.get('/manager/stats')
        ]);
        
        setPendingExpenses(pendingResponse.data);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApproval = async (expenseId, action) => {
    setProcessing(true);
    
    try {
      await apiService.post(`/expenses/${expenseId}/${action}`, {
        comment: approvalComment
      });

      // Refresh the pending expenses and stats
      const [pendingResponse, statsResponse] = await Promise.all([
        apiService.get('/expenses/pending'),
        apiService.get('/manager/stats')
      ]);
      
      setPendingExpenses(pendingResponse.data);
      setStats(statsResponse.data);
      
      setShowApprovalModal(false);
      setApprovalComment('');
      setSelectedExpense(null);
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to process approval. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Manager Dashboard</h1>
        <p className="text-gray-600">Review and approve expense claims</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.totalPending}</div>
            <div className="text-sm text-gray-600">Pending Approvals</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.approvedToday}</div>
            <div className="text-sm text-gray-600">Approved Today</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats.rejectedToday}</div>
            <div className="text-sm text-gray-600">Rejected Today</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalProcessed}</div>
            <div className="text-sm text-gray-600">Total Processed</div>
          </div>
        </Card>
      </div>

      {/* Pending Expenses */}
      <Card title="Pending Approvals">
        {pendingExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingExpenses.map((expense) => (
              <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {formatCurrency(expense.amount, expense.currency)}
                      </h3>
                      <StatusBadge status={expense.status} />
                    </div>
                    <p className="text-gray-600">{expense.category} - {expense.description}</p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Employee:</span> {expense.employeeName}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Submitted:</span> {new Date(expense.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedExpense(expense);
                      setShowApprovalModal(true);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setSelectedExpense(expense);
                      setShowApprovalModal(true);
                    }}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setApprovalComment('');
          setSelectedExpense(null);
        }}
        title="Approval Action"
      >
        {selectedExpense && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Expense Details</h3>
              <p>Amount: {formatCurrency(selectedExpense.amount, selectedExpense.currency)}</p>
              <p>Category: {selectedExpense.category}</p>
              <p>Description: {selectedExpense.description}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Required)
              </label>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="3"
                placeholder="Enter your approval/rejection comment..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalComment('');
                  setSelectedExpense(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleApproval(selectedExpense.id, 'reject')}
                disabled={!approvalComment.trim() || processing}
              >
                {processing ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                variant="success"
                onClick={() => handleApproval(selectedExpense.id, 'approve')}
                disabled={!approvalComment.trim() || processing}
              >
                {processing ? 'Processing...' : 'Approve'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
