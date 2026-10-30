import { STAGES, rankName } from "@/game/content";
import type { Screen } from "./screen-types";

export function Result({
  screen,
  onHub,
  onRetry,
  onNext,
}: {
  screen: Extract<Screen, { name: "result" }>;
  onHub: () => void;
  onRetry: () => void;
  onNext: () => void;
}) {
  const stage = STAGES.find((item) => item.id === screen.stageId) ?? STAGES[0];
  const index = STAGES.findIndex((item) => item.id === stage.id);
  const hasNext = screen.win && index >= 0 && index < STAGES.length - 1;
  return (
    <div className="mx-auto flex h-dvh w-full max-w-xl flex-col gap-2 overflow-hidden px-3 py-3">
      <p className="shrink-0 text-[11px] font-semibold tracking-[0.16em] text-accent">{stage.country.toUpperCase()}</p>
      <h1 className="shrink-0 font-display text-[clamp(2rem,7vh,3.2rem)] leading-none">{screen.win ? "Sector limpio" : "Baja en combate"}</h1>
      <p className="shrink-0 text-sm">
        +{screen.xp} XP
        {screen.levelAfter > screen.levelBefore ? ` · ${rankName(screen.levelAfter)}` : ""}
        {" · "}
        {screen.stats.kills} bajas · racha {screen.stats.maxCombo}
      </p>
      <ul className="flex min-h-0 flex-1 flex-col justify-center gap-1 overflow-hidden">
        {screen.missions.map((mission) => (
          <li key={mission.id} className="flex items-center justify-between gap-3 border border-line bg-surface px-3 py-1.5 text-sm">
            <span className="truncate">{mission.text}</span>
            <span className={mission.done ? "shrink-0 text-good" : "shrink-0 text-muted"}>{mission.done ? "Lista" : "Pendiente"}</span>
          </li>
        ))}
      </ul>
      {screen.unlocks.length > 0 ? (
        <p className="shrink-0 truncate border border-accent bg-surface px-3 py-2 text-sm">
          <span className="text-accent">Nuevo · </span>
          {screen.unlocks.join(" · ")}
        </p>
      ) : null}
      <div className="grid shrink-0 grid-cols-2 gap-2">
        {hasNext ? (
          <button type="button" onClick={onNext} className="col-span-2 h-11 bg-primary font-display text-2xl text-fg">
            Siguiente país
          </button>
        ) : null}
        <button type="button" onClick={onRetry} className="h-11 border border-line font-display text-xl">
          Reintentar
        </button>
        <button type="button" onClick={onHub} className="h-11 border border-line text-sm">
          Cuartel
        </button>
      </div>
    </div>
  );
}
