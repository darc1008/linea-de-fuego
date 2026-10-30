import { useRef, useState } from "react";
import { Lock } from "lucide-react";
import { CHARACTERS, STAGES, WEAPONS, characterById, weaponById, type CharacterId, type WeaponId } from "@/game/content";
import { charUnlocked, stageOpen, weaponUnlocked, type Save } from "@/game/save";
import { IconGun } from "./ControlButtons";
import { Portrait, Stars, traitOf } from "./ui-bits";

export function Picker({
  kind,
  save,
  level,
  stageId,
  onBack,
  onChooseCharacter,
  onChooseWeapon,
  onChooseStage,
}: {
  kind: "character" | "weapon" | "mission";
  save: Save;
  level: number;
  stageId: string;
  onBack: () => void;
  onChooseCharacter: (id: CharacterId) => void;
  onChooseWeapon: (id: WeaponId) => void;
  onChooseStage: (id: string) => void;
}) {
  const count = kind === "character" ? CHARACTERS.length : kind === "weapon" ? WEAPONS.length : STAGES.length;
  const initial =
    kind === "character"
      ? CHARACTERS.findIndex((item) => item.id === save.characterId)
      : kind === "weapon"
        ? WEAPONS.findIndex((item) => item.id === save.weaponId)
        : Math.max(0, STAGES.findIndex((item) => item.id === stageId));
  const [index, setIndex] = useState(initial < 0 ? 0 : initial);
  const drag = useRef(0);
  const label = kind === "character" ? "Personaje" : kind === "weapon" ? "Arma" : "Misión";

  function step(delta: number) {
    setIndex((current) => (current + delta + count) % count);
  }

  const character = CHARACTERS[index];
  const weapon = WEAPONS[index];
  const stage = STAGES[index];
  const open =
    kind === "character"
      ? charUnlocked(save, character.id, level)
      : kind === "weapon"
        ? weaponUnlocked(save, weapon.id, level)
        : stageOpen(save, index);
  const lockText =
    kind === "character" ? `Nivel ${character.unlock}` : kind === "weapon" ? `Nivel ${weapon.unlock}` : "Cerrada";

  function choose() {
    if (!open) return;
    if (kind === "character") onChooseCharacter(character.id);
    else if (kind === "weapon") onChooseWeapon(weapon.id);
    else onChooseStage(stage.id);
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden px-3 py-3">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="h-10 px-1 text-sm text-muted">
          Volver
        </button>
        <p className="text-xs font-semibold tracking-[0.16em] text-accent">
          {label.toUpperCase()} {index + 1}/{count}
        </p>
        <span className="w-14" />
      </header>
      <div className="flex min-h-0 flex-1 items-stretch gap-2 py-2">
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => step(-1)}
          className="grid h-12 w-12 shrink-0 self-center place-items-center rounded-full border border-line bg-surface text-3xl leading-none"
        >
          ‹
        </button>
        <article
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-line bg-surface"
          onPointerDown={(event) => {
            drag.current = event.clientX;
          }}
          onPointerUp={(event) => {
            const dx = event.clientX - drag.current;
            if (dx > 48) step(-1);
            else if (dx < -48) step(1);
          }}
        >
          {kind === "mission" ? (
            <img src={`/game/bg-${stage.id}.jpg`} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35" />
          ) : null}
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-3 text-center">
            {kind === "character" ? (
              <>
                <Portrait sheet={character.sheet} name={character.name} className="h-[22vh] max-h-36 w-auto" />
                <p className="text-[11px] font-semibold tracking-[0.16em] text-accent">{character.origin.toUpperCase()}</p>
                <h2 className="font-display text-[clamp(1.8rem,6vh,3rem)] leading-none">{character.name}</h2>
                <p className="text-sm text-muted">{character.role}</p>
                <p className="line-clamp-2 max-w-sm text-sm">{character.blurb}</p>
                <p className="text-xs text-muted">
                  Vida {character.hp} · Paso {character.speed} · {traitOf(character)}
                </p>
              </>
            ) : null}
            {kind === "weapon" ? (
              <>
                <span className="grid h-20 w-20 place-items-center rounded-full border border-accent text-fg">
                  <IconGun />
                </span>
                <h2 className="font-display text-[clamp(1.8rem,6vh,3rem)] leading-none">{weapon.name}</h2>
                <p className="line-clamp-2 max-w-sm text-sm">{weapon.blurb}</p>
                <p className="text-xs text-muted">
                  Daño {weapon.dmg} · Cadencia {weapon.rate.toFixed(2)}s ·{" "}
                  {weapon.kind === "laser" ? "Haz" : weapon.kind === "rocket" ? "Explosión" : weapon.kind === "flame" ? "Llama" : "Balas"}
                </p>
              </>
            ) : null}
            {kind === "mission" ? (
              <>
                <p className="font-display text-3xl leading-none text-accent">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="font-display text-[clamp(1.8rem,6vh,3rem)] leading-none">{stage.country}</h2>
                <p className="text-sm text-muted">
                  {stage.place} · {stage.name}
                </p>
                <p className="line-clamp-2 max-w-sm text-sm">{stage.briefing}</p>
                <ul className="max-w-sm space-y-0.5 text-xs">
                  {stage.missions.map((mission) => (
                    <li key={mission.id} className="truncate">
                      {mission.text}
                    </li>
                  ))}
                </ul>
                <Stars count={save.stars[stage.id] ?? 0} />
                <p className="text-xs text-muted">Jefe: {stage.boss}</p>
              </>
            ) : null}
            {!open ? (
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-accent">
                <Lock className="size-3.5" /> {lockText}
              </p>
            ) : null}
          </div>
        </article>
        <button
          type="button"
          aria-label="Siguiente"
          onClick={() => step(1)}
          className="grid h-12 w-12 shrink-0 self-center place-items-center rounded-full border border-line bg-surface text-3xl leading-none"
        >
          ›
        </button>
      </div>
      <div className="flex shrink-0 justify-center gap-1.5 pb-2">
        {Array.from({ length: count }, (_, dot) => (
          <span key={dot} className={dot === index ? "h-1.5 w-4 bg-accent" : "h-1.5 w-1.5 bg-line"} />
        ))}
      </div>
      <button
        type="button"
        disabled={!open}
        onClick={choose}
        className="h-12 shrink-0 bg-primary font-display text-2xl tracking-wide text-fg disabled:opacity-50"
      >
        {open ? "Usar este" : lockText}
      </button>
    </div>
  );
}
