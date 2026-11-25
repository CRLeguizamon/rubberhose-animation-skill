#!/usr/bin/env node
/**
 * Genera SFX o foley procedural con `earshot make` (922 sonidos en 384 familias, sin red, $0.00).
 *
 * Uso:
 *   node scripts/earshot-sfx.mjs "quick cartoon whoosh" public/audio/sfx/whoosh.wav
 *   node scripts/earshot-sfx.mjs --list "horn"
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const candidates = [
  process.env.EARSHOT_PY,
  path.resolve("..", "_tools", ".venv", "Scripts", "python.exe"),
  path.resolve("..", "_tools", ".venv", "bin", "python"),
  path.resolve("_tools", ".venv", "Scripts", "python.exe"),
  path.resolve("_tools", ".venv", "bin", "python"),
].filter(Boolean);

const py = candidates.find((p) => fs.existsSync(p));
if (!py) {
  console.error("No encontré el Python de earshot. Define EARSHOT_PY o instala earshot.");
  process.exit(2);
}

const args = process.argv.slice(2);
if (args[0] === "--list") {
  const query = (args[1] ?? "").toLowerCase();
  const res = spawnSync(py, ["-m", "earshot", "sounds"], { cwd: os.tmpdir(), encoding: "utf8" });
  const lines = (res.stdout ?? "").split(/\r?\n/);
  const filtered = query ? lines.filter((l) => l.toLowerCase().includes(query)) : lines.slice(0, 40);
  console.log(filtered.join("\n"));
  process.exit(res.status ?? 0);
}

const prompt = args[0];
const outFile = args[1];
if (!prompt || !outFile) {
  console.error('Uso: node scripts/earshot-sfx.mjs "<descripción>" <salida.wav>');
  process.exit(1);
}

const outAbs = path.resolve(outFile);
fs.mkdirSync(path.dirname(outAbs), { recursive: true });
const res = spawnSync(py, ["-m", "earshot", "make", prompt, "-o", outAbs], {
  cwd: os.tmpdir(),
  encoding: "utf8",
});
process.stdout.write(res.stdout ?? "");
process.stderr.write(res.stderr ?? "");
process.exit(res.status ?? 1);
