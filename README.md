# Onramp

**The first step, and only the first step.**

Onramp turns an assignment you cannot start into one physical action you can do
in under two minutes, and it never shows you the rest of the plan.

**No API key required** · `npm test` passes offline · Zero backend

---

## The barrier

Executive dysfunction is not a comprehension problem and it is not a focus
problem. A student can understand an assignment completely, want to do it, and
still be unable to begin, because "write your history essay" is a category
rather than an instruction. There is no defined first physical move.

Every tool we could find decomposes work into subtasks. But "research your
topic" is exactly as unstartable as the essay was. Onramp decomposes until
nothing is left to decide.

## Before and after

**In**

> Write a 5 page essay on the causes of World War One, due Friday

**Out**

> **Open a new doc.**
> about 20 seconds

That is the entire screen. There is no outline, no progress bar and no step
counter anywhere in this product. The other steps exist in memory. The interface
refuses to render them, because seeing the list is what stopped you last time.

## How it decides a step is small enough

A deterministic checker, not a language model, has the final say. Seven rules:

| Rule            | A step fails when                                     |
|-----------------|-------------------------------------------------------|
| MULTI_VERB      | it contains more than one action                      |
| DECISION_LEFT   | a choice is still inside it                           |
| TOO_LONG        | it is estimated over two minutes                      |
| ABSTRACT        | it names a category of work, not a physical action    |
| VAGUE_QUANTITY  | the amount is "some", "a few", "several"              |
| CONDITIONAL     | it branches on an "if"                                |
| UNBOUNDED       | there is no point at which it is finished             |

When a language model is configured, it **proposes** steps and the checker
**disposes**: any proposal that fails is sent back with a specific hint, and
after two failures the rule based decomposer takes over. The model cannot widen
its own authority. Press "Why this?" in the app to see which path produced the
step you are looking at.

All of this is pure, deterministic and unit tested. The atomicity checker has
over 100 test cases.

## Run it

```bash
npm install
npm test      # the checker, and the decomposition invariant
npm run dev
```

No API key. No account. No backend. The rules engine and the checker are the
product; a model is optional polish.

## Sharing

Every session can be turned into a link. On the Finish screen, "Send this to
someone" copies a URL to the clipboard. When someone opens that URL, they skip
the Start screen and land directly on the first step, cursor already in the
typing surface. Zero clicks between receiving the link and being one keystroke
from having started.

## Who we built this with

[REQUIRED. Fill in honestly. Name or handle of each neurodivergent person who
tested it, what they said, and what changed in the product because of it. If
this did not happen, delete this section and do not submit to IncludAI.]

## Accessibility

Every choice here has a reason, not a checkbox.

- All motion under 250ms, and removed entirely under `prefers-reduced-motion`
- Contrast about 15:1 on step text, well beyond AAA
- Warm off-white background rather than pure white, which reduces glare
- 62 character maximum line length, with an extra spacing toggle that raises
  line height to 1.9 and letter spacing to 0.06em
- Full keyboard operation, 3px focus ring never removed, D / S / W shortcuts
- New steps announced politely via `role="status"`, without stealing focus
- No sound, no flashing, no countdown timer, no autoplay

We do not claim any font cures dyslexia. The evidence is contested. We offer a
choice and say nothing more.

## What we deliberately left out

No streaks, points, badges, mascots, confetti or praise. For students who are
already behind, reward mechanics are punishment wearing a friendly face. The
product stays neutral on purpose.

There is also no "show all steps" button, and there never will be.

## Privacy

Everything stays in your browser. No account, no server, no analytics. When a
model is configured, only the assignment text is sent, never a name or any
identifier.

## Limits

Time estimates are heuristics, not measurements. The template library covers
about thirty assignment shapes and falls back to generic rules outside them.
English only. This is not a diagnostic tool and it is not a replacement for
support.

## Development

```bash
npm install          # install deps (no auth, no keys)
npm test             # run all unit and view tests
npm run typecheck    # TypeScript strict, noUncheckedIndexedAccess
npm run dev          # local dev server, opens on http://localhost:5173
npm run build        # production bundle in dist/
```

The `src/core/` directory is pure: no React, no DOM, no fetch, no `Date.now()`,
no `Math.random()`. All non-determinism is injected. This is enforced by test.

## License

MIT
