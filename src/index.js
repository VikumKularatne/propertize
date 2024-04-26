import React from 'react';
import ReactDOM from 'react-dom/client'; // Importing ReactDOM from react-dom package
import './index.css'; // Importing styles from index.css file
import App from './App'; // Importing the App component
import reportWebVitals from './reportWebVitals'; // Importing the reportWebVitals function

 // Creating a root for ReactDOM rendering
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode> {/* Wrapping the App component with React.StrictMode for development mode */}
    <App /> {/* Rendering the App component */}
  </React.StrictMode>
);

// Calling the reportWebVitals function to measure web vitals
reportWebVitals();
