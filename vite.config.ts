import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json' with { type: 'json' };

/**
 * Base path.
 *
 * Netlify, Vercel, Cloudflare Pages and self-hosting all serve from the
 * domain root, so the default is '/'. GitHub Pages serves a project site
 * from '/<repo>/', so the Pages workflow sets VITE_BASE=/onramp/ before
 * building. Nothing else needs to change per host.
 */
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
