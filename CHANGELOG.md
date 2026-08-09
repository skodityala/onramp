# Changelog

All notable changes to Onramp will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [Unreleased]

### Added

- Placeholder section for the next release. Contributors should add entries here under the appropriate subsection when opening a pull request.

### Changed

- Nothing yet.

### Fixed

- Nothing yet.

### Refused

This subsection is unique to Onramp. It records feature requests we have explicitly declined, and why. It exists so that a person considering a pull request in a restricted area can see the prior discussion without opening the issue tracker.

- Nothing yet in the unreleased cycle.

### Design

This subsection records design decisions that shipped without a code change, or that shaped the code in a way worth naming.

- Nothing yet in the unreleased cycle.

## [1.0.0] - 2026-08-08

Initial public release. This is the first version of Onramp that we are willing to defend in public. It has a small feature set on purpose. The version number reflects our confidence in the interface contract, not the ambition of the surface area.

### Added

- Task input surface: a single text field where a user can name a task in their own words. No categories, no tags, no priority selector.
- Rule-based decomposer: the seven-rule checker that produces a first physical step under sixty seconds and a small number of follow-on steps. Fully deterministic, inspectable, and covered by tests.
- One-step renderer: the DOM contains at most one active step at any moment. The renderer enforces this structurally, not by CSS.
- Sensory floor: a warm off-white background, a single accent color, and a motion budget that respects the operating-system reduced-motion preference by default.
- Gating loop: after each step, the user confirms completion by pressing a single key or tapping a single target. No dashboards, no history views.
- Share protocol: a zero-click share link that encodes the task and its decomposition in the URL fragment, so nothing leaves the device unless the user pastes the link somewhere.
- Audit panel: a debug surface that shows the checker's reasoning for the current decomposition. Off by default; enabled with a keyboard shortcut. Judges and skeptical users can inspect the logic without reading the source.
- Templates: a starter set of canonical task shapes for laundry, email replies, a workout start, a room reset, and a document draft.
- Physicalisations: a starter set of first-step renderers, including large-text, tone-cue, and haptic where the device supports it.
- Keyboard model: every action reachable by keyboard alone, with a visible focus ring and a documented shortcut map.
- Copy checker: `src/core/copy-check.ts` enforces the seven copy rules against every string in the source tree. Enforced in tests, not at runtime.
- Test suite: Vitest coverage of the checker, the decomposer, the state machine, the renderer's one-step guarantee, and the refusal invariants.
- Static build: `npm run build` produces a self-contained `dist/` directory that can be hosted anywhere that serves files.

### Refused

The following were considered and declined during the 1.0.0 cycle. Each entry names what was proposed, what we decided, and where the reasoning lives.

| Proposal | Decision | Reasoning |
|---|---|---|
| Streak counter for consecutive days of task completion | Refused | Extrinsic motivator; harms the users we most want to serve. See `docs/RESEARCH.md`. |
| Points and levels for completed decompositions | Refused | Same category as the above. Also violates the copy checker at multiple points. |
| Praise strings after step completion ("nice work," "great job," etc.) | Refused | The seven copy rules explicitly ban this category. |
| A backend to sync tasks across devices | Refused for 1.0 | Would require accounts, storage, and a threat model we do not want. Local-only is the guarantee. |
| An ML-based decomposer that learns from user edits | Refused | Not inspectable, not testable, and creates a data collection incentive we refuse. |
| Analytics on task completion rates | Refused | We do not measure the user. Ever. |
| A teacher or manager dashboard | Refused for 1.0 | Surveillance surface; violates the trust model. Discussed further in `docs/FAQ.md`. |
| A "hard mode" that hides the first-step scaffolding | Refused | The scaffolding is the product. Hiding it defeats the tool for the audience that most needs it. |
| Motion beyond the sensory floor | Refused | Reduced-motion is the floor, not a fallback. |
| Additional accent colors as a user setting | Deferred | The single-accent constraint is a research decision. A future release may allow a limited palette; 1.0 does not. |
| A signup wall or optional account | Refused | No account, no wall, no funnel. |
| Third-party fonts loaded from a CDN | Refused | System fonts only. Zero third-party requests at runtime. |

### Design

- **Purity boundary.** The `src/core/` tree does not import from `src/ui/` or from the DOM. This is enforced by a dependency test in the suite. The boundary makes the core loop portable and, more importantly, unit-testable without a browser.
- **Tests as specification.** Every rule that matters is a test. Review comments are not a substitute. This decision shows up throughout `CONTRIBUTING.md` and in the test file names, which read as sentences.
- **One accent color.** The palette has exactly one non-neutral color. The reason is not aesthetic minimalism; it is that a user in a bad executive-function state should not have to make a color decision to start a task.
- **Warm off-white background.** The default background is a low-saturation warm off-white rather than pure white or pure gray. The choice reflects research on sensory-floor design for neurodivergent users and is documented in `docs/DESIGN.md` and `docs/RESEARCH.md`.
- **Sixty-second first step.** The first step is bounded at sixty seconds because that is the interval at which most users can defer the initiation-avoidance loop long enough to begin. The boundary is a checker rule, not a suggestion.
- **Zero-click share.** Share links carry the task and decomposition in the URL fragment. Nothing is uploaded. This preserves the "no backend" guarantee and gives the user a share flow that a suspicious IT department can inspect.
- **No "about" page hedging.** The tool does not claim to be a therapy, a treatment, or a cure. The wording is careful and hedged in exactly the places where a well-meaning marketing team would otherwise overreach.

## Format notes

Entries under `Added`, `Changed`, and `Fixed` follow Keep a Changelog conventions. Entries under `Refused` and `Design` are additions specific to Onramp, and they are load-bearing: a project that never records what it declined to build will drift toward building all of it.

Version numbers follow SemVer. A breaking change to the checker rules, the share-link format, or the exported types is a major bump. A new template or physicalisation is a minor bump. A bug fix is a patch bump.

[Unreleased]: https://example.invalid/onramp/compare/v1.0.0...HEAD
[1.0.0]: https://example.invalid/onramp/releases/tag/v1.0.0
