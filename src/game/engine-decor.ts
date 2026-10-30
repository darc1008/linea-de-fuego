import type { Session } from "./engine-state";

export function stepDecor(session: Session, dt: number) {
  for (let i = session.particles.length - 1; i >= 0; i--) {
    const p = session.particles[i];
    p.life -= dt;
    p.vy += p.g * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.life <= 0) session.particles.splice(i, 1);
  }
  for (let i = session.floaters.length - 1; i >= 0; i--) {
    session.floaters[i].life -= dt;
    session.floaters[i].y -= 28 * dt;
    if (session.floaters[i].life <= 0) session.floaters.splice(i, 1);
  }
  for (const boom of session.booms) boom.t += dt;
  session.booms = session.booms.filter((boom) => boom.t < 0.42);
}

