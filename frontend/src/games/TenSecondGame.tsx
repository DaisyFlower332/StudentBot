import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell, Instructions } from "./GameShell";
import { TEN_SECOND_PROMPTS, type TenSecondPrompt } from "./data";

type Phase = "instructions" | "playing" | "result";

const TIMER_SECONDS = 10;
const TILE_COUNT = 12;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickPrompt(prev: TenSecondPrompt | null): TenSecondPrompt {
  if (TEN_SECOND_PROMPTS.length <= 1) return TEN_SECOND_PROMPTS[0];
  let next = TEN_SECOND_PROMPTS[Math.floor(Math.random() * TEN_SECOND_PROMPTS.length)];
  while (prev && next.question === prev.question) {
    next = TEN_SECOND_PROMPTS[Math.floor(Math.random() * TEN_SECOND_PROMPTS.length)];
  }
  return next;
}

function buildTiles(prompt: TenSecondPrompt): string[] {
  const distractorsNeeded = TILE_COUNT - prompt.correct.length;
  const distractors = shuffle(prompt.distractors).slice(0, distractorsNeeded);
  return shuffle([...prompt.correct, ...distractors]);
}

export function TenSecondGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [prompt, setPrompt] = useState<TenSecondPrompt>(() => TEN_SECOND_PROMPTS[0]);
  const [tiles, setTiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const intervalRef = useRef<number | null>(null);

  const correctSet = useMemo(() => new Set(prompt.correct.map((c) => c.toLowerCase())), [prompt]);

  const correctPickedCount = useMemo(() => {
    let n = 0;
    selected.forEach((s) => {
      if (correctSet.has(s.toLowerCase())) n++;
    });
    return n;
  }, [selected, correctSet]);

  function clearTimer() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  useEffect(() => {
    return () => clearTimer();
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      clearTimer();
      setPhase("result");
    }
  }, [phase, timeLeft]);

  function startGame() {
    clearTimer();
    const next = pickPrompt(phase === "result" ? prompt : null);
    setPrompt(next);
    setTiles(buildTiles(next));
    setSelected(new Set());
    setTimeLeft(TIMER_SECONDS);
    setPhase("playing");
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
  }

  function toggleTile(word: string) {
    if (phase !== "playing") return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  }

  return (
    <GameShell title="10 Second Game" onExit={onExit}>
      {phase === "instructions" && (
        <Instructions
          title="How to play the 10 Second Game"
          bullets={[
            "You'll get a prompt like 'Name 3 verbs'.",
            "You have 10 seconds to tap the 3 correct words on screen.",
            "Some answers are wrong on purpose - choose carefully!",
            "When time runs out we'll show what you picked right.",
          ]}
          onStart={startGame}
        />
      )}

      {(phase === "playing" || phase === "result") && (
        <div className="ten-board">
          <div className="ten-topbar">
            <h3 className="ten-prompt">{prompt.question}</h3>
            <div className={`ten-timer${timeLeft <= 3 && phase === "playing" ? " is-low" : ""}`}>
              <span className="ten-timer-num">{timeLeft}</span>
              <span className="ten-timer-label">sec</span>
            </div>
          </div>

          <div className="ten-grid">
            {tiles.map((word) => {
              const isSelected = selected.has(word);
              const isCorrect = correctSet.has(word.toLowerCase());
              let cls = "ten-tile";
              if (phase === "playing") {
                if (isSelected) cls += " is-selected";
              } else {
                if (isSelected && isCorrect) cls += " is-correct";
                else if (isSelected && !isCorrect) cls += " is-wrong";
                else if (!isSelected && isCorrect) cls += " is-missed";
                else cls += " is-faded";
              }
              return (
                <button
                  key={word}
                  type="button"
                  className={cls}
                  onClick={() => toggleTile(word)}
                  disabled={phase !== "playing"}
                >
                  {word}
                </button>
              );
            })}
          </div>

          {phase === "result" && (
            <div className="game-result">
              <h3>You got {correctPickedCount} / {prompt.correct.length} correct</h3>
              <p>
                <strong>The correct answers were:</strong> {prompt.correct.join(", ")}
              </p>
              <div className="game-result-actions">
                <button type="button" className="btn btn-primary" onClick={startGame}>
                  Try another
                </button>
                <button type="button" className="btn btn-ghost" onClick={onExit}>
                  Back to games
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </GameShell>
  );
}
