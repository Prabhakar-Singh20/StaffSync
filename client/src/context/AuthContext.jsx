import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { handleMockRequest, initMockStore } from '../services/mockEngine';

const AuthContext = createContext();

// Initialize in-browser HRM storage for Vercel/standalone environments
initMockStore();

// Normalize and evaluate configured API base URL
const rawBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.__CONFIG__?.API_BASE_URL) ||
  ''
).trim();

// Determine if we are hosted on a static cloud platform (Vercel, GitHub Pages, Netlify)
const isStaticDeploy =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('vercel.app') ||
   window.location.hostname.includes('github.io') ||
   window.location.hostname.includes('netlify.app'));

// Validate if rawBaseUrl points to a genuine, working external backend:
// Invalid if:
// 1. It is empty or not starting with http
// 2. It points to the static frontend host itself (e.g. staff-sync-silk.vercel.app)
// 3. It points to localhost while deployed on HTTPS (browsers block mixed content)
const isExternalBackendValid = Boolean(
  rawBaseUrl &&
  rawBaseUrl.startsWith('http') &&
  !rawBaseUrl.includes('vercel.app') &&
  !rawBaseUrl.includes('github.io') &&
  !rawBaseUrl.includes('netlify.app') &&
  !(typeof window !== 'undefined' && window.location.protocol === 'https:' && rawBaseUrl.startsWith('http://localhost'))
);

if (isExternalBackendValid) {
  axios.defaults.baseURL = rawBaseUrl.replace(/\/$/, '');
}

// Setup Axios request interceptor:
// 1. Synchronously attaches Bearer token to all requests.
// 2. If running on a static deploy without a verified external cloud backend,
//    routes all /api/* requests directly through the HRM persistence engine.
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staffsync_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (isStaticDeploy && !isExternalBackendValid) {
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

// Safety net response interceptor:
// 1. Catches Vercel SPA rewrites where a missing backend endpoint returns index.html (200 OK HTML)
// 2. Catches 404, 405 (Method Not Allowed), 500, 502, 504, or Network Errors
axios.interceptors.response.use(
  (response) => {
    const isHtmlResponse =
      typeof response.data === 'string' &&
      (response.data.includes('<!doctype html') ||
       response.data.includes('<!DOCTYPE html') ||
       response.data.includes('<html'));

    if (isHtmlResponse && response.config?.url?.includes('/api/')) {
      const mockRes = handleMockRequest(response.config);
      if (mockRes) {
        return {
          data: mockRes.data,
          status: mockRes.status || 200,
          statusText: 'OK',
          headers: {},
          config: response.config,
        };
      }
    }
    return response;
  },
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

    if (isUnreachable && error.config && error.config.url?.includes('/api/')) {
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
    try {
      const saved = localStorage.getItem('staffsync_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      const savedToken = localStorage.getItem('staffsync_token') || null;
      if (savedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }
      return savedToken;
    } catch {
      return null;
    }
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
    try {
      localStorage.removeItem('staffsync_user');
      localStorage.removeItem('staffsync_token');
    } catch {}
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
