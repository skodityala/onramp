# Onramp Privacy

Onramp is designed around a single organizing principle: the application should not know anything about the user, and it should not need to. This document explains that posture, what it means in operational terms, and how anyone can verify it independently.

## 1. Zero-collection posture

Onramp collects nothing. No account, no email, no name, no session identifier that leaves the device, no analytics, no crash reporter. The application ships without a fetch call to any server for its core function.

There is no signup screen because there is no account. There is no login screen because there is no session on any server. There is no "reset password" flow because there is no password. There is no cookie banner because there are no cookies.

When you open Onramp, the browser loads static files (HTML, JS, CSS) from whatever host the deployer chose. After that, nothing else is transmitted anywhere unless the deployer has opted into the model integration described in Section 8.

## 2. The nothing-to-see-here table

```
Data type                        | Collected? | Stored?      | Transmitted?
---------------------------------|------------|--------------|-------------
Assignment text                  | No*        | localStorage | No*
Session state                    | No         | localStorage | No
Typed content in typing surface  | No         | localStorage | No
Time-to-first-keystroke          | No         | localStorage | No
Names, emails, ages              | No         | -            | No
IP address (via any request)     | No         | -            | Only if you serve
                                 |            |              | this from a server
Browser fingerprint              | No         | -            | No
Cookie                           | No         | -            | No (there are none)
Referrer                         | No         | -            | No
```

*Assignment text is stored in localStorage on the same device. It is transmitted ONLY if VITE_LLM_ENDPOINT is set, in which case it is sent to that endpoint. It is never sent to Onramp's operators (we have none; there is no operator).

"Collected" in this table means received and retained by any operator of Onramp. "Stored" means persisted anywhere. "Transmitted" means sent over the network to any origin.

## 3. What "no analytics" actually means

No Google Analytics. No Plausible. No Segment. No Mixpanel. No custom `POST /event` calls. Zero. This is enforced by the fact that the src/ tree contains no fetch() calls except in src/adapters/llm.ts, which is guarded by two env vars.

There is no event queue. There is no session replay. There is no heatmap library. There is no A/B testing framework. There is no feature flag service. There is no error monitoring SDK (no Sentry, no Bugsnag, no Rollbar). There is no product intelligence tool. If the browser reports an error, it prints to the console and stays there.

## 4. Third-party dependencies

Runtime: react, react-dom. That is the complete list.

Dev-time: vite, vitest, typescript, testing-library, jsdom. These are build-time only. None are runtime dependencies.

None of the runtime dependencies phone home. React does not make network calls. react-dom does not make network calls. Every byte of network activity in a production Onramp deployment is code the deployer can read in this repository.

## 5. Sub-resources

The built HTML has no `<script>` tags to third-party origins. No CDN calls. The bundle is entirely self-hosted, whatever host you deploy to.

There is no Google Fonts request. There is no Font Awesome request. There is no jQuery request. There is no polyfill.io request. Anything the page needs is in the bundle the deployer served.

## 6. The share link

The share link uses the URL fragment (`#a=...`). Per the HTTP specification, URL fragments are never transmitted to servers in the request. So a shared link's contents live client-to-client: created in the sender's browser, transmitted via whatever channel (SMS, email, chat), decoded in the recipient's browser. Onramp never sees the content.

```
   Sender's browser                                Recipient's browser
   +----------------+                             +----------------+
   | assignment     |                             |                |
   | text in memory |                             |                |
   +-------+--------+                             +--------+-------+
           |                                               |
           | encode to base64                              |
           | build URL: https://host/#a=<b64>              |
           v                                               |
   +----------------+                                      |
   | URL fragment   | --- SMS / email / chat ---------->   |
   | (never sent    |     (the transport sees the URL,     |
   |  to server)    |      but the Onramp origin does not) |
   +----------------+                                      |
                                                           v
                                                  +-----------------+
                                                  | page loads      |
                                                  | fragment stays  |
                                                  | client-side     |
                                                  | decodeAssignment|
                                                  | from window.    |
                                                  | location.hash   |
                                                  +-----------------+

   Onramp origin (server) sees:  GET /   (no fragment)
   Onramp origin (server) sees:  GET /assets/*.js  (no fragment)
   Onramp origin (server) sees:  nothing else
```

The fragment is opaque to the server serving Onramp. The channel used to send the URL (SMS provider, email provider, chat platform) may see the URL, including the fragment. That is a property of whichever transport the sender picked.

## 7. localStorage

Key: `onramp.session.v1`. Value: the current Session as JSON. Cleared by:

- User pressing "Start something else" on Finish screen (calls clearSession).
- User calling `localStorage.clear()` in DevTools.
- User clearing browser data.

localStorage is scoped to the origin. Only pages served from the same origin as Onramp can read it. No script from another origin, and no other application, can access this key.

## 8. Optional model call

If VITE_LLM_ENDPOINT is set:

- The current assignment text and the current step text are sent as JSON POST body.
- A bearer token from VITE_LLM_KEY is included.
- The response is parsed for candidate steps, which are then run through the checker.
- The model call is ONLY made when a step needs decomposition, not on every render.
- If the call fails (network, 4xx, 5xx), the rules engine is used with source `model-regated` recorded.

The audit panel exposes to the user which path produced the step they are looking at. If a model call was made, they can see it.

This integration is off by default. A deployer who wants it must set the env var at build time. A user of a deployed Onramp instance cannot toggle it; it is a property of the build.

## 9. GDPR posture

Onramp does not process personal data in the GDPR sense unless a deployer configures an LLM endpoint AND passes personal data through it. In default operation, there is no processor, no controller, and no data subject in the GDPR sense.

Assignment text may contain personal data if the user chooses to paste something personal. That data is not transmitted anywhere in default operation. It is held in the user's browser storage on the user's device, which is not "processing" as the regulation contemplates it.

## 10. Children's data (COPPA-adjacent)

Onramp is used by minors as a matter of the intended audience. Because Onramp collects nothing, there is no COPPA-relevant collection.

There is no verifiable parental consent flow because there is nothing to consent to. There is no age gate because we neither know nor need to know the age of any user.

## 11. If we did have to comply

If a deployer chose to add analytics or a backend, the following would apply and should be documented in their fork's SECURITY.md:

- Opt-in, not opt-out.
- No assignment text transmitted.
- Right to delete.
- Data minimization.

A fork that adds a backend takes on the responsibilities of a controller. That fork is not Onramp; it is a derivative work with a different privacy posture, and it needs its own privacy documentation.

## 12. Independent verification

A judge can verify our claims:

1. Open browser DevTools > Network. Load the app. Interact with it. Observe: no requests are made after the initial page load, unless VITE_LLM_ENDPOINT is set.
2. `grep -R "fetch\|XMLHttpRequest" src/` returns matches only in src/adapters/llm.ts.
3. `grep -R "gtag\|analytics\|segment\|mixpanel\|plausible" src/` returns nothing.

These three checks take under a minute to run. They are sufficient to establish, in a mechanical way, that the claims in this document are consistent with the code that ships. If any of them fail, this document is wrong, and a bug report is welcome.

A more thorough audit involves running the build, opening the resulting `dist/index.html` in a browser with DevTools open, and confirming the same behavior against the production bundle rather than the dev server. Dev servers sometimes make hot-reload WebSocket connections; the production bundle does not, because there is no dev server in production. The Network tab of a production build, after the initial static asset load, should stay silent for the entire session unless the model integration is configured. If a deployer wants a paper trail of this verification, capturing a HAR file from that session and archiving it alongside the release notes is a reasonable practice.

For deployers who publish Onramp on behalf of a school, district, or other institution, the recommended verification cadence is: run the three grep checks on every dependency bump, and run the DevTools Network check on every deploy. Both are cheap. Both catch the class of regression that would matter here, which is the accidental introduction of a phone-home behavior via a transitive dependency or a copy-pasted snippet.

Finally, a note on trust. This document is a claim. The code is the ground truth. Where the two disagree, the code wins, and the document is a bug. We would rather be told about that than not.
