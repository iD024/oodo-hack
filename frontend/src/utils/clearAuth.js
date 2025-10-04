// Utility to completely clear authentication state
// Use this in browser console: clearAuth()

const clearAuth = () => {
  // Clear all localStorage items related to authentication
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear any sessionStorage as well
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  
  // Clear cookies if any (optional)
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  console.log('All authentication data cleared');
  console.log('Please refresh the page and login again');
  
  // Optionally refresh the page
  // window.location.reload();
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.clearAuth = clearAuth;
}

export default clearAuth;