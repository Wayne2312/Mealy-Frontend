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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);


    const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login/`, { email, password });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      const authHeader = `Bearer ${access_token}`;
      const userResponse = await axios.get(`${API}/auth/me/`, {
        headers: {
          'Authorization': authHeader
        }
      });
      setUser(userResponse.data);
      if (userResponse.data.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }
      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
      try {
        const response = await axios.get(`${API}/auth/me/`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error.response?.status, error.response?.data);
        logout();
      }
    };

  const register = async (email, password, name, role = 'customer') => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register/`, { 
        email, password, name, role
      });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      if (userData.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }
      
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
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