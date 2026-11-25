#!/usr/bin/env node
/**
 * Mide un audio con `earshot` (https://github.com/Leonxlnx/earshot): LUFS, true peak, brillo, bandas, etc.
 * Es el "oído" de la skill: el agente no puede escuchar, pero sí medir.
 *
 * Requiere Python 3.10+ y earshot instalado en un entorno virtual FUERA de la carpeta del proyecto:
 *   py -m venv ../_tools/.venv
 *   git clone --depth 1 https://github.com/Leonxlnx/earshot ../_tools/earshot
 *   ../_tools/.venv/Scripts/python.exe -m pip install -e "../_tools/earshot[measure]"
 *
 * Uso:
 *   node scripts/earshot-measure.mjs public/audio/ragtime.wav
 *   EARSHOT_PY=/ruta/al/python node scripts/earshot-measure.mjs archivo.wav
 *
 * Nota: se ejecuta desde una carpeta neutra. Si el cwd contiene una carpeta llamada `earshot`
 * (el repo clonado), Python la toma como paquete y falla con "cannot import name __version__".
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/earshot-measure.mjs <archivo.wav|mp3>");
  process.exit(1);
}

const candidates = [
  process.env.EARSHOT_PY,
  path.resolve("..", "_tools", ".venv", "Scripts", "python.exe"),
  path.resolve("..", "_tools", ".venv", "bin", "python"),
  path.resolve("_tools", ".venv", "Scripts", "python.exe"),
  path.resolve("_tools", ".venv", "bin", "python"),
].filter(Boolean);

const py = candidates.find((p) => fs.existsSync(p));
if (!py) {
  console.error("No encontré el Python de earshot. Define EARSHOT_PY o instala earshot (ver cabecera de este script).");
  process.exit(2);
}

const res = spawnSync(py, ["-m", "earshot", "measure", path.resolve(file)], {
  cwd: os.tmpdir(),
  encoding: "utf8",
});
process.stdout.write(res.stdout ?? "");
process.stderr.write(res.stderr ?? "");
process.exit(res.status ?? 1);
