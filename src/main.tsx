import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css';

// CRITICAL: Preserve OAuth hash before BrowserRouter clears it
// BrowserRouter removes the hash from URL, but Supabase needs it to process OAuth callback
if (window.location.hash && window.location.hash.includes('access_token')) {
  sessionStorage.setItem('supabase.auth.hash', window.location.hash);
}

// Disabled StrictMode to prevent double execution of useEffect during OAuth flow
// StrictMode causes the OAuth callback to run twice, interrupting the session setup
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
);
