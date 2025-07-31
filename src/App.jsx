import React from 'react';
import { useAuth } from './AuthProvider';
import Header from './Header';
import Home from './Home';
import CustomerDashboard from './CustomerDashboard';
import AdminDashboard from './AdminDashboard';
import './App.css';

const App = () => {
  const { user, loading } = useAuth();

  console.log('App rendering, user:', user);

  if (loading) {
    return <div>Loading...</div>;
  }

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