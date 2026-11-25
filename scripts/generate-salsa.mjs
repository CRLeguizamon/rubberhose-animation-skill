#!/usr/bin/env node
/**
 * Música procedural de Salsa / Son Montuno vintage (Node.js puro, sin copyright, $0.00).
 * Piano montuno (Am - G - F - E7) + bajo tumbao + clave 2-3 + cencerro (cowbell) + conga.
 *
 * Uso:
 *   node scripts/generate-salsa.mjs --bpm 120 --bars 8 --out public/audio/salsa-vintage.wav --beats src/data/beats-salsa.json
 */
import fs from "node:fs";
import path from "node:path";

const SR = 44100;

function parseArgs(argv) {
  const a = {
    bpm: 120,
    bars: 8,
    seed: 1973,
    tail: 0.7,
    out: "public/audio/salsa-vintage.wav",
    beats: "src/data/beats-salsa.json",
  };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--bpm") a.bpm = Number(argv[++i]);
    else if (k === "--bars") a.bars = Number(argv[++i]);
    else if (k === "--seed") a.seed = Number(argv[++i]);
    else if (k === "--out") a.out = argv[++i];
    else if (k === "--beats") a.beats = argv[++i];
  }
  return a;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Progresión andaluza clásica de salsa: Am | G | F | E7 (se repite en escena 2 con más brillo)
const PROG = [
  { root: 45, fifth: 40, chord: [57, 60, 64], high: 69 }, // Am
  { root: 43, fifth: 38, chord: [55, 59, 62], high: 67 }, // G
  { root: 41, fifth: 36, chord: [53, 57, 60], high: 65 }, // F
  { root: 40, fifth: 47, chord: [52, 56, 59], high: 64 }, // E7
];

function addMontunoPiano(buf, midi, t0, dur, vel, rng) {
  const s0 = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.08) * SR);
  const f0 = mtof(midi);
  const ph = rng() * 6.28;
  const end = Math.min(buf.length, s0 + len);
  const H = [
    [1, 1.0, 0.9],
    [2, 0.58, 0.65],
    [3, 0.35, 0.45],
    [4, 0.22, 0.3],
    [5, 0.14, 0.2],
  ];
  for (let i = s0; i < end; i++) {
    if (i < 0) continue;
    const n = i - s0;
    const t = n / SR;
    const atk = n < 0.004 * SR ? n / (0.004 * SR) : 1;
    const cut = Math.max(0, Math.min(1, (dur + 0.04 - t) / 0.04));
    let s = 0;
    for (const [k, amp, dec] of H) {
      s += Math.sin(2 * Math.PI * f0 * k * t + ph) * amp * Math.exp(-t / dec);
    }
    buf[i] += s * 0.12 * vel * atk * cut;
  }
}

function addTumbaoBass(buf, midi, t0, dur, vel) {
  const s0 = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.08) * SR);
  const f0 = mtof(midi);
  const end = Math.min(buf.length, s0 + len);
  for (let i = s0; i < end; i++) {
    if (i < 0) continue;
    const n = i - s0;
    const t = n / SR;
    const env = Math.min(1, n / (0.005 * SR)) * Math.exp(-t / 0.32);
    const s =
      Math.sin(2 * Math.PI * f0 * t) +
      0.42 * Math.sin(2 * Math.PI * f0 * 2 * t) * Math.exp(-t / 0.18);
    buf[i] += s * env * 0.3 * vel;
  }
}

/** Clave de madera (2-3) */
function addClave(buf, t0, vel) {
  const s0 = Math.floor(t0 * SR);
  const len = Math.floor(0.055 * SR);
  for (let i = 0; i < len && s0 + i < buf.length; i++) {
    const t = i / SR;
    const env = Math.exp(-t / 0.011);
    const s =
      Math.sin(2 * Math.PI * 2450 * t) +
      0.55 * Math.sin(2 * Math.PI * 3680 * t) * Math.exp(-t / 0.006);
    buf[s0 + i] += s * env * 0.18 * vel;
  }
}

/** Cencerro (campana de salsa) */
function addCowbell(buf, t0, vel) {
  const s0 = Math.floor(t0 * SR);
  const len = Math.floor(0.14 * SR);
  for (let i = 0; i < len && s0 + i < buf.length; i++) {
    const t = i / SR;
    const env = Math.exp(-t / 0.042);
    const s =
      Math.sin(2 * Math.PI * 560 * t) * 0.7 +
      Math.sin(2 * Math.PI * 845 * t) * 0.6;
    buf[s0 + i] += s * env * 0.11 * vel;
  }
}

/** Conga (golpe abierto o seco) */
function addConga(buf, t0, pitch, vel, rng) {
  const s0 = Math.floor(t0 * SR);
  const len = Math.floor(0.18 * SR);
  let phase = 0;
  for (let i = 0; i < len && s0 + i < buf.length; i++) {
    const t = i / SR;
    const f = pitch + 95 * Math.exp(-t / 0.018);
    phase += (2 * Math.PI * f) / SR;
    const slap = i < 0.008 * SR ? (rng() * 2 - 1) * 0.2 : 0;
    buf[s0 + i] += (Math.sin(phase) * Math.exp(-t / 0.065) + slap) * 0.22 * vel;
  }
}

function onePoleLP(buf, fc) {
  const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    y += a * (buf[i] - y);
    buf[i] = y;
  }
}
function onePoleHP(buf, fc) {
  const a = Math.exp((-2 * Math.PI * fc) / SR);
  let x1 = 0;
  let y1 = 0;
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i];
    y1 = a * (y1 + x - x1);
    x1 = x;
    buf[i] = y1;
  }
}

function writeWavMono2ch(file, buf) {
  const n = buf.length;
  const out = Buffer.alloc(44 + n * 4);
  out.write("RIFF", 0); out.writeUInt32LE(36 + n * 4, 4); out.write("WAVE", 8);
  out.write("fmt ", 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20);
  out.writeUInt16LE(2, 22); out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28);
  out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write("data", 36);
  out.writeUInt32LE(n * 4, 40);
  let o = 44;
  for (let i = 0; i < n; i++) {
    const v = Math.round(Math.max(-1, Math.min(1, buf[i])) * 32767);
    out.writeInt16LE(v, o); out.writeInt16LE(v, o + 2); o += 4;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
}

const args = parseArgs(process.argv.slice(2));
const rng = mulberry32(args.seed);
const beat = 60 / args.bpm;
const barSec = beat * 4;
const musicSec = args.bars * barSec;
const total = Math.ceil((musicSec + args.tail) * SR);
const buf = new Float32Array(total);

for (let b = 0; b < args.bars; b++) {
  const p = PROG[b % PROG.length];
  const t0 = b * barSec;
  const isNY = b >= Math.floor(args.bars / 2); // Escena 2: Nueva York (entra cencerro con más fuerza)

  // Bajo tumbao sincopado (tiempos 2.5 y 4)
  addTumbaoBass(buf, p.root, t0 + 0 * beat, beat * 0.9, 0.8);
  addTumbaoBass(buf, p.fifth, t0 + 1.5 * beat, beat * 0.9, 0.95);
  addTumbaoBass(buf, p.root, t0 + 3.0 * beat, beat * 0.9, 0.95);

  // Piano montuno clásico (corcheas sincopadas)
  const montunoSteps = [
    { off: 0.0, notes: [p.chord[0], p.high], vel: 0.72 },
    { off: 0.5, notes: [p.chord[1], p.chord[2]], vel: 0.58 },
    { off: 1.0, notes: [p.high], vel: 0.65 },
    { off: 1.5, notes: [p.chord[1], p.chord[2]], vel: 0.72 },
    { off: 2.5, notes: [p.chord[0], p.chord[2]], vel: 0.7 },
    { off: 3.0, notes: [p.high], vel: 0.62 },
    { off: 3.5, notes: [p.chord[1], p.chord[2]], vel: 0.75 },
  ];
  for (const st of montunoSteps) {
    for (const m of st.notes) {
      addMontunoPiano(buf, m, t0 + st.off * beat, beat * 0.42, st.vel * (isNY ? 1.08 : 0.95), rng);
    }
  }

  // Clave 2-3 (compás par: 2 golpes en 1 y 2; compás impar: 3 golpes en 0, 1.5, 3)
  if (b % 2 === 0) {
    addClave(buf, t0 + 1.0 * beat, 0.85);
    addClave(buf, t0 + 2.0 * beat, 0.9);
  } else {
    addClave(buf, t0 + 0.0 * beat, 0.95);
    addClave(buf, t0 + 1.5 * beat, 0.9);
    addClave(buf, t0 + 3.0 * beat, 0.95);
  }

  // Conga (tumbao básico)
  addConga(buf, t0 + 1.0 * beat, 230, 0.8, rng);
  addConga(buf, t0 + 3.0 * beat, 185, 0.95, rng);
  addConga(buf, t0 + 3.5 * beat, 185, 0.85, rng);

  // Cencerro entra fuerte en Escena 2 (Nueva York)
  if (isNY) {
    addCowbell(buf, t0 + 0.0 * beat, 0.9);
    addCowbell(buf, t0 + 1.0 * beat, 0.6);
    addCowbell(buf, t0 + 2.0 * beat, 0.95);
    addCowbell(buf, t0 + 3.0 * beat, 0.65);
  }
}

// Remate final en Am6
const tEnd = musicSec;
[57, 60, 64, 69].forEach((m, j) => addMontunoPiano(buf, m, tEnd + j * 0.01, 0.6, 0.95, rng));
addTumbaoBass(buf, 45, tEnd, 0.65, 1.0);
addCowbell(buf, tEnd, 1.0);
addConga(buf, tEnd, 185, 1.0, rng);

// Calidez vintage de vinilo
onePoleHP(buf, 110);
onePoleLP(buf, 5400);
for (let i = 0; i < total; i++) {
  if (rng() < 0.0001) buf[i] += (rng() * 2 - 1) * 0.04;
}

let peak = 0;
for (let i = 0; i < total; i++) peak = Math.max(peak, Math.abs(buf[i]));
const norm = peak > 0.001 ? 0.8 / peak : 1;
const fOut = Math.floor(0.35 * SR);
for (let i = 0; i < total; i++) {
  let e = norm;
  if (i > total - fOut) e *= (total - i) / fOut;
  buf[i] *= e;
}

writeWavMono2ch(args.out, buf);

const beats = [];
for (let i = 0; i < args.bars * 4; i++) beats.push(Number((i * beat).toFixed(4)));
fs.mkdirSync(path.dirname(args.beats), { recursive: true });
fs.writeFileSync(
  args.beats,
  JSON.stringify({ bpm: args.bpm, bars: args.bars, beatSec: beat, musicSec, beats }, null, 2)
);
console.log(`[OK] ${args.out} (${(total / SR).toFixed(1)} s, ${args.bpm} bpm, ${args.bars} compases, salsa vintage, $0.00)`);
