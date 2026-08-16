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

The game data is **not hand-written**. `this.verbos` is built at runtime by `construirVerbos()` from a compact table in `datosVerbos()` — one row per verb with English `base/ing/past/part`, `trad` (infinitive label), and Spanish `pres/pret/fut` conjugated **per person** as 5-element arrays `[yo, tú, él, nosotros, ellos]` (`ger`/`partES` don't vary by person). `construirVerbos()` expands each row into all **7 English pronouns** (I, you, he, she, it, we, they) by calling `plantillaTiempos(f, perfil)` once per entry of `this.perfilesPronombre` — a grammar profile per pronoun (which `am/is/are`, `do/does`, `have/has`, `was/were` it takes, plus its index into the 5-person Spanish arrays; he/she/it share index 2 since Spanish's 3rd-person-singular form is the same for all three). Auxiliary Spanish paradigms that don't depend on the lexical verb (estar/haber/ir, for continuous/perfect/going-to) live once in `this.paradigmasAux`, not per verb. 3rd-person-singular English (`he/she/it` + present simple positive) is derived by `terceraPersona(base)` using spelling rules (`+s`/`+es`/`y→ies`), with `have → has` as the one hardcoded exception. There are 131 fully-conjugated verbs (see `soloFormas` below) × 7 pronouns × 39 cells = **35,763 conjugations** in `poolCompleto`.

Some rows in `datosVerbos()` carry `soloFormas: true` instead of `pres/pret/fut/ger/partES` — just `base/ing/past/part/trad`. These exist only to widen `Modo Formas`' irregular/regular-spelling drill without requiring a full per-person Spanish conjugation (which is the expensive, error-prone part to hand-write, especially for verbs whose natural Spanish translation is reflexive — "sit"→"sentarse" — or otherwise awkward to slot into the `estar/haber` + gerundio/participio templates that `plantillaTiempos` composes automatically). `construirVerbos()` sets `conjugar_pronombre: null` for these, and `construirPoolCompleto()` skips any verb with `conjugar_pronombre == null` — so `soloFormas` verbs never appear in Modo Tiempos or Modo Auxiliares (both read `poolCompleto`), only in `poolFormas` (which only ever reads `base/pasado/participio/traduccion`). As of the 100-verb + 68-`soloFormas` expansion there are 200 total verbs (131 full + 68 soloFormas + `be`); `poolFormas` has 200 entries, `poolCompleto` has ~36k.

`be` is the one exception (copula — "I am", not "I be"), built separately by `construirBeTiempos(perfil)` using `this.paradigmaSer` (soy/eres/es/somos/son, etc.) instead of a lexical verb's own pres/pret/fut. Any other genuinely irregular form would need the same treatment.

FUTURO has a **5th variation, `futuro_going_to`** ("Going to"), generated for every non-`soloFormas` verb; its Spanish uses "voy a + infinitivo", so rows whose `trad` label isn't a clean infinitive (e.g. `make` → "hacer (fabricar)") carry an optional `inf` field used only here. So per verb per pronoun: present 12 + past 12 + future 15 = **39 cells**.

`Modo Auxiliares` and `Modo Formas` (see `index.html`'s `#modo-juego` radio group) are two additional game modes beyond the tense-identification one described above — Auxiliares quizzes the correct auxiliary + verb form for a hidden sentence, Formas is a drag-and-drop mode (irregular verbs: drag past/participle into place; regular verbs: drag the verb onto its `-ed` spelling rule, derived by `reglaOrtografica(base, past)`). Auxiliares reuses `poolCompleto` like Modo Tiempos; `Modo Formas` uses the separate `this.poolFormas` (one item per verb, not per conjugation — includes `soloFormas` verbs).

The per-tense theory shown in the modal lives in `this.teoria` (keyed `tiempo → variación`, with `uso/formula/afirmativo/negativo/pregunta`) and `this.hacks` (selected per question by `hackPara`). Both are derived from `Guia_Tiempos_Verbales_Ingles.md` in the repo root — if you add a tense/variation, add its `teoria` entry too or the modal will throw.

**To add/edit a verb: edit the `datosVerbos()` table** (or `construirBeTiempos` for `be`-like copulas). Do not write out conjugation cells by hand. Add `soloFormas: true` (and skip `pres/pret/fut/ger/partES`) for a verb that should only appear in Modo Formas — e.g. because its natural Spanish translation is reflexive or otherwise doesn't fit the `estar/haber`-prefix templates. Verify with a quick Node check that stubs `document`/`window`/`localStorage` (the file runs a `DOMContentLoaded` listener and touches the DOM/localStorage at construction time) and asserts the pool length, absence of duplicate `base` values, and a few sample conjugated/soloFormas cells.

The standalone `verbos.json` file is still **not loaded** (no `fetch`/`import`) and is now badly out of date — it predates the generator and the expanded verb list. Treat it as dead/legacy; the source of truth is `datosVerbos()`.

Adding a new tense/variation/type would also require updating the `obtenerNombre*` maps, the `generarOpciones` option lists, and the `this.explicaciones` table, or the UI/scoring will break.

## Conventions

Identifiers, comments, UI strings, and data are all in Spanish — match that. `explain` (extensionless file) is a plain-text grammar cheat-sheet of all 12 tenses for reference, not used by the code.
