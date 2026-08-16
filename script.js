class JuegoTiemposVerbos {
    constructor() {
        // La base de datos de verbos se genera a partir de una tabla compacta de
        // formas (ver construirVerbos / datosVerbos): 4 formas inglesas (base/ing/
        // pasado/participio) + 5 formas españolas por tiempo (yo/tú/él/nosotros/
        // ellos). construirVerbos() expande eso a los 7 pronombres ingleses (I,
        // you, he, she, it, we, they) aplicando reglas gramaticales genéricas
        // (perfilesPronombre + paradigmasAux/paradigmaSer), no listas por verbo.
        this.paradigmasAux = {
            estarPresente: ['estoy', 'estás', 'está', 'estamos', 'están'],
            estarPasado: ['estaba', 'estabas', 'estaba', 'estábamos', 'estaban'],
            estarFuturo: ['estaré', 'estarás', 'estará', 'estaremos', 'estarán'],
            haberPresente: ['he', 'has', 'ha', 'hemos', 'han'],
            haberPasado: ['había', 'habías', 'había', 'habíamos', 'habían'],
            haberFuturo: ['habré', 'habrás', 'habrá', 'habremos', 'habrán'],
            irPresente: ['voy', 'vas', 'va', 'vamos', 'van']
        };
        this.paradigmaSer = {
            presente: ['soy', 'eres', 'es', 'somos', 'son'],
            pasado: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'],
            futuro: ['seré', 'serás', 'será', 'seremos', 'serán']
        };

        // Perfil gramatical de cada pronombre: qué auxiliar de "be"/"do"/"have"
        // usa, y qué índice (0=yo,1=tú,2=él,3=nosotros,4=ellos) le corresponde en
        // las formas españolas por persona (he/she/it comparten índice porque en
        // español comparten la misma conjugación de 3ª persona singular).
        // `en` es la forma capitalizada (inicio de oración, positivo/negativo);
        // `enBajo` es la forma en minúscula para cuando el pronombre queda en
        // medio de la oración (preguntas: "Are you...?", "Is he...?"). "I" es
        // siempre mayúscula en cualquier posición.
        this.perfilesPronombre = [
            { en: 'I', enBajo: 'I', es: 'yo', idx: 0, tercera: false,
              ser: 'am', serNeg: 'am not', serNegHint: 'am not', serInterrog: 'Am',
              pasadoSer: 'was', pasadoSerNeg: "wasn't", pasadoSerNegHint: "wasn't - was not", pasadoSerInterrog: 'Was',
              auxPresente: 'do', auxPresenteNeg: "don't", auxPresenteInterrog: 'Do',
              auxPerfecto: 'have', auxPerfectoNeg: "haven't" },
            { en: 'You', enBajo: 'you', es: 'tú', idx: 1, tercera: false,
              ser: 'are', serNeg: "aren't", serNegHint: "aren't - are not", serInterrog: 'Are',
              pasadoSer: 'were', pasadoSerNeg: "weren't", pasadoSerNegHint: "weren't - were not", pasadoSerInterrog: 'Were',
              auxPresente: 'do', auxPresenteNeg: "don't", auxPresenteInterrog: 'Do',
              auxPerfecto: 'have', auxPerfectoNeg: "haven't" },
            { en: 'He', enBajo: 'he', es: 'él', idx: 2, tercera: true,
              ser: 'is', serNeg: "isn't", serNegHint: "isn't - is not", serInterrog: 'Is',
              pasadoSer: 'was', pasadoSerNeg: "wasn't", pasadoSerNegHint: "wasn't - was not", pasadoSerInterrog: 'Was',
              auxPresente: 'does', auxPresenteNeg: "doesn't", auxPresenteInterrog: 'Does',
              auxPerfecto: 'has', auxPerfectoNeg: "hasn't" },
            { en: 'She', enBajo: 'she', es: 'ella', idx: 2, tercera: true,
              ser: 'is', serNeg: "isn't", serNegHint: "isn't - is not", serInterrog: 'Is',
              pasadoSer: 'was', pasadoSerNeg: "wasn't", pasadoSerNegHint: "wasn't - was not", pasadoSerInterrog: 'Was',
              auxPresente: 'does', auxPresenteNeg: "doesn't", auxPresenteInterrog: 'Does',
              auxPerfecto: 'has', auxPerfectoNeg: "hasn't" },
            { en: 'It', enBajo: 'it', es: 'eso', idx: 2, tercera: true,
              ser: 'is', serNeg: "isn't", serNegHint: "isn't - is not", serInterrog: 'Is',
              pasadoSer: 'was', pasadoSerNeg: "wasn't", pasadoSerNegHint: "wasn't - was not", pasadoSerInterrog: 'Was',
              auxPresente: 'does', auxPresenteNeg: "doesn't", auxPresenteInterrog: 'Does',
              auxPerfecto: 'has', auxPerfectoNeg: "hasn't" },
            { en: 'We', enBajo: 'we', es: 'nosotros', idx: 3, tercera: false,
              ser: 'are', serNeg: "aren't", serNegHint: "aren't - are not", serInterrog: 'Are',
              pasadoSer: 'were', pasadoSerNeg: "weren't", pasadoSerNegHint: "weren't - were not", pasadoSerInterrog: 'Were',
              auxPresente: 'do', auxPresenteNeg: "don't", auxPresenteInterrog: 'Do',
              auxPerfecto: 'have', auxPerfectoNeg: "haven't" },
            { en: 'They', enBajo: 'they', es: 'ellos', idx: 4, tercera: false,
              ser: 'are', serNeg: "aren't", serNegHint: "aren't - are not", serInterrog: 'Are',
              pasadoSer: 'were', pasadoSerNeg: "weren't", pasadoSerNegHint: "weren't - were not", pasadoSerInterrog: 'Were',
              auxPresente: 'do', auxPresenteNeg: "don't", auxPresenteInterrog: 'Do',
              auxPerfecto: 'have', auxPerfectoNeg: "haven't" }
        ];

        this.verbos = this.construirVerbos();
        this.poolCompleto = this.construirPoolCompleto();
        this.totalPool = this.poolCompleto.length;
        this.auxiliaresPorTipo = this.construirAuxiliaresPorTipo();

        // Pool del Modo Formas: un ítem por verbo (no por conjugación), con la
        // regla ortográfica del -ed derivada de base/pasado (null = irregular).
        this.poolFormas = this.construirPoolFormas();
        this.totalPoolFormas = this.poolFormas.length;
        this.formasTipoActual = null;

        // Progreso persistido en localStorage: mejor racha histórica y preguntas
        // dominadas (5+ aciertos, ya no vuelven a salir). La racha actual es solo
        // de esta sesión (no se guarda hasta que se supera el récord).
        this.progreso = this.cargarProgreso();
        this.rachaActual = 0;

        // Nombres y explicaciones de las 4 reglas de ortografía del -ed, usadas
        // en el Modo Formas para los verbos regulares.
        this.nombresReglas = {
            simple: '+ed simple',
            duplica: 'Duplica consonante',
            y_ied: 'y → ied',
            silente: 'Quita la e muda'
        };
        this.reglasInfo = {
            simple: { nombre: '+ed simple', tip: 'Se agrega -ed sin ningún cambio de ortografía (play → played).' },
            duplica: { nombre: 'Duplica consonante', tip: 'Verbo de una sílaba que termina en consonante-vocal-consonante: se duplica la última consonante antes de -ed (stop → stopped).' },
            y_ied: { nombre: 'y → ied', tip: 'Termina en consonante + y: la y se convierte en i antes de -ed (try → tried).' },
            silente: { nombre: 'Quita la e muda', tip: 'Termina en e muda: solo se agrega -d, no -ed (use → used).' }
        };

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
    //   pres / pret / fut         -> conjugación española por persona, en el
    //                                orden [yo, tú, él, nosotros, ellos] (él
    //                                cubre también ella/it, que comparten la
    //                                misma 3ª persona singular en español)
    //   ger / partES              -> gerundio y participio en español (no varían por persona)
    datosVerbos() {
        return [
            { base: 'have', ing: 'having', past: 'had', part: 'had', trad: 'tener',
              pres: ['tengo', 'tienes', 'tiene', 'tenemos', 'tienen'],
              pret: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvieron'],
              fut: ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendrán'],
              ger: 'teniendo', partES: 'tenido' },
            { base: 'do', ing: 'doing', past: 'did', part: 'done', trad: 'hacer',
              pres: ['hago', 'haces', 'hace', 'hacemos', 'hacen'],
              pret: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicieron'],
              fut: ['haré', 'harás', 'hará', 'haremos', 'harán'],
              ger: 'haciendo', partES: 'hecho' },
            { base: 'say', ing: 'saying', past: 'said', part: 'said', trad: 'decir',
              pres: ['digo', 'dices', 'dice', 'decimos', 'dicen'],
              pret: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijeron'],
              fut: ['diré', 'dirás', 'dirá', 'diremos', 'dirán'],
              ger: 'diciendo', partES: 'dicho' },
            { base: 'go', ing: 'going', past: 'went', part: 'gone', trad: 'ir',
              pres: ['voy', 'vas', 'va', 'vamos', 'van'],
              pret: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'],
              fut: ['iré', 'irás', 'irá', 'iremos', 'irán'],
              ger: 'yendo', partES: 'ido' },
            { base: 'get', ing: 'getting', past: 'got', part: 'gotten', trad: 'conseguir',
              pres: ['consigo', 'consigues', 'consigue', 'conseguimos', 'consiguen'],
              pret: ['conseguí', 'conseguiste', 'consiguió', 'conseguimos', 'consiguieron'],
              fut: ['conseguiré', 'conseguirás', 'conseguirá', 'conseguiremos', 'conseguirán'],
              ger: 'consiguiendo', partES: 'conseguido' },
            { base: 'make', ing: 'making', past: 'made', part: 'made', trad: 'hacer (fabricar)', inf: 'hacer',
              pres: ['hago', 'haces', 'hace', 'hacemos', 'hacen'],
              pret: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicieron'],
              fut: ['haré', 'harás', 'hará', 'haremos', 'harán'],
              ger: 'haciendo', partES: 'hecho' },
            { base: 'take', ing: 'taking', past: 'took', part: 'taken', trad: 'tomar',
              pres: ['tomo', 'tomas', 'toma', 'tomamos', 'toman'],
              pret: ['tomé', 'tomaste', 'tomó', 'tomamos', 'tomaron'],
              fut: ['tomaré', 'tomarás', 'tomará', 'tomaremos', 'tomarán'],
              ger: 'tomando', partES: 'tomado' },
            { base: 'see', ing: 'seeing', past: 'saw', part: 'seen', trad: 'ver',
              pres: ['veo', 'ves', 've', 'vemos', 'ven'],
              pret: ['vi', 'viste', 'vio', 'vimos', 'vieron'],
              fut: ['veré', 'verás', 'verá', 'veremos', 'verán'],
              ger: 'viendo', partES: 'visto' },
            { base: 'come', ing: 'coming', past: 'came', part: 'come', trad: 'venir',
              pres: ['vengo', 'vienes', 'viene', 'venimos', 'vienen'],
              pret: ['vine', 'viniste', 'vino', 'vinimos', 'vinieron'],
              fut: ['vendré', 'vendrás', 'vendrá', 'vendremos', 'vendrán'],
              ger: 'viniendo', partES: 'venido' },
            { base: 'want', ing: 'wanting', past: 'wanted', part: 'wanted', trad: 'querer',
              pres: ['quiero', 'quieres', 'quiere', 'queremos', 'quieren'],
              pret: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisieron'],
              fut: ['querré', 'querrás', 'querrá', 'querremos', 'querrán'],
              ger: 'queriendo', partES: 'querido' },
            { base: 'give', ing: 'giving', past: 'gave', part: 'given', trad: 'dar',
              pres: ['doy', 'das', 'da', 'damos', 'dan'],
              pret: ['di', 'diste', 'dio', 'dimos', 'dieron'],
              fut: ['daré', 'darás', 'dará', 'daremos', 'darán'],
              ger: 'dando', partES: 'dado' },
            { base: 'put', ing: 'putting', past: 'put', part: 'put', trad: 'poner',
              pres: ['pongo', 'pones', 'pone', 'ponemos', 'ponen'],
              pret: ['puse', 'pusiste', 'puso', 'pusimos', 'pusieron'],
              fut: ['pondré', 'pondrás', 'pondrá', 'pondremos', 'pondrán'],
              ger: 'poniendo', partES: 'puesto' },
            { base: 'keep', ing: 'keeping', past: 'kept', part: 'kept', trad: 'mantener',
              pres: ['mantengo', 'mantienes', 'mantiene', 'mantenemos', 'mantienen'],
              pret: ['mantuve', 'mantuviste', 'mantuvo', 'mantuvimos', 'mantuvieron'],
              fut: ['mantendré', 'mantendrás', 'mantendrá', 'mantendremos', 'mantendrán'],
              ger: 'manteniendo', partES: 'mantenido' },
            { base: 'let', ing: 'letting', past: 'let', part: 'let', trad: 'dejar',
              pres: ['dejo', 'dejas', 'deja', 'dejamos', 'dejan'],
              pret: ['dejé', 'dejaste', 'dejó', 'dejamos', 'dejaron'],
              fut: ['dejaré', 'dejarás', 'dejará', 'dejaremos', 'dejarán'],
              ger: 'dejando', partES: 'dejado' },
            { base: 'seem', ing: 'seeming', past: 'seemed', part: 'seemed', trad: 'parecer',
              pres: ['parezco', 'pareces', 'parece', 'parecemos', 'parecen'],
              pret: ['parecí', 'pareciste', 'pareció', 'parecimos', 'parecieron'],
              fut: ['pareceré', 'parecerás', 'parecerá', 'pareceremos', 'parecerán'],
              ger: 'pareciendo', partES: 'parecido' },
            { base: 'send', ing: 'sending', past: 'sent', part: 'sent', trad: 'enviar',
              pres: ['envío', 'envías', 'envía', 'enviamos', 'envían'],
              pret: ['envié', 'enviaste', 'envió', 'enviamos', 'enviaron'],
              fut: ['enviaré', 'enviarás', 'enviará', 'enviaremos', 'enviarán'],
              ger: 'enviando', partES: 'enviado' },
            { base: 'think', ing: 'thinking', past: 'thought', part: 'thought', trad: 'pensar',
              pres: ['pienso', 'piensas', 'piensa', 'pensamos', 'piensan'],
              pret: ['pensé', 'pensaste', 'pensó', 'pensamos', 'pensaron'],
              fut: ['pensaré', 'pensarás', 'pensará', 'pensaremos', 'pensarán'],
              ger: 'pensando', partES: 'pensado' },
            { base: 'know', ing: 'knowing', past: 'knew', part: 'known', trad: 'saber',
              pres: ['sé', 'sabes', 'sabe', 'sabemos', 'saben'],
              pret: ['supe', 'supiste', 'supo', 'supimos', 'supieron'],
              fut: ['sabré', 'sabrás', 'sabrá', 'sabremos', 'sabrán'],
              ger: 'sabiendo', partES: 'sabido' },
            { base: 'look', ing: 'looking', past: 'looked', part: 'looked', trad: 'mirar',
              pres: ['miro', 'miras', 'mira', 'miramos', 'miran'],
              pret: ['miré', 'miraste', 'miró', 'miramos', 'miraron'],
              fut: ['miraré', 'mirarás', 'mirará', 'miraremos', 'mirarán'],
              ger: 'mirando', partES: 'mirado' },
            { base: 'use', ing: 'using', past: 'used', part: 'used', trad: 'usar',
              pres: ['uso', 'usas', 'usa', 'usamos', 'usan'],
              pret: ['usé', 'usaste', 'usó', 'usamos', 'usaron'],
              fut: ['usaré', 'usarás', 'usará', 'usaremos', 'usarán'],
              ger: 'usando', partES: 'usado' },
            { base: 'find', ing: 'finding', past: 'found', part: 'found', trad: 'encontrar',
              pres: ['encuentro', 'encuentras', 'encuentra', 'encontramos', 'encuentran'],
              pret: ['encontré', 'encontraste', 'encontró', 'encontramos', 'encontraron'],
              fut: ['encontraré', 'encontrarás', 'encontrará', 'encontraremos', 'encontrarán'],
              ger: 'encontrando', partES: 'encontrado' },
            { base: 'tell', ing: 'telling', past: 'told', part: 'told', trad: 'contar',
              pres: ['cuento', 'cuentas', 'cuenta', 'contamos', 'cuentan'],
              pret: ['conté', 'contaste', 'contó', 'contamos', 'contaron'],
              fut: ['contaré', 'contarás', 'contará', 'contaremos', 'contarán'],
              ger: 'contando', partES: 'contado' },
            { base: 'work', ing: 'working', past: 'worked', part: 'worked', trad: 'trabajar',
              pres: ['trabajo', 'trabajas', 'trabaja', 'trabajamos', 'trabajan'],
              pret: ['trabajé', 'trabajaste', 'trabajó', 'trabajamos', 'trabajaron'],
              fut: ['trabajaré', 'trabajarás', 'trabajará', 'trabajaremos', 'trabajarán'],
              ger: 'trabajando', partES: 'trabajado' },
            { base: 'call', ing: 'calling', past: 'called', part: 'called', trad: 'llamar',
              pres: ['llamo', 'llamas', 'llama', 'llamamos', 'llaman'],
              pret: ['llamé', 'llamaste', 'llamó', 'llamamos', 'llamaron'],
              fut: ['llamaré', 'llamarás', 'llamará', 'llamaremos', 'llamarán'],
              ger: 'llamando', partES: 'llamado' },
            { base: 'try', ing: 'trying', past: 'tried', part: 'tried', trad: 'intentar',
              pres: ['intento', 'intentas', 'intenta', 'intentamos', 'intentan'],
              pret: ['intenté', 'intentaste', 'intentó', 'intentamos', 'intentaron'],
              fut: ['intentaré', 'intentarás', 'intentará', 'intentaremos', 'intentarán'],
              ger: 'intentando', partES: 'intentado' },
            { base: 'ask', ing: 'asking', past: 'asked', part: 'asked', trad: 'preguntar',
              pres: ['pregunto', 'preguntas', 'pregunta', 'preguntamos', 'preguntan'],
              pret: ['pregunté', 'preguntaste', 'preguntó', 'preguntamos', 'preguntaron'],
              fut: ['preguntaré', 'preguntarás', 'preguntará', 'preguntaremos', 'preguntarán'],
              ger: 'preguntando', partES: 'preguntado' },
            { base: 'need', ing: 'needing', past: 'needed', part: 'needed', trad: 'necesitar',
              pres: ['necesito', 'necesitas', 'necesita', 'necesitamos', 'necesitan'],
              pret: ['necesité', 'necesitaste', 'necesitó', 'necesitamos', 'necesitaron'],
              fut: ['necesitaré', 'necesitarás', 'necesitará', 'necesitaremos', 'necesitarán'],
              ger: 'necesitando', partES: 'necesitado' },
            { base: 'feel', ing: 'feeling', past: 'felt', part: 'felt', trad: 'sentir',
              pres: ['siento', 'sientes', 'siente', 'sentimos', 'sienten'],
              pret: ['sentí', 'sentiste', 'sintió', 'sentimos', 'sintieron'],
              fut: ['sentiré', 'sentirás', 'sentirá', 'sentiremos', 'sentirán'],
              ger: 'sintiendo', partES: 'sentido' },
            { base: 'play', ing: 'playing', past: 'played', part: 'played', trad: 'jugar',
              pres: ['juego', 'juegas', 'juega', 'jugamos', 'juegan'],
              pret: ['jugué', 'jugaste', 'jugó', 'jugamos', 'jugaron'],
              fut: ['jugaré', 'jugarás', 'jugará', 'jugaremos', 'jugarán'],
              ger: 'jugando', partES: 'jugado' },
            { base: 'stop', ing: 'stopping', past: 'stopped', part: 'stopped', trad: 'parar',
              pres: ['paro', 'paras', 'para', 'paramos', 'paran'],
              pret: ['paré', 'paraste', 'paró', 'paramos', 'pararon'],
              fut: ['pararé', 'pararás', 'parará', 'pararemos', 'pararán'],
              ger: 'parando', partES: 'parado' },
            { base: 'plan', ing: 'planning', past: 'planned', part: 'planned', trad: 'planear',
              pres: ['planeo', 'planeas', 'planea', 'planeamos', 'planean'],
              pret: ['planeé', 'planeaste', 'planeó', 'planeamos', 'planearon'],
              fut: ['planearé', 'planearás', 'planeará', 'planearemos', 'planearán'],
              ger: 'planeando', partES: 'planeado' },

            // ===== Ampliación: 100 verbos adicionales (los más usados/importantes),
            // con conjugación completa igual que los de arriba. =====
            { base: 'add', ing: 'adding', past: 'added', part: 'added', trad: 'agregar',
              pres: ['agrego', 'agregas', 'agrega', 'agregamos', 'agregan'],
              pret: ['agregué', 'agregaste', 'agregó', 'agregamos', 'agregaron'],
              fut: ['agregaré', 'agregarás', 'agregará', 'agregaremos', 'agregarán'],
              ger: 'agregando', partES: 'agregado' },
            { base: 'bring', ing: 'bringing', past: 'brought', part: 'brought', trad: 'traer',
              pres: ['traigo', 'traes', 'trae', 'traemos', 'traen'],
              pret: ['traje', 'trajiste', 'trajo', 'trajimos', 'trajeron'],
              fut: ['traeré', 'traerás', 'traerá', 'traeremos', 'traerán'],
              ger: 'trayendo', partES: 'traído' },
            { base: 'change', ing: 'changing', past: 'changed', part: 'changed', trad: 'cambiar',
              pres: ['cambio', 'cambias', 'cambia', 'cambiamos', 'cambian'],
              pret: ['cambié', 'cambiaste', 'cambió', 'cambiamos', 'cambiaron'],
              fut: ['cambiaré', 'cambiarás', 'cambiará', 'cambiaremos', 'cambiarán'],
              ger: 'cambiando', partES: 'cambiado' },
            { base: 'finish', ing: 'finishing', past: 'finished', part: 'finished', trad: 'terminar',
              pres: ['termino', 'terminas', 'termina', 'terminamos', 'terminan'],
              pret: ['terminé', 'terminaste', 'terminó', 'terminamos', 'terminaron'],
              fut: ['terminaré', 'terminarás', 'terminará', 'terminaremos', 'terminarán'],
              ger: 'terminando', partES: 'terminado' },
            { base: 'happen', ing: 'happening', past: 'happened', part: 'happened', trad: 'pasar',
              pres: ['paso', 'pasas', 'pasa', 'pasamos', 'pasan'],
              pret: ['pasé', 'pasaste', 'pasó', 'pasamos', 'pasaron'],
              fut: ['pasaré', 'pasarás', 'pasará', 'pasaremos', 'pasarán'],
              ger: 'pasando', partES: 'pasado' },
            { base: 'meet', ing: 'meeting', past: 'met', part: 'met', trad: 'conocer',
              pres: ['conozco', 'conoces', 'conoce', 'conocemos', 'conocen'],
              pret: ['conocí', 'conociste', 'conoció', 'conocimos', 'conocieron'],
              fut: ['conoceré', 'conocerás', 'conocerá', 'conoceremos', 'conocerán'],
              ger: 'conociendo', partES: 'conocido' },
            { base: 'start', ing: 'starting', past: 'started', part: 'started', trad: 'empezar',
              pres: ['empiezo', 'empiezas', 'empieza', 'empezamos', 'empiezan'],
              pret: ['empecé', 'empezaste', 'empezó', 'empezamos', 'empezaron'],
              fut: ['empezaré', 'empezarás', 'empezará', 'empezaremos', 'empezarán'],
              ger: 'empezando', partES: 'empezado' },
            { base: 'explain', ing: 'explaining', past: 'explained', part: 'explained', trad: 'explicar',
              pres: ['explico', 'explicas', 'explica', 'explicamos', 'explican'],
              pret: ['expliqué', 'explicaste', 'explicó', 'explicamos', 'explicaron'],
              fut: ['explicaré', 'explicarás', 'explicará', 'explicaremos', 'explicarán'],
              ger: 'explicando', partES: 'explicado' },
            { base: 'listen', ing: 'listening', past: 'listened', part: 'listened', trad: 'escuchar',
              pres: ['escucho', 'escuchas', 'escucha', 'escuchamos', 'escuchan'],
              pret: ['escuché', 'escuchaste', 'escuchó', 'escuchamos', 'escucharon'],
              fut: ['escucharé', 'escucharás', 'escuchará', 'escucharemos', 'escucharán'],
              ger: 'escuchando', partES: 'escuchado' },
            { base: 'lie', ing: 'lying', past: 'lied', part: 'lied', trad: 'mentir',
              pres: ['miento', 'mientes', 'miente', 'mentimos', 'mienten'],
              pret: ['mentí', 'mentiste', 'mintió', 'mentimos', 'mintieron'],
              fut: ['mentiré', 'mentirás', 'mentirá', 'mentiremos', 'mentirán'],
              ger: 'mintiendo', partES: 'mentido' },
            { base: 'speak', ing: 'speaking', past: 'spoke', part: 'spoken', trad: 'hablar',
              pres: ['hablo', 'hablas', 'habla', 'hablamos', 'hablan'],
              pret: ['hablé', 'hablaste', 'habló', 'hablamos', 'hablaron'],
              fut: ['hablaré', 'hablarás', 'hablará', 'hablaremos', 'hablarán'],
              ger: 'hablando', partES: 'hablado' },
            { base: 'translate', ing: 'translating', past: 'translated', part: 'translated', trad: 'traducir',
              pres: ['traduzco', 'traduces', 'traduce', 'traducimos', 'traducen'],
              pret: ['traduje', 'tradujiste', 'tradujo', 'tradujimos', 'tradujeron'],
              fut: ['traduciré', 'traducirás', 'traducirá', 'traduciremos', 'traducirán'],
              ger: 'traduciendo', partES: 'traducido' },
            { base: 'understand', ing: 'understanding', past: 'understood', part: 'understood', trad: 'entender',
              pres: ['entiendo', 'entiendes', 'entiende', 'entendemos', 'entienden'],
              pret: ['entendí', 'entendiste', 'entendió', 'entendimos', 'entendieron'],
              fut: ['entenderé', 'entenderás', 'entenderá', 'entenderemos', 'entenderán'],
              ger: 'entendiendo', partES: 'entendido' },
            { base: 'agree', ing: 'agreeing', past: 'agreed', part: 'agreed', trad: 'coincidir',
              pres: ['coincido', 'coincides', 'coincide', 'coincidimos', 'coinciden'],
              pret: ['coincidí', 'coincidiste', 'coincidió', 'coincidimos', 'coincidieron'],
              fut: ['coincidiré', 'coincidirás', 'coincidirá', 'coincidiremos', 'coincidirán'],
              ger: 'coincidiendo', partES: 'coincidido' },
            { base: 'accept', ing: 'accepting', past: 'accepted', part: 'accepted', trad: 'aceptar',
              pres: ['acepto', 'aceptas', 'acepta', 'aceptamos', 'aceptan'],
              pret: ['acepté', 'aceptaste', 'aceptó', 'aceptamos', 'aceptaron'],
              fut: ['aceptaré', 'aceptarás', 'aceptará', 'aceptaremos', 'aceptarán'],
              ger: 'aceptando', partES: 'aceptado' },
            { base: 'believe', ing: 'believing', past: 'believed', part: 'believed', trad: 'creer',
              pres: ['creo', 'crees', 'cree', 'creemos', 'creen'],
              pret: ['creí', 'creíste', 'creyó', 'creímos', 'creyeron'],
              fut: ['creeré', 'creerás', 'creerá', 'creeremos', 'creerán'],
              ger: 'creyendo', partES: 'creído' },
            { base: 'belong', ing: 'belonging', past: 'belonged', part: 'belonged', trad: 'pertenecer',
              pres: ['pertenezco', 'perteneces', 'pertenece', 'pertenecemos', 'pertenecen'],
              pret: ['pertenecí', 'perteneciste', 'perteneció', 'pertenecimos', 'pertenecieron'],
              fut: ['perteneceré', 'pertenecerás', 'pertenecerá', 'perteneceremos', 'pertenecerán'],
              ger: 'perteneciendo', partES: 'pertenecido' },
            { base: 'cry', ing: 'crying', past: 'cried', part: 'cried', trad: 'llorar',
              pres: ['lloro', 'lloras', 'llora', 'lloramos', 'lloran'],
              pret: ['lloré', 'lloraste', 'lloró', 'lloramos', 'lloraron'],
              fut: ['lloraré', 'llorarás', 'llorará', 'lloraremos', 'llorarán'],
              ger: 'llorando', partES: 'llorado' },
            { base: 'decide', ing: 'deciding', past: 'decided', part: 'decided', trad: 'decidir',
              pres: ['decido', 'decides', 'decide', 'decidimos', 'deciden'],
              pret: ['decidí', 'decidiste', 'decidió', 'decidimos', 'decidieron'],
              fut: ['decidiré', 'decidirás', 'decidirá', 'decidiremos', 'decidirán'],
              ger: 'decidiendo', partES: 'decidido' },
            { base: 'dream', ing: 'dreaming', past: 'dreamed', part: 'dreamed', trad: 'soñar',
              pres: ['sueño', 'sueñas', 'sueña', 'soñamos', 'sueñan'],
              pret: ['soñé', 'soñaste', 'soñó', 'soñamos', 'soñaron'],
              fut: ['soñaré', 'soñarás', 'soñará', 'soñaremos', 'soñarán'],
              ger: 'soñando', partES: 'soñado' },
            { base: 'enjoy', ing: 'enjoying', past: 'enjoyed', part: 'enjoyed', trad: 'disfrutar',
              pres: ['disfruto', 'disfrutas', 'disfruta', 'disfrutamos', 'disfrutan'],
              pret: ['disfruté', 'disfrutaste', 'disfrutó', 'disfrutamos', 'disfrutaron'],
              fut: ['disfrutaré', 'disfrutarás', 'disfrutará', 'disfrutaremos', 'disfrutarán'],
              ger: 'disfrutando', partES: 'disfrutado' },
            { base: 'forget', ing: 'forgetting', past: 'forgot', part: 'forgotten', trad: 'olvidar',
              pres: ['olvido', 'olvidas', 'olvida', 'olvidamos', 'olvidan'],
              pret: ['olvidé', 'olvidaste', 'olvidó', 'olvidamos', 'olvidaron'],
              fut: ['olvidaré', 'olvidarás', 'olvidará', 'olvidaremos', 'olvidarán'],
              ger: 'olvidando', partES: 'olvidado' },
            { base: 'guess', ing: 'guessing', past: 'guessed', part: 'guessed', trad: 'adivinar',
              pres: ['adivino', 'adivinas', 'adivina', 'adivinamos', 'adivinan'],
              pret: ['adiviné', 'adivinaste', 'adivinó', 'adivinamos', 'adivinaron'],
              fut: ['adivinaré', 'adivinarás', 'adivinará', 'adivinaremos', 'adivinarán'],
              ger: 'adivinando', partES: 'adivinado' },
            { base: 'hate', ing: 'hating', past: 'hated', part: 'hated', trad: 'odiar',
              pres: ['odio', 'odias', 'odia', 'odiamos', 'odian'],
              pret: ['odié', 'odiaste', 'odió', 'odiamos', 'odiaron'],
              fut: ['odiaré', 'odiarás', 'odiará', 'odiaremos', 'odiarán'],
              ger: 'odiando', partES: 'odiado' },
            { base: 'imagine', ing: 'imagining', past: 'imagined', part: 'imagined', trad: 'imaginar',
              pres: ['imagino', 'imaginas', 'imagina', 'imaginamos', 'imaginan'],
              pret: ['imaginé', 'imaginaste', 'imaginó', 'imaginamos', 'imaginaron'],
              fut: ['imaginaré', 'imaginarás', 'imaginará', 'imaginaremos', 'imaginarán'],
              ger: 'imaginando', partES: 'imaginado' },
            { base: 'laugh', ing: 'laughing', past: 'laughed', part: 'laughed', trad: 'reír',
              pres: ['río', 'ríes', 'ríe', 'reímos', 'ríen'],
              pret: ['reí', 'reíste', 'rio', 'reímos', 'rieron'],
              fut: ['reiré', 'reirás', 'reirá', 'reiremos', 'reirán'],
              ger: 'riendo', partES: 'reído' },
            { base: 'follow', ing: 'following', past: 'followed', part: 'followed', trad: 'seguir',
              pres: ['sigo', 'sigues', 'sigue', 'seguimos', 'siguen'],
              pret: ['seguí', 'seguiste', 'siguió', 'seguimos', 'siguieron'],
              fut: ['seguiré', 'seguirás', 'seguirá', 'seguiremos', 'seguirán'],
              ger: 'siguiendo', partES: 'seguido' },
            { base: 'love', ing: 'loving', past: 'loved', part: 'loved', trad: 'amar',
              pres: ['amo', 'amas', 'ama', 'amamos', 'aman'],
              pret: ['amé', 'amaste', 'amó', 'amamos', 'amaron'],
              fut: ['amaré', 'amarás', 'amará', 'amaremos', 'amarán'],
              ger: 'amando', partES: 'amado' },
            { base: 'remember', ing: 'remembering', past: 'remembered', part: 'remembered', trad: 'recordar',
              pres: ['recuerdo', 'recuerdas', 'recuerda', 'recordamos', 'recuerdan'],
              pret: ['recordé', 'recordaste', 'recordó', 'recordamos', 'recordaron'],
              fut: ['recordaré', 'recordarás', 'recordará', 'recordaremos', 'recordarán'],
              ger: 'recordando', partES: 'recordado' },
            { base: 'smile', ing: 'smiling', past: 'smiled', part: 'smiled', trad: 'sonreír',
              pres: ['sonrío', 'sonríes', 'sonríe', 'sonreímos', 'sonríen'],
              pret: ['sonreí', 'sonreíste', 'sonrió', 'sonreímos', 'sonrieron'],
              fut: ['sonreiré', 'sonreirás', 'sonreirá', 'sonreiremos', 'sonreirán'],
              ger: 'sonriendo', partES: 'sonreído' },
            { base: 'share', ing: 'sharing', past: 'shared', part: 'shared', trad: 'compartir',
              pres: ['comparto', 'compartes', 'comparte', 'compartimos', 'comparten'],
              pret: ['compartí', 'compartiste', 'compartió', 'compartimos', 'compartieron'],
              fut: ['compartiré', 'compartirás', 'compartirá', 'compartiremos', 'compartirán'],
              ger: 'compartiendo', partES: 'compartido' },
            { base: 'close', ing: 'closing', past: 'closed', part: 'closed', trad: 'cerrar',
              pres: ['cierro', 'cierras', 'cierra', 'cerramos', 'cierran'],
              pret: ['cerré', 'cerraste', 'cerró', 'cerramos', 'cerraron'],
              fut: ['cerraré', 'cerrarás', 'cerrará', 'cerraremos', 'cerrarán'],
              ger: 'cerrando', partES: 'cerrado' },
            { base: 'dance', ing: 'dancing', past: 'danced', part: 'danced', trad: 'bailar',
              pres: ['bailo', 'bailas', 'baila', 'bailamos', 'bailan'],
              pret: ['bailé', 'bailaste', 'bailó', 'bailamos', 'bailaron'],
              fut: ['bailaré', 'bailarás', 'bailará', 'bailaremos', 'bailarán'],
              ger: 'bailando', partES: 'bailado' },
            { base: 'drive', ing: 'driving', past: 'drove', part: 'driven', trad: 'conducir',
              pres: ['conduzco', 'conduces', 'conduce', 'conducimos', 'conducen'],
              pret: ['conduje', 'condujiste', 'condujo', 'condujimos', 'condujeron'],
              fut: ['conduciré', 'conducirás', 'conducirá', 'conduciremos', 'conducirán'],
              ger: 'conduciendo', partES: 'conducido' },
            { base: 'move', ing: 'moving', past: 'moved', part: 'moved', trad: 'mover',
              pres: ['muevo', 'mueves', 'mueve', 'movemos', 'mueven'],
              pret: ['moví', 'moviste', 'movió', 'movimos', 'movieron'],
              fut: ['moveré', 'moverás', 'moverá', 'moveremos', 'moverán'],
              ger: 'moviendo', partES: 'movido' },
            { base: 'open', ing: 'opening', past: 'opened', part: 'opened', trad: 'abrir',
              pres: ['abro', 'abres', 'abre', 'abrimos', 'abren'],
              pret: ['abrí', 'abriste', 'abrió', 'abrimos', 'abrieron'],
              fut: ['abriré', 'abrirás', 'abrirá', 'abriremos', 'abrirán'],
              ger: 'abriendo', partES: 'abierto' },
            { base: 'pull', ing: 'pulling', past: 'pulled', part: 'pulled', trad: 'tirar',
              pres: ['tiro', 'tiras', 'tira', 'tiramos', 'tiran'],
              pret: ['tiré', 'tiraste', 'tiró', 'tiramos', 'tiraron'],
              fut: ['tiraré', 'tirarás', 'tirará', 'tiraremos', 'tirarán'],
              ger: 'tirando', partES: 'tirado' },
            { base: 'push', ing: 'pushing', past: 'pushed', part: 'pushed', trad: 'empujar',
              pres: ['empujo', 'empujas', 'empuja', 'empujamos', 'empujan'],
              pret: ['empujé', 'empujaste', 'empujó', 'empujamos', 'empujaron'],
              fut: ['empujaré', 'empujarás', 'empujará', 'empujaremos', 'empujarán'],
              ger: 'empujando', partES: 'empujado' },
            { base: 'run', ing: 'running', past: 'ran', part: 'run', trad: 'correr',
              pres: ['corro', 'corres', 'corre', 'corremos', 'corren'],
              pret: ['corrí', 'corriste', 'corrió', 'corrimos', 'corrieron'],
              fut: ['correré', 'correrás', 'correrá', 'correremos', 'correrán'],
              ger: 'corriendo', partES: 'corrido' },
            { base: 'swim', ing: 'swimming', past: 'swam', part: 'swum', trad: 'nadar',
              pres: ['nado', 'nadas', 'nada', 'nadamos', 'nadan'],
              pret: ['nadé', 'nadaste', 'nadó', 'nadamos', 'nadaron'],
              fut: ['nadaré', 'nadarás', 'nadará', 'nadaremos', 'nadarán'],
              ger: 'nadando', partES: 'nadado' },
            { base: 'travel', ing: 'traveling', past: 'traveled', part: 'traveled', trad: 'viajar',
              pres: ['viajo', 'viajas', 'viaja', 'viajamos', 'viajan'],
              pret: ['viajé', 'viajaste', 'viajó', 'viajamos', 'viajaron'],
              fut: ['viajaré', 'viajarás', 'viajará', 'viajaremos', 'viajarán'],
              ger: 'viajando', partES: 'viajado' },
            { base: 'visit', ing: 'visiting', past: 'visited', part: 'visited', trad: 'visitar',
              pres: ['visito', 'visitas', 'visita', 'visitamos', 'visitan'],
              pret: ['visité', 'visitaste', 'visitó', 'visitamos', 'visitaron'],
              fut: ['visitaré', 'visitarás', 'visitará', 'visitaremos', 'visitarán'],
              ger: 'visitando', partES: 'visitado' },
            { base: 'walk', ing: 'walking', past: 'walked', part: 'walked', trad: 'caminar',
              pres: ['camino', 'caminas', 'camina', 'caminamos', 'caminan'],
              pret: ['caminé', 'caminaste', 'caminó', 'caminamos', 'caminaron'],
              fut: ['caminaré', 'caminarás', 'caminará', 'caminaremos', 'caminarán'],
              ger: 'caminando', partES: 'caminado' },
            { base: 'break', ing: 'breaking', past: 'broke', part: 'broken', trad: 'romper',
              pres: ['rompo', 'rompes', 'rompe', 'rompemos', 'rompen'],
              pret: ['rompí', 'rompiste', 'rompió', 'rompimos', 'rompieron'],
              fut: ['romperé', 'romperás', 'romperá', 'romperemos', 'romperán'],
              ger: 'rompiendo', partES: 'roto' },
            { base: 'clean', ing: 'cleaning', past: 'cleaned', part: 'cleaned', trad: 'limpiar',
              pres: ['limpio', 'limpias', 'limpia', 'limpiamos', 'limpian'],
              pret: ['limpié', 'limpiaste', 'limpió', 'limpiamos', 'limpiaron'],
              fut: ['limpiaré', 'limpiarás', 'limpiará', 'limpiaremos', 'limpiarán'],
              ger: 'limpiando', partES: 'limpiado' },
            { base: 'cook', ing: 'cooking', past: 'cooked', part: 'cooked', trad: 'cocinar',
              pres: ['cocino', 'cocinas', 'cocina', 'cocinamos', 'cocinan'],
              pret: ['cociné', 'cocinaste', 'cocinó', 'cocinamos', 'cocinaron'],
              fut: ['cocinaré', 'cocinarás', 'cocinará', 'cocinaremos', 'cocinarán'],
              ger: 'cocinando', partES: 'cocinado' },
            { base: 'copy', ing: 'copying', past: 'copied', part: 'copied', trad: 'copiar',
              pres: ['copio', 'copias', 'copia', 'copiamos', 'copian'],
              pret: ['copié', 'copiaste', 'copió', 'copiamos', 'copiaron'],
              fut: ['copiaré', 'copiarás', 'copiará', 'copiaremos', 'copiarán'],
              ger: 'copiando', partES: 'copiado' },
            { base: 'compare', ing: 'comparing', past: 'compared', part: 'compared', trad: 'comparar',
              pres: ['comparo', 'comparas', 'compara', 'comparamos', 'comparan'],
              pret: ['comparé', 'comparaste', 'comparó', 'comparamos', 'compararon'],
              fut: ['compararé', 'compararás', 'comparará', 'compararemos', 'compararán'],
              ger: 'comparando', partES: 'comparado' },
            { base: 'die', ing: 'dying', past: 'died', part: 'died', trad: 'morir',
              pres: ['muero', 'mueres', 'muere', 'morimos', 'mueren'],
              pret: ['morí', 'moriste', 'murió', 'morimos', 'murieron'],
              fut: ['moriré', 'morirás', 'morirá', 'moriremos', 'morirán'],
              ger: 'muriendo', partES: 'muerto' },
            { base: 'discover', ing: 'discovering', past: 'discovered', part: 'discovered', trad: 'descubrir',
              pres: ['descubro', 'descubres', 'descubre', 'descubrimos', 'descubren'],
              pret: ['descubrí', 'descubriste', 'descubrió', 'descubrimos', 'descubrieron'],
              fut: ['descubriré', 'descubrirás', 'descubrirá', 'descubriremos', 'descubrirán'],
              ger: 'descubriendo', partES: 'descubierto' },
            { base: 'drink', ing: 'drinking', past: 'drank', part: 'drunk', trad: 'beber',
              pres: ['bebo', 'bebes', 'bebe', 'bebemos', 'beben'],
              pret: ['bebí', 'bebiste', 'bebió', 'bebimos', 'bebieron'],
              fut: ['beberé', 'beberás', 'beberá', 'beberemos', 'beberán'],
              ger: 'bebiendo', partES: 'bebido' },
            { base: 'dry', ing: 'drying', past: 'dried', part: 'dried', trad: 'secar',
              pres: ['seco', 'secas', 'seca', 'secamos', 'secan'],
              pret: ['sequé', 'secaste', 'secó', 'secamos', 'secaron'],
              fut: ['secaré', 'secarás', 'secará', 'secaremos', 'secarán'],
              ger: 'secando', partES: 'secado' },
            { base: 'eat', ing: 'eating', past: 'ate', part: 'eaten', trad: 'comer',
              pres: ['como', 'comes', 'come', 'comemos', 'comen'],
              pret: ['comí', 'comiste', 'comió', 'comimos', 'comieron'],
              fut: ['comeré', 'comerás', 'comerá', 'comeremos', 'comerán'],
              ger: 'comiendo', partES: 'comido' },
            { base: 'help', ing: 'helping', past: 'helped', part: 'helped', trad: 'ayudar',
              pres: ['ayudo', 'ayudas', 'ayuda', 'ayudamos', 'ayudan'],
              pret: ['ayudé', 'ayudaste', 'ayudó', 'ayudamos', 'ayudaron'],
              fut: ['ayudaré', 'ayudarás', 'ayudará', 'ayudaremos', 'ayudarán'],
              ger: 'ayudando', partES: 'ayudado' },
            { base: 'include', ing: 'including', past: 'included', part: 'included', trad: 'incluir',
              pres: ['incluyo', 'incluyes', 'incluye', 'incluimos', 'incluyen'],
              pret: ['incluí', 'incluiste', 'incluyó', 'incluimos', 'incluyeron'],
              fut: ['incluiré', 'incluirás', 'incluirá', 'incluiremos', 'incluirán'],
              ger: 'incluyendo', partES: 'incluido' },
            { base: 'kill', ing: 'killing', past: 'killed', part: 'killed', trad: 'matar',
              pres: ['mato', 'matas', 'mata', 'matamos', 'matan'],
              pret: ['maté', 'mataste', 'mató', 'matamos', 'mataron'],
              fut: ['mataré', 'matarás', 'matará', 'mataremos', 'matarán'],
              ger: 'matando', partES: 'matado' },
            { base: 'kiss', ing: 'kissing', past: 'kissed', part: 'kissed', trad: 'besar',
              pres: ['beso', 'besas', 'besa', 'besamos', 'besan'],
              pret: ['besé', 'besaste', 'besó', 'besamos', 'besaron'],
              fut: ['besaré', 'besarás', 'besará', 'besaremos', 'besarán'],
              ger: 'besando', partES: 'besado' },
            { base: 'learn', ing: 'learning', past: 'learned', part: 'learned', trad: 'aprender',
              pres: ['aprendo', 'aprendes', 'aprende', 'aprendemos', 'aprenden'],
              pret: ['aprendí', 'aprendiste', 'aprendió', 'aprendimos', 'aprendieron'],
              fut: ['aprenderé', 'aprenderás', 'aprenderá', 'aprenderemos', 'aprenderán'],
              ger: 'aprendiendo', partES: 'aprendido' },
            { base: 'live', ing: 'living', past: 'lived', part: 'lived', trad: 'vivir',
              pres: ['vivo', 'vives', 'vive', 'vivimos', 'viven'],
              pret: ['viví', 'viviste', 'vivió', 'vivimos', 'vivieron'],
              fut: ['viviré', 'vivirás', 'vivirá', 'viviremos', 'vivirán'],
              ger: 'viviendo', partES: 'vivido' },
            { base: 'read', ing: 'reading', past: 'read', part: 'read', trad: 'leer',
              pres: ['leo', 'lees', 'lee', 'leemos', 'leen'],
              pret: ['leí', 'leíste', 'leyó', 'leímos', 'leyeron'],
              fut: ['leeré', 'leerás', 'leerá', 'leeremos', 'leerán'],
              ger: 'leyendo', partES: 'leído' },
            { base: 'sing', ing: 'singing', past: 'sang', part: 'sung', trad: 'cantar',
              pres: ['canto', 'cantas', 'canta', 'cantamos', 'cantan'],
              pret: ['canté', 'cantaste', 'cantó', 'cantamos', 'cantaron'],
              fut: ['cantaré', 'cantarás', 'cantará', 'cantaremos', 'cantarán'],
              ger: 'cantando', partES: 'cantado' },
            { base: 'sleep', ing: 'sleeping', past: 'slept', part: 'slept', trad: 'dormir',
              pres: ['duermo', 'duermes', 'duerme', 'dormimos', 'duermen'],
              pret: ['dormí', 'dormiste', 'durmió', 'dormimos', 'durmieron'],
              fut: ['dormiré', 'dormirás', 'dormirá', 'dormiremos', 'dormirán'],
              ger: 'durmiendo', partES: 'dormido' },
            { base: 'teach', ing: 'teaching', past: 'taught', part: 'taught', trad: 'enseñar',
              pres: ['enseño', 'enseñas', 'enseña', 'enseñamos', 'enseñan'],
              pret: ['enseñé', 'enseñaste', 'enseñó', 'enseñamos', 'enseñaron'],
              fut: ['enseñaré', 'enseñarás', 'enseñará', 'enseñaremos', 'enseñarán'],
              ger: 'enseñando', partES: 'enseñado' },
            { base: 'touch', ing: 'touching', past: 'touched', part: 'touched', trad: 'tocar',
              pres: ['toco', 'tocas', 'toca', 'tocamos', 'tocan'],
              pret: ['toqué', 'tocaste', 'tocó', 'tocamos', 'tocaron'],
              fut: ['tocaré', 'tocarás', 'tocará', 'tocaremos', 'tocarán'],
              ger: 'tocando', partES: 'tocado' },
            { base: 'wait', ing: 'waiting', past: 'waited', part: 'waited', trad: 'esperar',
              pres: ['espero', 'esperas', 'espera', 'esperamos', 'esperan'],
              pret: ['esperé', 'esperaste', 'esperó', 'esperamos', 'esperaron'],
              fut: ['esperaré', 'esperarás', 'esperará', 'esperaremos', 'esperarán'],
              ger: 'esperando', partES: 'esperado' },
            { base: 'wash', ing: 'washing', past: 'washed', part: 'washed', trad: 'lavar',
              pres: ['lavo', 'lavas', 'lava', 'lavamos', 'lavan'],
              pret: ['lavé', 'lavaste', 'lavó', 'lavamos', 'lavaron'],
              fut: ['lavaré', 'lavarás', 'lavará', 'lavaremos', 'lavarán'],
              ger: 'lavando', partES: 'lavado' },
            { base: 'write', ing: 'writing', past: 'wrote', part: 'written', trad: 'escribir',
              pres: ['escribo', 'escribes', 'escribe', 'escribimos', 'escriben'],
              pret: ['escribí', 'escribiste', 'escribió', 'escribimos', 'escribieron'],
              fut: ['escribiré', 'escribirás', 'escribirá', 'escribiremos', 'escribirán'],
              ger: 'escribiendo', partES: 'escrito' },
            { base: 'cost', ing: 'costing', past: 'cost', part: 'cost', trad: 'costar',
              pres: ['cuesto', 'cuestas', 'cuesta', 'costamos', 'cuestan'],
              pret: ['costé', 'costaste', 'costó', 'costamos', 'costaron'],
              fut: ['costaré', 'costarás', 'costará', 'costaremos', 'costarán'],
              ger: 'costando', partES: 'costado' },
            { base: 'buy', ing: 'buying', past: 'bought', part: 'bought', trad: 'comprar',
              pres: ['compro', 'compras', 'compra', 'compramos', 'compran'],
              pret: ['compré', 'compraste', 'compró', 'compramos', 'compraron'],
              fut: ['compraré', 'comprarás', 'comprará', 'compraremos', 'comprarán'],
              ger: 'comprando', partES: 'comprado' },
            { base: 'pay', ing: 'paying', past: 'paid', part: 'paid', trad: 'pagar',
              pres: ['pago', 'pagas', 'paga', 'pagamos', 'pagan'],
              pret: ['pagué', 'pagaste', 'pagó', 'pagamos', 'pagaron'],
              fut: ['pagaré', 'pagarás', 'pagará', 'pagaremos', 'pagarán'],
              ger: 'pagando', partES: 'pagado' },
            { base: 'save', ing: 'saving', past: 'saved', part: 'saved', trad: 'ahorrar',
              pres: ['ahorro', 'ahorras', 'ahorra', 'ahorramos', 'ahorran'],
              pret: ['ahorré', 'ahorraste', 'ahorró', 'ahorramos', 'ahorraron'],
              fut: ['ahorraré', 'ahorrarás', 'ahorrará', 'ahorraremos', 'ahorrarán'],
              ger: 'ahorrando', partES: 'ahorrado' },
            { base: 'sell', ing: 'selling', past: 'sold', part: 'sold', trad: 'vender',
              pres: ['vendo', 'vendes', 'vende', 'vendemos', 'venden'],
              pret: ['vendí', 'vendiste', 'vendió', 'vendimos', 'vendieron'],
              fut: ['venderé', 'venderás', 'venderá', 'venderemos', 'venderán'],
              ger: 'vendiendo', partES: 'vendido' },
            { base: 'build', ing: 'building', past: 'built', part: 'built', trad: 'construir',
              pres: ['construyo', 'construyes', 'construye', 'construimos', 'construyen'],
              pret: ['construí', 'construiste', 'construyó', 'construimos', 'construyeron'],
              fut: ['construiré', 'construirás', 'construirá', 'construiremos', 'construirán'],
              ger: 'construyendo', partES: 'construido' },
            { base: 'catch', ing: 'catching', past: 'caught', part: 'caught', trad: 'atrapar',
              pres: ['atrapo', 'atrapas', 'atrapa', 'atrapamos', 'atrapan'],
              pret: ['atrapé', 'atrapaste', 'atrapó', 'atrapamos', 'atraparon'],
              fut: ['atraparé', 'atraparás', 'atrapará', 'atraparemos', 'atraparán'],
              ger: 'atrapando', partES: 'atrapado' },
            { base: 'choose', ing: 'choosing', past: 'chose', part: 'chosen', trad: 'elegir',
              pres: ['elijo', 'eliges', 'elige', 'elegimos', 'eligen'],
              pret: ['elegí', 'elegiste', 'eligió', 'elegimos', 'eligieron'],
              fut: ['elegiré', 'elegirás', 'elegirá', 'elegiremos', 'elegirán'],
              ger: 'eligiendo', partES: 'elegido' },
            { base: 'fall', ing: 'falling', past: 'fell', part: 'fallen', trad: 'caer',
              pres: ['caigo', 'caes', 'cae', 'caemos', 'caen'],
              pret: ['caí', 'caíste', 'cayó', 'caímos', 'cayeron'],
              fut: ['caeré', 'caerás', 'caerá', 'caeremos', 'caerán'],
              ger: 'cayendo', partES: 'caído' },
            { base: 'fly', ing: 'flying', past: 'flew', part: 'flown', trad: 'volar',
              pres: ['vuelo', 'vuelas', 'vuela', 'volamos', 'vuelan'],
              pret: ['volé', 'volaste', 'voló', 'volamos', 'volaron'],
              fut: ['volaré', 'volarás', 'volará', 'volaremos', 'volarán'],
              ger: 'volando', partES: 'volado' },
            { base: 'hold', ing: 'holding', past: 'held', part: 'held', trad: 'sostener',
              pres: ['sostengo', 'sostienes', 'sostiene', 'sostenemos', 'sostienen'],
              pret: ['sostuve', 'sostuviste', 'sostuvo', 'sostuvimos', 'sostuvieron'],
              fut: ['sostendré', 'sostendrás', 'sostendrá', 'sostendremos', 'sostendrán'],
              ger: 'sosteniendo', partES: 'sostenido' },
            { base: 'leave', ing: 'leaving', past: 'left', part: 'left', trad: 'salir',
              pres: ['salgo', 'sales', 'sale', 'salimos', 'salen'],
              pret: ['salí', 'saliste', 'salió', 'salimos', 'salieron'],
              fut: ['saldré', 'saldrás', 'saldrá', 'saldremos', 'saldrán'],
              ger: 'saliendo', partES: 'salido' },
            { base: 'lose', ing: 'losing', past: 'lost', part: 'lost', trad: 'perder',
              pres: ['pierdo', 'pierdes', 'pierde', 'perdemos', 'pierden'],
              pret: ['perdí', 'perdiste', 'perdió', 'perdimos', 'perdieron'],
              fut: ['perderé', 'perderás', 'perderá', 'perderemos', 'perderán'],
              ger: 'perdiendo', partES: 'perdido' },
            { base: 'ride', ing: 'riding', past: 'rode', part: 'ridden', trad: 'montar',
              pres: ['monto', 'montas', 'monta', 'montamos', 'montan'],
              pret: ['monté', 'montaste', 'montó', 'montamos', 'montaron'],
              fut: ['montaré', 'montarás', 'montará', 'montaremos', 'montarán'],
              ger: 'montando', partES: 'montado' },
            { base: 'rise', ing: 'rising', past: 'rose', part: 'risen', trad: 'subir',
              pres: ['subo', 'subes', 'sube', 'subimos', 'suben'],
              pret: ['subí', 'subiste', 'subió', 'subimos', 'subieron'],
              fut: ['subiré', 'subirás', 'subirá', 'subiremos', 'subirán'],
              ger: 'subiendo', partES: 'subido' },
            { base: 'serve', ing: 'serving', past: 'served', part: 'served', trad: 'servir',
              pres: ['sirvo', 'sirves', 'sirve', 'servimos', 'sirven'],
              pret: ['serví', 'serviste', 'sirvió', 'servimos', 'sirvieron'],
              fut: ['serviré', 'servirás', 'servirá', 'serviremos', 'servirán'],
              ger: 'sirviendo', partES: 'servido' },
            { base: 'spend', ing: 'spending', past: 'spent', part: 'spent', trad: 'gastar',
              pres: ['gasto', 'gastas', 'gasta', 'gastamos', 'gastan'],
              pret: ['gasté', 'gastaste', 'gastó', 'gastamos', 'gastaron'],
              fut: ['gastaré', 'gastarás', 'gastará', 'gastaremos', 'gastarán'],
              ger: 'gastando', partES: 'gastado' },
            { base: 'prepare', ing: 'preparing', past: 'prepared', part: 'prepared', trad: 'preparar',
              pres: ['preparo', 'preparas', 'prepara', 'preparamos', 'preparan'],
              pret: ['preparé', 'preparaste', 'preparó', 'preparamos', 'prepararon'],
              fut: ['prepararé', 'prepararás', 'preparará', 'prepararemos', 'prepararán'],
              ger: 'preparando', partES: 'preparado' },
            { base: 'steal', ing: 'stealing', past: 'stole', part: 'stolen', trad: 'robar',
              pres: ['robo', 'robas', 'roba', 'robamos', 'roban'],
              pret: ['robé', 'robaste', 'robó', 'robamos', 'robaron'],
              fut: ['robaré', 'robarás', 'robará', 'robaremos', 'robarán'],
              ger: 'robando', partES: 'robado' },
            { base: 'throw', ing: 'throwing', past: 'threw', part: 'thrown', trad: 'lanzar',
              pres: ['lanzo', 'lanzas', 'lanza', 'lanzamos', 'lanzan'],
              pret: ['lancé', 'lanzaste', 'lanzó', 'lanzamos', 'lanzaron'],
              fut: ['lanzaré', 'lanzarás', 'lanzará', 'lanzaremos', 'lanzarán'],
              ger: 'lanzando', partES: 'lanzado' },
            { base: 'win', ing: 'winning', past: 'won', part: 'won', trad: 'ganar',
              pres: ['gano', 'ganas', 'gana', 'ganamos', 'ganan'],
              pret: ['gané', 'ganaste', 'ganó', 'ganamos', 'ganaron'],
              fut: ['ganaré', 'ganarás', 'ganará', 'ganaremos', 'ganarán'],
              ger: 'ganando', partES: 'ganado' },
            { base: 'wear', ing: 'wearing', past: 'wore', part: 'worn', trad: 'llevar',
              pres: ['llevo', 'llevas', 'lleva', 'llevamos', 'llevan'],
              pret: ['llevé', 'llevaste', 'llevó', 'llevamos', 'llevaron'],
              fut: ['llevaré', 'llevarás', 'llevará', 'llevaremos', 'llevarán'],
              ger: 'llevando', partES: 'llevado' },
            { base: 'hit', ing: 'hitting', past: 'hit', part: 'hit', trad: 'golpear',
              pres: ['golpeo', 'golpeas', 'golpea', 'golpeamos', 'golpean'],
              pret: ['golpeé', 'golpeaste', 'golpeó', 'golpeamos', 'golpearon'],
              fut: ['golpearé', 'golpearás', 'golpeará', 'golpearemos', 'golpearán'],
              ger: 'golpeando', partES: 'golpeado' },
            { base: 'hurt', ing: 'hurting', past: 'hurt', part: 'hurt', trad: 'lastimar',
              pres: ['lastimo', 'lastimas', 'lastima', 'lastimamos', 'lastiman'],
              pret: ['lastimé', 'lastimaste', 'lastimó', 'lastimamos', 'lastimaron'],
              fut: ['lastimaré', 'lastimarás', 'lastimará', 'lastimaremos', 'lastimarán'],
              ger: 'lastimando', partES: 'lastimado' },
            { base: 'set', ing: 'setting', past: 'set', part: 'set', trad: 'colocar',
              pres: ['coloco', 'colocas', 'coloca', 'colocamos', 'colocan'],
              pret: ['coloqué', 'colocaste', 'colocó', 'colocamos', 'colocaron'],
              fut: ['colocaré', 'colocarás', 'colocará', 'colocaremos', 'colocarán'],
              ger: 'colocando', partES: 'colocado' },
            { base: 'hear', ing: 'hearing', past: 'heard', part: 'heard', trad: 'oír',
              pres: ['oigo', 'oyes', 'oye', 'oímos', 'oyen'],
              pret: ['oí', 'oíste', 'oyó', 'oímos', 'oyeron'],
              fut: ['oiré', 'oirás', 'oirá', 'oiremos', 'oirán'],
              ger: 'oyendo', partES: 'oído' },
            { base: 'show', ing: 'showing', past: 'showed', part: 'shown', trad: 'mostrar',
              pres: ['muestro', 'muestras', 'muestra', 'mostramos', 'muestran'],
              pret: ['mostré', 'mostraste', 'mostró', 'mostramos', 'mostraron'],
              fut: ['mostraré', 'mostrarás', 'mostrará', 'mostraremos', 'mostrarán'],
              ger: 'mostrando', partES: 'mostrado' },
            { base: 'wake', ing: 'waking', past: 'woke', part: 'woken', trad: 'despertar',
              pres: ['despierto', 'despiertas', 'despierta', 'despertamos', 'despiertan'],
              pret: ['desperté', 'despertaste', 'despertó', 'despertamos', 'despertaron'],
              fut: ['despertaré', 'despertarás', 'despertará', 'despertaremos', 'despertarán'],
              ger: 'despertando', partES: 'despertado' },
            { base: 'arrive', ing: 'arriving', past: 'arrived', part: 'arrived', trad: 'llegar',
              pres: ['llego', 'llegas', 'llega', 'llegamos', 'llegan'],
              pret: ['llegué', 'llegaste', 'llegó', 'llegamos', 'llegaron'],
              fut: ['llegaré', 'llegarás', 'llegará', 'llegaremos', 'llegarán'],
              ger: 'llegando', partES: 'llegado' },
            { base: 'carry', ing: 'carrying', past: 'carried', part: 'carried', trad: 'cargar',
              pres: ['cargo', 'cargas', 'carga', 'cargamos', 'cargan'],
              pret: ['cargué', 'cargaste', 'cargó', 'cargamos', 'cargaron'],
              fut: ['cargaré', 'cargarás', 'cargará', 'cargaremos', 'cargarán'],
              ger: 'cargando', partES: 'cargado' },
            { base: 'continue', ing: 'continuing', past: 'continued', part: 'continued', trad: 'continuar',
              pres: ['continúo', 'continúas', 'continúa', 'continuamos', 'continúan'],
              pret: ['continué', 'continuaste', 'continuó', 'continuamos', 'continuaron'],
              fut: ['continuaré', 'continuarás', 'continuará', 'continuaremos', 'continuarán'],
              ger: 'continuando', partES: 'continuado' },
            { base: 'fill', ing: 'filling', past: 'filled', part: 'filled', trad: 'llenar',
              pres: ['lleno', 'llenas', 'llena', 'llenamos', 'llenan'],
              pret: ['llené', 'llenaste', 'llenó', 'llenamos', 'llenaron'],
              fut: ['llenaré', 'llenarás', 'llenará', 'llenaremos', 'llenarán'],
              ger: 'llenando', partES: 'llenado' },
            { base: 'offer', ing: 'offering', past: 'offered', part: 'offered', trad: 'ofrecer',
              pres: ['ofrezco', 'ofreces', 'ofrece', 'ofrecemos', 'ofrecen'],
              pret: ['ofrecí', 'ofreciste', 'ofreció', 'ofrecimos', 'ofrecieron'],
              fut: ['ofreceré', 'ofrecerás', 'ofrecerá', 'ofreceremos', 'ofrecerán'],
              ger: 'ofreciendo', partES: 'ofrecido' },

            // ===== Ampliación: 68 verbos "solo Modo Formas" (soloFormas: true).
            // Solo necesitan base/past/part/trad -- no tienen pres/pret/fut por
            // persona, así que no entran al pool de Modo Tiempos/Auxiliares, pero sí
            // amplían el Modo Formas (drag & drop de pasado/participio o de la regla
            // ortográfica del -ed). =====
            { base: 'begin', past: 'began', part: 'begun', trad: 'comenzar', soloFormas: true },
            { base: 'bear', past: 'bore', part: 'born', trad: 'soportar, cargar', soloFormas: true },
            { base: 'beat', past: 'beat', part: 'beaten', trad: 'vencer, derrotar', soloFormas: true },
            { base: 'become', past: 'became', part: 'become', trad: 'convertirse, volverse', soloFormas: true },
            { base: 'bend', past: 'bent', part: 'bent', trad: 'doblar(se)', soloFormas: true },
            { base: 'bet', past: 'bet', part: 'bet', trad: 'apostar', soloFormas: true },
            { base: 'bind', past: 'bound', part: 'bound', trad: 'atar', soloFormas: true },
            { base: 'bite', past: 'bit', part: 'bitten', trad: 'morder', soloFormas: true },
            { base: 'bleed', past: 'bled', part: 'bled', trad: 'sangrar', soloFormas: true },
            { base: 'blow', past: 'blew', part: 'blown', trad: 'soplar', soloFormas: true },
            { base: 'breed', past: 'bred', part: 'bred', trad: 'criar', soloFormas: true },
            { base: 'burn', past: 'burnt', part: 'burnt', trad: 'quemar', soloFormas: true },
            { base: 'burst', past: 'burst', part: 'burst', trad: 'estallar', soloFormas: true },
            { base: 'creep', past: 'crept', part: 'crept', trad: 'arrastrarse', soloFormas: true },
            { base: 'deal', past: 'dealt', part: 'dealt', trad: 'repartir, tratar', soloFormas: true },
            { base: 'dig', past: 'dug', part: 'dug', trad: 'cavar', soloFormas: true },
            { base: 'draw', past: 'drew', part: 'drawn', trad: 'dibujar', soloFormas: true },
            { base: 'feed', past: 'fed', part: 'fed', trad: 'alimentar', soloFormas: true },
            { base: 'fight', past: 'fought', part: 'fought', trad: 'luchar, pelear', soloFormas: true },
            { base: 'flee', past: 'fled', part: 'fled', trad: 'huir', soloFormas: true },
            { base: 'forbid', past: 'forbade', part: 'forbidden', trad: 'prohibir', soloFormas: true },
            { base: 'forgive', past: 'forgave', part: 'forgiven', trad: 'perdonar', soloFormas: true },
            { base: 'forsake', past: 'forsook', part: 'forsaken', trad: 'abandonar', soloFormas: true },
            { base: 'freeze', past: 'froze', part: 'frozen', trad: 'congelar', soloFormas: true },
            { base: 'grind', past: 'ground', part: 'ground', trad: 'moler', soloFormas: true },
            { base: 'grow', past: 'grew', part: 'grown', trad: 'crecer', soloFormas: true },
            { base: 'hide', past: 'hid', part: 'hidden', trad: 'esconder', soloFormas: true },
            { base: 'knit', past: 'knit', part: 'knit', trad: 'tejer', soloFormas: true },
            { base: 'lay', past: 'laid', part: 'laid', trad: 'poner, tender', soloFormas: true },
            { base: 'lead', past: 'led', part: 'led', trad: 'guiar, conducir', soloFormas: true },
            { base: 'lend', past: 'lent', part: 'lent', trad: 'prestar', soloFormas: true },
            { base: 'quit', past: 'quit', part: 'quit', trad: 'abandonar, dejar', soloFormas: true },
            { base: 'ring', past: 'rang', part: 'rung', trad: 'sonar, llamar', soloFormas: true },
            { base: 'seek', past: 'sought', part: 'sought', trad: 'buscar', soloFormas: true },
            { base: 'shake', past: 'shook', part: 'shaken', trad: 'agitar, temblar', soloFormas: true },
            { base: 'shine', past: 'shone', part: 'shone', trad: 'brillar', soloFormas: true },
            { base: 'shoot', past: 'shot', part: 'shot', trad: 'disparar', soloFormas: true },
            { base: 'shrink', past: 'shrank', part: 'shrunk', trad: 'encoger(se)', soloFormas: true },
            { base: 'shut', past: 'shut', part: 'shut', trad: 'cerrar de golpe', soloFormas: true },
            { base: 'sink', past: 'sank', part: 'sunk', trad: 'hundirse', soloFormas: true },
            { base: 'spin', past: 'spun', part: 'spun', trad: 'girar', soloFormas: true },
            { base: 'spoil', past: 'spoilt', part: 'spoilt', trad: 'estropear, malcriar', soloFormas: true },
            { base: 'spread', past: 'spread', part: 'spread', trad: 'extender(se), difundir', soloFormas: true },
            { base: 'stick', past: 'stuck', part: 'stuck', trad: 'pegar, adherir', soloFormas: true },
            { base: 'sting', past: 'stung', part: 'stung', trad: 'picar', soloFormas: true },
            { base: 'strike', past: 'struck', part: 'struck', trad: 'golpear, atacar', soloFormas: true },
            { base: 'swear', past: 'swore', part: 'sworn', trad: 'jurar', soloFormas: true },
            { base: 'sweep', past: 'swept', part: 'swept', trad: 'barrer', soloFormas: true },
            { base: 'tear', past: 'tore', part: 'torn', trad: 'rasgar, desgarrar', soloFormas: true },
            { base: 'weave', past: 'wove', part: 'woven', trad: 'tejer, entrelazar', soloFormas: true },
            { base: 'weep', past: 'wept', part: 'wept', trad: 'llorar', soloFormas: true },
            { base: 'awake', past: 'awoke', part: 'awoken', trad: 'despertar(se)', soloFormas: true },
            { base: 'arise', past: 'arose', part: 'arisen', trad: 'surgir', soloFormas: true },
            { base: 'bid', past: 'bid', part: 'bid', trad: 'ofertar, pujar', soloFormas: true },
            { base: 'sit', past: 'sat', part: 'sat', trad: 'sentarse', soloFormas: true },
            { base: 'stand', past: 'stood', part: 'stood', trad: 'pararse, estar de pie', soloFormas: true },
            { base: 'spell', past: 'spelled', part: 'spelled', trad: 'deletrear', soloFormas: true },
            { base: 'achieve', past: 'achieved', part: 'achieved', trad: 'lograr', soloFormas: true },
            { base: 'admire', past: 'admired', part: 'admired', trad: 'admirar', soloFormas: true },
            { base: 'advise', past: 'advised', part: 'advised', trad: 'aconsejar', soloFormas: true },
            { base: 'answer', past: 'answered', part: 'answered', trad: 'responder', soloFormas: true },
            { base: 'attend', past: 'attended', part: 'attended', trad: 'asistir', soloFormas: true },
            { base: 'attract', past: 'attracted', part: 'attracted', trad: 'atraer', soloFormas: true },
            { base: 'borrow', past: 'borrowed', part: 'borrowed', trad: 'tomar prestado', soloFormas: true },
            { base: 'climb', past: 'climbed', part: 'climbed', trad: 'escalar, ascender', soloFormas: true },
            { base: 'collect', past: 'collected', part: 'collected', trad: 'coleccionar, recoger', soloFormas: true },
            { base: 'complete', past: 'completed', part: 'completed', trad: 'completar', soloFormas: true },
            { base: 'confirm', past: 'confirmed', part: 'confirmed', trad: 'confirmar', soloFormas: true }
        ];
    }

    construirVerbos() {
        const verbos = [];

        // "be" es el único verbo irregular como cópula (no encaja en la plantilla),
        // así que se construye aparte. Se conjuga una vez por cada uno de los 7
        // pronombres (perfilesPronombre).
        verbos.push({
            id: 1,
            verbo: 'be',
            traduccion: 'ser/estar',
            formas: { base: 'be', ing: 'being', pasado: 'was', participio: 'been', tercera: 'is' },
            conjugar_pronombre: this.perfilesPronombre.map(perfil => ({
                pronombre: perfil.en,
                traduccion: perfil.es,
                tercera: perfil.tercera,
                conjugar_tiempos: this.construirBeTiempos(perfil)
            }))
        });

        this.datosVerbos().forEach((f, i) => {
            // `soloFormas: true` marca verbos que solo tienen base/ing/past/part/trad
            // (sin pres/pret/fut por persona): amplían el Modo Formas sin poder
            // usarse en Modo Tiempos/Auxiliares, que sí necesitan la conjugación
            // completa. conjugar_pronombre queda null y construirPoolCompleto() los
            // filtra.
            verbos.push({
                id: i + 2,
                verbo: f.base,
                traduccion: f.trad,
                formas: { base: f.base, ing: f.ing, pasado: f.past, participio: f.part, tercera: this.terceraPersona(f.base) },
                conjugar_pronombre: f.soloFormas ? null : this.perfilesPronombre.map(perfil => ({
                    pronombre: perfil.en,
                    traduccion: perfil.es,
                    tercera: perfil.tercera,
                    conjugar_tiempos: this.plantillaTiempos(f, perfil)
                }))
            });
        });

        return verbos;
    }

    // Crea una celda de conjugación {conjugacion, traduccion, auxiliar}.
    cel(conjugacion, traduccion, auxiliar) {
        return { conjugacion, traduccion, auxiliar };
    }

    capitaliza(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    // Forma de 3ª persona singular del presente simple (he/she/it), derivada de
    // la base con las reglas ortográficas del inglés (sin listas por verbo, salvo
    // la única excepción real: have -> has).
    terceraPersona(base) {
        if (base === 'have') return 'has';
        if (/[sxz]$/.test(base) || /[cs]h$/.test(base)) return base + 'es';
        if (base.endsWith('o')) return base + 'es';
        const penultima = base[base.length - 2];
        if (base.endsWith('y') && penultima && !'aeiou'.includes(penultima)) {
            return base.slice(0, -1) + 'ies';
        }
        return base + 's';
    }

    // Genera los 12 tiempos × 3 tipos para un verbo léxico regular, para un
    // pronombre dado (perfil = entrada de perfilesPronombre). Los auxiliares en
    // inglés (am/is/are, do/does, have/has...) y la persona española (idx) salen
    // del perfil; solo pasado/futuro simple, "had" y "will" son iguales para
    // todos los pronombres (por eso no dependen del perfil).
    plantillaTiempos(f, perfil) {
        const ger = f.ger;
        const pES = f.partES;
        const inf = f.inf || f.trad; // infinitivo limpio para "voy a + infinitivo"
        const en = perfil.en;
        const enBajo = perfil.enBajo;
        const es = `${perfil.es} `;
        const idx = perfil.idx;
        const P = this.paradigmasAux;
        const presenteBase = perfil.tercera ? this.terceraPersona(f.base) : f.base;

        // Cuerpos en español (sin sujeto) por tiempo/variación, usando la forma
        // propia del verbo (pres/pret/fut[idx]) o los paradigmas auxiliares
        // invariantes (estar/haber/ir), que son iguales para cualquier verbo.
        const esPresSimple = f.pres[idx];
        const esPresCont = `${P.estarPresente[idx]} ${ger}`;
        const esPresPerf = `${P.haberPresente[idx]} ${pES}`;
        const esPresPerfCont = `${P.haberPresente[idx]} estado ${ger}`;
        const esPasSimple = f.pret[idx];
        const esPasCont = `${P.estarPasado[idx]} ${ger}`;
        const esPasPerf = `${P.haberPasado[idx]} ${pES}`;
        const esPasPerfCont = `${P.haberPasado[idx]} estado ${ger}`;
        const esFutSimple = f.fut[idx];
        const esFutGoingTo = `${P.irPresente[idx]} a ${inf}`;
        const esFutCont = `${P.estarFuturo[idx]} ${ger}`;
        const esFutPerf = `${P.haberFuturo[idx]} ${pES}`;
        const esFutPerfCont = `${P.haberFuturo[idx]} estado ${ger}`;

        return {
            tiempo_presente: {
                presente_simple: {
                    positivo: this.cel(`${en} ${presenteBase}`, `${es}${esPresSimple}`, '---'),
                    negativo: this.cel(`${en} ${perfil.auxPresenteNeg} ${f.base}`, `${es}no ${esPresSimple}`, `${perfil.auxPresenteNeg} - ${perfil.auxPresente} not`),
                    interrogativo: this.cel(`${perfil.auxPresenteInterrog} ${enBajo} ${f.base}?`, `¿${es}${esPresSimple}?`, perfil.auxPresente)
                },
                presente_continuo: {
                    positivo: this.cel(`${en} ${perfil.ser} ${f.ing}`, `${es}${esPresCont}`, perfil.ser),
                    negativo: this.cel(`${en} ${perfil.serNeg} ${f.ing}`, `${es}no ${esPresCont}`, perfil.serNegHint),
                    interrogativo: this.cel(`${perfil.serInterrog} ${enBajo} ${f.ing}?`, `¿${es}${esPresCont}?`, perfil.ser)
                },
                presente_perfecto: {
                    positivo: this.cel(`${en} ${perfil.auxPerfecto} ${f.part}`, `${es}${esPresPerf}`, perfil.auxPerfecto),
                    negativo: this.cel(`${en} ${perfil.auxPerfecto} not ${f.part}`, `${es}no ${esPresPerf}`, `${perfil.auxPerfectoNeg} - ${perfil.auxPerfecto} not`),
                    interrogativo: this.cel(`${this.capitaliza(perfil.auxPerfecto)} ${enBajo} ${f.part}?`, `¿${es}${esPresPerf}?`, perfil.auxPerfecto)
                },
                presente_perfecto_continuo: {
                    positivo: this.cel(`${en} ${perfil.auxPerfecto} been ${f.ing}`, `${es}${esPresPerfCont}`, `${perfil.auxPerfecto} been`),
                    negativo: this.cel(`${en} ${perfil.auxPerfecto} not been ${f.ing}`, `${es}no ${esPresPerfCont}`, `${perfil.auxPerfectoNeg} been - ${perfil.auxPerfecto} not been`),
                    interrogativo: this.cel(`${this.capitaliza(perfil.auxPerfecto)} ${enBajo} been ${f.ing}?`, `¿${es}${esPresPerfCont}?`, perfil.auxPerfecto)
                }
            },
            tiempo_pasado: {
                pasado_simple: {
                    positivo: this.cel(`${en} ${f.past}`, `${es}${esPasSimple}`, '---'),
                    negativo: this.cel(`${en} didn't ${f.base}`, `${es}no ${esPasSimple}`, "didn't - did not"),
                    interrogativo: this.cel(`Did ${enBajo} ${f.base}?`, `¿${es}${esPasSimple}?`, 'did')
                },
                pasado_continuo: {
                    positivo: this.cel(`${en} ${perfil.pasadoSer} ${f.ing}`, `${es}${esPasCont}`, perfil.pasadoSer),
                    negativo: this.cel(`${en} ${perfil.pasadoSerNeg} ${f.ing}`, `${es}no ${esPasCont}`, perfil.pasadoSerNegHint),
                    interrogativo: this.cel(`${perfil.pasadoSerInterrog} ${enBajo} ${f.ing}?`, `¿${es}${esPasCont}?`, perfil.pasadoSer)
                },
                pasado_perfecto: {
                    positivo: this.cel(`${en} had ${f.part}`, `${es}${esPasPerf}`, 'had'),
                    negativo: this.cel(`${en} hadn't ${f.part}`, `${es}no ${esPasPerf}`, "hadn't - had not"),
                    interrogativo: this.cel(`Had ${enBajo} ${f.part}?`, `¿${es}${esPasPerf}?`, 'had')
                },
                pasado_perfecto_continuo: {
                    positivo: this.cel(`${en} had been ${f.ing}`, `${es}${esPasPerfCont}`, 'had been'),
                    negativo: this.cel(`${en} hadn't been ${f.ing}`, `${es}no ${esPasPerfCont}`, "hadn't been - had not been"),
                    interrogativo: this.cel(`Had ${enBajo} been ${f.ing}?`, `¿${es}${esPasPerfCont}?`, 'had')
                }
            },
            tiempo_futuro: {
                futuro_simple: {
                    positivo: this.cel(`${en} will ${f.base}`, `${es}${esFutSimple}`, 'will'),
                    negativo: this.cel(`${en} won't ${f.base}`, `${es}no ${esFutSimple}`, "won't - will not"),
                    interrogativo: this.cel(`Will ${enBajo} ${f.base}?`, `¿${es}${esFutSimple}?`, 'will')
                },
                futuro_going_to: {
                    positivo: this.cel(`${en} ${perfil.ser} going to ${f.base}`, `${es}${esFutGoingTo}`, `${perfil.ser} going to`),
                    negativo: this.cel(`${en} ${perfil.serNeg} going to ${f.base}`, `${es}no ${esFutGoingTo}`, `${perfil.serNeg} going to`),
                    interrogativo: this.cel(`${perfil.serInterrog} ${enBajo} going to ${f.base}?`, `¿${es}${esFutGoingTo}?`, `${perfil.ser} going to`)
                },
                futuro_continuo: {
                    positivo: this.cel(`${en} will be ${f.ing}`, `${es}${esFutCont}`, 'will be'),
                    negativo: this.cel(`${en} won't be ${f.ing}`, `${es}no ${esFutCont}`, "won't be - will not be"),
                    interrogativo: this.cel(`Will ${enBajo} be ${f.ing}?`, `¿${es}${esFutCont}?`, 'will')
                },
                futuro_perfecto: {
                    positivo: this.cel(`${en} will have ${f.part}`, `${es}${esFutPerf}`, 'will have'),
                    negativo: this.cel(`${en} won't have ${f.part}`, `${es}no ${esFutPerf}`, "won't have - will not have"),
                    interrogativo: this.cel(`Will ${enBajo} have ${f.part}?`, `¿${es}${esFutPerf}?`, 'will')
                },
                futuro_perfecto_continuo: {
                    positivo: this.cel(`${en} will have been ${f.ing}`, `${es}${esFutPerfCont}`, 'will have been'),
                    negativo: this.cel(`${en} won't have been ${f.ing}`, `${es}no ${esFutPerfCont}`, "won't have been - will not have been"),
                    interrogativo: this.cel(`Will ${enBajo} have been ${f.ing}?`, `¿${es}${esFutPerfCont}?`, 'will')
                }
            }
        };
    }

    // "be" como cópula: el simple usa am/is/are (sin verbo léxico), el continuo
    // usa "being", el perfecto "been" y el perfecto continuo "been being". Se
    // conjuga por pronombre igual que plantillaTiempos, con el paradigma español
    // de "ser" (paradigmaSer) en vez del pres/pret/fut de un verbo léxico.
    construirBeTiempos(perfil) {
        const en = perfil.en;
        const enBajo = perfil.enBajo;
        const es = `${perfil.es} `;
        const idx = perfil.idx;
        const P = this.paradigmasAux;
        const S = this.paradigmaSer;

        return {
            tiempo_presente: {
                presente_simple: {
                    positivo: this.cel(`${en} ${perfil.ser}`, `${es}${S.presente[idx]}`, perfil.ser),
                    negativo: this.cel(`${en} ${perfil.serNeg}`, `${es}no ${S.presente[idx]}`, perfil.serNegHint),
                    interrogativo: this.cel(`${perfil.serInterrog} ${enBajo}?`, `¿${es}${S.presente[idx]}?`, perfil.ser)
                },
                presente_continuo: {
                    positivo: this.cel(`${en} ${perfil.ser} being`, `${es}${P.estarPresente[idx]} siendo`, perfil.ser),
                    negativo: this.cel(`${en} ${perfil.serNeg} being`, `${es}no ${P.estarPresente[idx]} siendo`, perfil.serNegHint),
                    interrogativo: this.cel(`${perfil.serInterrog} ${enBajo} being?`, `¿${es}${P.estarPresente[idx]} siendo?`, perfil.ser)
                },
                presente_perfecto: {
                    positivo: this.cel(`${en} ${perfil.auxPerfecto} been`, `${es}${P.haberPresente[idx]} sido`, perfil.auxPerfecto),
                    negativo: this.cel(`${en} ${perfil.auxPerfecto} not been`, `${es}no ${P.haberPresente[idx]} sido`, `${perfil.auxPerfectoNeg} - ${perfil.auxPerfecto} not`),
                    interrogativo: this.cel(`${this.capitaliza(perfil.auxPerfecto)} ${enBajo} been?`, `¿${es}${P.haberPresente[idx]} sido?`, perfil.auxPerfecto)
                },
                presente_perfecto_continuo: {
                    positivo: this.cel(`${en} ${perfil.auxPerfecto} been being`, `${es}${P.haberPresente[idx]} estado siendo`, `${perfil.auxPerfecto} been`),
                    negativo: this.cel(`${en} ${perfil.auxPerfecto} not been being`, `${es}no ${P.haberPresente[idx]} estado siendo`, `${perfil.auxPerfectoNeg} been - ${perfil.auxPerfecto} not been`),
                    interrogativo: this.cel(`${this.capitaliza(perfil.auxPerfecto)} ${enBajo} been being?`, `¿${es}${P.haberPresente[idx]} estado siendo?`, perfil.auxPerfecto)
                }
            },
            tiempo_pasado: {
                pasado_simple: {
                    positivo: this.cel(`${en} ${perfil.pasadoSer}`, `${es}${S.pasado[idx]}`, '---'),
                    negativo: this.cel(`${en} ${perfil.pasadoSerNeg}`, `${es}no ${S.pasado[idx]}`, perfil.pasadoSerNegHint),
                    interrogativo: this.cel(`${perfil.pasadoSerInterrog} ${enBajo}?`, `¿${es}${S.pasado[idx]}?`, perfil.pasadoSer)
                },
                pasado_continuo: {
                    positivo: this.cel(`${en} ${perfil.pasadoSer} being`, `${es}${P.estarPasado[idx]} siendo`, perfil.pasadoSer),
                    negativo: this.cel(`${en} ${perfil.pasadoSerNeg} being`, `${es}no ${P.estarPasado[idx]} siendo`, perfil.pasadoSerNegHint),
                    interrogativo: this.cel(`${perfil.pasadoSerInterrog} ${enBajo} being?`, `¿${es}${P.estarPasado[idx]} siendo?`, perfil.pasadoSer)
                },
                pasado_perfecto: {
                    positivo: this.cel(`${en} had been`, `${es}${P.haberPasado[idx]} sido`, 'had'),
                    negativo: this.cel(`${en} hadn't been`, `${es}no ${P.haberPasado[idx]} sido`, "hadn't - had not"),
                    interrogativo: this.cel(`Had ${enBajo} been?`, `¿${es}${P.haberPasado[idx]} sido?`, 'had')
                },
                pasado_perfecto_continuo: {
                    positivo: this.cel(`${en} had been being`, `${es}${P.haberPasado[idx]} estado siendo`, 'had been'),
                    negativo: this.cel(`${en} hadn't been being`, `${es}no ${P.haberPasado[idx]} estado siendo`, "hadn't been - had not been"),
                    interrogativo: this.cel(`Had ${enBajo} been being?`, `¿${es}${P.haberPasado[idx]} estado siendo?`, 'had')
                }
            },
            tiempo_futuro: {
                futuro_simple: {
                    positivo: this.cel(`${en} will be`, `${es}${S.futuro[idx]}`, 'will'),
                    negativo: this.cel(`${en} won't be`, `${es}no ${S.futuro[idx]}`, "won't - will not"),
                    interrogativo: this.cel(`Will ${enBajo} be?`, `¿${es}${S.futuro[idx]}?`, 'will')
                },
                futuro_going_to: {
                    positivo: this.cel(`${en} ${perfil.ser} going to be`, `${es}${P.irPresente[idx]} a ser`, `${perfil.ser} going to`),
                    negativo: this.cel(`${en} ${perfil.serNeg} going to be`, `${es}no ${P.irPresente[idx]} a ser`, `${perfil.serNeg} going to`),
                    interrogativo: this.cel(`${perfil.serInterrog} ${enBajo} going to be?`, `¿${es}${P.irPresente[idx]} a ser?`, `${perfil.ser} going to`)
                },
                futuro_continuo: {
                    positivo: this.cel(`${en} will be being`, `${es}${P.estarFuturo[idx]} siendo`, 'will be'),
                    negativo: this.cel(`${en} won't be being`, `${es}no ${P.estarFuturo[idx]} siendo`, "won't be - will not be"),
                    interrogativo: this.cel(`Will ${enBajo} be being?`, `¿${es}${P.estarFuturo[idx]} siendo?`, 'will')
                },
                futuro_perfecto: {
                    positivo: this.cel(`${en} will have been`, `${es}${P.haberFuturo[idx]} sido`, 'will have'),
                    negativo: this.cel(`${en} won't have been`, `${es}no ${P.haberFuturo[idx]} sido`, "won't have - will not have"),
                    interrogativo: this.cel(`Will ${enBajo} have been?`, `¿${es}${P.haberFuturo[idx]} sido?`, 'will')
                },
                futuro_perfecto_continuo: {
                    positivo: this.cel(`${en} will have been being`, `${es}${P.haberFuturo[idx]} estado siendo`, 'will have been'),
                    negativo: this.cel(`${en} won't have been being`, `${es}no ${P.haberFuturo[idx]} estado siendo`, "won't have been - will not have been"),
                    interrogativo: this.cel(`Will ${enBajo} have been being?`, `¿${es}${P.haberFuturo[idx]} estado siendo?`, 'will')
                }
            }
        };
    }

    // Deriva la regla ortográfica del -ed comparando base y pasado (sin listas
    // hardcodeadas): 'simple' | 'silente' | 'y_ied' | 'duplica', o null si el
    // verbo es irregular (no encaja en ninguna regla regular).
    reglaOrtografica(base, past) {
        if (base + 'ed' === past) return 'simple';
        if (base.endsWith('e') && base + 'd' === past) return 'silente';
        const penultima = base[base.length - 2];
        if (base.endsWith('y') && penultima && !'aeiou'.includes(penultima) && base.slice(0, -1) + 'ied' === past) {
            return 'y_ied';
        }
        const ultima = base[base.length - 1];
        if (base + ultima + 'ed' === past) return 'duplica';
        return null;
    }

    // Pool del Modo Formas: un ítem por verbo (base/pasado/participio + regla).
    // El `id` es estable entre partidas (se usa para el progreso guardado).
    construirPoolFormas() {
        return this.verbos.map(v => ({
            id: v.formas.base,
            verbo: v.formas.base,
            traduccion: v.traduccion,
            pasado: v.formas.pasado,
            participio: v.formas.participio,
            regla: this.reglaOrtografica(v.formas.base, v.formas.pasado)
        }));
    }

    // Aplana TODOS los verbos en una sola lista de conjugaciones (el "pool" del que
    // se eligen las preguntas al azar).
    construirPoolCompleto() {
        const pool = [];
        this.verbos.forEach(verbo => {
            if (!verbo.conjugar_pronombre) return; // soloFormas: no participa de Tiempos/Auxiliares
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
                            const formaClave = this.formaVerboClave(tiempo, nombreVariacion, tipo, pronombre.tercera);
                            // Id estable entre partidas: no depende del orden ni de índices,
                            // así que sigue siendo válido aunque cambie el pool en el futuro.
                            const id = `${verbo.verbo}_${pronombre.pronombre}_${tiempoKey}_${variacionKey}_${tipoKey}`;
                            pool.push({
                                id,
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

    // Determina qué forma toma el verbo principal (base/-ing/pasado/participio/
    // tercera) según el tiempo, la variación, el tipo de oración y si el
    // pronombre es de 3ª persona singular (he/she/it, que agregan -s/-es/-ies en
    // presente simple positivo). Es independiente del verbo concreto: el mismo
    // patrón vale para cualquiera de los verbos del pool.
    formaVerboClave(tiempo, variacion, tipo, esTercera) {
        if (variacion === 'Continuo' || variacion === 'Perfecto Continuo') return 'ing';
        if (variacion === 'Perfecto') return 'participio';
        if (variacion === 'Going to') return 'base';
        // Simple: el positivo del pasado usa el verbo en pasado; el positivo del
        // presente con he/she/it usa la 3ª persona; todo lo demás (incluido
        // negativo/interrogativo, que llevan did/didn't o do/does) va en base.
        if (tiempo === 'PASADO' && tipo === 'Positiva') return 'pasado';
        if (tiempo === 'PRESENTE' && variacion === 'Simple' && tipo === 'Positiva' && esTercera) return 'tercera';
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

    // ===================== Progreso persistido (localStorage) =====================

    // Lee el progreso guardado. Si no existe, está corrupto, o localStorage no
    // está disponible (modo privado, cuota excedida...), devuelve el estado por
    // defecto en memoria sin romper el juego.
    cargarProgreso() {
        const porDefecto = { mejorRacha: 0, dominadas: {} };
        try {
            const raw = localStorage.getItem('jtv_progreso_v1');
            if (!raw) return porDefecto;
            const datos = JSON.parse(raw);
            return {
                mejorRacha: typeof datos.mejorRacha === 'number' ? datos.mejorRacha : 0,
                dominadas: datos.dominadas && typeof datos.dominadas === 'object' ? datos.dominadas : {}
            };
        } catch (e) {
            return porDefecto;
        }
    }

    guardarProgreso() {
        try {
            localStorage.setItem('jtv_progreso_v1', JSON.stringify(this.progreso));
        } catch (e) {
            // No hay forma de persistir (modo privado, cuota excedida...); se
            // sigue jugando igual, solo que sin guardar entre sesiones.
        }
    }

    // Clave única de progreso: el id de la pregunta es el mismo para Tiempos y
    // Auxiliares (comparten pool), pero dominar una no implica dominar la otra,
    // así que el modo forma parte de la clave.
    claveProgreso(conjugacion) {
        return `${this.modo}:${conjugacion.id}`;
    }

    estaDominada(conjugacion) {
        return (this.progreso.dominadas[this.claveProgreso(conjugacion)] || 0) >= 5;
    }

    // Registra el resultado de una pregunta: actualiza la racha (se corta con un
    // error) y, si acertó, suma un acierto acumulado hacia el dominio de esa
    // pregunta puntual (no se resetea por errores en otras preguntas). Devuelve
    // true si se acaba de superar un récord de racha previo (para festejarlo).
    registrarResultado(conjugacion, esCorrecto) {
        const mejorRachaAnterior = this.progreso.mejorRacha;
        let esNuevoRecord = false;

        if (esCorrecto) {
            this.rachaActual++;
            if (this.rachaActual > this.progreso.mejorRacha) {
                this.progreso.mejorRacha = this.rachaActual;
                esNuevoRecord = mejorRachaAnterior > 0;
            }
            const clave = this.claveProgreso(conjugacion);
            const aciertosPrevios = this.progreso.dominadas[clave] || 0;
            if (aciertosPrevios < 5) this.progreso.dominadas[clave] = aciertosPrevios + 1;
        } else {
            this.rachaActual = 0;
        }

        this.guardarProgreso();
        return esNuevoRecord;
    }

    contarDominadas() {
        return Object.values(this.progreso.dominadas).filter(n => n >= 5).length;
    }

    // Borra todo el progreso guardado (dominadas + mejor racha). Se llama desde
    // el botón del home, con confirmación previa.
    resetearProgreso() {
        this.progreso = { mejorRacha: 0, dominadas: {} };
        this.rachaActual = 0;
        this.guardarProgreso();
        this.actualizarResumenProgreso();
    }

    // Actualiza el resumen de progreso mostrado en la pantalla de inicio.
    actualizarResumenProgreso() {
        const spanDominadas = document.getElementById('resumen-dominadas');
        const spanMejorRacha = document.getElementById('resumen-mejor-racha');
        if (spanDominadas) spanDominadas.textContent = this.contarDominadas();
        if (spanMejorRacha) spanMejorRacha.textContent = this.progreso.mejorRacha;
    }

    // ===================== Eventos y flujo del juego =====================

    inicializarEventos() {
        // Configurar el máximo de preguntas según el pool del modo seleccionado
        this.actualizarMaxPreguntas('tiempos');

        // Botones de navegación
        document.getElementById('btn-iniciar').addEventListener('click', () => {
            this.iniciarJuego();
        });
        document.getElementById('btn-reiniciar').addEventListener('click', () => this.reiniciarJuego());
        document.getElementById('btn-inicio').addEventListener('click', () => this.mostrarPantalla('inicio'));

        // Salir/reiniciar en medio de una partida (pantalla de juego): piden
        // confirmación porque descartan el progreso actual.
        document.getElementById('btn-reiniciar-juego').addEventListener('click', () => {
            if (confirm('¿Reiniciar el juego? Perderás el progreso de esta partida.')) {
                this.reiniciarJuego();
            }
        });
        document.getElementById('btn-salir-juego').addEventListener('click', () => {
            if (confirm('¿Volver al inicio? Perderás el progreso de esta partida.')) {
                this.mostrarPantalla('inicio');
            }
        });

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

        // Selector de modo: en Modo Auxiliares y Modo Formas no tiene sentido
        // "con ayuda" (revelaría la respuesta o no aplica la teoría de tiempos),
        // y cada modo tiene su propio tamaño de pool máximo.
        document.querySelectorAll('input[name="modo-juego"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.actualizarVisibilidadAyuda(e.target.value);
                this.actualizarMaxPreguntas(e.target.value);
            });
        });

        // Drag-and-drop del Modo Formas (funciona con mouse, touch y pen)
        this.inicializarDragDrop();

        // Progreso guardado: resumen en el home + botón para borrarlo
        document.getElementById('btn-borrar-progreso').addEventListener('click', () => {
            if (confirm('¿Borrar todo tu progreso guardado (racha y preguntas dominadas)? Esta acción no se puede deshacer.')) {
                this.resetearProgreso();
            }
        });
        this.actualizarResumenProgreso();
    }

    actualizarVisibilidadAyuda(modo) {
        const checkAyuda = document.getElementById('con-ayuda');
        const wrapper = checkAyuda ? checkAyuda.closest('.check-ayuda') : null;
        if (!wrapper) return;
        // En Modo Auxiliares no tiene sentido: la fórmula revelaría directamente
        // la respuesta. Tiempos y Formas sí pueden mostrar ayuda genérica.
        const sinAyuda = modo === 'auxiliares';
        wrapper.classList.toggle('oculto', sinAyuda);
        if (sinAyuda) checkAyuda.checked = false;
    }

    // Actualiza el máximo del input de cantidad de preguntas según el pool del
    // modo elegido (el Modo Formas tiene un pool mucho más chico: un ítem por
    // verbo, no por conjugación).
    actualizarMaxPreguntas(modo) {
        const inputNum = document.getElementById('num-preguntas');
        const spanMax = document.getElementById('max-preguntas');
        const max = modo === 'formas' ? this.totalPoolFormas : this.totalPool;
        if (inputNum) {
            inputNum.max = max;
            if (parseInt(inputNum.value, 10) > max) inputNum.value = max;
        }
        if (spanMax) spanMax.textContent = max;
    }

    // Lee y valida la cantidad de preguntas pedida (mínimo 10, máximo el total
    // del pool del modo actualmente seleccionado).
    obtenerNumPreguntas() {
        const input = document.getElementById('num-preguntas');
        const modoInput = document.querySelector('input[name="modo-juego"]:checked');
        const modo = modoInput ? modoInput.value : 'tiempos';
        const max = modo === 'formas' ? this.totalPoolFormas : this.totalPool;
        let n = parseInt(input.value, 10);
        if (isNaN(n)) n = 10;
        n = Math.max(10, Math.min(n, max));
        input.value = n;
        return n;
    }

    iniciarJuego() {
        const numPreguntas = this.obtenerNumPreguntas();
        const modoInput = document.querySelector('input[name="modo-juego"]:checked');
        this.modo = modoInput ? modoInput.value : 'tiempos';
        const checkAyuda = document.getElementById('con-ayuda');
        this.conAyuda = this.modo !== 'auxiliares' && !!(checkAyuda && checkAyuda.checked);
        this.prepararConjugaciones(numPreguntas);
        this.preguntaActual = 0;
        this.aciertos = 0;
        this.errores = 0;

        const badge = document.getElementById('modo-badge');
        if (badge) {
            badge.textContent = this.modo === 'auxiliares' ? '🔧 Modo Auxiliares'
                : this.modo === 'formas' ? '🧩 Modo Formas'
                : '🕒 Modo Tiempos';
        }

        this.mostrarPantalla('juego');
        this.mostrarPregunta();
    }

    // Elige al azar `numPreguntas` ítems del pool correspondiente al modo actual.
    // Elige `numPreguntas` al azar, priorizando las que todavía no están
    // dominadas (5+ aciertos). Si no quedan suficientes sin dominar (posible en
    // Modo Formas, que solo tiene 32 verbos), completa con dominadas para no
    // dejar el juego sin preguntas.
    prepararConjugaciones(numPreguntas) {
        const poolBase = this.modo === 'formas' ? this.poolFormas : this.poolCompleto;
        const sinDominar = this.shuffleArray(poolBase.filter(item => !this.estaDominada(item)));

        let seleccion = sinDominar.slice(0, numPreguntas);
        if (seleccion.length < numPreguntas) {
            const dominadas = this.shuffleArray(poolBase.filter(item => this.estaDominada(item)));
            seleccion = seleccion.concat(dominadas.slice(0, numPreguntas - seleccion.length));
        }

        this.conjugaciones = this.shuffleArray(seleccion);
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
        const esModoFormas = this.modo === 'formas';

        // Actualizar información del verbo
        document.getElementById('verbo-actual').textContent = conjugacion.verbo;
        document.getElementById('traduccion-actual').textContent = conjugacion.traduccion;

        // La oración en inglés revelaría el auxiliar, así que en ese modo se oculta
        // hasta que el jugador responda. El Modo Formas tampoco usa una oración.
        document.querySelector('.oracion-container').classList.toggle('oculto', esModoAuxiliar || esModoFormas);
        document.getElementById('preguntas-tiempos').classList.toggle('oculto', esModoAuxiliar || esModoFormas);
        document.getElementById('preguntas-auxiliares').classList.toggle('oculto', !esModoAuxiliar);
        document.getElementById('preguntas-formas').classList.toggle('oculto', !esModoFormas);
        document.getElementById('btn-ayuda').classList.toggle('oculto', esModoAuxiliar || !this.conAyuda);

        // Limpiar selecciones
        this.respuestasSeleccionadas = { tiempo: null, variacion: null, tipo: null, auxiliar: null, forma: null };

        if (esModoAuxiliar) {
            document.getElementById('auxiliar-contexto').textContent =
                `${conjugacion.tiempo} ${conjugacion.variacion} — ${conjugacion.tipo}`;
            document.getElementById('auxiliar-pista').textContent = conjugacion.traduccionConjugacion;
            this.generarOpcionesAuxiliar(conjugacion);
            this.generarOpcionesForma(conjugacion);
        } else if (esModoFormas) {
            this.prepararPreguntaFormas(conjugacion);
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

    // ===================== Modo Formas (drag-and-drop) =====================

    // Decide qué sub-juego mostrar según si el verbo es irregular (regla===null)
    // y arma su contenido.
    prepararPreguntaFormas(item) {
        const esIrregular = item.regla === null;
        this.formasTipoActual = esIrregular ? 'irregular' : 'regular';
        document.getElementById('formas-irregular').classList.toggle('oculto', !esIrregular);
        document.getElementById('formas-regular').classList.toggle('oculto', esIrregular);

        if (esIrregular) {
            this.renderFormasIrregular(item);
        } else {
            this.renderFormasRegular(item);
        }
    }

    crearFicha(valor) {
        const ficha = document.createElement('div');
        ficha.className = 'ficha';
        ficha.textContent = valor;
        ficha.dataset.valor = valor;
        return ficha;
    }

    // Sub-juego para irregulares: arrastrar pasado y participio a su zona.
    // Presente queda fijo (ya se muestra como dato). Los distractores salen de
    // las formas de otros verbos irregulares del pool.
    renderFormasIrregular(item) {
        document.getElementById('zona-presente-valor').textContent = item.verbo;

        ['zona-pasado', 'zona-participio'].forEach(id => {
            const zona = document.getElementById(id);
            zona.classList.remove('llena', 'correcta', 'incorrecta');
            const contenido = zona.querySelector('.zona-contenido');
            if (contenido) contenido.innerHTML = '';
        });

        const otras = this.poolFormas
            .filter(v => v.regla === null && v.verbo !== item.verbo)
            .flatMap(v => [v.pasado, v.participio]);
        const distractoresUnicos = [...new Set(otras)].filter(f => f !== item.pasado && f !== item.participio);
        const distractores = this.shuffleArray(distractoresUnicos).slice(0, 3);

        const fichas = this.shuffleArray([item.pasado, item.participio, ...distractores]);
        const bandeja = document.getElementById('bandeja-formas');
        bandeja.innerHTML = '';
        fichas.forEach(valor => bandeja.appendChild(this.crearFicha(valor)));
    }

    // Sub-juego para regulares: arrastrar el verbo a la regla de ortografía del
    // -ed que le corresponde.
    renderFormasRegular(item) {
        const bandeja = document.getElementById('bandeja-formas-regular');
        bandeja.innerHTML = '';
        bandeja.appendChild(this.crearFicha(item.verbo));

        document.querySelectorAll('#zonas-reglas .regla-zona').forEach(zona => {
            zona.classList.remove('llena', 'correcta', 'incorrecta');
            const contenido = zona.querySelector('.zona-contenido');
            if (contenido) contenido.innerHTML = '';
        });
    }

    // Motor genérico de drag-and-drop con Pointer Events (funciona igual con
    // mouse, touch y pen). Se registra una sola vez y usa delegación de eventos
    // porque las fichas se recrean en cada pregunta.
    inicializarDragDrop() {
        let arrastre = null;

        document.addEventListener('pointerdown', (e) => {
            const ficha = e.target.closest('.ficha');
            if (!ficha) return;
            e.preventDefault();

            const rect = ficha.getBoundingClientRect();
            arrastre = {
                ficha,
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top,
                origenPadre: ficha.parentElement,
                origenNext: ficha.nextSibling
            };

            ficha.setPointerCapture(e.pointerId);
            ficha.classList.add('arrastrando');
            ficha.style.width = `${rect.width}px`;
            ficha.style.position = 'fixed';
            ficha.style.left = `${rect.left}px`;
            ficha.style.top = `${rect.top}px`;
            document.body.appendChild(ficha);
        });

        document.addEventListener('pointermove', (e) => {
            if (!arrastre) return;
            arrastre.ficha.style.left = `${e.clientX - arrastre.offsetX}px`;
            arrastre.ficha.style.top = `${e.clientY - arrastre.offsetY}px`;

            document.querySelectorAll('.zona-soltar').forEach(z => z.classList.remove('resaltada'));
            const zona = this.elementoZonaBajo(e.clientX, e.clientY, arrastre.ficha);
            if (zona) zona.classList.add('resaltada');
        });

        document.addEventListener('pointerup', (e) => {
            if (!arrastre) return;
            const { ficha, origenPadre, origenNext } = arrastre;

            ficha.classList.remove('arrastrando');
            ficha.style.position = '';
            ficha.style.left = '';
            ficha.style.top = '';
            ficha.style.width = '';
            document.querySelectorAll('.zona-soltar').forEach(z => z.classList.remove('resaltada'));

            const zonaDestino = this.elementoZonaBajo(e.clientX, e.clientY, ficha);
            if (zonaDestino) {
                this.colocarFichaEnZona(ficha, zonaDestino);
            } else if (origenNext && origenNext.parentElement === origenPadre) {
                origenPadre.insertBefore(ficha, origenNext);
            } else {
                origenPadre.appendChild(ficha);
            }

            // Si la zona de origen quedó vacía tras el movimiento, se desmarca.
            const zonaOrigen = origenPadre.closest ? origenPadre.closest('.zona-soltar') : null;
            if (zonaOrigen) {
                const contenido = zonaOrigen.querySelector('.zona-contenido');
                zonaOrigen.classList.toggle('llena', !!(contenido && contenido.children.length > 0));
            }

            arrastre = null;
            this.actualizarBotonResponderFormas();
        });
    }

    // Devuelve la `.zona-soltar` que está debajo de un punto, ignorando la ficha
    // que se está arrastrando (para que no se detecte a sí misma).
    elementoZonaBajo(x, y, fichaExcluida) {
        const prevDisplay = fichaExcluida.style.display;
        fichaExcluida.style.display = 'none';
        const el = document.elementFromPoint(x, y);
        fichaExcluida.style.display = prevDisplay;
        return el ? el.closest('.zona-soltar') : null;
    }

    // Coloca una ficha dentro de una zona; si ya había otra, la devuelve a su bandeja.
    colocarFichaEnZona(ficha, zona) {
        const contenido = zona.querySelector('.zona-contenido');
        if (!contenido) return;
        const existente = contenido.querySelector('.ficha');
        if (existente && existente !== ficha) {
            const bandeja = this.formasTipoActual === 'irregular'
                ? document.getElementById('bandeja-formas')
                : document.getElementById('bandeja-formas-regular');
            if (bandeja) bandeja.appendChild(existente);
        }
        contenido.appendChild(ficha);
        zona.classList.add('llena');
    }

    // Habilita "Responder" cuando las zonas necesarias del sub-juego actual están llenas.
    actualizarBotonResponderFormas() {
        let listo;
        if (this.formasTipoActual === 'irregular') {
            const pasadoLleno = document.getElementById('zona-pasado').classList.contains('llena');
            const participioLleno = document.getElementById('zona-participio').classList.contains('llena');
            listo = pasadoLleno && participioLleno;
        } else {
            listo = document.querySelectorAll('#zonas-reglas .regla-zona.llena').length > 0;
        }
        document.getElementById('btn-responder').disabled = !listo;
    }

    verificarRespuestaFormas(item) {
        let esCorrecto, detalleUsuario, detalleCorrecto;

        if (item.regla === null) {
            const pasadoValor = document.querySelector('#zona-pasado .ficha')?.dataset.valor || '(sin responder)';
            const participioValor = document.querySelector('#zona-participio .ficha')?.dataset.valor || '(sin responder)';
            esCorrecto = pasadoValor === item.pasado && participioValor === item.participio;
            detalleUsuario = `${item.verbo} – ${pasadoValor} – ${participioValor}`;
            detalleCorrecto = `${item.verbo} – ${item.pasado} – ${item.participio}`;
            document.getElementById('zona-pasado').classList.add(pasadoValor === item.pasado ? 'correcta' : 'incorrecta');
            document.getElementById('zona-participio').classList.add(participioValor === item.participio ? 'correcta' : 'incorrecta');
        } else {
            const zonaElegida = document.querySelector('#zonas-reglas .regla-zona.llena');
            const reglaElegida = zonaElegida ? zonaElegida.dataset.regla : null;
            esCorrecto = reglaElegida === item.regla;
            detalleUsuario = reglaElegida ? this.nombresReglas[reglaElegida] : '(sin responder)';
            detalleCorrecto = this.nombresReglas[item.regla];
            if (zonaElegida) zonaElegida.classList.add(esCorrecto ? 'correcta' : 'incorrecta');
        }

        if (esCorrecto) {
            this.aciertos++;
        } else {
            this.errores++;
        }
        const esNuevoRecord = this.registrarResultado(item, esCorrecto);
        this.actualizarEstadisticas();

        document.getElementById('btn-responder').disabled = true;
        this.mostrarModalExplicacionFormas(item, esCorrecto, detalleUsuario, detalleCorrecto, esNuevoRecord);
    }

    mostrarModalExplicacionFormas(item, esCorrecto, detalleUsuario, detalleCorrecto, esNuevoRecord) {
        document.getElementById('modal-oracion-ingles').textContent = item.verbo;
        document.getElementById('modal-oracion-traduccion').textContent = item.traduccion;
        document.querySelector('.auxiliar-info').style.display = 'none';

        const resultado = document.getElementById('modal-resultado');
        if (esCorrecto) {
            resultado.textContent = '✅ ¡Correcto!';
            resultado.className = 'modal-resultado correcto';
        } else {
            resultado.textContent = '❌ Incorrecto';
            resultado.className = 'modal-resultado incorrecto';
        }
        this.mostrarBannerRacha(esNuevoRecord);

        document.getElementById('modal-respuesta-usuario').textContent = detalleUsuario;
        document.getElementById('modal-respuesta-correcta').textContent = detalleCorrecto;
        const comparacion = document.querySelector('.respuestas-comparacion');
        if (comparacion) comparacion.style.display = esCorrecto ? 'none' : 'flex';

        document.getElementById('modal-explicacion-contenido').innerHTML = this.construirTeoriaFormasHtml(item);

        document.getElementById('modal-explicacion').classList.add('active');
        if (esCorrecto) this.celebrarAcierto(esNuevoRecord);
    }

    construirTeoriaFormasHtml(item) {
        if (item.regla === null) {
            return `
                <div class="explicacion-item">
                    <div class="explicacion-tiempo">Verbo irregular</div>
                    <div class="explicacion-descripcion">Este verbo no sigue la regla del -ed: sus formas de pasado y participio hay que memorizarlas.</div>
                    <div class="explicacion-formula"><strong>Presente:</strong> ${item.verbo} &nbsp; <strong>Pasado:</strong> ${item.pasado} &nbsp; <strong>Participio:</strong> ${item.participio}</div>
                </div>
            `;
        }
        const regla = this.reglasInfo[item.regla];
        return `
            <div class="explicacion-item">
                <div class="explicacion-tiempo">Verbo regular — ${regla.nombre}</div>
                <div class="explicacion-descripcion">${regla.tip}</div>
                <div class="explicacion-formula"><strong>${item.verbo}</strong> → <strong>${item.pasado}</strong></div>
            </div>
        `;
    }

    // Ayuda del Modo Formas ANTES de responder: a diferencia de
    // construirTeoriaFormasHtml (que se muestra después y revela la respuesta
    // de este verbo puntual), acá solo se da referencia genérica para razonar
    // la respuesta, sin decir cuál es.
    construirAyudaFormasHtml(item) {
        if (item.regla === null) {
            return `
                <div class="explicacion-item">
                    <div class="explicacion-tiempo">📘 ¿Qué es el participio?</div>
                    <div class="explicacion-descripcion">Es la "3ª forma" del verbo (después del presente y el pasado). Se usa para armar los tiempos perfectos (have/has/had + participio). En los regulares es igual al pasado; en los irregulares, como este, puede ser distinto: <strong>go → went → gone</strong>.</div>
                    <div class="explicacion-formula">💡 Truco: si el verbo termina en <strong>-ow</strong>, el participio suele terminar en <strong>-own</strong> (know → known, throw → thrown). Y si no cambia nunca (put/put/put), ya te ahorraste una forma.</div>
                </div>
            `;
        }
        const filas = Object.values(this.reglasInfo)
            .map(r => `<div class="aux-fila"><span class="ej-tipo">${r.nombre}</span> ${r.tip}</div>`)
            .join('');
        return `
            <div class="explicacion-item">
                <div class="explicacion-tiempo">✍️ Reglas de ortografía del -ed</div>
                <div class="explicacion-descripcion">Este verbo es regular y sigue una de estas 4 reglas. Fijate cómo termina para decidir cuál.</div>
                <div class="explicacion-auxiliares">${filas}</div>
            </div>
        `;
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
        } else if (this.modo === 'formas') {
            this.verificarRespuestaFormas(conjugacion);
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
        const esNuevoRecord = this.registrarResultado(conjugacion, esCorrecto);
        this.actualizarEstadisticas();

        document.getElementById('btn-responder').disabled = true;
        this.mostrarModalExplicacionAuxiliar(conjugacion, auxiliarSeleccionado, formaSeleccionada, esCorrecto, esNuevoRecord);
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
        const esNuevoRecord = this.registrarResultado(conjugacion, esCorrecto);
        this.actualizarEstadisticas();

        // Mostrar siempre el modal de explicación (acierto o error) para aprender más.
        document.getElementById('btn-responder').disabled = true;
        this.mostrarModalExplicacion(conjugacion, respuestasUsuario, esCorrecto, esNuevoRecord);
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
        document.getElementById('racha-actual').textContent = this.rachaActual;

        // Actualizar barra de progreso
        const progreso = ((this.preguntaActual) / this.conjugaciones.length) * 100;
        document.getElementById('progress-fill').style.width = `${progreso}%`;
    }

    finalizarJuego() {
        const porcentaje = Math.round((this.aciertos / (this.aciertos + this.errores)) * 100);

        document.getElementById('aciertos-final').textContent = this.aciertos;
        document.getElementById('errores-final').textContent = this.errores;
        document.getElementById('porcentaje-final').textContent = `${porcentaje}%`;

        // La lección de participio/reglas del -ed solo aplica al terminar el Modo Formas.
        const leccion = document.getElementById('leccion-formas');
        if (leccion) leccion.classList.toggle('oculto', this.modo !== 'formas');

        this.mostrarPantalla('resultados');
    }

    reiniciarJuego() {
        this.iniciarJuego();
    }

    mostrarModalExplicacion(conjugacion, respuestasUsuario, esCorrecto, esNuevoRecord) {
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
        this.mostrarBannerRacha(esNuevoRecord);

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
        if (esCorrecto) this.celebrarAcierto(esNuevoRecord);
    }

    // Versión del modal de explicación para el Modo Auxiliares: la oración en
    // inglés recién se revela acá, y la comparación es de auxiliares (no de
    // tiempo/variación/tipo).
    mostrarModalExplicacionAuxiliar(conjugacion, auxiliarSeleccionado, formaSeleccionada, esCorrecto, esNuevoRecord) {
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
        this.mostrarBannerRacha(esNuevoRecord);

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
        if (esCorrecto) this.celebrarAcierto(esNuevoRecord);
    }

    // Muestra/oculta el aviso de "nuevo récord de racha" dentro del modal.
    mostrarBannerRacha(esNuevoRecord) {
        const banner = document.getElementById('modal-racha-record');
        if (!banner) return;
        if (esNuevoRecord) {
            banner.textContent = `🏆 ¡Nuevo récord de racha: ${this.rachaActual}!`;
            banner.classList.remove('oculto');
        } else {
            banner.classList.add('oculto');
        }
    }

    // Efecto de confeti simple (CSS/JS puro) al acertar una pregunta. Con más
    // piezas y más duración cuando se acaba de superar el récord de racha.
    celebrarAcierto(esNuevoRecord) {
        const contenedor = document.getElementById('confeti-container');
        if (!contenedor) return;
        contenedor.innerHTML = '';
        const colores = ['#58cc02', '#1cb0f6', '#ff9600', '#ff4b4b', '#8549ba', '#ffc800'];
        const cantidad = esNuevoRecord ? 48 : 24;
        for (let i = 0; i < cantidad; i++) {
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
        if (this.modo === 'formas') {
            document.getElementById('ayuda-oracion').textContent =
                `${conjugacion.verbo} — ${conjugacion.traduccion}`;
            document.getElementById('ayuda-contenido').innerHTML = this.construirAyudaFormasHtml(conjugacion);
        } else {
            document.getElementById('ayuda-oracion').textContent =
                `${conjugacion.conjugacion} — ${conjugacion.traduccionConjugacion}`;
            document.getElementById('ayuda-contenido').innerHTML = this.construirTeoriaHtml(conjugacion);
        }
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
                this.actualizarResumenProgreso();
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
