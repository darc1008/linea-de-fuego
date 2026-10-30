import type { RunStats } from "@/game/save";

export type Screen =
  | { name: "title" }
  | { name: "hub" }
  | { name: "pick"; kind: "character" | "weapon" | "mission" }
  | { name: "play"; stageId: string; nonce: number }
  | {
      name: "result";
      stageId: string;
      win: boolean;
      xp: number;
      unlocks: string[];
      missions: { id: string; text: string; done: boolean }[];
      levelBefore: number;
      levelAfter: number;
      stats: RunStats;
    };
