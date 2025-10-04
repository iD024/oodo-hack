import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, query, where, doc, updateDoc, addDoc } from 'firebase/firestore';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const ManagerDashboard = ({ user }) => {
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Load demo data for manager dashboard
    const loadDemoData = () => {
      setLoading(true);
      
      setTimeout(() => {
        const demoPendingExpenses = [
          {
            id: '1',
            amount: 125.50,
            currency: 'USD',
            category: 'Meals',
            description: 'Client lunch meeting at downtown restaurant',
            submittedAt: new Date().toISOString(),
            status: 'Pending',
            employeeName: 'John Smith',
            employeeId: 'emp_001',
            currentStepIndex: 0,
            approvalHistory: []
          },
          {
            id: '2',
            amount: 89.99,
            currency: 'USD',
            category: 'Office Supplies',
            description: 'Printer paper, pens, and notebooks',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'Pending',
            employeeName: 'Sarah Johnson',
            employeeId: 'emp_002',
            currentStepIndex: 0,
            approvalHistory: []
          },
          {
            id: '3',
            amount: 250.00,
            currency: 'USD',
            category: 'Travel',
            description: 'Hotel booking for conference',
            submittedAt: new Date(Date.now() - 172800000).toISOString(),
            status: 'Pending',
            employeeName: 'Mike Davis',
            employeeId: 'emp_003',
            currentStepIndex: 0,
            approvalHistory: []
          }
        ];
        
        setPendingExpenses(demoPendingExpenses);
        setLoading(false);
      }, 1000);
    };

    loadDemoData();
  }, [user]);

  const handleApproval = async (expenseId, action) => {
    setProcessing(true);
    
    try {
      const db = getFirestore();
      const expenseRef = doc(db, 'artifacts', 'expense-management-app', 'expenses', expenseId);
      
      // Get approval rules configuration
      const rulesRef = doc(db, 'artifacts', 'expense-management-app', 'public', 'data', 'rules', 'config');
      const rulesDoc = await getDocs(collection(db, 'artifacts', 'expense-management-app', 'public', 'data', 'rules', 'config'));
      
      let rules = null;
      if (!rulesDoc.empty) {
        rules = rulesDoc.docs[0].data();
      }

      if (action === 'approve') {
        // Check if this is the final step or if conditional rules apply
        const currentStep = rules?.sequentialSteps?.[expenseId.currentStepIndex] || null;
        const isFinalStep = !currentStep || expenseId.currentStepIndex >= (rules?.sequentialSteps?.length || 0) - 1;
        
        if (isFinalStep) {
          // Final approval
          await updateDoc(expenseRef, {
            status: 'Approved',
            approvedAt: new Date().toISOString(),
            approvedBy: user.uid
          });
        } else {
          // Move to next step
          const nextStepIndex = expenseId.currentStepIndex + 1;
          const nextStep = rules?.sequentialSteps?.[nextStepIndex];
          
          if (nextStep) {
            // Find the next approver based on role
            const nextApproverId = await findApproverByRole(nextStep.role);
            
            await updateDoc(expenseRef, {
              currentStepIndex: nextStepIndex,
              currentApproverId: nextApproverId,
              approvalHistory: [...(expenseId.approvalHistory || []), {
                step: expenseId.currentStepIndex,
                approverId: user.uid,
                action: 'approved',
                comment: approvalComment,
                timestamp: new Date().toISOString()
              }]
            });
          }
        }
      } else {
        // Reject
        await updateDoc(expenseRef, {
          status: 'Rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: user.uid,
          rejectionReason: approvalComment
        });
      }

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

  const findApproverByRole = async (role) => {
    // Mock function - in real implementation, this would query users by role
    // For now, return a mock UID
    return `approver_${role}_uid`;
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
            <div className="text-3xl font-bold text-yellow-600">{pendingExpenses.length}</div>
            <div className="text-sm text-gray-600">Pending Approvals</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">Approved Today</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">2</div>
            <div className="text-sm text-gray-600">Rejected Today</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">156</div>
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
