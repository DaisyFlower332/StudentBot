import { useState, useCallback, useEffect } from "react";
import { GameShell, Instructions } from "./GameShell";
import { playGameSound } from "./gameSounds";

type Phase = "instructions" | "playing" | "result";

interface Position { x: number; y: number; }

type TileType = "floor" | "wall" | "stairs" | "potion" | "gold" | "weapon" | "monster" | "trap" | "door" | "chest";

interface Tile {
  type: TileType;
  visible: boolean;
  explored: boolean;
  emoji: string;
}

interface Monster {
  name: string;
  emoji: string;
  hp: number;
  attack: number;
  x: number;
  y: number;
}

interface GameState {
  map: Tile[][];
  player: Position;
  hp: number;
  maxHp: number;
  gold: number;
  level: number;
  weapon: string;
  weaponDmg: number;
  potions: number;
  messages: string[];
  monsters: Monster[];
  turns: number;
}

const MAP_W = 20;
const MAP_H = 12;

const WEAPONS = [
  { name: "Fists", dmg: 2, emoji: "👊" },
  { name: "Dagger", dmg: 4, emoji: "🗡️" },
  { name: "Sword", dmg: 6, emoji: "⚔️" },
  { name: "Axe", dmg: 8, emoji: "🪓" },
  { name: "Magic Staff", dmg: 10, emoji: "🪄" },
];

const MONSTER_TYPES = [
  { name: "Rat", emoji: "🐀", hp: 4, attack: 1 },
  { name: "Bat", emoji: "🦇", hp: 5, attack: 2 },
  { name: "Slime", emoji: "🟢", hp: 6, attack: 2 },
  { name: "Goblin", emoji: "👺", hp: 8, attack: 3 },
  { name: "Skeleton", emoji: "💀", hp: 10, attack: 4 },
  { name: "Ghost", emoji: "👻", hp: 12, attack: 5 },
  { name: "Dragon", emoji: "🐉", hp: 20, attack: 7 },
];

function generateMap(level: number): { map: Tile[][]; playerPos: Position; monsters: Monster[]; stairsPos: Position } {
  // Create empty map with walls
  const map: Tile[][] = Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, () => ({ type: "wall" as TileType, visible: false, explored: false, emoji: "⬛" }))
  );

  // Create rooms (simple room generation)
  const rooms: { x: number; y: number; w: number; h: number }[] = [];
  const numRooms = 4 + Math.min(level, 4);

  for (let i = 0; i < numRooms * 3; i++) {
    if (rooms.length >= numRooms) break;
    const w = 3 + Math.floor(Math.random() * 4);
    const h = 2 + Math.floor(Math.random() * 3);
    const x = 1 + Math.floor(Math.random() * (MAP_W - w - 2));
    const y = 1 + Math.floor(Math.random() * (MAP_H - h - 2));

    // Check overlap
    const overlaps = rooms.some(r =>
      x < r.x + r.w + 1 && x + w + 1 > r.x && y < r.y + r.h + 1 && y + h + 1 > r.y
    );
    if (overlaps) continue;

    rooms.push({ x, y, w, h });
    for (let ry = y; ry < y + h; ry++) {
      for (let rx = x; rx < x + w; rx++) {
        map[ry][rx] = { type: "floor", visible: false, explored: false, emoji: "  " };
      }
    }
  }

  // Connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    const prev = rooms[i - 1];
    const curr = rooms[i];
    const cx1 = Math.floor(prev.x + prev.w / 2);
    const cy1 = Math.floor(prev.y + prev.h / 2);
    const cx2 = Math.floor(curr.x + curr.w / 2);
    const cy2 = Math.floor(curr.y + curr.h / 2);

    let x = cx1, y = cy1;
    while (x !== cx2) {
      if (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W) {
        map[y][x] = { type: "floor", visible: false, explored: false, emoji: "  " };
      }
      x += x < cx2 ? 1 : -1;
    }
    while (y !== cy2) {
      if (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W) {
        map[y][x] = { type: "floor", visible: false, explored: false, emoji: "  " };
      }
      y += y < cy2 ? 1 : -1;
    }
  }

  // Place player in first room
  const firstRoom = rooms[0];
  const playerPos = { x: firstRoom.x + 1, y: firstRoom.y + 1 };

  // Place stairs in last room
  const lastRoom = rooms[rooms.length - 1];
  const stairsPos = { x: lastRoom.x + lastRoom.w - 1, y: lastRoom.y + lastRoom.h - 1 };
  map[stairsPos.y][stairsPos.x] = { type: "stairs", visible: false, explored: false, emoji: "🪜" };

  // Place items
  const floors: Position[] = [];
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (map[y][x].type === "floor" && !(x === playerPos.x && y === playerPos.y) && !(x === stairsPos.x && y === stairsPos.y)) {
        floors.push({ x, y });
      }
    }
  }

  // Shuffle floors
  for (let i = floors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [floors[i], floors[j]] = [floors[j], floors[i]];
  }

  let floorIdx = 0;

  // Place gold
  const goldCount = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < goldCount && floorIdx < floors.length; i++) {
    const p = floors[floorIdx++];
    map[p.y][p.x] = { type: "gold", visible: false, explored: false, emoji: "💰" };
  }

  // Place potions
  const potionCount = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < potionCount && floorIdx < floors.length; i++) {
    const p = floors[floorIdx++];
    map[p.y][p.x] = { type: "potion", visible: false, explored: false, emoji: "🧪" };
  }

  // Place weapon (chance)
  if (Math.random() < 0.4 + level * 0.1 && floorIdx < floors.length) {
    const p = floors[floorIdx++];
    map[p.y][p.x] = { type: "weapon", visible: false, explored: false, emoji: "⚔️" };
  }

  // Place traps
  const trapCount = Math.min(level, 3);
  for (let i = 0; i < trapCount && floorIdx < floors.length; i++) {
    const p = floors[floorIdx++];
    map[p.y][p.x] = { type: "trap", visible: false, explored: false, emoji: "  " }; // Hidden!
  }

  // Place chests
  if (Math.random() < 0.3 && floorIdx < floors.length) {
    const p = floors[floorIdx++];
    map[p.y][p.x] = { type: "chest", visible: false, explored: false, emoji: "📦" };
  }

  // Place monsters
  const monsterCount = 2 + Math.min(level, 5);
  const monsters: Monster[] = [];
  for (let i = 0; i < monsterCount && floorIdx < floors.length; i++) {
    const p = floors[floorIdx++];
    const maxTier = Math.min(level + 1, MONSTER_TYPES.length);
    const mType = MONSTER_TYPES[Math.floor(Math.random() * maxTier)];
    monsters.push({ ...mType, x: p.x, y: p.y, hp: mType.hp + level });
  }

  return { map, playerPos, monsters, stairsPos };
}

function updateVisibility(map: Tile[][], px: number, py: number, radius: number = 3): Tile[][] {
  const newMap = map.map(row => row.map(t => ({ ...t, visible: false })));
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = px + dx, ny = py + dy;
      if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H) {
        if (Math.abs(dx) + Math.abs(dy) <= radius + 1) {
          newMap[ny][nx].visible = true;
          newMap[ny][nx].explored = true;
        }
      }
    }
  }
  return newMap;
}

export function NethackGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [game, setGame] = useState<GameState | null>(null);

  const initGame = useCallback(() => {
    const { map, playerPos, monsters } = generateMap(1);
    const visibleMap = updateVisibility(map, playerPos.x, playerPos.y);
    setGame({
      map: visibleMap,
      player: playerPos,
      hp: 30,
      maxHp: 30,
      gold: 0,
      level: 1,
      weapon: "Fists",
      weaponDmg: 2,
      potions: 1,
      messages: ["Welcome to the dungeon! Find the stairs 🪜 to go deeper.", "Use arrow keys or WASD to move. Press P to use potion."],
      monsters,
      turns: 0,
    });
    setPhase("playing");
  }, []);

  function addMessage(state: GameState, msg: string): GameState {
    return { ...state, messages: [msg, ...state.messages].slice(0, 8) };
  }

  function movePlayer(dx: number, dy: number) {
    if (!game || phase !== "playing") return;

    const nx = game.player.x + dx;
    const ny = game.player.y + dy;

    if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) return;
    if (game.map[ny][nx].type === "wall") return;

    // Check for monster at destination
    const monsterIdx = game.monsters.findIndex(m => m.x === nx && m.y === ny && m.hp > 0);
    if (monsterIdx !== -1) {
      // Attack monster
      const monster = { ...game.monsters[monsterIdx] };
      const dmg = Math.max(1, game.weaponDmg + Math.floor(Math.random() * 3) - 1);
      monster.hp -= dmg;

      let newState = { ...game, monsters: [...game.monsters] };
      newState.monsters[monsterIdx] = monster;

      if (monster.hp <= 0) {
        const goldGain = 5 + Math.floor(Math.random() * 10);
        newState.gold += goldGain;
        newState = addMessage(newState, `⚔️ You slayed the ${monster.name}! +${goldGain} gold`);
        playGameSound("correct");
      } else {
        newState = addMessage(newState, `⚔️ You hit ${monster.name} for ${dmg}! (HP: ${monster.hp})`);
        // Monster attacks back
        const monsterDmg = Math.max(1, monster.attack + Math.floor(Math.random() * 2) - 1);
        newState.hp -= monsterDmg;
        newState = addMessage(newState, `${monster.emoji} ${monster.name} hits you for ${monsterDmg}!`);
        playGameSound("wrong");
      }

      if (newState.hp <= 0) {
        newState.hp = 0;
        newState = addMessage(newState, "☠️ You have perished in the dungeon...");
        setGame(newState);
        setPhase("result");
        return;
      }

      newState.turns++;
      setGame(newState);
      return;
    }

    // Move to new position
    let newState: GameState = { ...game, player: { x: nx, y: ny }, turns: game.turns + 1 };
    const tile = newState.map[ny][nx];

    switch (tile.type) {
      case "gold": {
        const amount = 10 + Math.floor(Math.random() * 15);
        newState.gold += amount;
        newState = addMessage(newState, `💰 Found ${amount} gold!`);
        playGameSound("correct");
        break;
      }
      case "potion":
        newState.potions++;
        newState = addMessage(newState, "🧪 Found a healing potion!");
        playGameSound("correct");
        break;
      case "weapon": {
        const nextWeapon = WEAPONS.find(w => w.dmg > newState.weaponDmg) || WEAPONS[WEAPONS.length - 1];
        if (nextWeapon.dmg > newState.weaponDmg) {
          newState.weapon = nextWeapon.name;
          newState.weaponDmg = nextWeapon.dmg;
          newState = addMessage(newState, `${nextWeapon.emoji} Found a ${nextWeapon.name}! (DMG: ${nextWeapon.dmg})`);
          playGameSound("correct");
        } else {
          newState = addMessage(newState, "You already have the best weapon!");
        }
        break;
      }
      case "trap": {
        const trapDmg = 3 + Math.floor(Math.random() * 4);
        newState.hp -= trapDmg;
        newState = addMessage(newState, `🪤 Stepped on a trap! -${trapDmg} HP`);
        playGameSound("wrong");
        if (newState.hp <= 0) {
          newState.hp = 0;
          newState = addMessage(newState, "☠️ The trap was fatal...");
          setGame(newState);
          setPhase("result");
          return;
        }
        break;
      }
      case "chest": {
        const chestGold = 20 + Math.floor(Math.random() * 30);
        newState.gold += chestGold;
        newState = addMessage(newState, `📦 Opened a chest! +${chestGold} gold!`);
        playGameSound("correct");
        break;
      }
      case "stairs": {
        // Go to next level
        const nextLevel = newState.level + 1;
        const { map, playerPos, monsters } = generateMap(nextLevel);
        const visibleMap = updateVisibility(map, playerPos.x, playerPos.y);
        newState = {
          ...newState,
          map: visibleMap,
          player: playerPos,
          level: nextLevel,
          monsters,
          maxHp: newState.maxHp + 5,
          hp: Math.min(newState.hp + 10, newState.maxHp + 5),
        };
        newState = addMessage(newState, `🪜 Descended to level ${nextLevel}! (+10 HP healed)`);
        playGameSound("correct");
        setGame(newState);
        return;
      }
      default:
        break;
    }

    // Clear the tile after pickup
    if (["gold", "potion", "weapon", "trap", "chest"].includes(tile.type)) {
      newState.map = newState.map.map(row => row.map(t => ({ ...t })));
      newState.map[ny][nx] = { type: "floor", visible: true, explored: true, emoji: "  " };
    }

    // Update visibility
    newState.map = updateVisibility(newState.map, nx, ny);

    // Monster turns - move toward player
    newState.monsters = newState.monsters.map(m => {
      if (m.hp <= 0) return m;
      const dist = Math.abs(m.x - nx) + Math.abs(m.y - ny);
      if (dist > 5) return m; // Too far to notice
      if (dist <= 1) {
        // Attack player
        const dmg = Math.max(1, m.attack + Math.floor(Math.random() * 2) - 1);
        newState.hp -= dmg;
        newState = addMessage(newState, `${m.emoji} ${m.name} hits you for ${dmg}!`);
        return m;
      }
      // Move toward player
      let mdx = 0, mdy = 0;
      if (Math.random() < 0.6) {
        mdx = nx > m.x ? 1 : nx < m.x ? -1 : 0;
        mdy = ny > m.y ? 1 : ny < m.y ? -1 : 0;
        if (Math.abs(mdx) + Math.abs(mdy) > 1) {
          if (Math.random() < 0.5) mdx = 0; else mdy = 0;
        }
      }
      const nmx = m.x + mdx, nmy = m.y + mdy;
      if (nmx >= 0 && nmx < MAP_W && nmy >= 0 && nmy < MAP_H &&
          newState.map[nmy][nmx].type !== "wall" &&
          !(nmx === nx && nmy === ny) &&
          !newState.monsters.some(other => other !== m && other.hp > 0 && other.x === nmx && other.y === nmy)) {
        return { ...m, x: nmx, y: nmy };
      }
      return m;
    });

    if (newState.hp <= 0) {
      newState.hp = 0;
      newState = addMessage(newState, "☠️ You have perished...");
      setGame(newState);
      setPhase("result");
      return;
    }

    setGame(newState);
  }

  function usePotion() {
    if (!game || game.potions <= 0 || phase !== "playing") return;
    const heal = 10 + Math.floor(Math.random() * 5);
    const newHp = Math.min(game.hp + heal, game.maxHp);
    let newState = { ...game, hp: newHp, potions: game.potions - 1 };
    newState = addMessage(newState, `🧪 Used potion! Healed ${newHp - game.hp} HP`);
    setGame(newState);
  }

  // Keyboard handler
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (phase !== "playing") return;
      switch (e.key) {
        case "ArrowUp": case "w": case "W": e.preventDefault(); movePlayer(0, -1); break;
        case "ArrowDown": case "s": case "S": e.preventDefault(); movePlayer(0, 1); break;
        case "ArrowLeft": case "a": case "A": e.preventDefault(); movePlayer(-1, 0); break;
        case "ArrowRight": case "d": case "D": e.preventDefault(); movePlayer(1, 0); break;
        case "p": case "P": usePotion(); break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const hpPercent = game ? (game.hp / game.maxHp) * 100 : 100;

  return (
    <GameShell title="Nethack" onExit={onExit} headline="A roguelike dungeon adventure!">
      {phase === "instructions" && (
        <Instructions
          title="How to play Nethack 🏰"
          bullets={[
            "Explore dark dungeons – only nearby tiles are visible",
            "Use Arrow keys or WASD to move your hero 🧙",
            "Fight monsters by walking into them ⚔️",
            "Collect gold 💰, potions 🧪, and weapons ⚔️",
            "Find the stairs 🪜 to descend deeper",
            "Press P to drink a healing potion",
            "Survive as long as you can – how deep can you go?",
          ]}
          onStart={initGame}
          startLabel="Enter the Dungeon 🏰"
        />
      )}

      {(phase === "playing" || phase === "result") && game && (
        <div className="nethack-game">
          {/* Stats Bar */}
          <div className="nethack-stats">
            <div className="nethack-hp-bar">
              <div className="nethack-hp-fill" style={{ width: `${hpPercent}%` }} />
              <span className="nethack-hp-text">❤️ {game.hp}/{game.maxHp}</span>
            </div>
            <span className="nethack-stat">🏰 Lv.{game.level}</span>
            <span className="nethack-stat">💰 {game.gold}</span>
            <span className="nethack-stat">{WEAPONS.find(w => w.name === game.weapon)?.emoji || "👊"} {game.weapon}</span>
            <button type="button" className="nethack-potion-btn" onClick={usePotion} disabled={game.potions === 0 || phase !== "playing"}>
              🧪 ×{game.potions}
            </button>
          </div>

          {phase === "result" && (
            <div className="nethack-result-banner">
              <p>☠️ Game Over – You reached Level {game.level} with {game.gold} gold in {game.turns} turns</p>
              <button type="button" className="btn btn-primary" onClick={initGame}>Try Again</button>
            </div>
          )}

          {/* Map */}
          <div className="nethack-map" style={{ gridTemplateColumns: `repeat(${MAP_W}, 1fr)` }}>
            {game.map.map((row, y) =>
              row.map((tile, x) => {
                const isPlayer = x === game.player.x && y === game.player.y;
                const monster = game.monsters.find(m => m.x === x && m.y === y && m.hp > 0);
                const isVisible = tile.visible;
                const isExplored = tile.explored;

                let content = "";
                let cellClass = "nethack-tile";

                if (isPlayer) {
                  content = "🧙";
                  cellClass += " is-player";
                } else if (monster && isVisible) {
                  content = monster.emoji;
                  cellClass += " is-monster";
                } else if (isVisible) {
                  if (tile.type === "wall") { content = "⬛"; cellClass += " is-wall"; }
                  else if (tile.type === "stairs") content = "🪜";
                  else if (tile.type === "gold") content = "💰";
                  else if (tile.type === "potion") content = "🧪";
                  else if (tile.type === "weapon") content = "⚔️";
                  else if (tile.type === "chest") content = "📦";
                  else if (tile.type === "door") content = "🚪";
                  else { content = "·"; cellClass += " is-floor"; }
                } else if (isExplored) {
                  if (tile.type === "wall") { content = "▪"; cellClass += " is-fog"; }
                  else { content = "·"; cellClass += " is-fog"; }
                } else {
                  content = " ";
                  cellClass += " is-dark";
                }

                return (
                  <div key={`${y}-${x}`} className={cellClass}>
                    {content}
                  </div>
                );
              })
            )}
          </div>

          {/* Controls for mobile */}
          <div className="nethack-controls">
            <div className="nethack-dpad">
              <button type="button" className="nethack-dir nethack-up" onClick={() => movePlayer(0, -1)} disabled={phase !== "playing"}>↑</button>
              <div className="nethack-dpad-mid">
                <button type="button" className="nethack-dir nethack-left" onClick={() => movePlayer(-1, 0)} disabled={phase !== "playing"}>←</button>
                <span className="nethack-dir-center">🧙</span>
                <button type="button" className="nethack-dir nethack-right" onClick={() => movePlayer(1, 0)} disabled={phase !== "playing"}>→</button>
              </div>
              <button type="button" className="nethack-dir nethack-down" onClick={() => movePlayer(0, 1)} disabled={phase !== "playing"}>↓</button>
            </div>
          </div>

          {/* Message Log */}
          <div className="nethack-log">
            {game.messages.map((msg, i) => (
              <p key={i} className="nethack-msg" style={{ opacity: 1 - i * 0.12 }}>{msg}</p>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
