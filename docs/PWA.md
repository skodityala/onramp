# PWA

## PWA Support

Onramp installs to a home screen and works offline. The Progressive Web App capabilities are hand-rolled: a manifest, a service worker, and a small adapter for install prompts.

The decision to hand-roll rather than pull in a framework (Workbox, vite-plugin-pwa, etc.) was deliberate. The whole PWA layer is under 100 lines of code. A framework would add hundreds of kilobytes of dependency and hide behaviour behind a config file. The current shape is small enough that a maintainer can read the entire implementation in one sitting and predict exactly what it will do.

## The manifest

`public/manifest.webmanifest` declares:

- Name and short name
- Standalone display mode
- Warm off-white theme colour (matches the app background)
- Two icon variants (any + maskable) as scalable SVG
- A "Find my first step" shortcut for jump-lists on Android

The theme colour matches the app background so that on iOS the status bar tint blends into the app on launch. The maskable icon variant follows the Android adaptive-icon safe-area convention, so the launcher can crop it into any shape without clipping the glyph.

Icons are shipped as SVG rather than a bank of PNG sizes. Every modern PWA-capable browser accepts SVG icons, and a single vector file is smaller than the smallest PNG variant we would otherwise ship.

## The service worker

`public/sw.js` is hand-rolled, 40 lines, and depends on nothing.

Strategy:

- **Cache-first** for hashed static assets (Vite emits fingerprinted URLs under `/assets/`)
- **Stale-while-revalidate** for the HTML entry point, manifest, and icons - the app updates within a round trip while never showing a broken shell
- **Network-only** for cross-origin requests, including any optional LLM API call

The cache version bumps on every release. Old caches are cleaned on the `activate` event.

Cache-first is safe for hashed assets because the hash in the URL guarantees content stability: if the file at `/assets/main.a1b2c3.js` exists in cache, it is the correct file. New releases produce new hashes, so the cache never serves a stale hashed asset.

Stale-while-revalidate is the right strategy for the HTML entry because it decouples first paint from network latency. A returning user always sees the app boot at cache speed; the fresh HTML arrives in the background and takes effect on the next navigation. This is what makes the app feel native even on a flaky connection.

Network-only for cross-origin requests is a safety property, not a performance one. The service worker is not a place to introduce a policy about third-party requests; those flow through unchanged.

## Assignment text never touches the cache

The service worker is scoped to same-origin requests, and only intercepts GET requests. There is no case in the code where user-typed content ends up in a cache. This is a design decision, not an implementation detail; even if you enabled a "share by URL" cache, the URL fragment (where assignments live in share links) is never sent to the network.

URL fragments (the part after `#`) are a browser-side construct. They are not included in the HTTP request the browser makes for a URL, and therefore cannot appear in a service worker's `fetch` event. This means assignments carried in share links stay entirely on the client, even when the service worker is active. A user can share an assignment with a colleague over any channel and be confident that the assignment text never left either device via the app's cache layer.

## Install flow

```
user visits site
  |
  v
browser dispatches beforeinstallprompt (if criteria met)
  |
  v
pwa.captureInstallPrompt saves it
  |
  v
Finish screen polls canInstall() every second
  |
  v
"Install as app" button appears when available
  |
  v
click -> promptInstall() -> browser shows install UI
```

The user is never nagged. The install button appears only on the Finish screen (a moment of low cognitive load) and only if the browser has offered.

The one-second poll on the Finish screen is a pragmatic choice. The `beforeinstallprompt` event can fire at any point during a session, and the Finish screen might already be mounted when it fires. A poll is cheaper to reason about than a global event bus that the Finish screen has to subscribe to and unsubscribe from correctly.

The captured prompt is single-use. Once `promptInstall()` is called, the underlying browser event is consumed and cannot be re-shown. If the user dismisses the browser UI, the button disappears until the browser decides to offer again (which may be days later, depending on engagement heuristics).

## Offline behaviour

Once installed, or once visited with the service worker active:

- Full app boots offline
- All decomposition works offline (rules-only path)
- Share links open offline (assignment is in the URL fragment)
- localStorage-backed session persistence continues working

The offline story is a first-class product feature, not a fallback. A student on a flaky school connection, a train, or a plane can decompose an assignment and work through it with zero network. This is one reason the decomposer's default path is rules-based rather than LLM-based: the default experience must not depend on connectivity.

## What does NOT work offline

- Optional LLM calls to a remote endpoint (both env vars set)
- The on-device WebLLM path is offline-capable AFTER weights are cached (first load requires network)

The WebLLM path is worth calling out because it is the one place where "offline" has a phase. The first load pulls model weights (typically several hundred megabytes) over the network. Once cached by the browser, subsequent loads are offline-capable. Users on metered connections should be warned before the first load; the UI surfaces the weight size before download begins.

## Detecting standalone mode

`isStandalone()` returns true when the app is running as an installed PWA. Currently unused by the UI; hooks are in place for a future "we know you installed us, thanks" surface (which will be honoured as a factual observation, not gratitude).

The detection uses `window.matchMedia('(display-mode: standalone)')` as the primary signal, with `navigator.standalone` as a fallback for older iOS Safari. Both are read on demand rather than cached, because a browser can transition between windowed and standalone in some multi-window scenarios.

## Testing

The PWA adapter has test coverage:

- registerServiceWorker is a safe no-op in dev, in jsdom, and when the API is missing
- captureInstallPrompt attaches a listener without error
- canInstall / promptInstall handle the null state
- isStandalone returns false in test environments

The tests run under jsdom, which does not implement the Service Worker API or the `beforeinstallprompt` event. The adapter is written so that every entry point checks for API availability before use, which means the tests exercise the same code paths that would run in an unsupported browser (older Firefox, private-mode Safari, etc.). This is a nice property: the fallback path is not a separate branch, it is the same code the tests already cover.
