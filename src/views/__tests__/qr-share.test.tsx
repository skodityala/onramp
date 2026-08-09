import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the qr adapter before importing Finish.
vi.mock('../../adapters/qr', () => ({
  generateQRCode: vi.fn(),
  available: () => true,
  toDataUrl: vi.fn(),
  toSvg: vi.fn(),
}));

import { Finish } from '../Finish';
import type { Session } from '../../core/types';
import { COPY } from '../../copy';
import * as qr from '../../adapters/qr';

const baseSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'x', assignment: 'my task', createdAt: 'now', steps: [], cursor: '',
  done: [], timings: {}, typed: {}, ...overrides,
});

describe('Finish QR share', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a QR image with a data URL when generation succeeds', async () => {
    const dataUrl = 'data:image/png;base64,AAAA';
    (qr.generateQRCode as ReturnType<typeof vi.fn>).mockResolvedValue(dataUrl);
    render(<Finish session={baseSession()} onRestart={() => {}} />);
    const img = await waitFor(() =>
      screen.getByRole('img', { name: COPY.qrAlt }),
    );
    expect(img.getAttribute('src')).toMatch(/^data:/);
  });

  it('renders the caption alongside the QR image', async () => {
    (qr.generateQRCode as ReturnType<typeof vi.fn>).mockResolvedValue(
      'data:image/png;base64,ZZZZ',
    );
    render(<Finish session={baseSession()} onRestart={() => {}} />);
    await waitFor(() =>
      screen.getByRole('img', { name: COPY.qrAlt }),
    );
    expect(screen.getByText(COPY.qrHeading)).toBeInTheDocument();
  });

  it('renders no QR image if generation rejects', async () => {
    (qr.generateQRCode as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('nope'),
    );
    render(<Finish session={baseSession()} onRestart={() => {}} />);
    // Give the effect a chance to settle.
    await new Promise((r) => setTimeout(r, 20));
    expect(
      screen.queryByRole('img', { name: COPY.qrAlt }),
    ).not.toBeInTheDocument();
  });
});
