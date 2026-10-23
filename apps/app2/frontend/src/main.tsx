import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { registerAppServiceWorker } from './shared/utils/notifications';
import './index.css';

// Daftarkan Service Worker (dibutuhkan untuk notifikasi & Web Push).
registerAppServiceWorker();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
