import {
  GROUND,
  characterById,
  stageById,
  weaponById,
  type Character,
  type CharacterId,
  type SpawnKind,
  type Stage,
  type Weapon,
  type WeaponId,
} from "./content";
import {
  setMood,
  sfxDeath,
  sfxExplosion,
  sfxHit,
  sfxHurt,
  sfxJump,
  sfxPickup,
  sfxShoot,
  sfxWin,
} from "./audio";
import { bgImage, drawSheet } from "./sprites";
import { emptyStats, type RunStats } from "./save";

export const VIEW_W = 960;
export const VIEW_H = 540;

export const GRAV = 1650;
export const MAX_FALL = 900;

export type Solid = { x: number; y: number; w: number; h: number; oneWay: boolean };

export type Bullet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  r: number;
  dmg: number;
  side: "p" | "e";
  kind: Weapon["kind"] | "enemy" | "grenade";
  pierce: number;
  splash: number;
  hits: number[];
};

export type Enemy = {
  id: number;
  kind: SpawnKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  cd: number;
  left: number;
  right: number;
  onGround: boolean;
  hurt: number;
  flame: number;
  touch: number;
  boss: boolean;
  t: number;
};

export type Pickup = {
  kind: WeaponId | "med";
  x: number;
  y: number;
  taken: boolean;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  g: number;
};

export type Floater = { x: number; y: number; text: string; life: number };
export type Boom = { x: number; y: number; t: number; size: number };

export type Input = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  shoot: boolean;
  weapon: boolean;
  grenade: boolean;
  pause: boolean;
};

export type Hud = {
  hp: number;
  maxHp: number;
  lives: number;
  weapon: string;
  weaponId: WeaponId;
  bossName: string;
  bossHp: number;
  bossMax: number;
  progress: number;
  paused: boolean;
  objective: string;
  missions: { text: string; state: "done" | "fail" | "open" }[];
  combo: number;
  grenades: number;
  country: string;
  place: string;
};

export type Session = {
  stage: Stage;
  character: Character;
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    w: number;
    facing: 1 | -1;
    hp: number;
    maxHp: number;
    onGround: boolean;
    coyote: number;
    buf: number;
    air: number;
    wasJump: boolean;
    invuln: number;
    shootCd: number;
    anim: number;
    crouch: boolean;
    weapon: WeaponId;
    shots: number;
    grenades: number;
  };
  lives: number;
  bullets: Bullet[];
  enemies: Enemy[];
  pickups: Pickup[];
  solids: Solid[];
  spawned: boolean[];
  particles: Particle[];
  floaters: Floater[];
  booms: Boom[];
  cam: number;
  time: number;
  trauma: number;
  hitstop: number;
  flash: number;
  muzzle: number;
  muzzleX: number;
  muzzleY: number;
  muzzleFlip: boolean;
  combo: number;
  comboT: number;
  checkpoint: number;
  reached: number;
  arena: boolean;
  lockL: number;
  lockR: number;
  ending: "win" | "lose" | null;
  endTimer: number;
  resultReady: boolean;
  reported: boolean;
  paused: boolean;
  wasPause: boolean;
  wasWeapon: boolean;
  wasGrenade: boolean;
  shootGrace: number;
  arsenal: WeaponId[];
  stats: RunStats;
  shake: boolean;
  nextId: number;
  amb: { x: number; y: number; s: number; v: number }[];
};

export const touch = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  shoot: false,
  weapon: false,
  grenade: false,
};

export const held = new Set<string>();
export const focus: { session: Session | null } = { session: null };

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getX: () => number;
      getY: () => number;
      getHp: () => number;
      getLives: () => number;
      setKeys: (codes: string[]) => void;
    };
  }
}

export function installProbe() {
  window.__controlsTest = {
    getX: () => focus.session?.player.x ?? 0,
    getSpeed: () => focus.session?.player.vx ?? 0,
    getYaw: () => (focus.session?.player.facing === -1 ? Math.PI : 0),
    getY: () => focus.session?.player.y ?? 0,
    getHp: () => focus.session?.player.hp ?? 0,
    getLives: () => focus.session?.lives ?? 0,
    setKeys: (codes: string[]) => {
      held.clear();
      for (const code of codes) held.add(code);
    },
  };
}

export function bindKeyboard(target: Window) {
  const block = new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
  const down = (event: KeyboardEvent) => {
    if (block.has(event.code)) event.preventDefault();
    held.add(event.code);
  };
  const up = (event: KeyboardEvent) => held.delete(event.code);
  const blur = () => held.clear();
  target.addEventListener("keydown", down);
  target.addEventListener("keyup", up);
  target.addEventListener("blur", blur);
  return () => {
    target.removeEventListener("keydown", down);
    target.removeEventListener("keyup", up);
    target.removeEventListener("blur", blur);
    held.clear();
    touch.left = touch.right = touch.up = touch.down = false;
    touch.jump = touch.shoot = touch.weapon = touch.grenade = false;
  };
}

export function sample(): Input {
  return {
    left: held.has("KeyA") || held.has("ArrowLeft") || touch.left,
    right: held.has("KeyD") || held.has("ArrowRight") || touch.right,
    up: held.has("KeyW") || held.has("ArrowUp") || touch.up,
    down: held.has("KeyS") || held.has("ArrowDown") || touch.down,
    jump: held.has("Space") || held.has("KeyK") || held.has("KeyZ") || touch.jump,
    shoot: held.has("KeyJ") || held.has("KeyX") || touch.shoot,
    weapon: held.has("KeyQ") || touch.weapon,
    grenade: held.has("KeyG") || touch.grenade,
    pause: held.has("Escape") || held.has("KeyP"),
  };
}

