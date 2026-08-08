import type { Session } from '../core/types';

const KEY = 'onramp.session.v1';

export const saveSession = (s: Session): void => {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ }
};

export const loadSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch { return null; }
};

export const clearSession = (): void => {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
};
