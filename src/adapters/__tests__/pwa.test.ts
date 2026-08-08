import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetPwaStateForTests,
  canInstall,
  captureInstallPrompt,
  isStandalone,
  promptInstall,
  registerServiceWorker,
} from '../pwa';

describe('pwa adapter', () => {
  beforeEach(() => {
    __resetPwaStateForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('registerServiceWorker', () => {
    it('does not throw when serviceWorker is missing from navigator', () => {
      // navigator exists in jsdom but lacks serviceWorker by default
      const originalDescriptor = Object.getOwnPropertyDescriptor(
        Navigator.prototype,
        'serviceWorker',
      );
      if (originalDescriptor) {
        // If jsdom provides it, remove it for this test
        Object.defineProperty(Navigator.prototype, 'serviceWorker', {
          configurable: true,
          get: () => undefined,
        });
      }
      expect(() => registerServiceWorker()).not.toThrow();
      if (originalDescriptor) {
        Object.defineProperty(Navigator.prototype, 'serviceWorker', originalDescriptor);
      }
    });

    it('does not throw when window is undefined', () => {
      const originalWindow = globalThis.window;
      // Simulate SSR by removing window
      delete (globalThis as { window?: unknown }).window;
      expect(() => registerServiceWorker()).not.toThrow();
      (globalThis as { window?: unknown }).window = originalWindow;
    });
  });

  describe('captureInstallPrompt', () => {
    it('attaches a beforeinstallprompt listener on window', () => {
      const spy = vi.spyOn(window, 'addEventListener');
      captureInstallPrompt();
      const hasListener = spy.mock.calls.some(
        (call) => call[0] === 'beforeinstallprompt',
      );
      expect(hasListener).toBe(true);
    });
  });

  describe('canInstall', () => {
    it('returns false before any prompt event has fired', () => {
      expect(canInstall()).toBe(false);
    });
  });

  describe('promptInstall', () => {
    it('returns false when no deferred prompt exists', async () => {
      const result = await promptInstall();
      expect(result).toBe(false);
    });
  });

  describe('isStandalone', () => {
    it('returns false in jsdom with no standalone display mode', () => {
      // jsdom's matchMedia returns matches: false by default
      if (!window.matchMedia) {
        window.matchMedia = (() => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        })) as unknown as typeof window.matchMedia;
      }
      expect(isStandalone()).toBe(false);
    });
  });
});
