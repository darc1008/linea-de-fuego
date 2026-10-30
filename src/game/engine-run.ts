import { stepField } from "./engine-field";
import { stepPlayer } from "./engine-player";
import { stepDecor } from "./engine-decor";
import { sample, VIEW_H, VIEW_W, type Session } from "./engine-state";

export function update(session: Session, dt: number) {
  const input = sample();
  const pauseEdge = input.pause && !session.wasPause;
  session.wasPause = input.pause;
  if (pauseEdge) session.paused = !session.paused;
  if (session.paused) return;

  session.time += dt;
  session.stats.time += dt;
  session.trauma = Math.max(0, session.trauma - dt * 1.5);
  session.flash = Math.max(0, session.flash - dt);
  session.muzzle = Math.max(0, session.muzzle - dt);
  if (session.comboT > 0) {
    session.comboT -= dt;
    if (session.comboT <= 0) session.combo = 0;
  }

  for (const mote of session.amb) {
    mote.y += mote.v * dt;
    mote.x += (session.stage.weather === "rain" ? 40 : 8) * dt;
    if (mote.y > VIEW_H) {
      mote.y = -8;
      mote.x = Math.random() * VIEW_W;
    }
    if (mote.x > VIEW_W) mote.x = 0;
  }

  if (session.ending) {
    session.endTimer -= dt;
    stepDecor(session, dt);
    if (session.endTimer <= 0) session.resultReady = true;
    return;
  }

  stepPlayer(session, dt, input);
  if (session.ending) return;
  stepField(session, dt);
}
