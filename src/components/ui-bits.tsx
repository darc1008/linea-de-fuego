import { useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { levelFromXp, rankName, characterById } from "@/game/content";
import { sheetFrames } from "@/game/sprites";
import { xpBounds } from "@/game/save";

export function Portrait({ sheet, name, className }: { sheet: string; name: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let frame = 0;
    const tick = window.setInterval(() => {
      const canvas = ref.current;
      const frames = sheetFrames(sheet);
      if (!canvas || !frames || frames.length === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const size = 160;
      if (canvas.width !== size) {
        canvas.width = size;
        canvas.height = size;
      }
      ctx.clearRect(0, 0, size, size);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(frames[frame % frames.length], 18, 8, 124, 148);
      frame += 1;
    }, 140);
    return () => window.clearInterval(tick);
  }, [sheet]);
  return <canvas ref={ref} className={className ?? "h-16 w-16"} aria-label={name} />;
}

export function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-1" aria-label={`${count} de 3 misiones`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < count ? "h-2.5 w-2.5 bg-accent" : "h-2.5 w-2.5 bg-line"} />
      ))}
    </span>
  );
}

export function XpBar({ xp }: { xp: number }) {
  const level = levelFromXp(xp);
  const { start, next } = xpBounds(level);
  const pct = next == null ? 100 : Math.max(0, Math.min(100, ((xp - start) / (next - start)) * 100));
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <p className="font-display text-xl leading-none tracking-wide">
          NIVEL {level} · {rankName(level)}
        </p>
        <p className="text-xs text-muted">{next == null ? "Rango máximo" : `${xp - start} / ${next - start} XP`}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-base-2">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}


export function SoundButton({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-surface text-fg"
      aria-label={on ? "Silenciar" : "Activar sonido"}
    >
      {on ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
    </button>
  );
}

function Title({ onEnter, sound, onSound }: { onEnter: () => void; sound: boolean; onSound: () => void }) {
  return (
    <section className="flex h-dvh flex-col overflow-hidden">
      <div className="relative h-[32%] min-h-0 overflow-hidden">
        <img src="/game/bg-mexico.jpg" alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/30 to-transparent" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 px-4 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent">OPERACIÓN HEMISFERIO</p>
          <SoundButton on={sound} onClick={onSound} />
        </div>
        <h1 className="font-display text-[clamp(2.4rem,9vh,4.2rem)] leading-none tracking-wide">
          LÍNEA
          <br />
          DE FUEGO
        </h1>
        <p className="line-clamp-2 text-sm text-muted">Seis países. Elige operativo, arma y misión, y no sueltes el gatillo.</p>
        <button
          type="button"
          onClick={onEnter}
          className="inline-flex h-12 items-center justify-center bg-primary font-display text-2xl tracking-wide text-fg"
        >
          Entrar al frente
        </button>
        <a
          href="/descargas/Linea-de-Fuego.apk"
          download="Linea-de-Fuego.apk"
          className="inline-flex h-10 items-center justify-center border border-accent font-display text-lg tracking-wide text-accent"
        >
          Descargar APK
        </a>
      </div>
    </section>
  );
}

export function traitOf(character: ReturnType<typeof characterById>) {
  if (character.doubleJump) return "Doble salto";
  if (character.crit) return "Tiro crítico";
  if (character.armor < 1) return "Aguanta más";
  return "Equilibrado";
}
