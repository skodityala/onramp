# For Judges

This document is written for the person who has thirty projects to score in an afternoon. It is designed to be read in five minutes, tested in two commands, and defended by five sentences. If you are a judge, thank you for your time. Here is how to spend it.

## The two-command test

The whole project can be evaluated from a clean clone with two commands:

```
npm install
npm test && npm run dev
```

The first command produces a dev-only dependency tree. There are no runtime dependencies. If you inspect `package.json`, you will find an empty `dependencies` block. That is intentional and it is enforced by a test.

The second command runs the full test suite (this should complete in a few seconds) and then starts the development server. When the tests pass and the server binds to a port, open the printed URL in a browser. That is Onramp.

If you have exactly ninety seconds and can only do one thing: run `npm test`. Read the file names in the output. They read as sentences. The specification of the tool is legible from the test names alone.

## What to press

Once the app is open, here is a five-minute walk-through that exercises the whole product.

| Step | Action | What you should observe |
|---|---|---|
| 1 | Type "reply to my landlord about the leaking sink" into the task field. | A first physical step appears. It is a single sentence, and it is something a body can do in under a minute. |
| 2 | Press the confirm key (Enter or Space). | The next step appears. The previous one leaves the DOM entirely; only one step is ever active. |
| 3 | Continue through the sequence. | Each step remains under sixty seconds and physical. No praise strings appear at any point. |
| 4 | Press the audit shortcut (documented in the on-screen key map). | A debug panel opens showing which of the seven rules fired to produce the current step. |
| 5 | Press the share shortcut. | A URL is copied to the clipboard. Paste it in a new tab. The same decomposition loads with no network request beyond the initial page load. |
| 6 | Toggle your operating system's reduced-motion setting on. | Reload. All non-essential motion is now absent. This is the default state; the previous state was the ceiling. |
| 7 | Disconnect from the network. | Reload. The app continues to work. It is a static site and it holds nothing off-device. |
| 8 | Open the browser dev tools, Network tab. | Confirm that after the initial page load, no request is made. Ever. |

Total time: about five minutes. If you do only steps 1 through 3, you have seen the product. Steps 4 through 8 are for the skeptic.

## What to look under the hood

If you are a technical judge and you want to spot-check the claims, here are the highest-signal files. Total reading time is under fifteen minutes.

| File | What to look for | Why it matters |
|---|---|---|
| `src/core/copy-check.ts` | The seven-rule copy checker. | The list of banned words is here. The rules are short and readable. |
| `src/core/decomposer.ts` | The task-to-steps function. | Rule-based, deterministic, no ML dependency. |
| `src/core/state.ts` | The state machine. | Explicit states, explicit transitions. No hidden state. |
| `src/core/__tests__/copy.test.ts` | Copy tests. | Reads as a specification of what the tool will and will not say. |
| `src/core/__tests__/refusal.test.ts` | The refusal invariants. | Asserts that no scoring, tracking, or telemetry module exists. |
| `src/ui/render.ts` | The renderer. | One-step guarantee is enforced structurally. Read the top of the file. |
| `package.json` | The dependency list. | Empty `dependencies` block. Dev-only toolchain. |
| `CHANGELOG.md`, `Refused` section | The list of things we said no to. | This is the most load-bearing document in the repo. |

If you have time for only one of these, read `CHANGELOG.md` under the `Refused` heading of the 1.0.0 release. A project that records what it declined to build has thought about the shape of the product; a project that has an empty roadmap doc has not.

## What we refuse to build and why

The following table is not a wishlist. It is a list of things a reasonable person has proposed and we have declined. Each row is a decision we would defend under cross-examination.

| Proposal | Refused because |
|---|---|
| Streak counter | Extrinsic motivator; harms the users we most want to serve. |
| Points, levels, badges, rewards | Same category. Enforced by the copy checker. |
| Praise strings after a step | The copy checker rejects them; the seven rules ban them. |
| Backend and accounts | No account, no wall, no funnel. Trust model stays simple. |
| ML-based decomposer | Not inspectable, not testable, creates a data-collection incentive we refuse. |
| Analytics or telemetry | We do not measure the user. |
| Teacher or manager dashboard | Surveillance surface; violates the trust model. |
| "Hard mode" that hides scaffolding | The scaffolding is the product. |
| Motion beyond the sensory floor | Reduced-motion is the floor, not a fallback. |
| Third-party fonts or CDN requests | Zero third-party requests at runtime. |

If a judge asks "why did you not add X," and X is in the table above, the answer lives here.

## The five sentences that matter

If you take away only five sentences from Onramp, take these.

1. Onramp closes the initiation gap, the moment between knowing what to do and doing it, which for neurodivergent users can consume an entire afternoon.
2. The first step is physical, verifiable, and under sixty seconds, because those three constraints together are the entire mechanism.
3. The decomposer is seven rules in a single file, inspectable in a debug panel, defensible under audit, and covered by tests.
4. We refuse streaks, points, badges, praise, and tracking, because the evidence base for those in this audience is negative, not mixed.
5. There is no backend, no account, no third-party request at runtime, and no data collection of any kind; this is a trust decision, not a technical shortcut.

Those five sentences are the pitch. Everything else is scaffolding.

## What to look for

When you evaluate Onramp against other projects, here are the criteria we would use if we were in your chair.

### Coherence of refusals

A project's list of things it will not do is a stronger signal than its list of things it did do. The `Refused` section of the changelog is where to look. If a project has never said no to anything, it has not made a design.

### Tests as specification

Look at the test names. If they read as sentences that describe the product, the tests are doing the work of a spec. If they read as internal function names, the tests are decoration. Ours are the former.

### Copy discipline

Read three random strings from the source. If they are calm, short, and unassuming, the copy has been reviewed. If any of them contain a banned word (see `CONTRIBUTING.md` for the list), the checker has a bug and we would want to know.

### Dependency hygiene

Open `package.json`. Count the entries under `dependencies`. If the count is zero, the project has taken supply-chain seriously. If the count is fifty, ask what happens when one of them ships a compromised update.

### Offline behaviour

Disconnect your laptop from the network and reload the app. If it still works, the project has taken privacy and trust seriously. If it does not, it has not.

### Accessibility

Use the app with keyboard only. Use it with your operating system's screen reader for one minute. Toggle reduced-motion. If any of these fail, the project has treated accessibility as an afterthought.

### Explicitness about limitations

Does the project's documentation say what it does not do, or does it hedge? A project that claims to help everyone helps no one. Look for a specific audience and a specific mechanism.

## What we are not claiming

For the judges who are being cautious in the other direction, here is what we are not claiming.

We are not claiming Onramp treats a condition. We are not claiming Onramp replaces therapy, coaching, medication, or any other clinical intervention. We are not claiming Onramp works for every task, every user, or every day. We are not claiming Onramp is novel in the sense of "no one has ever tried decomposition before"; task decomposition has decades of prior art. What we are claiming is that Onramp is the version of the tool that respects the audience and refuses the categories that harm them.

If you want to read our hedges in full, `docs/RESEARCH.md` has the limitations of our evidence base and what would count as validation.

## Questions we expect

The questions we hear most often at demo tables, and where the answers live.

| Question | Answer lives in |
|---|---|
| How is this different from a to-do list? | `docs/PITCH.md`, 3-minute pitch, mechanism paragraph. |
| Where is the AI? | `docs/FAQ.md`, "Why no ML core." |
| How does this scale? | `docs/FAQ.md`, "Scaling." |
| Is this therapy? | `docs/FAQ.md`, "Therapy replacement question." |
| Why no dark mode? | `docs/FAQ.md`, "Dark mode." |
| Where is the teacher dashboard? | `docs/FAQ.md`, "Teacher dashboard." |
| How do you make money? | We do not. See `LICENSE` and `docs/FAQ.md`. |
| Why no signup? | `docs/FAQ.md`, "Signup wall." |
| Why one accent color? | `docs/DESIGN.md`, "Accent color." |

## A final note

We are not asking you to rank Onramp above every project you see today. We are asking you to notice that we made choices, that we can defend them, and that the choices point at a coherent product for a specific audience. Whatever you decide, please tell us what you thought was weakest. That is worth more to us than a placement.

Thank you for reading this far.
