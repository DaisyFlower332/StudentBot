import type { ReactNode } from "react";

type GameShellProps = {
  title: string;
  onExit: () => void;
  headline?: string;
  children: ReactNode;
};

export function GameShell({ title, onExit, headline, children }: GameShellProps) {
  return (
    <div className="game-shell">
      <header className="game-shell-header">
        <button type="button" className="btn btn-ghost game-back" onClick={onExit}>
          <span aria-hidden>&larr;</span> Back to games
        </button>
        <div className="game-shell-title">
          <h2>{title}</h2>
          {headline && <p>{headline}</p>}
        </div>
        <span className="game-shell-spacer" aria-hidden />
      </header>
      <div className="game-shell-body">{children}</div>
    </div>
  );
}

type InstructionsProps = {
  title: string;
  bullets: string[];
  onStart: () => void;
  startLabel?: string;
};

export function Instructions({ title, bullets, onStart, startLabel = "Start" }: InstructionsProps) {
  return (
    <div className="game-instructions">
      <h3>{title}</h3>
      <ul>
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <button type="button" className="btn btn-primary" onClick={onStart}>
        {startLabel}
      </button>
    </div>
  );
}
