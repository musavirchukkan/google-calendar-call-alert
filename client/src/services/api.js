import axios from 'axios';

// Create API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/authentication
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle generic errors
    const errorMessage = 
      error.response?.data?.message || 
      'Network error. Please try again.';
    
    console.error('API Error:', errorMessage);
    
    // Return clean error with message
    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
    });
  }
);

export default api;