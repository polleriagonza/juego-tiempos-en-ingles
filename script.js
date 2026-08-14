class JuegoTiemposVerbos {
    constructor() {
        // La base de datos de verbos se genera a partir de una tabla compacta de
        // formas (ver construirVerbos / datosVerbos). El patrón de conjugación para
        // el pronombre "I" es totalmente regular en inglés, así que cada verbo solo
        // necesita sus 4 formas inglesas y 5 formas españolas (para "yo").
        this.verbos = this.construirVerbos();
        this.poolCompleto = this.construirPoolCompleto();
        this.totalPool = this.poolCompleto.length;
        this.auxiliaresPorTipo = this.construirAuxiliaresPorTipo();

        this.modo = 'tiempos';
        this.conjugaciones = [];
        this.preguntaActual = 0;
        this.aciertos = 0;
        this.errores = 0;
        this.respuestasSeleccionadas = {
            tiempo: null,
            variacion: null,
            tipo: null,
            auxiliar: null,
            forma: null
        };

        // Teoría de cada tiempo verbal (uso, fórmula y ejemplos), extraída de la
        // "Guía Maestra de Tiempos Verbales". Se muestra en el modal de cada pregunta.
        this.teoria = {
            'PRESENTE': {
                'Simple': {
                    uso: 'Acciones habituales, rutinas, verdades universales, gustos y opiniones.',
                    formula: 'Sujeto + verbo base (+ s/es para He/She/It).',
                    afirmativo: 'She runs every day.',
                    negativo: "She doesn't run on Mondays.",
                    pregunta: 'Does she run?',
                    auxAfirmativo: '(sin auxiliar)',
                    auxNegativo: "don't / doesn't",
                    auxInterrogativo: 'Do / Does'
                },
                'Continuo': {
                    uso: 'Acciones que suceden en este momento o planes futuros ya decididos.',
                    formula: 'Sujeto + am/is/are + verbo -ing.',
                    afirmativo: 'She is running right now.',
                    negativo: "She isn't running.",
                    pregunta: 'Is she running?',
                    auxAfirmativo: 'am / is / are',
                    auxNegativo: "am not / isn't / aren't",
                    auxInterrogativo: 'Am / Is / Are'
                },
                'Perfecto': {
                    uso: 'Acciones pasadas con impacto en el presente, experiencias o logros.',
                    formula: 'Sujeto + have/has + participio pasado.',
                    afirmativo: 'She has run a marathon.',
                    negativo: "She hasn't run.",
                    pregunta: 'Has she run?',
                    auxAfirmativo: 'have / has',
                    auxNegativo: "haven't / hasn't",
                    auxInterrogativo: 'Have / Has'
                },
                'Perfecto Continuo': {
                    uso: 'Acciones que empezaron en el pasado, continúan en el presente y enfatizan la duración.',
                    formula: 'Sujeto + have/has + been + verbo -ing.',
                    afirmativo: 'She has been running for an hour.',
                    negativo: "She hasn't been running.",
                    pregunta: 'Has she been running?',
                    auxAfirmativo: 'have been / has been',
                    auxNegativo: "haven't been / hasn't been",
                    auxInterrogativo: 'Have / Has ... been'
                }
            },
            'PASADO': {
                'Simple': {
                    uso: 'Acciones que ocurrieron en un momento específico del pasado.',
                    formula: 'Sujeto + verbo en pasado.',
                    afirmativo: 'She ran yesterday.',
                    negativo: "She didn't run. (verbo en forma base)",
                    pregunta: 'Did she run?',
                    auxAfirmativo: '(sin auxiliar)',
                    auxNegativo: "didn't",
                    auxInterrogativo: 'Did'
                },
                'Continuo': {
                    uso: 'Acciones en progreso en un momento del pasado, o dos acciones simultáneas.',
                    formula: 'Sujeto + was/were + verbo -ing.',
                    afirmativo: 'She was running when I called.',
                    negativo: "She wasn't running.",
                    pregunta: 'Was she running?',
                    auxAfirmativo: 'was / were',
                    auxNegativo: "wasn't / weren't",
                    auxInterrogativo: 'Was / Were'
                },
                'Perfecto': {
                    uso: 'Acción que ocurrió antes de otra acción en el pasado.',
                    formula: 'Sujeto + had + participio pasado.',
                    afirmativo: 'She had run before it started raining.',
                    negativo: "She hadn't run.",
                    pregunta: 'Had she finished her homework before dinner?',
                    auxAfirmativo: 'had',
                    auxNegativo: "hadn't",
                    auxInterrogativo: 'Had'
                },
                'Perfecto Continuo': {
                    uso: 'Acción en progreso antes de otra acción en el pasado.',
                    formula: 'Sujeto + had been + verbo -ing.',
                    afirmativo: 'She had been running for an hour when it started raining.',
                    negativo: "I hadn't been working.",
                    pregunta: 'Had you been sleeping?',
                    auxAfirmativo: 'had been',
                    auxNegativo: "hadn't been",
                    auxInterrogativo: 'Had ... been'
                }
            },
            'FUTURO': {
                'Simple': {
                    uso: 'Decisiones espontáneas o predicciones sobre el futuro.',
                    formula: 'Sujeto + will + verbo base.',
                    afirmativo: 'She will run tomorrow.',
                    negativo: "She won't run.",
                    pregunta: 'Will she run?',
                    auxAfirmativo: 'will',
                    auxNegativo: "won't",
                    auxInterrogativo: 'Will'
                },
                'Going to': {
                    uso: 'Planes e intenciones ya decididos, o predicciones con evidencia presente.',
                    formula: 'Sujeto + am/is/are going to + verbo base.',
                    afirmativo: 'She is going to run later.',
                    negativo: "She isn't going to run.",
                    pregunta: 'Is she going to run?',
                    auxAfirmativo: 'am/is/are going to',
                    auxNegativo: "am not/isn't/aren't going to",
                    auxInterrogativo: 'Am/Is/Are ... going to'
                },
                'Continuo': {
                    uso: 'Una acción que estará en progreso en un momento específico del futuro.',
                    formula: 'Sujeto + will be + verbo -ing.',
                    afirmativo: 'She will be running at 5 PM.',
                    negativo: "She won't be running.",
                    pregunta: 'Will she be running?',
                    auxAfirmativo: 'will be',
                    auxNegativo: "won't be",
                    auxInterrogativo: 'Will ... be'
                },
                'Perfecto': {
                    uso: 'Acción que se habrá completado antes de un momento específico del futuro.',
                    formula: 'Sujeto + will have + participio pasado.',
                    afirmativo: 'She will have run a marathon by then.',
                    negativo: "They won't have helped anyone.",
                    pregunta: 'Will you have returned by next weekend?',
                    auxAfirmativo: 'will have',
                    auxNegativo: "won't have",
                    auxInterrogativo: 'Will ... have'
                },
                'Perfecto Continuo': {
                    uso: 'Acción en progreso hasta un momento futuro específico, enfatizando su duración.',
                    formula: 'Sujeto + will have been + verbo -ing.',
                    afirmativo: 'She will have been running for an hour by 6 PM.',
                    negativo: "She won't have been working.",
                    pregunta: 'Will they have been living in this city for a decade by next year?',
                    auxAfirmativo: 'will have been',
                    auxNegativo: "won't have been",
                    auxInterrogativo: 'Will ... have been'
                }
            }
        };

        // "Hacks" generales para sonar nativo; se muestra el más relevante por pregunta.
        this.hacks = {
            contracciones: "Contracciones: usa don't, doesn't, isn't, won't, hadn't… (sobre todo en negativos) para sonar natural.",
            inversion: 'Inversión: en preguntas, coloca el auxiliar (do, does, did, was, were, have, has, will) antes del sujeto.',
            pasadoBase: 'Con did/didn\'t el verbo principal va en su forma base: "I didn\'t play" (no "played").',
            participio: 'Participio pasado: regulares con -ed (played, worked); irregulares cambian (run → run, see → seen, go → gone).'
        };

        this.inicializarEventos();
    }

    // ===================== Generación de la base de datos =====================

    // Tabla compacta de verbos. Por cada verbo:
    //   base / ing / past / part  -> formas en inglés
    //   trad                      -> traducción mostrada como "infinitivo"
    //   pres / pret / fut         -> conjugación de "yo" (presente, pretérito, futuro)
    //   ger / partES              -> gerundio y participio en español
    datosVerbos() {
        return [
            { base: 'have', ing: 'having', past: 'had', part: 'had', trad: 'tener', pres: 'tengo', pret: 'tuve', fut: 'tendré', ger: 'teniendo', partES: 'tenido' },
            { base: 'do', ing: 'doing', past: 'did', part: 'done', trad: 'hacer', pres: 'hago', pret: 'hice', fut: 'haré', ger: 'haciendo', partES: 'hecho' },
            { base: 'say', ing: 'saying', past: 'said', part: 'said', trad: 'decir', pres: 'digo', pret: 'dije', fut: 'diré', ger: 'diciendo', partES: 'dicho' },
            { base: 'go', ing: 'going', past: 'went', part: 'gone', trad: 'ir', pres: 'voy', pret: 'fui', fut: 'iré', ger: 'yendo', partES: 'ido' },
            { base: 'get', ing: 'getting', past: 'got', part: 'gotten', trad: 'conseguir', pres: 'consigo', pret: 'conseguí', fut: 'conseguiré', ger: 'consiguiendo', partES: 'conseguido' },
            { base: 'make', ing: 'making', past: 'made', part: 'made', trad: 'hacer (fabricar)', inf: 'hacer', pres: 'hago', pret: 'hice', fut: 'haré', ger: 'haciendo', partES: 'hecho' },
            { base: 'take', ing: 'taking', past: 'took', part: 'taken', trad: 'tomar', pres: 'tomo', pret: 'tomé', fut: 'tomaré', ger: 'tomando', partES: 'tomado' },
            { base: 'see', ing: 'seeing', past: 'saw', part: 'seen', trad: 'ver', pres: 'veo', pret: 'vi', fut: 'veré', ger: 'viendo', partES: 'visto' },
            { base: 'come', ing: 'coming', past: 'came', part: 'come', trad: 'venir', pres: 'vengo', pret: 'vine', fut: 'vendré', ger: 'viniendo', partES: 'venido' },
            { base: 'want', ing: 'wanting', past: 'wanted', part: 'wanted', trad: 'querer', pres: 'quiero', pret: 'quise', fut: 'querré', ger: 'queriendo', partES: 'querido' },
            { base: 'give', ing: 'giving', past: 'gave', part: 'given', trad: 'dar', pres: 'doy', pret: 'di', fut: 'daré', ger: 'dando', partES: 'dado' },
            { base: 'put', ing: 'putting', past: 'put', part: 'put', trad: 'poner', pres: 'pongo', pret: 'puse', fut: 'pondré', ger: 'poniendo', partES: 'puesto' },
            { base: 'keep', ing: 'keeping', past: 'kept', part: 'kept', trad: 'mantener', pres: 'mantengo', pret: 'mantuve', fut: 'mantendré', ger: 'manteniendo', partES: 'mantenido' },
            { base: 'let', ing: 'letting', past: 'let', part: 'let', trad: 'dejar', pres: 'dejo', pret: 'dejé', fut: 'dejaré', ger: 'dejando', partES: 'dejado' },
            { base: 'seem', ing: 'seeming', past: 'seemed', part: 'seemed', trad: 'parecer', pres: 'parezco', pret: 'parecí', fut: 'pareceré', ger: 'pareciendo', partES: 'parecido' },
            { base: 'send', ing: 'sending', past: 'sent', part: 'sent', trad: 'enviar', pres: 'envío', pret: 'envié', fut: 'enviaré', ger: 'enviando', partES: 'enviado' },
            { base: 'think', ing: 'thinking', past: 'thought', part: 'thought', trad: 'pensar', pres: 'pienso', pret: 'pensé', fut: 'pensaré', ger: 'pensando', partES: 'pensado' },
            { base: 'know', ing: 'knowing', past: 'knew', part: 'known', trad: 'saber', pres: 'sé', pret: 'supe', fut: 'sabré', ger: 'sabiendo', partES: 'sabido' },
            { base: 'look', ing: 'looking', past: 'looked', part: 'looked', trad: 'mirar', pres: 'miro', pret: 'miré', fut: 'miraré', ger: 'mirando', partES: 'mirado' },
            { base: 'use', ing: 'using', past: 'used', part: 'used', trad: 'usar', pres: 'uso', pret: 'usé', fut: 'usaré', ger: 'usando', partES: 'usado' },
            { base: 'find', ing: 'finding', past: 'found', part: 'found', trad: 'encontrar', pres: 'encuentro', pret: 'encontré', fut: 'encontraré', ger: 'encontrando', partES: 'encontrado' },
            { base: 'tell', ing: 'telling', past: 'told', part: 'told', trad: 'contar', pres: 'cuento', pret: 'conté', fut: 'contaré', ger: 'contando', partES: 'contado' },
            { base: 'work', ing: 'working', past: 'worked', part: 'worked', trad: 'trabajar', pres: 'trabajo', pret: 'trabajé', fut: 'trabajaré', ger: 'trabajando', partES: 'trabajado' },
            { base: 'call', ing: 'calling', past: 'called', part: 'called', trad: 'llamar', pres: 'llamo', pret: 'llamé', fut: 'llamaré', ger: 'llamando', partES: 'llamado' },
            { base: 'try', ing: 'trying', past: 'tried', part: 'tried', trad: 'intentar', pres: 'intento', pret: 'intenté', fut: 'intentaré', ger: 'intentando', partES: 'intentado' },
            { base: 'ask', ing: 'asking', past: 'asked', part: 'asked', trad: 'preguntar', pres: 'pregunto', pret: 'pregunté', fut: 'preguntaré', ger: 'preguntando', partES: 'preguntado' },
            { base: 'need', ing: 'needing', past: 'needed', part: 'needed', trad: 'necesitar', pres: 'necesito', pret: 'necesité', fut: 'necesitaré', ger: 'necesitando', partES: 'necesitado' },
            { base: 'feel', ing: 'feeling', past: 'felt', part: 'felt', trad: 'sentir', pres: 'siento', pret: 'sentí', fut: 'sentiré', ger: 'sintiendo', partES: 'sentido' },
            { base: 'play', ing: 'playing', past: 'played', part: 'played', trad: 'jugar', pres: 'juego', pret: 'jugué', fut: 'jugaré', ger: 'jugando', partES: 'jugado' }
        ];
    }

    construirVerbos() {
        const verbos = [];

        // "be" es el único verbo irregular como cópula (no encaja en la plantilla),
        // así que se construye aparte.
        verbos.push({
            id: 1,
            verbo: 'be',
            traduccion: 'ser/estar',
            formas: { base: 'be', ing: 'being', pasado: 'was', participio: 'been' },
            conjugar_pronombre: [{
                pronombre: 'I',
                traduccion: 'yo',
                conjugar_tiempos: this.construirBeTiempos()
            }]
        });

        this.datosVerbos().forEach((f, i) => {
            verbos.push({
                id: i + 2,
                verbo: f.base,
                traduccion: f.trad,
                formas: { base: f.base, ing: f.ing, pasado: f.past, participio: f.part },
                conjugar_pronombre: [{
                    pronombre: 'I',
                    traduccion: 'yo',
                    conjugar_tiempos: this.plantillaTiempos(f)
                }]
            });
        });

        return verbos;
    }

    // Crea una celda de conjugación {conjugacion, traduccion, auxiliar}.
    cel(conjugacion, traduccion, auxiliar) {
        return { conjugacion, traduccion, auxiliar };
    }

    // Genera los 12 tiempos × 3 tipos para un verbo léxico regular (pronombre "I").
    plantillaTiempos(f) {
        const ger = f.ger;
        const pES = f.partES;
        const inf = f.inf || f.trad; // infinitivo limpio para "voy a + infinitivo"
        return {
            tiempo_presente: {
                presente_simple: {
                    positivo: this.cel(`I ${f.base}`, `yo ${f.pres}`, '---'),
                    negativo: this.cel(`I don't ${f.base}`, `yo no ${f.pres}`, "don't - do not"),
                    interrogativo: this.cel(`Do I ${f.base}?`, `¿Yo ${f.pres}?`, 'do')
                },
                presente_continuo: {
                    positivo: this.cel(`I am ${f.ing}`, `yo estoy ${ger}`, 'am'),
                    negativo: this.cel(`I am not ${f.ing}`, `yo no estoy ${ger}`, 'am not'),
                    interrogativo: this.cel(`Am I ${f.ing}?`, `¿Yo estoy ${ger}?`, 'am')
                },
                presente_perfecto: {
                    positivo: this.cel(`I have ${f.part}`, `yo he ${pES}`, 'have'),
                    negativo: this.cel(`I have not ${f.part}`, `yo no he ${pES}`, "haven't - have not"),
                    interrogativo: this.cel(`Have I ${f.part}?`, `¿Yo he ${pES}?`, 'have')
                },
                presente_perfecto_continuo: {
                    positivo: this.cel(`I have been ${f.ing}`, `yo he estado ${ger}`, 'have been'),
                    negativo: this.cel(`I have not been ${f.ing}`, `yo no he estado ${ger}`, "haven't been - have not been"),
                    interrogativo: this.cel(`Have I been ${f.ing}?`, `¿Yo he estado ${ger}?`, 'have')
                }
            },
            tiempo_pasado: {
                pasado_simple: {
                    positivo: this.cel(`I ${f.past}`, `yo ${f.pret}`, '---'),
                    negativo: this.cel(`I didn't ${f.base}`, `yo no ${f.pret}`, "didn't - did not"),
                    interrogativo: this.cel(`Did I ${f.base}?`, `¿Yo ${f.pret}?`, 'did')
                },
                pasado_continuo: {
                    positivo: this.cel(`I was ${f.ing}`, `yo estaba ${ger}`, 'was'),
                    negativo: this.cel(`I wasn't ${f.ing}`, `yo no estaba ${ger}`, "wasn't - was not"),
                    interrogativo: this.cel(`Was I ${f.ing}?`, `¿Yo estaba ${ger}?`, 'was')
                },
                pasado_perfecto: {
                    positivo: this.cel(`I had ${f.part}`, `yo había ${pES}`, 'had'),
                    negativo: this.cel(`I hadn't ${f.part}`, `yo no había ${pES}`, "hadn't - had not"),
                    interrogativo: this.cel(`Had I ${f.part}?`, `¿Yo había ${pES}?`, 'had')
                },
                pasado_perfecto_continuo: {
                    positivo: this.cel(`I had been ${f.ing}`, `yo había estado ${ger}`, 'had been'),
                    negativo: this.cel(`I hadn't been ${f.ing}`, `yo no había estado ${ger}`, "hadn't been - had not been"),
                    interrogativo: this.cel(`Had I been ${f.ing}?`, `¿Yo había estado ${ger}?`, 'had')
                }
            },
            tiempo_futuro: {
                futuro_simple: {
                    positivo: this.cel(`I will ${f.base}`, `yo ${f.fut}`, 'will'),
                    negativo: this.cel(`I won't ${f.base}`, `yo no ${f.fut}`, "won't - will not"),
                    interrogativo: this.cel(`Will I ${f.base}?`, `¿Yo ${f.fut}?`, 'will')
                },
                futuro_going_to: {
                    positivo: this.cel(`I am going to ${f.base}`, `yo voy a ${inf}`, 'am going to'),
                    negativo: this.cel(`I am not going to ${f.base}`, `yo no voy a ${inf}`, 'am not going to'),
                    interrogativo: this.cel(`Am I going to ${f.base}?`, `¿Yo voy a ${inf}?`, 'am going to')
                },
                futuro_continuo: {
                    positivo: this.cel(`I will be ${f.ing}`, `yo estaré ${ger}`, 'will be'),
                    negativo: this.cel(`I won't be ${f.ing}`, `yo no estaré ${ger}`, "won't be - will not be"),
                    interrogativo: this.cel(`Will I be ${f.ing}?`, `¿Yo estaré ${ger}?`, 'will')
                },
                futuro_perfecto: {
                    positivo: this.cel(`I will have ${f.part}`, `yo habré ${pES}`, 'will have'),
                    negativo: this.cel(`I won't have ${f.part}`, `yo no habré ${pES}`, "won't have - will not have"),
                    interrogativo: this.cel(`Will I have ${f.part}?`, `¿Yo habré ${pES}?`, 'will')
                },
                futuro_perfecto_continuo: {
                    positivo: this.cel(`I will have been ${f.ing}`, `yo habré estado ${ger}`, 'will have been'),
                    negativo: this.cel(`I won't have been ${f.ing}`, `yo no habré estado ${ger}`, "won't have been - will not have been"),
                    interrogativo: this.cel(`Will I have been ${f.ing}?`, `¿Yo habré estado ${ger}?`, 'will')
                }
            }
        };
    }

    // "be" como cópula: el simple usa am/was/will be sin verbo léxico, el continuo
    // usa "being", el perfecto "been" y el perfecto continuo "been being".
    construirBeTiempos() {
        return {
            tiempo_presente: {
                presente_simple: {
                    positivo: this.cel('I am', 'yo soy', 'am'),
                    negativo: this.cel('I am not', 'yo no soy', 'am not'),
                    interrogativo: this.cel('Am I?', '¿Yo soy?', 'am')
                },
                presente_continuo: {
                    positivo: this.cel('I am being', 'yo estoy siendo', 'am'),
                    negativo: this.cel('I am not being', 'yo no estoy siendo', 'am not'),
                    interrogativo: this.cel('Am I being?', '¿Yo estoy siendo?', 'am')
                },
                presente_perfecto: {
                    positivo: this.cel('I have been', 'yo he sido', 'have'),
                    negativo: this.cel('I have not been', 'yo no he sido', "haven't - have not"),
                    interrogativo: this.cel('Have I been?', '¿Yo he sido?', 'have')
                },
                presente_perfecto_continuo: {
                    positivo: this.cel('I have been being', 'yo he estado siendo', 'have been'),
                    negativo: this.cel('I have not been being', 'yo no he estado siendo', "haven't been - have not been"),
                    interrogativo: this.cel('Have I been being?', '¿Yo he estado siendo?', 'have')
                }
            },
            tiempo_pasado: {
                pasado_simple: {
                    positivo: this.cel('I was', 'yo fui', '---'),
                    negativo: this.cel("I wasn't", 'yo no fui', "wasn't - was not"),
                    interrogativo: this.cel('Was I?', '¿Yo fui?', 'was')
                },
                pasado_continuo: {
                    positivo: this.cel('I was being', 'yo estaba siendo', 'was'),
                    negativo: this.cel("I wasn't being", 'yo no estaba siendo', "wasn't - was not"),
                    interrogativo: this.cel('Was I being?', '¿Yo estaba siendo?', 'was')
                },
                pasado_perfecto: {
                    positivo: this.cel('I had been', 'yo había sido', 'had'),
                    negativo: this.cel("I hadn't been", 'yo no había sido', "hadn't - had not"),
                    interrogativo: this.cel('Had I been?', '¿Yo había sido?', 'had')
                },
                pasado_perfecto_continuo: {
                    positivo: this.cel('I had been being', 'yo había estado siendo', 'had been'),
                    negativo: this.cel("I hadn't been being", 'yo no había estado siendo', "hadn't been - had not been"),
                    interrogativo: this.cel('Had I been being?', '¿Yo había estado siendo?', 'had')
                }
            },
            tiempo_futuro: {
                futuro_simple: {
                    positivo: this.cel('I will be', 'yo seré', 'will'),
                    negativo: this.cel("I won't be", 'yo no seré', "won't - will not"),
                    interrogativo: this.cel('Will I be?', '¿Yo seré?', 'will')
                },
                futuro_going_to: {
                    positivo: this.cel('I am going to be', 'yo voy a ser', 'am going to'),
                    negativo: this.cel('I am not going to be', 'yo no voy a ser', 'am not going to'),
                    interrogativo: this.cel('Am I going to be?', '¿Yo voy a ser?', 'am going to')
                },
                futuro_continuo: {
                    positivo: this.cel('I will be being', 'yo estaré siendo', 'will be'),
                    negativo: this.cel("I won't be being", 'yo no estaré siendo', "won't be - will not be"),
                    interrogativo: this.cel('Will I be being?', '¿Yo estaré siendo?', 'will')
                },
                futuro_perfecto: {
                    positivo: this.cel('I will have been', 'yo habré sido', 'will have'),
                    negativo: this.cel("I won't have been", 'yo no habré sido', "won't have - will not have"),
                    interrogativo: this.cel('Will I have been?', '¿Yo habré sido?', 'will')
                },
                futuro_perfecto_continuo: {
                    positivo: this.cel('I will have been being', 'yo habré estado siendo', 'will have been'),
                    negativo: this.cel("I won't have been being", 'yo no habré estado siendo', "won't have been - will not have been"),
                    interrogativo: this.cel('Will I have been being?', '¿Yo habré estado siendo?', 'will')
                }
            }
        };
    }

    // Aplana TODOS los verbos en una sola lista de conjugaciones (el "pool" del que
    // se eligen las preguntas al azar).
    construirPoolCompleto() {
        const pool = [];
        this.verbos.forEach(verbo => {
            verbo.conjugar_pronombre.forEach(pronombre => {
                Object.keys(pronombre.conjugar_tiempos).forEach(tiempoKey => {
                    const tiempos = pronombre.conjugar_tiempos[tiempoKey];
                    Object.keys(tiempos).forEach(variacionKey => {
                        const variacion = tiempos[variacionKey];
                        Object.keys(variacion).forEach(tipoKey => {
                            const conjugacion = variacion[tipoKey];
                            const tiempo = this.obtenerNombreTiempo(tiempoKey);
                            const nombreVariacion = this.obtenerNombreVariacion(variacionKey);
                            const tipo = this.obtenerNombreTipo(tipoKey);
                            const formaClave = this.formaVerboClave(tiempo, nombreVariacion, tipo);
                            pool.push({
                                verbo: verbo.verbo,
                                traduccion: verbo.traduccion,
                                conjugacion: conjugacion.conjugacion,
                                traduccionConjugacion: conjugacion.traduccion,
                                tiempo,
                                variacion: nombreVariacion,
                                tipo,
                                auxiliar: conjugacion.auxiliar,
                                auxiliarCanonico: this.auxiliarCanonico(conjugacion.auxiliar),
                                formas: verbo.formas,
                                formaClave,
                                formaCorrecta: verbo.formas[formaClave]
                            });
                        });
                    });
                });
            });
        });
        return pool;
    }

    // Determina qué forma toma el verbo principal (base/-ing/pasado/participio)
    // según el tiempo, la variación y el tipo de oración. Es independiente del
    // verbo concreto: el mismo patrón vale para cualquiera de los 30 verbos.
    formaVerboClave(tiempo, variacion, tipo) {
        if (variacion === 'Continuo' || variacion === 'Perfecto Continuo') return 'ing';
        if (variacion === 'Perfecto') return 'participio';
        if (variacion === 'Going to') return 'base';
        // Simple: el positivo del pasado usa el verbo en pasado; todo lo demás
        // (incluido negativo/interrogativo del pasado, que llevan did/didn't) va
        // en forma base.
        if (tiempo === 'PASADO' && tipo === 'Positiva') return 'pasado';
        return 'base';
    }

    // Reduce un campo `auxiliar` (a veces "contracción - forma completa", a veces
    // un valor único) al valor exacto que aparece en la oración con "I".
    auxiliarCanonico(auxiliarRaw) {
        if (auxiliarRaw === '---') return '(sin auxiliar)';
        if (auxiliarRaw.includes(' - ')) return auxiliarRaw.split(' - ')[0];
        return auxiliarRaw;
    }

    // Agrupa los auxiliares canónicos únicos del pool por tipo de oración; es el
    // conjunto del que se sacan los distractores en el Modo Auxiliares.
    construirAuxiliaresPorTipo() {
        const porTipo = { Positiva: new Set(), Negativa: new Set(), Interrogativa: new Set() };
        this.poolCompleto.forEach(c => porTipo[c.tipo].add(c.auxiliarCanonico));
        return {
            Positiva: [...porTipo.Positiva],
            Negativa: [...porTipo.Negativa],
            Interrogativa: [...porTipo.Interrogativa]
        };
    }

    // ===================== Eventos y flujo del juego =====================

    inicializarEventos() {
        // Configurar el máximo de preguntas según el total de conjugaciones disponibles
        const inputNum = document.getElementById('num-preguntas');
        const spanMax = document.getElementById('max-preguntas');
        if (inputNum) inputNum.max = this.totalPool;
        if (spanMax) spanMax.textContent = this.totalPool;

        // Botones de navegación
        document.getElementById('btn-iniciar').addEventListener('click', () => {
            this.iniciarJuego();
        });
        document.getElementById('btn-reiniciar').addEventListener('click', () => this.reiniciarJuego());
        document.getElementById('btn-inicio').addEventListener('click', () => this.mostrarPantalla('inicio'));

        // Eventos para las opciones
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('opcion')) {
                this.seleccionarOpcion(e.target);
            }
        });

        // Eventos del modal
        document.getElementById('btn-cerrar-modal').addEventListener('click', () => this.cerrarModal());

        // Cerrar modal al hacer clic fuera de él
        document.getElementById('modal-explicacion').addEventListener('click', (e) => {
            if (e.target.id === 'modal-explicacion') {
                this.cerrarModal();
            }
        });

        // Modo "con ayuda": botón de teoría dentro de la pregunta
        document.getElementById('btn-ayuda').addEventListener('click', () => this.abrirAyuda());
        document.getElementById('btn-cerrar-ayuda').addEventListener('click', () => this.cerrarAyuda());
        document.getElementById('modal-ayuda').addEventListener('click', (e) => {
            if (e.target.id === 'modal-ayuda') {
                this.cerrarAyuda();
            }
        });

        // Selector de modo: en Modo Auxiliares no tiene sentido "con ayuda"
        // porque la fórmula revelaría directamente la respuesta.
        document.querySelectorAll('input[name="modo-juego"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.actualizarVisibilidadAyuda(e.target.value));
        });
    }

    actualizarVisibilidadAyuda(modo) {
        const checkAyuda = document.getElementById('con-ayuda');
        const wrapper = checkAyuda ? checkAyuda.closest('.check-ayuda') : null;
        if (!wrapper) return;
        const esAuxiliares = modo === 'auxiliares';
        wrapper.classList.toggle('oculto', esAuxiliares);
        if (esAuxiliares) checkAyuda.checked = false;
    }

    // Lee y valida la cantidad de preguntas pedida (mínimo 10, máximo el total).
    obtenerNumPreguntas() {
        const input = document.getElementById('num-preguntas');
        let n = parseInt(input.value, 10);
        if (isNaN(n)) n = 10;
        n = Math.max(10, Math.min(n, this.totalPool));
        input.value = n;
        return n;
    }

    iniciarJuego() {
        const numPreguntas = this.obtenerNumPreguntas();
        const modoInput = document.querySelector('input[name="modo-juego"]:checked');
        this.modo = modoInput ? modoInput.value : 'tiempos';
        const checkAyuda = document.getElementById('con-ayuda');
        this.conAyuda = this.modo === 'tiempos' && !!(checkAyuda && checkAyuda.checked);
        this.prepararConjugaciones(numPreguntas);
        this.preguntaActual = 0;
        this.aciertos = 0;
        this.errores = 0;

        const badge = document.getElementById('modo-badge');
        if (badge) badge.textContent = this.modo === 'auxiliares' ? '🔧 Modo Auxiliares' : '🕒 Modo Tiempos';

        this.mostrarPantalla('juego');
        this.mostrarPregunta();
    }

    // Elige al azar `numPreguntas` conjugaciones entre todos los verbos y variaciones.
    prepararConjugaciones(numPreguntas) {
        const pool = this.shuffleArray(this.poolCompleto);
        this.conjugaciones = pool.slice(0, numPreguntas);
    }

    obtenerNombreTiempo(tiempoKey) {
        const nombres = {
            'tiempo_presente': 'PRESENTE',
            'tiempo_pasado': 'PASADO',
            'tiempo_futuro': 'FUTURO'
        };
        return nombres[tiempoKey] || tiempoKey;
    }

    obtenerNombreVariacion(variacionKey) {
        const nombres = {
            'presente_simple': 'Simple',
            'presente_continuo': 'Continuo',
            'presente_perfecto': 'Perfecto',
            'presente_perfecto_continuo': 'Perfecto Continuo',
            'pasado_simple': 'Simple',
            'pasado_continuo': 'Continuo',
            'pasado_perfecto': 'Perfecto',
            'pasado_perfecto_continuo': 'Perfecto Continuo',
            'futuro_simple': 'Simple',
            'futuro_going_to': 'Going to',
            'futuro_continuo': 'Continuo',
            'futuro_perfecto': 'Perfecto',
            'futuro_perfecto_continuo': 'Perfecto Continuo'
        };
        return nombres[variacionKey] || variacionKey;
    }

    obtenerNombreTipo(tipoKey) {
        const nombres = {
            'positivo': 'Positiva',
            'negativo': 'Negativa',
            'interrogativo': 'Interrogativa'
        };
        return nombres[tipoKey] || tipoKey;
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    mostrarPregunta() {
        if (this.preguntaActual >= this.conjugaciones.length) {
            this.finalizarJuego();
            return;
        }

        const conjugacion = this.conjugaciones[this.preguntaActual];
        const esModoAuxiliar = this.modo === 'auxiliares';

        // Actualizar información del verbo
        document.getElementById('verbo-actual').textContent = conjugacion.verbo;
        document.getElementById('traduccion-actual').textContent = conjugacion.traduccion;

        // La oración en inglés revelaría el auxiliar, así que en ese modo se oculta
        // hasta que el jugador responda.
        document.querySelector('.oracion-container').classList.toggle('oculto', esModoAuxiliar);
        document.getElementById('preguntas-tiempos').classList.toggle('oculto', esModoAuxiliar);
        document.getElementById('preguntas-auxiliares').classList.toggle('oculto', !esModoAuxiliar);
        document.getElementById('btn-ayuda').classList.toggle('oculto', esModoAuxiliar || !this.conAyuda);

        // Limpiar selecciones
        this.respuestasSeleccionadas = { tiempo: null, variacion: null, tipo: null, auxiliar: null, forma: null };

        if (esModoAuxiliar) {
            document.getElementById('auxiliar-contexto').textContent =
                `${conjugacion.tiempo} ${conjugacion.variacion} — ${conjugacion.tipo}`;
            document.getElementById('auxiliar-pista').textContent = conjugacion.traduccionConjugacion;
            this.generarOpcionesAuxiliar(conjugacion);
            this.generarOpcionesForma(conjugacion);
        } else {
            document.getElementById('oracion-texto').textContent = conjugacion.conjugacion;
            document.getElementById('traduccion-oracion').textContent = conjugacion.traduccionConjugacion;
            this.generarOpciones('tiempo', conjugacion.tiempo);
            this.generarOpciones('variacion', conjugacion.variacion);
            this.generarOpciones('tipo', conjugacion.tipo);
        }

        // Actualizar estadísticas
        this.actualizarEstadisticas();

        document.getElementById('btn-responder').disabled = true;
        document.getElementById('btn-responder').textContent = 'Responder';

        // Restaurar el evento original del botón
        document.getElementById('btn-responder').onclick = () => this.verificarRespuesta();
    }

    generarOpciones(tipo, respuestaCorrecta) {
        const opciones = [];

        if (tipo === 'tiempo') {
            opciones.push('PASADO', 'PRESENTE', 'FUTURO');
        } else if (tipo === 'variacion') {
            opciones.push('Simple', 'Continuo', 'Perfecto', 'Perfecto Continuo', 'Going to');
        } else if (tipo === 'tipo') {
            opciones.push('Positiva', 'Negativa', 'Interrogativa');
        }

        // Mezclar opciones
        const opcionesMezcladas = this.shuffleArray(opciones);

        const container = document.getElementById(`opciones-${tipo}`);
        container.innerHTML = '';

        opcionesMezcladas.forEach(opcion => {
            const elemento = document.createElement('div');
            elemento.className = 'opcion';
            elemento.textContent = opcion;
            elemento.dataset.tipo = tipo;
            elemento.dataset.valor = opcion;
            container.appendChild(elemento);
        });
    }

    // Opciones del Modo Auxiliares: la correcta + 3 distractores del mismo tipo
    // de oración (para que sean auxiliares "creíbles", no de cualquier tipo).
    generarOpcionesAuxiliar(conjugacion) {
        const correcto = conjugacion.auxiliarCanonico;
        const candidatos = this.auxiliaresPorTipo[conjugacion.tipo].filter(a => a !== correcto);
        const distractores = this.shuffleArray(candidatos).slice(0, 3);
        const opciones = this.shuffleArray([correcto, ...distractores]);

        const container = document.getElementById('opciones-auxiliar');
        container.innerHTML = '';
        opciones.forEach(opcion => {
            const elemento = document.createElement('div');
            elemento.className = 'opcion';
            elemento.textContent = opcion;
            elemento.dataset.tipo = 'auxiliar';
            elemento.dataset.valor = opcion;
            container.appendChild(elemento);
        });
    }

    // Opciones de la forma del verbo principal: las formas propias del verbo
    // actual (base/-ing/pasado/participio, sin duplicados — algunos verbos
    // irregulares comparten forma, ej. "put/putting/put/put").
    generarOpcionesForma(conjugacion) {
        const unicas = [...new Set(Object.values(conjugacion.formas))];
        const opciones = this.shuffleArray(unicas);

        const container = document.getElementById('opciones-forma');
        container.innerHTML = '';
        opciones.forEach(opcion => {
            const elemento = document.createElement('div');
            elemento.className = 'opcion';
            elemento.textContent = opcion;
            elemento.dataset.tipo = 'forma';
            elemento.dataset.valor = opcion;
            container.appendChild(elemento);
        });
    }

    seleccionarOpcion(elemento) {
        const tipo = elemento.dataset.tipo;
        const valor = elemento.dataset.valor;

        // Deseleccionar otras opciones del mismo tipo
        document.querySelectorAll(`.opcion[data-tipo="${tipo}"]`).forEach(op => {
            op.classList.remove('seleccionada');
        });

        // Seleccionar la opción actual
        elemento.classList.add('seleccionada');
        this.respuestasSeleccionadas[tipo] = valor;

        // Habilitar botón de responder cuando estén las selecciones necesarias
        // para el modo actual
        const listo = this.modo === 'auxiliares'
            ? !!(this.respuestasSeleccionadas.auxiliar && this.respuestasSeleccionadas.forma)
            : !!(this.respuestasSeleccionadas.tiempo &&
                 this.respuestasSeleccionadas.variacion &&
                 this.respuestasSeleccionadas.tipo);
        document.getElementById('btn-responder').disabled = !listo;
    }

    verificarRespuesta() {
        const conjugacion = this.conjugaciones[this.preguntaActual];
        if (this.modo === 'auxiliares') {
            this.verificarRespuestaAuxiliar(conjugacion);
        } else {
            this.verificarRespuestaTiempos(conjugacion);
        }
    }

    // Valor seleccionado (si hay uno) entre las opciones de un data-tipo dado.
    obtenerSeleccionado(tipoDato) {
        let seleccionado = null;
        document.querySelectorAll(`.opcion[data-tipo="${tipoDato}"]`).forEach(opcion => {
            if (opcion.classList.contains('seleccionada')) {
                seleccionado = opcion.dataset.valor;
            }
        });
        return seleccionado;
    }

    verificarRespuestaAuxiliar(conjugacion) {
        const auxiliarSeleccionado = this.obtenerSeleccionado('auxiliar');
        const formaSeleccionada = this.obtenerSeleccionado('forma');

        const auxiliarOk = auxiliarSeleccionado === conjugacion.auxiliarCanonico;
        const formaOk = formaSeleccionada === conjugacion.formaCorrecta;
        const esCorrecto = auxiliarOk && formaOk;

        if (esCorrecto) {
            this.aciertos++;
        } else {
            this.errores++;
        }
        this.actualizarEstadisticas();

        document.getElementById('btn-responder').disabled = true;
        this.mostrarModalExplicacionAuxiliar(conjugacion, auxiliarSeleccionado, formaSeleccionada, esCorrecto);
    }

    verificarRespuestaTiempos(conjugacion) {
        let aciertosPregunta = 0;

        // Almacenar las respuestas del usuario para mostrar en el modal
        const respuestasUsuario = {
            tiempo: '',
            variacion: '',
            tipo: ''
        };

        // Verificar cada respuesta
        const verificaciones = [
            { tipo: 'tiempo', correcta: conjugacion.tiempo },
            { tipo: 'variacion', correcta: conjugacion.variacion },
            { tipo: 'tipo', correcta: conjugacion.tipo }
        ];

        verificaciones.forEach(verificacion => {
            const opciones = document.querySelectorAll(`.opcion[data-tipo="${verificacion.tipo}"]`);
            opciones.forEach(opcion => {
                if (opcion.classList.contains('seleccionada')) {
                    // Guardar la respuesta del usuario
                    respuestasUsuario[verificacion.tipo] = opcion.dataset.valor;

                    if (opcion.dataset.valor === verificacion.correcta) {
                        aciertosPregunta++;
                    }
                }
            });
        });

        // Actualizar estadísticas
        const esCorrecto = aciertosPregunta === 3;
        if (esCorrecto) {
            this.aciertos++;
        } else {
            this.errores++;
        }
        this.actualizarEstadisticas();

        // Mostrar siempre el modal de explicación (acierto o error) para aprender más.
        document.getElementById('btn-responder').disabled = true;
        this.mostrarModalExplicacion(conjugacion, respuestasUsuario, esCorrecto);
    }

    // Devuelve el "hack" más relevante según el tiempo/tipo de la oración.
    hackPara(conjugacion) {
        if (conjugacion.tiempo === 'PASADO' && conjugacion.variacion === 'Simple' && conjugacion.tipo !== 'Positiva') {
            return this.hacks.pasadoBase;
        }
        if (conjugacion.tipo === 'Interrogativa') return this.hacks.inversion;
        if (conjugacion.tipo === 'Negativa') return this.hacks.contracciones;
        if (conjugacion.variacion.includes('Perfecto')) return this.hacks.participio;
        return null;
    }

    actualizarEstadisticas() {
        document.getElementById('pregunta-actual').textContent = this.preguntaActual + 1;
        document.getElementById('total-preguntas').textContent = this.conjugaciones.length;
        document.getElementById('aciertos').textContent = this.aciertos;
        document.getElementById('errores').textContent = this.errores;

        // Actualizar barra de progreso
        const progreso = ((this.preguntaActual) / this.conjugaciones.length) * 100;
        document.getElementById('progress-fill').style.width = `${progreso}%`;
    }

    finalizarJuego() {
        const porcentaje = Math.round((this.aciertos / (this.aciertos + this.errores)) * 100);

        document.getElementById('aciertos-final').textContent = this.aciertos;
        document.getElementById('errores-final').textContent = this.errores;
        document.getElementById('porcentaje-final').textContent = `${porcentaje}%`;

        this.mostrarPantalla('resultados');
    }

    reiniciarJuego() {
        this.iniciarJuego();
    }

    mostrarModalExplicacion(conjugacion, respuestasUsuario, esCorrecto) {
        // Configurar el contenido del modal header con la oración en inglés y su traducción
        document.getElementById('modal-oracion-ingles').textContent = conjugacion.conjugacion;
        document.getElementById('modal-oracion-traduccion').textContent = conjugacion.traduccionConjugacion;
        document.getElementById('modal-auxiliar').textContent = conjugacion.auxiliar;
        // Por si la pregunta anterior fue del Modo Auxiliares, que lo oculta
        document.querySelector('.auxiliar-info').style.display = '';

        // Banner de resultado (acierto / error)
        const resultado = document.getElementById('modal-resultado');
        if (esCorrecto) {
            resultado.textContent = '✅ ¡Correcto!';
            resultado.className = 'modal-resultado correcto';
        } else {
            resultado.textContent = '❌ Incorrecto';
            resultado.className = 'modal-resultado incorrecto';
        }

        // Comparar respuestas; si acertó, ambas son iguales, así que se oculta.
        const respuestasUsuarioTexto = `${respuestasUsuario.tiempo} - ${respuestasUsuario.variacion} - ${respuestasUsuario.tipo}`;
        const respuestasCorrectasTexto = `${conjugacion.tiempo} - ${conjugacion.variacion} - ${conjugacion.tipo}`;
        document.getElementById('modal-respuesta-usuario').textContent = respuestasUsuarioTexto;
        document.getElementById('modal-respuesta-correcta').textContent = respuestasCorrectasTexto;
        const comparacion = document.querySelector('.respuestas-comparacion');
        if (comparacion) comparacion.style.display = esCorrecto ? 'none' : 'flex';

        // Teoría del tiempo verbal (uso, fórmula, ejemplos) + hack relevante
        document.getElementById('modal-explicacion-contenido').innerHTML = this.construirTeoriaHtml(conjugacion);

        // Mostrar el modal
        document.getElementById('modal-explicacion').classList.add('active');
        if (esCorrecto) this.celebrarAcierto();
    }

    // Versión del modal de explicación para el Modo Auxiliares: la oración en
    // inglés recién se revela acá, y la comparación es de auxiliares (no de
    // tiempo/variación/tipo).
    mostrarModalExplicacionAuxiliar(conjugacion, auxiliarSeleccionado, formaSeleccionada, esCorrecto) {
        document.getElementById('modal-oracion-ingles').textContent = conjugacion.conjugacion;
        document.getElementById('modal-oracion-traduccion').textContent = conjugacion.traduccionConjugacion;

        const resultado = document.getElementById('modal-resultado');
        if (esCorrecto) {
            resultado.textContent = '✅ ¡Correcto!';
            resultado.className = 'modal-resultado correcto';
        } else {
            resultado.textContent = '❌ Incorrecto';
            resultado.className = 'modal-resultado incorrecto';
        }

        const fraseUsuario = `${auxiliarSeleccionado || '(sin responder)'} + ${formaSeleccionada || '(sin responder)'}`;
        const fraseCorrecta = `${conjugacion.auxiliarCanonico} + ${conjugacion.formaCorrecta}`;
        document.getElementById('modal-respuesta-usuario').textContent = fraseUsuario;
        document.getElementById('modal-respuesta-correcta').textContent = fraseCorrecta;
        const comparacion = document.querySelector('.respuestas-comparacion');
        if (comparacion) comparacion.style.display = esCorrecto ? 'none' : 'flex';

        document.getElementById('modal-explicacion-contenido').innerHTML = this.construirTeoriaHtml(conjugacion);
        // Ya se muestra la comparación de auxiliares arriba; ocultar para no repetir.
        document.querySelector('.auxiliar-info').style.display = 'none';

        document.getElementById('modal-explicacion').classList.add('active');
        if (esCorrecto) this.celebrarAcierto();
    }

    // Efecto de confeti simple (CSS/JS puro) al acertar una pregunta.
    celebrarAcierto() {
        const contenedor = document.getElementById('confeti-container');
        if (!contenedor) return;
        contenedor.innerHTML = '';
        const colores = ['#58cc02', '#1cb0f6', '#ff9600', '#ff4b4b', '#8549ba', '#ffc800'];
        for (let i = 0; i < 24; i++) {
            const pieza = document.createElement('div');
            pieza.className = 'confeti';
            pieza.style.left = `${Math.random() * 100}%`;
            pieza.style.backgroundColor = colores[i % colores.length];
            pieza.style.animationDelay = `${Math.random() * 0.3}s`;
            pieza.style.animationDuration = `${0.9 + Math.random() * 0.6}s`;
            pieza.addEventListener('animationend', () => pieza.remove());
            contenedor.appendChild(pieza);
        }
    }

    // HTML reutilizable con la teoría de un caso (usado por el modal de explicación
    // y por el modal de ayuda).
    construirTeoriaHtml(conjugacion) {
        const t = this.teoria[conjugacion.tiempo][conjugacion.variacion];
        const hack = this.hackPara(conjugacion);
        const hackHtml = hack ? `<div class="explicacion-hack">💡 ${hack}</div>` : '';
        return `
            <div class="explicacion-item">
                <div class="explicacion-tiempo">${conjugacion.tiempo} ${conjugacion.variacion}</div>
                <div class="explicacion-descripcion"><strong>Uso:</strong> ${t.uso}</div>
                <div class="explicacion-formula"><strong>Fórmula:</strong> ${t.formula}</div>
                <div class="explicacion-auxiliares">
                    <div class="aux-titulo">Auxiliares</div>
                    <div class="aux-fila"><span class="ej-tipo positiva">Afirmativo</span> ${t.auxAfirmativo}</div>
                    <div class="aux-fila"><span class="ej-tipo negativa">Negativo</span> ${t.auxNegativo}</div>
                    <div class="aux-fila"><span class="ej-tipo interrogativa">Interrogativo</span> ${t.auxInterrogativo}</div>
                </div>
                <div class="explicacion-ejemplos">
                    <div><span class="ej-tipo">Afirmativo</span> ${t.afirmativo}</div>
                    <div><span class="ej-tipo">Negativo</span> ${t.negativo}</div>
                    <div><span class="ej-tipo">Pregunta</span> ${t.pregunta}</div>
                </div>
                ${hackHtml}
            </div>
        `;
    }

    // Abre el modal de ayuda con la teoría del caso de la pregunta actual.
    abrirAyuda() {
        const conjugacion = this.conjugaciones[this.preguntaActual];
        if (!conjugacion) return;
        document.getElementById('ayuda-oracion').textContent =
            `${conjugacion.conjugacion} — ${conjugacion.traduccionConjugacion}`;
        document.getElementById('ayuda-contenido').innerHTML = this.construirTeoriaHtml(conjugacion);
        document.getElementById('modal-ayuda').classList.add('active');
    }

    cerrarAyuda() {
        // Solo cierra el modal: NO avanza a la siguiente pregunta.
        document.getElementById('modal-ayuda').classList.remove('active');
    }

    cerrarModal() {
        document.getElementById('modal-explicacion').classList.remove('active');
        // Avanzar automáticamente a la siguiente pregunta
        this.preguntaActual++;
        this.mostrarPregunta();
        // Posicionar al inicio de la pantalla para mejor experiencia de usuario
        window.scrollTo(0, 0);
    }

    mostrarPantalla(pantalla) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.pantalla').forEach(p => p.classList.add('oculto'));

        // Mostrar la pantalla solicitada
        switch (pantalla) {
            case 'inicio':
                document.getElementById('pantalla-inicio').classList.remove('oculto');
                break;
            case 'juego':
                document.getElementById('pantalla-juego').classList.remove('oculto');
                break;
            case 'resultados':
                document.getElementById('pantalla-resultados').classList.remove('oculto');
                break;
        }
    }
}

// Inicializar el juego cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    new JuegoTiemposVerbos();
});
