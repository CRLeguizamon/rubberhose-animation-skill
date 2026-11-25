# Guía de instalación — `rubber-hose-dance`

Sigue estos pasos una sola vez antes de generar tu primer video animado en estilo **rubber hose** con voz clonada en **ElevenLabs v4**, música procedural sin copyright y SFX con **`earshot`**.

---

## 1. Requisitos previos
- **Node.js 20+** (`node -v`)
- **Git** (`git --version`)
- **Python 3.10+** (`py --version` en Windows o `python3 --version` en Mac/Linux) — solo necesario para `earshot`.

---

## 2. Tutorial de ElevenLabs API v4 (voz clonada)

> Esta skill usa **exclusivamente `model_id: "eleven_v4"`** (nunca v3 ni v2).

### Paso A — Clonar tu voz y copiar tu `Voice ID`
1. Entra a [elevenlabs.io](https://elevenlabs.io) e inicia sesión.
2. En el menú izquierdo abre **Voices → Add a new voice**.
3. Elige **Instant Voice Clone** (rápido, requiere 1–3 minutos de audio limpio sin eco ni música) o **Professional Voice Clone**.
4. Sube tus audios grabados con el micrófono en un lugar silencioso y guarda tu voz.
5. Abre la ficha de tu voz clonada y copia su **Voice ID** (ej. `xxxxxxxxxxxxxxxxxxxx`).

### Paso B — Crear tu API Key
1. Ve a **Profile (esquina inferior izquierda) → Developers / API Keys**.
2. Haz clic en **Create API Key**, dale un nombre (ej. `rubber-hose-skill`) y activa permisos de **Text to Speech** y **User (Read)** (para verificar créditos con `--check`).
3. Copia la clave inmediatamente (solo se muestra una vez).

### Paso C — Configurar `.env` en tu proyecto Remotion
1. Copia `assets/template/.env.example` a `.env` en la raíz de tu proyecto Remotion.
2. Rellena tus credenciales:
   ```env
   ELEVENLABS_API_KEY=sk_tu_clave_aqui
   ELEVENLABS_VOICE_ID=tu_voice_id_clonada_aqui
   ```
3. Asegúrate de que `.env` esté en `.gitignore` (**nunca lo subas a Git**).
4. Verifica conexión y saldo de créditos (costo **\$0.00**):
   ```bash
   node scripts/generate-voice.mjs --check
   ```

---

## 3. Instalación de `earshot` (SFX procedurales y control de calidad de audio)

Instálalo **fuera** de tu carpeta de proyecto Remotion (por ejemplo en `../_tools/`) para evitar conflictos de nombres de paquetes en Python:

### En Windows (PowerShell)
```powershell
mkdir ..\_tools -Force
cd ..\_tools
git clone --depth 1 https://github.com/Leonxlnx/earshot
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".\earshot[measure]"
```

### En Mac / Linux
```bash
mkdir -p ../_tools && cd ../_tools
git clone --depth 1 https://github.com/Leonxlnx/earshot
python3 -m venv .venv
./.venv/bin/python -m pip install -e "./earshot[measure]"
```

### Verificar `earshot` desde tu proyecto Remotion
```bash
node scripts/earshot-sfx.mjs "soft wooden pop" public/audio/sfx/test-pop.wav
node scripts/earshot-measure.mjs public/audio/sfx/test-pop.wav
```

> Si instalaste el entorno virtual en otra ruta, define la variable `EARSHOT_PY` apuntando al ejecutable `python` de ese entorno.

---

## 4. Crear el proyecto Remotion (si aún no existe)
```bash
npx create-video@latest --yes --blank --tailwind MiRubberHoseStudio
cd MiRubberHoseStudio
npm install @remotion/google-fonts @remotion/captions @remotion/media-utils
```
Copia `assets/template/src/*` en `src/` y `scripts/*` en `scripts/`, y ya estás listo para pedir tu primer guion en **Fase 1**.
