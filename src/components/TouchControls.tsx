import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { touch } from "@/game/engine";
import { IconGrenade, IconGun, IconPause, IconRun, RoundButton } from "./ControlButtons";

type Spot = { x: number; y: number };
export type Knob = "pad" | "fire" | "jump" | "grenade" | "pause";
export type CtrlLayout = { scale: number; pad: Spot; fire: Spot; jump: Spot; grenade: Spot; pause: Spot };

const CTRL_KEY = "linea-controles-v2";
export const DEFAULT_LAYOUT: CtrlLayout = {
  scale: 1,
  pad: { x: 0.16, y: 0.74 },
  fire: { x: 0.78, y: 0.64 },
  jump: { x: 0.9, y: 0.8 },
  grenade: { x: 0.84, y: 0.42 },
  pause: { x: 0.92, y: 0.16 },
};

export function clampSpot(spot: Spot): Spot {
  return { x: Math.min(0.96, Math.max(0.04, spot.x)), y: Math.min(0.94, Math.max(0.06, spot.y)) };
}

export function loadLayout(): CtrlLayout {
  try {
    const raw = localStorage.getItem(CTRL_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw) as Partial<CtrlLayout>;
    const scale = typeof parsed.scale === "number" ? Math.min(1.4, Math.max(0.8, parsed.scale)) : 1;
    const spot = (value: Spot | undefined, fallback: Spot) =>
      value && typeof value.x === "number" && typeof value.y === "number" ? clampSpot(value) : fallback;
    return {
      scale,
      pad: spot(parsed.pad, DEFAULT_LAYOUT.pad),
      fire: spot(parsed.fire, DEFAULT_LAYOUT.fire),
      jump: spot(parsed.jump, DEFAULT_LAYOUT.jump),
      grenade: spot(parsed.grenade, DEFAULT_LAYOUT.grenade),
      pause: spot(parsed.pause, DEFAULT_LAYOUT.pause),
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export function saveLayout(layout: CtrlLayout) {
  localStorage.setItem(CTRL_KEY, JSON.stringify(layout));
}


export function placeStyle(spot: Spot, size: number): CSSProperties {
  return {
    left: `${spot.x * 100}%`,
    top: `${spot.y * 100}%`,
    width: size,
    height: size,
    transform: "translate(-50%, -50%)",
  };
}

export function TouchControls({
  layerRef,
  layout,
  editing,
  grenades,
  stick,
  onStick,
  onEditMove,
  dragRef,
  onPause,
  onScale,
  onReset,
  onDone,
}: {
  layerRef: RefObject<HTMLDivElement | null>;
  layout: CtrlLayout;
  editing: boolean;
  grenades: number;
  stick: { x: number; y: number; on: boolean };
  onStick: (next: { x: number; y: number; on: boolean }) => void;
  onEditMove: (id: Knob, spot: Spot) => void;
  dragRef: RefObject<{ id: Knob; px: number; py: number; ox: number; oy: number } | null>;
  onPause: () => void;
  onScale: (delta: number) => void;
  onReset: () => void;
  onDone: () => void;
}) {
  const size = (base: number) => Math.round(base * layout.scale);
  const editClass = editing ? "editing" : "";
  const fireRef = useRef<HTMLButtonElement>(null);
  const jumpRef = useRef<HTMLButtonElement>(null);
  const cluster = useRef<Map<number, { x: number; y: number; fromFire: boolean }>>(new Map());
  const pressAt = useRef<Map<number, number>>(new Map());
  const fireLock = useRef(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    return () => {
      touch.shoot = false;
      touch.jump = false;
    };
  }, []);

  function beginDrag(id: Knob, event: ReactPointerEvent) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const spot = layout[id];
    dragRef.current = { id, px: event.clientX, py: event.clientY, ox: spot.x, oy: spot.y };
  }

  function moveDrag(event: ReactPointerEvent) {
    const drag = dragRef.current;
    const layer = layerRef.current;
    if (!editing || !drag || !layer) return;
    const rect = layer.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    onEditMove(drag.id, {
      x: drag.ox + (event.clientX - drag.px) / rect.width,
      y: drag.oy + (event.clientY - drag.py) / rect.height,
    });
  }

  function endDrag() {
    dragRef.current = null;
  }

  function readStick(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const dead = rect.width * 0.2;
    const limit = rect.width * 0.32;
    const mag = Math.hypot(dx, dy) || 1;
    const scale = Math.min(1, limit / mag);
    touch.left = dx < -dead;
    touch.right = dx > dead;
    touch.up = dy < -dead;
    touch.down = dy > dead;
    onStick({ x: dx * scale, y: dy * scale, on: true });
  }

  function clearStick() {
    touch.left = touch.right = touch.up = touch.down = false;
    onStick({ x: 0, y: 0, on: false });
  }

  function inCircle(x: number, y: number, el: HTMLButtonElement | null, slop: number) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = rect.width / 2 + slop;
    return (x - cx) ** 2 + (y - cy) ** 2 <= rad * rad;
  }

  function applyCluster() {
    let shoot = fireLock.current;
    let jump = false;
    for (const finger of cluster.current.values()) {
      const onFire = inCircle(finger.x, finger.y, fireRef.current, 30);
      const onJump = inCircle(finger.x, finger.y, jumpRef.current, 30);
      if (onFire) shoot = true;
      if (onJump) jump = true;
    }
    touch.shoot = shoot;
    touch.jump = jump;
  }

  function clusterDown(which: "fire" | "jump", event: ReactPointerEvent<HTMLButtonElement>) {
    if (editing) {
      beginDrag(which, event);
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    cluster.current.set(event.pointerId, { x: event.clientX, y: event.clientY, fromFire: which === "fire" });
    pressAt.current.set(event.pointerId, performance.now());
    applyCluster();
  }

  function clusterMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (editing) {
      moveDrag(event);
      return;
    }
    const finger = cluster.current.get(event.pointerId);
    if (!finger) return;
    finger.x = event.clientX;
    finger.y = event.clientY;
    applyCluster();
  }

  function clusterUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (editing) {
      endDrag();
      return;
    }
    const finger = cluster.current.get(event.pointerId);
    if (finger) {
      finger.x = event.clientX;
      finger.y = event.clientY;
    }
    const started = pressAt.current.get(event.pointerId) ?? 0;
    cluster.current.delete(event.pointerId);
    pressAt.current.delete(event.pointerId);
    const quick = performance.now() - started < 260;
    const stayedOnFire =
      !!finger?.fromFire &&
      !!finger &&
      inCircle(finger.x, finger.y, fireRef.current, 30) &&
      !inCircle(finger.x, finger.y, jumpRef.current, 30);
    if (quick && stayedOnFire) {
      fireLock.current = !fireLock.current;
      setLocked(fireLock.current);
    }
    applyCluster();
  }

  return (
    <div ref={layerRef} className="touch-layer absolute inset-0 z-[12]">
      <div
        className={`stick ${editClass}`}
        style={placeStyle(layout.pad, size(148))}
        aria-label="Pad de movimiento"
        onPointerDown={(event) => {
          if (editing) {
            beginDrag("pad", event);
            return;
          }
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          readStick(event);
        }}
        onPointerMove={(event) => {
          if (editing) {
            moveDrag(event);
            return;
          }
          if (event.currentTarget.hasPointerCapture(event.pointerId)) readStick(event);
        }}
        onPointerUp={() => {
          endDrag();
          if (!editing) clearStick();
        }}
        onPointerCancel={() => {
          endDrag();
          if (!editing) clearStick();
        }}
      >
        <span className={`stick-arrow ${touch.up ? "on" : ""}`} style={{ top: "12%", left: "50%", transform: "translateX(-50%)" }}>
          ▲
        </span>
        <span className={`stick-arrow ${touch.down ? "on" : ""}`} style={{ bottom: "12%", left: "50%", transform: "translateX(-50%)" }}>
          ▼
        </span>
        <span className={`stick-arrow ${touch.left ? "on" : ""}`} style={{ left: "12%", top: "50%", transform: "translateY(-50%)" }}>
          ◀
        </span>
        <span className={`stick-arrow ${touch.right ? "on" : ""}`} style={{ right: "12%", top: "50%", transform: "translateY(-50%)" }}>
          ▶
        </span>
        <span
          className="pointer-events-none absolute rounded-full border border-white/80 bg-white/15"
          style={{
            width: "34%",
            height: "34%",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${stick.x}px), calc(-50% + ${stick.y}px))`,
          }}
        />
      </div>

      <RoundButton
        buttonRef={fireRef}
        label={locked ? "Disparo fijo. Toca para parar" : "Disparar. Un toque lo deja fijo"}
        className={`ctrl ${editClass} ${locked ? "locked" : ""}`}
        style={placeStyle(layout.fire, size(108))}
        editing={editing}
        onEditDown={(event) => beginDrag("fire", event)}
        onEditMove={moveDrag}
        onEditUp={endDrag}
        onPointerDown={(event) => clusterDown("fire", event)}
        onPointerMove={clusterMove}
        onPointerUp={clusterUp}
      >
        <IconGun size={64} />
        {locked ? <span className="fire-lock">FIJO</span> : null}
      </RoundButton>

      <RoundButton
        buttonRef={jumpRef}
        label="Saltar"
        className={`ctrl ${editClass}`}
        style={placeStyle(layout.jump, size(100))}
        editing={editing}
        onEditDown={(event) => beginDrag("jump", event)}
        onEditMove={moveDrag}
        onEditUp={endDrag}
        onPointerDown={(event) => clusterDown("jump", event)}
        onPointerMove={clusterMove}
        onPointerUp={clusterUp}
      >
        <IconRun size={62} />
      </RoundButton>

      <RoundButton
        label={grenades > 0 ? `Granada, ${grenades} restantes` : "Sin granadas"}
        className={`ctrl ${editClass} ${grenades <= 0 ? "dim" : ""}`}
        style={placeStyle(layout.grenade, size(54))}
        editing={editing}
        onEditDown={(event) => beginDrag("grenade", event)}
        onEditMove={moveDrag}
        onEditUp={endDrag}
        onDown={() => {
          touch.grenade = true;
        }}
        onUp={() => {
          touch.grenade = false;
        }}
      >
        <IconGrenade />
        <span className="grenade-count">{grenades}</span>
      </RoundButton>

      <RoundButton
        label="Pausa"
        className={`ctrl ${editClass}`}
        style={placeStyle(layout.pause, size(48))}
        editing={editing}
        onEditDown={(event) => beginDrag("pause", event)}
        onEditMove={moveDrag}
        onEditUp={endDrag}
        onDown={onPause}
        onUp={() => undefined}
      >
        <IconPause />
      </RoundButton>

      {editing ? (
        <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center justify-center gap-2 rounded-full bg-base/90 px-3 py-2 text-sm">
          <span className="text-muted">Arrastra los botones</span>
          <button type="button" className="min-h-10 min-w-10 border border-line px-2" onClick={() => onScale(-0.1)} aria-label="Botones más pequeños">
            −
          </button>
          <span>{Math.round(layout.scale * 100)}%</span>
          <button type="button" className="min-h-10 min-w-10 border border-line px-2" onClick={() => onScale(0.1)} aria-label="Botones más grandes">
            +
          </button>
          <button type="button" className="min-h-10 border border-line px-3" onClick={onReset}>
            Restablecer
          </button>
          <button type="button" className="min-h-10 bg-primary px-3 text-fg" onClick={onDone}>
            Listo
          </button>
        </div>
      ) : null}
    </div>
  );
}

