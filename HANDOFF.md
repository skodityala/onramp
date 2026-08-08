# Handoff notes for the second agent

This repository was built by an agent whose sole job was to write code and
tests. Every integration - deployment, hosted model, analytics, domain, and
anything else that touches the outside world - is your job, not theirs.

## What is deliberately not integrated

### `src/adapters/llm.ts`

Implements the gating loop. Currently guarded by `llmEnabled()`, which checks
two env vars:

- `VITE_LLM_ENDPOINT`
- `VITE_LLM_KEY`

To wire a real model, set both and adapt `ask()` to your provider's response
shape. The current shape expects `{ steps: [{ text, seconds }] }` in the
response body.

**Do not remove the gating loop.** The product's central claim is that the
checker overrules the model, and the audit panel renders exactly that. Removing
the gate removes the claim.

**Never send the student's name or any identifier.** Only the assignment text.

### `src/adapters/storage.ts`

Implements local persistence behind three functions. If you later want sync,
replace the bodies and keep the signatures. Nothing else in the app touches
`localStorage`.

## Deployment

There is none, by design. The build output is a static bundle from `npm run
build`. Any static host serves it. No server, no environment needed at
runtime. Suggested: Cloudflare Pages, Netlify, Vercel static, GitHub Pages.

## Analytics

Deliberately absent. If you add any, it must be opt-in and it must not
transmit assignment text, which is schoolwork belonging to a minor in many
cases.

## Things you must not undo

- The absence of a progress bar, step counter or outline view. It is the
  product thesis and it is enforced by `one-step.test.tsx`.
- The banned word list. It is enforced by `copy.test.ts`.
- The purity of `src/core/`. Adding a network call there breaks every test.

## Known limits to disclose, not hide

- Time estimates are heuristics rather than measurements.
- The template library covers about thirty assignment shapes and falls back to
  generic rules outside them.
- English only.
- Not a diagnostic tool. Not a replacement for support.

## Testing after your changes

```bash
npm run typecheck && npm test && npm run build
```

CI runs the same three commands. Do not merge red.
