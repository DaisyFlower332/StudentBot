import { useState } from "react";
import { GameShell, Instructions } from "./GameShell";
import { TWO_TRUTHS_ROUNDS, type TwoTruthsRound } from "./data";

type Phase = "instructions" | "playing" | "result";

function pickRound(prev: TwoTruthsRound | null): TwoTruthsRound {
  if (TWO_TRUTHS_ROUNDS.length <= 1) return TWO_TRUTHS_ROUNDS[0];
  let next = TWO_TRUTHS_ROUNDS[Math.floor(Math.random() * TWO_TRUTHS_ROUNDS.length)];
  let safety = 0;
  while (prev && next.topic === prev.topic && safety < 8) {
    next = TWO_TRUTHS_ROUNDS[Math.floor(Math.random() * TWO_TRUTHS_ROUNDS.length)];
    safety++;
  }
  return next;
}

export function TwoTruthsGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [round, setRound] = useState<TwoTruthsRound>(() => TWO_TRUTHS_ROUNDS[0]);
  const [picked, setPicked] = useState<number | null>(null);

  function startRound() {
    setRound(pickRound(phase === "result" ? round : null));
    setPicked(null);
    setPhase("playing");
  }

  function pickStatement(i: number) {
    if (picked !== null) return;
    setPicked(i);
    setPhase("result");
  }

  const isCorrect = picked !== null && picked === round.lieIndex;

  return (
    <GameShell title="Two Truths and a Lie" onExit={onExit}>
      {phase === "instructions" && (
        <Instructions
          title="How to play Two Truths and a Lie"
          bullets={[
            "You'll see three statements about the same topic.",
            "Two are true facts and one is a lie - your job is to spot the lie.",
            "Tap a statement to lock in your answer.",
            "We'll explain why the lie isn't true so you learn something new!",
          ]}
          onStart={startRound}
        />
      )}

      {(phase === "playing" || phase === "result") && (
        <div className="ttl-board">
          <div className="ttl-topic">
            <span className="ttl-topic-label">Topic</span>
            <span className="ttl-topic-name">{round.topic}</span>
          </div>
          <p className="ttl-prompt">
            {phase === "playing" ? "Which one is the lie?" : isCorrect ? "Nice spotting!" : "So close!"}
          </p>
          <div className="ttl-grid">
            {round.statements.map((s, i) => {
              const isLie = i === round.lieIndex;
              const isPicked = picked === i;
              let cls = "ttl-card";
              if (picked !== null) {
                if (isLie) cls += " is-lie";
                else if (isPicked && !isLie) cls += " is-picked-truth";
                else cls += " is-truth";
              }
              return (
                <button
                  key={i}
                  type="button"
                  className={cls}
                  onClick={() => pickStatement(i)}
                  disabled={picked !== null}
                >
                  <span className="ttl-card-index">{i + 1}</span>
                  <span className="ttl-card-text">{s}</span>
                  {picked !== null && (
                    <span className="ttl-card-tag">
                      {isLie ? "The lie" : "True"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {phase === "result" && (
            <div className="game-result ttl-result">
              {isCorrect ? (
                <h3 className="result-positive">Correct - that was the lie!</h3>
              ) : (
                <h3 className="result-negative">
                  Not quite. The lie was statement {round.lieIndex + 1}.
                </h3>
              )}
              <p>
                <strong>Why it's not true:</strong> {round.explanation}
              </p>
              <div className="game-result-actions">
                <button type="button" className="btn btn-primary" onClick={startRound}>
                  Next round
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
