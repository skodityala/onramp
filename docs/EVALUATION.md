# Evaluation

## 1. Purpose

This document lists how to evaluate Onramp. It is written for the person
who has been asked to make a decision about the project: a hackathon
judge, a clinician considering it for a patient, a maintainer thinking
about accepting a contribution. It is not a marketing document. It is a
compliance list. Each section describes a check, tells you how to run
the check, and states what a passing check looks like. If any check
fails, the project has a defect and the last section explains what
happens next.

The evaluation is ordered from cheapest to run to most involved. Judges
short on time can stop at section 3 and still form a defensible opinion.
A thorough reviewer will work through every section.

## 2. Correctness evaluation (offline)

Run these commands in order. Each must succeed before the next is
attempted.

1. `git clone <repo-url> onramp && cd onramp && npm install`
   The install must complete without an API key, without a login, and
   without any prompt to authenticate against a package registry beyond
   the public npm registry.
2. `npm test`
   The full test suite must pass at 100%. There are 274+ tests; every
   one is expected to be green. Skipped tests are not acceptable.
3. `npm run typecheck`
   TypeScript must report zero errors. The project is strict-mode.
4. `npm run build`
   The build must produce a `dist/` folder containing an `index.html`,
   a hashed asset bundle under `dist/assets/`, and the service worker
   at `dist/sw.js`.
5. `npm run dev`
   The dev server must open on `http://localhost:5173` and the app
   must render its landing screen.

If any of the five fails, the project fails correctness evaluation and
no further sections apply.

## 3. User experience evaluation

With the dev server running, walk through the following flow. This is
the same flow a first-time user would take.

1. Paste any assignment into the input surface. A short one is fine.
   A long one is also fine. Press "Find my first step." A single step
   should appear. Not two, not a list, not a plan. One step.
2. Press "Smaller." The current step is replaced by a shorter, more
   physical step. Press "Smaller" again. It should go deeper. Repeat
   until the step is atomic; the button should never crash the app, and
   should always produce a child that is either accepted or is itself
   further decomposable.
3. Press "Why this?" Reasoning text appears. It is the Critic's output,
   drawn from the audit trail. It should reference the step's parent
   and the seven checker rules in language a non-engineer can read.
4. If a typing surface appears for the current step, type one character.
   The duration line should update to read "you started." No time in
   milliseconds is shown to the user; the phrase is the interface.
5. Press "Done." The Finish screen appears with two plain sentences and
   an install button if the browser has offered installation.

A pass here means every step above happened without a crash, a hang, or
an unexpected surface.

## 4. Accessibility evaluation

Keyboard-only pass: unplug the mouse or disable the trackpad, then
navigate the app from paste to Finish. The keyboard shortcuts D, S, and
W stand for Done, Smaller, and Why. Every focusable element must have a
visible focus ring, and the tab order must move top to bottom, left to
right.

Reduced motion: toggle "Reduce Motion" in the operating system
accessibility settings. Reload the app. Every animation must stop. The
fade-in on step transitions is replaced by an instant swap.

Zoom: use the browser's zoom control to reach 200%. No content should
be clipped, no button should escape the viewport, and no scroll region
should overlap another.

If any of the three checks fails, the accessibility section fails.

## 5. Privacy evaluation

Open DevTools before the first paste. Switch to the Network tab. Reload
the app. After the initial static assets, no further network request
should be made. Paste an assignment, press "Find my first step," press
"Smaller," press "Done," and confirm the Network tab shows no new
outbound requests. The one exception is the case where the environment
variable `VITE_LLM_ENDPOINT` is set at build time and the user has
opted in to LLM assistance; in that case a request to the configured
endpoint is expected.

Open the Application tab in DevTools. Under Local Storage, only the
key `onramp.session.v1` should exist. Under Session Storage, nothing.
Under IndexedDB, nothing. Under Cookies, nothing. The service worker
cache stores static assets by URL; no user-typed content appears there.

If any request leaves the origin without the user having configured an
endpoint, or if any storage entry beyond `onramp.session.v1` appears,
the privacy section fails.

## 6. Code evaluation

Two grep checks and one read.

```
grep -RIiE "\b(j.st|s.mply|e.sy|e.sily|obv.ously|awes.me|str.ak|rew.rd|c.ngrats)\b" src/ docs/
grep -RP "[\x{2013}\x{2014}]" src/ docs/
```

The commands are written with placeholder dots so this document itself
does not contain the banned tokens. Substitute the missing letter in
each pattern before running. Both commands should return no matches
against your working tree. The first enforces the banned words list
against the codebase and its docs. The second enforces the "hyphens
only" typography rule (it looks for the two Unicode dash codepoints
U+2013 and U+2014).

Read `src/core/atomicity.ts`. The seven rules are declared as
individual functions. Each has a comment above it that states the rule
in one sentence. The `checkAtomicity` function composes them and
returns a structured verdict.

Open the running app and press "Why this?" on a step that was accepted
by the checker after being rejected by the decomposer. The audit panel
should render a line that begins "The checker overruled the model."
This is the visible surface of the invariant that the checker is
authoritative over any generative agent.

## 7. Test evaluation

Run each test file individually and confirm it passes.

```
npx vitest run src/core/__tests__/atomicity.test.ts
npx vitest run src/core/__tests__/decompose.test.ts
npx vitest run src/core/__tests__/session.test.ts
npx vitest run src/core/__tests__/plugins.test.ts
npx vitest run src/agents/__tests__/orchestrator.test.ts
npx vitest run src/adapters/__tests__/pwa.test.ts
```

Every file should exit green. A file that passes in the aggregate run
but fails when isolated is a hidden dependency between test files, and
must be filed as a defect.

## 8. Regression evaluation

Two property tests exercise the core with randomised inputs:

- `atomicity.property.test.ts` runs the checker against 100+ generated
  step strings per assertion, drawn from a grammar that mixes verbs,
  objects, and seconds budgets.
- `decompose.property.test.ts` runs the decomposer against 100+
  generated non-atomic steps and asserts that every child either
  passes the checker or is further decomposable, without exception.

Neither property test may crash and neither may produce a falsifying
example. If either does, the failing seed is printed and must be
reduced and filed.

## 9. Failure mode evaluation

Deliberately break the environment and confirm the app degrades
gracefully.

- Turn off wifi. Reload the app (it is served by the cache). Paste an
  assignment. The full decomposition path works because the default
  path is rules-based and offline-capable.
- Open the app in a private/incognito window. `localStorage` may throw
  on write in some browsers. The app must catch the throw and continue;
  the session does not persist across a reload in that mode.
- Paste a 5000-character assignment. The first step must appear in
  under 100 milliseconds on a mid-range laptop. The decomposer is O(n)
  in the length of the assignment and does not allocate proportional
  to depth.

If any failure mode above brings down the app, the failure mode
section fails.

## 10. Scorecard template

Reviewers should fill this in.

```
Criterion                       | Pass | Fail | Notes
--------------------------------+------+------+---------------------
Offline install                 |      |      |
No API key required             |      |      |
No banned words                 |      |      |
Only-one-step invariant         |      |      |
Reduced motion respected        |      |      |
Full keyboard operation         |      |      |
No telemetry outbound           |      |      |
Audit panel functional          |      |      |
Share link round-trip           |      |      |
274+ tests passing              |      |      |
Property tests green            |      |      |
5000-char paste under 100ms     |      |      |
Only onramp.session.v1 stored   |      |      |
Service worker registers        |      |      |
Install prompt on Finish screen |      |      |
```

A pass in every row is a pass overall. A fail in any row is a defect
that the next section addresses.

## 11. What we would fix if a judge finds a gap

Onramp has a public issue tracker. Every gap found in evaluation should
be filed there with a reproducer. The bug-fix policy is:

- If the fix is a one-line change and the diff is obvious, it is
  merged and released within 24 hours. The commit message references
  the issue number and cites the section of this document that
  surfaced the gap.
- If the fix is not a one-line change, it is documented in
  `CHANGELOG.md` under a new "unreleased" heading, and the fix ships
  in the next release. The release note references the issue and the
  section of this document.
- If the gap is a design decision the reviewer disagrees with (for
  example, the refusal to measure session count), the response is a
  written rebuttal linked from the issue. Design decisions are not
  changed by an evaluation report; they are changed by a design
  discussion, and the report is the correct place to open that
  discussion.

The point of this section is to give the reviewer a concrete promise.
"We will fix it" is not a plan. "One line within 24 hours, larger
changes in the next release, design pushback in writing" is a plan.

## 12. What this document does not evaluate

Onramp is a starting tool. This document does not evaluate whether the
tool actually helps a user start. That is the question the research
protocol in `METRICS.md` section 5 is written to answer, and it is not
a question the product can answer about itself.

An honest evaluation of Onramp says: the code compiles, the tests
pass, the invariants hold, the privacy story is what the docs claim,
and the interface behaves as described. Whether the tool helps you
start is a claim that requires evidence outside the product. This
document does not manufacture that evidence.

## 13. A five-minute pass

For a reviewer with five minutes and nothing else, run this in order:

```
git clone <repo-url> onramp
cd onramp
npm install
npm test
npm run dev
```

Then paste "write an essay on the causes of the French Revolution" and
press "Find my first step." If a single step appears, if it looks like
a first step a real student could act on, and if pressing "Smaller"
produces something smaller, the five-minute pass is a pass. Everything
else in this document is a deeper verification of the same claim.
