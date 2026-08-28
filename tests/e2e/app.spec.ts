import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { prepareOfflineReload, reloadOffline } from './offline';

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
  await expect(page.getByText('Checkout is not available right now')).toBeVisible();
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

test('demo controls meet mobile touch targets and keep safe spacing', async ({ page }) => {
  await page.goto('/demo/');
  const controls = [
    page.getByRole('button', { name: 'Reset demo', exact: true }),
    page.getByRole('link', { name: 'Start for real', exact: true })
  ];
  const boxes = await Promise.all(controls.map((control) => control.boundingBox()));
  for (const box of boxes) {
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  const [first, second] = boxes as [NonNullable<(typeof boxes)[number]>, NonNullable<(typeof boxes)[number]>];
  const horizontalGap = Math.max(second.x - (first.x + first.width), first.x - (second.x + second.width));
  const verticalGap = Math.max(second.y - (first.y + first.height), first.y - (second.y + second.height));
  expect(Math.max(horizontalGap, verticalGap)).toBeGreaterThanOrEqual(8);
});

test('navigation and legal links meet touch targets and keep safe spacing', async ({ page }) => {
  await page.goto('/demo/');

  const links = page.locator('.site-nav a, .legal-links a, footer a');
  await expect(links).toHaveCount(8);
  const targets = await links.evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { label: element.textContent?.trim(), width: box.width, height: box.height };
  }));
  for (const target of targets) {
    expect(target.width, `${target.label} target width`).toBeGreaterThanOrEqual(44);
    expect(target.height, `${target.label} target height`).toBeGreaterThanOrEqual(44);
  }

  for (const nav of [page.locator('.site-nav'), page.locator('footer nav')]) {
    const boxes = await nav.locator('a').evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right };
    }));
    for (let index = 1; index < boxes.length; index += 1) {
      expect(boxes[index].left - boxes[index - 1].right).toBeGreaterThanOrEqual(8);
    }
  }
});

test('publishes the exact social preview and a visible build identifier', async ({ page }) => {
  const socialUrl = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(socialUrl).toBe('https://rename-plan-reviewer.sociobot.in/assets/rename-ledger-social.webp');
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
  const dimensions = await page.evaluate(async (url) => {
    const image = new Image();
    image.src = new URL(url!).pathname;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, socialUrl);
  expect(dimensions).toEqual({ width: 1200, height: 630 });
  await expect(page.locator('[data-build-id]')).toBeVisible();
  await expect(page.locator('[data-build-id]')).toHaveText('Version 1.0.2');
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
    await expect(page.locator('[data-build-id]')).toHaveText('Version 1.0.2');
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
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Review batch renames');
});

test('loaded app remains usable offline', async ({ page, context }) => {
  await prepareOfflineReload(page, '/');
  await reloadOffline(context, page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Review batch renames');
  await expect(page.getByText('Offline · on-device')).toBeVisible();
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt');
  await expect(page.getByText('No blocking risks found')).toBeVisible();
});
