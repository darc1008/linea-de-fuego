import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Rebuild game images from base64 text committed beside them.
 * Looks for public/game/*.b64, other public *.b64 images, and
 * optional chunk files named "<path>.b64.00", "<path>.b64.01", ...
 * Chunks are concatenated in order, decoded, and written without the .b64 suffix.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
}

function classify(rel) {
  const chunk = rel.match(/^(.*?)\.b64\.(\d+)$/);
  if (chunk) return { target: chunk[1], part: Number(chunk[2]) };
  if (rel.endsWith(".b64")) return { target: rel.slice(0, -4), part: -1 };
  return null;
}

const groups = new Map();
for (const abs of await walk(join(root, "public"))) {
  const rel = relative(root, abs).split("\\").join("/");
  const info = classify(rel);
  if (!info) continue;
  if (!groups.has(info.target)) groups.set(info.target, []);
  groups.get(info.target).push({ abs, part: info.part });
}

for (const abs of await walk(join(root, "android"))) {
  const rel = relative(root, abs).split("\\").join("/");
  const info = classify(rel);
  if (!info) continue;
  if (!groups.has(info.target)) groups.set(info.target, []);
  groups.get(info.target).push({ abs, part: info.part });
}

if (groups.size === 0) {
  console.log("No .b64 art files found.");
  process.exit(0);
}

for (const target of [...groups.keys()].sort()) {
  const parts = groups.get(target);
  parts.sort((a, b) => a.part - b.part || a.abs.localeCompare(b.abs));
  let b64 = "";
  for (const part of parts) {
    b64 += (await readFile(part.abs, "utf8")).replace(/\s+/g, "");
  }
  const bytes = Buffer.from(b64, "base64");
  await writeFile(join(root, target), bytes);
  console.log(`restored ${target} (${bytes.length} bytes)`);
}
