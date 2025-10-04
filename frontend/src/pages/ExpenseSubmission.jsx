import React, { useState } from 'react';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const ExpenseSubmission = ({ user }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Travel',
    'Meals',
    'Office Supplies',
    'Transportation',
    'Accommodation',
    'Entertainment',
    'Training',
    'Other'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

  // Mock OCR processing
  const processReceiptOCR = async (file) => {
    setOcrProcessing(true);
    
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock OCR results
    const mockResults = {
      amount: (Math.random() * 500 + 50).toFixed(2),
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      description: `Receipt from ${file.name.split('.')[0]} - ${categories[Math.floor(Math.random() * categories.length)]}`
    };
    
    setFormData(prev => ({
      ...prev,
      amount: mockResults.amount,
      currency: mockResults.currency,
      description: mockResults.description
    }));
    
    setOcrProcessing(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      processReceiptOCR(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const db = getFirestore();
      
      // Get manager for this user
      const userProfileRef = doc(db, 'artifacts', 'expense-management-app', 'users', user.uid, 'profile', 'data');
      const userProfile = await getDocs(query(collection(db, 'artifacts', 'expense-management-app', 'users', user.uid, 'profile', 'data')));
      
      let managerId = null;
      if (!userProfile.empty) {
        const profileData = userProfile.docs[0].data();
        managerId = profileData.managerId;
      }

      // expense claim
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'Pending',
        currentApproverId: managerId,
        approvalHistory: [],
        currentStepIndex: 0,
        submittedBy: user.uid,
        submittedAt: new Date().toISOString(),
        receiptFileName: receiptFile?.name || null
      };

      await addDoc(collection(db, 'artifacts', 'expense-management-app', 'users', user.uid, 'claims'), expenseData);

      setSuccess('Expense claim submitted successfully!');
      setFormData({
        amount: '',
        currency: 'USD',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setReceiptFile(null);
    } catch (err) {
      setError('Failed to submit expense claim. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Submit Expense Claim</h1>
        <p className="text-gray-600">Fill out the form below to submit a new expense claim</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Upload
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {ocrProcessing && (
              <p className="mt-2 text-sm text-blue-600">Processing receipt with OCR...</p>
            )}
            {receiptFile && !ocrProcessing && (
              <p className="mt-2 text-sm text-green-600">Receipt uploaded: {receiptFile.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter expense description"
            required
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setFormData({
                  amount: '',
                  currency: 'USD',
                  category: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0]
                });
                setReceiptFile(null);
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ExpenseSubmission;
