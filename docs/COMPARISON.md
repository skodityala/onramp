# Comparison

This is not marketing. It is due diligence. If a judge or contributor uses another tool and wonders "why not add Onramp's ideas to that tool?", this document is the answer.

## 1. Category table

```
Category            | Optimises for              | How initiation fails there
──────────────────    ────────────────────────    ─────────────────────────────────
To-do list          | Task inventory             | Shows the list; the list is
                    |                            | the injury.
Habit tracker       | Consistency (chains)       | Punishes gaps; the failing case
                    |                            | breaks chains and the loss stacks.
Planner / calendar  | Scheduling                 | Assumes the user knows what
                    |                            | "start" means physically.
Focus timer         | Boundary once started      | The barrier is starting, not
                    |                            | continuing.
Mind map / outline  | Structure of intent        | Subtasks are still categories;
                    |                            | subtask 1 is as unstartable as
                    |                            | the parent task.
AI writing tool     | Draft production           | Solves the assignment for the
                    |                            | user and teaches learned
                    |                            | helplessness.
Study planner       | Course scheduling          | Optimises what to study when,
                    |                            | not how to begin the studying.
Journaling app      | Introspection              | Also requires initiation.
Coach app           | Habit formation            | Longer time horizon; not the
                    |                            | 30-second gap that stops a step.
```

For each row, the tool's stated purpose is legitimate. Onramp is not a replacement for any of them. Onramp is orthogonal: it addresses the specific gap between "I have decided to do the task" and "I have made the first physical movement." Once that gap is closed, all of those tools may be useful again.

## 2. Head-to-head: task decomposition

Same input: "Write a 5 page essay on the causes of WWI, due Friday."

**Naive decomposer:**
1. Research WWI causes.
2. Take notes on your sources.
3. Write an outline.
4. Write the introduction.
5. Write the body.
6. Write the conclusion.
7. Edit and proofread.

Every one of those is a category. "Research" has no first physical move. The student who cannot begin the essay cannot begin the research either, and for the same reason.

**Onramp:**
1. Open a new doc.

That is what appears on screen. The other steps (type the title, type one sentence saying what your answer is, write down three things you already know, type one heading for your first point) exist in memory. The interface refuses to render them.

## 3. Head-to-head: praise vs neutrality

**Gamified tool, on first keystroke:**
- "You're on fire! +10 XP!"
- Confetti burst.
- Small "10 in a row" chain counter increments.

**Onramp, on first keystroke:**
- The duration line "about 20 seconds" changes to "you started."
- The Done button label changes to "Done, next step."
- Nothing else.

The gamified tool has told the user they are being watched, being scored, and being compared to yesterday. Onramp has told the user a fact: you started. That is enough. Adding anything on top is a demand for attention aimed at the person who is currently trying to produce something.

## 4. Head-to-head: progress indication

**Progress bar tool:**

```
[███████░░░░░░░░░░░░░░░░░░░]  Task 3 of 12 - 25% complete
```

**Onramp:**

```
Open a new doc.
about 20 seconds
```

The progress bar communicates how much remains. For a user overwhelmed by how much remains, that is precisely the injury the tool exists to reduce. Onramp does not show it. Not on a hover. Not on a keyboard shortcut. Not in a "show more" affordance. Not anywhere.

## 5. Where Onramp is worse

Honest limits.

- **Shared team lists.** Use a to-do app. Onramp has no shared state beyond the single-session share link.
- **Long-term habit formation.** Use a habit tracker. Onramp deliberately does not measure across sessions.
- **Having the work done for you.** Use an AI writing tool. Onramp does the opposite; it hands you back your own work.
- **A dashboard.** Onramp refuses to build one.
- **Weekly reports.** No.
- **Teacher view of student progress.** No, on purpose.

## 6. Where Onramp is different in kind

Two claims that no other tool in this space makes:

1. **It refuses to show the list.** No progress bar, no counter, no outline, no "show all steps" anywhere. Enforced by a structural test (`one-step.test.tsx`).
2. **The checker is deterministic and overrules any model.** The seven-rule checker (`src/core/atomicity.ts`) has final authority. When a model is configured, it proposes; the checker disposes. The audit panel exposes this every time.

## 7. What Onramp does not attempt to compete on

- Number of features.
- Number of integrations.
- Depth of analytics.
- Retention.
- Session length.

The product succeeds when the user closes the tab after starting.
