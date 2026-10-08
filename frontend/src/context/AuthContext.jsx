import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false); // Can be used for initial auth check

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // In a real app we might fetch user profile here if not saved in local storage.
      // For this demo, user details are usually returned on login/register and saved.
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.requireVerification) {
      return res.data; // Return early, don't log in yet
    }
    setToken(res.data.token);
    setUser(res.data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.requireVerification) {
      return res.data; // Return early, don't log in yet
    }
    setToken(res.data.token);
    setUser(res.data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
