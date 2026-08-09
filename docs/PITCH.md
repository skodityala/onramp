# Onramp Pitches

This document collects the three pitches we use in different rooms. They are the same story at three lengths. The 30-second version is a hook. The 3-minute version is a demo. The 10-minute version is a defense.

Each pitch is followed by a short note on why it wins in the room it was written for.

## The 30-second pitch

Onramp is a task-initiation tool for people whose brains resist starting. The user types what they cannot start. The tool returns a first physical step that takes under sixty seconds and that a body can do in the room they are in. No accounts. No streaks. No praise. No tracking. It runs entirely in the browser and works offline. It is the shortest possible distance between "I cannot begin" and "I have begun."

That is the whole pitch. If a person hears that and their eyes light up, they are the audience. If a person hears that and asks where the leaderboard is, they are not, and no amount of iteration is going to change that.

## Why the 30-second pitch wins

The 30-second pitch is for a hallway, an elevator, a coffee line, or the first minute of a hackathon judging round where the judge is still deciding whether to keep listening. It has to do four things in that window: name the problem, name the audience, name the mechanism, and name the refusals.

The problem is executive dysfunction, specifically the initiation gap. We do not use those words in the pitch because most audiences do not need the vocabulary and the ones who do will hear it in "cannot start." The audience is people whose brains resist starting. This includes but is not limited to ADHD, autism, depression, chronic illness, and grief. We deliberately do not name a diagnosis, because the tool does not require one.

The mechanism is a first physical step in under sixty seconds. This is the entire product in one clause. Everything else is scaffolding around that.

The refusals matter as much as the features. "No accounts, no streaks, no praise, no tracking" is a chorus, and the chorus is the differentiator. Every other tool in the productivity category has at least three of those. We have none of them. A judge who hears the chorus knows we made choices, and they know which ones.

## The 3-minute pitch

Good afternoon. I want to show you a task, one you probably have on your list right now: reply to that email you have been avoiding for three days.

You know the one. It is not hard to write. It is hard to start. You have opened the tab twice today. You closed it both times. That gap between knowing what to do and doing it is called the initiation gap, and for a lot of people, especially neurodivergent people, it is the single most exhausting part of getting anything done.

Onramp is a tool for closing that gap. Here is what it does.

You type the task in your own words. "Reply to Chris's email about the proposal." Nothing else. No categories, no tags, no priority selector, because those are the tools of a person who is already started.

Onramp reads that and gives you back one thing: a first physical step. Not "think about what to say." Not "open the document." Something a body can do, in the room you are in, in under sixty seconds. "Stand up. Bring your laptop to the kitchen table." Or "open the email. Read only the subject line. Close it." The first step is small enough that the part of your brain that has been guarding the task cannot object to it, because it is not the task.

You do the step. You tell Onramp you did it, with one key press. It gives you the next step. The next step is also under sixty seconds. This continues until you are inside the task, at which point you do not need Onramp anymore, and it gets out of your way.

That is the product. Now let me tell you what it does not do.

It does not have accounts. There is no signup wall, no email verification, no password. You open the page and you use it. Your task never leaves your device.

It does not have streaks or points or levels or badges. It does not tell you "nice work." It does not tell you anything, in fact, that a person having a bad day would find infuriating. The copy is checked by a machine against a list of banned words, and the list is enforced by tests.

It does not track you. There is no analytics, no telemetry, no "anonymous usage data." We do not know how many people use it, and we do not want to.

It works offline. It is a static site. You can save it to your phone and use it on a plane.

The decomposition is rule-based, not machine-learned. Seven rules. You can read them. They live in a single file, and they are covered by tests. If Onramp gives you a step that seems wrong, you can open a debug panel and see exactly which rule fired and why.

We built this in a hackathon window because the problem is not a research problem. The research on executive dysfunction is decades old. The problem is that every tool for it is built by people who have never had it, and it shows. Onramp is built by people who need it, and it is defended against the temptation to make it more like everything else.

Thank you. I am happy to take questions.

## Why the 3-minute pitch wins

The 3-minute pitch is for the standard hackathon slot, the classroom presentation, and the first product demo to a stakeholder. It has to survive three specific attacks: "is this therapy?", "how is this different from a to-do list?", and "where is the AI?"

The therapy question is defused by the "reply to that email" opening. The audience recognises the scenario without any clinical framing. The pitch never claims to treat anything. It describes what the tool does, and it lets the audience name the problem for themselves.

The to-do list question is defused by the mechanism sentence. A to-do list holds the task. Onramp produces the first physical step. Those are different products aimed at different moments.

The AI question is answered directly in the "rule-based, not machine-learned" paragraph. This is where the pitch turns a perceived weakness into a feature. "You can read the rules. They live in a single file." A judge who has sat through fifteen ML pitches that afternoon hears "seven rules, covered by tests" and their shoulders drop.

The refusals paragraph is where the pitch stops being polite. "No accounts, no streaks, no tracking, no praise." Each refusal is a specific competitor's specific feature, and the audience knows it. We are not naming competitors. We do not have to.

The closing is a claim about the team, not the product. "Built by people who need it." This is the most defensible sentence in the pitch, because the alternative claim, "built by people who studied it," is one that every competitor also gets to make.

## The 10-minute pitch

The 10-minute pitch is a defense. It assumes the audience has seen the demo, has read a page or two of the docs, and has follow-up questions that a shorter pitch does not have room for. It is structured as five arguments, each of which is a claim we will defend under cross-examination.

### Argument 1: The initiation gap is the load-bearing problem

Every productivity tool aims at a specific moment. Some aim at capture: getting the task out of your head and into a list. Some aim at prioritisation: sorting the list. Some aim at scheduling: putting a time on the task. Some aim at execution: helping you focus while doing it.

None of them aim at initiation. Initiation is the moment between "I know what to do" and "I have begun." For neurotypical users, this moment is often invisible and takes no measurable time. For neurodivergent users, and for anyone in a state of depression, anxiety, chronic illness, or grief, this moment can consume an entire afternoon.

Onramp aims at initiation. That is the argument. If you accept that initiation is a load-bearing problem, the rest of the design falls out of it.

### Argument 2: The first step must be physical, verifiable, and short

"Physical" means a body can do it. "Verifiable" means the room can witness it. "Short" means under sixty seconds. These three constraints are the entire mechanism.

Physical rules out "decide what to say." Verifiable rules out "think about the meeting." Short rules out anything that a suspicious brain can dismiss as "too much." The sixty-second boundary is not arbitrary; it is the interval at which the initiation-avoidance loop can be deferred long enough for the body to begin.

We could relax any of these constraints and get a tool that is more general. We would also get a tool that does not work. Generality is not the goal.

### Argument 3: Rule-based decomposition is a feature

The decomposer is seven rules in a single file. It is inspectable, testable, and defensible in an audit panel that a skeptical user can open with a keyboard shortcut. If a decomposition seems wrong, you can see which rule fired.

We could have used an ML model. A model would give us a more flexible decomposer that could handle a wider range of task shapes. It would also be a black box, would require a data pipeline we do not want, and would create incentives to collect user data we refuse to collect. It would also fail in ways we could not audit, and those failures would land hardest on the users we most want to serve.

The seven rules are worse in the average case and better in the worst case. That is the trade we are making.

### Argument 4: Gamification harms the audience we serve

The productivity category is saturated with gamification. Streaks, points, levels, badges, rewards, praise strings. The evidence base on whether these help the general population is mixed. The evidence base on whether they help people with executive dysfunction is not mixed. It is negative.

Extrinsic motivators displace intrinsic ones. A user who has completed thirteen consecutive days feels the loss of the fourteenth more than they feel the gain of the thirteenth. A user who breaks a streak on a bad executive-function day is now managing two problems: the original task and the meta-task of having failed at the app that was supposed to help. This is a well-documented failure mode.

Onramp refuses this category entirely. Not "we minimise it." Not "we make it optional." We refuse it. The refusal is enforced in the copy checker, in the tests, and in the review process.

### Argument 5: No backend is a security feature and a trust feature

Onramp has no server. The user's task text never leaves their device. There is no account to create, no email to verify, no password to remember. This is a design choice with three consequences.

First, it means the tool works offline. A user on a plane, in a basement, or in a country with a poor connection has the same experience as a user in a fibre-connected office.

Second, it means the trust model is simple. The user is asked to trust a static site to run in their browser. They are not asked to trust a company with their task list, their behavioural data, or their identity.

Third, it means the tool cannot be enshittified. There is no growth pressure to monetise a user base we do not have. There is no engagement metric to optimise. There is no dashboard we could build to sell to a manager. The absence of a backend is the presence of a promise.

That is the pitch.

## Why the 10-minute pitch wins

The 10-minute version wins in front of an audience that has already decided the demo works and now wants to know whether the team knows what they are doing. Each of the five arguments is a place where a competitor's pitch typically waves its hands, and each one is a place where we have a specific, defensible answer.

The initiation-gap argument is the frame. Everything else hangs on it. If the audience accepts that initiation is a distinct problem, we win. If they do not, no amount of demo polish will save us.

The physical-verifiable-short argument is the mechanism, and it is the sentence a skeptic will try to break. We have designed the sentence to survive the attempt. Any relaxation of any of the three constraints produces a tool we do not want.

The rule-based argument is the AI question, answered in detail. It is not defensive; it is a claim that the rule-based design is better for the audience we serve.

The gamification argument is the differentiator. It is also the one that will make the room lean in, because most of the audience has an intuition that streak counters are bad and has never heard anyone say so plainly.

The no-backend argument is the trust close. It converts a technical decision into an ethical one, and it does so honestly, because the ethical stakes are real.

The five arguments are the five sentences that matter. If you remember only those, you can rebuild the rest of the pitch from first principles.
