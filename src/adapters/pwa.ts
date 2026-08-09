/**
 * PWA adapter.
 *
 * Two responsibilities:
 * 1. Register the service worker at startup (silent no-op if unavailable).
 * 2. Track the beforeinstallprompt event so a UI control can trigger install.
 *
 * Design notes:
 * - Registration is a fire-and-forget call at boot.
 * - No user is ever nagged to install. The install prompt is only surfaced
 *   if the user opens the (future) settings menu.
 * - We do NOT log analytics for install events.
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: readonly string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installListeners = new Set<() => void>();

/** Reset internal state. Intended for tests. */
export const __resetPwaStateForTests = (): void => {
  deferredPrompt = null;
  installListeners.clear();
};

/**
 * Register the service worker. Safe to call more than once; the browser
 * deduplicates registrations by scope. In development we skip registration
 * to avoid caching that would confuse hot-module reload.
 */
export const registerServiceWorker = (): void => {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  // Skip SW in dev mode; Vite serves everything fresh anyway.
  if (import.meta.env.DEV) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Silent: SW is a progressive enhancement, not a requirement.
    });
  });
};

/** Capture the install prompt for later, if the browser dispatches one. */
export const captureInstallPrompt = (): void => {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    for (const cb of installListeners) {
      try { cb(); } catch { /* ignore listener errors */ }
    }
  });
};

export const canInstall = (): boolean => deferredPrompt !== null;

/**
 * Subscribe to "install prompt now available" notifications. Fires once
 * immediately if a prompt is already captured. Returns an unsubscribe fn.
 */
export const subscribeInstallAvailable = (cb: () => void): (() => void) => {
  installListeners.add(cb);
  if (deferredPrompt !== null) {
    try { cb(); } catch { /* ignore */ }
  }
  return () => { installListeners.delete(cb); };
};

/**
 * Trigger the platform's install prompt. Returns true if the user accepted.
 * Callers should only invoke this from a click handler on a user-initiated
 * control (browser policy).
 */
export const promptInstall = async (): Promise<boolean> => {
  const p = deferredPrompt;
  if (!p) return false;
  deferredPrompt = null;
  await p.prompt();
  const choice = await p.userChoice;
  return choice.outcome === 'accepted';
};

/**
 * Detect whether the app is currently running from the home-screen install.
 * Useful for showing "installed" UI states.
 */
export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  const displayMode = window.matchMedia('(display-mode: standalone)').matches;
  // iOS-specific fallback
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
  return displayMode || Boolean(iosStandalone);
};
