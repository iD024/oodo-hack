import React from 'react';
import Card from '../components/Card';

const AboutPage = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About Expense Management System</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A comprehensive solution for managing business expenses with automated workflows, 
          real-time tracking, and powerful analytics.
        </p>
      </div>

      {/* Features Overview */}
      <Card title="🚀 Key Features">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">Submission</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Easy Submission</h3>
            <p className="text-gray-600">Submit expenses with receipts and supporting documents in just a few clicks.</p>
          </div>
          
          <div className="text-center p-4">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">Approval</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Fast Approval</h3>
            <p className="text-gray-600">Automated workflows ensure quick approval based on your organization's rules.</p>
          </div>
          
          <div className="text-center p-4">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">Analytics</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Real-time Analytics</h3>
            <p className="text-gray-600">Track spending patterns and get insights with comprehensive reporting.</p>
          </div>
          
          <div className="text-center p-4">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">Security</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Secure & Compliant</h3>
            <p className="text-gray-600">Enterprise-grade security with audit trails and compliance reporting.</p>
          </div>
          
          <div className="text-center p-4">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">Mobile</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Mobile Ready</h3>
            <p className="text-gray-600">Access and manage expenses from any device, anywhere, anytime.</p>
          </div>
          
          <div className="text-center p-4">
            <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">Customise</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Customizable</h3>
            <p className="text-gray-600">Tailor approval workflows and rules to match your organization's needs.</p>
          </div>
        </div>
      </Card>

      {/* User Roles */}
      <Card title="User Roles & Permissions">
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-6">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Employee</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Submit expense claims with receipts</li>
              <li>• Track personal expense history</li>
              <li>• View approval status and comments</li>
              <li>• Upload supporting documents</li>
              <li>• Set up recurring expense templates</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-xl font-semibold text-green-700 mb-2">Manager</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Review and approve expense claims</li>
              <li>• Set approval thresholds and limits</li>
              <li>• View team expense reports and analytics</li>
              <li>• Manage approval workflows</li>
              <li>• Generate departmental expense summaries</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-xl font-semibold text-purple-700 mb-2">Administrator</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Manage all users and their roles</li>
              <li>• Configure global approval rules</li>
              <li>• View organization-wide expense analytics</li>
              <li>• Set up organizational policies</li>
              <li>• Monitor system usage and performance</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Workflow */}
      <Card title="How It Works">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
            <h3 className="font-semibold mb-2">Submit</h3>
            <p className="text-sm text-gray-600">Employee submits expense with receipts and details</p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
            <h3 className="font-semibold mb-2">Review</h3>
            <p className="text-sm text-gray-600">Manager reviews and validates the expense claim</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
            <h3 className="font-semibold mb-2">Approve</h3>
            <p className="text-sm text-gray-600">Approval based on configured rules and thresholds</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
            <h3 className="font-semibold mb-2">Process</h3>
            <p className="text-sm text-gray-600">Automatic processing and reimbursement</p>
          </div>
        </div>
      </Card>

      {/* Technology Stack */}
      <Card title="Technology Stack">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-blue-600">React</h4>
            <p className="text-sm text-gray-600">Frontend Framework</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-green-600">PostgreSQL, Node.js and Express.js</h4>
            <p className="text-sm text-gray-600">Backend & Database</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-purple-600">Tailwind CSS</h4>
            <p className="text-sm text-gray-600">Styling Framework</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-orange-600">Vite</h4>
            <p className="text-sm text-gray-600">Build Tool</p>
          </div>
        </div>
      </Card>

      {/* Contact Info */}
      <Card title="Support & Contact">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you get the most out of the Expense Management System.
            </p>
            <div className="space-y-2">
              <p className="flex items-center space-x-2">
                <span className="text-blue-600">mail support</span>
                <span>support@expensemanagement.com</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="text-green-600">call support</span>
                <span>+1 (555) 123-4567</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="text-purple-600">chat support</span>
                <span>Live Chat Available</span>
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3">System Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Version:</span> 1.0.0</p>
              <p><span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}</p>
              <p><span className="font-medium">Status:</span> <span className="text-green-600">Operational</span></p>
              <p><span className="font-medium">Uptime:</span> 99.9%</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AboutPage;
