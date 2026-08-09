# Architecture

This document describes how Onramp is built. It is written for a contributor, a reviewer, or a technical judge who wants to know why the code looks the way it does. The design is small on purpose. Every choice below has a reason, and most of the reasons are recorded here.

## Overview

Onramp is a single-page TypeScript web application with no backend and no runtime dependencies. It reads a task from the user, produces a decomposition using a rule-based decomposer, and renders one step at a time through a state machine and a structural renderer.

The application has four layers, and the layers only communicate in one direction.

```
User input
    |
    v
+-----------------+
|  UI (src/ui/)   |   renders, listens for keys, owns the DOM
+-----------------+
    |             ^
    v             |
+-----------------+
|  State machine  |   pure state transitions, no DOM, no globals
+-----------------+
    |             ^
    v             |
+-----------------+
|  Core           |   decomposer, checker, refusal invariants
| (src/core/)     |
+-----------------+
    |
    v
+-----------------+
|  Templates and  |   task shapes and first-step physicalisations
|  physicalisations|
| (src/templates/,|
|  src/physical/) |
+-----------------+
```

The purity boundary sits between the UI layer and everything below it. Nothing under `src/core/`, `src/state/`, `src/templates/`, or `src/physical/` may import from `src/ui/` or from the DOM. This is enforced by a dependency test in the suite.

## The purity boundary

The purity boundary is the single most important architectural rule.

### Module dependency graph

```
                    +-----------+
                    |  index.ts |
                    +-----------+
                          |
                          v
                    +-----------+
              +---->|  ui/*.ts  |<---------+
              |     +-----------+          |
              |           |                |
              |           v                |
              |     +-----------+          |
              |     | state/*.ts|          |
              |     +-----------+          |
              |           |                |
              |           v                |
              |     +-----------+          |
              |     | core/*.ts |<---------+
              |     +-----------+          |
              |           |                |
              |           v                |
              |     +-----------+   +-----------+
              +-----| templates/|   | physical/ |
                    +-----------+   +-----------+
```

Read the arrows as "imports from." The UI layer imports from state, core, templates, and physicalisations. The state layer imports from core. The core layer imports from nothing but its own submodules. Templates and physicalisations import from core types only.

Reverse-direction imports are forbidden. `core/*.ts` does not know that a DOM exists. `state/*.ts` does not know that a renderer exists. This lets us unit-test the entire logic of the tool without a browser and without a headless environment.

### Why the boundary exists

Three reasons.

First, testability. Core logic that touches the DOM cannot be tested in Vitest without a jsdom shim, and jsdom shims lie about layout, focus, and event ordering in exactly the ways that matter. The boundary keeps the logic testable in pure Node.

Second, portability. The core of Onramp could be lifted into a CLI, a native app, or an embedded surface without changing a line. We are not going to do that in the 1.0 cycle, but we are keeping the option.

Third, discipline. Every time the boundary is tempting to cross, there is a design question underneath. Crossing the boundary hides the question. Keeping the boundary surfaces it.

## The seven-rule checker

The copy checker enforces the seven rules against every string in `src/`. It lives at `src/core/copy-check.ts` and it is exercised by `src/core/__tests__/copy.test.ts`.

The seven rules, in short:

| Rule | Description |
|---|---|
| 1 | No banned words. The list includes praise, streak, points, level, badge, reward, congrats, and a small set of dismissive adverbs. |
| 2 | No superlatives. "Best," "most," "fastest," and their kin are treated as marketing residue. |
| 3 | No presumption of state. Strings do not assume the user is happy, sad, tired, or motivated. |
| 4 | No commands with an exclamation mark. Onramp does not shout. |
| 5 | No apology-in-the-verb constructions ("we would love to," "we are excited to"). |
| 6 | No hedges that undermine the tool ("we hope this helps"). |
| 7 | No claim of clinical benefit. Onramp is a tool, not a treatment. |

### Implementation notes

The checker is a pure function of `(string, ruleset) => Violation[]`. It scans the string against three internal passes: a banned-word substring pass with case folding, a superlative regex pass, and a set of shape-of-sentence checks driven by a small hand-written pattern list.

There is no natural-language model involved. The checker cannot understand a sentence; it can only recognise shapes. This is a limitation and it is on purpose: a false positive is easy to fix by rewording, and a false negative is caught by human review at PR time.

The checker runs at test time, not at runtime. It scans every `.ts` and `.tsx` file under `src/` and extracts string literals, template literal parts, and object property string values. Dynamic construction (concatenation, template substitution) is folded conservatively: if any input part is unknown, the checker reports the location and asks a human to review.

The checker's output feeds a Vitest test that fails if any violation is found. The test is not a linter you can bypass; it is a specification you cannot ship without satisfying.

## Decomposition strategies

The decomposer takes a task string and produces a list of steps. It applies one strategy from a fixed set, chosen by the shape of the input.

### Strategy set

| Strategy | Trigger shape | First-step shape |
|---|---|---|
| Object-orient | Task names a physical object ("the sink," "the desk") | Approach the object |
| Message-reply | Task names a person and a communication verb ("email Chris") | Open the message; read the subject only |
| Document-draft | Task names a document type ("proposal," "report") | Open the document; place the cursor at the last edit |
| Room-reset | Task is a location ("the kitchen") | Enter the room; identify one visible surface |
| Movement-start | Task is a physical activity ("workout," "walk") | Change into one item of appropriate clothing |
| Decision-defer | Task is a decision ("choose a doctor") | Write the decision at the top of a blank page |
| Fallback | None of the above match | Stand up; take three breaths; sit back down |

The strategies are ordered. The first one whose trigger matches is applied. The fallback exists because a decomposer that returns nothing is worse than one that returns a small physical reset.

### Decision flow

```
Task string
    |
    v
Tokenise and tag
    |
    v
Contains a physical object noun? --Yes--> Object-orient
    | No
    v
Contains a person name and comm verb? --Yes--> Message-reply
    | No
    v
Contains a document-type noun? --Yes--> Document-draft
    | No
    v
Contains a location noun? --Yes--> Room-reset
    | No
    v
Contains a movement verb? --Yes--> Movement-start
    | No
    v
Contains a decision verb? --Yes--> Decision-defer
    | No
    v
Fallback
```

Each strategy is a pure function. Each strategy has its own test file. The decomposer top-level function is a switch over strategies, and the switch itself is covered by tests that assert the ordering.

## State machine

The state machine is the sequence of states the user moves through during a session. It is defined in `src/state/machine.ts` as a discriminated union.

### States

| State | Meaning |
|---|---|
| `Empty` | No task entered. The task field is focused. |
| `Composing` | The user is typing. |
| `Decomposed` | A decomposition exists. The first step is displayed. |
| `Stepping` | The user is in the middle of the sequence. |
| `Complete` | The user has confirmed the final step. |
| `Audit` | The debug panel is open. Overlays any of the above except `Empty`. |

### Transitions

| From | Event | To |
|---|---|---|
| `Empty` | Type character | `Composing` |
| `Composing` | Submit | `Decomposed` |
| `Decomposed` | Confirm step | `Stepping` |
| `Stepping` | Confirm step | `Stepping` (or `Complete` if last) |
| `Any (not Empty)` | Toggle audit | `Audit` |
| `Audit` | Close audit | Previous state |
| `Complete` | Reset | `Empty` |

There are no other transitions. The machine is total: every event in every state produces a defined outcome or is explicitly a no-op.

## Data structures

The types are declared in `src/core/types.ts` and shared across layers.

```ts
type Task = {
  raw: string
  tokens: Token[]
}

type Step = {
  id: string
  text: string
  ruleId: number         // which of the seven rules produced this step
  strategy: StrategyId   // which decomposition strategy fired
  bounded: number        // seconds, always <= 60
}

type Decomposition = {
  task: Task
  steps: Step[]
  strategy: StrategyId
  createdAt: number
}

type SessionState =
  | { kind: 'Empty' }
  | { kind: 'Composing'; draft: string }
  | { kind: 'Decomposed'; decomp: Decomposition }
  | { kind: 'Stepping'; decomp: Decomposition; index: number }
  | { kind: 'Complete'; decomp: Decomposition }
  | { kind: 'Audit'; underlying: SessionState }
```

`Step.bounded` is measured in seconds and asserted to be less than or equal to sixty by a test on every step the decomposer produces. This is the step-size invariant.

## Gating loop sequence

The gating loop is the core interaction: display one step, wait for confirmation, advance. It is a sequence of five events per step.

```
UI                     State                  Core
 |                       |                     |
 | render(step)          |                     |
 |---------------------->|                     |
 |                       |                     |
 | user press confirm    |                     |
 |---------------------->|                     |
 |                       | reduce(confirm)     |
 |                       |-------------------->|
 |                       | next(state)         |
 |                       |<--------------------|
 | render(next step)     |                     |
 |<----------------------|                     |
```

There is no async here. The reducer is synchronous. The renderer runs after the reducer returns. This is deliberate: async in the gating loop would introduce race conditions between key presses and renders, and the audience we serve is exactly the audience for whom "did the step advance?" ambiguity is worst.

## Share protocol

A share link encodes the current task and decomposition in the URL fragment.

### Encoding

The fragment format is `#o1=<base64url-json>`. The prefix `o1` identifies the version of the share protocol; a future breaking change would ship as `o2` and the reader would accept both. The payload is a JSON serialisation of a subset of `Decomposition`, chosen to be forward-compatible with additive fields.

### Decoding

On page load, the app checks `location.hash`. If it matches the share prefix and version, the payload is parsed, validated against a schema, and used to seed the initial state. If parsing or validation fails, the app starts in the `Empty` state and silently ignores the fragment; there is no error surface, because a bad share link is not the user's problem.

### Trust model

The share link is trusted at the level of the person who sent it. There is no signing, no encryption, no server-side lookup. The recipient sees the exact task and steps encoded in the URL. If the URL is tampered with in transit, the recipient sees the tampered version; this is acceptable because the payload is not privileged and the recipient has no reason to treat it as authoritative.

## Persistence

The current session is persisted to `localStorage` on every state transition, keyed by a fixed slot name. On page load, the slot is read; if present and valid, the app restores the state. If absent or invalid, the app starts in `Empty`.

Persistence is a single JSON blob. There is no schema migration in 1.0. A future breaking change to the state shape will drop persisted state on read and start fresh; the loss is acceptable because the state is small and easily reproduced.

`sessionStorage` is not used. `IndexedDB` is not used. No cookies are set. No third-party storage is written.

## Rendering

The renderer lives at `src/ui/render.ts`. It takes the current `SessionState` and applies it to the DOM.

### The one-step structural guarantee

At any given moment, the DOM contains at most one element with the class `step-active`. This is asserted structurally, not by CSS.

The renderer implements this by:

1. Before rendering a new step, removing every element with `step-active` from the DOM.
2. Constructing the new step element off-DOM.
3. Appending it to the container.
4. Asserting, in a debug build, that the count of `step-active` elements is exactly one.

CSS could hide additional steps, but hiding is not the same as removing. A hidden step is still in the accessibility tree, still in the tab order, and still catchable by a screen reader that walks the DOM. We remove.

### DOM shape

The DOM shape is minimal.

```
<main id="app">
  <section id="task-field" hidden-when-not-empty>
    <label>What are you having trouble starting?</label>
    <input type="text" />
  </section>

  <section id="step">
    <p class="step-active">...</p>
  </section>

  <aside id="audit" hidden-by-default>
    <ul>...</ul>
  </aside>
</main>
```

No custom elements. No shadow DOM. No framework-managed roots. The renderer owns `#app` and everything under it.

## Keyboard model

Every action is reachable by keyboard. The shortcut map is stable and documented.

| Key | Action | Available in |
|---|---|---|
| Enter | Submit task or confirm step | Composing, Decomposed, Stepping |
| Space | Confirm step | Decomposed, Stepping |
| Escape | Reset current session | Any except Empty |
| ? | Toggle audit panel | Any except Empty |
| S | Copy share link | Any except Empty |
| Tab | Move focus | Any |
| Shift+Tab | Move focus backward | Any |

The focus ring is visible and high-contrast. Focus order follows DOM order. There is no focus trapping; a user who wants to leave the app can Tab out to the browser chrome.

## CSS architecture

The stylesheet is a single file at `src/ui/style.css`. It has three sections.

### Section 1: design tokens

CSS custom properties declared on `:root`. Colors, spacing scale, type scale, and motion durations live here. Only tokens declared here may be referenced elsewhere in the stylesheet.

### Section 2: base and reset

A minimal reset. Box-sizing, margin zeroing, and the base type styles. No third-party reset library.

### Section 3: components

One block per component, in the order the components appear in the DOM. Selectors are single-class where possible; nesting is one level maximum.

There is no BEM, no atomic CSS, no utility framework. The stylesheet is short enough that a naming scheme is not needed.

### Motion tokens

Motion is declared as a duration and an easing on each transitioning property. The default state respects the operating-system reduced-motion preference; when the preference is on, durations collapse to zero and easings become linear.

## Testing philosophy

Tests are the specification. If a rule matters, it is a test.

### Test categories

| Category | What it covers |
|---|---|
| Copy | The seven-rule checker over every string in `src/`. |
| Decomposer | Each strategy has its own file; the top-level switch has its own file. |
| Step-size | The step-size invariant: every produced step is at most sixty seconds. |
| State machine | Every transition table row has a test. |
| Renderer | The one-step structural guarantee, asserted by DOM count after each render. |
| Refusal | No import path from `src/` reaches a scoring, tracking, or telemetry module. |
| Purity | No import path from `src/core/` reaches `src/ui/` or the DOM. |

### Non-goals for testing

We do not aim for a coverage percentage. We aim for a specification that reads as sentences. A file where the tests describe the product in prose is worth more than a file where 100 percent of lines are hit by opaque assertions.

We do not test the CSS by rendering it. Visual regression testing is expensive to maintain and prone to false positives; the design tokens are stable and the components are small enough that human review at PR time is sufficient.

## Non-goals

The following are explicitly not goals of the architecture.

| Non-goal | Why |
|---|---|
| Framework compatibility | Onramp does not need a framework; adding an integration surface would invite dependencies. |
| Plugin API | A plugin API is a foot-gun for a small tool with strong opinions; contributions live in the repo, not in third-party plugins. |
| Multi-user modes | No accounts, no collaboration, no shared sessions. The tool is single-user by design. |
| Server-side rendering | Not required for a client-only app; SSR would add a runtime we do not have. |
| Internationalisation infrastructure | Not shipped in 1.0; a future addition will introduce a small message catalog and a locale detector. |

## Extension points

If you are contributing, these are the places where the architecture invites extension.

### New templates

A template lives at `src/templates/<name>.ts` and exports a `Template` object. The decomposer will pick it up if its trigger predicate matches.

### New physicalisations

A physicalisation lives at `src/physical/<name>.ts` and exports a `Physicalisation` object with a render method that takes a step and produces a DOM node or a side-effect (tone, haptic).

### New decomposition strategies

Adding a new strategy is a restricted-area change. The current seven strategies were sized to cover the observed task shapes with minimal overlap; adding an eighth requires evidence that the new shape is not served by any existing strategy. Open an issue with a design note before opening a PR.

### New refusal invariants

Adding a refusal invariant is welcome. If you have found a module or pattern we should refuse (a specific tracking library, a specific dependency, a specific coding shape), add a test under `src/core/__tests__/refusal.test.ts` that asserts its absence, and reference the discussion in the PR.

The refusal test file is intentionally growable. Every entry there is a decision we have made once and will not have to re-make.

## A note on the file layout

The repository's top-level layout is small enough to hold in mind. `src/` contains all shipped code. `docs/` contains this document and its neighbors. `public/` holds the static HTML entry point. `dist/` is a build output and is not checked in. Test files sit next to the code they exercise, under `__tests__/` directories, so a reader can find the specification without leaving the module. Nothing in the layout is clever, and that is the point: a contributor who has read this document should be able to open the tree and find any piece of the system in under a minute.

## A note on when to rewrite

Onramp is small. Rewrites are cheaper than they usually are, and refactors that would be expensive in a larger codebase are often the right choice here. If a section of the code has grown a set of comments explaining why it is the shape it is, that is a signal to rewrite the section so that no comment is needed. If a test is asserting a fact that no reader could infer from the code, that is a signal to change the code, not the test.

The bar for a rewrite is not "the code could be better." It is "a new reader would understand the intent faster after the rewrite than before it." When that bar is met, please open a PR.
