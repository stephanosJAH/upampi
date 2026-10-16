// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://upampi.com',
  output: 'static',
  trailingSlash: 'ignore',
  // Only `src/pages/api/contact.ts` opts out of prerendering; the adapter serves it.
  adapter: node({ mode: 'standalone' }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.endsWith('/404/') && !page.endsWith('/404'),
      i18n: undefined,
    }),
  ],
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  security: {
    checkOrigin: true,
    // Astro only trusts Host / X-Forwarded-* for these hosts. Without this, requests
    // proxied by Caddy/Nginx resolve to http://localhost:4321 and no-JS form posts
    // from https://upampi.com fail the origin check (403).
    allowedDomains: [
      { hostname: 'upampi.com', protocol: 'https' },
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
    ],
  },
  server: { port: 5179, host: true },
  build: { inlineStylesheets: 'auto', format: 'directory' },
  vite: {
    build: {
      cssMinify: true,
      chunkSizeWarningLimit: 700,
    },
  },
});
