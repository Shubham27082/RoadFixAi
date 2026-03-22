import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('roadfix_user');
    const savedToken = localStorage.getItem('roadfix_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('roadfix_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const login = async (email, password, userType) => {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, userType })
      });

      if (response.success) {
        const { token, user: userData } = response.data;
        
        // Store token and user data
        localStorage.setItem('roadfix_token', token);
        localStorage.setItem('roadfix_user', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true, user: userData };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.success) {
        return { 
          success: true, 
          message: response.message,
          requiresVerification: true,
          email: userData.email
        };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const verifyEmail = async (email, verificationCode) => {
    try {
      const response = await apiCall('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, verificationCode })
      });

      if (response.success) {
        // DO NOT automatically log in the user
        // Just return success with verification data
        return { 
          success: true, 
          message: response.message,
          data: response.data,
          requiresLogin: response.data.requiresLogin
        };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Email verification failed. Please try again.' 
      };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await apiCall('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      return { 
        success: response.success, 
        message: response.message || (response.success ? 'Verification code sent!' : 'Failed to send code')
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to resend verification code.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('roadfix_user');
    localStorage.removeItem('roadfix_token');
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      return { 
        success: response.success, 
        message: response.message || (response.success ? 'Reset link sent!' : 'Failed to send reset link')
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to send reset link.' 
      };
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    try {
      const response = await apiCall('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password, confirmPassword })
      });

      return { 
        success: response.success, 
        message: response.message || (response.success ? 'Password reset successful!' : 'Password reset failed')
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Password reset failed.' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};