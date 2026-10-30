import { useEffect, useRef, useState } from "react";
import { STAGES } from "@/game/content";
import { levelFromXp } from "@/game/content";
import { setMood, setMuted, unlockAudio } from "@/game/audio";
import { preloadGameArt } from "@/game/sprites";
import {
  SAVE_KEY,
  applyRun,
  charUnlocked,
  defaultSave,
  loadSave,
  stageOpen,
  weaponUnlocked,
  writeSave,
  type Save,
} from "@/game/save";
import { Hub } from "./HubScreen";
import { Picker } from "./PickerScreen";
import { Play } from "./PlayScreen";
import { Result } from "./ResultScreen";
import type { Screen } from "./screen-types";
import { Title } from "./TitleScreen";

export function FrontApp() {
  const [save, setSave] = useState<Save>(() => defaultSave());
  const [screen, setScreen] = useState<Screen>({ name: "title" });
  const [stageId, setStageId] = useState("mexico");
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    preloadGameArt();
    setMood("menu");
    const loaded = loadSave();
    if (!localStorage.getItem(SAVE_KEY) && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      loaded.shake = false;
    }
    setSave(loaded);
    setMuted(!loaded.sound);
    const nextIndex = STAGES.findIndex((stage, index) => stageOpen(loaded, index) && !loaded.cleared.includes(stage.id));
    setStageId(STAGES[nextIndex >= 0 ? nextIndex : 0].id);
  }, []);

  function commit(next: Save) {
    setSave(next);
    writeSave(next);
    setMuted(!next.sound);
  }

  function poke() {
    unlockAudio();
    setMuted(!saveRef.current.sound);
  }

  const level = levelFromXp(save.xp);

  return (
    <div className="h-dvh overflow-hidden bg-base text-fg">
      {screen.name === "title" ? (
        <Title
          onEnter={() => {
            poke();
            setScreen({ name: "hub" });
          }}
          sound={save.sound}
          onSound={() => {
            poke();
            commit({ ...save, sound: !save.sound });
          }}
        />
      ) : null}

      {screen.name === "hub" ? (
        <Hub
          save={save}
          stageId={stageId}
          onSound={() => {
            poke();
            commit({ ...save, sound: !save.sound });
          }}
          onPick={(kind) => {
            poke();
            setScreen({ name: "pick", kind });
          }}
          onDeploy={() => {
            poke();
            setScreen({ name: "play", stageId, nonce: Date.now() });
          }}
        />
      ) : null}

      {screen.name === "pick" ? (
        <Picker
          key={screen.kind}
          kind={screen.kind}
          save={save}
          level={level}
          stageId={stageId}
          onBack={() => setScreen({ name: "hub" })}
          onChooseCharacter={(id) => {
            poke();
            if (!charUnlocked(save, id)) return;
            commit({ ...save, characterId: id });
            setScreen({ name: "hub" });
          }}
          onChooseWeapon={(id) => {
            poke();
            if (!weaponUnlocked(save, id)) return;
            commit({ ...save, weaponId: id });
            setScreen({ name: "hub" });
          }}
          onChooseStage={(id) => {
            poke();
            const index = STAGES.findIndex((stage) => stage.id === id);
            if (!stageOpen(save, index)) return;
            setStageId(id);
            setScreen({ name: "hub" });
          }}
        />
      ) : null}

      {screen.name === "play" ? (
        <Play
          key={screen.nonce}
          save={save}
          stageId={screen.stageId}
          onAbort={() => {
            setMood("menu");
            setScreen({ name: "hub" });
          }}
          onEnd={(win, stats) => {
            const applied = applyRun(saveRef.current, screen.stageId, stats, win);
            writeSave(applied.save);
            setSave(applied.save);
            setMood("menu");
            setScreen({
              name: "result",
              stageId: screen.stageId,
              win,
              xp: applied.xp,
              unlocks: applied.unlocks,
              missions: applied.missions,
              levelBefore: applied.levelBefore,
              levelAfter: applied.levelAfter,
              stats,
            });
          }}
        />
      ) : null}

      {screen.name === "result" ? (
        <Result
          screen={screen}
          onHub={() => setScreen({ name: "hub" })}
          onRetry={() => setScreen({ name: "play", stageId: screen.stageId, nonce: Date.now() })}
          onNext={() => {
            const index = STAGES.findIndex((stage) => stage.id === screen.stageId);
            const next = STAGES[index + 1];
            if (next && stageOpen(save, index + 1)) {
              setStageId(next.id);
              setScreen({ name: "play", stageId: next.id, nonce: Date.now() });
            } else setScreen({ name: "hub" });
          }}
        />
      ) : null}
    </div>
  );
}
