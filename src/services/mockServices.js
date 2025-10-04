// Mock OCR Service
export const mockOCRService = {
  processReceipt: async (file) => {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock OCR results based on file type
    const fileName = file.name.toLowerCase();
    const mockResults = {
      amount: (Math.random() * 500 + 50).toFixed(2),
      currency: getRandomCurrency(),
      description: generateMockDescription(fileName),
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    };
    
    return mockResults;
  }
};

// Mock Currency Conversion Service
export const mockCurrencyService = {
  convertCurrency: async (amount, fromCurrency, toCurrency) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock exchange rates (simplified)
    const exchangeRates = {
      'USD': 1.0,
      'EUR': 0.85,
      'GBP': 0.73,
      'JPY': 110.0,
      'CAD': 1.25,
      'AUD': 1.35
    };
    
    const fromRate = exchangeRates[fromCurrency] || 1.0;
    const toRate = exchangeRates[toCurrency] || 1.0;
    
    const convertedAmount = (amount / fromRate) * toRate;
    
    return {
      originalAmount: amount,
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      fromCurrency,
      toCurrency,
      exchangeRate: toRate / fromRate,
      timestamp: new Date().toISOString()
    };
  }
};

// Helper functions
const getRandomCurrency = () => {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  return currencies[Math.floor(Math.random() * currencies.length)];
};

const generateMockDescription = (fileName) => {
  const descriptions = [
    'Business lunch meeting',
    'Office supplies purchase',
    'Transportation expense',
    'Client entertainment',
    'Training materials',
    'Software subscription',
    'Conference registration',
    'Travel accommodation',
    'Equipment maintenance',
    'Professional development'
  ];
  
  const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
  const fileType = fileName.includes('receipt') ? 'Receipt' : 'Invoice';
  
  return `${fileType} - ${randomDescription}`;
};

// Mock Approval Rules Service
export const mockApprovalRulesService = {
  getApprovalRules: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      sequentialSteps: [
        { role: 'manager', threshold: 500 },
        { role: 'finance', threshold: 1000 },
        { role: 'director', threshold: 5000 }
      ],
      conditionalRules: [
        { 
          type: 'specific', 
          approverId: 'CFO_UID', 
          trigger: 'auto_approve',
          condition: 'amount > 10000'
        },
        {
          type: 'percentage',
          approverId: 'TEAM_LEAD_UID',
          trigger: 'require_comment',
          condition: 'amount > 2000'
        }
      ]
    };
  },
  
  evaluateApprovalPath: async (expenseAmount, currentStepIndex) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const rules = await mockApprovalRulesService.getApprovalRules();
    const currentStep = rules.sequentialSteps[currentStepIndex];
    
    if (!currentStep) {
      return { isFinalStep: true, nextApprover: null };
    }
    
    const nextStep = rules.sequentialSteps[currentStepIndex + 1];
    const isFinalStep = !nextStep;
    
    return {
      isFinalStep,
      nextApprover: isFinalStep ? null : `approver_${nextStep.role}_uid`,
      currentStep,
      nextStep
    };
  }
};

// Mock User Service
export const mockUserService = {
  getUsersByRole: async (role) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUsers = {
      manager: [
        { id: 'manager_1', name: 'John Manager', email: 'john@company.com' },
        { id: 'manager_2', name: 'Jane Manager', email: 'jane@company.com' }
      ],
      finance: [
        { id: 'finance_1', name: 'Finance Officer', email: 'finance@company.com' }
      ],
      director: [
        { id: 'director_1', name: 'Company Director', email: 'director@company.com' }
      ]
    };
    
    return mockUsers[role] || [];
  },
  
  findApproverByRole: async (role) => {
    const users = await mockUserService.getUsersByRole(role);
    return users.length > 0 ? users[0].id : null;
  }
};
