import {
  GROUND,
  characterById,
  stageById,
  type CharacterId,
  type Stage,
  type WeaponId,
} from "./content";
import { setMood, sfxDeath, sfxExplosion, sfxHit, sfxHurt, sfxWin } from "./audio";
import { emptyStats } from "./save";
import {
  GRAV,
  VIEW_H,
  VIEW_W,
  focus,
  type Boom,
  type Bullet,
  type Enemy,
  type Input,
  type Session,
  type Solid,
} from "./engine-state";

export function segmentAt(stage: Stage, x: number) {
  for (const ground of stage.grounds) {
    if (x >= ground.x && x <= ground.x + ground.w) return ground;
  }
  return null;
}

export function createSession(stageId: string, characterId: CharacterId, weapon: WeaponId, arsenal: WeaponId[], shake: boolean): Session {
  const stage = stageById(stageId);
  const character = characterById(characterId);
  const solids: Solid[] = [
    { x: -120, y: -400, w: 120, h: 1400, oneWay: false },
    { x: stage.length, y: -400, w: 120, h: 1400, oneWay: false },
  ];
  for (const ground of stage.grounds) {
    solids.push({ x: ground.x, y: GROUND, w: ground.w, h: 420, oneWay: false });
  }
  for (const plat of stage.platforms) {
    solids.push({ x: plat.x, y: plat.y, w: plat.w, h: 16, oneWay: true });
  }
  const amb = Array.from({ length: 28 }, () => ({
    x: Math.random() * VIEW_W,
    y: Math.random() * VIEW_H,
    s: 1 + Math.random() * 2.2,
    v: 20 + Math.random() * 50,
  }));
  const session: Session = {
    stage,
    character,
    player: {
      x: 170,
      y: GROUND,
      vx: 0,
      vy: 0,
      w: 28,
      facing: 1,
      hp: character.hp,
      maxHp: character.hp,
      onGround: true,
      coyote: 0.12,
      buf: 0,
      air: character.doubleJump ? 1 : 0,
      wasJump: false,
      invuln: 1.15,
      shootCd: 0,
      anim: 0,
      crouch: false,
      weapon: arsenal.includes(weapon) ? weapon : arsenal[0] ?? "fusil",
      shots: 0,
      grenades: 3,
    },
    lives: 3,
    bullets: [],
    enemies: [],
    pickups: stage.pickups.map((pickup) => ({ ...pickup, taken: false })),
    solids,
    spawned: stage.spawns.map(() => false),
    particles: [],
    floaters: [],
    booms: [],
    cam: 0,
    time: 0,
    trauma: 0,
    hitstop: 0,
    flash: 0,
    muzzle: 0,
    muzzleX: 0,
    muzzleY: 0,
    muzzleFlip: false,
    combo: 0,
    comboT: 0,
    checkpoint: 170,
    reached: 170,
    arena: false,
    lockL: 0,
    lockR: stage.length,
    ending: null,
    endTimer: 0,
    resultReady: false,
    reported: false,
    paused: false,
    wasPause: false,
    wasWeapon: false,
    wasGrenade: false,
    shootGrace: 0,
    arsenal: arsenal.length > 0 ? arsenal.slice() : ["fusil"],
    stats: emptyStats(),
    shake,
    nextId: 1,
    amb,
  };
  focus.session = session;
  setMood("fight");
  return session;
}

export function destroySession(session: Session) {
  if (focus.session === session) focus.session = null;
  setMood("menu");
}

export function togglePause(session: Session) {
  if (session.ending) return;
  session.paused = !session.paused;
}

export function bodyH(session: Session) {
  return session.player.crouch ? 40 : 58;
}

export function rectOf(x: number, feet: number, w: number, h: number) {
  return { l: x - w / 2, r: x + w / 2, t: feet - h, b: feet };
}

export function overlap(a: { l: number; r: number; t: number; b: number }, s: Solid) {
  return a.l < s.x + s.w && a.r > s.x && a.t < s.y + s.h && a.b > s.y;
}

export function burst(session: Session, x: number, y: number, color: string, n: number, speed: number) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = speed * (0.4 + Math.random());
    session.particles.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 30,
      life: 0.25 + Math.random() * 0.35,
      max: 0.6,
      color,
      size: 2 + Math.random() * 3,
      g: 400,
    });
  }
  if (session.particles.length > 180) session.particles.splice(0, session.particles.length - 180);
}

export function floatText(session: Session, x: number, y: number, text: string) {
  session.floaters.push({ x, y, text, life: 0.7 });
  if (session.floaters.length > 24) session.floaters.shift();
}

export function hurtEnemy(session: Session, enemy: Enemy, dmg: number) {
  if (enemy.hp <= 0) return;
  enemy.hp -= dmg;
  enemy.hurt = 0.08;
  session.hitstop = Math.max(session.hitstop, enemy.boss ? 0.045 : 0.02);
  session.trauma = Math.min(1, session.trauma + (enemy.boss ? 0.18 : 0.08));
  floatText(session, enemy.x, enemy.y - enemy.h - 8, String(Math.round(dmg)));
  sfxHit();
  if (enemy.hp <= 0) killEnemy(session, enemy);
}

export function killEnemy(session: Session, enemy: Enemy) {
  if (enemy.hp > 0) enemy.hp = 0;
  enemy.hurt = 0;
  session.stats.kills += 1;
  session.stats.kinds[enemy.kind] = (session.stats.kinds[enemy.kind] ?? 0) + 1;
  if (session.comboT > 0) session.combo += 1;
  else session.combo = 1;
  session.comboT = 1.6;
  session.stats.maxCombo = Math.max(session.stats.maxCombo, session.combo);
  session.booms.push({ x: enemy.x, y: enemy.y - enemy.h * 0.45, t: 0, size: enemy.boss ? 150 : 70 });
  burst(session, enemy.x, enemy.y - enemy.h / 2, enemy.boss ? "#e6b15a" : "#e23b2b", enemy.boss ? 28 : 10, enemy.boss ? 220 : 140);
  sfxExplosion();
  session.trauma = Math.min(1, session.trauma + (enemy.boss ? 0.7 : 0.16));
  if (enemy.boss) {
    session.stats.bossDown = true;
    session.ending = "win";
    session.endTimer = 1.2;
    session.hitstop = 0.08;
    session.player.invuln = 2;
    sfxWin();
    setMood("menu");
  }
}

export function splash(session: Session, x: number, y: number, radius: number, dmg: number) {
  for (const enemy of session.enemies) {
    if (enemy.hp <= 0) continue;
    const cx = enemy.x;
    const cy = enemy.y - enemy.h / 2;
    const dist = Math.hypot(cx - x, cy - y);
    if (dist < radius) hurtEnemy(session, enemy, dmg * (1 - dist / radius));
  }
  session.booms.push({ x, y, t: 0, size: radius * 1.4 });
  burst(session, x, y, "#ffb15a", 16, 180);
  sfxExplosion();
  session.trauma = Math.min(1, session.trauma + 0.45);
}

export function hurtPlayer(session: Session, dmg: number, fromX: number) {
  const player = session.player;
  if (player.invuln > 0 || session.ending) return;
  player.hp -= dmg * session.character.armor;
  player.invuln = 0.9;
  player.vy = -220;
  player.vx = Math.sign(player.x - fromX) * 160 || -player.facing * 160;
  session.trauma = Math.min(1, session.trauma + 0.45);
  session.hitstop = Math.max(session.hitstop, 0.05);
  session.flash = 0.25;
  sfxHurt();
  try {
    navigator.vibrate?.(18);
  } catch {
    /* ignore */
  }
  if (player.hp <= 0) downPlayer(session);
}

export function downPlayer(session: Session) {
  if (session.ending) return;
  session.stats.deaths += 1;
  session.lives -= 1;
  sfxDeath();
  session.trauma = 1;
  session.hitstop = 0.1;
  session.flash = 0.35;
  if (session.lives <= 0) {
    session.player.hp = 0;
    session.ending = "lose";
    session.endTimer = 0.75;
    setMood("menu");
    return;
  }
  session.player.x = session.checkpoint;
  session.player.y = GROUND;
  session.player.vx = 0;
  session.player.vy = 0;
  session.player.hp = session.player.maxHp;
  session.player.grenades = 3;
  session.player.invuln = 1.5;
  session.player.onGround = true;
  session.bullets = session.bullets.filter((bullet) => bullet.side !== "e");
}

export function fire(session: Session, x: number, y: number, ax: number, ay: number, spread: number, spec: {
  dmg: number;
  speed: number;
  life: number;
  r: number;
  pierce: number;
  splash: number;
  kind: Bullet["kind"];
  side: "p" | "e";
}) {
  const angle = Math.atan2(ay, ax) + spread;
  session.bullets.push({
    x,
    y,
    vx: Math.cos(angle) * spec.speed,
    vy: Math.sin(angle) * spec.speed,
    life: spec.life,
    r: spec.r,
    dmg: spec.dmg,
    side: spec.side,
    kind: spec.kind,
    pierce: spec.pierce,
    splash: spec.splash,
    hits: [],
  });
  if (session.bullets.length > 80) session.bullets.splice(0, session.bullets.length - 80);
}

export function aimOf(session: Session, input: Input) {
  const player = session.player;
  let ax: number = player.facing;
  let ay = 0;
  const moving = input.left || input.right;
  if (input.up && !input.down) {
    ay = -1;
    ax = moving ? player.facing : 0;
  } else if (input.down && !player.onGround) {
    ay = 1;
    ax = moving ? player.facing : 0;
  }
  if (ax === 0 && ay === 0) ax = player.facing;
  const mag = Math.hypot(ax, ay) || 1;
  return { x: ax / mag, y: ay / mag };
}

export function spawnEnemy(session: Session, index: number) {
  const spawn = session.stage.spawns[index];
  const scale = 1 + STAGES_INDEX(session) * 0.14;
  const ground = segmentAt(session.stage, spawn.x);
  const left = ground ? ground.x + 28 : spawn.x - 80;
  const right = ground ? ground.x + ground.w - 28 : spawn.x + 80;
  const boss = spawn.kind === "boss";
  const base =
    spawn.kind === "boss"
      ? { w: 108, h: 104, hp: 420, speed: 46 }
      : spawn.kind === "turret"
        ? { w: 52, h: 44, hp: 50, speed: 0 }
        : spawn.kind === "flyer"
          ? { w: 46, h: 34, hp: 26, speed: 120 }
          : spawn.kind === "hopper"
            ? { w: 32, h: 52, hp: 32, speed: 90 }
            : { w: 32, h: 56, hp: 36, speed: 78 };
  const enemy: Enemy = {
    id: session.nextId++,
    kind: spawn.kind,
    x: spawn.x,
    y: spawn.kind === "flyer" ? spawn.y ?? 220 : GROUND,
    vx: 0,
    vy: 0,
    w: base.w,
    h: boss ? base.h : base.h,
    hp: base.hp * scale,
    maxHp: base.hp * scale,
    facing: -1,
    cd: 0.6 + Math.random() * 0.5,
    left: spawn.kind === "flyer" ? spawn.x - 180 : left,
    right: spawn.kind === "flyer" ? spawn.x + 180 : right,
    onGround: spawn.kind !== "flyer",
    hurt: 0,
    flame: 0,
    touch: 0,
    boss,
    t: Math.random() * 4,
  };
  if (boss) {
    enemy.left = Math.max(left, spawn.x - 220);
    enemy.right = Math.min(right, spawn.x + 80);
  }
  session.enemies.push(enemy);
}

export function STAGES_INDEX(session: Session) {
  return ["mexico", "colombia", "brasil", "egipto", "japon", "rusia"].indexOf(session.stage.id);
}

export function shootEnemy(session: Session, enemy: Enemy, speed: number, dmg: number, aimed: boolean) {
  const scale = 1 + STAGES_INDEX(session) * 0.08;
  const ox = enemy.x + enemy.facing * enemy.w * 0.4;
  const oy = enemy.y - enemy.h * 0.62;
  if (!aimed) {
    fire(session, ox, oy, enemy.facing, 0, (Math.random() - 0.5) * 0.08, {
      dmg: dmg * scale,
      speed,
      life: 1.6,
      r: 5,
      pierce: 0,
      splash: 0,
      kind: "enemy",
      side: "e",
    });
    return;
  }
  const tx = session.player.x - ox;
  const ty = session.player.y - bodyH(session) * 0.6 - oy;
  const mag = Math.hypot(tx, ty) || 1;
  fire(session, ox, oy, tx / mag, ty / mag, 0, {
    dmg: dmg * scale,
    speed,
    life: 1.8,
    r: 5,
    pierce: 0,
    splash: 0,
    kind: "enemy",
    side: "e",
  });
}

