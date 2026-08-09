# Design

This document describes the design of Onramp: what the premise is, what it looks like on screen, what it says and does not say, and what the reasoning is behind each visible and audible choice. It is a companion to `docs/ARCHITECTURE.md`, which covers the code, and to `docs/RESEARCH.md`, which covers the evidence base.

## Design premise

Onramp exists for the moment between knowing what to do and doing it. That moment is a specific kind of paralysis, and design decisions that would be neutral for a general audience can be actively harmful for the audience we serve. The premise of the design is that we do not add anything the user has to negotiate with in order to start. If a widget requires the user to make a decision before it helps them, we cut it.

Every design choice in the tool is a subtraction. The task field is a single input because a two-input form is a choice. The palette has one accent color because two accents is a choice. The audit panel is off by default because a visible debug affordance is a choice a user did not ask to make. The reduced-motion state is the default state because a preference toggle is a choice.

Subtraction is the design method. Addition is the exception, and every addition needs a reason.

## One-screen thesis

Onramp fits on one screen. Always. If a task needs a decomposition that would spill below the fold, the decomposition is truncated to the current step, and the tool advances one step at a time. The screen shows what to do now. Nothing else.

The one-screen thesis is enforced structurally by the renderer's one-step guarantee (see `docs/ARCHITECTURE.md`). It is enforced editorially by the seven copy rules. It is enforced visually by a layout that leaves generous whitespace and refuses to fill it.

## Copy discipline

Copy is the surface where the design and the mechanism meet. It is also where a well-meaning writer can undo the entire product with three words. The copy discipline table describes what we say, what we do not say, and why.

| Do say | Do not say | Reason |
|---|---|---|
| "What are you having trouble starting?" | "What is your goal today?" | Goals presume energy. Starting is the honest problem. |
| "Stand up. Bring your laptop to the kitchen table." | "Get set up in a comfortable workspace." | The first is physical. The second is a vibe. |
| "Read only the subject line." | "Skim the email." | "Only" bounds the step. "Skim" is fuzzy. |
| "Done." | "Great job!" | Praise is refused; acknowledgement is enough. |
| "Next step." | "Keep it up!" | Advance the loop; do not motivate. |
| "Reload if the app freezes." | "We are sorry, something went wrong." | Instructions beat apologies. |
| "This tool does not diagnose or treat any condition." | "Onramp is your ADHD sidekick." | Honesty beats mascotting. |
| "The task stays on your device." | "Your data is safe with us." | Facts beat reassurance. |
| "Press Enter to confirm." | "Tap to continue your journey!" | Verbs beat theatre. |
| "You can share this decomposition by copying the URL." | "Share your success with friends!" | Function beats social proof. |

The copy checker enforces a superset of these. The table is a teaching tool for contributors; the checker is the guard.

## Refusals

The refusals table names what we do not build and why. It overlaps with the `Refused` section of `CHANGELOG.md`, but the framing here is design-centric.

| Refused | Reason |
|---|---|
| Streak counter | A streak makes the user's history a permanent commentary on their present. A user in a bad executive-function state does not need commentary. |
| Points, levels, badges | Extrinsic motivators displace intrinsic ones. The evidence base for this audience is negative. |
| Praise strings | Praise is condescending when the tool has no way to know whether the step was hard. |
| Sad-face empty states | If the state is empty, the state is empty. Anthropomorphising it is a small cruelty. |
| Mascot | A mascot is a personality the user must react to. Personality is a choice the user did not ask to make. |
| Onboarding tour | The tool is one input and one confirmation. If a user needs a tour, the tool is not small enough. |
| Progress bar | A progress bar over a decomposition implies a linear estimate we cannot honestly give. |
| Confetti | Confetti is a shout. Onramp does not shout. |
| Notifications | Notifications are an outbound message the user did not opt into moment by moment. |
| Sound on by default | Sound on by default is an intrusion. |
| Auto-focus stealing on route change | Focus stealing is an accessibility hazard. |
| Third-party fonts | Third-party fonts are a request the user did not authorise. |

## Design tokens

Tokens are declared in the stylesheet as CSS custom properties. Each token has a value and a reason.

### Color tokens

| Token | Value (approximate) | Reason |
|---|---|---|
| `--bg` | Warm off-white, low saturation | Reduces sensory load compared to pure white; avoids the "clinical" affect of medical-white; warm cast reduces perceived brightness at high monitor settings. |
| `--fg` | Warm near-black | Softer than pure black; retains 4.5:1 contrast at all shipped sizes. |
| `--fg-muted` | Warm mid-gray | For secondary text; assertions on contrast are still met. |
| `--accent` | Single non-neutral, muted | One accent color, always the same one. Users do not choose it. See "Accent color." |
| `--border` | Faint warm gray | Borders are used sparingly; the token is soft enough not to compete with content. |
| `--focus-ring` | High-contrast variant of `--accent` | Focus rings are visible and unambiguous. Accessibility is not a negotiation. |

### Spacing tokens

| Token | Reason |
|---|---|
| `--space-0` (zero) | For explicit zero spacing where the default would otherwise apply. |
| `--space-1` through `--space-6` | A geometric scale, factor 1.5. Not Fibonacci; not powers of two; chosen for the specific rhythms this app needs. |

### Type tokens

| Token | Reason |
|---|---|
| `--type-body` | System sans-serif, 18px base | System font avoids a third-party request; 18px base is generous for readability without appearing oversized. |
| `--type-step` | Same family, larger, medium weight | The step is the load-bearing text; it earns the size. |
| `--type-mono` | System monospace, for the audit panel | Monospace signals "look under the hood" without a separate visual identity. |

### Motion tokens

| Token | Default | Reduced-motion value |
|---|---|---|
| `--motion-fast` | ~120 ms | 0 ms |
| `--motion-medium` | ~240 ms | 0 ms |
| `--easing` | Standard ease-out | Linear |

Motion respects the operating-system reduced-motion preference by default. This is not "graceful degradation"; it is the intended state, and full motion is the ceiling.

## Motion

Motion in Onramp is small and functional. It exists to soften step transitions, so that a user who is watching the step area does not experience the change as a jump. It does not exist to reward, celebrate, or decorate.

The motion inventory is short.

| Where | What | Duration | Notes |
|---|---|---|---|
| Step change | Cross-fade opacity | Medium | Cross-fades avoid layout shift. |
| Audit panel | Slide-in from side | Medium | Side, not overlay, so the step remains visible. |
| Focus ring | None (instant) | Zero | Focus should not be animated; it can be missed. |
| Task submission | Small elevation of task field | Fast | Signals acceptance without drama. |

Everything is at zero duration when reduced-motion is on.

## Audio

Onramp is silent by default. There is one optional physicalisation that produces a single tone at the sixty-second mark of the first step. It is off unless the user enables it.

There are no notification sounds, no click sounds, no confirmation chimes, no ambient audio. This is a design choice; the productivity category is saturated with UI sound, and the audience we serve is disproportionately affected by unexpected audio.

If audio is enabled, the tone is a single sine wave at a moderate frequency, at a moderate volume, and it fades out over half a second. It does not repeat.

## Sensory floor

The "sensory floor" is the baseline state of the design: what the app looks and feels like when the user has changed nothing and the operating system has been told reduced-motion is on.

The sensory floor is:

- Warm off-white background.
- Warm near-black text.
- Single accent color used only for interactive affordances and the focus ring.
- No motion beyond focus-instantaneous state changes.
- No sound.
- No third-party assets.
- Type at a generous size.
- Whitespace is not filled.

The sensory floor is the intended state, not the fallback. A user who has never touched their operating-system settings still gets a design that respects them.

## Audit panel purpose

The audit panel exposes the decomposer's reasoning. It shows which of the seven rules fired for the current step, what input matched, and what constraints were checked.

Its purpose is threefold, and each purpose is design-load-bearing.

First, it makes the tool trustable by inspection. A user who suspects the tool is doing something under the hood can open the panel and see that it is not. This is a design decision, not a technical accident; the panel exists because the audience deserves the choice to verify.

Second, it makes the tool teachable. A contributor working on a new template or physicalisation can use the panel to debug their decomposition without running tests. The panel is the fastest feedback loop in the project.

Third, it makes the tool defensible. In a demo or an evaluation, a skeptical judge can be shown the panel and see the mechanism. There is no "trust us"; there is "look."

## The floor step

The floor step is what the decomposer produces when nothing else matches: "stand up, take three breaths, sit back down." It is intentionally low-effort and it is intentionally the same every time.

The floor step exists for two reasons. First, because a decomposer that returns nothing is worse than one that returns a small physical reset; a bad decomposition is recoverable, but a blank screen is not. Second, because the audience we serve often benefits from a physical reset even when the tool has not identified a specific first step.

The floor step is not a placeholder for a smarter fallback. It is the fallback.

## Share link

The share link encodes the task and decomposition in the URL fragment. The design goals are:

- Nothing leaves the device. The fragment is client-side; the server does not see it.
- Zero-click on the recipient's side. Opening the link produces the same decomposition; no accept, no confirm.
- Legible failure. If the fragment is malformed, the app starts empty; no error screen, no scary modal.
- Forward compatible. The prefix `o1=` identifies the version; a future breaking change can ship as `o2=` and the reader can accept both.

The link is copied to the clipboard on the share shortcut. No modal, no dialog, no "success!" toast. If the user wants confirmation, the presence of the URL on their clipboard is the confirmation.

## "About" hedging

The about page (in a footer link) describes what the tool does. It does not describe what the tool cures. The exact hedging is:

- "Onramp does not diagnose, treat, or manage any condition."
- "This tool is complementary to clinical care, not a substitute."
- "If you are looking for support beyond a task-initiation tool, please speak with a qualified professional."

The hedges are deliberate. The productivity category is full of tools that gesture at clinical benefit and hide behind marketing when asked to defend it. We are not going to do that. The about page is where the honesty is put in writing.

## What we do not measure

We do not measure:

- Task completion rates.
- Session length.
- Time-to-first-step.
- Feature usage.
- Return-visit frequency.
- The number of decompositions per user.
- The number of users.

Each of these is a metric that would create a design pressure. If we measure completion rates, we build for higher completion rates, and we optimise for the users who complete rather than the users who most need to start. If we measure session length, we build for longer sessions, and we compete for time we do not want to compete for. If we measure return visits, we build hooks. None of that serves the audience.

The absence of measurement is a design commitment, not a technical shortcut. It is the choice that most changes what we can build.

## What we DO measure

We measure two things, both at development time only.

The first is test coverage: which lines of the checker, decomposer, and state machine are exercised by tests. This is a self-audit of the specification.

The second is the copy checker: every string in the source tree is scanned against the seven rules. This is a self-audit of the design.

Both are internal. Neither involves the user. Neither produces a dashboard we could sell.

## Design non-goals

For the reader who wants the "not" list in one place:

| Non-goal | Reason |
|---|---|
| Look distinctive | The design is meant to feel familiar, not memorable. |
| Reward the user | Users are already adults; they do not need approval from a webpage. |
| Drive engagement | Engagement is not a signal of value in this category. |
| Signal seriousness | Corporate seriousness is a costume; we prefer directness. |
| Impress a designer | The tool is for a user having a bad day, not for a critique jury. |

If a design choice makes the tool look better in a portfolio and worse for a user in a bad executive-function state, it is not the choice we will make.

## A note on future changes

The design is meant to be stable. A stable design is a design a user can rely on when the rest of their day is not stable. Changes to the sensory floor, the palette, the copy discipline, and the motion inventory are restricted-area changes per `CONTRIBUTING.md`. Additions to templates and physicalisations are welcome and do not touch the floor.

If a future release changes the visible design, the change will be recorded in `CHANGELOG.md` under `Design` with the reason. A user who returns after a year should still recognise the tool.
