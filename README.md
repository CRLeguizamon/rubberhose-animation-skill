<div align="center">

# 🎬 Rubber Hose Animation Skill

**Turn any story, trivia, or dance prompt into a 1930s rubber-hose cartoon video — 100% code-driven in Remotion, zero image/video AI APIs, copyright-free procedural music & SFX, and ElevenLabs v4 voice cloning.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Remotion](https://img.shields.io/badge/Remotion-24fps%20Deterministic-0B84F3)](https://remotion.dev)
[![ElevenLabs v4](https://img.shields.io/badge/ElevenLabs-API%20v4%20Only-111111)](https://elevenlabs.io)
[![Audio QC](https://img.shields.io/badge/Audio%20SFX%20%26%20QC-earshot-54a868)](https://github.com/Leonxlnx/earshot)
[![Zero Image APIs](https://img.shields.io/badge/Image%2FVideo%20APIs-%240.00-brightgreen)](#)

*Compatible with Antigravity, Claude Code, Cursor, and any agent supporting `SKILL.md`.*

</div>

---

## ✨ Why this skill?

Generating vintage cartoons with video diffusion models is expensive, inconsistent, and hard to sync to beats or scripts. **Rubber Hose Animation Skill** renders everything deterministically in code:

- 🎞️ **Dynamic multi-scene storytelling (every 3–5 s):** continuous cartoon cuts (*Iris Wipe*, whip pans, beat-synced transitions) — **zero static slides**.
- 🕺 **Authentic 1930s craft:** characters animated **"on twos" (12 fps)** with bendy rubber-hose limbs, pie-cut eyes, line boil (`feTurbulence`), projector gate weave, film grain, scratches & sepia vignette over smooth **24 fps** 3-plane parallax cameras (`CameraRig`).
- 🎭 **Modular cast & props generator:** mix hats, outfits, instruments, expressions, animated vintage cars, skylines, palm trees, or generate any custom SVG element on the fly (`ModularCharacter.tsx`).
- 🎹 **\$0.00 copyright-free procedural music + `earshot` SFX:** pure Node.js procedural ragtime/foxtrot and vintage salsa/montuno synths with automatic `beats.json`, procedural foley SFX via [`earshot`](https://github.com/Leonxlnx/earshot) (922 sounds, offline), and acoustic QC (`LUFS` / true peak).
- 🎙️ **ElevenLabs API v4 (`eleven_v4`) + automatic audio ducking:** strict 2-phase workflow (script + cost approval *before* spending a single credit), cloned voice support, official v4 `[audio tags]`, automatic music ducking while speaking, and **`.srt` export**.
- 📱 **Social-ready safe zones:** built-in `9:16` safe zone (`Reels / TikTok / YouTube Shorts`), no progress bars, fixed-size color-only caption highlights, and `16:9` support.

---

## ⚡ Quick Install

### 1. Clone into your agent's skills folder

```bash
# Antigravity (macOS / Linux)
git clone https://github.com/CRLeguizamon/rubberhose-animation-skill.git ~/.gemini/config/skills/rubber-hose-dance

# Antigravity (Windows PowerShell)
git clone https://github.com/CRLeguizamon/rubberhose-animation-skill.git "$env:USERPROFILE\.gemini\config\skills\rubber-hose-dance"

# Claude Code
git clone https://github.com/CRLeguizamon/rubberhose-animation-skill.git ~/.claude/skills/rubber-hose-dance
```

### 2. Follow the 5-minute setup guide
Read **[SETUP.md](SETUP.md)** for the step-by-step walkthrough:
1. Clone your voice & create an **ElevenLabs API v4** key (`.env` from `assets/template/.env.example`).
2. Install **`earshot`** for offline procedural SFX and loudness measurement.
3. Scaffold your Remotion studio and run your first prompt.

---

## 💬 Example Prompt

Once installed, just ask your coding agent:

> *"Use `rubber-hose-dance` to create a 20-second 9:16 story about how salsa music was born in the Caribbean and exploded in 1970s New York, with animated vintage cars, changing characters, Iris Wipe transitions, procedural salsa music, ElevenLabs v4 voiceover, and an `.srt` file."*

The agent will **always propose the script, 3–5 s scene storyboard, and ElevenLabs cost estimate first** before spending any credits.

---

## 📂 Repository Structure

```text
├── SKILL.md                          # Core agent instructions & production rules
├── SETUP.md                          # Step-by-step tutorial (ElevenLabs v4 + earshot + Remotion)
├── LICENSE                           # MIT License
├── assets/template/
│   ├── .env.example                  # Safe environment template (no secrets shipped)
│   └── src/
│       ├── DanceBombin.tsx           # Beat-synced 1930s ragtime dance template
│       ├── SalsaCortoVoz.tsx         # Multi-scene narrated template (ducking + parallax + SFX)
│       └── rubber-hose/              # Engine (beat/onTwos, audioDucking, CameraRig, ModularCharacter, VintageFilm, VintageCaptions)
└── scripts/
    ├── generate-voice.mjs            # ElevenLabs API v4 + clean captions.json + .srt export
    ├── captions-to-srt.mjs           # Standalone captions.json -> .srt converter
    ├── generate-ragtime.mjs          # Procedural 1930s ragtime/foxtrot synth + beats.json
    ├── generate-salsa.mjs            # Procedural vintage salsa/montuno synth + beats.json
    ├── earshot-sfx.mjs               # Offline procedural SFX wrapper (earshot make)
    └── earshot-measure.mjs           # Acoustic QC wrapper (LUFS, true peak, spectrum)
```

---

## 🔒 Security & Privacy
This repository contains **zero credentials, zero API keys, and zero `.env` files**. Every user configures their own keys locally following [SETUP.md](SETUP.md).

## ⭐ Support
If this skill saved you hours or helped you create viral retro cartoons for pennies, **drop a ⭐ Star on the repo** and share what you build!

## 📄 License
Licensed under the [MIT License](LICENSE).
