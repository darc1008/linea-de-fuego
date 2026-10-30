import { GROUND, weaponById } from "./content";
import { setMood, sfxPickup, sfxShoot } from "./audio";
import {
  STAGES_INDEX,
  aimOf,
  bodyH,
  burst,
  downPlayer,
  fire,
  floatText,
  hurtEnemy,
  hurtPlayer,
  rectOf,
  shootEnemy,
  spawnEnemy,
  splash,
} from "./engine-actors";
import { stepDecor } from "./engine-decor";
import { GRAV, MAX_FALL, VIEW_W, type Session } from "./engine-state";

export function stepField(session: Session, dt: number) {
  const player = session.player;
  const height = bodyH(session);
  for (let i = 0; i < session.stage.spawns.length; i++) {
    if (session.spawned[i]) continue;
    if (player.x > session.stage.spawns[i].x - 720) {
      session.spawned[i] = true;
      spawnEnemy(session, i);
    }
  }

  const scale = 1 + STAGES_INDEX(session) * 0.1;
  for (const enemy of session.enemies) {
    if (enemy.hp <= 0) continue;
    enemy.t += dt;
    enemy.hurt = Math.max(0, enemy.hurt - dt);
    enemy.flame = Math.max(0, enemy.flame - dt);
    enemy.touch = Math.max(0, enemy.touch - dt);
    enemy.cd -= dt;
    if (enemy.kind === "flyer") {
      enemy.facing = player.x < enemy.x ? -1 : 1;
      enemy.x += enemy.facing * 90 * dt;
      if (enemy.x < enemy.left || enemy.x > enemy.right) enemy.facing = enemy.x < enemy.left ? 1 : -1;
      const base = session.stage.spawns.find((s) => s.kind === "flyer" && Math.abs(s.x - enemy.left - 180) < 8);
      const home = base?.y ?? enemy.y;
      enemy.y = home + Math.sin(enemy.t * 3) * 22;
      if (enemy.cd <= 0 && Math.abs(player.x - enemy.x) < 460) {
        enemy.cd = 1.45;
        shootEnemy(session, enemy, 250, 9, true);
      }
    } else if (enemy.kind === "hopper") {
      enemy.vy = Math.min(MAX_FALL, enemy.vy + GRAV * dt);
      enemy.y += enemy.vy * dt;
      if (enemy.y >= GROUND) {
        enemy.y = GROUND;
        enemy.vy = 0;
        enemy.onGround = true;
      } else enemy.onGround = false;
      if (enemy.onGround && enemy.cd <= 0) {
        enemy.vy = -560;
        enemy.onGround = false;
        enemy.cd = 0.85 + Math.random() * 0.45;
        enemy.facing = player.x < enemy.x ? -1 : 1;
      }
      enemy.x += enemy.facing * 110 * dt;
      if (enemy.x < enemy.left) {
        enemy.x = enemy.left;
        enemy.facing = 1;
      }
      if (enemy.x > enemy.right) {
        enemy.x = enemy.right;
        enemy.facing = -1;
      }
    } else if (enemy.kind === "turret") {
      enemy.facing = player.x < enemy.x ? -1 : 1;
      if (enemy.cd <= 0 && Math.abs(player.x - enemy.x) < 560) {
        enemy.cd = 1.15 - scale * 0.05;
        shootEnemy(session, enemy, 300, 11, true);
      }
    } else if (enemy.kind === "boss") {
      const phase = enemy.hp < enemy.maxHp * 0.4 ? 2 : enemy.hp < enemy.maxHp * 0.72 ? 1 : 0;
      enemy.facing = player.x < enemy.x ? -1 : 1;
      enemy.x += enemy.facing * (36 + phase * 16) * dt;
      if (enemy.x < enemy.left) enemy.x = enemy.left;
      if (enemy.x > enemy.right) enemy.x = enemy.right;
      if (enemy.cd <= 0) {
        enemy.cd = phase === 2 ? 0.55 : phase === 1 ? 0.85 : 1.15;
        if (phase === 0) shootEnemy(session, enemy, 280, 11, true);
        else {
          shootEnemy(session, enemy, 280, 13, true);
          for (const spread of [-0.35, 0, 0.35]) {
            fire(session, enemy.x + enemy.facing * 40, enemy.y - 60, enemy.facing, 0, spread, {
              dmg: 10 * scale,
              speed: 260,
              life: 1.6,
              r: 5,
              pierce: 0,
              splash: 0,
              kind: "enemy",
              side: "e",
            });
          }
        }
      }
      if (!session.arena && player.x > enemy.x - 700) {
        session.arena = true;
        session.lockL = enemy.x - 640;
        session.lockR = enemy.x + 320;
        setMood("boss");
      }
    } else {
      const aggro = Math.abs(player.x - enemy.x) < 380 && Math.abs(player.y - enemy.y) < 80;
      if (aggro) enemy.facing = player.x < enemy.x ? -1 : 1;
      enemy.x += enemy.facing * (aggro ? 48 : 80) * dt;
      if (enemy.x < enemy.left) {
        enemy.x = enemy.left;
        enemy.facing = 1;
      }
      if (enemy.x > enemy.right) {
        enemy.x = enemy.right;
        enemy.facing = -1;
      }
      if (aggro && enemy.cd <= 0 && enemy.facing === (player.x < enemy.x ? -1 : 1)) {
        enemy.cd = 1.3;
        shootEnemy(session, enemy, 260, 9, false);
      }
    }

    const playerBox = rectOf(player.x, player.y, player.w, height);
    const enemyBox = rectOf(enemy.x, enemy.y, enemy.w, enemy.h);
    if (
      enemy.touch <= 0 &&
      playerBox.l < enemyBox.r &&
      playerBox.r > enemyBox.l &&
      playerBox.t < enemyBox.b &&
      playerBox.b > enemyBox.t
    ) {
      enemy.touch = 0.45;
      hurtPlayer(session, enemy.boss ? 16 : 10, enemy.x);
    }
  }

  for (let i = session.bullets.length - 1; i >= 0; i--) {
    const bullet = session.bullets[i];
    bullet.life -= dt;
    if (bullet.kind === "grenade") bullet.vy += 980 * dt;
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    let dead = bullet.life <= 0;
    if (!dead && bullet.kind !== "laser" && bullet.kind !== "flame") {
      for (const solid of session.solids) {
        if (solid.oneWay) continue;
        if (bullet.x >= solid.x && bullet.x <= solid.x + solid.w && bullet.y >= solid.y && bullet.y <= solid.y + solid.h) {
          dead = true;
          if (bullet.splash > 0) splash(session, bullet.x, bullet.y, bullet.splash, bullet.dmg);
          break;
        }
      }
    }
    if (!dead && bullet.side === "p") {
      for (const enemy of session.enemies) {
        if (enemy.hp <= 0) continue;
        const box = rectOf(enemy.x, enemy.y, enemy.w, enemy.h);
        if (bullet.x < box.l - bullet.r || bullet.x > box.r + bullet.r || bullet.y < box.t - bullet.r || bullet.y > box.b + bullet.r) continue;
        if (bullet.kind === "flame") {
          if (enemy.flame > 0) continue;
          enemy.flame = 0.1;
          hurtEnemy(session, enemy, bullet.dmg);
          continue;
        }
        if (bullet.hits.includes(enemy.id)) continue;
        bullet.hits.push(enemy.id);
        if (bullet.splash > 0) {
          splash(session, bullet.x, bullet.y, bullet.splash, bullet.dmg);
          dead = true;
          break;
        }
        hurtEnemy(session, enemy, bullet.dmg);
        if (bullet.kind === "laser" || bullet.pierce > 0) {
          bullet.pierce -= 1;
          if (bullet.pierce < 0) dead = true;
        } else dead = true;
        if (dead) break;
      }
    } else if (!dead && bullet.side === "e") {
      const box = rectOf(player.x, player.y, player.w, height);
      if (bullet.x > box.l && bullet.x < box.r && bullet.y > box.t && bullet.y < box.b) {
        hurtPlayer(session, bullet.dmg, bullet.x);
        dead = true;
      }
    }
    if (dead && bullet.splash > 0 && bullet.life <= 0) splash(session, bullet.x, bullet.y, bullet.splash * 0.7, bullet.dmg * 0.6);
    if (dead) session.bullets.splice(i, 1);
  }

  for (const pickup of session.pickups) {
    if (pickup.taken) continue;
    const dx = pickup.x - player.x;
    const dy = pickup.y - (player.y - height * 0.5);
    if (Math.hypot(dx, dy) < 36) {
      pickup.taken = true;
      if (pickup.kind === "med") {
        player.hp = Math.min(player.maxHp, player.hp + 40);
        player.grenades = Math.min(5, player.grenades + 1);
        session.stats.pickups += 1;
        floatText(session, pickup.x, pickup.y, "+SALUD");
      } else {
        player.weapon = pickup.kind;
        if (!session.arsenal.includes(pickup.kind)) session.arsenal.push(pickup.kind);
        if (!session.stats.found.includes(pickup.kind)) session.stats.found.push(pickup.kind);
        floatText(session, pickup.x, pickup.y, weaponById(pickup.kind).name);
      }
      sfxPickup();
      burst(session, pickup.x, pickup.y, "#e6b15a", 8, 80);
    }
  }

  session.reached = Math.max(session.reached, player.x);
  for (const mark of session.stage.checkpoints) {
    if (mark <= session.reached && mark > session.checkpoint - 40) session.checkpoint = mark;
  }
  let best = session.checkpoint;
  for (const mark of session.stage.checkpoints) {
    if (mark <= session.reached) best = mark;
  }
  session.checkpoint = best;

  const look = player.facing * 70;
  let targetCam = player.x - VIEW_W * 0.38 + look;
  if (session.arena) targetCam = Math.max(session.lockL, Math.min(session.lockR - VIEW_W, targetCam));
  targetCam = Math.max(0, Math.min(session.stage.length - VIEW_W, targetCam));
  session.cam += (targetCam - session.cam) * (1 - Math.exp(-5.5 * dt));

  session.enemies = session.enemies.filter((enemy) => enemy.hp > 0);
  stepDecor(session, dt);
}
