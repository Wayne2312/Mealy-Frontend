import React from 'react';
import { useAuth } from './AuthProvider';
import Header from './Header';
import LoginForm from './LoginForm';
import CustomerDashboard from './CustomerDashboard';
import AdminDashboard from './AdminDashboard';
import Home from './Home'; 
import './index.css';

const App = () => {
  const { user } = useAuth();
  if (!user) {
    return <Home />;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {user.role === 'admin' ? <AdminDashboard /> : <CustomerDashboard />}
    </div>
  );
};

export default App;