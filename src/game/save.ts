import {
  CHARACTERS,
  LEVEL_XP,
  STAGES,
  WEAPONS,
  characterById,
  levelFromXp,
  weaponById,
  type CharacterId,
  type Mission,
  type SpawnKind,
  type WeaponId,
} from "./content";

export const SAVE_KEY = "linea-de-fuego-v1";

export type RunStats = {
  kills: number;
  kinds: Partial<Record<SpawnKind, number>>;
  pickups: number;
  deaths: number;
  bossDown: boolean;
  time: number;
  maxCombo: number;
  found: WeaponId[];
};

export type Save = {
  version: 1;
  xp: number;
  characterId: CharacterId;
  weaponId: WeaponId;
  cleared: string[];
  stars: Record<string, number>;
  found: WeaponId[];
  sound: boolean;
  shake: boolean;
};

export function defaultSave(): Save {
  return {
    version: 1,
    xp: 0,
    characterId: "rico",
    weaponId: "fusil",
    cleared: [],
    stars: {},
    found: [],
    sound: true,
    shake: true,
  };
}

export function emptyStats(): RunStats {
  return {
    kills: 0,
    kinds: {},
    pickups: 0,
    deaths: 0,
    bossDown: false,
    time: 0,
    maxCombo: 0,
    found: [],
  };
}

function isWeapon(id: unknown): id is WeaponId {
  return typeof id === "string" && WEAPONS.some((w) => w.id === id);
}

function isCharacter(id: unknown): id is CharacterId {
  return typeof id === "string" && CHARACTERS.some((c) => c.id === id);
}

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<Save>;
    if (parsed.version !== 1) return defaultSave();
    const base = defaultSave();
    const characterId = isCharacter(parsed.characterId) ? parsed.characterId : base.characterId;
    const weaponId = isWeapon(parsed.weaponId) ? parsed.weaponId : base.weaponId;
    const found = Array.isArray(parsed.found) ? parsed.found.filter((id) => isWeapon(id)) : [];
    const cleared = Array.isArray(parsed.cleared) ? parsed.cleared.filter((id) => STAGES.some((s) => s.id === id)) : [];
    const stars: Record<string, number> = {};
    if (parsed.stars && typeof parsed.stars === "object") {
      for (const stage of STAGES) {
        const value = parsed.stars[stage.id];
        if (typeof value === "number" && Number.isFinite(value)) stars[stage.id] = Math.max(0, Math.min(3, Math.floor(value)));
      }
    }
    return {
      version: 1,
      xp: typeof parsed.xp === "number" && parsed.xp >= 0 ? Math.floor(parsed.xp) : 0,
      characterId,
      weaponId,
      cleared,
      stars,
      found,
      sound: parsed.sound !== false,
      shake: parsed.shake !== false,
    };
  } catch {
    return defaultSave();
  }
}

export function writeSave(save: Save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function weaponUnlocked(save: Save, id: WeaponId, level = levelFromXp(save.xp)): boolean {
  return level >= weaponById(id).unlock || save.found.includes(id);
}

export function charUnlocked(save: Save, id: CharacterId, level = levelFromXp(save.xp)): boolean {
  return level >= characterById(id).unlock;
}

export function stageOpen(save: Save, index: number): boolean {
  if (index <= 0) return true;
  return save.cleared.includes(STAGES[index - 1].id);
}

export function xpBounds(level: number): { start: number; next: number | null } {
  const index = Math.max(0, level - 1);
  const start = LEVEL_XP[index] ?? 0;
  const next = LEVEL_XP[index + 1] ?? null;
  return { start, next };
}

export function missionLive(mission: Mission, stats: RunStats): "done" | "fail" | "open" {
  switch (mission.type) {
    case "clear":
      return stats.bossDown ? "done" : "open";
    case "flawless":
      if (stats.deaths > 0) return "fail";
      return stats.bossDown ? "done" : "open";
    case "kills":
      return stats.kills >= (mission.n ?? 1) ? "done" : "open";
    case "pickups":
      return stats.pickups >= (mission.n ?? 1) ? "done" : "open";
    case "kind":
      return (stats.kinds[mission.kind ?? "grunt"] ?? 0) >= (mission.n ?? 1) ? "done" : "open";
  }
}

export function missionDone(mission: Mission, stats: RunStats, win: boolean): boolean {
  if (mission.type === "clear") return win;
  if (mission.type === "flawless") return win && stats.deaths === 0;
  return missionLive(mission, stats) === "done";
}

export function xpForRun(stats: RunStats, win: boolean, missionsDone: number): number {
  let xp = stats.kills * 8 + stats.maxCombo * 3;
  if (stats.bossDown) xp += 90;
  if (win) {
    xp += 70 + missionsDone * 40;
    if (stats.deaths === 0) xp += 35;
  } else {
    xp = Math.round(xp * 0.5);
  }
  return xp;
}

export function applyRun(save: Save, stageId: string, stats: RunStats, win: boolean) {
  const stage = STAGES.find((s) => s.id === stageId) ?? STAGES[0];
  const missions = stage.missions.map((mission) => ({
    id: mission.id,
    text: mission.text,
    done: missionDone(mission, stats, win),
  }));
  const doneCount = missions.filter((mission) => mission.done).length;
  const xp = xpForRun(stats, win, doneCount);
  const prevLevel = levelFromXp(save.xp);
  const nextXp = save.xp + xp;
  const nextLevel = levelFromXp(nextXp);
  const found = new Set(save.found);
  if (win) {
    for (const id of stats.found) found.add(id);
  }
  const unlocks: string[] = [];
  for (const character of CHARACTERS) {
    if (character.unlock > prevLevel && character.unlock <= nextLevel) unlocks.push(character.name);
  }
  for (const weapon of WEAPONS) {
    const had = prevLevel >= weapon.unlock || save.found.includes(weapon.id);
    const now = nextLevel >= weapon.unlock || found.has(weapon.id);
    if (!had && now) unlocks.push(weapon.name);
  }
  const stars = Math.max(save.stars[stageId] ?? 0, win ? doneCount : save.stars[stageId] ?? 0);
  const cleared = win ? Array.from(new Set([...save.cleared, stageId])) : save.cleared.slice();
  return {
    xp,
    unlocks,
    missions,
    levelBefore: prevLevel,
    levelAfter: nextLevel,
    save: {
      ...save,
      xp: nextXp,
      found: Array.from(found),
      cleared,
      stars: { ...save.stars, [stageId]: stars },
    } satisfies Save,
  };
}

export function arsenalOf(save: Save): WeaponId[] {
  return WEAPONS.filter((weapon) => weaponUnlocked(save, weapon.id)).map((weapon) => weapon.id);
}
