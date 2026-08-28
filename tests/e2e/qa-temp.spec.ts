import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('live UI export executes a quoted swap and is reversible', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Current and new paths').fill("current,new\na's file.txt,b.txt\nb.txt,a's file.txt");
  await expect(page.getByText('No blocking risks found')).toBeVisible();
  await page.getByLabel('Generate live commands').check();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export shell plan/ }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const directory = mkdtempSync(join(tmpdir(), 'rpr-live-ui-'));
  try {
    writeFileSync(join(directory, "a's file.txt"), 'first');
    writeFileSync(join(directory, 'b.txt'), 'second');
    const script = join(directory, 'plan.sh');
    writeFileSync(script, readFileSync(downloadPath!, 'utf8'));
    const output = execFileSync('/bin/sh', [script], { cwd: directory, encoding: 'utf8' });
    expect(output).toContain('Applied 2 renames.');
    expect(readFileSync(join(directory, "a's file.txt"), 'utf8')).toBe('second');
    expect(readFileSync(join(directory, 'b.txt'), 'utf8')).toBe('first');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('live UI export canonicalizes portable backslashes and repeated-separator dependencies', async ({ page }) => {
  await page.goto('/');
  const input = page.getByLabel('Current and new paths');
  await input.fill('current,new\na.txt,folder\\b.txt');
  await expect(page.getByText('No blocking risks found')).toBeVisible();
  await page.getByLabel('Generate live commands').check();

  let downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export shell plan/ }).click();
  let download = await downloadPromise;
  let directory = mkdtempSync(join(tmpdir(), 'rpr-ui-backslash-'));
  try {
    writeFileSync(join(directory, 'a.txt'), 'source');
    mkdirSync(join(directory, 'folder'));
    const script = join(directory, 'plan.sh');
    const content = readFileSync((await download.path())!, 'utf8');
    expect(content).toContain("'folder/b.txt'");
    expect(content).not.toContain("'folder\\b.txt'");
    writeFileSync(script, content);
    expect(execFileSync('/bin/sh', [script], { cwd: directory, encoding: 'utf8' })).toContain('Applied 1 renames.');
    expect(readFileSync(join(directory, 'folder', 'b.txt'), 'utf8')).toBe('source');
    expect(existsSync(join(directory, 'folder\\b.txt'))).toBe(false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }

  await input.fill('current,new\na.txt,folder//b.txt\nfolder/b.txt,c.txt');
  await expect(page.getByText('No blocking risks found')).toBeVisible();
  downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export shell plan/ }).click();
  download = await downloadPromise;
  directory = mkdtempSync(join(tmpdir(), 'rpr-ui-repeated-'));
  try {
    writeFileSync(join(directory, 'a.txt'), 'first');
    mkdirSync(join(directory, 'folder'));
    writeFileSync(join(directory, 'folder', 'b.txt'), 'second');
    const script = join(directory, 'plan.sh');
    writeFileSync(script, readFileSync((await download.path())!, 'utf8'));
    expect(execFileSync('/bin/sh', [script], { cwd: directory, encoding: 'utf8' })).toContain('Applied 2 renames.');
    expect(readFileSync(join(directory, 'folder', 'b.txt'), 'utf8')).toBe('first');
    expect(readFileSync(join(directory, 'c.txt'), 'utf8')).toBe('second');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('observe directory-only destination changes rename semantics', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,folder/');
  await expect(page.getByText('No blocking risks found')).toBeVisible();
  await page.getByLabel('Generate live commands').check();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export shell plan/ }).click();
  const download = await downloadPromise;
  const directory = mkdtempSync(join(tmpdir(), 'rpr-dir-target-'));
  try {
    writeFileSync(join(directory, 'a.txt'), 'source');
    mkdirSync(join(directory, 'folder'));
    const script = join(directory, 'plan.sh');
    writeFileSync(script, readFileSync((await download.path())!, 'utf8'));
    expect(() => execFileSync('/bin/sh', [script], { cwd: directory, encoding: 'utf8' })).toThrow(/Destination already exists: folder\//);
    expect(readFileSync(join(directory, 'a.txt'), 'utf8')).toBe('source');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('structurally invalid JSON import recovers without an uncaught page error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByLabel('Import CSV or JSON').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"rows":[{}]}') });
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
  await expect(page.getByText('That JSON is not a Rename Plan Reviewer plan export.')).toBeVisible();
});

test('Plus packet follows the script safety gate and exports only a safe plan', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:rename-plan-reviewer', 'qa-cached');
    localStorage.setItem('sb_license:rename-plan-reviewer:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.goto('/');
  const packet = page.getByRole('button', { name: 'Export Plus review packet' });
  await expect(packet).toBeDisabled();
  await page.getByLabel('Current and new paths').fill('current,new\n../outside.txt,safe.txt');
  await expect(page.getByText('Source path leaves the working folder')).toBeVisible();
  await page.getByLabel('Generate live commands').check();
  await expect(page.getByRole('button', { name: /Export shell plan/ })).toBeDisabled();
  await expect(packet).toBeDisabled();
  await expect(page.getByText('Resolve error findings before exporting a review packet with scripts.')).toBeVisible();

  await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt');
  await expect(page.getByText('No blocking risks found')).toBeVisible();
  await expect(packet).toBeEnabled();
  const downloadPromise = page.waitForEvent('download');
  await packet.click();
  const content = readFileSync((await (await downloadPromise).path())!, 'utf8');
  expect(content).not.toContain('../outside.txt');
  expect(content).toContain("mv -- 'a.txt' '.rpr-");
  expect(content).toContain("' 'b.txt'");
});

test('desktop and 390 mobile states meet semantics, axe, motion, focus, and no-overflow checks', async ({ browser }) => {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto('/');
    await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt\nb.txt,a.txt');
    expect(await page.locator('h1').count()).toBe(1);
    expect(await page.locator('main').count()).toBe(1);
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const animationName = await page.locator('.finding').first().evaluate(element => getComputedStyle(element).animationName);
    expect(animationName).toBe('none');
    await page.getByRole('tab', { name: 'Mapping table' }).focus();
    const focus = await page.getByRole('tab', { name: 'Mapping table' }).evaluate(element => ({ outline: getComputedStyle(element).outlineStyle, shadow: getComputedStyle(element).boxShadow }));
    expect(focus.outline).not.toBe('none');
    expect(focus.shadow).not.toBe('none');
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    await page.screenshot({ path: `/tmp/rpr-${viewport.width}.png`, fullPage: true });
    await context.close();
  }
});

test('the populated 390px demo findings region is keyboard-scrollable and has no serious axe findings', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/demo/');
  const findings = page.locator('.findings');
  await expect(findings).toBeVisible();
  await findings.focus();
  await expect(findings).toBeFocused();
  await page.keyboard.press('ArrowDown');
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await context.close();
});

test('manifest has no Chromium installability errors', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  const session = await context.newCDPSession(page);
  const manifest = await session.send('Page.getAppManifest');
  expect(manifest.errors).toEqual([]);
  expect(manifest.data).toContain('"display": "standalone"');
  await context.close();
});
