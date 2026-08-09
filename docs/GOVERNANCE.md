# Governance

Onramp is a small project with a clear point of view. This document describes
how decisions get made, who makes them, and how disagreements are handled. It
is deliberately short. If it grows past two pages, something has gone wrong.

## 1. Decision-making structure

Onramp has one maintainer and an informal accessibility advisory circle. The
maintainer holds the commit bit and the final say on merges. The advisory
circle is a rotating group of neurodivergent students, educators, and
accessibility practitioners who review proposals when asked. Their input is
weighted heavily but is not binding. There is no board, no steering committee,
and no voting.

## 2. Decisions that need broad input

Some changes are load-bearing enough that the maintainer will not make them
alone. Before merging, the maintainer will open a design discussion issue,
invite the advisory circle, and wait at least seven days for feedback. These
changes are:

- Architectural changes to anything under `src/core` (the atomicity checker,
  decomposer, lexicon, templates).
- Changes to the seven-rule atomicity checker (adding, removing, or
  materially altering a rule).
- Changes to the banned-word list in `src/copy.ts` or the copy tests.
- Changes to the threat model or the refusal list in `docs/DESIGN.md`.

## 3. Decisions the maintainer makes alone

For everything else, the maintainer merges without ceremony. This includes:

- Bug fixes that do not change behavior visible to the design docs.
- Documentation improvements, typo fixes, and clarifications.
- Adding new templates or physicalisations that follow existing patterns.
- Non-breaking view polish (spacing, contrast tweaks, focus rings).
- Dependency updates and CI changes.

If a contributor is uncertain which bucket a change falls into, they should
ask in the PR. The maintainer will move it to the broad-input track if needed.

## 4. Conflict resolution

When there is disagreement about whether a change belongs in Onramp, the
design documents are the referee. In order of precedence:

1. `docs/DESIGN.md` (the refusal list and rationale).
2. `docs/THREAT_MODEL.md` (what adversaries the product resists).
3. `docs/RESEARCH.md` (the evidence base).

Any change that contradicts these documents needs the document itself updated
first, with the reasoning written down. This keeps the project honest: we do
not change the philosophy quietly through code, we change it visibly through
prose and then let the code follow.

If a disagreement cannot be resolved by pointing at the docs, the maintainer
decides. There is no appeal process. Contributors who find this unworkable
are encouraged to fork (see section 7).

## 5. Adding a maintainer

A second maintainer will be added when someone has contributed high-quality
code and design thinking over at least three months, and their contributions
show alignment with the design philosophy (the refusals, the accessibility
lens, the willingness to say no to feature requests). The founding maintainer
proposes, the advisory circle reviews, and the founding maintainer decides.

## 6. Removing a maintainer

The founding maintainer can remove any other maintainer unilaterally. No
public post-mortem is required. This is a small project and drama is not a
useful currency here.

## 7. Fork policy

The code is MIT-licensed. Fork it freely, modify it, ship it, sell it. Two
requests, neither legally binding:

- If your fork adds gamification, telemetry, streaks, points, badges, or
  account signup, please do not call it Onramp. The name is meant to signal
  a specific set of refusals, and a fork that removes those refusals is a
  different product.
- If your fork improves the atomicity checker or the decomposer, please
  send a PR upstream. Everyone benefits.

That is the whole governance model. If you have questions, open an issue.
