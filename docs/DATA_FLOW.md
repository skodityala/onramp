# Onramp Data Flow

This document traces every piece of user data through the application, from entry to storage to (optional) transmission. It is intended to be read alongside PRIVACY.md and THREAT_MODEL.md.

## The diagram

```
                     ┌─────────────────────┐
                     │ User pastes         │
                     │ assignment text     │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ React state         │
                     │ (in-memory)         │
                     └──────────┬──────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
     ┌────────────────┐ ┌──────────────┐ ┌──────────────────┐
     │ localStorage   │ │ URL fragment │ │ fetch to LLM     │
     │ (same origin,  │ │ (client-to-  │ │ (only if env     │
     │  same device)  │ │  client)     │ │  vars are set)   │
     └────────────────┘ └──────────────┘ └──────────────────┘
              │
              ▼
     [restored on next open]

     [NOT SENT ANYWHERE]:
     - to Onramp's operators (there are none)
     - to any analytics service
     - to any log aggregation
     - to any crash reporter
     - to any advertising network
     - to any social platform
```

## Step-by-step walkthrough

### Step 1: Entry

The user pastes (or types) assignment text into an `<textarea>` on the Start screen. This is the only user input that carries content of any consequence; typed content in the practice surface is a derivative artifact.

At this moment the text lives in the DOM's value property, which is memory owned by the browser process rendering the page.

### Step 2: React state

On submit, the assignment text is lifted into React state via `startSession`. The state object is a `Session` record: assignment text, list of steps, current step index, timestamps.

React state is in-memory. It lives for the duration of the tab. If the user closes the tab without persisting, this state is gone.

### Step 3: Persistence to localStorage

After every state transition, `saveSession` writes the current session as JSON under the key `onramp.session.v1`. localStorage is:

- Scoped to the origin (protocol + host + port). No other site can read it.
- Local to the device. It does not sync to iCloud, Google, or any browser-vendor cloud.
- Persistent across tab closes and browser restarts, until cleared.

Restoration: on next app open, `loadSession` reads the key, JSON.parses it (wrapped in try/catch), and if the shape looks valid, hydrates React state from it. If parsing fails or the shape is wrong, the app starts fresh.

### Step 4 (optional branch A): URL fragment

If the user clicks Share, the sender's browser encodes the assignment text as base64 and appends it to the URL as `#a=<b64>`. The URL is written to the clipboard (or opened in a chooser, depending on the platform).

Key property: URL fragments are not sent in HTTP requests. When the recipient opens the URL, the browser sends `GET /` to the Onramp origin, with no fragment. The fragment stays on the client and is read from `window.location.hash` by JavaScript once the page has loaded.

The channel used to convey the URL (SMS, email, chat app) may see the URL including the fragment. That is a property of the transport, not of Onramp.

### Step 4 (optional branch B): fetch to LLM

If, and only if, the build was configured with `VITE_LLM_ENDPOINT`, some steps trigger a fetch to that endpoint. The request body is JSON containing the assignment text and the current step text. The request carries a bearer token from `VITE_LLM_KEY` if set.

The response is parsed. Candidate steps are checked against the same rules the rules engine applies before being surfaced to the user. If the fetch fails at the network layer or returns a non-2xx status, the rules engine is used, and the audit panel records `model-regated` as the source.

### Step 5: Nothing else

The list at the bottom of the diagram is exhaustive. Onramp does not send the data to any of the enumerated destinations, because it does not send the data anywhere at all (outside the two optional branches above).

There is no operator server. There is no analytics endpoint. There is no log aggregator. There is no crash reporter. There is no advertising integration. There is no social share SDK.

The absence is not enforced by policy; it is enforced by the code. See PRIVACY.md Section 12 for the grep commands that verify this.
