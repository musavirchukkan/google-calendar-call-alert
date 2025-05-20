import { createContext, useState, useContext, useEffect } from 'react';
import { verifyAuth, getCurrentUser, logout } from '../services/auth';
import { toast } from 'react-toastify';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResult = await verifyAuth();
        
        if (authResult.success && authResult.data.isAuthenticated) {
          setIsAuthenticated(true);
          
          // Get current user data
          const userResult = await getCurrentUser();
          
          if (userResult.success) {
            setUser(userResult.data.user);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const result = await logout();
      
      if (result.success) {
        setIsAuthenticated(false);
        setUser(null);
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};