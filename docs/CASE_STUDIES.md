# Case studies

Composite walk-throughs. **None of these are real people.** They illustrate the shape of assignments Onramp is designed for.

## 1. The essay (composite: 15-year-old, ADHD-inattentive)

She has understood the assignment for a week. Two and a half hours in front of the open laptop today. Nothing typed. She pastes into Onramp.

```
Input:  Write a 5 page essay on the causes of WWI, due Friday
Output: Open a new doc.
        about 20 seconds
```

She opens a new doc. She looks back at the tool. The line reads "you started."

Press Done.

```
Type one sentence saying what your answer is.
about 90 seconds
```

She has strong opinions about WWI and this is a question she can answer. She types one sentence. She presses Done. The next step: "Write down three things you already know about it." She writes them.

Session length from open to real draft: 4 minutes. She has broken the wall without a plan being visible to her at any point.

## 2. The maths worksheet (composite: 13-year-old, dyscalculia + inattentive ADHD)

Assignment: "Finish the maths worksheet, questions 1-20." The math template matches.

```
Open to problem 1.                                  about 15 seconds
Copy problem 1 onto paper. Do not solve it yet.     about 60 seconds
Do only the first line of working.                  about 100 seconds
```

The second step matters. Copying is a physical action, not the anxious cognitive one. It converts an impossible request ("solve this problem") into a possible one ("move your hand and copy a line"). Once he has copied it, question 1 is 90% closer to being solved.

He does not have to think about problem 2 until he presses Done.

## 3. The cleaning task (composite: adult on the autism spectrum)

Assignment: "Clean and tidy your room before Sunday." Clean template matches.

```
Pick up one object.                       about 10 seconds
Put that one object where it lives.       about 25 seconds
Pick up one more object and put it away.  about 30 seconds
```

Not "clean the room." Not "start with the desk." Not "make a plan." Not "sort things into piles." Pick up one object. He does. Then one more. A pattern he can repeat until either the room is clean or he stops.

The design decision that matters here: "clean the room" would fail the checker (ABSTRACT, UNBOUNDED). The tool never asks him to do a category. Every instruction is a physical action.

## 4. The support worker

A support worker at a college accessibility center. A student walks in with a paper syllabus. "I have no idea where to start on this project."

The support worker types the project description into Onramp on their phone. Presses "Find my first step." Reads the first step to the student. The student does it in the office. They talk about it for two minutes. The support worker sends the student a share link so they can pick up where they left off later.

No login. No account. No syncing. The student does not owe the support worker any data. The student's assignment text never leaves either device.

## 5. The parent

A parent whose teenage child has ADHD. The child cannot begin the history essay. The parent, on their phone in the kitchen, pastes the essay into Onramp. Taps the share button. Texts the link to the child upstairs.

The child opens it. The next thing they see is "Open a new doc." They do.

The parent did not have to nag, cajole, explain executive dysfunction, or perform emotional labor. The tool did the small handoff.

## 6. The self-user

An adult with executive-function difficulties working on their own tax return.

Assignment: "Do the tax return before the 31st." No template match (the closest, "apply/application/form," fires on "return" but not this phrasing). Falls back to generic rules.

```
Do the tax return before the 31st. Nothing else.   [not atomic; TOO_LONG, ABSTRACT, CONDITIONAL]
                                                     ↓ decomposition
Open the tax return website.                        about 25 seconds
```

He can open a website. He does. The next step: "Type your username." One field. He does.

Onramp is not a tax tool. It is a tool that turns "do the tax return" into "open the website" for someone whose brain is stuck on the former.

## 7. The essay revision (composite: 17-year-old, dyslexic)

Assignment: "Edit and proofread your history essay." Revise-essay template matches.

```
Open the document.                            about 15 seconds
Read the first paragraph out loud.            about 75 seconds
Change one word you did not like.             about 40 seconds
```

Reading out loud is a specific accommodation for dyslexic readers: the auditory pathway compensates for the visual one. The template author chose this step deliberately. The user does not need to know why it works; they need only be able to do it.

## What these have in common

- The first step is always a physical action, never a category.
- The instruction is always bounded (an object, a sentence, a line, a paragraph, one).
- The tool never comments on the user's speed or consistency.
- The user does not see the plan.
- The share link makes the tool useful even for users who could not have opened it themselves.
