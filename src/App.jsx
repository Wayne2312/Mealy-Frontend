// src/App.jsx (Main App Component)
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import Header from './Header';
import LoginForm from './LoginForm';
import CustomerDashboard from './CustomerDashboard';
import AdminDashboard from './AdminDashboard';
import Home from './Home';
import AppWithAuth from './AppWithAuth';
import './App.css';

const AppContent = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/dashboard/*" element={<AppWithAuth />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AppContent;