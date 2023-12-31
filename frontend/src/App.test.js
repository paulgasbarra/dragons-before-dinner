import { render, screen } from '@testing-library/react';
import App from './App';

test('renders title of game', () => {
  render(<App />);
  const linkElement = screen.getByText(/dragons before dinner/i);
  expect(linkElement).toBeInTheDocument();
});
