import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDocs, setDoc, collection } from 'firebase/firestore';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const AdminApprovalRules = ({ user }) => {
  const [rules, setRules] = useState({
    sequentialSteps: [
      { role: 'manager', threshold: 500 },
      { role: 'finance', threshold: 1000 }
    ],
    conditionalRules: [
      { type: 'specific', approverId: 'CFO_UID', trigger: 'auto_approve' }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStep, setNewStep] = useState({ role: 'manager', threshold: 0 });
  const [newConditionalRule, setNewConditionalRule] = useState({ 
    type: 'specific', 
    approverId: '', 
    trigger: 'auto_approve' 
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const db = getFirestore();
      const rulesRef = doc(db, 'artifacts', 'expense-management-app', 'public', 'data', 'rules', 'config');
      const rulesDoc = await getDocs(collection(db, 'artifacts', 'expense-management-app', 'public', 'data', 'rules', 'config'));
      
      if (!rulesDoc.empty) {
        setRules(rulesDoc.docs[0].data());
      }
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRules = async () => {
    setSaving(true);
    try {
      const db = getFirestore();
      const rulesRef = doc(db, 'artifacts', 'expense-management-app', 'public', 'data', 'rules', 'config');
      await setDoc(rulesRef, {
        ...rules,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid
      });
      alert('Approval rules saved successfully!');
    } catch (error) {
      console.error('Error saving rules:', error);
      alert('Failed to save rules. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSequentialStep = () => {
    if (newStep.role && newStep.threshold >= 0) {
      setRules(prev => ({
        ...prev,
        sequentialSteps: [...prev.sequentialSteps, { ...newStep }]
      }));
      setNewStep({ role: 'manager', threshold: 0 });
    }
  };

  const removeSequentialStep = (index) => {
    setRules(prev => ({
      ...prev,
      sequentialSteps: prev.sequentialSteps.filter((_, i) => i !== index)
    }));
  };

  const addConditionalRule = () => {
    if (newConditionalRule.approverId.trim()) {
      setRules(prev => ({
        ...prev,
        conditionalRules: [...prev.conditionalRules, { ...newConditionalRule }]
      }));
      setNewConditionalRule({ type: 'specific', approverId: '', trigger: 'auto_approve' });
    }
  };

  const removeConditionalRule = (index) => {
    setRules(prev => ({
      ...prev,
      conditionalRules: prev.conditionalRules.filter((_, i) => i !== index)
    }));
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Approval Rules Configuration</h1>
        <p className="text-gray-600">Configure the approval workflow for expense claims</p>
      </div>

      {/* Sequential Rules */}
      <Card title="Sequential Approval Steps">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Define the order of approvers and their approval thresholds
          </p>
          
          {rules.sequentialSteps.map((step, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Step {index + 1}</span>
              <div className="flex-1">
                <span className="font-medium">{step.role}</span>
                <span className="text-gray-600 ml-2">(Threshold: ${step.threshold})</span>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() => removeSequentialStep(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          
          <div className="border-t pt-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newStep.role}
                  onChange={(e) => setNewStep(prev => ({ ...prev, role: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="manager">Manager</option>
                  <option value="finance">Finance</option>
                  <option value="director">Director</option>
                  <option value="cfo">CFO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Threshold ($)</label>
                <Input
                  type="number"
                  value={newStep.threshold}
                  onChange={(e) => setNewStep(prev => ({ ...prev, threshold: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <Button onClick={addSequentialStep}>
                Add Step
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Conditional Rules */}
      <Card title="Conditional Rules">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Define special approval conditions that can override the sequential flow
          </p>
          
          {rules.conditionalRules.map((rule, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Rule {index + 1}</span>
              <div className="flex-1">
                <span className="font-medium">{rule.type}</span>
                <span className="text-gray-600 ml-2">
                  ({rule.approverId} - {rule.trigger})
                </span>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() => removeConditionalRule(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          
          <div className="border-t pt-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newConditionalRule.type}
                  onChange={(e) => setNewConditionalRule(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="specific">Specific Approver</option>
                  <option value="percentage">Percentage Approval</option>
                  <option value="amount">Amount Threshold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approver ID</label>
                <Input
                  value={newConditionalRule.approverId}
                  onChange={(e) => setNewConditionalRule(prev => ({ ...prev, approverId: e.target.value }))}
                  placeholder="Enter approver ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
                <select
                  value={newConditionalRule.trigger}
                  onChange={(e) => setNewConditionalRule(prev => ({ ...prev, trigger: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="auto_approve">Auto Approve</option>
                  <option value="skip_step">Skip Step</option>
                  <option value="require_comment">Require Comment</option>
                </select>
              </div>
              <Button onClick={addConditionalRule}>
                Add Rule
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveRules}
          disabled={saving}
          className="px-8"
        >
          {saving ? 'Saving...' : 'Save Rules'}
        </Button>
      </div>
    </div>
  );
};

export default AdminApprovalRules;
