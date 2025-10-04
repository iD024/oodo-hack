import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Page components
import SidebarNav from './components/SidebarNav';
import LoadingSpinner from './components/LoadingSpinner';
import RoleSwitcher from './components/RoleSwitcher';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ExpenseSubmission from './pages/ExpenseSubmission';
import ExpenseHistory from './pages/ExpenseHistory';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminApprovalRules from './pages/AdminApprovalRules';
import AdminGlobalExpenses from './pages/AdminGlobalExpenses';

// Protected Route Component
const ProtectedRoute = ({ children, user, userRole }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main App Component
const AppContent = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [error, setError] = useState(null);

  // Function to switch roles for demo purposes
  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    setCurrentPage('home');
  };

  useEffect(() => {
    // User log in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setUserRole(data.user.role);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const renderCurrentPage = () => {
    if (!user || !userRole) return null;

    switch (currentPage) {
      case 'home':
        return <HomePage user={user} userRole={userRole} onPageChange={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'dashboard':
        if (userRole === 'employee') {
          return <EmployeeDashboard user={user} />;
        } else if (userRole === 'manager') {
          return <ManagerDashboard user={user} />;
        } else if (userRole === 'admin') {
          return <AdminUserManagement user={user} />;
        }
        break;
      case 'submit-expense':
        return <ExpenseSubmission user={user} />;
      case 'expense-history':
        return <ExpenseHistory user={user} />;
      case 'approval-queue':
        return <ManagerDashboard user={user} />;
      case 'user-management':
        return <AdminUserManagement user={user} />;
      case 'approval-rules':
        return <AdminApprovalRules user={user} />;
      case 'global-expenses':
        return <AdminGlobalExpenses user={user} />;
      default:
        return <HomePage user={user} userRole={userRole} onPageChange={setCurrentPage} />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserRole(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user || !userRole) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage setUser={setUser} setUserRole={setUserRole} />} />
        <Route path="/register" element={<RegisterPage setUser={setUser} setUserRole={setUserRole} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <SidebarNav 
          userRole={userRole} 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-6">
          <RoleSwitcher 
            currentRole={userRole} 
            onRoleChange={handleRoleChange}
          />
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;