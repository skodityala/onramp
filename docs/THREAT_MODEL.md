# Onramp Threat Model

This document enumerates what we are trying to protect, from whom, and how. It is deliberately narrow, because Onramp is a deliberately narrow application: a static single-page app that keeps everything on the user's device.

## 1. Assets

- User's assignment text (potentially schoolwork of a minor).
- User's session state (which steps are done, timing).
- Nothing else.

There is no user database, no billing record, no OAuth token, no API key belonging to a user, no email address, no phone number, no device identifier. The two items above are the whole list of things a rational adversary might want, and both live on the user's own device.

## 2. Adversaries

- A malicious script injected into the app (XSS).
- A malicious browser extension.
- Someone with physical access to the device.
- A malicious LLM endpoint (if the user configures one).
- A network eavesdropper.

Each of these has a different capability set and a different mitigation.

## 3. Attack surface

- React rendering of user input (assignment text, typed content).
- localStorage read/write.
- URL fragment parsing.
- Optional fetch() call.

That is the whole surface. There is no server component to attack. There is no admin panel. There is no upload endpoint. There is no authentication flow. There is no cookie to steal.

## 4. Threat: XSS in the audit panel

The audit panel displays the parent step's text. If a parent step contained HTML/JavaScript, React would escape it by default (JSX text nodes). Verify by inspection.

Mitigation: React's default text-node handling. We do NOT use dangerouslySetInnerHTML anywhere.

Assignment text also flows into the header and the currently-active step display. In every case the rendering path is `{text}` inside JSX, not `dangerouslySetInnerHTML={{__html: text}}`. React escapes these values before inserting them into the DOM. A verification grep is provided in Section 12.

## 5. Threat: URL fragment injection

The URL fragment is decoded as base64. Malformed input returns null. The decoded assignment is then treated as regular user input.

Mitigation: `decodeAssignment` returns null on any parse failure. `startSession` treats the assignment as a plain string, never as HTML or code.

A crafted fragment cannot escape into script context because there is no code path that evaluates the decoded string. It is stored in state, rendered as text, and optionally sent to the configured LLM endpoint. None of those steps interprets it as executable content.

## 6. Threat: localStorage tampering

A browser extension or the user themselves could modify localStorage. This could corrupt the session state.

Mitigation: `loadSession` wraps JSON.parse in try/catch. On failure, returns null. The app treats a missing/corrupt session as "start fresh."

If a tampered session parses successfully but contains fields the app does not expect, the runtime type checks in the session loader treat the record as invalid and fall back to null. There is no path where a malicious localStorage value leads to code execution; the worst case is a wiped session.

## 7. Threat: Malicious LLM endpoint

A user who configures a malicious endpoint could have their assignment text logged or misused.

Mitigation: The user configures this deliberately. We document that only the assignment text is sent, never identity. The audit panel shows when the model produced a step, so the user is informed.

We also constrain the parser. The response from the endpoint is parsed for candidate steps and then run through the same checker the rules engine uses. A response that tries to inject unusual content is filtered by the checker before it reaches the UI.

## 8. Threat: Physical access

Someone with physical access to the device can read localStorage.

Mitigation: This is out of scope for browser applications. Users concerned should clear the session via the Finish screen or a private-browsing mode.

Private-browsing modes on modern browsers do not persist localStorage across the session, so users who want ephemeral operation have a first-class path.

## 9. Threat: Network eavesdropping

Only relevant if VITE_LLM_ENDPOINT is set. The eavesdropper would see the assignment text.

Mitigation: The endpoint should use HTTPS. Our documentation recommends this. If a deployer configures an http:// endpoint, that is their choice and their liability.

Even under HTTPS, the endpoint operator sees the plaintext of the request body. That is not eavesdropping; it is the endpoint operator's normal access. Section 7 covers that threat.

## 10. Non-threats

- We do not consider a rogue Onramp maintainer publishing a malicious update. That is a supply-chain concern applicable to all software; our answer is "audit before you update."
- We do not consider governmental request for user data because there is no user data on our servers because there are no servers.

We also do not model side-channel attacks on the browser itself (Spectre-class, timing attacks against localStorage). Those are the browser's problem and the OS's problem, not Onramp's.

## 11. Content-Security-Policy

The deploy configs ship a Content-Security-Policy that constrains what the page can do. A representative policy:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self' https://api.example.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
```

Each directive:

- `default-src 'self'`: everything not otherwise specified must come from the same origin. No third-party anything by default.
- `script-src 'self'`: JavaScript only from our own origin. No inline scripts. No eval. No CDN scripts.
- `style-src 'self' 'unsafe-inline'`: styles from our origin. Inline is permitted for compatibility with build-time CSS-in-JS; a stricter deploy can drop it.
- `img-src 'self' data:`: images from our origin, plus data URIs (used for small icons baked into the bundle). No hotlinked images.
- `connect-src 'self' https://api.example.com`: fetch/XHR only to our origin, plus (optionally) the deployer's configured LLM endpoint. Replace with the real host or drop the second value if no endpoint is configured.
- `font-src 'self'`: fonts from our origin. No Google Fonts, no third-party font CDN.
- `object-src 'none'`: no `<object>`, `<embed>`, or `<applet>`.
- `base-uri 'self'`: prevents `<base href>` injection from redirecting relative URLs.
- `form-action 'self'`: forms may only submit to our origin. Onramp has no forms that submit, but this is a defense-in-depth entry.
- `frame-ancestors 'none'`: no other page can embed Onramp in a frame. This blocks click-jacking.

Deployers who add a backend should tighten `connect-src` to the exact hosts they use and drop `'unsafe-inline'` from `style-src` if their build allows it.

## 12. Independent verification

```
$ grep -R "dangerouslySetInnerHTML\|eval(\|Function(\|innerHTML" src/
```

Should return nothing.

If the grep returns any result, a reviewer should look at the specific line and decide whether it is a real risk. In the current codebase, the expected output is empty. Any future PR that introduces one of these constructs should be reviewed against this document.
