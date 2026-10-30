import type { ReactNode } from "react";
import type { CharacterId, WeaponId } from "@/game/content";
import { CHARACTERS, STAGES, WEAPONS, characterById, weaponById } from "@/game/content";
import { stageOpen, weaponUnlocked, charUnlocked } from "@/game/save";
import type { Save } from "@/game/save";
import { IconGun } from "./ControlButtons";
import { Portrait, SoundButton, Stars, XpBar, traitOf } from "./ui-bits";

export function Hub({
  save,
  stageId,
  onSound,
  onPick,
  onDeploy,
}: {
  save: Save;
  stageId: string;
  onSound: () => void;
  onPick: (kind: "character" | "weapon" | "mission") => void;
  onDeploy: () => void;
}) {
  const character = characterById(save.characterId);
  const weapon = weaponById(save.weaponId);
  const stageIndex = Math.max(0, STAGES.findIndex((stage) => stage.id === stageId));
  const stage = STAGES[stageIndex];
  const open = stageOpen(save, stageIndex);
  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col gap-2 overflow-hidden px-3 py-3">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-accent">LÍNEA DE FUEGO</p>
          <h1 className="font-display text-3xl leading-none">Cuartel</h1>
        </div>
        <SoundButton on={save.sound} onClick={onSound} />
      </header>
      <XpBar xp={save.xp} />
      <div className="hub-picks grid min-h-0 flex-1 grid-cols-1 gap-2">
        <PickRow
          kicker="Personaje"
          title={character.name}
          detail={`${character.role} · ${character.origin}`}
          onClick={() => onPick("character")}
        >
          <Portrait sheet={character.sheet} name={character.name} className="h-14 w-14" />
        </PickRow>
        <PickRow kicker="Arma" title={weapon.name} detail={weapon.blurb} onClick={() => onPick("weapon")}>
          <span className="grid h-14 w-14 place-items-center rounded-full border border-line bg-base-2 text-fg">
            <IconGun />
          </span>
        </PickRow>
        <PickRow
          kicker="Misión"
          title={stage.country}
          detail={`${stage.place} · ${stage.name}`}
          onClick={() => onPick("mission")}
        >
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-line">
            <img src={`/game/bg-${stage.id}.jpg`} alt="" className="h-full w-full object-cover" />
          </span>
        </PickRow>
      </div>
      <button
        type="button"
        disabled={!open}
        onClick={onDeploy}
        className="h-12 shrink-0 bg-primary font-display text-2xl tracking-wide text-fg disabled:opacity-50"
      >
        {open ? "Desplegar" : "Misión cerrada"}
      </button>
    </div>
  );
}

function PickRow({
  kicker,
  title,
  detail,
  onClick,
  children,
}: {
  kicker: string;
  title: string;
  detail: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-0 items-center gap-3 border border-line bg-surface px-3 py-2 text-left"
    >
      <span className="shrink-0">{children}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold tracking-[0.16em] text-accent">{kicker.toUpperCase()}</span>
        <span className="block truncate font-display text-2xl leading-none">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted">{detail}</span>
      </span>
      <span className="shrink-0 text-sm text-muted">Cambiar</span>
    </button>
  );
}

