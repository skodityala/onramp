# Metrics

Onramp measures one thing and reports one plain sentence. This document
explains why the metric surface is so narrow, what we refuse to measure and
why, and what an outside researcher would collect if they wanted to study the
product's efficacy. Every decision in this document was made to keep Onramp
from turning into a game that we play against the user.

## 1. What Onramp measures

Onramp records exactly one signal per step: `msToFirstInput`. It is computed
as the delta between two `performance.now()` calls. The first is taken when
the step surface becomes interactive. The second is taken when the user
enters the first character into the typing surface for that step. The
subtraction yields a millisecond count, and that count is written to
`session.timings` on the current session record.

There is no ceremony around this. No batching, no smoothing, no rolling
average. The raw millisecond value goes into the session record and stays
there for the lifetime of the session. When the session is cleared, the
value is gone with it.

The design rationale for measuring so little is that every additional
metric is a lever the product would then be tempted to pull. If we recorded
how many steps a user finished per session, we would eventually optimise
for that number. If we recorded how many times the Smaller button was
pressed, we would begin to reason about whether "more Smallers" or "fewer
Smallers" was better and drift toward one or the other. Neither of those
is a question the user asked us to answer. The user asked us to help them
start. The only signal that speaks to that request is time from surface
to first keystroke.

`msToFirstInput` is a floor on effectiveness. It cannot tell us whether the
user solved the assignment, whether they enjoyed the process, or whether
they will come back. It can tell us that the user did in fact begin. That
is all we claim to observe.

## 2. What Onramp does NOT measure

The following is an explicit list of things Onramp does not measure. Each
refusal has a rationale. None of these are on a roadmap. They are not
"missing"; they are absent by design.

- **Total session time.** We do not record how long a user spent in the
  app. A metric that goes up when people linger biases the product
  toward stickiness for its own sake, which is the opposite of what a
  starting tool should do. If Onramp works, the user leaves quickly and
  returns to the real work.
- **Number of Smaller presses.** We do not count how many times a user
  asks the decomposer to go deeper. Counting this would create a bias in
  future product decisions toward either fewer Smallers (looks efficient)
  or more Smallers (looks engaged), neither of which reflects whether the
  user was helped.
- **Click-through rate.** No button emits an event we retain. No dwell
  time on any surface is recorded. The concept of a click-through rate
  does not exist inside the app.
- **Session count.** We do not know how many sessions any user has run.
  There is no user identifier and no session counter that survives a
  session boundary. A user who runs Onramp a hundred times is
  indistinguishable from one who ran it once.
- **Task completion rate as a percentage.** We deliberately do not compute
  the fraction of started sessions that reach the Finish screen. Reporting
  a percentage would imply that reaching Finish is a success and leaving
  early is a failure. Both outcomes are valid. A user who found their
  first step and left to do the work has succeeded.
- **Correlations between assignment text and behaviour.** We do not
  analyse the assignment text against any behavioural signal. Doing so
  would require retaining the assignment text alongside the behaviour,
  which we do not do. It would also invite the product to specialise its
  interventions on the kinds of assignments that produce the strongest
  behavioural signal, rather than the kinds of assignments that most need
  help.

## 3. The one number we show

On the Finish screen the user sees two plain sentences, drawn from the
session record:

```
You started N times.
You started each step in about N seconds.
```

The first N is the count of steps where a first keystroke was captured.
The second N is the median of `msToFirstInput` across those steps,
rounded to the nearest second.

The philosophy behind this line is that a plain factual record is not a
score. There is no target the user is being asked to beat. There is no
comparison with any other user. There is no comparison with the user's
own past sessions, because we do not retain them across a session
boundary. The two sentences are a mirror, not a scoreboard.

If the user finds the number useful, they can copy it and paste it wherever
they want. Nothing else happens with it.

## 4. Local-only storage

Every measurement lives in the current session record, in memory, and is
persisted to `localStorage` only under the single key `onramp.session.v1`.
Nothing is written anywhere else. Nothing is sent anywhere. Clearing site
data in the browser removes the record; there is no shadow copy.

The `session.timings` field is an array of `{ stepId, msToFirstInput,
msToDone }` records. When the user opens DevTools and inspects the value,
they see exactly what the app sees. There is no obfuscation, no encoding,
no encrypted blob. If the user does not like what is there, they can
delete the key from `localStorage` and the record is gone.

## 5. What a research team would measure

Onramp does not have a research programme baked into it. If a research
team wanted to study whether Onramp helps people start, they would build
a small separate study framework that lives outside the product. What
follows is a sketch of what that framework would collect, with consent,
under an appropriate ethics review.

- Time-to-first-keystroke on the assignment task WITHOUT Onramp, as a
  baseline. Participants receive the assignment in their usual writing
  environment and the researcher records the time from surface ready to
  first character.
- Time-to-first-keystroke on the assignment task WITH Onramp. Same
  participants, same class of assignment, different session.
- Delta per participant. The paired difference is the primary quantity.
- A short subjective report at the end: "did the tool help you start?"
  with answers restricted to yes / no / somewhat.

Study protocol (imagined):

```
+------------------+
| recruit N        |
| consent, brief   |
+--------+---------+
         |
         v
+--------+---------+       +------------------+
| assign order:    +-----> | arm A: baseline  |
| A/B or B/A       |       | (no Onramp)      |
+--------+---------+       +--------+---------+
         |                          |
         v                          v
+------------------+       +------------------+
| arm B: Onramp    |       | record t1        |
| (with tool)      |       |                  |
+--------+---------+       +--------+---------+
         |                          |
         +------------+-------------+
                      v
             +--------+---------+
             | subjective form  |
             | yes / no / some  |
             +--------+---------+
                      |
                      v
             +--------+---------+
             | analyse deltas   |
             | write up         |
             +------------------+
```

The point of sketching this here is to make plain that Onramp is not the
place where this study lives. Product code and study code are separated
so that the product does not learn to serve the study's numbers.

## 6. Anti-metrics: things we deliberately avoid

- **Total time users spent in the app.** A rising line here would tempt
  us to add features that keep users in the app. That is the kind of
  incentive that pulls a product away from serving the user's real work.
- **Number of assignments processed per user.** A rising line here would
  tempt us to encourage bulk use. Bulk is not the goal. One good start
  per assignment is the goal, and one good start is enough.
- **Depth of decomposition per session.** A rising line here would tempt
  us to make the decomposer produce more steps so that our number goes
  up. This is a direct incentive for the tool to make more work for
  itself, which is a betrayal of the user's request to reduce their work.

Each of these is measurable in principle. None are measured in fact. If a
future contributor proposes to add one, they should read this section
first and produce a written rebuttal to the rationale above.

## 7. Metric integrity

The checker's determinism is itself a metric of integrity. Given the same
step text and the same seconds budget, the checker returns the same
verdict every time. There is no random seed, no temperature, no time-of-
day drift. This is not a claim; it is a property enforced by 108 test
cases in the atomicity suite. If a contributor changes the checker in a
way that breaks determinism, the tests fail and the build stops. The
compliance record is the passing test count on the current branch.

Determinism is a metric because it is the property that lets an outside
reviewer verify anything at all. A non-deterministic checker cannot be
audited; a deterministic one can.

## 8. Reporting

Onramp reports nothing to us. There is no ping home on page load. There
is no crash log sent to any server. There is no telemetry channel of
any kind. If you find a bug, you must open an issue in the repository;
we have no other way to know.

This is a hard property, not a default that can be flipped. There is no
`REPORT_METRICS=true` environment variable that would turn reporting on.
Adding one would require a code change, a review, and a release, and
would be visible in the diff.

| Metric              | Where              | Retained?               |
|---------------------|--------------------|-------------------------|
| msToFirstInput      | session.timings    | Yes (localStorage)      |
| msToDone            | session.timings    | Yes (localStorage)      |
| sessionCount        | -                  | Not measured            |
| totalTimeInApp      | -                  | Not measured            |
| featureUsage        | -                  | Not measured            |
| clickThroughRate    | -                  | Not measured            |
| smallerPresses      | -                  | Not measured            |
| completionPercent   | -                  | Not measured            |
| assignmentText      | session.assignment | Yes, local, per-session |
| userIdentifier      | -                  | Does not exist          |

The right-hand column tells the whole story. Two rows say "Yes
(localStorage)". Everything else is either not measured or does not
exist. That is the metric surface of Onramp in full.
