import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Helper function to calculate the game winner
// Returns "X" or "O" for a win, "draw" for draw, or null for in progress
function calculateWinner(squares) {
  const lines = [
    // Rows
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    // Columns
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    // Diagonals
    [0, 4, 8], [2, 4, 6]
  ];
  for (let [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a]; // "X" or "O"
    }
  }
  if (squares.every(Boolean)) {
    return 'draw';
  }
  return null;
}

// Focusable cell for accessibility; auto-focus winner cell
function BoardCell({ value, onClick, disabled, highlight, ariaLabel, tabIndex, onKeyDown, 'aria-current': ariaCurrent }) {
  return (
    <button
      className={`ttt-cell${highlight ? ' ttt-cell-highlight' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      aria-current={ariaCurrent}
      onKeyDown={onKeyDown}
      type="button"
    >
      <span aria-live="polite">{value}</span>
    </button>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState('');
  const [winnerLine, setWinnerLine] = useState([]);
  // For accessible keyboard navigation
  const boardRef = useRef([]);
  
  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  // Update game status message & winner line
  useEffect(() => {
    const winner = calculateWinner(squares);
    if (winner === 'X' || winner === 'O') {
      setStatus(`Winner: ${winner}`);
      // Find the winning line for highlight/focus
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      for (let line of lines) {
        const [a, b, c] = line;
        if (
          squares[a] &&
          squares[a] === squares[b] &&
          squares[a] === squares[c]
        ) {
          setWinnerLine(line);
          // Focus first winning cell (accessibility)
          setTimeout(() => {
            if (boardRef.current[a]) boardRef.current[a].focus();
          }, 100);
          break;
        }
      }
    } else if (winner === 'draw') {
      setStatus("It's a draw!");
      setWinnerLine([]);
    } else {
      setStatus(`Next player: ${xIsNext ? 'X' : 'O'}`);
      setWinnerLine([]);
    }
  }, [squares, xIsNext]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  const handleClick = idx => {
    if (calculateWinner(squares) || squares[idx]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  // Keyboard navigation for cells: arrows move, space/enter selects
  const handleCellKeyDown = (event, idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    let targetIdx = idx;
    switch (event.key) {
      case 'ArrowRight':
        targetIdx = col < 2 ? idx + 1 : idx - 2;
        break;
      case 'ArrowLeft':
        targetIdx = col > 0 ? idx - 1 : idx + 2;
        break;
      case 'ArrowDown':
        targetIdx = row < 2 ? idx + 3 : idx - 6;
        break;
      case 'ArrowUp':
        targetIdx = row > 0 ? idx - 3 : idx + 6;
        break;
      case ' ':
      case 'Enter':
        handleClick(idx);
        return;
      default:
        return;
    }
    event.preventDefault();
    if (boardRef.current[targetIdx]) {
      boardRef.current[targetIdx].focus();
    }
  };

  // PUBLIC_INTERFACE
  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setStatus('Next player: X');
    setWinnerLine([]);
    setTimeout(() => {
      if (boardRef.current[0]) boardRef.current[0].focus();
    }, 100);
  };

  // Render game board
  function renderBoard() {
    return (
      <div
        className="ttt-board"
        role="grid"
        aria-label="Tic Tac Toe game board"
        aria-describedby="gameStatus"
      >
        {Array(3).fill(null).map((_, row) => (
          <div
            className="ttt-row"
            key={row}
            role="row"
          >
            {Array(3).fill(null).map((_, col) => {
              const idx = row * 3 + col;
              return (
                <BoardCell
                  key={idx}
                  value={squares[idx]}
                  onClick={() => handleClick(idx)}
                  disabled={!!squares[idx] || !!calculateWinner(squares)}
                  highlight={winnerLine.includes(idx)}
                  ariaLabel={`Row ${row + 1} Column ${col + 1}${squares[idx] ? `, ${squares[idx]}` : ''}`}
                  tabIndex={idx === 0 ? 0 : -1} // tab to first cell, arrow moves rest
                  aria-current={winnerLine.includes(idx) ? 'true' : undefined}
                  onKeyDown={(event) => handleCellKeyDown(event, idx)}
                  ref={el => boardRef.current[idx] = el}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Accessible status region
  function renderStatus() {
    return (
      <div
        id="gameStatus"
        className="ttt-status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status}
      </div>
    );
  }

  // Render accessibility instructions
  function renderInstructions() {
    return (
      <div className="ttt-accessibility" id="instructions">
        <small>
          <span className="visually-hidden">
            Use Tab to select the board, then arrow keys to move; Space or Enter to mark. Reset game anytime with the Reset button.
          </span>
        </small>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header" style={{paddingTop: 0}}>
        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <h1 className="ttt-title" tabIndex="0">Tic Tac Toe</h1>
        {renderInstructions()}
        {renderStatus()}
        {renderBoard()}
        {/* Control buttons */}
        <div className="ttt-controls">
          <button
            className="ttt-btn-reset"
            onClick={handleReset}
            aria-label="Restart the game"
          >
            Reset Game
          </button>
        </div>
      </header>
    </div>
  );
}

// For BoardCell: expose ref forwarding for keyboard focus
const BoardCellForward = React.forwardRef((props, ref) => (
  <BoardCell {...props} innerRef={ref} />
));
BoardCellForward.displayName = 'BoardCellForward';

export default App;
