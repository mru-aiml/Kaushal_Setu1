import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import App from './App';
import './index.css';
import { CLERK_KEY } from './auth/clerk';

const root = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  CLERK_KEY ? (
    <ClerkProvider publishableKey={CLERK_KEY} afterSignOutUrl="/login">
      {root}
    </ClerkProvider>
  ) : (
    root
  )
);
