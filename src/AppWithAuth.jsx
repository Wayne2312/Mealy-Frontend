import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

const AuthProvider = React.lazy(() => import('./AuthProvider'));
const App = React.lazy(() => import('./App'));
const CheckoutPage = React.lazy(() => import('./CheckoutPage')); 

const AppWithAuth = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
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

export default AppWithAuth