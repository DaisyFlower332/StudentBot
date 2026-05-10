import { useCallback, useEffect, useRef, useState } from "react";
import { BINGO_MATHS, BINGO_SCIENCE, BINGO_VOCABULARY, type BingoCellData, type BingoTopicId } from "./data";
import { GameShell, Instructions } from "./GameShell";
import { playGameSound } from "./gameSounds";

type Phase = "instructions" | "topic" | "playing" | "won";

type BoardCell = { kind: "free" } | { kind: "answer"; cell: BingoCellData };

const CENTER_IDX = 12;

const STORAGE_KEY = "studentbot_bingo_v1";

type StoredStats = Record<BingoTopicId, { wins: number; bestSeconds: number | null }>;

const EMPTY_STATS: StoredStats = {
  vocabulary: { wins: 0, bestSeconds: null },
  maths: { wins: 0, bestSeconds: null },
  science: { wins: 0, bestSeconds: null },
};

const WIN_LINES: number[][] = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

const TOPICS: { id: BingoTopicId; title: string; description: string; pool: BingoCellData[] }[] = [
  { id: "vocabulary", title: "Vocabulary", description: "Words and what they mean", pool: BINGO_VOCABULARY },
  { id: "maths", title: "Maths", description: "Numbers, times tables, and shapes", pool: BINGO_MATHS },
  { id: "science", title: "Science", description: "Nature, space, and how things work", pool: BINGO_SCIENCE },
];

function loadStats(): StoredStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATS };
    const p = JSON.parse(raw) as Partial<StoredStats>;
    return {
      vocabulary: { ...EMPTY_STATS.vocabulary, ...p.vocabulary },
      maths: { ...EMPTY_STATS.maths, ...p.maths },
      science: { ...EMPTY_STATS.science, ...p.science },
    };
  } catch {
    return { ...EMPTY_STATS };
  }
}

function saveStats(s: StoredStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pick24Answers(pool: BingoCellData[]): BingoCellData[] {
  const sorted = shuffle(pool);
  const seen = new Set<string>();
  const out: BingoCellData[] = [];
  for (const cell of sorted) {
    const k = cell.answer.toLowerCase().trim();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(cell);
    if (out.length >= 24) break;
  }
  return out.slice(0, 24);
}

function buildBoard(pool: BingoCellData[]): BoardCell[] {
  const picked = pick24Answers(pool);
  const cells: BingoCellData[] = picked.slice(0, 24);
  const out: BoardCell[] = [];
  let ai = 0;
  for (let i = 0; i < 25; i++) {
    if (i === CENTER_IDX) out.push({ kind: "free" });
    else out.push({ kind: "answer", cell: cells[ai++]! });
  }
  return out;
}

function randomAnswerIndex(board: BoardCell[]): number {
  const ok: number[] = [];
  for (let i = 0; i < 25; i++) if (board[i]?.kind === "answer") ok.push(i);
  return ok[Math.floor(Math.random() * ok.length)]!;
}

function randomPickUnmarked(marked: boolean[], board: BoardCell[], avoid: number | null = null): number | null {
  const free = Array.from({ length: 25 }, (_, i) => i).filter(
    (i) =>
      board[i]?.kind === "answer" &&
      !marked[i] &&
      (avoid === null || i !== avoid)
  );
  if (free.length > 0) return free[Math.floor(Math.random() * free.length)]!;
  if (avoid === null) return null;
  return randomPickUnmarked(marked, board, null);
}

function hasWinningLine(marked: boolean[]): boolean {
  return WIN_LINES.some((line) => line.every((i) => marked[i]));
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}m ${r.toFixed(0)}s`;
}

export function BingoGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [stats, setStats] = useState<StoredStats>(loadStats);
  const [topic, setTopic] = useState<BingoTopicId>("vocabulary");
  const [board, setBoard] = useState<BoardCell[]>([]);
  const [marked, setMarked] = useState<boolean[]>(() => Array(25).fill(false));
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [flashWrong, setFlashWrong] = useState<number | null>(null);

  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(0);
  const lastWinRef = useRef<{ seconds: number; newRecord: boolean }>({ seconds: 0, newRecord: false });

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const topicMeta = TOPICS.find((t) => t.id === topic)!;

  const startTopicPicker = () => setPhase("topic");

  const chooseTopic = (tid: BingoTopicId) => {
    setTopic(tid);
    const pool = TOPICS.find((x) => x.id === tid)!.pool;
    const b = buildBoard(pool);
    setBoard(b);
    const m = Array(25).fill(false);
    m[CENTER_IDX] = true;
    setMarked(m);
    setTargetIndex(randomAnswerIndex(b));
    setFlashWrong(null);
    setElapsed(0);
    startRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      const t0 = startRef.current;
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      setElapsed((now - t0) / 1000);
    }, 100);
    return () => window.clearInterval(id);
  }, [phase]);

  const finalizeWin = useCallback((finalSeconds: number) => {
    setStats((prev) => {
      const cur = prev[topic];
      const newRecord = cur.bestSeconds === null || finalSeconds < cur.bestSeconds;
      const nextBest = cur.bestSeconds === null ? finalSeconds : Math.min(cur.bestSeconds, finalSeconds);
      lastWinRef.current = { seconds: finalSeconds, newRecord };
      return {
        ...prev,
        [topic]: {
          wins: cur.wins + 1,
          bestSeconds: nextBest,
        },
      };
    });
    setPhase("won");
  }, [topic]);

  const boardRef = useRef(board);
  boardRef.current = board;

  const onSquareClick = (index: number) => {
    if (phase !== "playing" || targetIndex === null) return;
    if (board[index]?.kind === "free") return;
    if (marked[index]) return;

    if (index === targetIndex) {
      playGameSound("correct");
      setMarked((m) => {
        const next = [...m];
        next[index] = true;
        if (hasWinningLine(next)) {
          const now = typeof performance !== "undefined" ? performance.now() : Date.now();
          const sec = (now - startRef.current) / 1000;
          queueMicrotask(() => finalizeWin(sec));
        } else {
          const n = randomPickUnmarked(next, boardRef.current, null);
          setTargetIndex(n);
        }
        return next;
      });
      setFlashWrong(null);
    } else {
      playGameSound("wrong");
      setFlashWrong(index);
      window.setTimeout(() => setFlashWrong((f) => (f === index ? null : f)), 450);
      const n = randomPickUnmarked(marked, boardRef.current, targetIndex);
      setTargetIndex(n);
    }
  };

  const headline = phase === "playing" || phase === "won" ? `${topicMeta.title} bingo` : undefined;

  const bestForTopic = stats[topic].bestSeconds;
  const winsForTopic = stats[topic].wins;
  const lastWin = phase === "won" ? lastWinRef.current : null;

  const currentClue =
    targetIndex !== null && board[targetIndex]?.kind === "answer" ? board[targetIndex].cell.clue : "";

  return (
    <GameShell title="Bingo" onExit={onExit} headline={headline}>
      {phase === "instructions" && (
        <Instructions
          title="How to play Bingo"
          bullets={[
            "You'll see a 5 by 5 grid. The centre square is FREE — it's already counted as marked.",
            "Each other square shows a short answer. Read the clue at the top and tap the matching square.",
            "Right answer: that square gets a mark. Wrong: we move to the next clue.",
            "Line up five marks in a row, column, or diagonal to win.",
            "We'll time you — try to beat your best time! Then choose Vocabulary, Maths, or Science.",
          ]}
          onStart={startTopicPicker}
        />
      )}

      {phase === "topic" && (
        <div className="bingo-topic-pick">
          <h3>Pick a topic</h3>
          <p className="bingo-topic-sub">All content is aimed at learners about 8 to 16.</p>
          <div className="quiz-subject-grid">
            {TOPICS.map((t) => {
              const s = stats[t.id];
              return (
                <button key={t.id} type="button" className="quiz-subject-card bingo-topic-card" onClick={() => chooseTopic(t.id)}>
                  <h4>{t.title}</h4>
                  <p>{t.description}</p>
                  <div className="bingo-topic-stats">
                    <span>Wins: {s.wins}</span>
                    <span>Best time: {s.bestSeconds !== null ? formatSeconds(s.bestSeconds) : "—"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase === "playing" && targetIndex !== null && board.length === 25 && (
        <div className="bingo-board-wrap">
          <div className="bingo-meta">
            <div className="bingo-timer-pill" aria-live="polite">
              Time: <strong>{formatSeconds(elapsed)}</strong>
            </div>
            {bestForTopic !== null && (
              <div className="bingo-best-pill">
                Your best ({topicMeta.title}): <strong>{formatSeconds(bestForTopic)}</strong>
              </div>
            )}
          </div>

          <div className="bingo-clue" role="region" aria-label="Current clue">
            <span className="bingo-clue-label">Clue</span>
            <p className="bingo-clue-text">{currentClue}</p>
          </div>

          <div className="bingo-grid" role="grid" aria-label="Bingo answers">
            {board.map((cell, i) => {
              const isMarked = marked[i];
              const isWrongPulse = flashWrong === i;
              if (cell.kind === "free") {
                return (
                  <div key={i} className="bingo-cell is-free" role="gridcell" aria-label="Free space">
                    <span className="bingo-cell-text">FREE</span>
                    <span className="bingo-marker" aria-hidden />
                  </div>
                );
              }
              return (
                <button
                  key={`${i}-${cell.cell.answer}`}
                  type="button"
                  role="gridcell"
                  className={`bingo-cell${isMarked ? " is-marked" : ""}${isWrongPulse ? " is-wrong-flash" : ""}`}
                  onClick={() => onSquareClick(i)}
                  disabled={isMarked}
                  aria-pressed={isMarked}
                  aria-label={isMarked ? `${cell.cell.answer}, marked` : cell.cell.answer}
                >
                  <span className="bingo-cell-text">{cell.cell.answer}</span>
                  {isMarked && <span className="bingo-marker" aria-hidden />}
                </button>
              );
            })}
          </div>
          <p className="bingo-hint">The middle square counts as yours from the start. Wrong taps swap to a new clue.</p>
        </div>
      )}

      {phase === "won" && lastWin && (
        <div className="game-result bingo-win">
          <h3>You won!</h3>
          <p className="bingo-win-time">
            Time: <strong>{formatSeconds(lastWin.seconds)}</strong>
          </p>
          <p className="bingo-win-topic">{topicMeta.title}</p>
          {lastWin.newRecord && (
            <p className="result-positive">
              {winsForTopic <= 1 ? "First win on this topic — you set a time to beat next time!" : "New best time for this topic — great job!"}
            </p>
          )}
          {!lastWin.newRecord && winsForTopic > 1 && bestForTopic !== null && (
            <p>
              Your fastest for {topicMeta.title} is <strong>{formatSeconds(bestForTopic)}</strong>. See if you can go quicker!
            </p>
          )}
          <p className="bingo-win-wins">
            Wins for this topic: <strong>{winsForTopic}</strong>
          </p>
          <div className="game-result-actions">
            <button type="button" className="btn btn-primary" onClick={() => setPhase("topic")}>
              Play another topic
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => chooseTopic(topic)}>
              Same topic again
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
