// Importing the necessary testing utilities
import { render, screen } from '@testing-library/react'; 
import App from './App'; // Importing the App component

test('renders learn react link', () => {
  // Rendering the App component for testing
  render(<App />); 
  // Finding the element with text "learn react"
  const linkElement = screen.getByText(/learn react/i); 
  // Asserting that the element is in the document
  expect(linkElement).toBeInTheDocument(); 
});
