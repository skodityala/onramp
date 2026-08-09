# Benchmarks and Property Tests

This document explains the performance benchmarks and property/fuzz test suites
that guard the Onramp core. The intent is a safety net against regressions, not
a marketing claim. Numbers here are illustrative targets derived from the
design; real measurements will vary by machine.

## What the benchmarks measure

Two files under `bench/` exercise the pure core with vitest's `bench` mode.

`bench/checker.bench.ts` calls `checkAtomicity` on three shapes of input:

- **short input** — one atomic sentence like "Open the laptop." Exercises the
  common-case path where R1..R7 all return early.
- **typical assignment** — a realistic student prompt with multiple barriers.
  Exercises the full rule chain plus regex-based word-boundary matching.
- **long input (2000 chars)** — a pathological 2000-character string built by
  `'x'.repeat(2000)`. Confirms the regex passes over long input stay linear.

`bench/decompose.bench.ts` calls `buildTree` twice:

- **essay assignment** — hits a substring-matched template. Fast path: the
  tree comes from a canned expansion.
- **unmatched assignment** — no template applies, so decomposeStep runs every
  strategy from S1 through S7 and recurses until leaves are atomic or depth
  reaches MAX_DEPTH.

## Expected performance

The following table lists design targets, not measured numbers. Real timings
depend on hardware, Node version, and warmup. Numbers are expected orders of
magnitude, useful as a shape check.

```
Operation                          | Expected time
short input to checkAtomicity      | <0.1 ms
typical assignment                 | ~1 ms
long input (2000 chars)            | ~5 ms
buildTree essay                    | ~3 ms
buildTree unmatched                | ~2 ms
```

A useful mental model: the checker is O(n) in input length with a small
constant per rule; the decomposer is O(nodes) where nodes is bounded by
MAX_DEPTH (6) and the branching factor of decomposeStep (typically 2 to 4).

## How to run

```
npm run bench
```

This invokes `vitest bench` which discovers `bench/*.bench.ts`, warms each
`bench()` block, then runs it repeatedly and reports ops/sec plus mean, min,
max, p75, p99, and rme (relative margin of error). Read the mean and rme first
and treat single-run differences under 10% as noise.

To run only one file:

```
npx vitest bench bench/checker.bench.ts
```

## Why the benchmarks exist

The checker and decomposer are on the interactive path. If either regresses
into the tens of milliseconds, the UI will stutter when the user types. The
benchmarks exist so that a regression shows up as a shape change in ops/sec,
not as a bug report from a user with a slow laptop. They are not a promise of
absolute speed on any given machine.

Additionally, an existing `src/core/__tests__/bench.test.ts` file asserts loose
time thresholds inline. Those are safety-net assertions that run in the normal
test suite; the files under `bench/` are the more granular vitest-bench
version, useful when tuning or investigating a regression.

## How to interpret a regression

1. Run `npm run bench` on the current branch and on `main`.
2. Compare the mean of each `bench()` block. Ignore differences smaller than
   the rme.
3. If a real regression appears, look at the diff for the file that owns the
   affected code path. The checker's hot loop is the R1..R7 rule chain in
   `src/core/atomicity.ts`; the decomposer's hot loop is `buildTree` iterating
   the queue in `src/core/decompose.ts`.
4. Do not tune benchmarks to make them pass. Fix the code path.

## Property tests

Adjacent to the benchmarks, three property-test files under
`src/core/__tests__/` exercise the same code with random inputs and structural
assertions:

- `atomicity.property.test.ts` — checkAtomicity never throws, `atomic` iff
  barriers is empty, explanations and hints track barrier count, score is in
  [0, 1], R1..R7 order is preserved, and repeated calls are deep-equal.
- `decompose.property.test.ts` — every leaf is atomic or at MAX_DEPTH, tree
  size stays under 500 nodes, depth is bounded, buildTree is deterministic,
  children never exceed parent seconds, and no step is orphaned.
- `fuzz.adversarial.test.ts` — targeted attacks with unicode, whitespace,
  emoji, RTL text, extreme length, and stop-word-only strings.

These run as part of the normal `npm test` suite. They exist for the same
reason as the benchmarks: to notice when a change breaks a load-bearing
invariant, before a user does.
