import { useCallback, useEffect, useMemo, useState } from "react";
import { GameShell, Instructions } from "./GameShell";
import { HANGMAN_WORDS, type VocabWord } from "./data";

type Phase = "instructions" | "playing" | "won-input" | "won-revealed" | "lost";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_WRONG = 6;

function pickWord(): VocabWord {
  return HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
}

function checkAnswer(text: string, w: VocabWord): boolean {
  const t = text.toLowerCase().trim();
  if (!t) return false;
  return w.keywords.some((k) => t.includes(k.toLowerCase()));
}

export function HangmanGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [target, setTarget] = useState<VocabWord>(() => pickWord());
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);
  const [definitionInput, setDefinitionInput] = useState("");
  const [definitionFeedback, setDefinitionFeedback] = useState<"correct" | "almost" | null>(null);

  const startGame = useCallback(() => {
    setTarget(pickWord());
    setGuessed(new Set());
    setWrong(0);
    setDefinitionInput("");
    setDefinitionFeedback(null);
    setPhase("playing");
  }, []);

  const uniqueLetters = useMemo(() => new Set(target.word.replace(/[^A-Z]/g, "").split("")), [target]);

  const isWon = useMemo(
    () => phase === "playing" && [...uniqueLetters].every((l) => guessed.has(l)),
    [phase, uniqueLetters, guessed]
  );

  useEffect(() => {
    if (phase === "playing" && isWon) setPhase("won-input");
  }, [phase, isWon]);

  useEffect(() => {
    if (phase === "playing" && wrong >= MAX_WRONG) setPhase("lost");
  }, [phase, wrong]);

  const guess = useCallback(
    (letter: string) => {
      if (phase !== "playing") return;
      const upper = letter.toUpperCase();
      if (!/^[A-Z]$/.test(upper)) return;
      if (guessed.has(upper)) return;
      const next = new Set(guessed);
      next.add(upper);
      setGuessed(next);
      if (!uniqueLetters.has(upper)) setWrong((n) => n + 1);
    },
    [guessed, phase, uniqueLetters]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase !== "playing") return;
      if (e.key.length === 1) guess(e.key);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guess, phase]);

  function submitDefinition() {
    const ok = checkAnswer(definitionInput, target);
    setDefinitionFeedback(ok ? "correct" : "almost");
    setPhase("won-revealed");
  }

  function revealDefinition() {
    setDefinitionFeedback(null);
    setPhase("won-revealed");
  }

  return (
    <GameShell title="Hangman" onExit={onExit}>
      {phase === "instructions" && (
        <Instructions
          title="How to play Hangman"
          bullets={[
            "Guess one letter at a time to fill in the secret word.",
            "You can use the on-screen keyboard or type with your real keyboard.",
            "Six wrong guesses and the hangman is complete.",
            "Win, and we'll ask you to share what the word means.",
          ]}
          onStart={startGame}
        />
      )}

      {(phase === "playing" || phase === "won-input" || phase === "won-revealed" || phase === "lost") && (
        <div className="hangman-board">
          <HangmanFigure wrong={phase === "lost" ? MAX_WRONG : wrong} />
          <div className="hangman-word" aria-label="Word to guess">
            {target.word.split("").map((ch, i) =>
              ch === " " ? (
                <span key={i} className="hangman-space" aria-hidden />
              ) : (
                <span key={i} className="hangman-letter">
                  {phase === "lost" || guessed.has(ch) ? ch : ""}
                </span>
              )
            )}
          </div>
          <p className="hangman-status">
            {phase === "playing" && `Wrong guesses: ${wrong} / ${MAX_WRONG}`}
            {phase === "won-input" && "You got it!"}
            {phase === "lost" && "Out of guesses."}
          </p>

          {phase === "playing" && (
            <div className="hangman-keyboard" role="group" aria-label="Letters">
              {ALPHABET.map((l) => {
                const used = guessed.has(l);
                const correct = used && uniqueLetters.has(l);
                return (
                  <button
                    key={l}
                    type="button"
                    className={`hangman-key${used ? (correct ? " is-correct" : " is-wrong") : ""}`}
                    onClick={() => guess(l)}
                    disabled={used}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          )}

          {phase === "won-input" && (
            <div className="hangman-define">
              <p className="hangman-define-prompt">
                Nice work! Do you know what <strong>{target.word.toLowerCase()}</strong> means? Type a short answer or
                tap "I'm not sure".
              </p>
              <textarea
                rows={3}
                value={definitionInput}
                onChange={(e) => setDefinitionInput(e.target.value)}
                placeholder="It means..."
              />
              <div className="hangman-define-actions">
                <button type="button" className="btn btn-primary" onClick={submitDefinition} disabled={!definitionInput.trim()}>
                  Check
                </button>
                <button type="button" className="btn btn-ghost" onClick={revealDefinition}>
                  I'm not sure
                </button>
              </div>
            </div>
          )}

          {phase === "won-revealed" && (
            <div className="game-result">
              <h3>Word: {target.word.toLowerCase()}</h3>
              {definitionFeedback === "correct" && <p className="result-positive">Great answer!</p>}
              {definitionFeedback === "almost" && <p className="result-almost">Nice try!</p>}
              <p>
                <strong>Definition:</strong> {target.definition}
              </p>
              <div className="game-result-actions">
                <button type="button" className="btn btn-primary" onClick={startGame}>
                  Play another word
                </button>
                <button type="button" className="btn btn-ghost" onClick={onExit}>
                  Back to games
                </button>
              </div>
            </div>
          )}

          {phase === "lost" && (
            <div className="game-result">
              <h3>The word was {target.word.toLowerCase()}</h3>
              <p>
                <strong>Definition:</strong> {target.definition}
              </p>
              <div className="game-result-actions">
                <button type="button" className="btn btn-primary" onClick={startGame}>
                  Try another word
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

function HangmanFigure({ wrong }: { wrong: number }) {
  return (
    <svg className="hangman-figure" viewBox="0 0 160 200" width="180" height="220" aria-hidden>
      <line x1="20" y1="190" x2="140" y2="190" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="40" y1="190" x2="40" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="40" y1="20" x2="110" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="20" x2="110" y2="40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {wrong >= 1 && <circle cx="110" cy="55" r="14" stroke="currentColor" strokeWidth="4" fill="none" />}
      {wrong >= 2 && <line x1="110" y1="69" x2="110" y2="120" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
      {wrong >= 3 && <line x1="110" y1="80" x2="90" y2="105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
      {wrong >= 4 && <line x1="110" y1="80" x2="130" y2="105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
      {wrong >= 5 && <line x1="110" y1="120" x2="92" y2="150" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
      {wrong >= 6 && <line x1="110" y1="120" x2="128" y2="150" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
    </svg>
  );
}
