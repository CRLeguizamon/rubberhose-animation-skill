#!/usr/bin/env node
/**
 * Convierte un archivo captions.json (@remotion/captions) a formato estándar .srt
 * listo para YouTube, Reels, TikTok, Premiere o CapCut.
 *
 * Uso:
 *   node scripts/captions-to-srt.mjs src/data/captions-salsa-corto.json out/salsa-corto-voz-9x16.srt
 *   node scripts/captions-to-srt.mjs in.json out.srt --max-words 5 --max-sec 2.4
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function pad(n, width = 2) {
  return String(Math.floor(n)).padStart(width, "0");
}

export function formatSrtTime(ms) {
  const clamped = Math.max(0, Math.round(ms));
  const hours = Math.floor(clamped / 3600000);
  const minutes = Math.floor((clamped % 3600000) / 60000);
  const seconds = Math.floor((clamped % 60000) / 1000);
  const millis = clamped % 1000;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(millis, 3)}`;
}

export function captionsToSrt(captions, { maxWords = 5, maxDurationMs = 2400, maxGapMs = 600 } = {}) {
  const clean = captions
    .map((c) => ({
      text: String(c.text ?? "")
        .replace(/\[[^\]]*\]/g, "")
        .replace(/<[^>]*>/g, "")
        .trim(),
      startMs: Number(c.startMs ?? 0),
      endMs: Number(c.endMs ?? 0),
    }))
    .filter((c) => c.text.length > 0);

  const cues = [];
  let group = [];

  const flush = () => {
    if (!group.length) return;
    const startMs = group[0].startMs;
    const endMs = Math.max(startMs + 250, group[group.length - 1].endMs);
    const text = group.map((w) => w.text).join(" ");
    cues.push({ startMs, endMs, text });
    group = [];
  };

  for (const word of clean) {
    if (group.length > 0) {
      const prev = group[group.length - 1];
      const gap = word.startMs - prev.endMs;
      const span = word.endMs - group[0].startMs;
      const prevEndedSentence = /[.!?…]$/.test(prev.text);
      if (
        group.length >= maxWords ||
        span > maxDurationMs ||
        gap > maxGapMs ||
        prevEndedSentence
      ) {
        flush();
      }
    }
    group.push(word);
  }
  flush();

  return (
    cues
      .map(
        (cue, idx) =>
          `${idx + 1}\n${formatSrtTime(cue.startMs)} --> ${formatSrtTime(cue.endMs)}\n${cue.text}`
      )
      .join("\n\n") + "\n"
  );
}

// Ejecución directa por CLI
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const args = process.argv.slice(2);
  const inFile = args[0];
  const outFile = args[1];
  if (!inFile || !outFile) {
    console.error("Uso: node scripts/captions-to-srt.mjs <captions.json> <salida.srt> [--max-words 5]");
    process.exit(1);
  }
  let maxWords = 5;
  let maxDurationMs = 2400;
  for (let i = 2; i < args.length; i++) {
    if (args[i] === "--max-words") maxWords = Number(args[++i]);
    else if (args[i] === "--max-sec") maxDurationMs = Number(args[++i]) * 1000;
  }
  const captions = JSON.parse(fs.readFileSync(path.resolve(inFile), "utf8"));
  const srt = captionsToSrt(captions, { maxWords, maxDurationMs });
  const target = path.resolve(outFile);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, srt, "utf8");
  const blocks = srt.trim().split(/\n\n+/).length;
  console.log(`[OK] SRT generado: ${outFile} (${blocks} bloques)`);
}
