export type GameId =
  | "hangman"
  | "scratch"
  | "quiz"
  | "imposter"
  | "bingo"
  | "escape-room"
  | "ten-second"
  | "two-truths";

export type LobbyEntry = {
  id: GameId;
  title: string;
  blurb: string;
  comingSoon: boolean;
};

export const LOBBY: LobbyEntry[] = [
  { id: "hangman", title: "Hangman", blurb: "Guess the vocabulary word", comingSoon: false },
  { id: "quiz", title: "Quiz", blurb: "10 random questions, you choose the topic", comingSoon: false },
  { id: "imposter", title: "Find the Imposter", blurb: "Spot who doesn't know the topic", comingSoon: false },
  { id: "ten-second", title: "10 Second Game", blurb: "Pick 3 right words before time runs out", comingSoon: false },
  { id: "escape-room", title: "Escape Room", blurb: "Crack the code with times tables", comingSoon: false },
  { id: "two-truths", title: "Two Truths and a Lie", blurb: "Spot which fact is fake", comingSoon: false },
  { id: "scratch", title: "Scratch", blurb: "Coming soon", comingSoon: true },
  { id: "bingo", title: "Bingo", blurb: "Answer clues to mark squares and get five in a row", comingSoon: false },
];

export type GamePhase = "instructions" | "playing" | "result";
