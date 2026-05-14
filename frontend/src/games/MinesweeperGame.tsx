import { useState } from "react";
import { GameShell, Instructions } from "./GameShell";
import { playGameSound } from "./gameSounds";

type Phase = "instructions" | "setup" | "playing" | "result";
type CellState = "hidden" | "revealed" | "flagged";
type Difficulty = "easy" | "medium" | "hard";

interface Cell {
  hasMine: boolean;
  state: CellState;
  adjacentMines: number;
}

const DIFFICULTIES: { id: Difficulty; label: string; rows: number; cols: number; mines: number; emoji: string }[] = [
  { id: "easy", label: "Easy", rows: 8, cols: 8, mines: 10, emoji: "😊" },
  { id: "medium", label: "Medium", rows: 10, cols: 10, mines: 20, emoji: "😎" },
  { id: "hard", label: "Hard", rows: 12, cols: 12, mines: 35, emoji: "🤯" },
];

function createBoard(rows: number, cols: number, mines: number, safeR: number, safeC: number): Cell[][] {
  const board: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ hasMine: false, state: "hidden" as CellState, adjacentMines: 0 }))
  );

  // Place mines avoiding the first click
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (board[r][c].hasMine) continue;
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    board[r][c].hasMine = true;
    placed++;
  }

  // Calculate adjacent mines
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].hasMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].hasMine) count++;
        }
      }
      board[r][c].adjacentMines = count;
    }
  }

  return board;
}

function revealCell(board: Cell[][], r: number, c: number): Cell[][] {
  const rows = board.length, cols = board[0].length;
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));

  const queue: [number, number][] = [[r, c]];
  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    if (newBoard[cr][cc].state !== "hidden") continue;
    newBoard[cr][cc].state = "revealed";
    if (newBoard[cr][cc].adjacentMines === 0 && !newBoard[cr][cc].hasMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          queue.push([cr + dr, cc + dc]);
        }
      }
    }
  }

  return newBoard;
}

const NUMBER_COLORS = ["", "#1976d2", "#388e3c", "#d32f2f", "#7b1fa2", "#ff8f00", "#0097a7", "#424242", "#bdbdbd"];

export function MinesweeperGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<Cell[][]>([]);
  const [firstClick, setFirstClick] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const diff = DIFFICULTIES.find(d => d.id === difficulty)!;

  function startGame(d: Difficulty) {
    setDifficulty(d);
    const diff = DIFFICULTIES.find(x => x.id === d)!;
    setBoard(Array.from({ length: diff.rows }, () =>
      Array.from({ length: diff.cols }, () => ({ hasMine: false, state: "hidden" as CellState, adjacentMines: 0 }))
    ));
    setFirstClick(true);
    setGameOver(false);
    setWon(false);
    setFlagMode(false);
    setTimer(0);
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
    setPhase("playing");
  }

  function handleClick(r: number, c: number) {
    if (gameOver || won) return;
    if (board[r][c].state === "revealed") return;

    if (flagMode) {
      handleRightClick(r, c);
      return;
    }

    if (board[r][c].state === "flagged") return;

    let currentBoard = board;

    if (firstClick) {
      currentBoard = createBoard(diff.rows, diff.cols, diff.mines, r, c);
      setFirstClick(false);
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      setTimerInterval(interval);
    }

    if (currentBoard[r][c].hasMine) {
      // Game over - reveal all mines
      const revealed = currentBoard.map(row => row.map(cell => ({
        ...cell,
        state: cell.hasMine ? "revealed" as CellState : cell.state,
      })));
      setBoard(revealed);
      setGameOver(true);
      if (timerInterval) clearInterval(timerInterval);
      playGameSound("wrong");
      setPhase("result");
      return;
    }

    const newBoard = revealCell(currentBoard, r, c);
    setBoard(newBoard);

    // Check win
    const hiddenNonMines = newBoard.flat().filter(c => c.state === "hidden" && !c.hasMine).length +
                           newBoard.flat().filter(c => c.state === "flagged" && !c.hasMine).length;
    if (hiddenNonMines === 0) {
      setWon(true);
      if (timerInterval) clearInterval(timerInterval);
      playGameSound("correct");
      setPhase("result");
    }
  }

  function handleRightClick(r: number, c: number) {
    if (gameOver || won) return;
    if (board[r][c].state === "revealed") return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[r][c].state = newBoard[r][c].state === "flagged" ? "hidden" : "flagged";
    setBoard(newBoard);
  }

  const flagCount = board.flat().filter(c => c.state === "flagged").length;
  const minesLeft = diff.mines - flagCount;

  return (
    <GameShell title="Minesweeper" onExit={onExit} headline="Find all safe cells without hitting a mine!">
      {phase === "instructions" && (
        <Instructions
          title="How to play Minesweeper 💣"
          bullets={[
            "Click cells to reveal them – numbers show adjacent mines",
            "Use 🚩 Flag mode (or right-click) to mark suspected mines",
            "Clear all safe cells to win!",
            "If you click a mine... BOOM! 💥 Game over",
            "The number on a cell = how many of its 8 neighbours are mines",
            "Start easy and work up – you've got this! 💪",
          ]}
          onStart={() => setPhase("setup")}
          startLabel="Choose Difficulty"
        />
      )}

      {phase === "setup" && (
        <div className="mine-setup">
          <h3>Pick your difficulty</h3>
          <div className="mine-diff-grid">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                type="button"
                className="mine-diff-card"
                onClick={() => startGame(d.id)}
              >
                <span className="mine-diff-emoji">{d.emoji}</span>
                <strong>{d.label}</strong>
                <span className="mine-diff-info">{d.rows}×{d.cols} • {d.mines} mines</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(phase === "playing" || phase === "result") && (
        <div className="mine-game">
          <div className="mine-toolbar">
            <span className="mine-stat">💣 {minesLeft}</span>
            <button
              type="button"
              className={`mine-flag-toggle${flagMode ? " active" : ""}`}
              onClick={() => setFlagMode(!flagMode)}
            >
              {flagMode ? "🚩 Flag ON" : "👆 Dig"}
            </button>
            <span className="mine-stat">⏱️ {timer}s</span>
            {phase === "result" && (
              <button type="button" className="btn btn-primary mine-replay" onClick={() => setPhase("setup")}>
                Play Again
              </button>
            )}
          </div>

          {phase === "result" && (
            <div className={`mine-result-banner ${won ? "is-win" : "is-lose"}`}>
              {won ? "🎉 You cleared the field! Amazing!" : "💥 BOOM! You hit a mine!"}
            </div>
          )}

          <div
            className="mine-board"
            style={{ gridTemplateColumns: `repeat(${diff.cols}, 1fr)` }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className={`mine-cell ${cell.state}${cell.state === "revealed" && cell.hasMine ? " is-mine" : ""}${cell.state === "revealed" && !cell.hasMine && cell.adjacentMines === 0 ? " is-empty" : ""}`}
                  onClick={() => handleClick(r, c)}
                  onContextMenu={(e) => { e.preventDefault(); handleRightClick(r, c); }}
                  disabled={gameOver && !cell.hasMine}
                >
                  {cell.state === "flagged" && "🚩"}
                  {cell.state === "revealed" && cell.hasMine && "💣"}
                  {cell.state === "revealed" && !cell.hasMine && cell.adjacentMines > 0 && (
                    <span style={{ color: NUMBER_COLORS[cell.adjacentMines] }}>{cell.adjacentMines}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </GameShell>
  );
}
