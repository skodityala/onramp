# LAUNCH

Marketing copy for Onramp. Nothing here is committed.

## 1. The 280-character tweet

Three variants, each under 280 characters.

**Variant A**

Onramp turns "write your essay" into "open a new doc". That is the entire product. No progress bar. No streaks. No praise. No API key. Deterministic checker overrules the model. Built for the moment a neurodivergent student cannot start. https://github.com/skodityala/onramp

**Variant B**

Executive dysfunction is not laziness. It is the specific gap between deciding to begin and beginning. Onramp gives you one action, one duration, one Done button, and then it leaves. Offline, no API key, 319 tests, MIT license. https://github.com/skodityala/onramp

**Variant C**

Every productivity app wants your attention forever. Onramp wants you gone in twenty seconds. Input: your assignment. Output: one physical action you can perform right now. No backend, no telemetry, no upsell, no account. https://github.com/skodityala/onramp

## 2. The Hacker News post

**Title:** Onramp: the first step, and only the first step

Onramp is a small offline web app that takes an assignment and returns a single first physical action, along with an honest duration in seconds. The output for "Write a five page essay on the causes of WWI, due Friday" is not an outline or a schedule. It is "Open a new doc." Nothing more.

The reason it exists is executive dysfunction. Task initiation is a discrete failure mode for many neurodivergent people, and it is not a comprehension problem or a focus problem. It is the specific gap between deciding to begin and beginning. Existing tools respond to this gap by adding surface: outlines, timers, gamification, chat. Each addition raises the cost of starting.

The insight the project is built around is that a category name is not an action. "Brainstorm" is a category. "Write three bullets" is an action. Onramp refuses to output categories. A deterministic checker sits in front of the model and rejects any response that does not name a concrete verb, an object, and a duration. If the model disagrees with the checker, the checker wins. Every refusal is visible in an audit panel so users can see why a response was rewritten.

The stack is deliberately small: static HTML, one JS file, an optional local model. 319 tests run offline in the browser. No API key. No backend, no analytics, no login. MIT licensed. No funding. No ads. Feedback from neurodivergent testers is what I want most.

## 3. The Product Hunt entry

**Title:** Onramp
**Tagline:** The first step, and only the first step.

**Description**

Onramp is a tool for the moment before you start. You paste in the thing you are supposed to do. It returns one physical action and an honest duration in seconds. That is the entire interface. There is no dashboard, no plan view, no history, no account.

The product exists because task initiation is its own problem, separate from planning and separate from focus. Most productivity software treats initiation as a side effect of organization. Onramp treats it as the whole problem and refuses to solve any other one.

A deterministic checker overrules the model. If the model returns a category ("outline the essay") instead of an action ("open a new doc"), the checker rewrites it. Every rewrite is logged in an audit panel. You can read exactly why a response was changed.

Who this is for: students and adults with ADHD, autism, or any pattern of executive dysfunction who can already do the work once they have begun. People who have tried five planners and closed all of them. People who need less software, not more.

Who this is not for: people who want a full study plan, a coach, a chat companion, or a system to track their week. Onramp does none of those things and will not be extended to.

Offline, no API key, MIT license, 319 tests.

## 4. The Show HN comment

Author here. Context on why this exists and why it refuses so much.

The motivation is composite, not one real person. I have watched several students I care about sit in front of an assignment for hours, understand it fully, and be unable to open the document. They are not confused. They are not distracted. They have decided to begin, and the beginning does not arrive. Every tool I handed them made the situation worse, because every tool asked them to first make a plan, or first pick a category, or first set a timer. Each of those is another decision on top of the one they already cannot make.

What differs here from other tools is scope. Onramp does one thing: it converts a description of work into one physical action and a duration in seconds. It has no view of your day, no view of your week, no memory of past sessions, no notion of goals. It cannot suggest a plan. It cannot break a task into subtasks in advance. It cannot track anything. Those are refusals, not missing features.

The refusals, with reasoning:

- No streaks. Reinforcement schedules attach the tool to your identity. The tool is supposed to disappear.
- No account, no login, no cloud. Signup is a second initiation barrier stacked on the first.
- No chat. Conversation invites elaboration. Elaboration is what the user is stuck inside.
- No API key required. If the local model is unavailable, a deterministic fallback still returns a valid action. The product must work when the internet does not.
- Deterministic checker overrules the model. A model that returns "brainstorm ideas" has produced a category. Categories are the failure mode. The checker rewrites categories into actions and shows its work.

What I want from this thread: feedback from neurodivergent testers, particularly on the wording of the action outputs and the honesty of the duration estimates. If the duration is wrong in a way that matters, I want to know. If a refusal above is load bearing for you in a way I did not consider, I want to know that too. Twenty minutes of your attention is more than I am owed and I will read every reply.

## 5. Demo GIF specification

Eight second silent demo for social. 800x500 canvas, 30 fps, 240 frames total. Palette restricted to the design tokens: --bg (#FAF9F6), --ink (#12151A), --accent (#1F6F5C), --line, --ink-soft. No mouse trail. No drop shadows. No motion blur.

Shot list:

```
0.0-0.8s   Empty Start screen, cursor blinks in textarea
0.8-1.5s   Paste "Write a 5 page essay on the causes of WWI, due Friday"
1.5-2.2s   Click "Find my first step"
2.2-3.0s   Screen fades. "Open a new doc." appears. Duration line: "about 20 seconds"
3.0-4.5s   Textarea cursor is already blinking. User types "T"
4.5-5.5s   Duration line changes to "you started"
5.5-6.5s   Done button label changes to "Done, next step"
6.5-8.0s   Fade to logo + URL
```

Encoding: export as APNG for quality, transcode to GIF with a five color palette (background, ink, accent, line, soft ink). Target file size under 400 KB. Alt text: "A student types an assignment into Onramp. Onramp replies with a single physical action and a short duration."

## 6. Poster specification

Twenty four by thirty six inch hackathon poster, portrait, text only. Background --bg (#FAF9F6). Body text --ink (#12151A). Accent --accent (#1F6F5C) reserved for the tagline and the arrow inside the example box. Serif system font (New York, Georgia fallback) for the tagline. Sans system font (SF Pro, Inter fallback) for everything else. Margins two inches on all sides. Layout below is proportional, not literal.

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│                        ONRAMP                              │
│                                                            │
│         The first step, and only the first step.           │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│    Executive dysfunction is not a comprehension            │
│    problem. It is not a focus problem. It is the           │
│    specific gap between deciding to begin and              │
│    beginning.                                              │
│                                                            │
│                                                            │
│    ┌──────────────────────────────────────────────┐        │
│    │  Write your history essay                    │        │
│    │                       ↓                      │        │
│    │  Open a new doc.                             │        │
│    │  about 20 seconds                            │        │
│    └──────────────────────────────────────────────┘        │
│                                                            │
│                                                            │
│    Deterministic checker. No API key. Offline first.       │
│    319 tests passing. MIT license.                         │
│                                                            │
│                                                            │
│                                                            │
│                  github.com/skodityala/onramp              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Print notes: no bleed required for a foam board mount. If printed at a fabric shop, add a quarter inch bleed on the outer edge and keep all text within a one inch safe area. QR code optional, positioned centered below the URL if used.

## 7. One-slide pitch for a 30-second demo

Single slide, ink on --bg background, accent color reserved for the product name.

```
ONRAMP
The first step, and only the first step.

In:   "Write a 5 page essay on WWI, due Friday"
Out:  "Open a new doc."

No API key. Offline first. 319 tests passing.
The deterministic checker overrules the model.
Every refusal is deliberate.

github.com/skodityala/onramp
```

Speaker note for thirty seconds: Onramp takes an assignment and returns one physical action. That is the entire product. It exists for people who can do the work once they have started and cannot start. The checker refuses anything that is not a concrete verb, object, and duration. There is no account, no cloud, no telemetry. The model is optional. The refusal is the feature.

## 8. The email to a neurodivergent tester

**Subject:** Twenty minutes of your attention, if you are willing

Hi,

I am writing to ask if you would try a small tool I built. It is called Onramp. In one sentence: you paste in an assignment or task, and it returns one physical action and a short duration in seconds, and nothing else.

There is no signup, no account, no API key, and no download. It runs in a browser tab. Nothing you type leaves your machine. You can close it and it forgets you.

What I would ask of you: open the tool, paste in three real things from your life (an assignment, a chore, a work task), read what it returns, and tell me whether the action it proposed was one you could actually begin in the next minute. If it proposed something abstract or too large, I want to know exactly what it said. If it proposed something you could act on, I also want to know, in the same amount of detail.

In exchange, I can offer thanks and a note in the README if you want one. I am not offering money, because I do not want to change the shape of the feedback.

On your time: I will cap this at twenty minutes. If you are past twenty minutes, stop. If it takes five, that is also fine. I would rather have five honest minutes than twenty polite ones.

On consent: every part of this is optional. You can skip any question. You can be named in the credits, named privately in a thank you note, or not named at all, whichever you prefer. Nothing you say will be recorded, screenshotted, or quoted without your explicit written permission.

Thank you for reading this far.
