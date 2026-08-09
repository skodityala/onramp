/**
 * QR code generator for the share flow. Uses the `qrcode` package to render
 * to a data URL for use as an <img src>.
 *
 * The generator is entirely client-side. The URL to encode is typically the
 * result of `shareUrl(...)` from adapters/link.ts. No data leaves the device.
 */

import QRCode from 'qrcode';

export interface QROptions {
  size?: number;         // pixel size, default 240
  margin?: number;       // quiet-zone modules, default 2
  colorDark?: string;    // default #12151A (--ink)
  colorLight?: string;   // default #FAF9F6 (--bg)
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/** Render a QR code as a PNG data URL. */
export const toDataUrl = async (text: string, opts: QROptions = {}): Promise<string> => {
  return QRCode.toDataURL(text, {
    width: opts.size ?? 240,
    margin: opts.margin ?? 2,
    color: {
      dark: opts.colorDark ?? '#12151A',
      light: opts.colorLight ?? '#FAF9F6',
    },
    errorCorrectionLevel: opts.errorCorrectionLevel ?? 'M',
  });
};

/** Render a QR code as an SVG string (crisp at any size, no rasterisation). */
export const toSvg = async (text: string, opts: QROptions = {}): Promise<string> => {
  return QRCode.toString(text, {
    type: 'svg',
    width: opts.size ?? 240,
    margin: opts.margin ?? 2,
    color: {
      dark: opts.colorDark ?? '#12151A',
      light: opts.colorLight ?? '#FAF9F6',
    },
    errorCorrectionLevel: opts.errorCorrectionLevel ?? 'M',
  });
};

/** Convenience alias used by view code. Same as toDataUrl. */
export const generateQRCode = (text: string, opts: QROptions = {}): Promise<string> =>
  toDataUrl(text, opts);

/** Whether QR generation is usable in the current runtime. */
export const available = (): boolean => typeof QRCode !== 'undefined';
