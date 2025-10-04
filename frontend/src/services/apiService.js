import axios from 'axios';

// Create an Axios instance
const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the JWT token to every request
apiService.interceptors.request.use(
  (config) => {
    // Frontend stores token either as `token` or inside `user` object depending on login flow
    const tokenDirect = localStorage.getItem('token');
    let token = tokenDirect || null;

    if (!token) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) token = user.token;
      } catch (e) {
        // ignore parse errors
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle token expiration (401 errors)
apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout if token is expired
      localStorage.removeItem('user');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

// Define your API calls here
export const loginUser = (credentials) => apiService.post('/auth/login', credentials);
export const getProfile = () => apiService.get('/auth/profile');
export const getMyExpenses = () => apiService.get('/expenses');
// ... add all your other API calls here

export default apiService;