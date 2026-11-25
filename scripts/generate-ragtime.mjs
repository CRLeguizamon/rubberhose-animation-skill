#!/usr/bin/env node
/**
 * Música procedural estilo 1930 (foxtrot / ragtime con swing) en Node.js puro.
 * Piano "honky-tonk" + contrabajo pulsado + escobillas + bombo suave + filtro de disco antiguo.
 * Sin copyright, $0.00, determinista. También escribe beats.json para sincronizar el baile.
 *
 * Uso:
 *   node scripts/generate-ragtime.mjs --bpm 120 --bars 8 --out public/audio/ragtime.wav --beats src/data/beats.json
 */
import fs from "node:fs";
import path from "node:path";

const SR = 44100;

function parseArgs(argv) {
  const a = { bpm: 120, bars: 8, seed: 1930, swing: 0.667, tail: 0.6, out: "public/audio/ragtime.wav", beats: "src/data/beats.json" };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--bpm") a.bpm = Number(argv[++i]);
    else if (k === "--bars") a.bars = Number(argv[++i]);
    else if (k === "--seed") a.seed = Number(argv[++i]);
    else if (k === "--swing") a.swing = Number(argv[++i]);
    else if (k === "--tail") a.tail = Number(argv[++i]);
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

// Progresión de 8 compases: C | C | A7 | A7 | D7 | G7 | C | G7 (y vuelve a C)
const BARS = [
  { chord: [60, 64, 67], bass: [36, 43], melody: [79, null, 76, 79, 84, null, 79, 76] },
  { chord: [60, 64, 67], bass: [36, 43], melody: [72, 74, 76, null, 79, null, 76, null] },
  { chord: [61, 64, 67, 69], bass: [45, 40], melody: [76, null, 73, 76, 81, null, 79, 76] },
  { chord: [61, 64, 67, 69], bass: [45, 40], melody: [73, 75, 76, null, 81, null, 76, null] },
  { chord: [60, 62, 66, 69], bass: [38, 45], melody: [74, null, 78, 81, 84, null, 81, 78] },
  { chord: [59, 62, 65, 67], bass: [43, 38], melody: [79, null, 83, 79, 77, null, 74, 71] },
  { chord: [60, 64, 67], bass: [36, 43], melody: [72, null, 76, 79, 84, null, 79, 76] },
  { chord: [59, 62, 65, 67], bass: [43, 38], melody: [83, null, 79, 77, 74, null, 71, 67] },
];

function addPiano(buf, midi, t0, dur, vel, rng) {
  const s0 = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.08) * SR);
  const f0 = mtof(midi);
  const decScale = Math.pow(2, (60 - midi) / 30);
  const H = [
    [1, 1.0, 1.1], [2, 0.62, 0.8], [3, 0.4, 0.55], [4, 0.26, 0.4],
    [5, 0.18, 0.3], [6, 0.11, 0.22], [7, 0.07, 0.16], [8, 0.04, 0.12],
  ];
  const detunes = [1 - 0.0035, 1 + 0.0035]; // dos cuerdas desafinadas = sonido de piano de bar
  const ph = [rng() * 6.28, rng() * 6.28];
  const end = Math.min(buf.length, s0 + len);
  for (let i = s0; i < end; i++) {
    const n = i - s0;
    const t = n / SR;
    const atk = n < 0.004 * SR ? n / (0.004 * SR) : 1;
    const cut = Math.max(0, Math.min(1, (dur + 0.05 - t) / 0.05));
    let s = 0;
    for (let d = 0; d < 2; d++) {
      for (const [k, amp, dec] of H) {
        const f = f0 * k * detunes[d];
        if (f > 9000) continue;
        s += Math.sin(2 * Math.PI * f * t + ph[d]) * amp * Math.exp(-t / (dec * decScale));
      }
    }
    buf[i] += s * 0.085 * vel * atk * cut;
  }
}

function addBass(buf, midi, t0, dur, vel, rng) {
  const s0 = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.1) * SR);
  const f0 = mtof(midi);
  const end = Math.min(buf.length, s0 + len);
  for (let i = s0; i < end; i++) {
    const n = i - s0;
    const t = n / SR;
    const env = Math.exp(-t / 0.28) * Math.min(1, n / (0.003 * SR));
    const click = n < 0.012 * SR ? (rng() * 2 - 1) * (1 - n / (0.012 * SR)) * 0.25 : 0;
    const s =
      Math.sin(2 * Math.PI * f0 * t) +
      0.5 * Math.sin(2 * Math.PI * f0 * 2 * t) * Math.exp(-t / 0.18) +
      0.22 * Math.sin(2 * Math.PI * f0 * 3 * t) * Math.exp(-t / 0.1);
    buf[i] += (s * env + click) * 0.26 * vel;
  }
}

function addKick(buf, t0, vel) {
  const s0 = Math.floor(t0 * SR);
  const len = Math.floor(0.2 * SR);
  let phase = 0;
  for (let i = 0; i < len && s0 + i < buf.length; i++) {
    const t = i / SR;
    const f = 48 + 60 * Math.exp(-t / 0.03);
    phase += (2 * Math.PI * f) / SR;
    buf[s0 + i] += Math.sin(phase) * Math.exp(-t / 0.07) * 0.32 * vel;
  }
}

function addBrush(buf, t0, dur, vel, rng, bright = 1) {
  const s0 = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  let lp = 0;
  let hp = 0;
  for (let i = 0; i < len && s0 + i < buf.length; i++) {
    const t = i / SR;
    const w = rng() * 2 - 1;
    lp += (w - lp) * (0.55 * bright);
    hp = hp * 0.82 + (lp - hp) * 0.18;
    const x = lp - hp;
    const env = Math.min(1, t / 0.02) * Math.exp(-t / (dur * 0.35));
    buf[s0 + i] += x * env * 0.5 * vel;
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

// Posición de la corchea i (0..7) en el compás, con swing (la segunda corchea cae en 2/3 del pulso)
const eighthAt = (i) => (Math.floor(i / 2) + (i % 2 ? args.swing : 0)) * beat;

for (let b = 0; b < args.bars; b++) {
  const bar = BARS[b % BARS.length];
  const t0 = b * barSec;

  // Contrabajo en dos tiempos (raíz en 1, quinta en 3) y bombo suave
  addBass(buf, bar.bass[0], t0 + 0 * beat, beat * 0.9, 1.0, rng);
  addBass(buf, bar.bass[1], t0 + 2 * beat, beat * 0.9, 0.9, rng);
  addKick(buf, t0 + 0 * beat, 0.8);
  addKick(buf, t0 + 2 * beat, 0.7);

  // Mano izquierda "oom-pah": acordes en contratiempos 2 y 4
  for (const k of [1, 3]) {
    bar.chord.forEach((m, j) => addPiano(buf, m, t0 + k * beat + j * 0.006, beat * 0.42, 0.5, rng));
  }

  // Escobillas: caja en 2 y 4, swish continuo en corcheas con swing
  addBrush(buf, t0 + 1 * beat, 0.16, 0.9, rng, 1);
  addBrush(buf, t0 + 3 * beat, 0.16, 0.9, rng, 1);
  for (let i = 0; i < 8; i++) addBrush(buf, t0 + eighthAt(i), 0.07, i % 2 ? 0.28 : 0.2, rng, 0.7);

  // Melodía de mano derecha, sincopada
  bar.melody.forEach((m, i) => {
    if (m === null) return;
    const jitter = (rng() - 0.5) * 0.008;
    addPiano(buf, m, t0 + eighthAt(i) + jitter, beat * 0.38, 0.55 + rng() * 0.2, rng);
  });
}

// Final "ta-da": acorde de Do con sexta + bajo + platillo de escobilla
const tEnd = musicSec;
[60, 64, 67, 72].forEach((m, j) => addPiano(buf, m, tEnd + j * 0.01, 0.55, 0.95, rng));
addBass(buf, 36, tEnd, 0.6, 1.0, rng);
addKick(buf, tEnd, 1.0);
addBrush(buf, tEnd, 0.5, 1.2, rng, 1.2);

// Filtro de disco antiguo: pasa-banda ~180 Hz - 4.5 kHz + crujido leve
onePoleHP(buf, 180);
onePoleLP(buf, 4500);
onePoleLP(buf, 6000);
for (let i = 0; i < total; i++) {
  if (rng() < 0.00012) buf[i] += (rng() * 2 - 1) * 0.05;
  buf[i] += (rng() * 2 - 1) * 0.004;
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
  JSON.stringify({ bpm: args.bpm, bars: args.bars, beatSec: beat, musicSec, swing: args.swing, beats }, null, 2)
);
console.log(`[OK] ${args.out} (${(total / SR).toFixed(1)} s, ${args.bpm} bpm, ${args.bars} compases, mono 1930, $0.00)`);
console.log(`[OK] ${args.beats} (${beats.length} pulsos)`);
