import { weaponById } from "./content";
import type { RunStats } from "./save";
import type { Hud, Session } from "./engine-state";

export function takeResult(session: Session): { win: boolean; stats: RunStats } | null {
  if (!session.resultReady || session.reported) return null;
  session.reported = true;
  const stats = session.stats;
  return {
    win: session.ending === "win",
    stats: {
      ...stats,
      kinds: { ...stats.kinds },
      found: stats.found.slice(),
    },
  };
}

export function readHud(session: Session): Hud {
  const stage = session.stage;
  const missions = stage.missions.map((mission) => {
    let state: "done" | "fail" | "open" = "open";
    if (mission.type === "clear") state = session.stats.bossDown ? "done" : "open";
    else if (mission.type === "kills") state = session.stats.kills >= (mission.n ?? 1) ? "done" : "open";
    else if (mission.type === "pickups") state = session.stats.pickups >= (mission.n ?? 1) ? "done" : "open";
    else if (mission.type === "kind") state = (session.stats.kinds[mission.kind ?? "grunt"] ?? 0) >= (mission.n ?? 1) ? "done" : "open";
    else state = session.stats.deaths > 0 ? "fail" : session.stats.bossDown ? "done" : "open";
    return { text: mission.text, state };
  });
  const objective = missions.find((mission) => mission.state === "open")?.text ?? "Sector bajo control";
  const boss = session.enemies.find((enemy) => enemy.boss);
  return {
    hp: Math.max(0, session.player.hp),
    maxHp: session.player.maxHp,
    lives: session.lives,
    weapon: weaponById(session.player.weapon).name,
    weaponId: session.player.weapon,
    bossName: boss ? stage.boss : "",
    bossHp: boss ? Math.max(0, boss.hp) : 0,
    bossMax: boss ? boss.maxHp : 0,
    progress: Math.max(0, Math.min(1, session.player.x / stage.length)),
    paused: session.paused,
    objective,
    missions,
    combo: session.combo,
    grenades: session.player.grenades,
    country: stage.country,
    place: stage.place,
  };
}

