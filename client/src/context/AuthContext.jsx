import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('staffsync_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('staffsync_token') || null;
  });

  const [loading, setLoading] = useState(false);

  // Set default auth headers for axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setUser(res.data);
      setToken(res.data.token);
      localStorage.setItem('staffsync_user', JSON.stringify(res.data));
      localStorage.setItem('staffsync_token', res.data.token);
      return { success: true, user: res.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, department) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role,
        department,
      });
      setUser(res.data);
      setToken(res.data.token);
      localStorage.setItem('staffsync_user', JSON.stringify(res.data));
      localStorage.setItem('staffsync_token', res.data.token);
      return { success: true, user: res.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('staffsync_user');
    localStorage.removeItem('staffsync_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
