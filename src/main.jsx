import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initGlobalRequestLimiter } from './utils/globalRequestLimiter'

// Add console log to help with debugging
console.log('Starting application...');

// Initialize the global request limiter
initGlobalRequestLimiter();

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found! Make sure there is a div with id="root" in index.html');
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('Application rendered successfully');
  } catch (error) {
    console.error('Error rendering application:', error);
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1 style="color: red;">Application Error</h1>
        <p>Sorry, there was an error loading the application.</p>
        <pre style="background: #f5f5f5; padding: 10px; text-align: left; overflow: auto;">${error.message}</pre>
        <button onclick="window.location.reload()">Refresh Page</button>
      </div>
    `;
  }
}
