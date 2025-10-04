import React from 'react';

const SidebarNav = ({ userRole, currentPage, onPageChange, onLogout }) => {
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'home', label: 'Home'},
      { id: 'about', label: 'About'}
    ];

    switch (userRole) {
      case 'employee':
        return [
          ...baseItems,
          { id: 'dashboard', label: 'Dashboard'},
          { id: 'submit-expense', label: 'Submit Expense'},
          { id: 'expense-history', label: 'My Expenses'}
        ];
      case 'manager':
        return [
          ...baseItems,
          { id: 'dashboard', label: 'Approval Queue'},
          { id: 'expense-history', label: 'All Expenses'}
        ];
      case 'admin':
        return [
          ...baseItems,
          { id: 'dashboard', label: 'User Management'},
          { id: 'approval-rules', label: 'Approval Rules'},
          { id: 'global-expenses', label: 'All Expenses'}
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="w-64 bg-white shadow-lg h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-8">
          Expense Management
        </h1>
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                currentPage === item.id
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Logout Button */}
        <div className="mt-auto p-6">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 text-red-600 hover:bg-red-50"
          >
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;
