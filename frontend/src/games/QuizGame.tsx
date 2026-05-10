import { useState } from "react";
import { GameShell, Instructions } from "./GameShell";
import { playGameSound } from "./gameSounds";
import { QUIZ_GENERAL, QUIZ_MATHS, type QuizQuestion } from "./data";

type Subject = "general" | "maths";
type Phase = "instructions" | "subject" | "playing" | "result";

const QUESTIONS_PER_GAME = 10;

const SUBJECTS: { id: Subject; title: string; pool: QuizQuestion[] }[] = [
  { id: "general", title: "General Knowledge", pool: QUIZ_GENERAL },
  { id: "maths", title: "Maths", pool: QUIZ_MATHS },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickQuestions(pool: QuizQuestion[]): QuizQuestion[] {
  const count = Math.min(QUESTIONS_PER_GAME, pool.length);
  return shuffle(pool).slice(0, count);
}

export function QuizGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [subject, setSubject] = useState<Subject>("general");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const subjectMeta = SUBJECTS.find((s) => s.id === subject)!;
  const current = questions[index];

  function startSubjectPicker() {
    setPhase("subject");
  }

  function chooseSubject(s: Subject) {
    const meta = SUBJECTS.find((x) => x.id === s)!;
    setSubject(s);
    setQuestions(pickQuestions(meta.pool));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setPhase("playing");
  }

  function pickOption(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (current && i === current.correctIndex) {
      playGameSound("correct");
      setScore((n) => n + 1);
    } else playGameSound("wrong");
  }

  function next() {
    if (index + 1 >= questions.length) {
      setPhase("result");
    } else {
      setIndex(index + 1);
      setPicked(null);
    }
  }

  function playAgain() {
    setQuestions(pickQuestions(subjectMeta.pool));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setPhase("playing");
  }

  function switchSubject() {
    setPhase("subject");
  }

  return (
    <GameShell title="Quiz" onExit={onExit}>
      {phase === "instructions" && (
        <Instructions
          title="How to play Quiz"
          bullets={[
            "Pick a subject: General Knowledge or Maths.",
            "You'll get 10 questions, picked at random each time.",
            "Tap an answer to lock it in - we'll tell you if you're right.",
            "Your score appears at the end.",
          ]}
          onStart={startSubjectPicker}
          startLabel="Pick a subject"
        />
      )}

      {phase === "subject" && (
        <div className="quiz-subject-pick">
          <h3>Choose a subject</h3>
          <div className="quiz-subject-grid">
            {SUBJECTS.map((s) => (
              <button key={s.id} type="button" className="quiz-subject-card" onClick={() => chooseSubject(s.id)}>
                <h4>{s.title}</h4>
                <p>10 random questions</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "playing" && current && (
        <div className="quiz-board">
          <div className="quiz-progress">
            <span>Question {index + 1} / {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <h3 className="quiz-question">{current.question}</h3>
          <div className="quiz-options">
            {current.options.map((opt, i) => {
              const isCorrect = i === current.correctIndex;
              const isPicked = picked === i;
              let state = "";
              if (picked !== null) {
                if (isCorrect) state = " is-correct";
                else if (isPicked) state = " is-wrong";
                else state = " is-faded";
              }
              return (
                <button
                  key={i}
                  type="button"
                  className={`quiz-option${state}`}
                  onClick={() => pickOption(i)}
                  disabled={picked !== null}
                >
                  <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="quiz-option-text">{opt}</span>
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="quiz-feedback">
              {picked === current.correctIndex ? (
                <p className="result-positive">Correct!</p>
              ) : (
                <p className="result-negative">
                  Not quite. The correct answer is <strong>{current.options[current.correctIndex]}</strong>.
                </p>
              )}
              <button type="button" className="btn btn-primary" onClick={next}>
                {index + 1 >= questions.length ? "See result" : "Next question"}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "result" && (
        <div className="game-result">
          <h3>You scored {score} / {questions.length}</h3>
          <p>Subject: {subjectMeta.title}</p>
          <div className="game-result-actions">
            <button type="button" className="btn btn-primary" onClick={playAgain}>
              Play again
            </button>
            <button type="button" className="btn btn-ghost" onClick={switchSubject}>
              Try the other subject
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
