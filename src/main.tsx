import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { registerServiceWorker, captureInstallPrompt } from './adapters/pwa';
import { App } from './App';

registerServiceWorker();
captureInstallPrompt();

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode><App /></React.StrictMode>,
);
