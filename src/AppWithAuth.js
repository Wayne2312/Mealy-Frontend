import React, { Suspense } from 'react';
import CheckoutPage from './pages/CheckoutPage';


const AuthProvider = React.lazy(() => import('./AuthProvider'));
const App = React.lazy(() => import('./App'));

const AppWithAuth = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AuthProvider>
    <Route path="/checkout/:orderId" element={<CheckoutPage />} />
      <App />
    </AuthProvider>
  </Suspense>
);

export default AppWithAuth;
