import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { handleMockRequest, initMockStore } from '../services/mockEngine';

const AuthContext = createContext();

// Initialize in-browser HRM storage for Vercel/standalone environments
initMockStore();

// Setup Axios request interceptor:
// 1. Synchronously attaches Bearer token to all requests.
// 2. On Vercel (or static hosting without a Node server), uses the in-browser HRM engine adapter directly.
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staffsync_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const isStaticDeploy =
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('vercel.app') ||
       window.location.hostname.includes('github.io') ||
       window.location.hostname.includes('netlify.app'));

    // On Vercel/static deploys without an external backend, route directly to the in-browser HRM engine
    // to completely prevent Vercel's "405 Method Not Allowed" on POST requests
    if (isStaticDeploy && !import.meta.env.VITE_API_BASE_URL) {
      config.adapter = async (cfg) => {
        try {
          const mockRes = handleMockRequest(cfg);
          if (mockRes) {
            return {
              data: mockRes.data,
              status: mockRes.status || 200,
              statusText: 'OK',
              headers: {},
              config: cfg,
            };
          }
          const err = new Error('Not found');
          err.response = { status: 404, data: { message: 'Not found' } };
          throw err;
        } catch (err) {
          throw err;
        }
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Safety net response interceptor: catches 404, 405 (Method Not Allowed), 502, 504, or Network Errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const isUnreachable =
      !error.response ||
      status === 404 ||
      status === 405 ||
      status === 500 ||
      status === 502 ||
      status === 504 ||
      error.code === 'ERR_NETWORK';

    if (isUnreachable && error.config) {
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
