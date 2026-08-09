# Frequently Asked Questions

This document answers questions we hear at demo tables, in issues, and in review conversations. It is organised by topic, not by frequency. If a question is not here, please open an issue with the `question` label and we will add it.

## Tech and architecture

### What is the tech stack?

TypeScript, Vite, and Vitest. That is the full list. There are no runtime dependencies. There is no backend, no database, and no third-party JavaScript loaded at page load. The build toolchain runs at development time only and does not ship to users.

We chose TypeScript because it makes the checker and the decomposer readable as a specification. We chose Vite because it starts fast and produces a static bundle with no configuration. We chose Vitest because it shares the Vite pipeline and runs the suite in under a second on a warm cache.

### Why no framework?

Because a framework would be more code than the app. Onramp's total source is small enough that a hand-written renderer and a hand-written state machine are shorter, more readable, and more testable than a framework equivalent. The renderer enforces the one-step guarantee structurally, which a general-purpose framework would not do for us for free.

If the project grew to the point where hand-written renderers became a maintenance burden, we would revisit. It has not, and we do not anticipate it will.

### Why no ML core?

Because decomposition is not a problem that benefits from a black box. It is a problem that benefits from rules a person can read, an audit panel a person can open, and tests a machine can run.

An ML decomposer would have three failure modes we refuse to accept. First, it would fail in ways we could not audit; a user who received a bad step would have no way to see why. Second, it would create a data-collection incentive; an ML decomposer improves with user data, and we do not want to collect user data. Third, it would fail hardest on the users we most want to serve; edge-case task shapes, non-English input, and unusual phrasings are exactly the inputs where ML degrades and where our audience often lives.

The rule-based decomposer is worse in the average case and better in the worst case. We are optimising for the worst case on purpose.

### How does this scale?

Onramp is a static site. It scales like any other static site: linearly with hosting bandwidth, and free of any per-user cost on our side, because there is no per-user server-side state. Ten users and ten million users cost us the same at the application layer.

If you mean "how does the decomposer scale with task complexity," the answer is that it does not, and that is a feature. Onramp is aimed at the first sixty seconds. If a task is genuinely complex, the tool hands you the first physical step and gets out of the way; the rest of the task is not our problem.

### What is the offline behaviour?

Fully offline capable after first load. The service worker caches the shipped bundle. There is no network request in the running app. You can save the page to your device, disconnect the network, and use it indefinitely.

### Does it support non-English input?

The decomposer's rules are largely language-agnostic in structure, but the shipped rule set is tuned for English phrasing. Non-English task text will produce a decomposition, but the first step may be less well-shaped than for English input. Adding language packs is a welcome contribution; see `CONTRIBUTING.md`.

### Is this a therapy replacement?

No. Onramp is a tool. It is not a therapy, a treatment, a coaching program, or a clinical intervention. It does not diagnose anything. It does not claim to treat anything. If you are looking for clinical support for executive dysfunction, please speak with a qualified professional. Onramp is complementary to that kind of support, not a substitute for it.

We are careful about this because the productivity category is full of tools that gesture at clinical benefit without evidence. We do not do that. The `docs/RESEARCH.md` file is explicit about the limits of what we claim.

## Design and copy

### Why no dark mode?

Because the sensory floor is a research decision, not a personal-preference decision. The default background is a warm off-white chosen to reduce sensory load for users in a bad executive-function state. A dark-mode variant would need the same care, and we have not yet done that work. It is on the list for a future release; it is not on the list for 1.0.

Users who need dark mode for photosensitivity or migraine can invert colors at the operating-system level, and the app respects that inversion.

### Where is the gamification?

Nowhere. It is not hidden. It is not a "premium" feature. It is refused as a category. See `docs/RESEARCH.md` for the evidence base, and the `Refused` section of `CHANGELOG.md` for the specific proposals we declined.

### Where is the teacher dashboard?

There is no teacher dashboard, and there will not be one. A tool that produces surveillance data about a student's executive function creates a power imbalance that harms the student. If a teacher wants to help a student use Onramp, they can sit next to the student and use it together. That is the intended shape of adult help.

The same applies to manager dashboards, parent dashboards, and coach dashboards. We understand the demand. We are declining the demand.

### What happens if I lose internet mid-session?

Nothing. The app continues to work. Your task and your progress remain on your device. When you regain connectivity, nothing needs to sync, because nothing was syncing.

### Is the share link private?

The share link contains your task text and the decomposition, encoded in the URL fragment. The fragment is not sent to a server by the browser; it is client-side. But the URL, as a string, is under your control. If you paste it into a chat, email, or document, whatever holds that string can read the task.

The trust model for a share link is "the person you send it to." We do not encrypt it, because encrypting a URL that the recipient must be able to open would require sharing a key, and the complexity does not match the threat.

If you want to share a decomposition privately, share it verbally or on a channel you already trust. If you want to keep it entirely private, do not share it.

### Why one accent color?

Because a user in a bad executive-function state should not have to make a color decision to start a task. Every choice we can remove, we remove. The single-accent constraint is enforced in the CSS token layer and in the design tests.

A future release may allow a limited palette so users can match Onramp to a workspace. It will not allow arbitrary color selection.

### What is the audit panel for?

The audit panel exposes the decomposer's reasoning for the current step. It shows which of the seven rules fired, what input was matched, and what constraints were checked.

Its purpose is threefold. First, it lets a skeptical user verify that no ML is running under the hood. Second, it lets a technical judge inspect the mechanism without reading the source. Third, it lets a contributor debug a bad decomposition without instrumenting the code.

It is off by default because most users do not need it and it would add visual noise.

### Why is the "about" page hedged?

Because we are not going to be one more productivity tool that gestures at clinical benefit and hides behind marketing copy when asked to defend it. The about page describes what the tool does. It does not describe what the tool cures. There is a difference and we are keeping it.

### What do you NOT measure?

We do not measure task-completion rates. We do not measure session length. We do not measure feature usage. We do not measure how many steps a decomposition typically has. We do not measure whether a user came back the next day. We do not know how many people use Onramp today, and we cannot know.

The absence of measurement is the point. Every measurement is a data-collection incentive. Every incentive is a pressure to build the thing that produces the metric. We are removing the pressure at the source.

### What do you measure?

Two things, both at development time only.

The first is test coverage: which lines of the checker, decomposer, and state machine are exercised by tests. This is a code-hygiene measurement, and it does not involve users.

The second is the copy checker: every string in the source tree is scanned against the seven rules. This is a self-audit, and it does not involve users either.

## Contribution and process

### How do I contribute?

Read `CONTRIBUTING.md`. Short version: safe additions are welcome (templates, physicalisations, copy improvements, accessibility fixes, tests, docs), restricted areas require an issue and a design note first (scoring, praise, backend, ML, analytics, motion changes, palette changes), and the pull request checklist is at the end of the contributing doc.

### Do I need to sign a CLA?

No. Contributions are licensed MIT, and by opening a PR you affirm you have the right to license the code. There is no separate CLA form.

### Why no signup wall?

Because a signup wall is a funnel, and a funnel implies a metric, and a metric implies a data-collection incentive we refuse. Also because a signup wall on a task-initiation tool is a cruel joke; the user is already struggling to start, and the first thing you ask them to do is create an account.

### What data do you collect?

None. Zero. Not "anonymised." Not "aggregate." Not "for product improvement." None.

The task text stays on your device, in browser storage, until you clear it. The decomposition is regenerated on demand. The share link is generated in the browser and copied to your clipboard. Nothing travels off-device unless you paste the URL somewhere.

### Do you have an email list?

No. If you want to hear about new releases, watch the repository on your Git host. There is no other channel.

## Engineering choices

### Why TypeScript strict mode?

Because a specification-as-tests approach depends on the types being load-bearing. `any` is a hole in the specification. `@ts-ignore` is a hole in the specification. Strict mode closes the holes and forces the checker's inputs and outputs to be honest.

### Why no CSS framework?

Because Onramp's total CSS is small enough that a framework would be more code than the styles. The design tokens are declared once, the layout uses standard CSS grid and flexbox, and the whole stylesheet fits comfortably in a single file. A framework would add classes we would not use and abstractions we do not need.

### How do you handle crashes?

The renderer has a top-level error boundary that catches any uncaught error and displays a calm message with a "reload" button. The state machine is designed so that a reload restores the current task and the current step from browser storage; no work is lost.

If a crash produces an error the user wants to report, they can copy the error message and paste it into a bug report. We do not auto-send crash reports, because we do not have a place to send them.

### How do you handle bug reports?

Open a GitHub issue with the `bug` label. Include the browser, the OS, the reproduction, and the observed vs expected behaviour. If the bug is a security issue, please use the private channel described in `SECURITY.md`.

## Comparisons and context

### How is this different from a to-do list?

A to-do list holds the task. Onramp produces the first physical step. Those are different products aimed at different moments. If you already know how to start, use a to-do list. If you do not, use Onramp for the first sixty seconds and then use whatever else you like.

### How is this different from a Pomodoro timer?

A Pomodoro timer assumes you have started. It structures a work interval and a break interval. Onramp aims at the moment before the Pomodoro begins. You can use both.

### How is this different from a focus app that blocks distractions?

A blocker restricts your environment so that starting is the path of least resistance. It works when the barrier to starting is external distraction. Onramp addresses the case where the barrier is internal, and no amount of blocking will make the first step feel possible. Different tools, different failure modes.

### How is this different from a mind-mapping tool?

A mind-mapping tool helps you understand a task by expanding it. Onramp helps you begin a task by contracting it. Mind maps are for the second half of the problem; Onramp is for the first minute.

### How is this different from a coach or an accountability partner?

A coach or an accountability partner is a person, and person-shaped help is often the most effective help. Onramp does not compete with that. It fills the gaps between conversations, and it is available in the middle of the night when a coach is not. If you have a coach, use them. If you have Onramp, use it. If you have both, use both.

### How is this different from a habit tracker?

A habit tracker measures recurrence. Onramp addresses initiation. A habit tracker asks "did you do the thing today?" Onramp asks "can we make the first step small enough to begin right now?" They are aimed at different sides of the same wall. Many habit trackers also carry streaks and scoring, which we refuse; if you use a habit tracker alongside Onramp, please pick one that lets you turn those off.

### What about voice input?

Voice input is on the list for a future release. It is a strong fit for the audience: typing a task is itself a task, and for a user in a bad executive-function state the typing can be the point of failure. We have not shipped it in 1.0 because the offline commitment and the zero-third-party-request commitment make voice input a design problem, not a shopping problem. When we ship it, it will use the browser's built-in speech APIs and it will run entirely on-device.

### Do you plan a mobile app?

Not as a separate app. The current web app is already usable on a mobile browser, and a wrapped native app would add store-review overhead, an update pipeline, and a set of platform-specific bugs without changing what the tool does. A user who wants Onramp on their home screen can add it as a progressive web app in one action.

## Documentation and reading order

If you have five minutes, read `docs/JUDGES.md`.

If you have fifteen minutes, read `docs/JUDGES.md`, then the `Refused` section of `CHANGELOG.md`.

If you have thirty minutes, add `docs/DESIGN.md` and `docs/RESEARCH.md`.

If you have an hour, read the whole `docs/` folder and then browse `src/core/` in this order: `copy-check.ts`, `decomposer.ts`, `state.ts`, `__tests__/*`. That is the entire tool.
