import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell, Instructions } from "./GameShell";
import { IMPOSTER_SCENARIOS, STUDENT_NAMES, type ImposterScenario } from "./data";

type Phase = "instructions" | "playing" | "guess" | "result";

type Reveal = {
  round: number;
  studentIndex: number;
  word: string;
};

const REVEAL_INTERVAL_MS = 1100;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildReveals(scenario: ImposterScenario, imposterIndex: number): Reveal[] {
  const insiderPool = shuffle(scenario.insiderWords);
  const decoyPool = shuffle(scenario.decoyWords);
  let insiderIdx = 0;
  let decoyIdx = 0;
  const reveals: Reveal[] = [];
  for (let round = 1; round <= 2; round++) {
    for (let i = 0; i < 5; i++) {
      if (i === imposterIndex) {
        reveals.push({ round, studentIndex: i, word: decoyPool[decoyIdx % decoyPool.length] });
        decoyIdx++;
      } else {
        reveals.push({ round, studentIndex: i, word: insiderPool[insiderIdx % insiderPool.length] });
        insiderIdx++;
      }
    }
  }
  return reveals;
}

export function ImposterGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [scenario, setScenario] = useState<ImposterScenario>(() => IMPOSTER_SCENARIOS[0]);
  const [imposterIndex, setImposterIndex] = useState(0);
  const [reveals, setReveals] = useState<Reveal[]>([]);
  const [revealCursor, setRevealCursor] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const wordsByStudent = useMemo(() => {
    const grid: string[][] = Array.from({ length: 5 }, () => []);
    reveals.slice(0, revealCursor).forEach((r) => grid[r.studentIndex].push(r.word));
    return grid;
  }, [reveals, revealCursor]);

  const currentRound = revealCursor === 0 ? 1 : reveals[Math.min(revealCursor - 1, reveals.length - 1)]?.round ?? 1;

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    if (revealCursor >= reveals.length) {
      const t = window.setTimeout(() => setPhase("guess"), 600);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setRevealCursor((c) => c + 1), REVEAL_INTERVAL_MS);
    timerRef.current = t;
    return () => window.clearTimeout(t);
  }, [phase, revealCursor, reveals.length]);

  function startGame() {
    let s = IMPOSTER_SCENARIOS[Math.floor(Math.random() * IMPOSTER_SCENARIOS.length)];
    if (IMPOSTER_SCENARIOS.length > 1) {
      let safety = 0;
      while (s.topic === scenario.topic && safety < 8) {
        s = IMPOSTER_SCENARIOS[Math.floor(Math.random() * IMPOSTER_SCENARIOS.length)];
        safety++;
      }
    }
    const idx = Math.floor(Math.random() * 5);
    setScenario(s);
    setImposterIndex(idx);
    setReveals(buildReveals(s, idx));
    setRevealCursor(0);
    setPicked(null);
    setPhase("playing");
  }

  function pickStudent(i: number) {
    setPicked(i);
    setPhase("result");
  }

  return (
    <GameShell title="Find the Imposter" onExit={onExit}>
      {phase === "instructions" && (
        <Instructions
          title="How to play Find the Imposter"
          bullets={[
            "Five students are describing a mystery school topic.",
            "One of them is the imposter and is trying to blend in.",
            "Each student says one word per round, for two rounds.",
            "After round 2, pick the student you think is the imposter.",
          ]}
          onStart={startGame}
        />
      )}

      {phase === "playing" && (
        <div className="imposter-board">
          <p className="imposter-round">Round {currentRound} of 2</p>
          <div className="imposter-row">
            {STUDENT_NAMES.map((name, i) => {
              const words = wordsByStudent[i];
              const last = words[words.length - 1];
              return (
                <div key={name} className="imposter-card">
                  <div className="imposter-avatar" aria-hidden>{name.charAt(0)}</div>
                  <h4>{name}</h4>
                  <div className="imposter-bubble">
                    {last ? <span>{last}</span> : <span className="imposter-bubble-empty">...</span>}
                  </div>
                  {words.length > 1 && (
                    <p className="imposter-prev">First: <em>{words[0]}</em></p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === "guess" && (
        <div className="imposter-guess">
          <h3>Who is the imposter?</h3>
          <p>Look back at what each student said and pick your suspect.</p>
          <div className="imposter-row">
            {STUDENT_NAMES.map((name, i) => (
              <button key={name} type="button" className="imposter-pick" onClick={() => pickStudent(i)}>
                <div className="imposter-avatar" aria-hidden>{name.charAt(0)}</div>
                <h4>{name}</h4>
                <p className="imposter-prev">
                  Said: <em>{wordsByStudent[i].join(", ")}</em>
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "result" && picked !== null && (
        <div className="game-result">
          {picked === imposterIndex ? (
            <h3 className="result-positive">You caught the imposter!</h3>
          ) : (
            <h3 className="result-negative">
              Not quite - the imposter was {STUDENT_NAMES[imposterIndex]}.
            </h3>
          )}
          <p>
            <strong>Mystery topic:</strong> {scenario.topic}
          </p>
          <p className="imposter-recap">
            <strong>Words {STUDENT_NAMES[imposterIndex]} said:</strong>{" "}
            <em>{wordsByStudent[imposterIndex].join(", ")}</em>
          </p>
          <div className="game-result-actions">
            <button type="button" className="btn btn-primary" onClick={startGame}>
              New round
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
