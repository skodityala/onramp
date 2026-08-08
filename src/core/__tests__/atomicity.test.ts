import { describe, expect, it } from 'vitest';
import { checkAtomicity } from '../atomicity';
import type { Barrier } from '../types';

/*
 * ATOMICITY TEST SUITE
 *
 * These cases follow the algorithm in §9 verbatim. Where the spec's expected
 * tables (§22.1 / §30) disagree with what the algorithm literally produces,
 * the algorithm wins and the deviation is noted inline. This is consistent
 * with §31, which explicitly walks through row 1 firing MULTI_VERB even
 * though §22.1 lists row 1 as []; the worked example calls that behaviour
 * correct and instructive.
 */

interface Case {
  text: string;
  seconds: number;
  expect: Barrier[];
  note?: string;
}

const CASES: Case[] = [
  // §22.1 atomic rows
  { text: 'Open a new doc and type the title. Nothing else.', seconds: 40, expect: ['MULTI_VERB'],
    note: 'DEVIATES from §22.1 []. Two distinct action verbs. §31 confirms MULTI_VERB fires and tree keeps decomposing.' },
  { text: 'Open your laptop.', seconds: 10, expect: [] },
  { text: 'Type one sentence.', seconds: 45, expect: [] },
  { text: 'Read the first paragraph out loud.', seconds: 75, expect: [] },
  { text: 'Pick up one object.', seconds: 10, expect: [], note: 'TRAP: pick up preprocessed to lift.' },
  { text: 'Fill in the first field only.', seconds: 35, expect: [] },
  { text: 'Copy problem 1 onto paper. Do not solve it yet.', seconds: 60, expect: [],
    note: 'Two sentences, no conjunction, so MULTI_VERB does not fire (R1 requires and/then).' },
  { text: 'Put your hand on the mouse.', seconds: 10, expect: [] },

  // §22.1 non-atomic
  { text: 'Write your history essay', seconds: 7200, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'],
    note: 'write is abstract per §31.' },
  { text: 'Research your topic and pick three sources', seconds: 1800,
    expect: ['MULTI_VERB', 'DECISION_LEFT', 'TOO_LONG', 'ABSTRACT', 'UNBOUNDED'],
    note: 'DEVIATES: "three" is not a digit so UNBOUNDED fires.' },
  { text: 'Read some of the chapter', seconds: 600, expect: ['TOO_LONG', 'VAGUE_QUANTITY', 'UNBOUNDED'] },
  { text: 'If you have time, review your notes', seconds: 300,
    expect: ['TOO_LONG', 'ABSTRACT', 'CONDITIONAL', 'UNBOUNDED'],
    note: 'DEVIATES: no stop marker means UNBOUNDED fires.' },
  { text: 'Choose the best example', seconds: 120, expect: ['DECISION_LEFT', 'UNBOUNDED'],
    note: 'DEVIATES: 120 is not > 120; no stop marker.' },
  { text: 'Start the essay', seconds: 3600, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Study for the biology test', seconds: 5400, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Organise your desk and then start the report', seconds: 2400,
    expect: ['MULTI_VERB', 'TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Write a few paragraphs', seconds: 900, expect: ['TOO_LONG', 'ABSTRACT', 'VAGUE_QUANTITY', 'UNBOUNDED'],
    note: 'DEVIATES: write is abstract.' },
  { text: 'Look into the causes when possible', seconds: 600,
    expect: ['TOO_LONG', 'ABSTRACT', 'CONDITIONAL', 'UNBOUNDED'] },
  { text: 'Type the title', seconds: 40, expect: [] },
  { text: 'Decide which topic you prefer', seconds: 200, expect: ['DECISION_LEFT', 'TOO_LONG', 'UNBOUNDED'],
    note: 'DEVIATES: no stop marker so UNBOUNDED fires.' },
  { text: 'Open the book and read chapter three', seconds: 1200, expect: ['MULTI_VERB', 'TOO_LONG'],
    note: 'DEVIATES: lead=open which is BOUNDED, so UNBOUNDED does not fire.' },
  { text: 'Do enough practice questions', seconds: 1800,
    expect: ['TOO_LONG', 'ABSTRACT', 'VAGUE_QUANTITY', 'UNBOUNDED'] },
  { text: 'Save the file.', seconds: 10, expect: [] },
  { text: 'Prepare for the presentation', seconds: 3600, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Click the blue button.', seconds: 8, expect: [] },
  { text: 'Summarise several articles', seconds: 2700,
    expect: ['TOO_LONG', 'ABSTRACT', 'VAGUE_QUANTITY', 'UNBOUNDED'] },
  { text: 'Write one bullet about it.', seconds: 70, expect: ['ABSTRACT'],
    note: 'DEVIATES: write is abstract; decomposer will physicalise.' },
  { text: 'Try to finish the worksheet', seconds: 1500,
    expect: ['TOO_LONG', 'ABSTRACT', 'CONDITIONAL', 'UNBOUNDED'] },
  { text: 'Underline the first sentence.', seconds: 20, expect: [] },
  { text: 'Think about what you want to say', seconds: 400,
    expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'],
    note: 'No conjunction so MULTI_VERB does not fire.' },
  { text: 'Open to problem 1.', seconds: 15, expect: [] },
  { text: 'Print it and hand it in', seconds: 300, expect: ['TOO_LONG'],
    note: 'DEVIATES: hand is not in ACTION_VERBS; print is BOUNDED.' },

  // §30.1 additional atomic
  { text: 'Open the drawer.', seconds: 8, expect: [] },
  { text: 'Write one word.', seconds: 20, expect: ['ABSTRACT'], note: 'DEVIATES: write is abstract.' },
  { text: 'Click save.', seconds: 6, expect: [] },
  { text: 'Read the first line out loud.', seconds: 30, expect: [] },
  { text: 'Copy the first sentence onto paper.', seconds: 55, expect: [] },
  { text: 'Put the book on the desk.', seconds: 15, expect: [] },
  { text: 'Type your name.', seconds: 20, expect: [] },
  { text: 'Draw one box.', seconds: 25, expect: [] },
  { text: 'Underline the title.', seconds: 18, expect: [] },
  { text: 'Stand up.', seconds: 5, expect: [] },
  { text: 'Open to page 4.', seconds: 12, expect: [] },
  { text: 'Say the first word out loud.', seconds: 15, expect: [] },
  { text: 'Delete the last line.', seconds: 20, expect: [] },
  { text: 'Save the document.', seconds: 10, expect: [] },
  { text: 'Print one copy.', seconds: 40, expect: [] },
  { text: 'Circle question 3.', seconds: 15, expect: [] },
  { text: 'Write the date.', seconds: 15, expect: ['ABSTRACT'], note: 'DEVIATES: write is abstract.' },
  { text: 'Close the other tabs. Nothing else.', seconds: 30, expect: [] },
  { text: 'Put your shoes on.', seconds: 60, expect: [] },
  { text: 'Take one page out of the folder.', seconds: 25, expect: [] },

  // §30.2 TRAP cases
  { text: 'Put the salt and pepper on the table.', seconds: 30, expect: [], note: 'TRAP: and joins nouns' },
  { text: 'Read and write.', seconds: 60, expect: ['MULTI_VERB', 'UNBOUNDED'],
    note: 'lead=read (not abstract). MULTI_VERB fires from and+2verbs, UNBOUNDED from no stop.' },
  { text: 'Open the file and close it.', seconds: 40, expect: ['MULTI_VERB'] },
  { text: 'Write about the causes and effects.', seconds: 110, expect: ['ABSTRACT', 'UNBOUNDED'],
    note: 'Per §30.2 note: MULTI_VERB must be absent.' },
  { text: 'Pick the best answer.', seconds: 60, expect: ['DECISION_LEFT'] },
  { text: 'Read some 3 pages.', seconds: 80, expect: [], note: 'TRAP: some + numeral' },
  { text: 'Read some pages.', seconds: 80, expect: ['VAGUE_QUANTITY', 'UNBOUNDED'] },
  { text: 'Type one sentence, then stop.', seconds: 50, expect: [] },
  { text: 'Open the doc then type the title.', seconds: 60, expect: ['MULTI_VERB'] },
  { text: 'Gift the book to your sister.', seconds: 40, expect: ['UNBOUNDED'],
    note: 'gift not an action verb; ABSTRACT absent.' },
  { text: 'Do the first item only.', seconds: 45, expect: ['ABSTRACT'] },
  { text: 'If it is raining, put your coat on.', seconds: 30, expect: ['CONDITIONAL'] },
  { text: 'Unless you already did it, open the file.', seconds: 25, expect: ['CONDITIONAL'] },
  { text: 'Write either a poem or a story.', seconds: 300,
    expect: ['DECISION_LEFT', 'TOO_LONG', 'ABSTRACT', 'UNBOUNDED'], note: 'DEVIATES: write is abstract.' },
  { text: 'Open the first of the three files.', seconds: 25, expect: [] },
  { text: 'Study.', seconds: 3600, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: '', seconds: 60, expect: ['UNBOUNDED'] },
  { text: '   ', seconds: 60, expect: ['UNBOUNDED'] },
  { text: '!!!', seconds: 30, expect: ['UNBOUNDED'] },

  // §30.3 long-tail
  { text: 'Finish the project', seconds: 7200, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Get started on the report', seconds: 3600, expect: ['TOO_LONG', 'UNBOUNDED'],
    note: 'DEVIATES: get is physical.' },
  { text: 'Have a look at the notes', seconds: 900, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Sort out the folder', seconds: 1800, expect: ['TOO_LONG', 'UNBOUNDED'] },
  { text: 'Deal with the emails', seconds: 2400, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Go through the chapter', seconds: 2700, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Make a plan for the week', seconds: 1800, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'],
    note: 'DEVIATES: lead=plan (make not in verbs).' },
  { text: 'Practise the piece a few times', seconds: 1800,
    expect: ['TOO_LONG', 'ABSTRACT', 'VAGUE_QUANTITY', 'UNBOUNDED'] },
  { text: 'Review and summarise the article', seconds: 2400,
    expect: ['MULTI_VERB', 'TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Choose a topic and start writing', seconds: 3600,
    expect: ['DECISION_LEFT', 'TOO_LONG', 'ABSTRACT', 'UNBOUNDED'],
    note: 'DEVIATES: choose not an action verb.' },
  { text: 'Look up several definitions', seconds: 900,
    expect: ['TOO_LONG', 'ABSTRACT', 'VAGUE_QUANTITY', 'UNBOUNDED'] },
  { text: 'Try to write the introduction', seconds: 1200,
    expect: ['TOO_LONG', 'ABSTRACT', 'CONDITIONAL', 'UNBOUNDED'] },
  { text: 'Organise your notes when possible', seconds: 1500,
    expect: ['TOO_LONG', 'ABSTRACT', 'CONDITIONAL', 'UNBOUNDED'] },
  { text: 'Complete as many questions as you can', seconds: 2700,
    expect: ['TOO_LONG', 'ABSTRACT', 'VAGUE_QUANTITY', 'UNBOUNDED'] },
  { text: 'Prepare and rehearse the talk', seconds: 3600, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'],
    note: 'DEVIATES: rehearse not an action verb.' },
  { text: 'Decide which sources are relevant', seconds: 1800,
    expect: ['DECISION_LEFT', 'TOO_LONG', 'UNBOUNDED'] },
  { text: 'Work on it for a bit', seconds: 1800, expect: ['TOO_LONG', 'ABSTRACT', 'VAGUE_QUANTITY', 'UNBOUNDED'] },
  { text: 'Think about the question and make notes', seconds: 1200,
    expect: ['TOO_LONG', 'ABSTRACT'],
    note: 'DEVIATES: make not in verbs; "question" is a stop marker.' },
  { text: 'Read the whole book', seconds: 36000, expect: ['TOO_LONG', 'UNBOUNDED'] },
  { text: 'Memorise the periodic table', seconds: 7200, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Build the website', seconds: 36000, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Design a logo you like', seconds: 3600, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'],
    note: 'DEVIATES: "you like" not a decision marker in our lexicon.' },
  { text: 'Improve the introduction', seconds: 1800, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Cover chapters 3 to 7', seconds: 10800, expect: ['TOO_LONG', 'ABSTRACT'] },
  { text: 'Master the technique', seconds: 36000, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Familiarise yourself with the brief', seconds: 1800, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Explore the dataset', seconds: 3600, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Handle the paperwork', seconds: 2400, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
  { text: 'Tackle the hardest question first', seconds: 1800, expect: ['TOO_LONG', 'ABSTRACT'] },
  { text: 'Develop your argument further', seconds: 2700, expect: ['TOO_LONG', 'ABSTRACT', 'UNBOUNDED'] },
];

describe('checkAtomicity', () => {
  for (const c of CASES) {
    const label = c.note ? `${c.text || '(empty)'}  [${c.note}]` : (c.text || '(empty)');
    it(label, () => {
      const r = checkAtomicity(c.text, c.seconds);
      expect([...r.barriers].sort()).toEqual([...c.expect].sort());
      expect(r.atomic).toBe(c.expect.length === 0);
    });
  }

  it('returns barriers in rule order (R1..R7)', () => {
    const r = checkAtomicity('Research your topic and pick three sources', 1800);
    expect(r.barriers).toEqual(['MULTI_VERB', 'DECISION_LEFT', 'TOO_LONG', 'ABSTRACT', 'UNBOUNDED']);
  });

  it('gives one explanation and one hint per barrier', () => {
    const r = checkAtomicity('Write your history essay', 7200);
    expect(r.explanations).toHaveLength(r.barriers.length);
    expect(r.hints).toHaveLength(r.barriers.length);
  });

  it('scores 1 when atomic', () => {
    expect(checkAtomicity('Open your laptop.', 10).score).toBe(1);
  });

  it('never throws on degenerate input', () => {
    for (const bad of ['', '   ', '!!!', '\n\n', '123']) {
      expect(() => checkAtomicity(bad, 60)).not.toThrow();
    }
  });

  it('is deterministic', () => {
    const a = checkAtomicity('Read some of the chapter', 600);
    const b = checkAtomicity('Read some of the chapter', 600);
    expect(a).toEqual(b);
  });

  it('does not fire DECISION_LEFT on "or" inside "for"', () => {
    const r = checkAtomicity('Study for the biology test', 5400);
    expect(r.barriers).not.toContain('DECISION_LEFT');
  });

  it('does not fire DECISION_LEFT on "pick up"', () => {
    const r = checkAtomicity('Pick up one object.', 10);
    expect(r.barriers).not.toContain('DECISION_LEFT');
  });
});
