import { expect, test, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { shellPlan, stageRows } from '../../src/export';
import type { Assumptions, RenameRow } from '../../src/types';

const assumptions: Assumptions = { caseInsensitive: true, unicode: 'NFC', platform: 'portable' };

async function downloadText(page: Page, buttonName: string): Promise<string> {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: buttonName }).click();
  return readFileSync((await (await pending).path())!, 'utf8');
}

test('@claim:risky-sample-review opens a populated reviewer in the first demo viewport', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByLabel('Current and new paths')).toHaveValue(/photos\/a\.jpg/);
  await expect(page.getByText('Plan needs correction')).toBeVisible();
  await expect(page.getByText('Destination uses a Windows reserved name')).toBeVisible();
  await expect(page.getByText('Numbering has a gap')).toBeVisible();
  await expect(page.getByText('Rename cycle detected and staged safely')).toBeVisible();
  const viewport = page.viewportSize()!;
  for (const locator of [page.getByLabel('Current and new paths'), page.locator('.verdict')]) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(viewport.height);
    expect(box!.y + box!.height).toBeGreaterThan(0);
  }
  await page.screenshot({ path: testInfo.outputPath(`demo-first-screen-${viewport.width}.png`) });
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByLabel('Current and new paths')).toHaveValue(/notes\.txt,CON\.txt/);
});

test('@claim:demo-isolated keeps demo changes out of the real draft and resets only the sample', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Current and new paths').fill('current,new\nreal.txt,kept.txt');
  await page.waitForTimeout(500);
  await page.goto('/demo/');
  await page.getByLabel('Current and new paths').fill('current,new\ndemo.txt,sample-only.txt');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Current and new paths')).toHaveValue(/photos\/a\.jpg/);
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).toContain('rename-plan-reviewer');
  expect(databases).toContain('demo:rename-plan-reviewer');
  await page.getByRole('link', { name: 'Start for real' }).click();
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
  expect(await downloadText(page, 'Export shell plan')).toContain('# Mode: DRY RUN — prints commands only');
});

test('@claim:collision-and-path-risks reports duplicate destinations, root escapes, and absolute paths', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,same.txt\nb.txt,same.txt\n../outside.txt,safe.txt\ninside.txt,/absolute.txt');
  await expect(page.getByText('Two renames share a destination')).toBeVisible();
  await expect(page.getByText('Source path leaves the working folder')).toBeVisible();
  await expect(page.getByText('Absolute path is unsafe')).toBeVisible();
});

test('@claim:input-methods accepts pasted mappings, imported files, and regex rules', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Use another input method' }).click();
  const input = page.getByLabel('Current and new paths');
  await input.fill('current,new\npasted.txt,pasted-new.txt');
  await expect(page.getByText('1 mapping checked')).toBeVisible();
  await page.getByLabel('Import CSV or JSON').setInputFiles({ name: 'mapping.csv', mimeType: 'text/csv', buffer: Buffer.from('current,new\nimported.txt,imported-new.txt') });
  await expect(input).toHaveValue(/imported-new\.txt/);
  await expect(page.getByText('1 mapping checked')).toBeVisible();
  await page.getByRole('tab', { name: 'Regex rule' }).click();
  await page.getByLabel('Current paths, one per line').fill('IMG_001.jpg\nIMG_002.jpg');
  await page.getByLabel('Find pattern').fill('^IMG_(\\d+)\\.jpg$');
  await page.getByLabel('Replace with').fill('trip-$1.webp');
  await expect(page.getByText('2 mappings checked')).toBeVisible();
  await page.getByText('Inspect mapping table').click();
  await expect(page.getByText('trip-001.webp')).toBeVisible();
  await expect(page.getByText('trip-002.webp')).toBeVisible();
});

test('@claim:delimited-inputs parses quoted CSV, tab-separated, and semicolon-separated paths', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Use another input method' }).click();
  const input = page.getByLabel('Current and new paths');
  await input.fill('current,new\n"old, one.txt","new, one.txt"');
  await page.getByText('Inspect mapping table').click();
  await expect(page.getByText('old, one.txt')).toBeVisible();
  await expect(page.getByText('new, one.txt')).toBeVisible();
  await page.getByLabel('Separator').selectOption('\t');
  await input.fill('current\tnew\ntab-old.txt\ttab-new.txt');
  await expect(page.getByText('1 mapping checked')).toBeVisible();
  await page.getByText('Inspect mapping table').click();
  await expect(page.getByText('tab-new.txt')).toBeVisible();
  await page.getByLabel('Separator').selectOption(';');
  await input.fill('current;new\nsemi-old.txt;semi-new.txt');
  await expect(page.getByText('1 mapping checked')).toBeVisible();
  await page.getByText('Inspect mapping table').click();
  await expect(page.getByText('semi-new.txt')).toBeVisible();
});

test('@claim:script-preflight stops before renaming for missing or occupied paths', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt');
  await page.getByLabel('Generate live commands').check();
  const scriptText = await downloadText(page, 'Export shell plan');
  const staged = stageRows([{ id: 'row-1', line: 1, current: 'a.txt', next: 'b.txt' }])[0];
  for (const setup of ['missing', 'destination', 'temporary']) {
    const directory = mkdtempSync(join(tmpdir(), `rpr-preflight-${setup}-`));
    try {
      if (setup !== 'missing') writeFileSync(join(directory, 'a.txt'), 'source');
      if (setup === 'destination') writeFileSync(join(directory, 'b.txt'), 'occupied');
      if (setup === 'temporary') writeFileSync(join(directory, staged.temporary), 'occupied');
      const script = join(directory, 'plan.sh');
      writeFileSync(script, scriptText);
      expect(() => execFileSync('/bin/sh', [script], { cwd: directory, encoding: 'utf8', stdio: 'pipe' })).toThrow();
      expect(existsSync(join(directory, 'b.txt'))).toBe(setup === 'destination');
      if (setup !== 'missing') expect(readFileSync(join(directory, 'a.txt'), 'utf8')).toBe('source');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
});

test('@claim:errors-block-scripts keeps both script exports disabled for an unsafe plan', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByText('Destination uses a Windows reserved name')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export shell plan' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Export PowerShell' })).toBeDisabled();
});

test('@claim:destination-comparison finds destinations that normalize to the same name', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,Report.txt\nb.txt,report.txt');
  await expect(page.getByText('Two renames share a destination')).toBeVisible();
});

test('@claim:portability-checks reports Windows reserved names and trailing dots or spaces', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,CON.txt\nb.txt,"trailing. "');
  await expect(page.getByText('Destination uses a Windows reserved name')).toBeVisible();
  await expect(page.getByText('Name ends with a dot or space')).toBeVisible();
});

test('@claim:reversible-cycle-order executes a swap and restores it from the undo manifest', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt\nb.txt,a.txt');
  await page.getByLabel('Generate live commands').check();
  const liveScript = await downloadText(page, 'Export shell plan');
  const manifest = JSON.parse(await downloadText(page, 'Export undo manifest')) as { undo: Array<{ current: string; new: string }> };
  const directory = mkdtempSync(join(tmpdir(), 'rpr-reversible-'));
  try {
    writeFileSync(join(directory, 'a.txt'), 'A');
    writeFileSync(join(directory, 'b.txt'), 'B');
    writeFileSync(join(directory, 'apply.sh'), liveScript);
    execFileSync('/bin/sh', ['apply.sh'], { cwd: directory });
    expect(readFileSync(join(directory, 'a.txt'), 'utf8')).toBe('B');
    const undoRows: RenameRow[] = manifest.undo.map((item, index) => ({ id: `undo-${index}`, line: index + 1, current: item.current, next: item.new }));
    writeFileSync(join(directory, 'undo.sh'), shellPlan(undoRows, assumptions, true));
    execFileSync('/bin/sh', ['undo.sh'], { cwd: directory });
    expect(readFileSync(join(directory, 'a.txt'), 'utf8')).toBe('A');
    expect(readFileSync(join(directory, 'b.txt'), 'utf8')).toBe('B');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('@claim:powershell-export contains mappings, safe staging, and dry-run output', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt\nb.txt,a.txt');
  const plan = await downloadText(page, 'Export PowerShell');
  expect(plan).toContain('# Mode: DRY RUN — prints commands only');
  expect(plan).toContain("Test-Path -LiteralPath 'a.txt'");
  expect(plan).toContain('.rpr-');
  expect(plan).toContain("-Destination ''b.txt''");
  expect(plan).toContain('Write-Output');
});

test('@claim:undo-export maps every destination back to its original source', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByLabel('Current and new paths').fill('current,new\n"old, one.txt","new, one.txt"\nold-two.txt,new-two.txt');
  const manifest = JSON.parse(await downloadText(page, 'Export undo manifest'));
  expect(manifest.format).toBe('rename-plan-reviewer/undo-v1');
  expect(manifest.undo).toEqual([
    { current: 'new, one.txt', new: 'old, one.txt' },
    { current: 'new-two.txt', new: 'old-two.txt' }
  ]);
});

test('@claim:reviewed-csv-export writes a quoted header and one row per reviewed mapping', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByLabel('Current and new paths').fill('current,new\n"old, one.txt","new, one.txt"\nold-two.txt,new-two.txt');
  const csv = await downloadText(page, 'Export reviewed mapping');
  const lines = csv.split('\n');
  expect(lines[0]).toBe('current,new');
  expect(lines).toHaveLength(3);
  expect(lines[1]).toBe('"old, one.txt","new, one.txt"');
  expect(lines[2]).toBe('"old-two.txt","new-two.txt"');
});

test('@claim:draft-persistence saves a real draft in IndexedDB and restores it after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Current and new paths').fill('current,new\nkept.txt,restored.txt');
  await expect(page.getByText(/Saved locally at/)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Current and new paths')).toHaveValue('current,new\nkept.txt,restored.txt');
  expect(await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name))).toContain('rename-plan-reviewer');
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
  await expect(page.getByText('Destination uses a Windows reserved name')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export undo manifest' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Export reviewed mapping' })).toBeEnabled();

  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByLabel('Current and new paths').fill('current,new\na.txt,b.txt');
  await page.getByLabel('Have a license? Paste it').fill('existing-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Plus restored on this device.')).toBeVisible();
  const packetButton = page.getByRole('button', { name: 'Export Plus review packet' });
  await expect(packetButton).toBeEnabled();
  const packet = await downloadText(page, 'Export Plus review packet');
  expect(packet).toContain('## Shell plan');
  expect(packet).toContain('## PowerShell plan');
});
