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
