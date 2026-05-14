export type GameId =
  | "hangman"
  | "scratch"
  | "quiz"
  | "imposter"
  | "bingo"
  | "escape-room"
  | "ten-second"
  | "two-truths"
  | "minesweeper"
  | "nethack";

export type LobbyEntry = {
  id: GameId;
  title: string;
  blurb: string;
  comingSoon: boolean;
  emoji: string;
  mascot: string;
  color: string;
};

export const LOBBY: LobbyEntry[] = [
  { id: "hangman", title: "Hangman", blurb: "Guess the word before the stickman appears!", comingSoon: false, emoji: "🎯", mascot: "🤠", color: "#fde68a" },
  { id: "quiz", title: "Quiz Battle", blurb: "10 questions – how many can you crush?", comingSoon: false, emoji: "🧠", mascot: "🦉", color: "#c4b5fd" },
  { id: "imposter", title: "Find the Imposter", blurb: "One of them is faking it... who? 🕵️", comingSoon: false, emoji: "🕵️", mascot: "👀", color: "#fca5a5" },
  { id: "ten-second", title: "10 Second Rush", blurb: "Quick! Pick 3 correct answers before ⏰ runs out", comingSoon: false, emoji: "⚡", mascot: "🏃", color: "#67e8f9" },
  { id: "escape-room", title: "Escape Room", blurb: "Crack the maths code to escape! 🔐", comingSoon: false, emoji: "🔐", mascot: "🧙", color: "#86efac" },
  { id: "two-truths", title: "Two Truths & a Lie", blurb: "Can you spot the sneaky lie? 🤥", comingSoon: false, emoji: "🤔", mascot: "🦊", color: "#fdba74" },
  { id: "scratch", title: "Scratch Studio", blurb: "Code your own animations & complete challenges! 🎬", comingSoon: false, emoji: "🧩", mascot: "🐱", color: "#a78bfa" },
  { id: "bingo", title: "Brain Bingo", blurb: "Answer clues to fill your board – BINGO! 🎉", comingSoon: false, emoji: "🎲", mascot: "🐸", color: "#6ee7b7" },
  { id: "minesweeper", title: "Minesweeper", blurb: "Sweep the field – don't go BOOM! 💥", comingSoon: false, emoji: "💣", mascot: "🐭", color: "#fda4af" },
  { id: "nethack", title: "Dungeon Quest", blurb: "Explore, fight monsters, collect treasure! ⚔️", comingSoon: false, emoji: "🏰", mascot: "🧝", color: "#a5b4fc" },
];

export type GamePhase = "instructions" | "playing" | "result";
