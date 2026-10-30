import { GROUND } from "./content";
import { bgImage, drawSheet } from "./sprites";
import { aimOf, bodyH, rectOf } from "./engine-actors";
import { sample, VIEW_H, VIEW_W, type Session } from "./engine-state";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function doll(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  facing: number,
  frame: number,
  colors: { suit: string; head: string; gun: string },
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facing, 1);
  const bob = frame % 2 === 0 ? 0 : -3;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 0, h * 0.22, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.suit;
  ctx.fillRect(-h * 0.12, -h * 0.42 + bob, h * 0.1, h * 0.28);
  ctx.fillRect(h * 0.02, -h * 0.42 + (frame % 2 ? 0 : -3), h * 0.1, h * 0.28);
  ctx.fillRect(-h * 0.16, -h * 0.78 + bob, h * 0.32, h * 0.38);
  ctx.fillStyle = colors.head;
  ctx.fillRect(-h * 0.1, -h * 0.98 + bob, h * 0.22, h * 0.2);
  ctx.fillStyle = colors.gun;
  ctx.fillRect(h * 0.08, -h * 0.62 + bob, h * 0.34, h * 0.07);
  ctx.restore();
}

const DOLL: Record<string, { suit: string; head: string; gun: string }> = {
  rico: { suit: "#3d4a32", head: "#d7a27a", gun: "#2a241c" },
  lina: { suit: "#355246", head: "#c48962", gun: "#243028" },
  bruno: { suit: "#c45a28", head: "#8a5a3c", gun: "#241c18" },
  yuki: { suit: "#e8e4dc", head: "#e6c2a6", gun: "#20242c" },
  anya: { suit: "#8aa0ae", head: "#f0d2c0", gun: "#24282c" },
  grunt: { suit: "#3e5168", head: "#1c2430", gun: "#241c18" },
  hopper: { suit: "#3e5168", head: "#1c2430", gun: "#241c18" },
  flyer: { suit: "#2c3a2c", head: "#e23b2b", gun: "#1c241c" },
  turret: { suit: "#2a3038", head: "#e6b15a", gun: "#1a1e22" },
  boss: { suit: "#6a7030", head: "#9ec4d8", gun: "#242414" },
};

function drawActor(
  ctx: CanvasRenderingContext2D,
  sheet: string,
  frame: number,
  x: number,
  y: number,
  h: number,
  facing: number,
  hurt: boolean,
) {
  ctx.save();
  if (hurt) ctx.filter = "brightness(2.4)";
  const drew = drawSheet(ctx, sheet, frame, x, y, h * 1.45, facing < 0);
  if (!drew) doll(ctx, x, y, h * 1.15, facing, frame, DOLL[sheet] ?? DOLL.grunt);
  ctx.restore();
}

const PICKUP_FRAME: Record<string, number> = { abanico: 0, laser: 1, cohete: 2, llama: 3 };

export function draw(session: Session, ctx: CanvasRenderingContext2D) {
  const stage = session.stage;
  ctx.setTransform(ctx.canvas.width / VIEW_W, 0, 0, ctx.canvas.height / VIEW_H, 0, 0);
  ctx.imageSmoothingEnabled = true;
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, stage.skyTop);
  sky.addColorStop(0.55, stage.skyMid);
  sky.addColorStop(1, stage.ground);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.save();
  if (session.shake) {
    const mag = session.trauma * session.trauma;
    ctx.translate(Math.sin(session.time * 78) * 14 * mag, Math.cos(session.time * 63) * 9 * mag);
  }

  const plate = bgImage(stage.id);
  if (plate) {
    const dw = VIEW_W * 1.4;
    const t = session.cam / Math.max(1, stage.length - VIEW_W);
    ctx.drawImage(plate, -(dw - VIEW_W) * Math.max(0, Math.min(1, t)), 0, dw, VIEW_H);
  }
  const fade = ctx.createLinearGradient(0, 280, 0, GROUND + 8);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(1, stage.fade);
  ctx.fillStyle = fade;
  ctx.fillRect(0, 280, VIEW_W, GROUND);

  for (const mote of session.amb) {
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = stage.weather === "snow" ? "#f4f7fb" : stage.weather === "rain" ? "#9eb4c8" : stage.id === "japon" ? "#ff8ad4" : "#e6b15a";
    if (stage.weather === "rain") ctx.fillRect(mote.x, mote.y, 1.5, 8);
    else ctx.fillRect(mote.x, mote.y, mote.s, mote.s);
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.translate(-Math.round(session.cam), 0);
  ctx.fillStyle = stage.pit;
  ctx.fillRect(0, GROUND, stage.length, 400);

  for (const ground of stage.grounds) {
    ctx.fillStyle = stage.ground;
    ctx.fillRect(ground.x, GROUND, ground.w, 220);
    ctx.fillStyle = stage.groundTop;
    ctx.fillRect(ground.x, GROUND, ground.w, 6);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let x = ground.x + 10; x < ground.x + ground.w; x += 22) ctx.fillRect(x, GROUND + 16, 8, 3);
  }
  for (const plat of stage.platforms) {
    ctx.fillStyle = stage.plat;
    roundRect(ctx, plat.x, plat.y, plat.w, 16, 3);
    ctx.fill();
    ctx.fillStyle = stage.groundTop;
    ctx.fillRect(plat.x, plat.y, plat.w, 4);
  }

  for (const pickup of session.pickups) {
    if (pickup.taken) continue;
    const bob = Math.sin(session.time * 4 + pickup.x) * 4;
    const sheet = pickup.kind === "med" ? "medkit" : "pickups";
    const frame = pickup.kind === "med" ? 0 : (PICKUP_FRAME[pickup.kind] ?? 0);
    if (!drawSheet(ctx, sheet, frame, pickup.x, pickup.y + 16 + bob, 42, false)) {
      ctx.fillStyle = pickup.kind === "med" ? "#8fd0a8" : "#e6b15a";
      ctx.fillRect(pickup.x - 10, pickup.y - 10 + bob, 20, 16);
    }
  }

  for (const enemy of session.enemies) {
    if (enemy.hp <= 0) continue;
    let frame = Math.floor(enemy.t * 8) % 4;
    if (enemy.kind === "hopper") frame = enemy.vy < -40 ? 1 : !enemy.onGround ? 2 : 0;
    if (enemy.kind === "grunt" && Math.abs(enemy.vx) < 1) frame = Math.floor(enemy.t * 8) % 4;
    const sheet = enemy.kind === "boss" ? "boss" : enemy.kind;
    drawActor(ctx, sheet, frame, enemy.x, enemy.y, enemy.h, enemy.facing, enemy.hurt > 0);
    if (enemy.hp < enemy.maxHp && !enemy.boss) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(enemy.x - 16, enemy.y - enemy.h - 12, 32, 4);
      ctx.fillStyle = "#e23b2b";
      ctx.fillRect(enemy.x - 16, enemy.y - enemy.h - 12, 32 * (enemy.hp / enemy.maxHp), 4);
    }
  }

  const player = session.player;
  const pFrame = !player.onGround ? 1 : Math.abs(player.vx) > 24 ? Math.floor(player.anim) % 4 : 0;
  if (player.invuln <= 0 || Math.floor(session.time * 20) % 2 === 0) {
    ctx.save();
    const stretch = Math.max(0.86, Math.min(1.12, 1 + -player.vy / 2800));
    ctx.translate(player.x, player.y);
    ctx.scale(1 / stretch, stretch);
    ctx.translate(-player.x, -player.y);
    drawActor(ctx, session.character.sheet, pFrame, player.x, player.y, bodyH(session), player.facing, player.invuln > 0.75);
    ctx.restore();
  }

  if (session.muzzle > 0) {
    drawSheet(ctx, "muzzle", 0, session.muzzleX, session.muzzleY + 12, 36, session.muzzleFlip);
  }

  for (const bullet of session.bullets) {
    if (bullet.kind === "laser") {
      ctx.strokeStyle = bullet.side === "p" ? "#7ee7ff" : "#ffb15a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bullet.x, bullet.y);
      ctx.lineTo(bullet.x - bullet.vx * 0.03, bullet.y - bullet.vy * 0.03);
      ctx.stroke();
      continue;
    }
    if (bullet.kind === "flame") {
      ctx.fillStyle = "rgba(255,120,40,0.85)";
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    if (bullet.kind === "grenade") {
      ctx.fillStyle = "#223028";
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d7e2d4";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bullet.x, bullet.y - 7);
      ctx.lineTo(bullet.x + 3, bullet.y - 12);
      ctx.stroke();
      continue;
    }
    ctx.fillStyle = bullet.side === "e" ? "#ff5d4a" : bullet.kind === "rocket" ? "#d8d2c4" : "#ffd36a";
    if (bullet.kind === "rocket") {
      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(Math.atan2(bullet.vy, bullet.vx));
      ctx.fillRect(-8, -3, 16, 6);
      ctx.fillStyle = "#e23b2b";
      ctx.fillRect(6, -3, 4, 6);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (const boom of session.booms) {
    const frame = Math.min(3, Math.floor((boom.t / 0.42) * 4));
    if (!drawSheet(ctx, "explosion", frame, boom.x, boom.y + boom.size * 0.35, boom.size, false)) {
      ctx.fillStyle = "rgba(255,140,60,0.7)";
      ctx.beginPath();
      ctx.arc(boom.x, boom.y, boom.size * (boom.t / 0.42), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (const particle of session.particles) {
    ctx.globalAlpha = Math.max(0, particle.life / particle.max);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#f4f0e6";
  ctx.font = "600 18px Outfit, sans-serif";
  ctx.textAlign = "center";
  for (const floater of session.floaters) {
    ctx.globalAlpha = Math.max(0, floater.life);
    ctx.fillText(floater.text, floater.x, floater.y);
  }
  ctx.globalAlpha = 1;

  if (!session.ending && !session.paused) {
    const input = sample();
    const aim = aimOf(session, input);
    const ox = player.x + aim.x * 28;
    const oy = player.y - bodyH(session) * 0.62 + aim.y * 12;
    ctx.strokeStyle = "rgba(230,177,90,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + aim.x * 18, oy + aim.y * 18);
    ctx.stroke();
  }

  ctx.restore();

  if (session.flash > 0) {
    ctx.fillStyle = `rgba(226,59,43,${session.flash * 0.35})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  if (session.player.hp > 0 && session.player.hp < session.player.maxHp * 0.28 && !session.ending) {
    ctx.strokeStyle = "rgba(226,59,43,0.45)";
    ctx.lineWidth = 18;
    ctx.strokeRect(8, 8, VIEW_W - 16, VIEW_H - 16);
  }
  if (session.ending === "win") {
    ctx.fillStyle = "rgba(8,10,8,0.35)";
    ctx.fillRect(0, VIEW_H * 0.38, VIEW_W, 90);
    ctx.fillStyle = "#f4f0e6";
    ctx.font = "700 64px Teko, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SECTOR LIMPIO", VIEW_W / 2, VIEW_H * 0.5);
  }
  ctx.restore();
}
