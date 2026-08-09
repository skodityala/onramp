import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the pwa adapter before importing App.
vi.mock('../../adapters/pwa', () => ({
  registerServiceWorker: vi.fn(),
  canInstall: vi.fn(),
  promptInstall: vi.fn(async () => true),
  subscribeInstallAvailable: vi.fn(() => () => {}),
  captureInstallPrompt: vi.fn(),
  isStandalone: () => false,
  __resetPwaStateForTests: vi.fn(),
}));

import { App } from '../../App';
import { COPY } from '../../copy';
import * as pwa from '../../adapters/pwa';

describe('install banner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the install banner when the browser reports an install is possible', () => {
    (pwa.canInstall as ReturnType<typeof vi.fn>).mockReturnValue(true);
    render(<App />);
    expect(
      screen.getByRole('dialog', { name: COPY.installTitle }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: COPY.installCta }),
    ).toBeInTheDocument();
  });

  it('hides the banner after Dismiss is clicked and does not restore in-session', () => {
    (pwa.canInstall as ReturnType<typeof vi.fn>).mockReturnValue(true);
    render(<App />);
    const dismiss = screen.getByRole('button', { name: COPY.installDismiss });
    fireEvent.click(dismiss);
    expect(
      screen.queryByRole('dialog', { name: COPY.installTitle }),
    ).not.toBeInTheDocument();
  });

  it('does not render the banner when install is not possible', () => {
    (pwa.canInstall as ReturnType<typeof vi.fn>).mockReturnValue(false);
    render(<App />);
    expect(
      screen.queryByRole('dialog', { name: COPY.installTitle }),
    ).not.toBeInTheDocument();
  });
});
