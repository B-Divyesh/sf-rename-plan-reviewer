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
  await expect(page.getByText('New Plus purchases are temporarily unavailable')).toBeVisible();
  await expect(page.getByRole('link', { name: /Buy Plus/ })).toHaveCount(0);
});

test('blocks root escapes, preserves quoted whitespace, and finds case-folded parents', async ({ page }) => {
  const input = page.getByLabel('Current and new paths');
  await input.fill('current,new\n../outside.txt,safe.txt\ninside.txt,C:\\outside\\bad.txt');
  await expect(page.getByText('Source path leaves the working folder')).toBeVisible();
  await expect(page.getByText('Absolute path is unsafe')).toBeVisible();
  await expect(page.getByRole('button', { name: /Export shell plan/ })).toBeDisabled();

  await input.fill('current,new\na.txt,"bad "');
  await expect(page.getByText('Name ends with a dot or space')).toBeVisible();
  await page.getByText('Inspect mapping table').click();
  expect(await page.locator('tbody tr td code').nth(1).textContent()).toBe('bad ');

  await input.fill('current,new\nFolder,Archive\nother.txt,folder/other.txt');
  await expect(page.getByText('Destination sits inside another moving path')).toBeVisible();
  await expect(page.getByRole('button', { name: /Export shell plan/ })).toBeDisabled();
});

test('keyboard path and accessibility have no serious violations', async ({ page }, testInfo) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to rename plan' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const mappingTab = page.getByRole('tab', { name: 'Mapping table' });
  const regexTab = page.getByRole('tab', { name: 'Regex rule' });
  await mappingTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(regexTab).toBeFocused();
  await expect(regexTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByLabel('Find pattern')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(mappingTab).toBeFocused();
  await page.getByLabel('Import CSV or JSON').focus();
  const importFocus = await page.locator('.file-button').evaluate((element) => ({ outline: getComputedStyle(element).outlineStyle, shadow: getComputedStyle(element).boxShadow }));
  expect(importFocus.outline).not.toBe('none');
  expect(importFocus.shadow).not.toBe('none');
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  if (testInfo.project.name.startsWith('mobile')) {
    const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.viewport);
  }
});

test('reviews 1,000 mappings within the interaction budget', async ({ page }) => {
  const input = ['current,new', ...Array.from({ length: 1_000 }, (_, index) => `in/file-${index}.jpg,out/photo-${String(index).padStart(4, '0')}.jpg`)].join('\n');
  const elapsed = await page.getByLabel('Current and new paths').evaluate((element, value) => {
    const started = performance.now();
    (element as HTMLTextAreaElement).value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    return performance.now() - started;
  }, input);
  expect(elapsed).toBeLessThan(200);
  await expect(page.getByText('1,000 mappings checked; first 100 shown below')).toBeVisible();
});

test('keeps plans local and uses only the production API for license verification', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== new URL(page.url()).origin) externalRequests.push(request.url());
  });
  await page.getByLabel('Current and new paths').fill('current,new\nprivate-name.txt,reviewed-name.txt');
  await expect(page.getByText('No blocking risks found')).toBeVisible();
  expect(externalRequests).toEqual([]);

  let verifyUrl = '';
  await page.context().route('https://api.sociobot.in/**', async (route) => {
    verifyUrl = route.request().url();
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ valid: false, reason: 'invalid' }) });
  });
  await page.goto('/?license=qa-invalid');
  await expect(page.getByText('License no longer active')).toBeVisible();
  expect(page.url()).not.toContain('license=');
  expect(verifyUrl).toContain('https://api.sociobot.in/api/v1/products/rename-plan-reviewer/verify?license=qa-invalid');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:rename-plan-reviewer'))).toBe('qa-invalid');
});

test('privacy and terms pages remain semantic and accessible', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
});

test('offers and applies an installed service-worker update', async ({ page }) => {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js?test-update=1');
  });
  await expect(page.getByText('A fresh notebook is ready.')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Update now' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Catch the collision');
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
