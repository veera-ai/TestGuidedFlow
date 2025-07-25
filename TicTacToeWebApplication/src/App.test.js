import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe title and status', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
  expect(screen.getByText(/Next player: X/i)).toBeInTheDocument();
});

test('clicking a cell updates board and status', () => {
  render(<App />);
  const cells = screen.getAllByRole('button', { name: /Row/i });
  expect(cells[0]).toBeInTheDocument();
  fireEvent.click(cells[0]);
  expect(cells[0]).toHaveTextContent('X');
  // Now O's turn
  expect(screen.getByText(/Next player: O/i)).toBeInTheDocument();
});

test('Board disables input on win', () => {
  render(<App />);
  const cells = screen.getAllByRole('button', { name: /Row/i });
  // X makes (0, 1, 2); O does two others
  fireEvent.click(cells[0]); // X
  fireEvent.click(cells[3]); // O
  fireEvent.click(cells[1]); // X
  fireEvent.click(cells[4]); // O
  fireEvent.click(cells[2]); // X (win)
  expect(screen.getByText(/Winner: X/i)).toBeInTheDocument();
  expect(cells[3]).toBeDisabled();
});

test('shows draw message and allows reset', () => {
  render(<App />);
  const cells = screen.getAllByRole('button', { name: /Row/i });
  // Fill board to draw: X,O,X,O,X,O,O,X,O
  const moves = [0,1,2,3,5,4,6,8,7];
  moves.forEach((idx, turn) => {
    fireEvent.click(cells[idx]);
  });
  expect(screen.getByText(/draw/i)).toBeInTheDocument();
  const resetBtn = screen.getByRole('button', { name: /reset/i });
  fireEvent.click(resetBtn);
  expect(screen.getByText(/Next player: X/i)).toBeInTheDocument();
});
