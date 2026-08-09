import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the voice adapter before importing Start.
vi.mock('../../adapters/voice', () => ({
  voiceAvailable: vi.fn(),
  startVoice: vi.fn(() => ({ stop: () => {}, abort: () => {} })),
}));

import { Start } from '../Start';
import { COPY } from '../../copy';
import * as voice from '../../adapters/voice';

describe('voice input on Start', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the voice button when voice input is available', () => {
    (voice.voiceAvailable as ReturnType<typeof vi.fn>).mockReturnValue(true);
    render(<Start onBegin={() => {}} />);
    expect(
      screen.getByRole('button', { name: COPY.voiceStart }),
    ).toBeInTheDocument();
  });

  it('does not render the voice button when unavailable', () => {
    (voice.voiceAvailable as ReturnType<typeof vi.fn>).mockReturnValue(false);
    render(<Start onBegin={() => {}} />);
    expect(
      screen.queryByRole('button', { name: COPY.voiceStart }),
    ).not.toBeInTheDocument();
  });

  it('does not render any user-facing warning when voice is unavailable', () => {
    (voice.voiceAvailable as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const { container } = render(<Start onBegin={() => {}} />);
    expect(container.textContent).not.toContain(COPY.voiceUnavailable);
  });
});
