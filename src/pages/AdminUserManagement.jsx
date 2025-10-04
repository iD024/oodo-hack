import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';

const AdminUserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'employee',
    managerId: null
  });

  useEffect(() => {
    // Load demo data for admin user management
    const loadDemoData = () => {
      setLoading(true);
      
      setTimeout(() => {
        const demoUsers = [
          {
            id: 'admin_001',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            role: 'admin',
            managerId: null,
            createdAt: new Date(Date.now() - 2592000000).toISOString(),
            lastLogin: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'manager_001',
            name: 'Mike Davis',
            email: 'mike.davis@company.com',
            role: 'manager',
            managerId: 'admin_001',
            createdAt: new Date(Date.now() - 1728000000).toISOString(),
            lastLogin: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 'manager_002',
            name: 'Lisa Chen',
            email: 'lisa.chen@company.com',
            role: 'manager',
            managerId: 'admin_001',
            createdAt: new Date(Date.now() - 1296000000).toISOString(),
            lastLogin: new Date(Date.now() - 259200000).toISOString()
          },
          {
            id: 'emp_001',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'employee',
            managerId: 'manager_001',
            createdAt: new Date(Date.now() - 864000000).toISOString(),
            lastLogin: new Date(Date.now() - 43200000).toISOString()
          },
          {
            id: 'emp_002',
            name: 'Emily Brown',
            email: 'emily.brown@company.com',
            role: 'employee',
            managerId: 'manager_001',
            createdAt: new Date(Date.now() - 604800000).toISOString(),
            lastLogin: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'emp_003',
            name: 'David Wilson',
            email: 'david.wilson@company.com',
            role: 'employee',
            managerId: 'manager_002',
            createdAt: new Date(Date.now() - 432000000).toISOString(),
            lastLogin: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 'emp_004',
            name: 'Anna Garcia',
            email: 'anna.garcia@company.com',
            role: 'employee',
            managerId: 'manager_002',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            lastLogin: new Date(Date.now() - 345600000).toISOString()
          },
          {
            id: 'emp_005',
            name: 'Tom Anderson',
            email: 'tom.anderson@company.com',
            role: 'employee',
            managerId: 'manager_001',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            lastLogin: new Date(Date.now() - 518400000).toISOString()
          }
        ];
        
        const demoManagers = [
          { id: 'admin_001', name: 'Sarah Johnson', role: 'admin' },
          { id: 'manager_001', name: 'Mike Davis', role: 'manager' },
          { id: 'manager_002', name: 'Lisa Chen', role: 'manager' }
        ];
        
        setUsers(demoUsers);
        setManagers(demoManagers);
        setLoading(false);
      }, 1000);
    };

    loadDemoData();
  }, []);

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      role: 'employee',
      managerId: null
    });
    setShowUserModal(true);
  };

  const handleEditUser = (userData) => {
    setEditingUser(userData);
    setUserForm({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      managerId: userData.managerId
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const db = getFirestore();
      
      if (editingUser) {
        // Update existing user
        const userRef = doc(db, 'artifacts', 'expense-management-app', 'users', editingUser.id, 'profile', 'data');
        await updateDoc(userRef, {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          managerId: userForm.managerId || null,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new user (this would typically be done through proper user creation)
        // For demo purposes, we'll create a mock user
        const newUserId = `user_${Date.now()}`;
        const userRef = doc(db, 'artifacts', 'expense-management-app', 'users', newUserId, 'profile', 'data');
        await setDoc(userRef, {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          managerId: userForm.managerId || null,
          createdAt: new Date().toISOString()
        });
      }
      
      setShowUserModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const db = getFirestore();
        const userRef = doc(db, 'artifacts', 'expense-management-app', 'users', userId, 'profile', 'data');
        await deleteDoc(userRef);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">User Management</h1>
          <p className="text-gray-600">Manage users and their roles</p>
        </div>
        <Button onClick={handleCreateUser}>
          Add New User
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Administrators</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => u.role === 'manager').length}
            </div>
            <div className="text-sm text-gray-600">Managers</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {users.filter(u => u.role === 'employee').length}
            </div>
            <div className="text-sm text-gray-600">Employees</div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Manager</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Login</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userData) => (
                <tr key={userData.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {userData.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{userData.name}</div>
                        <div className="text-sm text-gray-500">ID: {userData.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{userData.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userData.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      userData.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {userData.managerId ? 
                      <span className="text-sm text-gray-600">
                        {managers.find(m => m.id === userData.managerId)?.name || 'Unknown'}
                      </span> :
                      <span className="text-sm text-gray-400">None</span>
                    }
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditUser(userData)}
                      >
                        Edit
                      </Button>
                      {userData.id !== user.uid && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteUser(userData.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={userForm.name}
            onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name"
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manager
            </label>
            <select
              value={userForm.managerId || ''}
              onChange={(e) => setUserForm(prev => ({ ...prev, managerId: e.target.value || null }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">No Manager</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.role})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowUserModal(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUserManagement;
