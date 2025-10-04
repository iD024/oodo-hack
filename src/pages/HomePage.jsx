import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

const HomePage = ({ user, userRole, onPageChange }) => {
  const getRoleFeatures = () => {
    switch (userRole) {
      case 'employee':
        return {
          title: 'Employee Features',
          features: [
            'Submit expense claims with receipts',
            'Track your expense history',
            'View approval status in real-time',
            'Upload supporting documents',
            'Set up recurring expenses'
          ],
          actions: [
            { label: 'Submit New Expense', page: 'submit-expense', color: 'primary' },
            { label: 'View My Expenses', page: 'expense-history', color: 'secondary' }
          ]
        };
      case 'manager':
        return {
          title: 'Manager Features',
          features: [
            'Review and approve expense claims',
            'Set approval thresholds',
            'View team expense reports',
            'Manage approval workflows',
            'Generate expense analytics'
          ],
          actions: [
            { label: 'Approval Queue', page: 'dashboard', color: 'primary' },
            { label: 'Team Reports', page: 'expense-history', color: 'secondary' }
          ]
        };
      case 'admin':
        return {
          title: 'Administrator Features',
          features: [
            'Manage all users and roles',
            'Configure approval rules',
            'View global expense analytics',
            'Set up organizational policies',
            'Monitor system usage'
          ],
          actions: [
            { label: 'User Management', page: 'user-management', color: 'primary' },
            { label: 'Approval Rules', page: 'approval-rules', color: 'secondary' },
            { label: 'Global Analytics', page: 'global-expenses', color: 'success' }
          ]
        };
      default:
        return {
          title: 'Welcome to Expense Management',
          features: [
            'Streamlined expense reporting',
            'Automated approval workflows',
            'Real-time tracking and analytics',
            'Mobile-friendly interface',
            'Secure document storage'
          ],
          actions: []
        };
    }
  };

  const roleInfo = getRoleFeatures();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Expense Management System.
        </h1>
        <p className="text-xl opacity-90 mb-6">
          Streamline your expense reporting with our comprehensive solution.
        </p>
        <p className="mb-6">
          You are logged in as a <span className="font-semibold capitalize">{userRole}</span>
        </p>
        <div className="flex items-center space-x-4">
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <span className="text-2xl">{/* User Icon */}</span> {/* You can replace this with an actual user icon */}
          </div>
          <div>
            <p className="font-semibold">{user?.displayName || 'Demo User'}</p>
            <p className="text-sm opacity-80 capitalize">{userRole} Dashboard</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleInfo.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.color}
              onClick={() => onPageChange(action.page)}
              className="w-full justify-center py-4"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Features Overview */}
      <Card title={roleInfo.title}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roleInfo.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2 mt-1">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{feature}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Analytics">
          <div className="space-y-2">
            <p className="text-2xl font-bold text-blue-600">Real-time</p>
            <p className="text-gray-600">Track expenses and approvals instantly</p>
          </div>
        </Card>
        
        <Card title="Security">
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600">Secure</p>
            <p className="text-gray-600">Enterprise-grade data protection</p>
          </div>
        </Card>
        
        <Card title="Mobile">
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">Responsive</p>
            <p className="text-gray-600">Access from any device, anywhere</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <span className="text-blue-600"></span>
              </div>
              <div>
                <p className="font-medium">Welcome to the system!</p>
                <p className="text-sm text-gray-600">Your account is ready to use</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Just now</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <span className="text-green-600"></span>
              </div>
              <div>
                <p className="font-medium">System initialized</p>
                <p className="text-sm text-gray-600">All features are available now</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Just now</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HomePage;
