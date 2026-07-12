// AuthContext.jsx - Authentication and user session state
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('transitops_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Listen for global logout events triggered by interceptor token failure
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('auth_logout', handleLogoutEvent);
    
    // Check if token exists to finalize startup check
    const token = localStorage.getItem('transitops_access_token');
    if (token && !user) {
      // Simulate validation request
      const savedUser = localStorage.getItem('transitops_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);

    return () => {
      window.removeEventListener('auth_logout', handleLogoutEvent);
    };
  }, [user]);

  const login = async (email, password, rememberMe) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken, refreshToken } = response.data;

      setUser(userData);
      
      const storage = rememberMe ? localStorage : sessionStorage;
      // We also store JWT in localStorage to let mock adapter access it easily
      localStorage.setItem('transitops_access_token', accessToken);
      localStorage.setItem('transitops_refresh_token', refreshToken);
      localStorage.setItem('transitops_user', JSON.stringify(userData));

      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('transitops_access_token');
    localStorage.removeItem('transitops_refresh_token');
    localStorage.removeItem('transitops_user');
    sessionStorage.removeItem('transitops_access_token');
    sessionStorage.removeItem('transitops_refresh_token');
    sessionStorage.removeItem('transitops_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
