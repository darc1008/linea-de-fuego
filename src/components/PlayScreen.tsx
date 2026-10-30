import { useEffect, useMemo, useRef, useState } from "react";
import {
  VIEW_H,
  VIEW_W,
  bindKeyboard,
  createSession,
  destroySession,
  draw,
  installProbe,
  readHud,
  takeResult,
  togglePause,
  touch,
  update,
  type Hud,
} from "@/game/engine";
import { preloadGameArt } from "@/game/sprites";
import { weaponById, STAGES, type WeaponId } from "@/game/content";
import { arsenalOf, type RunStats, type Save } from "@/game/save";
import { IconPause } from "./ControlButtons";
import { TouchControls, clampSpot, loadLayout, saveLayout, DEFAULT_LAYOUT, type CtrlLayout, type Knob } from "./TouchControls";

export function Play({
  save,
  stageId,
  onEnd,
  onAbort,
}: {
  save: Save;
  stageId: string;
  onEnd: (win: boolean, stats: RunStats) => void;
  onAbort: () => void;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<ReturnType<typeof createSession> | null>(null);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  const [hud, setHud] = useState<Hud | null>(null);
  const guns = useMemo(() => arsenalOf(save), [save]);
  const layerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<CtrlLayout>(() => loadLayout());
  const [editing, setEditing] = useState(false);
  const [stick, setStick] = useState({ x: 0, y: 0, on: false });
  const dragRef = useRef<{ id: Knob; px: number; py: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const field = fieldRef.current;
    if (!canvas || !field) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const session = createSession(stageId, save.characterId, save.weaponId, guns, save.shake);
    sessionRef.current = session;
    installProbe();
    const unbind = bindKeyboard(window);
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let hudAt = 0;
    let paused = session.paused;

    const fit = () => {
      const rect = field.getBoundingClientRect();
      const scale = Math.min(rect.width / VIEW_W, rect.height / VIEW_H);
      const cssW = Math.max(1, Math.floor(VIEW_W * scale));
      const cssH = Math.max(1, Math.floor(VIEW_H * scale));
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const bw = Math.max(1, Math.floor(cssW * dpr));
      const bh = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      fit();
      if (document.hidden) acc = 0;
      else if (session.hitstop > 0) {
        session.hitstop -= dt;
        acc = 0;
      } else {
        acc = Math.min(0.2, acc + dt);
        while (acc >= 1 / 60) {
          update(session, 1 / 60);
          acc -= 1 / 60;
        }
      }
      draw(session, ctx);
      if (now - hudAt > 160 || session.paused !== paused) {
        hudAt = now;
        paused = session.paused;
        setHud(readHud(session));
      }
      const result = takeResult(session);
      if (result) endRef.current(result.win, result.stats);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      unbind();
      destroySession(session);
      sessionRef.current = null;
    };
  }, [guns, save.characterId, save.shake, save.weaponId, stageId]);

  const stage = STAGES.find((item) => item.id === stageId) ?? STAGES[0];

  return (
    <div className="play-shell relative flex h-dvh flex-col bg-base">
      <div ref={fieldRef} className="relative min-h-0 flex-1">
        <canvas ref={canvasRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" aria-label="Campo de batalla" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3 pr-20">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="h-3 max-w-48 overflow-hidden bg-base-2">
                <div className="h-full bg-primary" style={{ width: `${hud ? (hud.hp / hud.maxHp) * 100 : 100}%` }} />
              </div>
              <p className="mt-1 text-sm">
                {hud ? `${Math.ceil(hud.hp)} vida · ${hud.lives} ${hud.lives === 1 ? "vida" : "vidas"} · ${hud.weapon}` : `${stage.country}`}
                {hud && hud.combo > 1 ? ` · racha ${hud.combo}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl leading-none">{stage.country}</p>
              <p className="text-sm text-muted">{hud?.objective ?? stage.name}</p>
            </div>
            <button
              type="button"
              className="hud-pause pointer-events-auto inline-flex min-h-11 min-w-11 items-center justify-center border border-line bg-surface text-fg"
              aria-label="Pausa"
              onClick={() => {
                const session = sessionRef.current;
                if (session) {
                  togglePause(session);
                  setHud(readHud(session));
                }
              }}
            >
              <IconPause />
            </button>
          </div>
          {hud && hud.bossMax > 0 ? (
            <div>
              <p className="text-sm text-accent">{hud.bossName}</p>
              <div className="h-2 overflow-hidden bg-base-2">
                <div className="h-full bg-accent" style={{ width: `${(hud.bossHp / hud.bossMax) * 100}%` }} />
              </div>
            </div>
          ) : null}
          <div className="h-1 overflow-hidden bg-base-2">
            <div className="h-full bg-fg" style={{ width: `${(hud?.progress ?? 0) * 100}%` }} />
          </div>
        </div>
        <p className="key-hint pointer-events-none absolute inset-x-0 bottom-3 z-10 text-center text-sm text-muted">
          A D mover · W S apuntar · Espacio saltar · J disparar · Q arma
        </p>
        {hud?.paused && !editing ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-base/80 p-6">
            <div className="flex w-full max-w-sm flex-col gap-3 border border-line bg-surface p-5">
              <h2 className="font-display text-5xl leading-none">Pausa</h2>
              <p className="text-sm text-muted">
                Toca el arma una vez y sigue disparando mientras saltas. Tócala otra vez para parar. Si la mantienes, solo dispara mientras la tienes.
              </p>
              <button
                type="button"
                className="min-h-12 bg-primary font-display text-3xl text-fg"
                onClick={() => {
                  const session = sessionRef.current;
                  if (!session) return;
                  togglePause(session);
                  setHud(readHud(session));
                }}
              >
                Seguir
              </button>
              <button
                type="button"
                className="min-h-11 border border-line text-sm"
                onClick={() => {
                  const session = sessionRef.current;
                  if (session && !session.paused) {
                    togglePause(session);
                    setHud(readHud(session));
                  }
                  setEditing(true);
                }}
              >
                Ajustar botones
              </button>
              <button type="button" className="min-h-11 border border-line text-sm" onClick={onAbort}>
                Abandonar sector
              </button>
            </div>
          </div>
        ) : null}
        <TouchControls
          layerRef={layerRef}
          layout={layout}
          editing={editing}
          grenades={hud?.grenades ?? 3}
          stick={stick}
          onStick={setStick}
          onEditMove={(id, spot) => {
            setLayout((prev) => {
              const next = { ...prev, [id]: clampSpot(spot) };
              saveLayout(next);
              return next;
            });
          }}
          dragRef={dragRef}
          onPause={() => {
            const session = sessionRef.current;
            if (!session || editing) return;
            togglePause(session);
            setHud(readHud(session));
          }}
          onScale={(delta) => {
            setLayout((prev) => {
              const next = { ...prev, scale: Math.min(1.4, Math.max(0.8, Math.round((prev.scale + delta) * 10) / 10)) };
              saveLayout(next);
              return next;
            });
          }}
          onReset={() => {
            setLayout(DEFAULT_LAYOUT);
            saveLayout(DEFAULT_LAYOUT);
          }}
          onDone={() => setEditing(false)}
        />
      </div>
    </div>
  );
}

