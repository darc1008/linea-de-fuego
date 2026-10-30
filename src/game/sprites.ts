const CELL = 160;

type SheetSpec = { url: string; cols: number; rows: number };

const SHEETS: Record<string, SheetSpec> = {
  rico: { url: "/game/rico.jpg", cols: 2, rows: 2 },
  lina: { url: "/game/lina.jpg", cols: 2, rows: 2 },
  bruno: { url: "/game/bruno.jpg", cols: 2, rows: 2 },
  yuki: { url: "/game/yuki.jpg", cols: 2, rows: 2 },
  anya: { url: "/game/anya.jpg", cols: 2, rows: 2 },
  grunt: { url: "/game/grunt.jpg", cols: 2, rows: 2 },
  hopper: { url: "/game/hopper.jpg", cols: 2, rows: 2 },
  flyer: { url: "/game/flyer.jpg", cols: 2, rows: 2 },
  turret: { url: "/game/turret.jpg", cols: 2, rows: 2 },
  boss: { url: "/game/boss.jpg", cols: 2, rows: 2 },
  explosion: { url: "/game/explosion.jpg", cols: 2, rows: 2 },
  bullet: { url: "/game/bullet.jpg", cols: 2, rows: 2 },
  muzzle: { url: "/game/muzzle.jpg", cols: 2, rows: 2 },
  pickups: { url: "/game/pickups.jpg", cols: 2, rows: 2 },
  medkit: { url: "/game/medkit.jpg", cols: 1, rows: 1 },
};

const BG: Record<string, string> = {
  mexico: "/game/bg-mexico.jpg",
  colombia: "/game/bg-colombia.jpg",
  brasil: "/game/bg-brasil.jpg",
  egipto: "/game/bg-egipto.jpg",
  japon: "/game/bg-japon.jpg",
  rusia: "/game/bg-rusia.jpg",
};

const frames = new Map<string, HTMLCanvasElement[]>();
const backgrounds = new Map<string, HTMLImageElement>();
let started = false;

function isMagenta(r: number, g: number, b: number) {
  return min(r, b) - g > 70 && r > 140 && b > 110;
}

function min(a: number, b: number) {
  return a < b ? a : b;
}

function slice(img: HTMLImageElement, cols: number, rows: number): HTMLCanvasElement[] {
  const cw = Math.floor(img.width / cols);
  const ch = Math.floor(img.height / rows);
  const out: HTMLCanvasElement[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const src = document.createElement("canvas");
      src.width = cw;
      src.height = ch;
      const sctx = src.getContext("2d");
      if (!sctx) continue;
      sctx.drawImage(img, col * cw, row * ch, cw, ch, 0, 0, cw, ch);
      const data = sctx.getImageData(0, 0, cw, ch);
      let minX = cw;
      let minY = ch;
      let maxX = 0;
      let maxY = 0;
      let any = false;
      for (let i = 0; i < data.data.length; i += 4) {
        const r = data.data[i];
        const g = data.data[i + 1];
        const b = data.data[i + 2];
        if (isMagenta(r, g, b)) {
          data.data[i + 3] = 0;
          continue;
        }
        const p = i / 4;
        const x = p % cw;
        const y = Math.floor(p / cw);
        any = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      sctx.putImageData(data, 0, 0);
      const cell = document.createElement("canvas");
      cell.width = CELL;
      cell.height = CELL;
      const octx = cell.getContext("2d");
      if (octx && any) {
        const bw = Math.max(1, maxX - minX + 1);
        const bh = Math.max(1, maxY - minY + 1);
        const scale = Math.min((CELL * 0.9) / bw, (CELL * 0.9) / bh);
        const dw = bw * scale;
        const dh = bh * scale;
        octx.imageSmoothingEnabled = false;
        octx.drawImage(src, minX, minY, bw, bh, (CELL - dw) / 2, CELL - dh, dw, dh);
      }
      out.push(cell);
    }
  }
  return out;
}

function loadSheet(id: string, spec: SheetSpec) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    frames.set(id, slice(img, spec.cols, spec.rows));
  };
  img.src = spec.url;
}

function loadBg(id: string, url: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => backgrounds.set(id, img);
  img.src = url;
}

export function preloadGameArt() {
  if (started || typeof window === "undefined") return;
  started = true;
  for (const [id, spec] of Object.entries(SHEETS)) loadSheet(id, spec);
  for (const [id, url] of Object.entries(BG)) loadBg(id, url);
}

export function sheetFrames(id: string): HTMLCanvasElement[] | null {
  return frames.get(id) ?? null;
}

export function bgImage(id: string): HTMLImageElement | null {
  return backgrounds.get(id) ?? null;
}

export function drawSheet(
  ctx: CanvasRenderingContext2D,
  id: string,
  frame: number,
  footX: number,
  footY: number,
  height: number,
  flip: boolean,
) {
  const set = frames.get(id);
  if (!set || set.length === 0) return false;
  const sprite = set[Math.abs(frame) % set.length];
  ctx.save();
  ctx.translate(footX, footY);
  if (flip) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite, -height / 2, -height, height, height);
  ctx.restore();
  return true;
}
