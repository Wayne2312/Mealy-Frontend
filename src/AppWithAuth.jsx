import React, { Suspense } from 'react';

// Must default export a valid component
const AuthProvider = React.lazy(() => import('./AuthProvider'));
const App = React.lazy(() => import('./App'));

const AppWithAuth = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Suspense>
);

export default AppWithAuth;
