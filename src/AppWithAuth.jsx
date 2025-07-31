import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import './App.css'

const AuthProvider = React.lazy(() => import('./AuthProvider'));
const App = React.lazy(() => import('./App'));
const Home = React.lazy(() => import('./Home'));
const CheckoutPage = React.lazy(() => import('./CheckoutPage')); 

const AppWithAuth = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard/*" element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route 
            path="/checkout/:orderId" 
            element={
              <React.Suspense fallback={<div>Loading payment...</div>}>
                <CheckoutPage />
              </React.Suspense>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </Suspense>
);
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AppWithAuth;