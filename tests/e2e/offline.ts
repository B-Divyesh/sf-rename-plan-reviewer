import { expect, type BrowserContext, type Page } from '@playwright/test';

/**
 * Establish a real controlled client before simulating a lost connection.
 * `navigator.serviceWorker.ready` only guarantees an active registration; the
 * current document is not necessarily controlled until its next navigation.
 */
export async function prepareOfflineReload(page: Page, path = '/demo/'): Promise<void> {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.state === 'activated';
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => navigator.serviceWorker.controller?.state === 'activated');

  const state = await page.evaluate(async () => ({
    controlled: Boolean(navigator.serviceWorker.controller),
    cacheNames: await caches.keys()
  }));
  expect(state.controlled).toBe(true);
  expect(state.cacheNames.some((name) => name.startsWith('rpr-'))).toBe(true);
}

export async function reloadOffline(context: BrowserContext, page: Page): Promise<void> {
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
}
