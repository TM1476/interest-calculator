import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Import your main component (App.jsx)

// 1. Get the container element where the app will be rendered.
// This ID ('root') matches the <div> in public/index.html.
const container = document.getElementById('root');
const root = createRoot(container);

// 2. Render your main App component inside the root container.
root.render(
  // React.StrictMode helps find potential problems in the application.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
