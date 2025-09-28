import { useCallback, useEffect, useState } from 'react';
import {
  addNewCell,
  findMaxInMap,
  initializeMap,
  moveMapIn2048Rule,
  userLoses,
} from './map';
import type { Cell, Direction, Map2048 } from './map';
import './App.css';

type GameState = 'start' | 'continue' | 'play' | 'lose' | 'win';
type GameInfo = {
  grid: Map2048;
  score: number;
};

const WIN_THRESHOLD = 128;

const App = () => {
  const [state, setState] = useState<GameState>(() => {
    const savedState = localStorage.getItem('2048-game-state');
    return savedState ? 'continue' : 'start';
  });
  const [grid, setGrid] = useState(() => {
    const savedState = localStorage.getItem('2048-game-state');
    return savedState ? JSON.parse(savedState).grid : initializeMap();
  });
  const [score, setScore] = useState(() => {
    const savedState = localStorage.getItem('2048-game-state');
    return savedState ? JSON.parse(savedState).score : 0;
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (state !== 'play') {
        setState('play');
      }

      const dir = keyToDirection(e.key);
      if (!dir) return;

      e.preventDefault();

      const moveResult = moveMapIn2048Rule(grid, dir);

      if (moveResult.isMoved) {
        const newGrid = addNewCell(moveResult.result);
        setGrid(newGrid);
        setScore(score + moveResult.score);

        if (findMaxInMap(newGrid) >= WIN_THRESHOLD) {
          setState('win');
        } else if (userLoses(newGrid)) {
          setState('lose');
        }
      }
    },
    [grid, state, score]
  );

  function resetGame() {
    setState('start');
    setScore(0);
    setGrid(initializeMap());
  }

  function keyToDirection(key: string): Direction | null {
    switch (key) {
      case 'ArrowUp':
        return 'up';
      case 'ArrowLeft':
        return 'left';
      case 'ArrowRight':
        return 'right';
      case 'ArrowDown':
        return 'down';
      default:
        return null;
    }
  }

  function renderTiles(grid: Map2048) {
    const arr = [];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const thisCell = grid[i][j];
        if (thisCell) {
          const {state, value} = thisCell;
          const tileState = (state === "normal") ? "" : `tile-${state}`;
          arr.push(
            <div
              className={`tile tile-${value} tile-position-${j + 1}-${i + 1} ${tileState}`}
            >
              <div className="tile-inner">{value}</div>
            </div>
          );
        }
      }
    }

    return arr;
  }

  function displayMessage() {
    switch (state) {
      case 'win':
        return (
          <div className="game-message game-over">
            <p>You win!</p>
            <div className="lower">
              <a className="retry-button" onClick={resetGame}>
                Try again
              </a>
            </div>
          </div>
        );
      case 'lose':
        return (
          <div className="game-message game-over">
            <p>Game over!</p>
            <div className="lower">
              <a className="retry-button" onClick={resetGame}>
                Try again
              </a>
            </div>
          </div>
        );
      default:
        return;
    }
  }

  useEffect(() => {
    if (state === 'start' || state === 'continue') {
      setState('play');
    }
  }, [state]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (state === 'play') {
      const gameInfo: GameInfo = {
        grid: grid.map(
          (row: Cell[]) => {
            return row.map((cell: Cell) => {
              if (cell) {
                return {state: "new", value: cell.value};
              } else {
                return null;
              }
            }
          )
        }),
        score: score
      };
      localStorage.setItem('2048-game-state', JSON.stringify(gameInfo));
    }
  }, [grid, score, state]);

  return (
    <div className="App">
      <header className="mainHeaderwrp fullwidth float-left">
        <div className="main-container">
          <div className="gameTitle">
            <center>
              <h1>128 Game</h1>
            </center>
          </div>
        </div>
      </header>
      <div className="gameouter">
        <div className="container">
          <div className="heading">
            <div className="newgame-score-block">
              <div className="score-block">
                <div className="score-container">{score}</div>
              </div>
              {/* <div className="restart-game-btn-block">
                <a className="restart-button">New Game</a>
              </div> */}
            </div>
          </div>
          <div className="heading">
            <div style={{ textAlign: 'center' }}>
              <p></p>
            </div>
            <div className="">
              <div className="above-game" style={{ float: 'left' }}></div>
              <div style={{ float: 'right' }}></div>
              <div style={{ clear: 'both' }}></div>
            </div>
          </div>
          <div className="game-container">
            <div className="game-message">
              <p></p>
              <div className="lower">
                <a className="keep-playing-button">Keep going</a>
                <a className="retry-button">Try again</a>
              </div>
            </div>
            {displayMessage()}
            <div className="grid-container">
              <div className="grid-row">
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
              </div>
              <div className="grid-row">
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
              </div>
              <div className="grid-row">
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
              </div>
              <div className="grid-row">
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
              </div>
            </div>
            <div className="tile-container">{renderTiles(grid)}</div>
          </div>
          <p className="game-explanation">
            <strong className="important">
              HOW TO PLAY: Use your arrow keys to move the tiles.
              When two tiles with the same number touch, they merge into one.
              <span className="">
                {' '}
                Once you get 128 in any square, you win.
              </span>
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
