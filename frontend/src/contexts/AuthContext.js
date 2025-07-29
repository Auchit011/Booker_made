import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    console.log('Setting auth token:', token ? 'Token exists' : 'No token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Headers after setting:', api.defaults.headers.common);
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null); // Clear user state when token is removed
      console.log('Token removed from headers');
    }
  };

  // Load user on initial render or when token changes
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (token) {
          console.log('LoadUser - Token exists:', token.substring(0, 10) + '...');
          // Try health check first
          try {
            await api.get('/health');
            console.log('Health check passed');
          } catch (err) {
            console.log('Health check failed:', err.message);
          }
          const res = await api.get('/auth/user');
          console.log('User data received:', res.data);
          setUser(res.data);
        }
      } catch (err) {
        console.error('Error loading user:', err.message);
        console.log('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.config?.headers
        });
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register new user
  const register = async (formData) => {
    try {
      setError(null);
      const res = await api.post('/auth/register', formData);
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      // Redirect to dashboard after registration
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      setError(null);
      console.log('Login attempt with:', { ...formData, password: '***' });
      const res = await api.post('/auth/login', formData);
      console.log('Login response:', { token: res.data.token ? 'exists' : 'missing', user: res.data.user });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage');
      setToken(token);
      setUser(user);
      
      // Redirect to dashboard after login
      navigate(`/${user.role}/dashboard`);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
        isServiceProvider: user && (user.userType === 'driver' || user.userType === 'maid'),
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
