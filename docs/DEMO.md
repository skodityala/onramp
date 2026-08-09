# Demo Script

This is the shot-by-shot script for the three-minute Onramp demo. It is written to be read on stage, at a table, or on a video call. It has been rehearsed. It has a backup plan. It has a list of things not to do.

The demo is three minutes because that is the slot we most often get. If you have less, cut the audit panel and the share link. If you have more, do not add anything; add pauses.

## Before you start

Set up. Do these before you walk on.

| Step | What to check |
|---|---|
| 1 | Battery is above 50 percent. Laptop is plugged in if a socket exists. |
| 2 | Wi-Fi is on, but the app is loaded before you present, so a network drop mid-demo does not kill you. |
| 3 | Browser is at 125 percent zoom. The room needs to see the type. |
| 4 | Only one browser tab is open. No notification banners, no other windows. |
| 5 | Do Not Disturb is on at the OS level. |
| 6 | The dev server is already running. You are not going to run `npm run dev` on stage. |
| 7 | You have the task text memorised, not read off a note. |
| 8 | You have practiced the transition from step 3 to the audit panel three times today. |

## The script

Time notation is minutes and seconds elapsed from the moment you begin speaking.

### 0:00 to 0:15, the opening

**On screen:** the Onramp home surface, empty task field, cursor visible.

**Say:** "You have an email you have been avoiding. Everyone in this room has one right now. It is not hard to write. It is hard to start. Onramp closes that gap. Let me show you."

**Do not:** name a specific competitor, name a diagnosis, or apologise for the size of the team. All three make the opening smaller.

### 0:15 to 0:45, the first step

**On screen:** type the task. Use exactly this text, because it is neutral, specific, and does not require the audience to know a person.

Type: `reply to Chris about the proposal`

**Say (as you type):** "I type the task in my own words. No categories, no priority, no tags. Those are the tools of a person who is already started."

Press Enter. The first step appears.

**Say:** "Onramp reads that and gives me one thing back. Not 'think about what to say.' Not 'open the document.' A first physical step. Something a body can do, in the room I am in, in under sixty seconds."

**Pause for two seconds** and let the audience read the step. The pause is important. Do not fill it.

### 0:45 to 1:15, the second and third steps

**Say:** "I do the step. I press one key to tell Onramp I did it."

Press the confirm key. Second step appears.

**Say:** "The next step is also under sixty seconds. It is also physical. Notice what is not on the screen. There is no praise. There is no 'nice work.' There is no counter that has gone up. Nothing is being tracked. The tool is not trying to make me feel good about doing the step. It is trying to make the next step possible."

Press the confirm key. Third step appears.

**Say:** "This continues until I am inside the task. At that point I do not need Onramp anymore, and it gets out of my way."

### 1:15 to 1:45, the audit panel

**Say:** "You are probably wondering how the decomposition works. There is no AI in the loop. There is a rule-based decomposer, seven rules, one file. I can show you exactly which rule fired for the step I am looking at."

Press the audit shortcut. The debug panel opens.

**On screen:** the audit panel shows the current step, the rule that produced it, the input that fed the rule, and any constraints that were checked.

**Say:** "This is the audit panel. It is off by default because most users do not need it. But it exists because a skeptical user, or a skeptical judge, should be able to see how the decision was made. This is the entire logic of the product. You can read it."

Close the audit panel.

### 1:45 to 2:15, the share link

**Say:** "If I want to send this decomposition to a friend, I press one key."

Press the share shortcut. A confirmation appears that the URL is in the clipboard.

**Say:** "The task and the steps are encoded in the URL fragment. Nothing was uploaded. Nothing was saved on a server, because there is no server. I can paste this in another tab and the same decomposition loads."

Open a new tab, paste the URL, load the page. The same decomposition appears.

**Say (as it loads):** "There is no account. There is no signup wall. There is no email verification. There is not even a database. If you disconnect the network right now, the app continues to work, because it is a static site and it holds nothing off-device."

### 2:15 to 2:45, the refusals

**On screen:** return to the main window with a step visible.

**Say:** "Here is what Onramp does not do. It does not have streaks. It does not have points. It does not have levels. It does not have badges. It does not have rewards. It does not tell you 'nice work' after a step. Every one of those is a category we refuse, and the refusal is enforced by tests. The copy checker rejects the words. The refusal invariants reject the imports."

**Say:** "We refuse those categories because the research on extrinsic motivators in this audience is not mixed. It is negative. A user who breaks a streak on a bad day is now managing two problems: the task, and the meta-task of having failed at the app that was supposed to help. We are not going to be that app."

### 2:45 to 3:00, the close

**Say:** "Onramp is MIT-licensed. It runs entirely in the browser. It works offline. It collects zero data. It is built by people who need it. Thank you."

Stop talking. Do not add "and I am happy to take questions" unless the format calls for it. The silence after "thank you" is where the applause goes.

## What NOT to show

The following are tempting and would weaken the demo.

| Do not | Because |
|---|---|
| Do not open the source code on stage. | A live source tour is boring and it invites nit-picking. Point at `docs/JUDGES.md` if asked. |
| Do not run `npm test` in the demo. | The tests take a few seconds; the pause is dead air. Reference them in the script instead. |
| Do not show the changelog on screen. | The changelog is a document to read, not to present. |
| Do not compare Onramp to a named competitor. | Every named competitor pulls a supporter of that competitor into the room. Compete on category, not on name. |
| Do not use humour about neurodivergence. | It reads as ableism to anyone in the audience who is neurodivergent, which is always more than you think. |
| Do not read the seven rules aloud. | The audit panel shows one at a time; that is enough. Reading all seven turns the demo into a lecture. |
| Do not hedge about the team size. | The team's size is not the point. The product is. |
| Do not add a "coming soon" list at the end. | The 1.0 story is stronger without one. If someone asks about roadmap, refer them to the changelog. |

## Backup plan

Something will go wrong. Here is what to do.

### If the dev server is not running

Fall back to the built version. Before the demo, run `npm run build` and open `dist/index.html` directly in the browser. Have that tab loaded in a second window. If the dev server dies, switch windows and continue.

### If the network is down

The app works offline. The demo is unaffected. Say nothing about it. If a judge asks, that is the moment to say "notice that we are offline right now."

### If the audit panel fails to open

Skip it. Say "there is an audit panel that shows the rule that fired, but I will not open it now; it is in the docs at `docs/JUDGES.md`." Continue to the share link. Do not troubleshoot on stage.

### If the share link fails to copy

Say "the share link encodes the decomposition in the URL fragment; here it is in the address bar." Copy it manually. Do not apologise more than once.

### If the projector cuts out

Continue the demo verbally for thirty seconds while the AV person handles it. You know the script. The audience can hear you. Then either the projector comes back or you switch to a laptop-only demo held up to the front row.

### If a judge interrupts with a question mid-demo

Answer briefly. Return to the script from the point you left off. Do not restart the section.

## Screenshots to include

If you are submitting a video, an issue, or a written brief, include these five screenshots. They tell the whole story.

| Screenshot | What it shows |
|---|---|
| 1 | The empty task field with the cursor. Establishes the surface. |
| 2 | The first step displayed. Shows the mechanism. |
| 3 | The audit panel open with a rule highlighted. Shows the transparency. |
| 4 | The browser's Network tab, empty after initial load. Shows the trust claim. |
| 5 | The reduced-motion state with the sensory floor visible. Shows the accessibility commitment. |

If you have room for only one screenshot, use number 2. If you have room for two, add number 3. The order beyond that is a matter of taste.

## Rehearsal notes

Rehearse the demo out loud, on a laptop, with a timer, at least three times before you present it. Rehearse the transitions in particular: task entry to first step, first step to audit panel, audit panel to share link, share link to close. Those are the seams where a demo goes wrong.

Rehearse the pauses. There are two-second pauses at 0:30 and at 3:00. Both are load-bearing. If you fill them, the demo loses shape.

Rehearse with the reduced-motion setting on. This is the state most of your audience will experience if they open Onramp on their own device with an operating-system default. The demo should look correct in that state.

Rehearse without the audit panel and without the share link, so that if you need to cut them under time pressure, the demo still lands.
