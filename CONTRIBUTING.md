# Contributing to Onramp

Thank you for considering a contribution to Onramp. This document describes how the project is developed, what kinds of changes we accept, what we refuse to accept, and how to get a pull request across the line without friction.

Onramp is a task initiation tool for people whose brains resist starting. That mission constrains what the code looks like. Please read this file before you open a PR, especially the sections on tests, restricted areas, and copy discipline.

## Table of contents

1. Project philosophy
2. Development setup
3. How to run the app
4. Tests as specification
5. Safe additions vs restricted areas
6. Code style
7. Pull request checklist
8. Adding a template or physicalisation
9. Copy discipline and banned words
10. Reporting bugs and asking questions
11. Attribution

## 1. Project philosophy

Onramp has three commitments that shape every design decision.

The first is that we do the decomposition work. The user should not have to think about how to break a task down. If we hand them a rough shape and expect them to refine it, we have failed at the one thing we exist to do.

The second is that the first step is always physical, verifiable, and takes less than sixty seconds. Not "open the document." Not "think about it." Something a body can do, a room can witness, and a timer can bound.

The third is that we do not gamify, praise, score, rank, or track. Extrinsic motivators are not a bug. They are a category we refuse. If you think a feature would benefit from a streak counter, please read `docs/RESEARCH.md` before opening the PR. Then please still not open the PR.

## 2. Development setup

Onramp is a TypeScript single-page app with no backend, no database, and no runtime dependencies beyond the browser. You need a recent Node.js and npm.

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 20.x or newer | Older versions may work but are not tested |
| npm | 10.x or newer | Comes with Node 20 |
| Git | Any recent version | For clone and PR flow |
| A modern browser | Latest Chrome, Firefox, Safari, or Edge | Needed for local preview and manual testing |

Clone the repo and install:

```
git clone <repo-url> onramp
cd onramp
npm install
```

The install step pulls in the dev toolchain only: TypeScript, Vite, Vitest, and a handful of type packages. There is no production runtime dependency graph to audit. If `npm install` produces anything under `dependencies` in `package.json`, that is a red flag and the PR that added it should be reviewed with care.

## 3. How to run the app

Three commands cover the entire development loop.

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm test` | Run the Vitest suite once and exit |
| `npm run build` | Produce a static bundle in `dist/` |

The dev server binds to a local port and prints the URL. Open it in a browser. There is no login, no seed step, and no environment file to configure. If you find yourself wanting to add one, please open an issue first.

## 4. Tests as specification

The test suite is not a safety net. It is the specification.

If a rule matters, it lives in a test. If it lives only in a review comment or a Slack message, it does not matter, because the next contributor will not read it. This is intentional. Onramp is a small project with a strong point of view, and the point of view has to be defended by code that a machine can check.

The test suite covers, at minimum:

- The seven copy rules, applied to every string in `src/`
- The step-size invariant: no decomposed step exceeds the configured word or verb limit
- The one-step structural guarantee: at any given moment, the DOM contains at most one active step
- The refusal invariants: no module imports a scoring, tracking, or telemetry library
- The purity boundary: modules under `src/core/` do not import from `src/ui/` or from the DOM

Before you open a PR, read the tests in `src/core/__tests__/`. If your change breaks one of them, you have two options: change the test with a written justification in the PR description, or change your change. There is no third option where the test is "flaky" or "outdated" without a corresponding PR that says so and defends the decision.

## 5. Safe additions vs restricted areas

Some kinds of contribution are welcome and low-friction. Others require a design discussion first.

### Safe additions

| Area | Examples |
|---|---|
| New templates | Additional task shapes: "clean a room," "reply to a difficult email," "start a workout" |
| New physicalisations | New ways to render the first step so a body can act on it |
| Copy improvements | Making a string calmer, shorter, or less presumptuous, subject to the seven copy rules |
| Accessibility fixes | Focus order, contrast, screen reader labels, keyboard-only paths |
| Test coverage | Additional cases for the checker, the decomposer, or the state machine |
| Documentation | Anything under `docs/` that clarifies the design without inventing new claims |

### Restricted areas

The following require an issue and a written design note before a PR will be reviewed.

| Area | Why it is restricted |
|---|---|
| Scoring, streaks, ranks, levels, badges, or rewards | We refuse this category. See `docs/RESEARCH.md`. |
| Praise strings ("nice work," "you got this," etc.) | The copy checker will reject them. Do not try to route around it. |
| Analytics, telemetry, or "anonymous usage stats" | We do not measure the user. Ever. |
| A backend, an account system, or a login wall | The tool works offline and stores nothing off-device. |
| Machine learning in the core loop | Decomposition is rule-based and inspectable. See `docs/ARCHITECTURE.md`. |
| Additional runtime dependencies | Every dep is a supply-chain risk and a load-time cost. Justify each. |
| Motion beyond the configured floor | Reduced-motion is the floor, not a fallback. |
| Color changes to the sensory floor | The palette is a research decision, not a taste one. |

If your change touches a restricted area, please open an issue that answers three questions: what problem you are solving, what evidence you have that this is the right shape of solution, and what the alternative was that you rejected.

## 6. Code style

Onramp uses TypeScript in strict mode. The style is small and boring on purpose.

- Two-space indent. No tabs.
- Single quotes for strings, double quotes for JSX attributes if JSX is ever introduced (it is not, currently).
- One export per file where possible. Barrel files are allowed at the module boundary only.
- Prefer `const` and pure functions. `let` is allowed where the state machine requires it.
- No `any`. No `@ts-ignore` without a comment explaining the exact reason and a linked issue.
- File names in `kebab-case.ts`. Type names in `PascalCase`. Function and variable names in `camelCase`.
- Comments explain why, not what. If a comment paraphrases the code, delete it.
- No console statements in shipped code. `console.debug` behind a build-time flag is acceptable during development.

Formatting is enforced by the standard TypeScript compiler settings in `tsconfig.json` and by the tests. There is intentionally no Prettier config to argue about.

## 7. Pull request checklist

Before you mark a PR ready for review, please confirm each of the following. Reviewers will check these first and bounce PRs that miss them.

- [ ] The branch is up to date with `main`.
- [ ] `npm test` passes locally.
- [ ] `npm run build` produces a bundle without warnings.
- [ ] The PR description names the user-visible change in one sentence.
- [ ] The PR description names the tests that cover the change, or explains why no test was added.
- [ ] No new runtime dependency was added, or a justification is included.
- [ ] No banned word appears in any string, comment, or doc that ships with the code.
- [ ] Any restricted-area work has a linked issue and a written design note.
- [ ] Screenshots are included for any UI change.

## 8. Adding a template or physicalisation

Templates are the most common contribution and the most welcome. A template is a task shape with a canonical decomposition: what the first physical step looks like, what the next few steps look like, and where the branches are.

To add a template:

1. Create a file under `src/templates/` named after the task in kebab-case.
2. Export a single object that matches the `Template` interface in `src/core/types.ts`.
3. Add a test in `src/templates/__tests__/` that exercises the decomposer against the new template and asserts the step-size and copy invariants.
4. Add a short entry to `CHANGELOG.md` under `[Unreleased]`.

A physicalisation is how the first step is rendered so the body can act. Some are visual (a single sentence, a large timer), some are auditory (a single tone at the sixty-second mark), some are tactile (a vibration on supported devices). To add one, follow the same shape as a template but under `src/physical/`.

The bar for both is high in one specific way: the first step must be something a body can do, and a room can witness. "Decide" is not a first step. "Stand up" is.

## 9. Copy discipline and banned words

Every string that ships to the user goes through the seven-rule checker. The rules are enforced by `src/core/copy-check.ts` and by the tests. The banned-word list includes, at minimum:

`just` (trailing space), `simply`, `easy`, `easily`, `obviously`, `don't worry`, `great job`, `awesome`, `well done`, `keep going`, `streak`, `points`, `level up`, `badge`, `reward`, `congrats`, `congratulations`.

The list is not exhaustive. If you are unsure whether a word is on-brand, imagine a person in the middle of a bad executive-function day reading it. If it lands wrong, cut it.

Copy is reviewed on every PR that touches a user-visible string, and the reviewer will apply the seven rules against your addition. Please do not route around the checker with template literals or dynamic construction. The checker follows dynamic construction too, but the reviewer will notice.

## 10. Reporting bugs and asking questions

Bugs go in the issue tracker with a reproduction, a browser and OS, and the expected vs actual behaviour. If the bug is a security issue, please see `SECURITY.md` for the private channel.

Questions about design are welcome as issues with the `question` label. Questions about the roadmap are welcome, but please read `docs/PITCH.md` and `docs/ARCHITECTURE.md` first, because a lot of the roadmap questions are answered there in the form of "we are not going to do that, and here is why."

## 11. Attribution

Onramp is MIT-licensed. Contributors retain copyright to their contributions and license them under MIT. By opening a pull request, you affirm that you have the right to license the code you are contributing and that you agree to the code of conduct in `CODE_OF_CONDUCT.md`.

Thank you for helping. This tool exists because a small number of people care enough to defend it against the temptation to make it more like everything else.
