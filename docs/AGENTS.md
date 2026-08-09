# Agents

## The Onramp Agent Framework

Onramp's decomposition pipeline is written as a small multi-agent system. Each Agent has a name, a description, and a `run(input, ctx)` method. Agents compose via the Orchestrator. This document is a reference for building new agents and understanding the existing four.

The framework is deliberately minimal. There is no message bus, no queue, no async task scheduler. Agents are plain TypeScript functions with typed inputs and outputs, wrapped in an object that gives them identity and a place to declare intent. The value of the framework is not machinery; it is the contract that every agent must follow, and the fixed pipeline that composes them.

If you have worked with heavier multi-agent frameworks, this will feel small. That is intentional. The pipeline runs on every keystroke in some UI paths, so any overhead compounds. Keeping the framework tiny means the checker can veto in under a millisecond and the whole decomposition round-trip stays within a single frame.

## The four built-in agents

### Checker

Wraps `checkAtomicity`. Has final authority over step acceptance. Never proposes; only accepts or rejects. The Checker runs the seven atomicity rules and returns a structured result: accepted, or rejected with a reason code. Rejection reasons are stable strings so downstream tooling can key off them.

The Checker is pure and synchronous. It does no I/O. It does not call an LLM. It is the one component in the pipeline whose behaviour must never depend on network availability or model temperature.

### Decomposer

Wraps `decomposeStep`. Produces 2-4 children from a non-atomic step. Deterministic. The children are each checked before entering the tree. If a child fails the Checker, the Decomposer runs again on that child, up to `maxReflections` times. If a child still fails after the retry budget is spent, it is surfaced to the audit trail as a decomposition failure rather than silently dropped.

The Decomposer is the seam where a future LLM-backed variant can slot in. The current implementation is rules-based and offline-capable. An LLM variant would implement the same `Agent<DecomposeInput, Step[]>` shape and be gated behind `config.llmEnabled`.

### Critic

Reads a step and its parent, produces the audit rationale that the UI's audit panel renders. Pure; no LLM. The Critic exists so the audit panel has something structured to render without the Checker or Decomposer having to know about presentation. Separating the rationale generator from the decision maker keeps the Checker's output narrow and stable.

### Coach

Optional. Off by default. When enabled, produces at most one neutral factual sentence per session (e.g. "One step in progress."). Never praises. Never evaluates. Silence is the default.

The Coach is the most constrained agent in the system. Its banned-word list is enforced by a unit test that fails the build if any coach output contains a banned token. If you find yourself wanting the Coach to say more, that is a signal to reconsider the requirement, not to loosen the constraint.

## The Orchestrator

The Orchestrator runs the pipeline in a fixed order:

```
Checker -> (if not atomic) Decomposer -> Checker on each child ->
  Critic (for the audit panel) -> Coach (optional, factual)
```

Not a general DAG scheduler. The pipeline is fixed because the product's guarantees depend on the ordering. If the Critic could run before the Checker, the audit rationale could contradict the final decision. If the Coach could run before the Critic, a factual observation could be based on a step that was later rejected. The fixed order removes an entire class of bugs.

The Orchestrator returns an `OrchestrateOutput` shape containing the final tree, the audit rationale, the optional coach line, and the raw event array.

## The AgentContext

The context passed to each agent has:

- `ids`: an injectable id generator
- `session`: current session (null before any assignment)
- `config`: runtime configuration
- `log(event)`: append to the audit trail
- `now()`: injectable clock

Everything an agent needs from the outside world comes through the context. This is what makes agents testable: pass a fake context, get deterministic output. The two injectable primitives (`ids` and `now`) exist so that snapshot tests can assert on stable output.

## Adding a new agent

An agent has this shape:

```ts
export const MyAgent: Agent<MyInput, MyOutput> = {
  name: 'my-agent',
  description: 'One-sentence purpose.',
  run(input, ctx) {
    ctx.log({ agent: 'my-agent', kind: 'start', at: ctx.now() });
    const result = doWork(input);
    ctx.log({ agent: 'my-agent', kind: 'end', at: ctx.now(), payload: { size: result.length } });
    return result;
  },
};
```

The `name` field is the identifier used in event logs and in `Orchestrator.describe()`. It should be kebab-case and stable across releases; tools consuming the audit trail may key off it.

The `description` is a single sentence explaining the agent's purpose. It is surfaced in the debug UI and in the output of `Orchestrator.describe()`. Write it for a future maintainer who has never seen the code.

## Rules for new agents

1. **Purity by default.** Agents in src/agents/ should not do I/O unless they wrap an adapter. Adapters live in src/adapters/ and are injected via context.
2. **Silence over speech.** Coach-like agents that surface text to the user must default to null. Speaking is expensive.
3. **Never praise.** Every user-facing agent must respect the banned-word list. The list is enforced by a test that scans agent output against a fixture of common inputs.
4. **The Checker is authoritative.** No agent may bypass or override the checker. If you find yourself needing to, the correct move is to add a rule to the checker, not to route around it.
5. **Deterministic given a fixed context.** Random agents must accept the RNG via context. This keeps snapshot tests stable and makes production incidents reproducible.

## Configuration

`AgentConfig` fields:

```ts
maxReflections: 2       // for future LLM decomposers with retry
enableCoach: false      // off by default
enableCritic: true      // on by default
llmEnabled: false       // gated by env vars
```

Config is read once per orchestration run. Do not mutate it mid-pipeline; if you need to change behaviour dynamically, model it as a new agent, not as a config flag toggle.

## Events

Every agent emits `start` and `end` events with `at` timestamps. The orchestrator collects them into an array returned in the `OrchestrateOutput.events` field. This is the raw audit trail; the UI's audit panel renders a curated view of it.

Events are append-only. There is no update or delete. If an agent needs to correct itself, it emits a second event with a `kind` that indicates supersession. Downstream consumers can fold the event stream into a final state; the framework does not do this folding for them.

Payloads are small on purpose. If you find yourself wanting to log a full tree in an event payload, log an id instead and let consumers resolve it against the tree in `OrchestrateOutput`.

## Introspection

`Orchestrator.describe()` returns the pipeline agents in run order. Useful for debugging and for a future UI that visualises the agent lattice. The output shape is stable: an array of `{ name, description }` objects, ordered by execution position. New agents inserted into the pipeline appear in the correct slot without any change to the caller.
