import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { runSupabaseDiagnostics } from './lib/supabase';

// Run end-to-end Supabase diagnostics on boot
runSupabaseDiagnostics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
