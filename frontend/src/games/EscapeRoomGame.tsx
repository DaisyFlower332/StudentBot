import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameShell, Instructions } from "./GameShell";

type Phase = "instructions" | "pick-timer" | "playing" | "result";
type TimerKey = "30" | "60" | "90";

const HIGH_SCORE_KEY = "studentbot_escape_highscore_v1";
const TIMER_OPTIONS: { id: TimerKey; label: string; seconds: number }[] = [
  { id: "30", label: "30 seconds", seconds: 30 },
  { id: "60", label: "1 minute", seconds: 60 },
  { id: "90", label: "1 minute 30 seconds", seconds: 90 },
];

type HighScores = Record<TimerKey, number>;

function loadHighScores(): HighScores {
  if (typeof window === "undefined") return { "30": 0, "60": 0, "90": 0 };
  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
    if (!raw) return { "30": 0, "60": 0, "90": 0 };
    const parsed = JSON.parse(raw) as Partial<HighScores>;
    return {
      "30": typeof parsed["30"] === "number" ? parsed["30"] : 0,
      "60": typeof parsed["60"] === "number" ? parsed["60"] : 0,
      "90": typeof parsed["90"] === "number" ? parsed["90"] : 0,
    };
  } catch {
    return { "30": 0, "60": 0, "90": 0 };
  }
}

function saveHighScores(scores: HighScores) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores));
  } catch {
    /* ignore quota errors */
  }
}

type TimesQuestion = { a: number; b: number };

function newQuestion(prev: TimesQuestion | null): TimesQuestion {
  let q: TimesQuestion;
  do {
    q = { a: 1 + Math.floor(Math.random() * 12), b: 1 + Math.floor(Math.random() * 12) };
  } while (prev && q.a === prev.a && q.b === prev.b);
  return q;
}

function formatTime(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r === 0 ? `${m}m` : `${m}m ${r}s`;
}

export function EscapeRoomGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [timerKey, setTimerKey] = useState<TimerKey>("60");
  const [highScores, setHighScores] = useState<HighScores>(() => loadHighScores());
  const [question, setQuestion] = useState<TimesQuestion>({ a: 2, b: 3 });
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const flashRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentTimerMeta = useMemo(
    () => TIMER_OPTIONS.find((t) => t.id === timerKey) ?? TIMER_OPTIONS[1],
    [timerKey]
  );

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopInterval(), [stopInterval]);
  useEffect(() => () => {
    if (flashRef.current !== null) window.clearTimeout(flashRef.current);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      stopInterval();
      finishRound();
    }
  }, [phase, timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === "playing") inputRef.current?.focus();
  }, [phase, question]);

  function finishRound() {
    const prev = highScores[timerKey];
    if (score > prev) {
      const updated = { ...highScores, [timerKey]: score };
      setHighScores(updated);
      saveHighScores(updated);
      setNewRecord(true);
    } else {
      setNewRecord(false);
    }
    setPhase("result");
  }

  function startGame(key: TimerKey) {
    stopInterval();
    const meta = TIMER_OPTIONS.find((t) => t.id === key) ?? TIMER_OPTIONS[1];
    setTimerKey(key);
    setQuestion(newQuestion(null));
    setAnswer("");
    setScore(0);
    setAttempted(0);
    setTimeLeft(meta.seconds);
    setFlash(null);
    setNewRecord(false);
    setPhase("playing");
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
  }

  function flashState(state: "correct" | "wrong") {
    setFlash(state);
    if (flashRef.current !== null) window.clearTimeout(flashRef.current);
    flashRef.current = window.setTimeout(() => setFlash(null), 350);
  }

  function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== "playing") return;
    const trimmed = answer.trim();
    if (!trimmed) return;
    const guess = Number(trimmed);
    const target = question.a * question.b;
    setAttempted((n) => n + 1);
    if (Number.isFinite(guess) && guess === target) {
      setScore((n) => n + 1);
      flashState("correct");
    } else {
      flashState("wrong");
    }
    setQuestion((q) => newQuestion(q));
    setAnswer("");
  }

  return (
    <GameShell title="Escape Room" onExit={onExit}>
      {phase === "instructions" && (
        <Instructions
          title="How to play Escape Room"
          bullets={[
            "Solve as many times-table questions as you can before time runs out.",
            "Numbers go up to 12 \u00d7 12 - type your answer and press Enter.",
            "You'll choose your timer next: 30 seconds, 1 minute, or 1 minute 30 seconds.",
            "Beat your high score for each timer to crack the code!",
          ]}
          onStart={() => setPhase("pick-timer")}
          startLabel="Pick a timer"
        />
      )}

      {phase === "pick-timer" && (
        <div className="escape-pick">
          <h3>Choose your timer</h3>
          <p>Each timer keeps its own high score.</p>
          <div className="escape-timer-grid">
            {TIMER_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="escape-timer-card"
                onClick={() => startGame(t.id)}
              >
                <h4>{t.label}</h4>
                <p>High score: <strong>{highScores[t.id]}</strong></p>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="escape-board">
          <div className="escape-topbar">
            <div className="escape-stat">
              <span className="escape-stat-label">High score</span>
              <span className="escape-stat-value">{highScores[timerKey]}</span>
            </div>
            <div className="escape-stat is-score">
              <span className="escape-stat-label">Score</span>
              <span className="escape-stat-value">{score}</span>
            </div>
            <div className={`escape-timer${timeLeft <= 5 ? " is-low" : ""}`}>
              <span className="escape-timer-num">{timeLeft}</span>
              <span className="escape-timer-label">sec</span>
            </div>
          </div>

          <form className={`escape-question${flash ? ` is-${flash}` : ""}`} onSubmit={submitAnswer}>
            <div className="escape-equation">
              <span>{question.a}</span>
              <span className="escape-times" aria-hidden>&times;</span>
              <span>{question.b}</span>
              <span className="escape-equals" aria-hidden>=</span>
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="?"
                aria-label="Your answer"
                className="escape-input"
              />
            </div>
            <button type="submit" className="btn btn-primary escape-submit" disabled={!answer.trim()}>
              Submit
            </button>
          </form>

          <p className="escape-hint">Solved {score} correct out of {attempted} attempted.</p>
        </div>
      )}

      {phase === "result" && (
        <div className="game-result">
          <h3>Time's up! You scored {score}</h3>
          <p>Timer: <strong>{currentTimerMeta.label}</strong> ({formatTime(currentTimerMeta.seconds)})</p>
          {newRecord ? (
            <p className="result-positive">New high score for this timer!</p>
          ) : (
            <p>High score for this timer: <strong>{highScores[timerKey]}</strong></p>
          )}
          <div className="game-result-actions">
            <button type="button" className="btn btn-primary" onClick={() => startGame(timerKey)}>
              Play again
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setPhase("pick-timer")}>
              Change timer
            </button>
            <button type="button" className="btn btn-ghost" onClick={onExit}>
              Back to games
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
}
