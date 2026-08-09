# Changelog

All notable changes to Onramp will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [Unreleased]

### Added

- Placeholder section for the next release. Contributors should add entries here under the appropriate subsection when opening a pull request.

## [1.1.0] - 2026-08-09

### Added

- Live deployment at <https://skodityala.github.io/onramp/>, published by GitHub Actions on every push to main.
- `VITE_BASE` environment override in `vite.config.ts` so the same source builds correctly for root-served hosts and for subpath hosts such as GitHub Pages project sites.
- SPA fallback (`404.html`) in the Pages artifact.
- Agent pipeline (checker, decomposer, critic, coach) behind an orchestrator, wired into the decompose path and surfaced in the audit panel with source tags. The deterministic checker retains final authority.
- Plugin registry so a contributor can add templates and physicalisations without touching core.
- Semantic similarity module for template matching.
- Property tests for the checker (7 properties over 200 random inputs each) and the decomposer (6 properties over 100 random assignments).
- Fuzz tests covering empty, whitespace, punctuation-only, 5000-character, 10000-character, Unicode, CJK, RTL and emoji input.
- Performance guardrail tests so a regression fails CI rather than shipping.
- Progressive Web App support: manifest, service worker registration, install banner, icons (standard and maskable), favicon, Apple touch icon.
- QR code sharing on the Finish screen, generated client-side.
- Voice input on the Start screen via the Web Speech API, hidden entirely when unavailable.
- Private, gamification-free session history: a log with resume and delete, capped at 20 entries, never transmitted.
- Settings modal with clear-history, clear-session, version and shortcut reference.
- Share dialog with the URL, a copy button, the QR code, and a plain statement of what the link does and does not contain.
- Internationalisation for English, Spanish and French, with per-key fallback to English. The checker lexicon remains English-only and this is documented.
- Deploy configurations for Netlify, Vercel, Cloudflare Pages, GitHub Pages, Docker and nginx, each with a Content-Security-Policy and a Permissions-Policy.
- Community health files: issue templates (bug, feature, accessibility), pull request template, CODEOWNERS, Dependabot policy, FUNDING.
- Documentation: ARCHITECTURE, DESIGN, RESEARCH, PITCH, JUDGES, DEMO, FAQ, METRICS, EVALUATION, DEPLOY, BENCHMARKS, PRIVACY, THREAT_MODEL, DATA_FLOW, GOVERNANCE, COMPARISON, CASE_STUDIES, USER_STORIES, LAUNCH, I18N, AGENTS, PLUGINS, PWA.
- README expanded to roughly 11,000 words with ASCII diagrams, tables and an accurate per-file test breakdown.

### Changed

- Test suite grew from 184 to 319 tests across 31 files.
- `manifest.webmanifest` now uses relative `start_url`, `scope` and icon paths so installation works on any host including subpath deployments. Added `id` and `display_override`.
- GitHub Actions bumped to `checkout@v7`, `setup-node@v7`, `upload-pages-artifact@v5`, `deploy-pages@v5`.
- Dependabot now ignores breaking major bumps of the pinned toolchain (react, react-dom, jsdom, vite, vitest, typescript, testing-library) so a fresh clone stays reproducible. Patch and minor updates are still proposed, grouped.

### Fixed

- GitHub Pages deployment failed because Pages was not enabled and because assets were referenced from the domain root while the site is served from a subpath. Both are fixed and the live site is verified.
- Removed `'just the'` from `STOP_MARKERS`: it collided with the banned-word test and `'only'` already covers the same stop-marker function.
- Corrected stale test counts in the README and launch documentation.

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
