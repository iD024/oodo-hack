import React from 'react';

const RoleSwitcher = ({ currentRole, onRoleChange }) => {
  const roles = [
    { id: 'employee', label: 'Employee', icon: '👤', color: 'blue' },
    { id: 'manager', label: 'Manager', icon: '👨‍💼', color: 'green' },
    { id: 'admin', label: 'Admin', icon: '👑', color: 'purple' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Demo Role Switcher</h3>
      <p className="text-sm text-gray-600 mb-4">
        Switch between different user roles to test the application features
      </p>
      <div className="flex space-x-3">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleChange(role.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentRole === role.id
                ? `bg-${role.color}-100 text-${role.color}-700 border-2 border-${role.color}-300`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
            }`}
          >
            <span className="text-lg">{role.icon}</span>
            <span>{role.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500">
        Current role: <span className="font-medium capitalize">{currentRole}</span>
      </div>
    </div>
  );
};

export default RoleSwitcher;
