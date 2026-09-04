/**
 * TR-Tech Frontend — Application Entry Point
 *
 * This is the React 19 bootstrap file. It mounts the <App /> component
 * into the DOM node with id="root" (defined in index.html).
 *
 * StrictMode is enabled to help surface potential problems in the app
 * during development (e.g. unexpected side effects, deprecated APIs).
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
