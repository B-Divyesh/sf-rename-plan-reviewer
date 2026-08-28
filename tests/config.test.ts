import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('production response policy', () => {
  const config = JSON.parse(readFileSync(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8')) as {
    globalHeaders: Record<string, string>;
    mimeTypes: Record<string, string>;
    routes: Array<{ route: string; headers: Record<string, string> }>;
    responseOverrides?: Record<string, { rewrite: string; statusCode: number }>;
  };

  it('serves the manifest with its standard MIME type and restrictive browser policies', () => {
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  });

  it('gives immutable caching only to hashed build assets and keeps the worker revalidatable', () => {
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers['Cache-Control']).toContain('immutable');
    expect(config.routes.find((route) => route.route === '/assets/rename-ledger.webp')?.headers['Cache-Control']).not.toContain('immutable');
    expect(config.routes.find((route) => route.route === '/assets/rename-ledger-social.webp')?.headers['Cache-Control']).not.toContain('immutable');
    expect(config.routes.find((route) => route.route === '/sw.js')?.headers['Cache-Control']).toBe('no-cache');
  });

  it('ships crawl assets and routes an unknown path to the designed 404 document', () => {
    expect(config.responseOverrides?.['404']).toMatchObject({ rewrite: '/404/index.html', statusCode: 404 });
    expect(readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8')).toContain('Sitemap:');
    expect(readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8')).toContain('/demo/');
  });
});
