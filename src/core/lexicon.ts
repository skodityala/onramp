/** Verbs a body can perform. A step starting with one of these is startable.
 *  Note: nouns-that-can-be-verbs (title, name, label, date, number, list) are
 *  intentionally omitted because in this domain they are almost always nouns,
 *  and treating them as verbs makes MULTI_VERB fire on phrases like
 *  "type the title" and "circle question 3". */
export const PHYSICAL_VERBS = [
  'open', 'close', 'type', 'click', 'press', 'tap', 'put', 'place',
  'pick', 'stand', 'sit', 'walk', 'say', 'read', 'copy', 'paste', 'draw',
  'circle', 'underline', 'highlight', 'delete', 'save', 'print', 'scroll',
  'drag', 'turn', 'set', 'plug', 'unlock', 'take', 'get', 'move', 'fold',
  'cut', 'stick', 'tick', 'cross',
  'fill', 'send',
] as const;

/** Verbs that name a CATEGORY of work rather than an action. Always fail. */
export const ABSTRACT_VERBS = [
  'research', 'understand', 'learn', 'study', 'think', 'consider', 'review',
  'analyse', 'analyze', 'explore', 'familiarise', 'familiarize', 'brainstorm',
  'plan', 'prepare', 'organise', 'organize', 'revise', 'memorise', 'memorize',
  'work', 'start', 'begin', 'tackle', 'handle', 'deal', 'look', 'figure',
  'develop', 'create', 'design', 'build', 'complete', 'finish',
  'improve', 'master', 'cover', 'go',
  'summarise', 'summarize',
  // 'write' is abstract when a lead verb, per §31 worked example. Its physical
  // uses ("Write one sentence") produce ABSTRACT here but the decomposer picks
  // it up via PHYSICALISE, so leaves still land somewhere small.
  'write',
  // 'do' stays abstract (as in "do the essay"). Kept.
  'do',
  // 'practise'/'practice' also abstract as verbs. Their common noun uses
  // ("practice questions") are harmless because they no longer count toward
  // MULTI_VERB without a conjunction.
  'practise', 'practice',
] as const;

export const ACTION_VERBS = [...PHYSICAL_VERBS, ...ABSTRACT_VERBS] as const;

/** Anything that leaves a choice with the user. */
export const DECISION_MARKERS = [
  'choose', 'decide', 'pick', 'select', 'figure out', 'work out', 'determine',
  'your favourite', 'your favorite', 'whichever', 'whatever', 'what you think',
  'best', 'most interesting', 'appropriate', 'suitable', 'relevant',
  'you prefer', 'any of', 'either', 'or ',
] as const;

/** Quantities with no fixed stopping point. */
export const VAGUE_QUANTITIES = [
  'some', 'a few', 'several', 'a bit', 'a couple', 'enough', 'as much',
  'as many', 'various', 'multiple', 'a number of', 'lots of', 'plenty',
] as const;

/** Branches. A branch is a decision wearing a different hat. */
export const CONDITIONALS = [
  'if ', 'unless', 'depending', 'as needed', 'where necessary', 'should you',
  'in case', 'when possible', 'optionally', 'maybe', 'perhaps', 'try to',
] as const;

/** Signals that a step has a defined end. */
export const STOP_MARKERS = [
  'until', 'then stop', 'and stop', 'nothing else', 'only', 'just the',
  'one', 'first', 'title', 'sentence', 'line', 'paragraph', 'word', 'page',
  'question', 'problem', 'item', 'row', 'field', 'name', 'date',
] as const;

/** Verbs that are inherently bounded: doing them once completes them. */
export const BOUNDED_VERBS = [
  'open', 'close', 'click', 'press', 'tap', 'put', 'place', 'stand', 'sit',
  'save', 'print', 'unlock', 'plug', 'pick', 'take', 'delete', 'tick',
] as const;

/** Abstract verb to physical opener. Used by decompose step 5. */
export const PHYSICALISE: Record<string, string> = {
  research: 'Open a search tab and type the topic. Nothing else.',
  study: 'Open your notes to the first heading.',
  revise: 'Open your notes to the first heading.',
  memorise: 'Read the first line out loud once.',
  memorize: 'Read the first line out loud once.',
  review: 'Read the first paragraph out loud.',
  read: 'Read the first paragraph out loud.',
  plan: 'Write one line saying what this is about.',
  prepare: 'Open the file you need. Nothing else.',
  organise: 'Pick up one item and put it where it lives.',
  organize: 'Pick up one item and put it where it lives.',
  brainstorm: 'Write down one word that comes to mind.',
  understand: 'Read the first sentence out loud.',
  learn: 'Read the first sentence out loud.',
  analyse: 'Copy the first line onto paper.',
  analyze: 'Copy the first line onto paper.',
  write: 'Open a new doc and type the title. Nothing else.',
  create: 'Open a new file and name it.',
  build: 'Open a new folder and name it.',
  design: 'Draw one box on paper.',
  practise: 'Do the first item only.',
  practice: 'Do the first item only.',
  complete: 'Do the first item only.',
  finish: 'Do the first item only.',
  start: 'Open the file you need. Nothing else.',
  begin: 'Open the file you need. Nothing else.',
  work: 'Open the file you need. Nothing else.',
  do: 'Do the first item only.',
  tackle: 'Do the first item only.',
  handle: 'Do the first item only.',
  go: 'Open the file you need. Nothing else.',
  look: 'Open the page. Nothing else.',
  figure: 'Copy the first line onto paper.',
  explore: 'Open the page. Nothing else.',
  develop: 'Open a new file and name it.',
  improve: 'Read the first paragraph out loud.',
  cover: 'Read the first paragraph out loud.',
  consider: 'Write down one word that comes to mind.',
  think: 'Write down one word that comes to mind.',
  master: 'Do the first item only.',
  familiarise: 'Read the first paragraph out loud.',
  familiarize: 'Read the first paragraph out loud.',
  deal: 'Do the first item only.',
  summarise: 'Copy the first line onto paper.',
  summarize: 'Copy the first line onto paper.',
};

/** The floor. Guaranteed atomic. Nobody ever hits a dead end. */
export const FLOOR_STEP = 'Put your hand on the mouse.';
export const FLOOR_SECONDS = 10;
