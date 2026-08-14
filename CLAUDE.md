# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Browser-based educational game (in Spanish) for practicing the identification of English verb tenses. The player sees a conjugated English sentence and must identify three things: the **tiempo** (PRESENTE / PASADO / FUTURO), the **variación** (Simple / Continuo / Perfecto / Perfecto Continuo, plus **Going to** which only applies to FUTURO), and the **tipo** de oración (Positiva / Negativa / Interrogativa). All three must be correct to count as an acierto. After every answer — right or wrong — a modal shows whether it was correct plus the theory for that tense (uso, fórmula, ejemplos, and a relevant "hack").

## Running

Pure static site — no build, no dependencies, no test suite. Open `index.html` directly in a browser, or serve the folder (e.g. `python3 -m http.server`) and visit it. Debug via the browser console; the code logs progress through `console.log`.

## Architecture

Everything lives in three files plus data:

- `index.html` — three screens (`#pantalla-inicio`, `#pantalla-juego`, `#pantalla-resultados`) toggled via the `.oculto` class, plus an explanation `.modal-overlay` shown via the `.active` class.
- `styles.css` — all styling.
- `script.js` — the entire game in a single `JuegoTiemposVerbos` class, instantiated once on `DOMContentLoaded`.

The start screen also has a **"¿Con ayuda?" checkbox** (`#con-ayuda`). When checked (`this.conAyuda`), each question shows a `#btn-ayuda` button that opens a separate help modal (`#modal-ayuda`) with the theory for the current case — `abrirAyuda`/`cerrarAyuda`; closing it does **not** advance (unlike the post-answer modal). The theory HTML is built once by `construirTeoriaHtml(conjugacion)` and reused by both modals.

Game flow inside the class: the start screen asks how many questions to answer (`#num-preguntas`, min 10, max = full pool). `iniciarJuego` reads/clamps that count (`obtenerNumPreguntas`) → `prepararConjugaciones(n)` builds the full pool across **all** verbs, shuffles, and slices the first `n` into `this.conjugaciones` → `mostrarPregunta` loops over each conjugation → `verificarRespuesta` scores the three selections. Either way (correct or not) it then calls `mostrarModalExplicacion(conjugacion, respuestasUsuario, esCorrecto)`, which shows a result banner, the user-vs-correct comparison (hidden when correct), and the tense theory; closing the modal (`cerrarModal`) advances to the next question. (There is no longer an `alert` or a "Siguiente" button — that older flow was removed.)

Key data transforms: the tense/variation/type keys (`tiempo_presente`, `presente_simple`, `positivo`, …) are mapped to the display labels shown in the UI by `obtenerNombreTiempo` / `obtenerNombreVariacion` / `obtenerNombreTipo`. The reverse mapping is implicit in `generarOpciones`, which hardcodes the answer-option sets.

## How the verb database is generated

The game data is **not hand-written**. `this.verbos` is built at runtime by `construirVerbos()` from a compact table in `datosVerbos()` — one row per verb with just 9 fields: English `base/ing/past/part` and Spanish `pres/pret/fut/ger/partES` (the "yo" forms) plus `trad` (the infinitive label). For pronoun "I" the full 12-tense × 3-type matrix and all auxiliaries are 100% regular, so `plantillaTiempos(f)` expands each row into the complete `conjugar_tiempos` structure. There are 30 verbs × 36 cells = **1080 conjugations** total.

`be` is the one exception (copula — "I am", not "I be"), built separately by `construirBeTiempos()`. Any other genuinely irregular form would need the same treatment.

FUTURO has a **5th variation, `futuro_going_to`** ("Going to"), generated for every verb; its Spanish uses "voy a + infinitivo", so rows whose `trad` label isn't a clean infinitive (e.g. `make` → "hacer (fabricar)") carry an optional `inf` field used only here. So per verb: present 12 + past 12 + future 15 = **39 cells**, 30 verbs = **1170 conjugations**.

The per-tense theory shown in the modal lives in `this.teoria` (keyed `tiempo → variación`, with `uso/formula/afirmativo/negativo/pregunta`) and `this.hacks` (selected per question by `hackPara`). Both are derived from `Guia_Tiempos_Verbales_Ingles.md` in the repo root — if you add a tense/variation, add its `teoria` entry too or the modal will throw.

**To add/edit a verb: edit the `datosVerbos()` table** (or `construirBeTiempos` for `be`-like copulas). Do not write out conjugation cells by hand. Verify with a quick Node check that stubs `document` (the file runs a `DOMContentLoaded` listener at load) and asserts the pool length and a few sample cells.

The standalone `verbos.json` file is still **not loaded** (no `fetch`/`import`) and is now badly out of date — it predates the generator and the expanded verb list. Treat it as dead/legacy; the source of truth is `datosVerbos()`.

Adding a new tense/variation/type would also require updating the `obtenerNombre*` maps, the `generarOpciones` option lists, and the `this.explicaciones` table, or the UI/scoring will break.

## Conventions

Identifiers, comments, UI strings, and data are all in Spanish — match that. `explain` (extensionless file) is a plain-text grammar cheat-sheet of all 12 tenses for reference, not used by the code.
