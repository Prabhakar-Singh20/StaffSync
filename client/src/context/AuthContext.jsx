import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

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

      // Set synchronous header and localStorage before setting state
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      localStorage.setItem('staffsync_user', JSON.stringify(userData));
      localStorage.setItem('staffsync_token', userToken);

      setUser(userData);
      setToken(userToken);
      return { success: true, user: userData };
    } catch (err) {
      let message = 'Login failed. Please check your credentials.';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        message = 'Cannot connect to backend server. Please make sure the backend is running on port 5000.';
      }
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

      // Set synchronous header and localStorage before setting state
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      localStorage.setItem('staffsync_user', JSON.stringify(userData));
      localStorage.setItem('staffsync_token', userToken);

      setUser(userData);
      setToken(userToken);
      return { success: true, user: userData };
    } catch (err) {
      let message = 'Registration failed. Please check form fields.';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        message = 'Cannot connect to backend server. Please make sure the backend server is running on port 5000 (cd server && npm start).';
      }
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
