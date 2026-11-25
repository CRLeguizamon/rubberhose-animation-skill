---
name: rubber-hose-dance
description: Crea historias animadas y videos de baile en estilo rubber hose de los años 30 (escenas continuas y dinámicas cada 3 a 5 segundos, personajes originales, autos, lugares y cualquier elemento dibujado por código) en Remotion (9:16 o 16:9), con voz clonada en ElevenLabs API v4 y audio tags oficiales, música procedural sin copyright (estilo HyperFrames, solo audio y cero diapositivas), SFX y medición de audio con earshot, y exportación automática de subtítulos .srt. Siempre propone guion y storyboard para aprobación antes de gastar créditos.
---

# Rubber Hose Story & Dance (`rubber-hose-dance`)

Convierte **cualquier historia, dato curioso, biografía musical o baile** en una caricatura animada continua de los años 30 (**estilo rubber hose**), 100% por código en Remotion (`24 fps`, determinista frame a frame), con cambios dinámicos de escena cada **3 a 5 segundos**, **música procedural sin copyright** (solo el enfoque de audio procedural de HyperFrames; **cero diapositivas**), **SFX y control de calidad con `earshot`**, **voz clonada en ElevenLabs `eleven_v4`** y **archivo `.srt`** listo para redes.

---

## Instalación y verificación inicial (obligatorio al primer uso)
Antes de producir el primer video en una máquina nueva, verifica si el proyecto tiene `.env` (`ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE_ID`) y si `earshot` está disponible. Si falta cualquiera de los dos, **muestra al usuario los pasos de [SETUP.md](SETUP.md)** (tutorial paso a paso de Node.js, clonación de voz y API Key en ElevenLabs **v4**, creación de `.env` desde `.env.example`, prueba con `--check` e instalación de `earshot`) antes de continuar.

## Arquitectura del paquete de la skill
| Ruta | Propósito |
| :--- | :--- |
| `SETUP.md` | Tutorial completo de instalación: Node.js, ElevenLabs v4 (voz clonada + API Key + `.env`) y `earshot` |
| `assets/template/.env.example` | Plantilla segura de variables de entorno para el proyecto |
| `assets/template/src/rubber-hose/beat.ts` | Señales de ritmo (`lift`, `squash`, `theta`), `onTwos(frame)` (12 fps sobre 24 fps) y `hash` determinista |
| `assets/template/src/rubber-hose/audioDucking.ts` | Audio *ducking* automático desde `captions.json` (baja música al hablar, sube en pausas) |
| `assets/template/src/rubber-hose/CameraRig.tsx` | Cámara de 3 planos con *parallax* (`far`, `mid`, `fore`), *push-in* suave y temblor de proyector |
| `assets/template/src/rubber-hose/ModularCharacter.tsx` | Creador modular de personajes (sombreros, ropa, props en mano, expresiones, pasos) animado *on twos* (sin lip-sync) |
| `assets/template/src/rubber-hose/VintageCaptions.tsx` | Subtítulos estables opcionales (`showCaptions`, `captionPosition: "top" \| "bottom"`, peso/tamaño fijos) |
| `assets/template/src/rubber-hose/RubberHoseCharacter.tsx` | Personaje base original ("Bombín") con tubos en S, ojos de pastel, guantes y zapatos |
| `assets/template/src/rubber-hose/SalsaCast.tsx` | Ejemplos de personajes múltiples y vehículos animados (`MaracasPlayer`, `TrumpetPlayer`, `VintageCar`) |
| `assets/template/src/rubber-hose/Stage.tsx` y `SalsaStages.tsx` | Escenarios animados (teatro vintage, Caribe con palmeras bailando y sol con ojos, Nueva York nocturno) |
| `assets/template/src/rubber-hose/VintageFilm.tsx` | Película antigua 100% determinista (grano, rayones, polvo, parpadeo, sepia, viñeta) |
| `assets/template/src/SalsaCortoVoz.tsx` | Plantilla multi-escena narrada con Iris Wipe, autos, cambio de personaje y subtítulos estables |
| `scripts/generate-voice.mjs` | ElevenLabs API v4 (`eleven_v4`) con `--check`, `captions.json` limpio y exportación directa `--srt` |
| `scripts/captions-to-srt.mjs` | Convierte cualquier `captions.json` en archivo `.srt` estándar (`HH:MM:SS,mmm`) |
| `scripts/generate-ragtime.mjs` / `generate-salsa.mjs` | Música procedural sin copyright en Node.js puro + `beats.json` (solo audio, cero diapositivas) |
| `scripts/earshot-sfx.mjs` | Genera SFX y foley procedurales con `earshot make` (922 sonidos, 384 familias, sin red) |
| `scripts/earshot-measure.mjs` | Control de calidad acústica con `earshot measure` (LUFS, true peak, espectro) |

---

## Reglas de storytelling dinámico (escenas cada 3–5 s)
1. **Ritmo visual continuo (3 a 5 segundos por escena):**
   - Divide toda historia en beats visuales de **3 a 5 segundos** (~72 a 120 frames a `24 fps`) alineados a frases clave de `captions.json`.
   - **Prohibido hacer diapositivas estáticas.** En cada escena debe haber movimiento vivo:
     - **Personajes animados *"on twos"*** (`12 fps` reales con `onTwos(frame)` dentro del canvas `24 fps`) para autenticidad de caricatura clásica, **sin lip-sync** (expresiones claras y ritmo corporal).
     - **Cámara de 3 planos con *parallax*** (`CameraRig`: fondo lejano `0.4x`, plano medio con autos/árboles `0.85x`, personaje en primer plano `1.15x` + *push-in* `1.00 → 1.045`).
     - **Audio *ducking* automático** (`createVoiceDucking(captions, fps)`): música a `0.13`–`0.14` al hablar y `0.28`–`0.30` en pausas y transiciones.
     - **SFX de `earshot`** en cada transición (*whoosh*), entrada de cartel (*pop*) y remate final (*chime*).
     - Línea "hirviendo" (`feTurbulence` cada 2 frames) y temblor de proyector.
2. **Transiciones clásicas de caricatura (sin cortar el ritmo musical):**
   - **Iris Wipe:** círculo negro que cierra sobre el sujeto (~6–8 frames) y abre en la nueva escena (~6–8 frames).
   - **Whip Pan / Barrido:** desplazamiento horizontal rápido con *motion blur* simulado entre lugares.
   - **Corte al golpe (Beat Cut):** cambio exacto sobre un acento del compás + SFX de `earshot` (`whoosh`, `pop`, `cymbal`).
3. **Generar cualquier elemento en código:**
   - Crea componentes SVG deterministas para lo que pida el guion: personajes nuevos (con distintos sombreros, ropa, instrumentos, gestos), autos/barcos/trenes con ojos en el parabrisas, edificios, letreros luminosos, instrumentos, objetos con cara cartoon.
   - **Siempre personajes originales** (nunca copiar personajes con copyright como Mickey o Cuphead).

---

## Reglas estrictas de ElevenLabs API v4 (`eleven_v4` únicamente)
**Prohibido usar `eleven_v3`, `eleven_multilingual_v2` ni modelos anteriores: usa exclusivamente `model_id: "eleven_v4"`.**
1. **Endpoint y modelo:** `POST /v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128` con `model_id: "eleven_v4"`.
2. **`voice_settings` permitidos en `eleven_v4`:** envía únicamente `stability` (recomendado `0.45`–`0.55` para voz clonada expresiva sin perder timbre) y `similarity_boost` (`0.80`). **No envíes** `style`, `speed` ni `use_speaker_boost`.
3. **Prohibido SSML:** nunca uses `<break time="..." />` (en v4 se ignora o se lee literal).
4. **Audio tags entre corchetes `[...]`:**
   - Coloca el tag **inmediatamente antes** de la frase que modifica: `[curious]`, `[thoughtful]`, `[warmly]`, `[happy]`, `[whispers]`, `[sighs]`, `[laughs]`, `[short pause]`, `[long pause]`.
   - **Regla de sobriedad para voz clonada:** usa **1 a 3 tags por párrafo**; evita apilar tags contradictorios y evita extremos fuera del rango natural del hablante (ej. evita `[excited]` o `[shouting]` al arrancar un video con voz serena).
   - **Puntuación natural:** usa `—` para pausas breves enfáticas, `...` para expectativa y **oraciones cortas** para mantener estable el timbre y el ritmo de la voz clonada.
   - **Pronunciación difícil:** si una palabra extranjera o técnica suena mal, usa IPA entre barras y comillas (`"/.../"`).
   - **Limpieza obligatoria:** el script elimina todo `[tag]` antes de escribir `captions.json` y `.srt` (verificar siempre `0` tags filtrados).

---

## Música procedural (estilo HyperFrames, solo audio) + `earshot`
- **Música procedural (`$0.00`, sin copyright):** usa o adapta generadores en Node.js puro (`generate-ragtime.mjs`, `generate-salsa.mjs`, piano *felt*, jazz vintage) que generen el `.wav` y el `beats.json` con los pulsos exactos. Mezcla la música a volumen bajo bajo la voz (`volume={0.20}` a `0.26`).
- **SFX y foley con `earshot`:** genera efectos cortos para transiciones, bocinas de auto, pasos o remates:
  ```bash
  node scripts/earshot-sfx.mjs "soft wooden pop" public/audio/sfx/pop.wav
  node scripts/earshot-sfx.mjs "quick cartoon whoosh" public/audio/sfx/whoosh.wav
  ```
- **Control de calidad obligatorio con `earshot measure`:**
  ```bash
  node scripts/earshot-measure.mjs public/audio/salsa-vintage.wav
  ```
  Meta: true peak ≤ `-1.0 dBTP`, loudness balanceado (`-16` a `-20 LUFS` en música antes de atenuar bajo voz), sin clipping.
- **Nota Windows/Python:** `earshot` debe ejecutarse desde un `cwd` neutro (los scripts ya usan `os.tmpdir()`) para evitar el choque con la carpeta del repo clonado.

---

## Subtítulos, `.srt` y zonas seguras
- **Generación automática de `.srt`:** siempre entrega el archivo `out/<tema>.srt` generado con `generate-voice.mjs --srt` o `node scripts/captions-to-srt.mjs src/data/captions-<tema>.json out/<tema>.srt`.
- **Zona segura en `9:16` (`1080×1920`, obligatoria):** todo texto, cartel y subtítulo va dentro de `top >= 250`, `bottom <= 1520`, `left >= 70`, `right >= 150`.
- **Prohibido usar barras de progreso** ni contadores de avance.
- **Formato oración:** nunca TODO EN MAYÚSCULAS en carteles ni subtítulos.
- **Subtítulos quemados opcionales (`showCaptions` y `captionPosition`):** si se queman en video, tamaño y `fontWeight` **fijos** (la palabra activa solo cambia de color, nunca `scale` ni cambio de peso).

---

## Flujo obligatorio en 2 fases

### Fase 1 — Guion, storyboard cada 3–5 s y presupuesto (SIN gastar créditos)
1. Recibe el tema o historia del usuario.
2. Escribe el **guion narrado** con audio tags válidos para `eleven_v4` (respetando el rango de la voz clonada).
3. Presenta el **storyboard escena por escena** (1 escena cada **3 a 5 segundos**): qué lugar, qué personaje(s), qué vehículos/props animados, qué transición (`Iris Wipe`, `Whip Pan`, etc.) y qué música/SFX procedurales acompañan.
4. Muestra el **costo estimado en ElevenLabs** (verifica créditos con `node scripts/generate-voice.mjs --check` si hay `.env`).
5. Pregunta preferencias rápidas: `9:16` o `16:9`, subtítulos quemados (`arriba`, `abajo` o `sin subtítulos` usando solo `.srt`).
6. **DETENTE y espera aprobación explícita** antes de llamar a ElevenLabs o renderizar.

### Fase 2 — Producción, `.srt`, verificación y renderizado (tras aprobación)
1. Genera la voz con `generate-voice.mjs --file ... --out ... --captions ... --srt out/<tema>.srt` y valida `0` tags filtrados.
2. Genera la música procedural (`generate-*.mjs`) + SFX con `earshot-sfx.mjs` y mídelos con `earshot-measure.mjs`.
3. Construye la composición a `24 fps` sincronizando cortes de escena (cada 3–5 s), animaciones al pulso (`beats.json`) y palabras clave (`captions.json`).
4. Corre `npm run lint` (`0` errores) y renderiza **1 still por cada escena + 1 still de transición** para inspección visual obligatoria.
5. Renderiza el MP4 (`npx remotion render <Id> out/<tema>.mp4 --crf=18`).
6. Entrega enlaces clicables al **MP4**, al **`.srt`**, al audio procedural y el consumo exacto de créditos ElevenLabs.
