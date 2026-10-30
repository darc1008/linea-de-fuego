export const GROUND = 448;

export type CharacterId = "rico" | "lina" | "bruno" | "yuki" | "anya";
export type WeaponId = "fusil" | "rafaga" | "abanico" | "laser" | "cohete" | "llama";
export type SpawnKind = "grunt" | "hopper" | "flyer" | "turret" | "boss";
export type Weather = "dust" | "rain" | "snow" | "motes";

export type Character = {
  id: CharacterId;
  name: string;
  role: string;
  origin: string;
  blurb: string;
  unlock: number;
  hp: number;
  speed: number;
  jump: number;
  fire: number;
  damage: number;
  armor: number;
  doubleJump: boolean;
  crit: boolean;
  sheet: string;
};

export type Weapon = {
  id: WeaponId;
  name: string;
  unlock: number;
  blurb: string;
  rate: number;
  speed: number;
  dmg: number;
  pellets: number;
  spread: number;
  pierce: number;
  life: number;
  radius: number;
  splash: number;
  kind: "bullet" | "laser" | "rocket" | "flame";
};

export type Mission = {
  id: string;
  text: string;
  type: "clear" | "kills" | "kind" | "pickups" | "flawless";
  n?: number;
  kind?: SpawnKind;
};

export type Stage = {
  id: string;
  country: string;
  place: string;
  name: string;
  briefing: string;
  boss: string;
  length: number;
  slip: boolean;
  weather: Weather;
  skyTop: string;
  skyMid: string;
  ground: string;
  groundTop: string;
  pit: string;
  fade: string;
  plat: string;
  grounds: { x: number; w: number }[];
  platforms: { x: number; y: number; w: number }[];
  spawns: { kind: SpawnKind; x: number; y?: number }[];
  pickups: { kind: WeaponId | "med"; x: number; y: number }[];
  checkpoints: number[];
  missions: Mission[];
};

export const RANKS = [
  "Recluta",
  "Soldado",
  "Cabo",
  "Sargento",
  "Teniente",
  "Capitán",
  "Mayor",
  "Coronel",
  "Comandante",
  "General",
  "Leyenda",
  "Águila",
];

export const LEVEL_XP = [0, 80, 200, 380, 620, 920, 1280, 1700, 2200, 2800, 3500, 4300];

export const CHARACTERS: Character[] = [
  {
    id: "rico",
    name: "Rico Vega",
    role: "Comando",
    origin: "México",
    blurb: "Equilibrado. El que abre la brecha cuando nadie más quiere entrar.",
    unlock: 1,
    hp: 100,
    speed: 270,
    jump: 640,
    fire: 1,
    damage: 1,
    armor: 1,
    doubleJump: false,
    crit: false,
    sheet: "rico",
  },
  {
    id: "lina",
    name: "Lina Cruz",
    role: "Corredora",
    origin: "Colombia",
    blurb: "Más veloz y con segundo salto. El chaleco aguanta menos.",
    unlock: 3,
    hp: 82,
    speed: 325,
    jump: 690,
    fire: 0.88,
    damage: 0.95,
    armor: 1,
    doubleJump: true,
    crit: false,
    sheet: "lina",
  },
  {
    id: "bruno",
    name: "Bruno Alves",
    role: "Ariete",
    origin: "Brasil",
    blurb: "Mucha vida y balas que pesan. El suelo se entera cuando corre.",
    unlock: 5,
    hp: 150,
    speed: 215,
    jump: 575,
    fire: 1.12,
    damage: 1.3,
    armor: 1,
    doubleJump: false,
    crit: false,
    sheet: "bruno",
  },
  {
    id: "yuki",
    name: "Yuki Sato",
    role: "Precisión",
    origin: "Japón",
    blurb: "Cadencia alta. Cada cuarto disparo pega el doble.",
    unlock: 8,
    hp: 92,
    speed: 292,
    jump: 655,
    fire: 0.76,
    damage: 1.05,
    armor: 1,
    doubleJump: false,
    crit: true,
    sheet: "yuki",
  },
  {
    id: "anya",
    name: "Anya Volkov",
    role: "Blindada",
    origin: "Rusia",
    blurb: "El abrigo corta el daño. Cierra el círculo polar.",
    unlock: 12,
    hp: 124,
    speed: 248,
    jump: 630,
    fire: 0.96,
    damage: 1.12,
    armor: 0.7,
    doubleJump: false,
    crit: false,
    sheet: "anya",
  },
];

export const WEAPONS: Weapon[] = [
  {
    id: "fusil",
    name: "Fusil M-9",
    unlock: 1,
    blurb: "Infinito y honesto. El que no te deja tirado.",
    rate: 0.16,
    speed: 740,
    dmg: 12,
    pellets: 1,
    spread: 0,
    pierce: 0,
    life: 0.72,
    radius: 5,
    splash: 0,
    kind: "bullet",
  },
  {
    id: "rafaga",
    name: "Ráfaga",
    unlock: 2,
    blurb: "Mucho plomo, poco calibre. Aprietas y no sueltas.",
    rate: 0.07,
    speed: 800,
    dmg: 7,
    pellets: 1,
    spread: 0.05,
    pierce: 0,
    life: 0.55,
    radius: 4,
    splash: 0,
    kind: "bullet",
  },
  {
    id: "abanico",
    name: "Abanico",
    unlock: 4,
    blurb: "Tres trayectorias. Limpia un pasillo de un gatillazo.",
    rate: 0.22,
    speed: 640,
    dmg: 10,
    pellets: 3,
    spread: 0.34,
    pierce: 0,
    life: 0.62,
    radius: 5,
    splash: 0,
    kind: "bullet",
  },
  {
    id: "laser",
    name: "Láser",
    unlock: 6,
    blurb: "Atraviesa la fila entera.",
    rate: 0.13,
    speed: 1500,
    dmg: 16,
    pellets: 1,
    spread: 0,
    pierce: 8,
    life: 0.28,
    radius: 4,
    splash: 0,
    kind: "laser",
  },
  {
    id: "cohete",
    name: "Cohete",
    unlock: 9,
    blurb: "Lento, sucio y con radio. Para blindados.",
    rate: 0.5,
    speed: 440,
    dmg: 28,
    pellets: 1,
    spread: 0,
    pierce: 0,
    life: 1.1,
    radius: 7,
    splash: 86,
    kind: "rocket",
  },
  {
    id: "llama",
    name: "Llama",
    unlock: 11,
    blurb: "Corta distancia. Lo que entra en el cono no sale.",
    rate: 0.055,
    speed: 460,
    dmg: 5,
    pellets: 1,
    spread: 0.14,
    pierce: 8,
    life: 0.18,
    radius: 9,
    splash: 0,
    kind: "flame",
  },
];

const clear = (id: string, text: string): Mission => ({ id, text, type: "clear" });
const kills = (id: string, text: string, n: number): Mission => ({ id, text, type: "kills", n });
const kind = (id: string, text: string, k: SpawnKind, n: number): Mission => ({
  id,
  text,
  type: "kind",
  kind: k,
  n,
});

export const STAGES: Stage[] = [
  {
    id: "mexico",
    country: "México",
    place: "Sonora",
    name: "Muro de polvo",
    briefing: "La valla ya no es una frontera: es un nido. Cruza de noche y calla el blindado.",
    boss: "Toro blindado",
    length: 4500,
    slip: false,
    weather: "dust",
    skyTop: "#141a33",
    skyMid: "#3a2a28",
    ground: "#3d342c",
    groundTop: "#c4a574",
    pit: "#120c09",
    fade: "#1a120c",
    plat: "#4a4036",
    grounds: [
      { x: 0, w: 920 },
      { x: 1060, w: 1500 },
      { x: 2700, w: 1800 },
    ],
    platforms: [
      { x: 400, y: 340, w: 180 },
      { x: 1280, y: 330, w: 190 },
      { x: 1680, y: 250, w: 150 },
      { x: 2100, y: 340, w: 170 },
      { x: 3000, y: 320, w: 190 },
      { x: 3520, y: 360, w: 160 },
    ],
    spawns: [
      { kind: "grunt", x: 720 },
      { kind: "grunt", x: 860 },
      { kind: "grunt", x: 1240 },
      { kind: "grunt", x: 1500 },
      { kind: "hopper", x: 1800 },
      { kind: "flyer", x: 1900, y: 230 },
      { kind: "turret", x: 2140 },
      { kind: "grunt", x: 2300 },
      { kind: "grunt", x: 2920 },
      { kind: "hopper", x: 3200 },
      { kind: "grunt", x: 3400 },
      { kind: "flyer", x: 3600, y: 220 },
      { kind: "turret", x: 3700 },
      { kind: "grunt", x: 3800 },
      { kind: "boss", x: 4040 },
    ],
    pickups: [
      { kind: "med", x: 460, y: 292 },
      { kind: "abanico", x: 1740, y: 200 },
      { kind: "med", x: 3080, y: 270 },
    ],
    checkpoints: [160, 1300, 3000],
    missions: [
      clear("mx-c", "Cruza el muro de polvo"),
      kills("mx-k", "Derriba 10 hostiles", 10),
      { id: "mx-p", text: "Recoge un suministro", type: "pickups", n: 1 },
    ],
  },
  {
    id: "colombia",
    country: "Colombia",
    place: "Caquetá",
    name: "Río negro",
    briefing: "La selva escupe drones. Quédate en las ramas y no mires el agua.",
    boss: "Anaconda",
    length: 4660,
    slip: false,
    weather: "motes",
    skyTop: "#10241c",
    skyMid: "#1d4030",
    ground: "#2a3828",
    groundTop: "#7d9a62",
    pit: "#071612",
    fade: "#0c1a14",
    plat: "#3d4a34",
    grounds: [
      { x: 0, w: 720 },
      { x: 860, w: 1040 },
      { x: 2060, w: 860 },
      { x: 3080, w: 1580 },
    ],
    platforms: [
      { x: 400, y: 340, w: 160 },
      { x: 980, y: 320, w: 170 },
      { x: 1400, y: 240, w: 150 },
      { x: 1680, y: 330, w: 150 },
      { x: 2200, y: 300, w: 160 },
      { x: 2600, y: 230, w: 140 },
      { x: 3300, y: 310, w: 180 },
      { x: 3800, y: 250, w: 150 },
    ],
    spawns: [
      { kind: "grunt", x: 250 },
      { kind: "flyer", x: 600, y: 210 },
      { kind: "grunt", x: 1100 },
      { kind: "hopper", x: 1300 },
      { kind: "flyer", x: 1550, y: 190 },
      { kind: "grunt", x: 1750 },
      { kind: "turret", x: 1800 },
      { kind: "grunt", x: 2400 },
      { kind: "flyer", x: 2500, y: 200 },
      { kind: "hopper", x: 2700 },
      { kind: "grunt", x: 3500 },
      { kind: "turret", x: 3600 },
      { kind: "flyer", x: 4000, y: 210 },
      { kind: "boss", x: 4200 },
    ],
    pickups: [
      { kind: "med", x: 1040, y: 270 },
      { kind: "laser", x: 2240, y: 250 },
      { kind: "med", x: 3340, y: 260 },
    ],
    checkpoints: [160, 1200, 2300, 3400],
    missions: [
      clear("co-c", "Sal del río negro"),
      kind("co-f", "Derriba 3 drones", "flyer", 3),
      kills("co-k", "Derriba 9 hostiles", 9),
    ],
  },
  {
    id: "brasil",
    country: "Brasil",
    place: "Santos",
    name: "Muelle 7",
    briefing: "Las grúas no cargan fruta. Silencia las torretas antes del barco.",
    boss: "Grúa negra",
    length: 4760,
    slip: false,
    weather: "rain",
    skyTop: "#1b2438",
    skyMid: "#5a3a28",
    ground: "#32363c",
    groundTop: "#d07a45",
    pit: "#0c1016",
    fade: "#141820",
    plat: "#3e4650",
    grounds: [
      { x: 0, w: 1500 },
      { x: 1660, w: 1400 },
      { x: 3220, w: 1540 },
    ],
    platforms: [
      { x: 420, y: 350, w: 200 },
      { x: 980, y: 270, w: 170 },
      { x: 1900, y: 330, w: 180 },
      { x: 2400, y: 250, w: 160 },
      { x: 3500, y: 320, w: 200 },
      { x: 4000, y: 260, w: 160 },
    ],
    spawns: [
      { kind: "grunt", x: 320 },
      { kind: "turret", x: 560 },
      { kind: "grunt", x: 860 },
      { kind: "turret", x: 1200 },
      { kind: "grunt", x: 1900 },
      { kind: "hopper", x: 2000 },
      { kind: "turret", x: 2200 },
      { kind: "grunt", x: 2600 },
      { kind: "flyer", x: 2800, y: 210 },
      { kind: "turret", x: 3600 },
      { kind: "grunt", x: 3700 },
      { kind: "turret", x: 4050 },
      { kind: "boss", x: 4300 },
    ],
    pickups: [
      { kind: "med", x: 1040, y: 220 },
      { kind: "cohete", x: 2460, y: 200 },
      { kind: "med", x: 3560, y: 270 },
    ],
    checkpoints: [160, 1900, 3500],
    missions: [
      clear("br-c", "Toma el muelle 7"),
      kind("br-t", "Silencia 3 torretas", "turret", 3),
      kills("br-k", "Derriba 10 hostiles", 10),
    ],
  },
  {
    id: "egipto",
    country: "Egipto",
    place: "Luxor",
    name: "Tumba abierta",
    briefing: "Arena, saltadores y un escarabajo que no debería moverse.",
    boss: "Escarabajo",
    length: 4560,
    slip: false,
    weather: "dust",
    skyTop: "#3a2a18",
    skyMid: "#c4864a",
    ground: "#8a6840",
    groundTop: "#e6c48a",
    pit: "#2a160c",
    fade: "#3a2414",
    plat: "#a07848",
    grounds: [
      { x: 0, w: 1200 },
      { x: 1360, w: 1300 },
      { x: 2820, w: 1740 },
    ],
    platforms: [
      { x: 480, y: 340, w: 200 },
      { x: 1600, y: 310, w: 200 },
      { x: 2100, y: 240, w: 160 },
      { x: 3100, y: 330, w: 200 },
      { x: 3700, y: 260, w: 170 },
    ],
    spawns: [
      { kind: "hopper", x: 420 },
      { kind: "grunt", x: 700 },
      { kind: "hopper", x: 900 },
      { kind: "grunt", x: 1500 },
      { kind: "hopper", x: 1700 },
      { kind: "grunt", x: 2000 },
      { kind: "hopper", x: 2300 },
      { kind: "flyer", x: 2400, y: 200 },
      { kind: "grunt", x: 3000 },
      { kind: "hopper", x: 3300 },
      { kind: "turret", x: 3500 },
      { kind: "grunt", x: 3900 },
      { kind: "boss", x: 4100 },
    ],
    pickups: [
      { kind: "med", x: 540, y: 290 },
      { kind: "llama", x: 2140, y: 190 },
      { kind: "med", x: 3160, y: 280 },
    ],
    checkpoints: [160, 1600, 3100],
    missions: [
      clear("eg-c", "Sella la tumba"),
      kind("eg-h", "Derriba 4 saltadores", "hopper", 4),
      kills("eg-k", "Derriba 10 hostiles", 10),
    ],
  },
  {
    id: "japon",
    country: "Japón",
    place: "Yokohama",
    name: "Bahía roja",
    briefing: "Neón, muelles cortos y una bahía que no perdona el paso.",
    boss: "Kitsune",
    length: 5000,
    slip: false,
    weather: "motes",
    skyTop: "#12081c",
    skyMid: "#243056",
    ground: "#2a3144",
    groundTop: "#e23b5a",
    pit: "#070814",
    fade: "#100818",
    plat: "#3a4258",
    grounds: [
      { x: 0, w: 860 },
      { x: 1000, w: 760 },
      { x: 1900, w: 860 },
      { x: 2900, w: 700 },
      { x: 3740, w: 1260 },
    ],
    platforms: [
      { x: 300, y: 330, w: 150 },
      { x: 560, y: 250, w: 130 },
      { x: 1120, y: 320, w: 150 },
      { x: 1480, y: 240, w: 140 },
      { x: 2050, y: 310, w: 150 },
      { x: 2400, y: 230, w: 140 },
      { x: 3050, y: 320, w: 150 },
      { x: 3350, y: 240, w: 130 },
      { x: 3900, y: 300, w: 160 },
      { x: 4300, y: 240, w: 140 },
    ],
    spawns: [
      { kind: "grunt", x: 240 },
      { kind: "flyer", x: 500, y: 200 },
      { kind: "grunt", x: 700 },
      { kind: "grunt", x: 1200 },
      { kind: "hopper", x: 1400 },
      { kind: "flyer", x: 1600, y: 190 },
      { kind: "turret", x: 1650 },
      { kind: "grunt", x: 2100 },
      { kind: "flyer", x: 2300, y: 200 },
      { kind: "grunt", x: 2500 },
      { kind: "turret", x: 2600 },
      { kind: "grunt", x: 3100 },
      { kind: "hopper", x: 3300 },
      { kind: "flyer", x: 3400, y: 190 },
      { kind: "grunt", x: 4000 },
      { kind: "turret", x: 4200 },
      { kind: "boss", x: 4550 },
    ],
    pickups: [
      { kind: "med", x: 600, y: 200 },
      { kind: "laser", x: 2420, y: 180 },
      { kind: "med", x: 3920, y: 250 },
    ],
    checkpoints: [160, 1300, 2200, 4000],
    missions: [
      clear("jp-c", "Cierra la bahía roja"),
      kills("jp-k", "Derriba 12 hostiles", 12),
      kind("jp-f", "Derriba 3 drones", "flyer", 3),
    ],
  },
  {
    id: "rusia",
    country: "Rusia",
    place: "Murmansk",
    name: "Círculo polar",
    briefing: "El hielo no frena. El oso blanco, tampoco. Este es el último sector.",
    boss: "Oso blanco",
    length: 4960,
    slip: true,
    weather: "snow",
    skyTop: "#0c1824",
    skyMid: "#1c3a40",
    ground: "#c5d0d8",
    groundTop: "#eef3f6",
    pit: "#071018",
    fade: "#101820",
    plat: "#8aa0ae",
    grounds: [
      { x: 0, w: 980 },
      { x: 1120, w: 1040 },
      { x: 2300, w: 980 },
      { x: 3420, w: 1540 },
    ],
    platforms: [
      { x: 360, y: 320, w: 170 },
      { x: 1300, y: 290, w: 180 },
      { x: 1750, y: 220, w: 140 },
      { x: 2500, y: 300, w: 160 },
      { x: 2950, y: 230, w: 140 },
      { x: 3600, y: 310, w: 180 },
      { x: 4200, y: 240, w: 150 },
    ],
    spawns: [
      { kind: "grunt", x: 280 },
      { kind: "turret", x: 520 },
      { kind: "grunt", x: 700 },
      { kind: "flyer", x: 900, y: 200 },
      { kind: "grunt", x: 1400 },
      { kind: "hopper", x: 1600 },
      { kind: "turret", x: 1800 },
      { kind: "grunt", x: 2000 },
      { kind: "flyer", x: 2400, y: 190 },
      { kind: "grunt", x: 2600 },
      { kind: "hopper", x: 2800 },
      { kind: "turret", x: 3000 },
      { kind: "grunt", x: 3100 },
      { kind: "grunt", x: 3700 },
      { kind: "flyer", x: 3900, y: 200 },
      { kind: "turret", x: 4100 },
      { kind: "boss", x: 4500 },
    ],
    pickups: [
      { kind: "med", x: 400, y: 270 },
      { kind: "med", x: 1780, y: 170 },
      { kind: "cohete", x: 3640, y: 260 },
    ],
    checkpoints: [160, 1500, 2600, 3700],
    missions: [
      clear("ru-c", "Cierra el círculo polar"),
      kills("ru-k", "Derriba 12 hostiles", 12),
      kind("ru-t", "Silencia 3 torretas", "turret", 3),
    ],
  },
];

export function stageById(id: string): Stage {
  const stage = STAGES.find((s) => s.id === id);
  if (!stage) return STAGES[0];
  return stage;
}

export function characterById(id: CharacterId): Character {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}

export function weaponById(id: WeaponId): Weapon {
  return WEAPONS.find((w) => w.id === id) ?? WEAPONS[0];
}

export function levelFromXp(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) level = i + 1;
  }
  return level;
}

export function rankName(level: number): string {
  return RANKS[Math.min(RANKS.length, Math.max(1, level)) - 1] ?? "Águila";
}
