// Debug utility to check authentication state
// Use this in browser console: checkAuth()

const checkAuth = () => {
  console.log('=== Authentication Debug Info ===');
  
  // Check localStorage
  const tokenDirect = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  console.log('Direct token:', tokenDirect);
  console.log('User string:', userString);
  
  if (userString) {
    try {
      const user = JSON.parse(userString);
      console.log('Parsed user:', user);
    } catch (e) {
      console.error('Failed to parse user:', e);
    }
  }
  
  // Check if token is valid JWT
  if (tokenDirect) {
    try {
      const parts = tokenDirect.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('JWT payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000));
        console.log('Token issued:', new Date(payload.iat * 1000));
      }
    } catch (e) {
      console.error('Failed to decode JWT:', e);
    }
  }
  
  console.log('=== End Debug Info ===');
};

// Function to test API call
const testExpensesAPI = async () => {
  try {
    const tokenDirect = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/expenses', {
      headers: {
        'Authorization': `Bearer ${tokenDirect}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);
  } catch (error) {
    console.error('API Error:', error);
  }
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.checkAuth = checkAuth;
  window.testExpensesAPI = testExpensesAPI;
}

export { checkAuth, testExpensesAPI };