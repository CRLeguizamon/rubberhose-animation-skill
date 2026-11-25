# 🎬 Rubber Hose Animation Skill (`rubber-hose-dance`)

Skill portátil para agentes de código (Antigravity, Claude Code, Cursor, etc.) que convierte **cualquier historia, dato curioso o baile** en un video animado estilo **caricatura *rubber hose* de los años 30** en **Remotion** (`24 fps`, `9:16` o `16:9`), 100% por código y determinista.

## ✨ Qué incluye
- **Escenas dinámicas cada 3–5 segundos:** transiciones clásicas (*Iris Wipe*, barridos, cortes al pulso), **cero diapositivas**.
- **Animación *"on twos"* (12 fps) + cámara en 3 planos con *parallax*:** personajes clásicos con línea que "hierve" sobre fondos, autos y cámaras suaves a 24 fps (`CameraRig.tsx`, `beat.ts`).
- **Creador modular de personajes y vehículos:** sombreros, vestuarios, instrumentos/props, expresiones, autos vintage con ojos cartoon (`ModularCharacter.tsx`, `SalsaCast.tsx`, `RubberHoseCharacter.tsx`).
- **Look de película vintage 1930:** grano, rayones, polvo, parpadeo de proyector, sepia y viñeta (`VintageFilm.tsx`).
- **Voz clonada con ElevenLabs API v4 (`eleven_v4` únicamente):** flujo obligatorio en 2 fases (propone guion y costo antes de gastar créditos) + audio tags oficiales + limpieza automática de subtítulos.
- **Audio *ducking* automático + música procedural sin copyright + `earshot`:** música generada en Node.js puro (`generate-ragtime.mjs`, `generate-salsa.mjs`) con sincronización por `beats.json`, SFX procedurales (`earshot-sfx.mjs`) y control de calidad acústica (`earshot-measure.mjs`).
- **Exportación automática de `.srt` + zonas seguras de Reels/TikTok/Shorts:** subtítulos estables sin cambios de tamaño (`VintageCaptions.tsx`) y archivo `.srt` listo para YouTube/TikTok/CapCut (`captions-to-srt.mjs`).

---

## 📦 Instalación rápida

1. Clona este repositorio en tu carpeta de skills:
   ```bash
   git clone https://github.com/CRLeguizamon/rubberhose-animation-skill.git ~/.gemini/config/skills/rubber-hose-dance
   ```
   *(En Windows PowerShell: `C:\Users\<TU_USUARIO>\.gemini\config\skills\rubber-hose-dance`, o en `.claude/skills/rubber-hose-dance` si usas Claude Code).*

2. Sigue el tutorial paso a paso en **[SETUP.md](SETUP.md)** para configurar:
   - Tu voz clonada y API Key de **ElevenLabs v4** en `.env` (a partir de `assets/template/.env.example`).
   - **`earshot`** (para SFX procedurales y medición de audio).
   - Tu proyecto base en **Remotion**.

---

## 📂 Estructura del repositorio
```text
├── SKILL.md                          # Instrucciones y reglas completas de la skill
├── SETUP.md                          # Tutorial paso a paso (ElevenLabs v4 + earshot + Remotion)
├── assets/template/
│   ├── .env.example                  # Plantilla segura de variables de entorno
│   └── src/
│       ├── DanceBombin.tsx           # Plantilla de baile rítmico
│       ├── SalsaCortoVoz.tsx         # Plantilla multi-escena narrada con ducking, parallax y SFX
│       └── rubber-hose/              # Motor (beat, audioDucking, CameraRig, ModularCharacter, etc.)
└── scripts/
    ├── generate-voice.mjs            # ElevenLabs API v4 + captions.json + .srt
    ├── captions-to-srt.mjs           # Conversor a formato .srt estándar
    ├── generate-ragtime.mjs          # Música procedural ragtime/foxtrot 1930 + beats.json
    ├── generate-salsa.mjs            # Música procedural salsa/montuno vintage + beats.json
    ├── earshot-sfx.mjs               # Generador de SFX con earshot (922 sonidos, sin red)
    └── earshot-measure.mjs           # Medidor de calidad de audio (LUFS, true peak, espectro)
```

## 🔒 Seguridad
Este repositorio **no incluye credenciales, API keys ni archivos `.env`**. Cada usuario configura sus propias claves localmente siguiendo [SETUP.md](SETUP.md).
