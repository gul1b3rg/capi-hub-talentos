import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css';

// CRITICAL: Preserve OAuth hash before BrowserRouter clears it
// BrowserRouter removes the hash from URL, but Supabase needs it to process OAuth callback
if (window.location.hash && window.location.hash.includes('access_token')) {
  // eslint-disable-next-line no-console
  console.log('[main] OAuth hash detected, preserving it in sessionStorage for Supabase');
  sessionStorage.setItem('supabase.auth.hash', window.location.hash);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
