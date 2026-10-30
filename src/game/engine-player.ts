import { weaponById } from "./content";
import { sfxJump, sfxShoot } from "./audio";
import { aimOf, bodyH, burst, downPlayer, fire, hurtPlayer, overlap, rectOf } from "./engine-actors";
import { stepDecor } from "./engine-decor";
import { GRAV, MAX_FALL, VIEW_W, type Input, type Session, type Solid } from "./engine-state";

export function stepPlayer(session: Session, dt: number, input: Input) {
  const player = session.player;
  const character = session.character;
  player.invuln = Math.max(0, player.invuln - dt);
  player.shootCd = Math.max(0, player.shootCd - dt);

  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (dir !== 0) player.facing = dir as 1 | -1;
  player.crouch = input.down && player.onGround && !input.up;
  const slip = session.stage.slip ? 0.42 : 1;
  const target = player.crouch ? 0 : dir * character.speed;
  const rate = (player.onGround ? 2000 : 1300) * slip * (Math.abs(target) >= Math.abs(player.vx) ? 1 : 1.25);
  const diff = target - player.vx;
  const step = rate * dt;
  player.vx += Math.abs(diff) <= step ? diff : Math.sign(diff) * step;
  player.vy = Math.min(MAX_FALL, player.vy + GRAV * dt);

  if (player.onGround) player.air = character.doubleJump ? 1 : 0;
  const jumpEdge = input.jump && !player.wasJump;
  const jumpRelease = !input.jump && player.wasJump;
  if (jumpEdge) player.buf = 0.12;
  else player.buf = Math.max(0, player.buf - dt);
  if (player.buf > 0 && (player.onGround || player.coyote > 0)) {
    player.vy = -character.jump;
    player.onGround = false;
    player.coyote = 0;
    player.buf = 0;
    player.air = character.doubleJump ? 1 : 0;
    sfxJump();
    burst(session, player.x, player.y, "#cbbba4", 4, 40);
  } else if (jumpEdge && player.air > 0 && !player.onGround && player.coyote <= 0) {
    player.air -= 1;
    player.vy = -character.jump * 0.92;
    sfxJump();
  }
  if (jumpRelease && player.vy < 0) player.vy *= 0.5;
  player.wasJump = input.jump;

  const height = bodyH(session);
  player.x += player.vx * dt;
  for (const solid of session.solids) {
    if (solid.oneWay) continue;
    const box = rectOf(player.x, player.y, player.w, height);
    if (!overlap(box, solid)) continue;
    if (player.vx > 0) player.x = solid.x - player.w / 2;
    else if (player.vx < 0) player.x = solid.x + solid.w + player.w / 2;
    player.vx = 0;
  }
  if (session.arena) {
    if (player.x < session.lockL + 24) {
      player.x = session.lockL + 24;
      player.vx = 0;
    }
    if (player.x > session.lockR - 24) {
      player.x = session.lockR - 24;
      player.vx = 0;
    }
  }

  const prevFeet = player.y;
  player.y += player.vy * dt;
  player.onGround = false;
  for (const solid of session.solids) {
    const l = player.x - player.w / 2;
    const r = player.x + player.w / 2;
    if (r <= solid.x || l >= solid.x + solid.w) continue;
    if (player.vy >= 0 && prevFeet <= solid.y + 1 && player.y >= solid.y && player.y - height < solid.y + 18) {
      player.y = solid.y;
      player.vy = 0;
      player.onGround = true;
    } else if (!solid.oneWay && player.vy < 0 && prevFeet - height >= solid.y + solid.h - 1 && player.y - height < solid.y + solid.h) {
      player.y = solid.y + solid.h + height;
      player.vy = 0;
    }
  }
  if (player.onGround) player.coyote = 0.12;
  else player.coyote = Math.max(0, player.coyote - dt);
  if (Math.abs(player.vx) > 30 && player.onGround) player.anim += dt * 12;
  if (player.y > 760) downPlayer(session);
  if (session.ending) {
    stepDecor(session, dt);
    if (session.endTimer <= 0) session.resultReady = true;
    return;
  }

  const weaponEdge = input.weapon && !session.wasWeapon;
  session.wasWeapon = input.weapon;
  if (weaponEdge && session.arsenal.length > 1) {
    const index = session.arsenal.indexOf(player.weapon);
    player.weapon = session.arsenal[(index + 1) % session.arsenal.length];
  }

  const grenadeEdge = input.grenade && !session.wasGrenade;
  session.wasGrenade = input.grenade;
  if (grenadeEdge && player.grenades > 0 && player.hp > 0) {
    player.grenades -= 1;
    const aim = aimOf(session, input);
    const ax = aim.x === 0 ? player.facing : aim.x;
    const ay = aim.y - 0.7;
    const mag = Math.hypot(ax, ay) || 1;
    fire(session, player.x + (ax / mag) * 20, player.y - height * 0.55, ax / mag, ay / mag, 0, {
      dmg: 46,
      speed: 440,
      life: 1.2,
      r: 7,
      pierce: 0,
      splash: 88,
      kind: "grenade",
      side: "p",
    });
    sfxShoot("rocket");
  }

  const aim = aimOf(session, input);
  if (input.shoot) session.shootGrace = 0.55;
  else if ((input.jump || !player.onGround) && session.shootGrace > 0) session.shootGrace = Math.max(0, session.shootGrace - dt * 0.2);
  else session.shootGrace = Math.max(0, session.shootGrace - dt * 4);
  if (session.shootGrace > 0 && player.shootCd <= 0 && !session.ending && player.hp > 0) {
    const weapon = weaponById(player.weapon);
    player.shootCd = weapon.rate * character.fire;
    player.shots += 1;
    let dmg = weapon.dmg * character.damage;
    if (character.crit && player.shots % 4 === 0) dmg *= 1.85;
    const ox = player.x + aim.x * 26;
    const oy = player.y - height * 0.62 + aim.y * 16;
    for (let i = 0; i < weapon.pellets; i++) {
      const spread = weapon.pellets === 1 ? (Math.random() - 0.5) * weapon.spread : (i - (weapon.pellets - 1) / 2) * weapon.spread;
      fire(session, ox, oy, aim.x, aim.y, spread, {
        dmg,
        speed: weapon.speed,
        life: weapon.life,
        r: weapon.radius,
        pierce: weapon.pierce,
        splash: weapon.splash,
        kind: weapon.kind,
        side: "p",
      });
    }
    session.muzzle = 0.06;
    session.muzzleX = ox;
    session.muzzleY = oy;
    session.muzzleFlip = aim.x < 0;
    sfxShoot(weapon.kind);
    if (weapon.kind !== "flame") {
      session.particles.push({
        x: player.x - player.facing * 8,
        y: oy,
        vx: -player.facing * 40,
        vy: 30,
        life: 0.25,
        max: 0.25,
        color: "#e6b15a",
        size: 2,
        g: 500,
      });
    }
  }
}
