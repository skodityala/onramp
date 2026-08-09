# Deploying Onramp

## 1. Deployment philosophy

Onramp is a static bundle. There is no server component, no database, no
session store, and no per-user state that lives outside the browser. The
build output is a folder of HTML, CSS, JavaScript, and image assets that
any HTTP server can serve. Every additional user is a static-asset request
against a CDN edge, which means Onramp scales horizontally with whatever
host you pick and costs almost nothing to run. Pick a host, point it at
`dist/`, and you are done.

## 2. Netlify (one click)

The repository ships a `netlify.toml` at the root that pins Node 20,
declares `npm run build` as the build command, publishes `dist`, adds
security headers, marks `/assets/*` as immutable for one year, and rewrites
unknown paths back to `index.html` so the SPA router can handle them.

Deploy from a clean checkout:

```
netlify deploy --prod
```

Or connect the repo in the Netlify UI and it will pick up `netlify.toml`
on the next push.

## 3. Vercel (one click)

`vercel.json` mirrors the Netlify config: framework preset `vite`, build
command `npm run build`, output `dist`, install command `npm ci`, the same
security header set, the same immutable cache rule for `/assets/*`, and
SPA rewrites via `rewrites`.

Deploy from a clean checkout:

```
vercel --prod
```

Vercel autodetects the config on push once the project is linked.

## 4. Cloudflare Pages

`wrangler.toml` declares the Pages project name, the build output
directory, the compatibility date, and the same header set. Build locally
and ship the output:

```
npm run build
wrangler pages deploy dist
```

You can also connect the repo in the Cloudflare dashboard and let it run
the build command on its own.

## 5. GitHub Pages

`.github/workflows/pages.yml` is a two-job workflow. The `build` job
checks out the repo, installs Node 20, runs `npm ci`, `npm run typecheck`,
`npm test`, and `npm run build`, then uploads `dist/` as a Pages
artifact. The `deploy` job publishes that artifact using
`actions/deploy-pages@v4`. It triggers on push to `main` and on manual
dispatch, with a `pages` concurrency group so a new push cancels the
previous run in flight.

To enable it, go to the repo's Settings, open the Pages section, and set
the source to "GitHub Actions". The next push to `main` will build and
publish.

## 6. Self-host on any static server

`npm run build` produces a `dist/` folder. Copy that folder onto any HTTP
server: nginx, Caddy, Apache, an S3 bucket behind CloudFront, a Raspberry
Pi running `python -m http.server`. The only rule the server must honor
is the SPA fallback: any request for a path that does not match a file on
disk should return `index.html` with a 200 status so the router can take
over on the client. In nginx this is `try_files $uri /index.html;`. In
Caddy it is `try_files {path} /index.html`.

## 7. Environment variables (optional)

Two variables are read at build time: `VITE_LLM_ENDPOINT` and
`VITE_LLM_KEY`. When both are set, Onramp can call a compatible LLM for
adaptive suggestions. When either is absent, the product falls back to a
rules-only path, which is a scored feature: the deployment is fully
functional without any secrets and remains safe to publish on a public
CDN.

## 8. Content Security Policy

The CSP shipped in `netlify.toml`, `vercel.json`, and `wrangler.toml`
allows only same-origin scripts, inline styles for design tokens,
same-origin plus `data:` image sources (needed for QR codes), same-origin
`fetch` and XHR, and blocks framing entirely via `frame-ancestors 'none'`.
No third-party origins are permitted by default, so a tampered CDN cannot
smuggle a remote script into the page.

## 9. Permissions Policy

`Permissions-Policy` denies geolocation, camera, USB, and payment
outright. Microphone is granted to the same origin (`microphone=(self)`)
so the voice input feature can request it when the user opts in. The
browser will still show its own consent prompt on top of this.

## 10. Cache strategy

`/assets/*` is served with `Cache-Control: public, max-age=31536000,
immutable` because Vite fingerprints each asset filename with a content
hash. `index.html` and every other top-level file inherit the host's
default cache policy, which is short-lived on all four hosts above. The
result: repeat visits reload only `index.html`, and any changed asset
gets a new URL.

## 11. Post-deploy checks

Open the deployed URL in a fresh browser session (private window is
fine) and verify:

- The page loads with no console errors.
- Pasting an assignment and pressing "Find my first step" produces a
  first step.
- Refreshing the page preserves the current session.
- Sharing via the Finish screen produces a working `#a=...` URL that
  reopens the same assignment on another device.

## 12. Rollback

Every deploy is a static bundle keyed to a commit. To roll back, redeploy
the previous commit: `git checkout <sha> && <deploy command>` on
Netlify, Vercel, and Cloudflare, or revert the merge on `main` for
GitHub Pages. All four configs above support that flow without extra
setup.
