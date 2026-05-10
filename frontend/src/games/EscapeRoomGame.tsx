import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameShell, Instructions } from "./GameShell";
import { playGameSound } from "./gameSounds";

type Phase =
  | "instructions"
  | "pick-timer"
  | "playing"
  | "round-fail"
  | "digit-unlocked"
  | "code-entry"
  | "escape-animating"
  | "escaped";

type TimerKey = "30" | "60" | "90";

const HIGH_SCORE_KEY = "studentbot_escape_highscore_v1";
const WINS_KEY = "studentbot_escape_wins_v1";
const DIGITS_KEY = "studentbot_escape_code_progress_v1";

const TIMER_OPTIONS: { id: TimerKey; label: string; seconds: number }[] = [
  { id: "30", label: "30 seconds", seconds: 30 },
  { id: "60", label: "1 minute", seconds: 60 },
  { id: "90", label: "1 minute 30 seconds", seconds: 90 },
];

/** Need this many correct answers with zero mistakes to earn one code digit */
const ROUND_TARGET_CORRECT: Record<TimerKey, number> = {
  "30": 4,
  "60": 6,
  "90": 8,
};

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
    /* ignore */
  }
}

function loadWins(): number {
  try {
    const raw = window.localStorage.getItem(WINS_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  } catch {
    return 0;
  }
}

function saveWins(n: number) {
  try {
    window.localStorage.setItem(WINS_KEY, String(n));
  } catch {
    /* ignore */
  }
}

function loadDigits(): number[] {
  try {
    const raw = window.localStorage.getItem(DIGITS_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return [];
    return p.map((x) => Number(x)).filter((x) => Number.isInteger(x) && x >= 0 && x <= 9).slice(0, 5);
  } catch {
    return [];
  }
}

function saveDigits(digits: number[]) {
  try {
    window.localStorage.setItem(DIGITS_KEY, JSON.stringify(digits));
  } catch {
    /* ignore */
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

function EscapeCodeProgressSoFar({
  digits,
  highlightLastFilled,
}: {
  digits: number[];
  highlightLastFilled?: boolean;
}) {
  const count = digits.length;
  const label =
    count === 0
      ? "No digits earned yet — get a perfect round to add one!"
      : `${count}/5 digits toward the door code`;
  const lastIdx = digits.length > 0 ? digits.length - 1 : -1;
  return (
    <div className="escape-playing-code-strip" role="region" aria-label={label}>
      <div className="escape-playing-code-label">Your door code</div>
      <div className="escape-playing-code-slots">
        {[0, 1, 2, 3, 4].map((i) => {
          const has = i < digits.length;
          const isLatest = highlightLastFilled && has && i === lastIdx;
          return (
            <span
              key={i}
              className={`escape-playing-code-slot${has ? " has-value" : " is-empty"}${isLatest ? " is-latest" : ""}`}
            >
              {has ? digits[i] : "–"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function EscapeRoomGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [timerKey, setTimerKey] = useState<TimerKey>("60");
  const [highScores, setHighScores] = useState<HighScores>(() => loadHighScores());
  const [wins, setWins] = useState<number>(() => loadWins());
  const [secretCode, setSecretCode] = useState<number[]>(() => loadDigits());
  const [justUnlocked, setJustUnlocked] = useState<number | null>(null);

  const [question, setQuestion] = useState<TimesQuestion>({ a: 2, b: 3 });
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [codeInputs, setCodeInputs] = useState<string[]>(["", "", "", "", ""]);
  const [codeError, setCodeError] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const flashRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const roundTimerKeyRef = useRef<TimerKey>(timerKey);
  const roundRef = useRef({ score: 0, wrong: 0 });
  roundRef.current.score = score;
  roundRef.current.wrong = wrongCount;
  const codeRef = useRef(secretCode);
  codeRef.current = secretCode;
  const highRef = useRef(highScores);
  highRef.current = highScores;
  /** Stops duplicate timer callbacks from running finishPlayingRound twice (skips digit-unlocked for 5th digit). */
  const roundEndHandledRef = useRef(false);

  const finishRoundRef = useRef<() => void>(() => {});

  const currentTimerMeta = useMemo(
    () => TIMER_OPTIONS.find((t) => t.id === timerKey) ?? TIMER_OPTIONS[1],
    [timerKey]
  );

  const targetCorrect = ROUND_TARGET_CORRECT[timerKey];

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopInterval(), [stopInterval]);
  useEffect(
    () => () => {
      if (flashRef.current !== null) window.clearTimeout(flashRef.current);
    },
    []
  );

  useEffect(() => {
    if (phase === "playing") inputRef.current?.focus();
  }, [phase, question]);

  useEffect(() => {
    if (phase === "code-entry") codeInputRefs.current[0]?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase === "playing") roundEndHandledRef.current = false;
  }, [phase]);

  function flashState(state: "correct" | "wrong") {
    setFlash(state);
    if (flashRef.current !== null) window.clearTimeout(flashRef.current);
    flashRef.current = window.setTimeout(() => setFlash(null), 350);
  }

  function finishPlayingRound() {
    if (roundEndHandledRef.current) return;
    roundEndHandledRef.current = true;

    const tk = roundTimerKeyRef.current;
    const sc = roundRef.current.score;
    const wr = roundRef.current.wrong;
    const digs = codeRef.current;
    const need = ROUND_TARGET_CORRECT[tk];
    const prevHi = highRef.current[tk];

    if (sc > prevHi) {
      const updated = { ...highRef.current, [tk]: sc };
      highRef.current = updated;
      setHighScores(updated);
      saveHighScores(updated);
      setNewRecord(true);
    } else {
      setNewRecord(false);
    }

    const perfect = wr === 0 && sc >= need;
    if (perfect) {
      if (digs.length >= 5) {
        return;
      }
      const d = Math.floor(Math.random() * 10);
      const next = [...digs, d];
      codeRef.current = next;
      saveDigits(next);
      setSecretCode(next);
      setJustUnlocked(d);
      playGameSound("correct");
      setPhase("digit-unlocked");
      return;
    }
    playGameSound("wrong");
    setPhase("round-fail");
  }

  finishRoundRef.current = finishPlayingRound;

  function startGame(key: TimerKey) {
    roundEndHandledRef.current = false;
    if (codeRef.current.length >= 5) {
      setPhase("code-entry");
      setCodeInputs(["", "", "", "", ""]);
      setCodeError(null);
      return;
    }
    stopInterval();
    const meta = TIMER_OPTIONS.find((t) => t.id === key) ?? TIMER_OPTIONS[1];
    roundTimerKeyRef.current = key;
    setTimerKey(key);
    setQuestion(newQuestion(null));
    setAnswer("");
    setScore(0);
    setAttempted(0);
    setWrongCount(0);
    setTimeLeft(meta.seconds);
    setFlash(null);
    setNewRecord(false);
    setPhase("playing");
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopInterval();
          queueMicrotask(() => finishRoundRef.current());
          return 0;
        }
        return t - 1;
      });
    }, 1000);
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
      playGameSound("correct");
    } else {
      setWrongCount((n) => n + 1);
      flashState("wrong");
      playGameSound("wrong");
    }
    setQuestion((q) => newQuestion(q));
    setAnswer("");
  }

  function resetMission() {
    codeRef.current = [];
    setSecretCode([]);
    saveDigits([]);
    setJustUnlocked(null);
    setCodeInputs(["", "", "", "", ""]);
    setCodeError(null);
    setPhase("pick-timer");
  }

  function afterUnlockContinue() {
    setJustUnlocked(null);
    if (secretCode.length >= 5) {
      setCodeInputs(["", "", "", "", ""]);
      setCodeError(null);
      setPhase("code-entry");
      return;
    }
    setPhase("pick-timer");
  }

  function tryEscapeCode() {
    const parts = codeInputs.map((s) => s.replace(/\D/g, "").slice(-1)).map((x) => (x === "" ? NaN : Number(x)));
    if (parts.some((x) => !Number.isFinite(x))) {
      setCodeError("Fill every box with one digit.");
      playGameSound("wrong");
      return;
    }
    const targetDigits = [...codeRef.current];
    const ok =
      targetDigits.length === 5 &&
      parts.length === 5 &&
      parts.every((d, i) => d === targetDigits[i]);
    if (!ok) {
      setCodeError("That's not quite right. Try again — use the digits in the order you earned them.");
      playGameSound("wrong");
      return;
    }
    setCodeError(null);
    const next = wins + 1;
    setWins(next);
    saveWins(next);
    codeRef.current = [];
    setSecretCode([]);
    saveDigits([]);
    playGameSound("correct");
    setPhase("escape-animating");
    window.setTimeout(() => setPhase("escaped"), 3200);
  }

  function clearCodeEntry() {
    setCodeInputs(["", "", "", "", ""]);
    setCodeError(null);
    codeInputRefs.current[0]?.focus();
  }

  const headerWins = (
    <div className="escape-global-wins" aria-live="polite">
      Escapes won: <strong>{wins}</strong>
    </div>
  );

  return (
    <GameShell title="Escape Room" onExit={onExit}>
      <div className="escape-shell-top">{headerWins}</div>

      {phase === "instructions" && (
        <Instructions
          title="How to play Escape Room"
          bullets={[
            "Pick a timer: 30 seconds, 1 minute, or 1 minute 30 seconds.",
            "Solve times tables up to 12 × 12. Type your answer and press Enter.",
            `With ${ROUND_TARGET_CORRECT["30"]} correct (30s), ${ROUND_TARGET_CORRECT["60"]} (1 min), or ${ROUND_TARGET_CORRECT["90"]} (1:30) — and no wrong answers in that round — you earn one digit of a 5-digit door code.`,
            "The centre of the mission is memory: after five perfect rounds, enter your code on the lock to escape.",
            "You can reset the whole mission (lose collected digits) or keep going after each digit. Your total escapes are saved at the top.",
          ]}
          onStart={() => setPhase("pick-timer")}
          startLabel="Pick a timer"
        />
      )}

      {phase === "pick-timer" && (
        <div className="escape-pick">
          <h3>Choose your timer</h3>
          <p>Each timer has its own high score. Code digits need a perfect round (no mistakes).</p>
          {secretCode.length > 0 && secretCode.length < 5 && (
            <p className="escape-code-hint">
              Code progress: {secretCode.length}/5 digit{secretCode.length === 1 ? "" : "s"} collected
            </p>
          )}
          {secretCode.length >= 5 && (
            <div className="escape-door-banner">
              <p>
                <strong>Full code ready!</strong> Head to the lock when you feel prepared.
              </p>
              <button
                type="button"
                className="btn btn-primary escape-door-banner-btn"
                onClick={() => {
                  setCodeInputs(["", "", "", "", ""]);
                  setCodeError(null);
                  setPhase("code-entry");
                }}
              >
                Try the door lock
              </button>
            </div>
          )}
          <div className="escape-timer-grid">
            {TIMER_OPTIONS.map((t) => (
              <button key={t.id} type="button" className="escape-timer-card" onClick={() => startGame(t.id)}>
                <h4>{t.label}</h4>
                <p>
                  Need <strong>{ROUND_TARGET_CORRECT[t.id]}</strong> correct, zero mistakes
                </p>
                <p>
                  High score: <strong>{highScores[t.id]}</strong>
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="escape-board">
          <EscapeCodeProgressSoFar digits={secretCode} />
          <div className="escape-topbar">
            <div className="escape-stat">
              <span className="escape-stat-label">Escapes won</span>
              <span className="escape-stat-value">{wins}</span>
            </div>
            <div className="escape-stat">
              <span className="escape-stat-label">High score</span>
              <span className="escape-stat-value">{highScores[timerKey]}</span>
            </div>
            <div className="escape-stat is-score">
              <span className="escape-stat-label">This round</span>
              <span className="escape-stat-value">{score}</span>
            </div>
            <div className={`escape-timer${timeLeft <= 5 ? " is-low" : ""}`}>
              <span className="escape-timer-num">{timeLeft}</span>
              <span className="escape-timer-label">sec</span>
            </div>
          </div>

          <p className="escape-round-goal">
            Goal: <strong>{targetCorrect}</strong> correct with <strong>no</strong> mistakes before time runs out.
          </p>

          <form className={`escape-question${flash ? ` is-${flash}` : ""}`} onSubmit={submitAnswer}>
            <div className="escape-equation">
              <span>{question.a}</span>
              <span className="escape-times" aria-hidden>
                &times;
              </span>
              <span>{question.b}</span>
              <span className="escape-equals" aria-hidden>
                =
              </span>
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

          <p className="escape-hint">
            Correct: {score} · Wrong this round: {wrongCount} · Attempts: {attempted}
          </p>
        </div>
      )}

      {phase === "round-fail" && (
        <div className="game-result">
          <h3>Time's up!</h3>
          <p>
            You scored <strong>{score}</strong> correct on the {currentTimerMeta.label} challenge.
          </p>
          {wrongCount > 0 ? (
            <p>You had {wrongCount} mistake{wrongCount === 1 ? "" : "s"} — to earn a code digit you need zero mistakes and at least {targetCorrect} correct.</p>
          ) : score < targetCorrect ? (
            <p>
              You needed at least <strong>{targetCorrect}</strong> correct with no mistakes to earn the next digit.
            </p>
          ) : (
            <p>Something went wrong — try again!</p>
          )}
          {newRecord && <p className="result-positive">New high score for this timer though — nice!</p>}
          <div className="game-result-actions">
            <button type="button" className="btn btn-primary" onClick={() => startGame(timerKey)}>
              Try this timer again
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

      {phase === "digit-unlocked" && justUnlocked !== null && (
        <div className="game-result escape-unlock">
          <h3>{secretCode.length >= 5 ? "Full code unlocked!" : "Digit unlocked!"}</h3>
          <p className="escape-new-digit" aria-live="polite">
            {justUnlocked}
          </p>
          <div className={secretCode.length >= 5 ? "escape-unlock-code-wrap" : undefined}>
            <EscapeCodeProgressSoFar digits={secretCode} highlightLastFilled />
          </div>
          {secretCode.length < 5 ? (
            <p>
              That is digit <strong>{secretCode.length}</strong> of 5. Remember the order you earned them — you will type them into the lock at the end.
            </p>
          ) : (
            <p className="result-positive escape-unlock-full-msg">
              All five digits are yours. Take a moment to remember them — tap <strong>Go to the door</strong> when you are ready to type the code into the lock.
            </p>
          )}
          <div className="game-result-actions escape-unlock-actions">
            <button type="button" className="btn btn-primary" onClick={afterUnlockContinue}>
              {secretCode.length >= 5 ? "Go to the door" : "Earn next digit"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={resetMission}>
              Reset code (restart mission)
            </button>
            <button type="button" className="btn btn-ghost" onClick={onExit}>
              Back to games
            </button>
          </div>
        </div>
      )}

      {phase === "code-entry" && (
        <div className="escape-code-panel">
          <h3>Open the door</h3>
          <p>Type your five digits <strong>in the order</strong> you unlocked them.</p>
          <div className="escape-code-row" role="group" aria-label="Five-digit code">
            {[0, 1, 2, 3, 4].map((i) => (
              <input
                key={i}
                ref={(el) => {
                  codeInputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="escape-code-digit"
                value={codeInputs[i]}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(-1);
                  const next = [...codeInputs];
                  next[i] = v;
                  setCodeInputs(next);
                  if (v && i < 4) codeInputRefs.current[i + 1]?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !codeInputs[i] && i > 0) codeInputRefs.current[i - 1]?.focus();
                }}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>
          {codeError && <div className="error-banner escape-code-error">{codeError}</div>}
          <div className="game-result-actions escape-code-buttons">
            <button type="button" className="btn btn-primary" onClick={tryEscapeCode}>
              Try the lock
            </button>
            <button type="button" className="btn btn-ghost" onClick={clearCodeEntry}>
              Reset entry boxes
            </button>
            <button type="button" className="btn btn-ghost" onClick={resetMission}>
              Reset mission
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setPhase("pick-timer")}>
              Back to timer
            </button>
          </div>
        </div>
      )}

      {phase === "escape-animating" && (
        <div className="escape-anim-stage escape-anim-active" aria-live="polite">
          <div className="escape-anim-copy">
            <h3>Code accepted</h3>
            <p>Watch the bolts slide back…</p>
          </div>
          <div className="escape-anim-lock">
            <svg className="escape-anim-svg" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <defs>
                <linearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6a86b3" />
                  <stop offset="100%" stopColor="#3d5478" />
                </linearGradient>
              </defs>
              <ellipse cx="100" cy="232" rx="58" ry="9" fill="rgb(58 121 217 / 28%)" />
              <rect x="48" y="36" width="104" height="186" rx="10" fill="#1e2d4d" stroke="#0f1828" strokeWidth="3" />
              <path
                className="escape-door-swing"
                d="M54 48h92v170H54z"
                fill="url(#doorGrad)"
                stroke="#273a5e"
                strokeWidth="2.5"
              />
              <circle className="escape-door-knob" cx="128" cy="132" r="7" fill="#e4ecfa" stroke="#9eb0d0" strokeWidth="1.5" />
              <g className="escape-lock-chip">
                <rect x="74" y="98" width="52" height="48" rx="9" fill="#0f1728" stroke="#5ce0ff" strokeWidth="2.5" />
                <path
                  className="escape-lock-shackle"
                  d="M86 98V86a14 14 0 0114-14h0a14 14 0 0114 14v12"
                  fill="none"
                  stroke="#78d4ff"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="124" r="5" fill="#5ce0ff" opacity="0.9" />
              </g>
              <g className="escape-digit-dots" fill="#5ce0ff">
                <circle cx="88" cy="220" r="3" />
                <circle cx="100" cy="220" r="3" />
                <circle cx="112" cy="220" r="3" />
              </g>
            </svg>
          </div>
          <p className="escape-anim-caption">You made it through!</p>
        </div>
      )}

      {phase === "escaped" && (
        <div className="game-result escape-escaped-end">
          <h3>You escaped!</h3>
          <p>The lock clicked open and the door swung wide — great teamwork with your maths brain.</p>
          <p>
            Total escapes: <strong>{wins}</strong>
          </p>
          <div className="game-result-actions">
            <button type="button" className="btn btn-primary" onClick={() => setPhase("pick-timer")}>
              Play again
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
