export interface Template {
  readonly keys: readonly string[];
  readonly steps: readonly { text: string; seconds: number }[];
}

export const TEMPLATES: readonly Template[] = [
  {
    keys: ['essay', 'paper', 'write-up', 'composition', 'article'],
    steps: [
      { text: 'Open a new doc and type the title. Nothing else.', seconds: 40 },
      { text: 'Type one sentence saying what your answer is.', seconds: 90 },
      { text: 'Write down three things you already know about it.', seconds: 110 },
      { text: 'Type one heading for your first point.', seconds: 45 },
    ],
  },
  {
    keys: ['flashcard', 'vocab', 'vocabulary', 'spelling'],
    steps: [
      { text: 'Open a blank page.', seconds: 15 },
      { text: 'Write down the first word only.', seconds: 30 },
      { text: 'Write what it means next to it.', seconds: 50 },
    ],
  },
  {
    keys: ['citation', 'bibliography', 'references', 'works cited'],
    steps: [
      { text: 'Open a new doc and type the heading References.', seconds: 30 },
      { text: 'Copy the title of the first source onto the page.', seconds: 45 },
      { text: 'Add the author name after it.', seconds: 40 },
    ],
  },
  {
    keys: ['presentation notes', 'speech', 'talk', 'speaking'],
    steps: [
      { text: 'Open a blank page and write the first sentence you will say.', seconds: 70 },
      { text: 'Say that sentence out loud once.', seconds: 25 },
      { text: 'Write the second sentence.', seconds: 70 },
    ],
  },
  {
    keys: ['poster', 'display', 'infographic'],
    steps: [
      { text: 'Get one sheet of paper and put it in front of you.', seconds: 20 },
      { text: 'Write the title across the top.', seconds: 45 },
      { text: 'Draw one box where a picture will go.', seconds: 35 },
    ],
  },
  {
    keys: ['diary', 'journal', 'log', 'reflection'],
    steps: [
      { text: 'Open your journal to the next blank page.', seconds: 20 },
      { text: "Write today's date.", seconds: 15 },
      { text: 'Write one sentence about one thing that happened.', seconds: 70 },
    ],
  },
  {
    keys: ['group', 'team', 'partner', 'collaborate'],
    steps: [
      { text: 'Open the group chat.', seconds: 15 },
      { text: 'Send one message saying which part you will do.', seconds: 60 },
      { text: 'Open a new doc and type your part as a heading.', seconds: 40 },
    ],
  },
  {
    keys: ['revise essay', 'edit', 'proofread', 'redraft'],
    steps: [
      { text: 'Open the document.', seconds: 15 },
      { text: 'Read the first paragraph out loud.', seconds: 75 },
      { text: 'Change one word you did not like.', seconds: 40 },
    ],
  },
  {
    keys: ['read', 'chapter', 'textbook', 'novel', 'pages'],
    steps: [
      { text: 'Open the book to the first page you need.', seconds: 20 },
      { text: 'Read the first paragraph out loud.', seconds: 75 },
      { text: 'Write one sentence about what it said.', seconds: 90 },
    ],
  },
  {
    keys: ['math', 'maths', 'problem set', 'worksheet', 'equations', 'algebra'],
    steps: [
      { text: 'Open to problem 1.', seconds: 15 },
      { text: 'Copy problem 1 onto paper. Do not solve it yet.', seconds: 60 },
      { text: 'Do only the first line of working.', seconds: 100 },
    ],
  },
  {
    keys: ['study', 'test', 'exam', 'quiz', 'revise', 'revision'],
    steps: [
      { text: 'Open your notes to the first heading.', seconds: 20 },
      { text: 'Read the first heading out loud.', seconds: 25 },
      { text: 'Cover it and say one thing you remember.', seconds: 60 },
    ],
  },
  {
    keys: ['presentation', 'slides', 'deck', 'powerpoint', 'keynote'],
    steps: [
      { text: 'Open a new slide deck.', seconds: 25 },
      { text: 'Type the title on slide 1. Nothing else.', seconds: 45 },
      { text: 'Add one empty slide and type its heading.', seconds: 60 },
    ],
  },
  {
    keys: ['lab', 'experiment', 'report', 'practical'],
    steps: [
      { text: 'Open the lab template.', seconds: 20 },
      { text: 'Fill in only your name and the date.', seconds: 40 },
      { text: 'Type one sentence saying what the experiment tested.', seconds: 90 },
    ],
  },
  {
    keys: ['chemistry', 'physics', 'biology', 'science'],
    steps: [
      { text: 'Open to the first question.', seconds: 15 },
      { text: 'Copy the question onto paper.', seconds: 55 },
      { text: 'Write down what you already know that is relevant. One line.', seconds: 80 },
    ],
  },
  {
    keys: ['history', 'geography', 'social studies'],
    steps: [
      { text: 'Open a new doc and type the topic as a heading.', seconds: 35 },
      { text: 'Write one date you remember about it.', seconds: 45 },
      { text: 'Write one sentence about why it mattered.', seconds: 80 },
    ],
  },
  {
    keys: ['language', 'french', 'spanish', 'german', 'translate'],
    steps: [
      { text: 'Open the exercise to the first item.', seconds: 20 },
      { text: 'Copy the first sentence onto paper.', seconds: 50 },
      { text: 'Write the first word of your translation.', seconds: 45 },
    ],
  },
  {
    keys: ['art', 'drawing', 'sketch', 'paint'],
    steps: [
      { text: 'Get your paper and pencil and put them in front of you.', seconds: 30 },
      { text: 'Draw one line. Any line.', seconds: 20 },
      { text: 'Draw the outline of one shape.', seconds: 70 },
    ],
  },
  {
    keys: ['music', 'practise instrument', 'practice instrument', 'scales'],
    steps: [
      { text: 'Take the instrument out of its case.', seconds: 45 },
      { text: 'Play one note.', seconds: 15 },
      { text: 'Play the first line only.', seconds: 90 },
    ],
  },
  {
    keys: ['exercise', 'workout', 'run', 'training'],
    steps: [
      { text: 'Put your shoes on.', seconds: 60 },
      { text: 'Stand up and walk to the door.', seconds: 30 },
      { text: 'Step outside.', seconds: 15 },
    ],
  },
  {
    keys: ['budget', 'finance', 'expenses', 'money'],
    steps: [
      { text: 'Open a new spreadsheet.', seconds: 25 },
      { text: 'Type one heading: Amount.', seconds: 25 },
      { text: 'Enter the first number you already know.', seconds: 45 },
    ],
  },
  {
    keys: ['cv', 'resume', 'cover letter', 'job'],
    steps: [
      { text: 'Open a new doc and type your name at the top.', seconds: 30 },
      { text: 'Type the job title you are applying for underneath.', seconds: 35 },
      { text: 'Write one sentence about why you want it.', seconds: 90 },
    ],
  },
  {
    keys: ['dissertation', 'thesis', 'coursework'],
    steps: [
      { text: 'Open the document to the section you are on.', seconds: 25 },
      { text: 'Read the last sentence you wrote out loud.', seconds: 45 },
      { text: 'Write one more sentence after it.', seconds: 100 },
    ],
  },
  {
    keys: ['appointment', 'call', 'phone', 'book'],
    steps: [
      { text: 'Find the number and write it on paper.', seconds: 50 },
      { text: 'Write down the one sentence you need to say.', seconds: 60 },
      { text: 'Pick up the phone.', seconds: 10 },
    ],
  },
  {
    keys: ['pack', 'prepare bag', 'get ready'],
    steps: [
      { text: 'Put the bag on the floor, open.', seconds: 25 },
      { text: 'Put one item you definitely need into it.', seconds: 30 },
      { text: 'Put one more item in.', seconds: 30 },
    ],
  },
  {
    keys: ['project', 'build', 'make', 'construct', 'app', 'website'],
    steps: [
      { text: 'Make a new folder and name it.', seconds: 30 },
      { text: 'Create one empty file inside it.', seconds: 25 },
      { text: 'Type one line saying what this is meant to do.', seconds: 70 },
    ],
  },
  {
    keys: ['email', 'message', 'letter', 'reply', 'contact'],
    steps: [
      { text: 'Open a blank message.', seconds: 15 },
      { text: 'Type the recipient only. Nothing else.', seconds: 25 },
      { text: 'Type one sentence saying why you are writing.', seconds: 70 },
    ],
  },
  {
    keys: ['clean', 'tidy', 'organise', 'organize', 'declutter', 'room'],
    steps: [
      { text: 'Pick up one object.', seconds: 10 },
      { text: 'Put that one object where it lives.', seconds: 25 },
      { text: 'Pick up one more object and put it away.', seconds: 30 },
    ],
  },
  {
    keys: ['apply', 'application', 'form', 'signup', 'register'],
    steps: [
      { text: 'Open the form.', seconds: 20 },
      { text: 'Fill in the first field only.', seconds: 35 },
      { text: 'Fill in the second field only.', seconds: 35 },
    ],
  },
  {
    keys: ['notes', 'summarise', 'summarize', 'summary'],
    steps: [
      { text: 'Open a new doc and type the topic as a heading.', seconds: 35 },
      { text: 'Read the first paragraph out loud.', seconds: 75 },
      { text: 'Type one bullet about what it said.', seconds: 70 },
    ],
  },
  {
    keys: ['code', 'program', 'assignment', 'homework', 'exercise'],
    steps: [
      { text: 'Open the file you need.', seconds: 20 },
      { text: 'Read the first instruction out loud.', seconds: 40 },
      { text: 'Type one line of code. Any line.', seconds: 80 },
    ],
  },
];

export function matchTemplate(assignment: string): Template | null {
  const s = assignment.toLowerCase();
  for (const t of TEMPLATES) {
    if (t.keys.some((k) => s.includes(k))) return t;
  }
  return null;
}
