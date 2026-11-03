import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { handleMockRequest, initMockStore } from '../services/mockEngine';

const AuthContext = createContext();

// Initialize the in-browser HRM database for standalone/Vercel environments
initMockStore();

// Setup Axios request interceptor to always attach token synchronously
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staffsync_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Setup Axios response interceptor: if deployed on Vercel (where no Node backend exists, returning 404 or network error),
// seamlessly fall back to the in-browser HRM engine so registration, login, and all dashboard actions work flawlessly!
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isOfflineOrVercel =
      !error.response ||
      error.response.status === 404 ||
      error.response.status === 504 ||
      error.code === 'ERR_NETWORK';

    if (isOfflineOrVercel && error.config) {
      try {
        const mockRes = handleMockRequest(error.config);
        if (mockRes) {
          return Promise.resolve({
            data: mockRes.data,
            status: mockRes.status || 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
          });
        }
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('staffsync_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('staffsync_token') || null;
    if (savedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    return savedToken;
  });

  const [loading, setLoading] = useState(false);

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
      const userData = res.data;
      const userToken = res.data.token;

      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      localStorage.setItem('staffsync_user', JSON.stringify(userData));
      localStorage.setItem('staffsync_token', userToken);

      setUser(userData);
      setToken(userToken);
      return { success: true, user: userData };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.';
      return { success: false, message };
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
      const userData = res.data;
      const userToken = res.data.token;

      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      localStorage.setItem('staffsync_user', JSON.stringify(userData));
      localStorage.setItem('staffsync_token', userToken);

      setUser(userData);
      setToken(userToken);
      return { success: true, user: userData };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check form fields.';
      return { success: false, message };
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
