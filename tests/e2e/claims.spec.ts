import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('@claim:risky-sample-review shows the supplied risky plan on the direct demo route', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Plan needs correction')).toBeVisible();
  await expect(page.getByText('Destination uses a Windows reserved name')).toBeVisible();
  await expect(page.getByText('Numbering has a gap')).toBeVisible();
  await expect(page.getByText('Rename cycle detected and staged safely')).toBeVisible();
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
});

test('@claim:demo-isolated keeps demo changes out of the real draft', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Current and new paths').fill('current,new\nreal.txt,kept.txt');
  await page.waitForTimeout(500);
  await page.goto('/demo/');
  await expect(page.getByLabel('Current and new paths')).toHaveValue(/photos\/a\.jpg/);
  await page.getByLabel('Current and new paths').fill('current,new\ndemo.txt,sample-only.txt');
  await page.waitForTimeout(500);
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).toContain('rename-plan-reviewer');
  expect(databases).toContain('demo:rename-plan-reviewer');
  await page.goto('/');
  await expect(page.getByLabel('Current and new paths')).toHaveValue('current,new\nreal.txt,kept.txt');
});

test('@claim:local-only sends no request away from this site while reviewing demo data', async ({ page }) => {
  const external: string[] = [];
  let appOrigin = '';
  page.on('request', (request) => {
    const requestOrigin = new URL(request.url()).origin;
    if (!appOrigin) appOrigin = requestOrigin;
    else if (requestOrigin !== appOrigin) external.push(request.url());
  });
  await page.goto('/demo/');
  await page.getByLabel('Current and new paths').fill('current,new\nprivate.txt,reviewed.txt');
  await expect(page.getByText('No blocking risks found')).toBeVisible();
  expect(external).toEqual([]);
});

test('@claim:dry-run-export downloads a plan that prints commands instead of renaming files', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt\nb.txt,a.txt');
  await expect(page.getByText('No blocking risks found')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export shell plan' }).click();
  const download = await downloadPromise;
  expect(readFileSync((await download.path())!, 'utf8')).toContain('# Mode: DRY RUN — prints commands only');
});

test('@claim:plus-offer-status proves the stated Plus package and existing-license restore path', async ({ page }) => {
  await page.context().route('https://api.sociobot.in/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/demo/');
  await expect(page.getByText('Plus is priced at US $12 once.')).toBeVisible();
  await expect(page.getByText('It adds a combined Markdown review packet with findings and both scripts.')).toBeVisible();
  await expect(page.getByText('Every safety check, dry run, CSV and undo export stays free.')).toBeVisible();
  await expect(page.getByText('Checkout is not available right now.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Buy Plus/ })).toHaveCount(0);

  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt');
  await page.getByLabel('Have a license? Paste it').fill('existing-license');
  await page.getByRole('button', { name: 'Verify', exact: true }).click();
  await expect(page.getByText('Plus restored on this device.')).toBeVisible();
  const packetButton = page.getByRole('button', { name: 'Export Plus review packet' });
  await expect(packetButton).toBeEnabled();
  const downloadPromise = page.waitForEvent('download');
  await packetButton.click();
  const packet = readFileSync((await (await downloadPromise).path())!, 'utf8');
  expect(packet).toContain('## Shell plan');
  expect(packet).toContain('## PowerShell plan');
});
