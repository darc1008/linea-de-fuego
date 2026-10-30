let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let noise: AudioBuffer | null = null;
let voices = 0;
let muted = false;
let mood: "menu" | "fight" | "boss" = "menu";
let musicOn = false;
let step = 0;
let nextBeat = 0;

function ensure() {
  if (ctx) return;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new Ctx({ latencyHint: "interactive" });
  master = ctx.createGain();
  musicBus = ctx.createGain();
  sfxBus = ctx.createGain();
  master.gain.value = 0.85;
  musicBus.gain.value = 0.22;
  sfxBus.gain.value = 0.55;
  musicBus.connect(master);
  sfxBus.connect(master);
  master.connect(ctx.destination);
  const length = ctx.sampleRate * 0.4;
  noise = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void ctx?.resume();
  });
}

export function unlockAudio() {
  ensure();
  if (ctx && ctx.state === "suspended") void ctx.resume();
  if (!musicOn) {
    musicOn = true;
    nextBeat = ctx!.currentTime + 0.05;
    schedule();
  }
}

export function setMuted(next: boolean) {
  muted = next;
  if (!ctx || !master) return;
  master.gain.setTargetAtTime(next ? 0 : 0.85, ctx.currentTime, 0.03);
}

export function setMood(next: "menu" | "fight" | "boss") {
  mood = next;
}

function schedule() {
  if (!ctx || !musicBus || !musicOn) return;
  const horizon = ctx.currentTime + 0.4;
  const beat = mood === "boss" ? 0.24 : mood === "fight" ? 0.3 : 0.46;
  const scale = mood === "menu" ? [49, 55, 62, 41, 55] : mood === "boss" ? [41, 49, 39, 46, 37] : [46, 55, 49, 65, 44];
  while (nextBeat < horizon) {
    const freq = scale[step % scale.length];
    tone(freq, 0.18, "triangle", 0.18, musicBus, nextBeat, freq * 0.5);
    if (step % 2 === 0) hat(nextBeat);
    step += 1;
    nextBeat += beat;
  }
  window.setTimeout(schedule, 120);
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain: number,
  bus: GainNode,
  when: number,
  slide?: number,
) {
  if (!ctx || muted || voices > 18) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slide), when + dur);
  amp.gain.setValueAtTime(0.0001, when);
  amp.gain.exponentialRampToValueAtTime(gain, when + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(amp);
  amp.connect(bus);
  osc.start(when);
  osc.stop(when + dur + 0.02);
  voices += 1;
  osc.onended = () => {
    voices = Math.max(0, voices - 1);
    osc.disconnect();
    amp.disconnect();
  };
}

function hat(when: number) {
  if (!ctx || !noise || !musicBus || muted) return;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1800;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.05, when);
  amp.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
  src.connect(filter);
  filter.connect(amp);
  amp.connect(musicBus);
  src.start(when);
  src.stop(when + 0.06);
}

function blip(freq: number, dur: number, type: OscillatorType, gain: number, slide?: number) {
  if (!ctx || !sfxBus) return;
  tone(freq * (0.94 + Math.random() * 0.12), dur, type, gain, sfxBus, ctx.currentTime, slide);
}

function burst(dur: number, gain: number) {
  if (!ctx || !noise || !sfxBus || muted) return;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + dur);
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(gain, ctx.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  src.connect(filter);
  filter.connect(amp);
  amp.connect(sfxBus);
  src.start();
  src.stop(ctx.currentTime + dur + 0.02);
}

export function sfxShoot(kind: string) {
  if (kind === "laser") blip(880, 0.07, "square", 0.05, 1320);
  else if (kind === "rocket") blip(140, 0.18, "sawtooth", 0.08, 60);
  else if (kind === "flame") blip(180, 0.05, "sawtooth", 0.03, 90);
  else blip(520, 0.05, "square", 0.045, 220);
}

export function sfxJump() {
  blip(280, 0.09, "square", 0.04, 520);
}

export function sfxHit() {
  blip(160, 0.08, "sawtooth", 0.06, 70);
}

export function sfxHurt() {
  blip(110, 0.16, "sawtooth", 0.08, 50);
  burst(0.12, 0.08);
}

export function sfxExplosion() {
  burst(0.28, 0.16);
  blip(90, 0.2, "square", 0.06, 40);
}

export function sfxPickup() {
  blip(620, 0.08, "square", 0.05, 880);
}

export function sfxDeath() {
  blip(200, 0.28, "sawtooth", 0.08, 50);
}

export function sfxWin() {
  blip(523, 0.12, "square", 0.05);
  window.setTimeout(() => blip(659, 0.12, "square", 0.05), 110);
  window.setTimeout(() => blip(784, 0.2, "square", 0.06), 220);
}
