import { useState, useRef, useCallback } from "react";
import { GameShell } from "./GameShell";
import { playGameSound } from "./gameSounds";

/* ─── Types ─── */
type BlockType =
  | "move" | "turn-right" | "turn-left" | "go-to" | "go-to-random" | "glide"
  | "bounce" | "set-x" | "set-y" | "change-x" | "change-y"
  | "say" | "say-timed" | "think" | "think-timed"
  | "color" | "grow" | "shrink" | "set-size" | "show" | "hide"
  | "next-costume" | "set-effect" | "clear-effects"
  | "wait" | "repeat" | "forever" | "if-edge-bounce"
  | "play-sound" | "stop-sound"
  | "stamp" | "pen-down" | "pen-up" | "pen-color" | "pen-size"
  | "set-var" | "change-var";

interface CodeBlock {
  id: string;
  type: BlockType;
  value: string | number;
}

type Phase = "instructions" | "coding" | "challenges";

/* ─── Block Palette ─── */
type Category = "motion" | "looks" | "sound" | "control" | "pen" | "variables";

interface BlockDef {
  type: BlockType;
  label: string;
  emoji: string;
  category: Category;
  defaultValue: string | number;
  unit?: string;
  valueType: "number" | "text" | "none";
  min?: number;
  max?: number;
}

const BLOCK_PALETTE: BlockDef[] = [
  // Motion
  { type: "move", label: "Move", emoji: "➡️", category: "motion", defaultValue: 50, unit: "steps", valueType: "number", min: 1, max: 300 },
  { type: "turn-right", label: "Turn right", emoji: "↩️", category: "motion", defaultValue: 90, unit: "°", valueType: "number", min: 1, max: 360 },
  { type: "turn-left", label: "Turn left", emoji: "↪️", category: "motion", defaultValue: 90, unit: "°", valueType: "number", min: 1, max: 360 },
  { type: "go-to", label: "Go to x,y", emoji: "📍", category: "motion", defaultValue: "180,140", unit: "", valueType: "text" },
  { type: "go-to-random", label: "Go to random", emoji: "🎲", category: "motion", defaultValue: 0, valueType: "none" },
  { type: "glide", label: "Glide to x,y", emoji: "✈️", category: "motion", defaultValue: "200,100", unit: "1s", valueType: "text" },
  { type: "set-x", label: "Set X to", emoji: "↔️", category: "motion", defaultValue: 180, unit: "", valueType: "number", min: 0, max: 360 },
  { type: "set-y", label: "Set Y to", emoji: "↕️", category: "motion", defaultValue: 140, unit: "", valueType: "number", min: 0, max: 280 },
  { type: "change-x", label: "Change X by", emoji: "→", category: "motion", defaultValue: 30, unit: "", valueType: "number", min: -200, max: 200 },
  { type: "change-y", label: "Change Y by", emoji: "↑", category: "motion", defaultValue: 30, unit: "", valueType: "number", min: -200, max: 200 },
  { type: "if-edge-bounce", label: "If on edge, bounce", emoji: "🏓", category: "motion", defaultValue: 0, valueType: "none" },
  { type: "bounce", label: "Bounce", emoji: "⬆️", category: "motion", defaultValue: 40, unit: "px", valueType: "number", min: 10, max: 100 },

  // Looks
  { type: "say", label: "Say", emoji: "💬", category: "looks", defaultValue: "Hello!", unit: "", valueType: "text" },
  { type: "say-timed", label: "Say for", emoji: "💬", category: "looks", defaultValue: 2, unit: "sec", valueType: "number", min: 1, max: 10 },
  { type: "think", label: "Think", emoji: "💭", category: "looks", defaultValue: "Hmm...", unit: "", valueType: "text" },
  { type: "think-timed", label: "Think for", emoji: "💭", category: "looks", defaultValue: 2, unit: "sec", valueType: "number", min: 1, max: 10 },
  { type: "color", label: "Change color by", emoji: "🎨", category: "looks", defaultValue: 25, unit: "°", valueType: "number", min: 1, max: 360 },
  { type: "grow", label: "Grow by", emoji: "🔼", category: "looks", defaultValue: 20, unit: "%", valueType: "number", min: 5, max: 100 },
  { type: "shrink", label: "Shrink by", emoji: "🔽", category: "looks", defaultValue: 20, unit: "%", valueType: "number", min: 5, max: 100 },
  { type: "set-size", label: "Set size to", emoji: "📐", category: "looks", defaultValue: 100, unit: "%", valueType: "number", min: 20, max: 300 },
  { type: "show", label: "Show", emoji: "👁️", category: "looks", defaultValue: 0, valueType: "none" },
  { type: "hide", label: "Hide", emoji: "🙈", category: "looks", defaultValue: 0, valueType: "none" },
  { type: "next-costume", label: "Next costume", emoji: "👗", category: "looks", defaultValue: 0, valueType: "none" },
  { type: "set-effect", label: "Set ghost to", emoji: "👻", category: "looks", defaultValue: 50, unit: "%", valueType: "number", min: 0, max: 100 },
  { type: "clear-effects", label: "Clear effects", emoji: "✨", category: "looks", defaultValue: 0, valueType: "none" },

  // Sound
  { type: "play-sound", label: "Play sound", emoji: "🔊", category: "sound", defaultValue: "pop", unit: "", valueType: "text" },
  { type: "stop-sound", label: "Stop sounds", emoji: "🔇", category: "sound", defaultValue: 0, valueType: "none" },

  // Control
  { type: "wait", label: "Wait", emoji: "⏱️", category: "control", defaultValue: 0.5, unit: "sec", valueType: "number", min: 0.1, max: 10 },
  { type: "repeat", label: "Repeat", emoji: "🔁", category: "control", defaultValue: 3, unit: "times", valueType: "number", min: 2, max: 20 },
  { type: "forever", label: "Repeat forever", emoji: "♾️", category: "control", defaultValue: 10, unit: "loops", valueType: "number", min: 3, max: 50 },

  // Pen
  { type: "pen-down", label: "Pen down", emoji: "🖊️", category: "pen", defaultValue: 0, valueType: "none" },
  { type: "pen-up", label: "Pen up", emoji: "✏️", category: "pen", defaultValue: 0, valueType: "none" },
  { type: "pen-color", label: "Pen color", emoji: "🌈", category: "pen", defaultValue: "#d946ef", unit: "", valueType: "text" },
  { type: "pen-size", label: "Pen size", emoji: "⚫", category: "pen", defaultValue: 3, unit: "px", valueType: "number", min: 1, max: 20 },
  { type: "stamp", label: "Stamp", emoji: "📌", category: "pen", defaultValue: 0, valueType: "none" },

  // Variables
  { type: "set-var", label: "Set score to", emoji: "📊", category: "variables", defaultValue: 0, unit: "", valueType: "number", min: 0, max: 999 },
  { type: "change-var", label: "Change score by", emoji: "➕", category: "variables", defaultValue: 1, unit: "", valueType: "number", min: -10, max: 10 },
];

const CATEGORY_COLORS: Record<Category, string> = {
  motion: "#4C97FF",
  looks: "#9966FF",
  sound: "#CF63CF",
  control: "#FFAB19",
  pen: "#0FBD8C",
  variables: "#FF8C1A",
};

const CATEGORY_LABELS: Record<Category, string> = {
  motion: "Motion",
  looks: "Looks",
  sound: "Sound",
  control: "Control",
  pen: "Pen",
  variables: "Variables",
};

const CHARACTERS = [
  { id: "cat", name: "Kitty", emoji: "🐱", costumes: ["🐱", "😺", "😸"] },
  { id: "dog", name: "Buddy", emoji: "🐶", costumes: ["🐶", "🐕", "🦮"] },
  { id: "robot", name: "Robo", emoji: "🤖", costumes: ["🤖", "🦾", "⚙️"] },
  { id: "rocket", name: "Rocket", emoji: "🚀", costumes: ["🚀", "🛸", "✨"] },
  { id: "unicorn", name: "Sparkle", emoji: "🦄", costumes: ["🦄", "🌈", "⭐"] },
  { id: "dino", name: "Rex", emoji: "🦖", costumes: ["🦖", "🦕", "🐉"] },
  { id: "butterfly", name: "Flutter", emoji: "🦋", costumes: ["🦋", "🌸", "🌺"] },
  { id: "ghost", name: "Boo", emoji: "👻", costumes: ["👻", "💀", "🎃"] },
  { id: "alien", name: "Zorp", emoji: "👽", costumes: ["👽", "🛸", "🌟"] },
  { id: "penguin", name: "Waddle", emoji: "🐧", costumes: ["🐧", "❄️", "🧊"] },
];

let _blockId = 0;
function makeId() {
  return `block-${++_blockId}-${Date.now()}`;
}

/* ─── Pen trail type ─── */
interface PenPoint {
  x: number;
  y: number;
  color: string;
  size: number;
  isMove: boolean;
}

/* ─── Stamp type ─── */
interface Stamp {
  x: number;
  y: number;
  emoji: string;
  scale: number;
  color: number;
}

/* ─── Challenges ─── */
interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  difficulty: "⭐" | "⭐⭐" | "⭐⭐⭐";
  hint: string;
  preload: CodeBlock[];
}

const CHALLENGES: Challenge[] = [
  {
    id: "square", title: "Draw a Square", emoji: "🟦",
    description: "Make your sprite draw a square using the pen!",
    difficulty: "⭐", hint: "Pen down → Move → Turn right 90° → Repeat!",
    preload: [
      { id: "c1", type: "pen-down", value: 0 },
      { id: "c2", type: "move", value: 60 },
      { id: "c3", type: "turn-right", value: 90 },
      { id: "c4", type: "repeat", value: 4 },
    ],
  },
  {
    id: "dance", title: "Dance Party", emoji: "💃",
    description: "Make your sprite do a fun dance – move, spin, grow, shrink!",
    difficulty: "⭐", hint: "Try: Move → Turn → Grow → Wait → Shrink → Turn",
    preload: [],
  },
  {
    id: "triangle", title: "Draw a Triangle", emoji: "🔺",
    description: "Draw a perfect triangle with the pen.",
    difficulty: "⭐⭐", hint: "Turn 120° instead of 90°, repeat 3 times!",
    preload: [],
  },
  {
    id: "animation", title: "Costume Animation", emoji: "🎬",
    description: "Create an animation by switching costumes with a wait between each.",
    difficulty: "⭐⭐", hint: "Next costume → Wait → Next costume → Repeat!",
    preload: [],
  },
  {
    id: "spiral", title: "Spiral Art", emoji: "🌀",
    description: "Draw a colourful spiral – change color and increase movement each loop!",
    difficulty: "⭐⭐⭐", hint: "Pen down → Move (increasing) → Turn → Change color → Repeat a lot!",
    preload: [],
  },
  {
    id: "story", title: "Tell a Story", emoji: "📖",
    description: "Make your sprite say 3 different things, move between each one.",
    difficulty: "⭐", hint: "Say → Wait → Move → Say → Wait → Move → Say",
    preload: [],
  },
  {
    id: "star", title: "Draw a Star", emoji: "⭐",
    description: "Draw a 5-pointed star with the pen!",
    difficulty: "⭐⭐⭐", hint: "Move → Turn right 144° → Repeat 5 times!",
    preload: [],
  },
  {
    id: "bounce-art", title: "Bouncy Trail", emoji: "🎨",
    description: "Make your sprite bounce around leaving a colorful trail!",
    difficulty: "⭐⭐", hint: "Pen down → Move → If edge bounce → Change color → Repeat!",
    preload: [],
  },
];

/* ─── Component ─── */
export function ScratchGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [character, setCharacter] = useState(CHARACTERS[0]);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("motion");
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  // Stage state
  const [spriteX, setSpriteX] = useState(180);
  const [spriteY, setSpriteY] = useState(140);
  const [spriteAngle, setSpriteAngle] = useState(0);
  const [spriteScale, setSpriteScale] = useState(1);
  const [spriteColor, setSpriteColor] = useState(0);
  const [spriteOpacity, setSpriteOpacity] = useState(1);
  const [spriteVisible, setSpriteVisible] = useState(true);
  const [costumeIndex, setCostumeIndex] = useState(0);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [thinkBubble, setThinkBubble] = useState<string | null>(null);
  const [penTrail, setPenTrail] = useState<PenPoint[]>([]);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [scoreVar, setScoreVar] = useState(0);
  const [highlightBlock, setHighlightBlock] = useState<string | null>(null);
  const runningRef = useRef(false);

  function resetSprite() {
    setSpriteX(180);
    setSpriteY(140);
    setSpriteAngle(0);
    setSpriteScale(1);
    setSpriteColor(0);
    setSpriteOpacity(1);
    setSpriteVisible(true);
    setCostumeIndex(0);
    setSpeechBubble(null);
    setThinkBubble(null);
    setPenTrail([]);
    setStamps([]);
    setScoreVar(0);
    setHighlightBlock(null);
  }

  function addBlock(type: BlockType) {
    const def = BLOCK_PALETTE.find((b) => b.type === type)!;
    setCodeBlocks((prev) => [...prev, { id: makeId(), type, value: def.defaultValue }]);
    playGameSound("correct");
  }

  function updateBlockValue(id: string, value: string | number) {
    setCodeBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, value } : b))
    );
  }

  function removeBlock(id: string) {
    setCodeBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function duplicateBlock(id: string) {
    setCodeBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: makeId() };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function moveBlockUp(idx: number) {
    if (idx <= 0) return;
    setCodeBlocks((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function moveBlockDown(idx: number) {
    setCodeBlocks((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runCode = useCallback(async () => {
    if (codeBlocks.length === 0) return;
    resetSprite();
    setIsRunning(true);
    runningRef.current = true;
    playGameSound("correct");

    // Expand repeats
    const expanded: CodeBlock[] = [];
    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i];
      if (block.type === "repeat" || block.type === "forever") {
        const repeatCount = Number(block.value) || 3;
        const prev = expanded[expanded.length - 1];
        if (prev) {
          for (let j = 1; j < repeatCount; j++) {
            expanded.push({ ...prev, id: makeId() });
          }
        }
      } else {
        expanded.push(block);
      }
    }

    let x = 180, y = 140, angle = 0, scale = 1, color = 0, opacity = 1;
    let costume = 0;
    let penIsDown = false, penColor = "#d946ef", penSize = 3;
    let score = 0;
    const trail: PenPoint[] = [];
    const stampList: Stamp[] = [];

    for (const block of expanded) {
      if (!runningRef.current) break;

      setHighlightBlock(block.id);
      await delay(300);

      switch (block.type) {
        case "move": {
          const dist = Number(block.value) || 50;
          const newX = x + Math.cos((angle * Math.PI) / 180) * dist;
          const newY = y + Math.sin((angle * Math.PI) / 180) * dist;
          if (penIsDown) {
            trail.push({ x, y, color: penColor, size: penSize, isMove: true });
            trail.push({ x: newX, y: newY, color: penColor, size: penSize, isMove: false });
            setPenTrail([...trail]);
          }
          x = Math.max(20, Math.min(340, newX));
          y = Math.max(20, Math.min(260, newY));
          setSpriteX(x); setSpriteY(y);
          break;
        }
        case "turn-right":
          angle = (angle + (Number(block.value) || 90)) % 360;
          setSpriteAngle(angle);
          break;
        case "turn-left":
          angle = (angle - (Number(block.value) || 90) + 360) % 360;
          setSpriteAngle(angle);
          break;
        case "go-to": {
          const parts = String(block.value).split(",");
          x = Math.max(20, Math.min(340, Number(parts[0]) || 180));
          y = Math.max(20, Math.min(260, Number(parts[1]) || 140));
          if (penIsDown) { trail.push({ x, y, color: penColor, size: penSize, isMove: true }); setPenTrail([...trail]); }
          setSpriteX(x); setSpriteY(y);
          break;
        }
        case "go-to-random": {
          x = 20 + Math.random() * 320;
          y = 20 + Math.random() * 240;
          if (penIsDown) { trail.push({ x, y, color: penColor, size: penSize, isMove: true }); setPenTrail([...trail]); }
          setSpriteX(x); setSpriteY(y);
          break;
        }
        case "glide": {
          const gParts = String(block.value).split(",");
          const tx = Math.max(20, Math.min(340, Number(gParts[0]) || 200));
          const ty = Math.max(20, Math.min(260, Number(gParts[1]) || 100));
          const steps = 10;
          const dx = (tx - x) / steps, dy = (ty - y) / steps;
          for (let s = 0; s < steps; s++) {
            if (!runningRef.current) break;
            x += dx; y += dy;
            if (penIsDown) { trail.push({ x, y, color: penColor, size: penSize, isMove: false }); setPenTrail([...trail]); }
            setSpriteX(x); setSpriteY(y);
            await delay(100);
          }
          break;
        }
        case "set-x":
          x = Math.max(20, Math.min(340, Number(block.value) || 180));
          setSpriteX(x); break;
        case "set-y":
          y = Math.max(20, Math.min(260, Number(block.value) || 140));
          setSpriteY(y); break;
        case "change-x": {
          x = Math.max(20, Math.min(340, x + (Number(block.value) || 30)));
          if (penIsDown) { trail.push({ x, y, color: penColor, size: penSize, isMove: false }); setPenTrail([...trail]); }
          setSpriteX(x); break;
        }
        case "change-y": {
          y = Math.max(20, Math.min(260, y + (Number(block.value) || 30)));
          if (penIsDown) { trail.push({ x, y, color: penColor, size: penSize, isMove: false }); setPenTrail([...trail]); }
          setSpriteY(y); break;
        }
        case "if-edge-bounce": {
          if (x <= 25 || x >= 335) angle = 180 - angle;
          if (y <= 25 || y >= 255) angle = -angle;
          angle = ((angle % 360) + 360) % 360;
          setSpriteAngle(angle); break;
        }
        case "bounce": {
          const bh = Number(block.value) || 40;
          const origY = y;
          for (let s = 0; s < 5; s++) { y -= bh / 5; setSpriteY(y); await delay(60); }
          for (let s = 0; s < 5; s++) { y += bh / 5; setSpriteY(y); await delay(60); }
          y = origY; setSpriteY(y); break;
        }
        case "say":
          setSpeechBubble(String(block.value) || "Hello!"); setThinkBubble(null); break;
        case "say-timed":
          setSpeechBubble("Hello!"); setThinkBubble(null);
          await delay((Number(block.value) || 2) * 1000);
          setSpeechBubble(null); break;
        case "think":
          setThinkBubble(String(block.value) || "Hmm..."); setSpeechBubble(null); break;
        case "think-timed":
          setThinkBubble("Hmm..."); setSpeechBubble(null);
          await delay((Number(block.value) || 2) * 1000);
          setThinkBubble(null); break;
        case "color":
          color += Number(block.value) || 25;
          setSpriteColor(color); break;
        case "grow":
          scale = Math.min(scale + (Number(block.value) || 20) / 100, 3);
          setSpriteScale(scale); break;
        case "shrink":
          scale = Math.max(scale - (Number(block.value) || 20) / 100, 0.2);
          setSpriteScale(scale); break;
        case "set-size":
          scale = Math.max(0.2, Math.min(3, (Number(block.value) || 100) / 100));
          setSpriteScale(scale); break;
        case "show":
          setSpriteVisible(true); break;
        case "hide":
          setSpriteVisible(false); break;
        case "next-costume":
          costume = (costume + 1) % character.costumes.length;
          setCostumeIndex(costume); break;
        case "set-effect":
          opacity = 1 - (Number(block.value) || 50) / 100;
          setSpriteOpacity(opacity); break;
        case "clear-effects":
          color = 0; opacity = 1; scale = 1;
          setSpriteColor(0); setSpriteOpacity(1); setSpriteScale(1); break;
        case "play-sound":
          playGameSound("correct"); break;
        case "stop-sound":
          break;
        case "wait":
          await delay((Number(block.value) || 0.5) * 1000); break;
        case "pen-down":
          penIsDown = true;
          trail.push({ x, y, color: penColor, size: penSize, isMove: true });
          setPenTrail([...trail]); break;
        case "pen-up":
          penIsDown = false; break;
        case "pen-color":
          penColor = String(block.value) || "#d946ef"; break;
        case "pen-size":
          penSize = Number(block.value) || 3; break;
        case "stamp":
          stampList.push({ x, y, emoji: character.costumes[costume], scale, color });
          setStamps([...stampList]); break;
        case "set-var":
          score = Number(block.value) || 0; setScoreVar(score); break;
        case "change-var":
          score += Number(block.value) || 1; setScoreVar(score); break;
        default: break;
      }
    }

    await delay(300);
    setHighlightBlock(null);
    setIsRunning(false);
    runningRef.current = false;
  }, [codeBlocks, character]);

  function stopCode() {
    runningRef.current = false;
    setIsRunning(false);
    setHighlightBlock(null);
  }

  function renderPenTrail() {
    if (penTrail.length < 2) return null;
    const paths: React.ReactNode[] = [];
    let i = 0;
    while (i < penTrail.length) {
      if (penTrail[i].isMove) {
        let d = `M ${penTrail[i].x} ${penTrail[i].y}`;
        const col = penTrail[i].color;
        const sz = penTrail[i].size;
        i++;
        while (i < penTrail.length && !penTrail[i].isMove) {
          d += ` L ${penTrail[i].x} ${penTrail[i].y}`;
          i++;
        }
        paths.push(
          <path key={paths.length} d={d} stroke={col} strokeWidth={sz} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        );
      } else { i++; }
    }
    return (
      <svg className="scratch-pen-svg" width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        {paths}
      </svg>
    );
  }

  const currentEmoji = character.costumes[costumeIndex] || character.emoji;

  return (
    <GameShell title="Scratch Studio" onExit={onExit} headline="Code with blocks – create, play & complete challenges!">
      {phase === "instructions" && (
        <div className="scratch-intro">
          <div className="scratch-intro-hero">
            <span className="scratch-intro-cat">🐱</span>
            <span className="scratch-intro-sparkle">✨</span>
            <span className="scratch-intro-rocket">🚀</span>
          </div>
          <h3 className="scratch-intro-title">Welcome to Scratch Studio!</h3>
          <p className="scratch-intro-sub">Build animations, draw art, and complete coding challenges!</p>
          <div className="scratch-intro-modes">
            <button type="button" className="scratch-mode-btn scratch-mode-free" onClick={() => setPhase("coding")}>
              <span className="scratch-mode-icon">🎨</span>
              <strong>Free Play</strong>
              <span>Create anything you want!</span>
            </button>
            <button type="button" className="scratch-mode-btn scratch-mode-challenge" onClick={() => setPhase("challenges")}>
              <span className="scratch-mode-icon">🏆</span>
              <strong>Challenges</strong>
              <span>Complete missions to earn stars!</span>
            </button>
          </div>
        </div>
      )}

      {phase === "challenges" && (
        <div className="scratch-challenges">
          <h3>🏆 Coding Challenges <span className="scratch-challenge-progress">{completedChallenges.length}/{CHALLENGES.length} completed</span></h3>
          <div className="scratch-challenge-grid">
            {CHALLENGES.map((ch) => {
              const done = completedChallenges.includes(ch.id);
              return (
                <button
                  key={ch.id}
                  type="button"
                  className={`scratch-challenge-card${done ? " is-done" : ""}`}
                  onClick={() => {
                    setCurrentChallenge(ch);
                    setCodeBlocks(ch.preload.map(b => ({ ...b, id: makeId() })));
                    setPhase("coding");
                  }}
                >
                  <span className="scratch-challenge-emoji">{ch.emoji}</span>
                  <strong>{ch.title}</strong>
                  <span className="scratch-challenge-diff">{ch.difficulty}</span>
                  <p>{ch.description}</p>
                  {done && <span className="scratch-challenge-done">✅ Done!</span>}
                </button>
              );
            })}
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => setPhase("instructions")} style={{ marginTop: 16 }}>
            ← Back
          </button>
        </div>
      )}

      {phase === "coding" && (
        <div className="scratch-workspace">
          {/* Challenge banner */}
          {currentChallenge && (
            <div className="scratch-challenge-banner">
              <span>{currentChallenge.emoji}</span>
              <strong>Challenge: {currentChallenge.title}</strong>
              <span className="scratch-challenge-hint">💡 {currentChallenge.hint}</span>
              <button type="button" className="scratch-complete-btn" onClick={() => {
                if (!completedChallenges.includes(currentChallenge.id)) {
                  setCompletedChallenges(prev => [...prev, currentChallenge.id]);
                  playGameSound("correct");
                }
                setCurrentChallenge(null);
              }}>
                ✅ Mark Complete
              </button>
              <button type="button" className="scratch-dismiss-btn" onClick={() => setCurrentChallenge(null)}>✕</button>
            </div>
          )}
          {/* Character Picker */}
          <div className="scratch-character-picker">
            <span className="scratch-picker-label">Sprite:</span>
            {CHARACTERS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`scratch-char-btn${character.id === c.id ? " active" : ""}`}
                onClick={() => { setCharacter(c); setCostumeIndex(0); }}
                title={c.name}
              >
                <span className="scratch-char-emoji">{c.emoji}</span>
              </button>
            ))}
            {scoreVar > 0 && (
              <span className="scratch-score-display">⭐ Score: {scoreVar}</span>
            )}
          </div>

          <div className="scratch-main">
            {/* Block Palette */}
            <div className="scratch-palette">
              <div className="scratch-palette-tabs">
                {(Object.keys(CATEGORY_COLORS) as Category[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`scratch-tab${activeCategory === cat ? " active" : ""}`}
                    style={{
                      borderColor: CATEGORY_COLORS[cat],
                      background: activeCategory === cat ? CATEGORY_COLORS[cat] : "transparent",
                      color: activeCategory === cat ? "white" : CATEGORY_COLORS[cat],
                    }}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
              <div className="scratch-palette-blocks">
                {BLOCK_PALETTE.filter((b) => b.category === activeCategory).map((b) => (
                  <button
                    key={b.type}
                    type="button"
                    className="scratch-block-btn"
                    style={{ borderLeftColor: CATEGORY_COLORS[b.category], background: `${CATEGORY_COLORS[b.category]}18` }}
                    onClick={() => addBlock(b.type)}
                    title={`Add: ${b.label}`}
                  >
                    <span className="scratch-block-emoji">{b.emoji}</span>
                    <span>{b.label}</span>
                    {b.valueType !== "none" && (
                      <span className="scratch-block-default">
                        ({String(b.defaultValue)}{b.unit ? ` ${b.unit}` : ""})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Area */}
            <div className="scratch-code-area">
              <div className="scratch-code-header">
                <h4>🧩 My Code <span className="scratch-block-count">({codeBlocks.length} blocks)</span></h4>
                <div className="scratch-code-actions">
                  <button
                    type="button"
                    className="scratch-run-btn"
                    onClick={runCode}
                    disabled={isRunning || codeBlocks.length === 0}
                  >
                    ▶️ Run
                  </button>
                  <button
                    type="button"
                    className="scratch-stop-btn"
                    onClick={stopCode}
                    disabled={!isRunning}
                  >
                    ⏹️ Stop
                  </button>
                  <button
                    type="button"
                    className="scratch-clear-btn"
                    onClick={() => { setCodeBlocks([]); resetSprite(); }}
                    disabled={isRunning}
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
              <div className="scratch-code-stack">
                {codeBlocks.length === 0 && (
                  <div className="scratch-empty">
                    <p>👈 Click blocks from the palette to add them here!</p>
                    <p className="scratch-empty-hint">Tip: You can edit values after adding blocks</p>
                  </div>
                )}
                {codeBlocks.map((block, idx) => {
                  const def = BLOCK_PALETTE.find((b) => b.type === block.type)!;
                  const isHighlighted = highlightBlock === block.id;
                  return (
                    <div
                      key={block.id}
                      className={`scratch-code-block${isHighlighted ? " is-running" : ""}`}
                      style={{ borderLeftColor: CATEGORY_COLORS[def.category] }}
                    >
                      <span className="scratch-block-emoji">{def.emoji}</span>
                      <span className="scratch-block-label">{def.label}</span>
                      {def.valueType === "number" && (
                        <input
                          type="number"
                          className="scratch-value-input"
                          value={block.value}
                          min={def.min}
                          max={def.max}
                          step={def.type === "wait" ? 0.1 : 1}
                          onChange={(e) => updateBlockValue(block.id, Number(e.target.value))}
                          disabled={isRunning}
                        />
                      )}
                      {def.valueType === "text" && (
                        <input
                          type="text"
                          className="scratch-value-input scratch-value-text"
                          value={String(block.value)}
                          onChange={(e) => updateBlockValue(block.id, e.target.value)}
                          disabled={isRunning}
                        />
                      )}
                      {def.unit && <span className="scratch-block-unit">{def.unit}</span>}
                      <span className="scratch-block-controls">
                        <button type="button" onClick={() => moveBlockUp(idx)} title="Move up" disabled={isRunning}>↑</button>
                        <button type="button" onClick={() => moveBlockDown(idx)} title="Move down" disabled={isRunning}>↓</button>
                        <button type="button" onClick={() => duplicateBlock(block.id)} title="Duplicate" disabled={isRunning}>⧉</button>
                        <button type="button" onClick={() => removeBlock(block.id)} title="Remove" disabled={isRunning}>✕</button>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage */}
            <div className="scratch-stage">
              <div className="scratch-stage-inner">
                {renderPenTrail()}
                {stamps.map((s, i) => (
                  <div
                    key={i}
                    className="scratch-stamp"
                    style={{
                      left: s.x,
                      top: s.y,
                      transform: `translate(-50%, -50%) scale(${s.scale})`,
                      filter: `hue-rotate(${s.color}deg)`,
                    }}
                  >
                    {s.emoji}
                  </div>
                ))}
                {(speechBubble || thinkBubble) && (
                  <div
                    className={`scratch-speech${thinkBubble ? " is-think" : ""}`}
                    style={{ left: Math.min(spriteX + 25, 300), top: Math.max(spriteY - 55, 5) }}
                  >
                    {speechBubble || thinkBubble}
                  </div>
                )}
                {spriteVisible && (
                  <div
                    className="scratch-sprite"
                    style={{
                      left: spriteX,
                      top: spriteY,
                      transform: `translate(-50%, -50%) rotate(${spriteAngle}deg) scale(${spriteScale})`,
                      filter: `hue-rotate(${spriteColor}deg)`,
                      opacity: spriteOpacity,
                      transition: "all 0.25s ease",
                    }}
                  >
                    {currentEmoji}
                  </div>
                )}
                <div className="scratch-coords">
                  x: {Math.round(spriteX)} y: {Math.round(spriteY)}
                </div>
              </div>
              <div className="scratch-stage-label">
                Stage – {character.name} {isRunning && <span className="scratch-running-badge">▶ Running...</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
