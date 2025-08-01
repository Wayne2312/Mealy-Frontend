import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      if (token) {
        setAuthToken(token);
        try {
          const response = await axios.get(`${API}/auth/me/`);
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user during init:", error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setAuthToken(null);
        }
      } else {
        setUser(null);
        setAuthToken(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login/`, { email, password });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      setAuthToken(access_token);

      if (userData.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }

      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setAuthToken(null);
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name, role = 'customer') => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register/`, { email, password, name, role });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      setAuthToken(access_token);

      if (userData.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setAuthToken(null);
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthToken(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
export default AuthProvider;