import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Initialize user synchronously from localStorage so page reload does not flicker or redirect
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Failed to parse cached user:', e);
      return null;
    }
  });

  // 2. Set loading state: if we have a token but no user, we are validating; if we have user or no token, don't block
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    return !!token && !stored;
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          const freshUser = response.data.user;
          const normalized = {
            ...freshUser,
            role: freshUser.role || freshUser.txt_Role,
            username: freshUser.username || freshUser.txt_Username,
            userId: freshUser.userId || freshUser.int_User_Id
          };
          setUser(normalized);
          localStorage.setItem('user', JSON.stringify(normalized));
        } catch (error) {
          console.error('Session verification failed on reload:', error.message);
          // Only clear if server returns 401 / token invalid, not network glitch
          if (error.message?.includes('token') || error.message?.includes('expired') || error.message?.includes('Authentication')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    const response = await api.post('/auth/login', { usernameOrEmail, password });
    const { token, user: loggedUser } = response.data;

    const normalized = {
      ...loggedUser,
      role: loggedUser.role || loggedUser.txt_Role,
      username: loggedUser.username || loggedUser.txt_Username,
      userId: loggedUser.userId || loggedUser.int_User_Id
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
