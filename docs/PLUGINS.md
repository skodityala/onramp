# Plugins

## The Onramp Plugin System

Extension for the ecosystem. Plugins can add templates, physicalisations, and post-check hooks WITHOUT modifying core files. They cannot alter the seven rules or override the Checker.

The plugin system exists because Onramp has a small core of behaviours that must remain stable (the atomicity rules, the decomposition pipeline, the audit contract), and a much larger surface of content and language-specific mappings that will naturally grow over time. Rather than accepting pull requests that touch the core for every new template or translation, the plugin system provides a stable extension seam. The core stays small; the ecosystem grows around it.

A plugin is an ordinary JavaScript object that conforms to the `Plugin` interface. There is no dynamic loading, no sandboxing, and no capability system. Plugins run in the same process as the app and have the same trust level as core code. This is a deliberate choice: Onramp is a client-side application, and any plugin the user installs is code they have chosen to run. The value of the plugin API is not isolation; it is a stable contract that lets plugin authors and core maintainers work independently.

## A minimal plugin

```ts
import type { Plugin } from './core/plugins';

export const languagePlugin: Plugin = {
  name: 'onramp-plugin-i18n-fr',
  version: '1.0.0',
  install(reg) {
    reg.registerTemplate({
      keys: ['dissertation', 'redaction'],
      steps: [
        { text: 'Ouvre un nouveau document et tape le titre.', seconds: 40 },
        { text: 'Ecris une phrase resumant ta reponse.', seconds: 90 },
      ],
    });
    reg.registerPhysicalisation(
      'reflechir',
      'Ecris un mot qui te vient a l esprit.',
    );
  },
};
```

Register at boot:

```ts
import { use } from './core/plugins';
import { languagePlugin } from 'onramp-plugin-i18n-fr';
use(languagePlugin);
```

The `use()` function is called during application bootstrap, before the first assignment is decomposed. Plugins registered after the first decomposition will still take effect for subsequent runs, but any tree already built will not be revisited.

## What plugins can do

### `registerTemplate(t)`

Add a new assignment shape. `t.keys` are substrings matched against the assignment; the first match wins in order of registration. `t.steps` are the authored decomposition. Each step gets the standard atomicity checker treatment during decomposition, so a template with weak steps will still be broken down further.

Templates are the fastest way to add support for a new kind of assignment. If a user's assignment matches a template key, the decomposer uses the template's steps as its starting point rather than deriving children from scratch. This gives plugin authors a way to encode domain expertise (what the good first step for a math homework problem looks like, for example) without needing to touch the decomposer.

A template does not bypass the Checker. Every step in a template is checked exactly as if the decomposer had generated it. This is a load-bearing invariant: it means a poorly authored template cannot corrupt the tree.

### `registerPhysicalisation(verb, opener)`

Add an abstract-verb-to-physical-opener mapping. When the decomposer sees an ABSTRACT step with a leading verb that has a plugin physicalisation, it uses the plugin's opener.

Physicalisations are the smallest plugin unit and the highest-leverage one. A single mapping like `reflect -> write a word that comes to mind` converts an entire class of abstract steps into something a student can act on. Language packs are typically dozens of physicalisations plus a handful of templates.

### `registerPostCheckHook(hook)`

Called after every atomicity check with (text, seconds, result). Hooks are read-only observers; they cannot modify the result. A throwing hook is caught so it cannot break the hot path.

Use cases: logging, analytics (if the app operator wants them), debugging. A hook that wants to persist data should do so through an adapter it owns, not through any core storage API. This keeps plugin data out of the core session model.

## What plugins cannot do

- Modify the seven checker rules
- Override the checker's decision
- Remove or replace existing templates or physicalisations
- Access session state directly
- Do I/O in the hot path (post-check hooks are the safe seam for this)

These constraints are enforced by the shape of the plugin API. There is no `unregisterTemplate` function, no way to obtain a reference to the checker, and no accessor for the current session. If a plugin needs to observe session state, it should register a post-check hook and derive what it needs from the arguments passed in.

## Publishing a plugin

Plugins are ordinary npm packages that export a `Plugin` object.

Naming convention: `onramp-plugin-<slug>`. The slug should describe the plugin's purpose in one or two words. Language packs use the pattern `onramp-plugin-i18n-<locale>`.

Peer dependency: onramp itself, `^1.0.0`. Do not bundle onramp into your plugin; the host application provides it. Bundling risks version drift and duplicate module instances, which would cause the plugin's `Plugin` type to be structurally identical to but nominally different from the host's.

Include a README that documents which templates and physicalisations the plugin adds, and which languages or domains it targets. If your plugin has any runtime configuration, document the shape and defaults.

## Composition

Multiple plugins compose. Templates append; physicalisations replace when keys collide (later registration wins); hooks run in registration order.

The template append rule means the order of `use()` calls determines which template matches an ambiguous assignment. If two plugins register templates whose keys both match a given assignment, the earlier-registered plugin wins. Host applications that want deterministic behaviour should register plugins in a stable order (typically alphabetical by name).

The physicalisation replace rule is the opposite: later wins. This lets a locale-specific plugin override a more generic one loaded earlier. If a user has both a general English pack and a specific K-12 English pack, and the K-12 pack is loaded second, the K-12 physicalisations take effect.

Hooks run in registration order and their return values are ignored. If a hook throws, the error is caught and logged to the audit trail, but the pipeline continues. This is by design: a broken analytics plugin must never break a student's decomposition.

## Testing plugins

The plugin registry is resettable via `_resetPlugins()` (test-only). Import it in your plugin's tests:

```ts
import { _resetPlugins, use } from 'onramp/core/plugins';

beforeEach(() => _resetPlugins());
```

The underscore prefix marks this as an internal, test-only export. Do not call `_resetPlugins()` from application code; the behaviour of a running app after a mid-session reset is undefined.

A well-tested plugin has at least: a test that registration succeeds without error, a test for each template that verifies the decomposer produces the expected first step, and a test for each physicalisation that verifies the abstract verb resolves to the expected opener. Snapshot tests against a fixture of representative assignments are a good way to catch regressions when the plugin is updated.
