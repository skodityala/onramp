# Security Policy

Onramp is a client-side, single-page web application with no backend, no user accounts, and no server-side data collection. The threat surface is small on purpose. This document describes what we consider a security issue, how to report one, what to expect from us in response, and where the boundaries of "security" sit for a project of this shape.

## Supported versions

We support the latest minor release and the previous minor release for security fixes. Older releases will not receive backports. If a critical issue is found in an unsupported release, we will note it in `CHANGELOG.md` and in the `SECURITY.md` history table, and we will recommend an upgrade path.

| Version | Supported | Notes |
|---|---|---|
| 1.0.x | Yes | Current stable line |
| 0.x | No | Pre-release; upgrade to 1.0 |
| main branch | Best effort | Not a released version; fixes land in the next release |

The "supported" flag applies to security fixes only. Feature backports are not part of the support commitment.

## Private report channel

Please report security issues privately. Do not open a public GitHub issue for anything you believe is exploitable.

The private channel is a dedicated email inbox monitored by the maintainers. The address is published in the project README under "Security contact" and in the repository's `.github/SECURITY.md` metadata so that GitHub's private vulnerability reporting flow can surface it. If you cannot find it, please open a public issue that says only "requesting security contact" and a maintainer will reply with the address. Do not include the report body in that issue.

When reporting, please include:

- A short summary of the issue in one or two sentences.
- The affected version(s) and the environment (browser, OS, offline vs online).
- A reproduction: the exact steps, the input, and the observed outcome.
- The impact you believe the issue has, and any assumptions behind that assessment.
- Your name and how you would like to be credited, or a note that you prefer to remain anonymous.

We do not currently offer a paid bug bounty. We do offer public credit in the changelog and the release notes for the fix, at the reporter's discretion.

## Response SLA

We commit to the following response times, measured in calendar days from receipt of the report at the private channel.

| Stage | Target | What happens |
|---|---|---|
| Acknowledgement | 3 days | A human replies confirming the report was received and is being triaged. |
| Initial assessment | 7 days | A written classification of severity and whether the issue is in scope. |
| Fix or mitigation | 30 days for high and critical, 90 days for medium, best effort for low | A patch is prepared, tested, and merged; a coordinated disclosure date is set. |
| Public disclosure | Within 90 days of acknowledgement, or on the coordinated date, whichever is sooner | An advisory is published on the repository and referenced from `CHANGELOG.md`. |

If a report is out of scope, we will say so in the initial assessment and explain why. If a report needs more information to reproduce, we will ask and pause the SLA clock at that point.

## What counts as a security issue in Onramp

Because Onramp has no backend and no user accounts, most classic web vulnerabilities do not apply here. The list below describes what we consider in scope.

### In scope

| Category | Example |
|---|---|
| Cross-site scripting in rendered content | User-provided task text or share-link payload that escapes and executes as script. |
| Share link tampering that impersonates the origin | A crafted share link that could be mistaken as coming from a trusted source. |
| Local storage escalation | A path by which one origin's storage bleeds into another, or by which a share link writes to storage without user action. |
| Content-Security-Policy bypass | A path by which the shipped CSP is defeated by user input or by a third-party asset. |
| Dependency vulnerabilities | A known CVE in a dev-time or runtime dependency that materially affects users. |
| Supply-chain integrity | Evidence that a dependency has been compromised, typo-squatted, or otherwise tampered with. |
| Privacy regressions | A change that causes user data to leave the device without explicit user action. This is treated as a security issue because it violates a foundational guarantee of the tool. |

### Out of scope

| Category | Why |
|---|---|
| Feature requests framed as "security" | If the issue is that a feature could be safer if we added authentication, that is a design conversation, not a security report. |
| Self-XSS that requires the user to paste code into the console | Browsers guard against this; we cannot. |
| Missing security headers on a preview deployment | Preview deployments are not covered; the production build is. |
| Denial of service against a static site | A static site cannot be meaningfully denied service beyond hosting-provider limits. |
| "Users could copy the URL and send it to someone" | Share links are intentionally shareable. See `docs/DESIGN.md` on the share protocol. |
| Reports from automated scanners with no reproduction | We will not investigate raw scanner output without a human-written summary. |

## Third-party dependencies

Onramp's production runtime has zero third-party JavaScript dependencies. The build toolchain (TypeScript, Vite, Vitest, and a small set of type packages) is dev-time only and does not ship to users.

We monitor the dev-time dependency tree for advisories using GitHub's Dependabot and the `npm audit` command against the current lockfile. When an advisory is filed against a dev dependency, we assess it against the following criteria:

1. Does the vulnerable code path execute during our build or test?
2. Does exploitation require attacker control of an input we consume?
3. Is a patched version available on a compatible major?

If the answer to any of these is "yes," we upgrade promptly. If not, we record the decision in the security log and revisit it when a patched version lands. We do not add a runtime dependency to fix a build-time advisory.

## Cryptography scope

Onramp does not implement, wrap, or ship any cryptographic primitives. It does not encrypt user data at rest, because it does not store user data anywhere off the device. It does not sign share links, because share links carry only the user's task text and decomposition, and the trust model for a share link is "the person who sent it to you."

If a future feature requires cryptography, we will use the Web Crypto API exclusively. We will not vend our own primitives, and we will not include a general-purpose crypto library in the runtime. Any such addition is a restricted-area change per `CONTRIBUTING.md` and requires a design note.

## Coordinated disclosure

We prefer coordinated disclosure. If you find an issue, please give us a reasonable window to prepare a fix before publishing details. In return, we commit to the SLA above and to giving you credit in the advisory and the changelog.

If we miss the SLA without explanation, you are welcome to disclose after 90 days from acknowledgement. If we miss the SLA with an explanation you find unreasonable, please tell us so and we will discuss.

## History and advisories

Past advisories, if any, will be listed here with a link to the corresponding release notes and to the fix commit. As of the initial 1.0.0 release, no advisories have been filed.

## Contact of last resort

If the private channel is unreachable and the issue is time-sensitive, please open a public issue titled `URGENT: security contact needed` with no body, and a maintainer will respond within 24 hours with an alternate channel.

Thank you for helping keep Onramp and its users safe.
