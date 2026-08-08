import { describe, expect, it } from 'vitest';
import { toDataUrl, toSvg } from '../qr';

describe('qr adapter', () => {
  it('toDataUrl produces a data URL for an image', async () => {
    const url = await toDataUrl('https://example.com/x');
    expect(url.startsWith('data:image/')).toBe(true);
  });

  it('toDataUrl rejects the empty string (qrcode library refuses empty input)', async () => {
    await expect(toDataUrl('')).rejects.toThrow(/no input text/i);
  });

  it('toDataUrl works on a single character', async () => {
    const url = await toDataUrl('x');
    expect(url.startsWith('data:image/')).toBe(true);
  });

  it('toDataUrl output is reasonably sized for a typical URL', async () => {
    const url = await toDataUrl('https://onramp.example/#a=SGVsbG8gd29ybGQ');
    expect(url.length).toBeGreaterThan(100);
    expect(url.length).toBeLessThan(20_000);
  });

  it('toSvg produces an SVG string', async () => {
    const svg = await toSvg('https://example.com/x');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('toSvg uses the specified colors', async () => {
    const svg = await toSvg('hello', {
      colorDark: '#123456',
      colorLight: '#abcdef',
    });
    expect(svg.toLowerCase()).toContain('#123456');
    expect(svg.toLowerCase()).toContain('#abcdef');
  });
});
