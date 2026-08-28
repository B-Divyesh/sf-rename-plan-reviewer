import { expect, test } from '@playwright/test';
import { prepareOfflineReload, reloadOffline } from './offline';

test('390px loaded app remains usable offline after a controlled reload', async ({ page, context }) => {
  await prepareOfflineReload(page, '/');
  await reloadOffline(context, page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Review batch renames');
  await expect(page.getByText('Offline · on-device')).toBeVisible();
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt');
  await expect(page.getByText('No blocking risks found')).toBeVisible();
});

test('@claim:offline-reload reloads the demo after its first controlled visit without a connection', async ({ page, context }) => {
  await prepareOfflineReload(page);
  await reloadOffline(context, page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Inspect this risky sample plan');
  await expect(page.getByText('Offline · on-device')).toBeVisible();
  await expect(page.getByLabel('Current and new paths')).toHaveValue(/photos\/a\.jpg/);
  await expect(page.getByText('Plan needs correction')).toBeVisible();
});
