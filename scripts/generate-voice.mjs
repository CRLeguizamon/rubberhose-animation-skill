#!/usr/bin/env node
/**
 * Generador de voz con ElevenLabs API v4 (`eleven_v4`) para voz clonada.
 * Genera MP3 + captions.json (sin tags filtrados) + archivo .srt opcional en un solo paso.
 *
 * Uso:
 *   node scripts/generate-voice.mjs --check
 *   node scripts/generate-voice.mjs --file scripts/guion.txt --out public/audio/voz.mp3 --captions src/data/captions.json --srt out/video.srt
 */
import fs from "node:fs";
import path from "node:path";
import { captionsToSrt } from "./captions-to-srt.mjs";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

async function fetchWithRetry(url, init, attempts = 4) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      lastErr = err;
      if (i < attempts) await new Promise((r) => setTimeout(r, i * 1500));
    }
  }
  throw lastErr;
}

function alignmentToCaptions(alignment) {
  const chars = alignment?.characters ?? [];
  const starts = alignment?.character_start_times_seconds ?? [];
  const ends = alignment?.character_end_times_seconds ?? [];

  const captions = [];
  let buf = "";
  let wStart = null;
  let wEnd = null;
  let inBracket = false;
  let inAngle = false;

  const flush = () => {
    const cleaned = buf.trim();
    if (cleaned && wStart !== null && wEnd !== null && !/^[—–.,;:!?¿¡…-]+$/.test(cleaned)) {
      const startMs = Math.round(wStart * 1000);
      const endMs = Math.round(wEnd * 1000);
      captions.push({
        text: captions.length === 0 ? cleaned : ` ${cleaned}`,
        startMs,
        endMs,
        timestampMs: Math.round((startMs + endMs) / 2),
        confidence: 1,
      });
    }
    buf = "";
    wStart = null;
    wEnd = null;
  };

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === "[") { flush(); inBracket = true; continue; }
    if (ch === "]") { inBracket = false; continue; }
    if (ch === "<") { flush(); inAngle = true; continue; }
    if (ch === ">") { inAngle = false; continue; }
    if (inBracket || inAngle) continue;

    if (/\s/.test(ch)) {
      flush();
    } else {
      if (wStart === null) wStart = starts[i] ?? 0;
      wEnd = ends[i] ?? wStart;
      buf += ch;
    }
  }
  flush();
  return captions;
}

function parseArgs(argv) {
  const out = { check: false, file: "", out: "", captions: "", srt: "", stability: 0.45, similarity: 0.8 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--check") out.check = true;
    else if (a === "--file") out.file = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--captions") out.captions = argv[++i];
    else if (a === "--srt") out.srt = argv[++i];
    else if (a === "--stability") out.stability = Number(argv[++i]);
    else if (a === "--similarity") out.similarity = Number(argv[++i]);
  }
  return out;
}

loadEnv();
const args = parseArgs(process.argv.slice(2));
const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

if (!API_KEY || !VOICE_ID) {
  console.error("Falta ELEVENLABS_API_KEY o ELEVENLABS_VOICE_ID en .env");
  process.exit(1);
}

if (args.check) {
  const subRes = await fetchWithRetry("https://api.elevenlabs.io/v1/user/subscription", {
    headers: { "xi-api-key": API_KEY },
  });
  const sub = await subRes.json();
  console.log(
    `Suscripción ElevenLabs: tier=${sub.tier} | usados=${sub.character_count}/${sub.character_limit} | restantes=${sub.character_limit - sub.character_count}`
  );
  process.exit(0);
}

if (!args.file || !args.out || !args.captions) {
  console.error("Uso: node scripts/generate-voice.mjs --file <guion.txt> --out <voz.mp3> --captions <captions.json> [--srt <video.srt>]");
  process.exit(1);
}

const text = fs.readFileSync(path.resolve(process.cwd(), args.file), "utf8").trim();
const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=mp3_44100_128`;

const res = await fetchWithRetry(url, {
  method: "POST",
  headers: {
    "xi-api-key": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text,
    model_id: "eleven_v4",
    voice_settings: {
      stability: args.stability,
      similarity_boost: args.similarity,
    },
  }),
});

if (!res.ok) {
  console.error(`Error ElevenLabs (${res.status}): ${await res.text()}`);
  process.exit(1);
}

const charCost = res.headers.get("character-cost") ?? "N/A";
const data = await res.json();
const audioBuf = Buffer.from(data.audio_base64, "base64");

const outAudio = path.resolve(process.cwd(), args.out);
fs.mkdirSync(path.dirname(outAudio), { recursive: true });
fs.writeFileSync(outAudio, audioBuf);

const alignment = data.normalized_alignment ?? data.alignment;
const captions = alignmentToCaptions(alignment);
const outCaps = path.resolve(process.cwd(), args.captions);
fs.mkdirSync(path.dirname(outCaps), { recursive: true });
fs.writeFileSync(outCaps, JSON.stringify(captions, null, 2), "utf8");

if (args.srt) {
  const outSrt = path.resolve(process.cwd(), args.srt);
  fs.mkdirSync(path.dirname(outSrt), { recursive: true });
  fs.writeFileSync(outSrt, captionsToSrt(captions), "utf8");
  console.log(`SRT guardado: ${args.srt}`);
}

const totalSec = captions.length ? (captions[captions.length - 1].endMs / 1000).toFixed(2) : "0.00";
console.log(`Audio (eleven_v4) guardado: ${args.out} (${audioBuf.length} bytes)`);
console.log(`Subtítulos guardados: ${args.captions} (${captions.length} palabras, ~${totalSec}s)`);
console.log(`Texto enviado: ${text.length} caracteres | header character-cost: ${charCost}`);
