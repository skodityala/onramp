export type Locale = 'en' | 'es' | 'fr';

export const COPY = {
  appTitle: 'Onramp',
  tagline: 'The first step, and only the first step.',
  startLabel: 'What do you have to do?',
  startPlaceholder: 'Paste it exactly as your teacher wrote it.',
  startCta: 'Find my first step',
  startExamplesLabel: 'Or try one of these',
  stepDone: 'Done',
  stepDoneNext: 'Done, next step',
  stepSmaller: 'Smaller',
  stepWhy: 'Why this?',
  stepWhyClose: 'Close',
  stepBack: 'previous step',
  stepDuration: 'about {n} {unit}',
  stepStarted: 'you started',
  auditHeading: 'Why this step',
  auditFrom: 'This came from',
  auditAuthority: 'The checker, not the model, decides when a step is small enough.',
  auditSourceRules: 'Built by the rules engine.',
  auditSourceModel: 'Proposed by the model and accepted by the checker.',
  auditSourceRegated: 'The model proposed something the checker rejected, so the rules engine was used instead.',
  auditCriticHeading: 'Critic',
  auditCoachHeading: 'Coach',
  finishTitle: 'That is the whole thing, finished.',
  finishCta: 'Start something else',
  finishSend: 'Send this to someone',
  finishSendCopied: 'Copied',
  finishStartedOnce: 'You started once.',
  finishStartedMany: 'You started {n} times.',
  finishMedian: 'You started each step in about {n} seconds.',
  errorEmpty: 'Paste the task first and I will find a starting point.',
  toggleSpacing: 'Extra spacing',
  toggleFont: 'Monospace',
  shortcuts: 'Keyboard: D done, S smaller, W why',
  voiceStart: 'Speak your assignment',
  voiceStop: 'Stop',
  voiceListening: 'Listening',
  voiceUnavailable: 'Voice input is not available in this browser.',
  installTitle: 'Install Onramp on this device',
  installCta: 'Install',
  installDismiss: 'Not now',
  qrHeading: 'Or scan to open',
  qrAlt: 'QR code linking to this session',
  settingsTitle: 'Settings',
  settingsClose: 'Close',
  settingsOpen: 'Settings',
  settingsClearHistory: 'Clear history',
  settingsClearSession: 'Clear current session',
  settingsAbout: 'About Onramp',
  settingsAboutBody: 'Onramp finds the first step of an assignment, then only that step.',
  settingsAboutLink: 'Read the README',
  settingsVersion: 'Version {v}',
  settingsShortcuts: 'Keyboard shortcuts',
  historyLink: 'See past sessions',
  historyTitle: 'Past sessions',
  historyEmpty: 'No past sessions yet.',
  historyResume: 'Resume',
  historyDelete: 'Delete',
  historyBack: 'Back',
  historyStartedOnce: 'started once',
  historyStartedMany: 'started {n} times',
  historyFinished: 'finished',
  historyUnfinished: 'in progress',
  shareDialogTitle: 'Share this session',
  shareDialogNote: 'This link contains the assignment text. It does not contain your name, timing, or typed content. It creates a fresh session for the recipient.',
  shareDialogClose: 'Close',
  shareDialogCopy: 'Copy link',
  shareDialogCopied: 'Copied',
  shareDialogUrlLabel: 'Share link',
} as const;

export const EXAMPLES = [
  '5 page essay on the causes of World War One, due Friday',
  'Read chapter 7 and take notes',
  'Study for the biology test on Monday',
] as const;

// Spanish translations. Tone: neutral, non-praising, matching the English
// restraint. No gamification vocabulary, no em/en dashes.
const COPY_ES: Partial<Record<keyof typeof COPY, string>> = {
  appTitle: 'Onramp',
  tagline: 'El primer paso, y solo el primer paso.',
  startLabel: '¿Qué tienes que hacer?',
  startPlaceholder: 'Pégalo exactamente como te lo escribió tu profesor.',
  startCta: 'Encuentra mi primer paso',
  startExamplesLabel: 'O prueba uno de estos',
  stepDone: 'Hecho',
  stepDoneNext: 'Hecho, siguiente paso',
  stepSmaller: 'Más pequeño',
  stepWhy: '¿Por qué este?',
  stepWhyClose: 'Cerrar',
  stepBack: 'paso anterior',
  stepDuration: 'unos {n} {unit}',
  stepStarted: 'has empezado',
  auditHeading: 'Por qué este paso',
  auditFrom: 'Esto viene de',
  auditAuthority: 'El verificador, no el modelo, decide cuándo un paso es lo bastante pequeño.',
  auditSourceRules: 'Construido por el motor de reglas.',
  auditSourceModel: 'Propuesto por el modelo y aceptado por el verificador.',
  auditSourceRegated: 'El modelo propuso algo que el verificador rechazó, así que se usó el motor de reglas.',
  auditCriticHeading: 'Crítico',
  auditCoachHeading: 'Guía',
  finishTitle: 'Eso es todo, terminado.',
  finishCta: 'Empezar otra cosa',
  finishSend: 'Enviar esto a alguien',
  finishSendCopied: 'Copiado',
  finishStartedOnce: 'Empezaste una vez.',
  finishStartedMany: 'Empezaste {n} veces.',
  finishMedian: 'Empezaste cada paso en unos {n} segundos.',
  errorEmpty: 'Pega la tarea primero y encontraré un punto de partida.',
  toggleSpacing: 'Espacio extra',
  toggleFont: 'Monoespaciada',
  shortcuts: 'Teclado: D hecho, S más pequeño, W por qué',
  voiceStart: 'Di tu tarea en voz alta',
  voiceStop: 'Parar',
  voiceListening: 'Escuchando',
  voiceUnavailable: 'La entrada por voz no está disponible en este navegador.',
  installTitle: 'Instalar Onramp en este dispositivo',
  installCta: 'Instalar',
  installDismiss: 'Ahora no',
  qrHeading: 'O escanea para abrir',
  qrAlt: 'Código QR que enlaza con esta sesión',
} as const;

const COPY_FR: Partial<Record<keyof typeof COPY, string>> = {
  appTitle: 'Onramp',
  tagline: 'La première étape, et rien que la première.',
  startLabel: 'Que dois-tu faire ?',
  startPlaceholder: "Colle-le exactement comme ton professeur l'a écrit.",
  startCta: 'Trouver ma première étape',
  startExamplesLabel: 'Ou essaie un de ces exemples',
  stepDone: 'Fait',
  stepDoneNext: 'Fait, étape suivante',
  stepSmaller: 'Plus petit',
  stepWhy: 'Pourquoi celle-ci ?',
  stepWhyClose: 'Fermer',
  stepBack: 'étape précédente',
  stepDuration: 'environ {n} {unit}',
  stepStarted: 'tu as commencé',
  auditHeading: 'Pourquoi cette étape',
  auditFrom: 'Ceci vient de',
  auditAuthority: "Le vérificateur, pas le modèle, décide quand une étape est assez petite.",
  auditSourceRules: 'Construit par le moteur de règles.',
  auditSourceModel: 'Proposé par le modèle et accepté par le vérificateur.',
  auditSourceRegated: 'Le modèle a proposé quelque chose que le vérificateur a refusé, donc le moteur de règles a été utilisé à la place.',
  auditCriticHeading: 'Critique',
  auditCoachHeading: 'Guide',
  finishTitle: "Voilà, c'est terminé.",
  finishCta: 'Commencer autre chose',
  finishSend: "Envoyer ceci à quelqu'un",
  finishSendCopied: 'Copié',
  finishStartedOnce: 'Tu as commencé une fois.',
  finishStartedMany: 'Tu as commencé {n} fois.',
  finishMedian: 'Tu as commencé chaque étape en environ {n} secondes.',
  errorEmpty: "Colle la tâche d'abord et je trouverai un point de départ.",
  toggleSpacing: 'Espacement large',
  toggleFont: 'Chasse fixe',
  shortcuts: 'Clavier : D fait, S plus petit, W pourquoi',
  voiceStart: 'Dis ta consigne à voix haute',
  voiceStop: 'Arrêter',
  voiceListening: "À l'écoute",
  voiceUnavailable: "L'entrée vocale n'est pas disponible dans ce navigateur.",
  installTitle: 'Installer Onramp sur cet appareil',
  installCta: 'Installer',
  installDismiss: 'Pas maintenant',
  qrHeading: 'Ou scanne pour ouvrir',
  qrAlt: 'Code QR menant à cette session',
} as const;

export const COPIES: Record<Locale, Record<keyof typeof COPY, string>> = {
  en: COPY,
  es: { ...COPY, ...COPY_ES },
  fr: { ...COPY, ...COPY_FR },
};

const EXAMPLES_ES: readonly string[] = [
  'Ensayo de 5 páginas sobre las causas de la Primera Guerra Mundial, para el viernes',
  'Lee el capítulo 7 y toma notas',
  'Estudia para el examen de biología del lunes',
] as const;

const EXAMPLES_FR: readonly string[] = [
  'Dissertation de 5 pages sur les causes de la Première Guerre mondiale, à rendre vendredi',
  'Lis le chapitre 7 et prends des notes',
  'Révise pour le contrôle de biologie de lundi',
] as const;

export const EXAMPLES_BY_LOCALE: Record<Locale, readonly string[]> = {
  en: EXAMPLES,
  es: EXAMPLES_ES,
  fr: EXAMPLES_FR,
};

/**
 * Return the copy dictionary for a given locale. Unknown locales fall back
 * to English so a missing translation never crashes the UI.
 */
export const getCopy = (locale: Locale = 'en'): Record<keyof typeof COPY, string> =>
  COPIES[locale] ?? COPIES.en;

/** Return the example prompts for a given locale, with English fallback. */
export const getExamples = (locale: Locale = 'en'): readonly string[] =>
  EXAMPLES_BY_LOCALE[locale] ?? EXAMPLES_BY_LOCALE.en;

/**
 * Detect a supported locale from the browser. We only match on the primary
 * subtag ("es-MX" -> "es"). Anything unrecognized returns 'en'. This runs
 * once at boot; the user can override via the language selector.
 */
export const detectLocale = (): Locale => {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.language : '';
    const prefix = (nav || '').toLowerCase().slice(0, 2);
    if (prefix === 'es') return 'es';
    if (prefix === 'fr') return 'fr';
    return 'en';
  } catch {
    return 'en';
  }
};
