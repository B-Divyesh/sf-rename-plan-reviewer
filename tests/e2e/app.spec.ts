import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('rename-plan-reviewer');
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    });
  });
  await page.reload();
});

test('reviews risky input, fixes it, and downloads a dry-run plan', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.getByRole('button', { name: 'Load risky example' }).click();
  await expect(page.getByText('Plan needs correction')).toBeVisible();
  await expect(page.getByText('Destination uses a Windows reserved name')).toBeVisible();
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt\nb.txt,a.txt');
  await expect(page.getByText('No blocking risks found')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export shell plan/ }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('rename-plan.sh');
  expect(consoleErrors).toEqual([]);
});

test('keyboard path and accessibility have no serious violations', async ({ page }, testInfo) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to rename plan' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  if (testInfo.project.name.startsWith('mobile')) {
    const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.viewport);
  }
});

test('loaded app remains usable offline', async ({ page, context }) => {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Catch the collision');
  await expect(page.getByText('Offline · on-device')).toBeVisible();
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt');
  await expect(page.getByText('No blocking risks found')).toBeVisible();
});
