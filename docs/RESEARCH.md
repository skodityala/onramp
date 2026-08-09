# Research

This document collects the research and reasoning behind Onramp's design decisions. It is not a literature review. It cites categories of findings and standards rather than specific papers, because the point of this document is to make our reasoning legible, not to perform scholarly rigor we have not earned.

If a claim in this document seems overreaching, please open an issue. We would rather remove a claim than defend one we cannot support.

## Scope

The scope of the research covered here is:

- Executive dysfunction, especially in students and young adults.
- The initiation gap and task-avoidance loops.
- Working memory and step-size effects on task performance.
- Task decomposition as a prior-art category.
- The evidence base on praise, gamification, and extrinsic motivators.
- Accessibility research relevant to a low-sensory design.
- Design-specific findings on background color, contrast, and reduced motion.

Out of scope: general productivity research on neurotypical adults, corporate task-management literature, and clinical treatment protocols for any specific diagnosis. Onramp is not a treatment plan and its design does not draw on treatment literature.

## Executive dysfunction in students

Executive dysfunction is a widely-observed set of difficulties with the self-management functions of the brain: planning, prioritisation, initiation, sustained attention, working memory, and self-monitoring. It is associated with a range of conditions including ADHD, autism spectrum, depression, anxiety disorders, traumatic brain injury, chronic illness, and grief; it also appears in neurotypical adults under stress, sleep deprivation, and cognitive load.

Students are a population where executive dysfunction has particularly high stakes. School and university environments assume a level of self-directed initiation that many students, especially neurodivergent students, do not have available. Interventions that reduce the initiation load, rather than demanding it, are consistently reported as more helpful than interventions that reward completion.

The research consensus in this area is that:

- Executive dysfunction is not a motivation problem.
- Executive dysfunction is not resolved by demanding more effort from the person experiencing it.
- Tools that decompose tasks and reduce the required first-step energy tend to be reported as helpful.
- Tools that add rules, scoring, or accountability structures often make things worse for the users who need help most.

Onramp is designed around the first three points and refuses the fourth.

## The initiation gap

The "initiation gap" is the interval between knowing what to do and beginning to do it. For neurotypical users, this interval is often unmeasurably short. For users with executive dysfunction, the interval can extend to hours, days, or indefinitely.

The mechanism is not "laziness." It is a set of interacting factors: task-set switching cost, the brain's aversion to novel high-effort states, the difficulty of loading a task's full context into working memory before beginning, and the anxiety-avoidance loop that grows the longer a task is deferred.

Two observations from the research base drove Onramp's design.

The first is that the initiation gap is not closed by clarity about the task. A user who fully understands what they need to do can still be unable to begin. Adding more description, more planning, or more clarity to the task does not help; sometimes it makes things worse by growing the perceived cost of beginning.

The second is that the initiation gap is closed by very small physical first steps. The step must be small enough that the initiation-avoidance loop cannot object to it, and physical enough that the body's beginning is unambiguous. "Think about the email" does not close the gap; "open the email and read only the subject line" does.

## Working memory and step size

Working memory capacity is limited in all humans and is often further reduced in users with executive dysfunction, especially under stress. A task decomposed into steps that exceed working memory capacity will fail at the point the user cannot hold the next step in their head.

The research suggests that:

- A single step, held in view, is more actionable than a list of steps held in memory.
- A step that requires more than one verb tends to fail; users complete the first verb and stall on the second.
- Steps bounded in time, especially with a short concrete bound, are more actionable than open-ended steps.

Onramp's decomposer enforces a single-verb-per-step rule and a sixty-second bound on the first step. These are not arbitrary; they are the operationalisation of the working-memory and step-size findings.

## Task decomposition as prior art

Task decomposition is not novel. It has decades of prior art in cognitive-behavioural approaches, occupational therapy, education, and productivity literature.

What is less common is a tool that:

- Does the decomposition work for the user, rather than teaching them to do it themselves.
- Enforces a hard bound on the first step.
- Refuses to add extrinsic motivators to the decomposition.
- Runs entirely on-device without a data collection loop.

Onramp's contribution is not the idea of decomposition; it is the specific bounds, refusals, and trust decisions that surround it. Any credit for the idea belongs to a large body of prior work.

## Why praise is not helpful

Praise is often assumed to be a low-cost, high-benefit addition to a tool. The research on praise in the specific context of executive-function-adjacent conditions is more nuanced.

Findings in this category include:

- Praise for effort rather than outcome is generally more helpful than praise for outcome, in some contexts.
- Praise from an anonymous or automated source is not reliably read as praise; it is often read as a form of surveillance or as sarcasm.
- Praise that the tool cannot verify (e.g., "great work!") reads as condescending when the user knows the tool has no way to assess their work.
- Praise contingent on completion creates a pressure to appear to complete, which can lead to abandonment when a user cannot honestly claim completion.

Onramp does not praise. It acknowledges the step ("Done. Next step.") and moves on. The acknowledgement is a functional confirmation, not a motivational device.

## Gamification harms

Gamification, in the productivity category, typically means adding streaks, points, levels, badges, leaderboards, or rewards to a tool. The general population evidence on gamification is mixed. The evidence for the population Onramp serves is not.

The specific harms observed in the research are:

- Streak-loss aversion is stronger than streak-gain motivation. A user who breaks a thirteen-day streak on a bad executive-function day experiences that break as a loss that dwarfs the small daily gains, and often abandons the tool.
- Extrinsic motivators displace intrinsic ones. A user who begins a task for a badge learns to depend on badges to begin tasks; when the badge is not present, the initiation gap returns and is often wider.
- Scoring creates comparison, and comparison creates a metric against which the user is always available to fail.
- Rewards attached to completion incentivise the user to redefine "complete" downward, or to abandon tasks that cannot be neatly completed.

Onramp refuses this category not as a design preference but as a research-driven decision. The refusal is enforced in the copy checker, the tests, and the review process.

## Accessibility research

Accessibility standards inform several specific decisions in Onramp. We draw on the general findings of the accessibility community without citing specific documents; the standards themselves (WCAG, ARIA authoring practices, and platform-specific guidelines) are the source of these decisions.

Specific decisions and their bases:

| Decision | Basis |
|---|---|
| Keyboard-first navigation | Keyboard-only users are a substantial minority; touch-only interfaces exclude them. |
| Visible focus ring | Focus is not optional; a hidden focus ring is an accessibility bug. |
| Reduced-motion default | Vestibular sensitivity affects a nontrivial portion of users; reduced-motion is the safe floor. |
| High contrast text | The WCAG guidance on contrast is a minimum, not a target. |
| No animation on focus change | Animated focus is often missed by screen readers and by users with certain cognitive profiles. |
| No focus trapping | Trapping focus removes the user's control; the user should always be able to leave. |
| One accent color | Colorblind users are served better by shape and position than by color; a single accent is enough. |

## Warm off-white backgrounds

The default background is a low-saturation warm off-white rather than pure white or pure gray. The reasoning is drawn from research and community practice in low-sensory design.

Pure white at high monitor brightness can be perceived as glaring, especially by users with photosensitivity, migraine, or certain neurodivergent profiles. Warm off-white reduces the perceived brightness at the same relative luminance. It also avoids the "clinical" affect of pure white, which for a task-initiation tool intended to reduce sensory load is a small but meaningful cue.

Pure gray backgrounds are neutral but tend to feel colder and, at lower contrasts, harder to read at length. The warm cast preserves readability while reducing sensory intensity.

We are not the first tool to make this choice; it is common in tools designed for reading, writing, and sensory-friendly interfaces.

## Reduced motion

Reduced motion is not an accessibility fallback in Onramp; it is the design floor. The full motion state is the ceiling.

The reasoning is straightforward. A meaningful fraction of users have vestibular sensitivities, motion-triggered migraines, or cognitive profiles for which non-essential motion is distracting or nauseating. These users are also disproportionately present in the audience Onramp serves. Designing the reduced-motion state first, and treating full motion as an addition, keeps the tool usable for the widest audience.

## Zero-click share links

The share link encodes the task and decomposition in the URL fragment. This is a design choice with a research-relevant basis.

Existing share flows in productivity tools typically require an account on both ends, or a signup wall, or a "accept this share" step on the recipient's side. Each of these is a barrier for the recipient, and the recipient is often the person the sender is trying to help.

A zero-click share means the recipient opens the link and sees the decomposition. No account, no accept, no confirm. The trust model is "the sender." This is the model that most matches how users actually share help with each other, and it is the model that respects the recipient's time and attention.

## Limitations of our evidence base

We are explicit about what our evidence base does and does not support.

### What it supports

- The general finding that executive dysfunction is a distinct set of difficulties.
- The general finding that task decomposition helps.
- The general finding that gamification and extrinsic motivators can harm the audience we serve.
- The general finding that low-sensory design is preferred by many neurodivergent users.
- The general accessibility findings around keyboard, motion, and focus.

### What it does not support

- A specific claim that Onramp's decomposer is more helpful than a specific competitor's.
- A specific claim about task completion rates for users of Onramp.
- A specific claim that Onramp reduces the initiation gap by a specific amount.
- Any claim about clinical outcomes.

We do not have data on any of these, because we do not collect data. Our evidence is that the design decisions are consistent with the research base and that the tool behaves as described.

## What would count as validation

The following would count as evidence for or against Onramp's design decisions.

| Type of evidence | For | Against |
|---|---|---|
| User self-report | Users reporting that Onramp helps them start tasks they would otherwise avoid. | Users reporting that Onramp does not help, or that it makes starting harder. |
| Qualitative study | A structured interview study showing that the seven-rule decomposer produces steps users find actionable. | The same study showing the produced steps are frequently rejected by users as too small or too large. |
| Accessibility audit | An external audit confirming that the sensory floor meets or exceeds published guidelines. | The same audit identifying regressions we should fix. |
| Longitudinal use | Users reporting continued use over months without adverse effects. | Users reporting that continued use created dependency, learned helplessness, or a false sense of progress. |
| Comparative study | A comparative study against a productivity tool that includes gamification, showing that Onramp's refusal-based design is preferred by the audience of interest. | The same study showing that gamification is preferred in this audience, contradicting the current research consensus. |

None of these studies have been conducted on Onramp specifically. We are not going to design a study to conduct on ourselves; that is a job for an external researcher, and we welcome that work.

## Category references

Where a research finding is cited above, it is cited to a category rather than to a specific paper. The categories are:

- Executive dysfunction and ADHD research literature.
- Working memory and cognitive load research.
- Task decomposition research in cognitive-behavioural and occupational therapy contexts.
- Praise and motivation research, including the intrinsic-versus-extrinsic literature.
- Gamification research, especially studies on the neurodivergent population.
- Accessibility standards, including WCAG and ARIA authoring practices.
- Low-sensory design and reading-tool design communities.
- Vestibular and photosensitivity research relevant to motion and background choices.

For each category, the research is broad enough that summarising a specific paper would misrepresent the state of the field. We prefer to cite the category and let a reader who wants specifics conduct their own review.

## A note on invented citations

We have not invented any specific citations in this document. If you find a claim in this document that appears to be attributed to a specific paper, that is a bug; please open an issue. Our claims are attributed to categories of findings and to widely-known standards, and we intend to keep them that way.

The reason we are careful about this is that the productivity category is full of tools that cite research they have not read, and the citations wither the first time a skeptical reader looks at them. We would rather cite less and be honest than cite more and be exposed.

## Reading list

If you want to explore the research base yourself, the following categories are the ones we would start with. These are not specific documents; they are search terms.

- "Executive function and initiation deficits"
- "Task decomposition and working memory"
- "Praise and intrinsic motivation" (the Self-Determination Theory literature)
- "Gamification harms in ADHD populations"
- "Reduced motion accessibility"
- "Low-sensory design for neurodivergent users"
- "Zero-click sharing and trust models"

A search engine and a public library will get you further than we can here.

## Closing note

Onramp is a designed object. Every design decision is an interpretation of the research base, and every interpretation is a judgement call. If our judgement is wrong on any specific point, we would rather hear about it and change than defend a position we cannot support. Please open an issue, and please cite what you have read; we will read it too.
