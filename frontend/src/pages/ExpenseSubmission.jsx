import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import apiService from '../services/apiService';

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
  const [ocrEnabled, setOcrEnabled] = useState(false); // OCR toggle for testing
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currencies, setCurrencies] = useState(['USD']);
  
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

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await apiService.get('/currencies');
        setCurrencies(response.data.map(c => c.code));
      } catch (err) {
        console.error('Error fetching currencies:', err);
      }
    };
    
    fetchCurrencies();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      
      // Only process OCR if enabled
      if (ocrEnabled) {
        try {
          setOcrProcessing(true);
          const formData = new FormData();
          formData.append('receipt', file);
          
          const response = await apiService.post('/expenses/process-receipt', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          // Update form with OCR extracted data
          if (response.data.parsedData) {
            setFormData(prev => ({
              ...prev,
              amount: response.data.parsedData.total?.toString() || prev.amount,
              description: response.data.parsedData.description || prev.description
            }));
          }
        } catch (err) {
          console.error('OCR processing error:', err);
          setError('Failed to process receipt with OCR. You can still submit manually.');
        } finally {
          setOcrProcessing(false);
        }
      }
    }
  };
    setError('');
    setSuccess('');

    try {
      const expenseFormData = new FormData();
      Object.keys(formData).forEach(key => {
        expenseFormData.append(key, formData[key]);
      });
      
      if (receiptFile) {
        expenseFormData.append('receipt', receiptFile);
      }

      await apiService.post('/expenses', expenseFormData);

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
          {/* OCR Toggle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">OCR Processing (Testing Feature)</h3>
                <p className="text-xs text-blue-600 mt-1">
                  Enable to automatically extract data from receipt images using OCR
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ocrEnabled"
                  checked={ocrEnabled}
                  onChange={(e) => setOcrEnabled(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ocrEnabled" className="ml-2 text-sm text-blue-700">
                  {ocrEnabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>
            </div>
          </div>

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
              <p className="mt-2 text-sm text-blue-600">
                🔄 Processing receipt with OCR...
              </p>
            )}
            {receiptFile && !ocrProcessing && (
              <p className="mt-2 text-sm text-green-600">
                ✅ Receipt uploaded: {receiptFile.name}
                {ocrEnabled && " (OCR processed)"}
                {!ocrEnabled && " (OCR disabled - manual entry required)"}
              </p>
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
                setError('');
                setSuccess('');
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
