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

const GRAV = 1650;
const MAX_FALL = 900;
