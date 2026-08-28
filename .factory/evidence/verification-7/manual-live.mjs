import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const external = [];
const errors = [];
page.on('request', (request) => {
  if (new URL(request.url()).origin !== 'https://rename-plan-reviewer.sociobot.in') external.push(request.url());
});
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});

const requireVisible = async (text) => {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' });
};
const requireValue = (condition, message) => {
  if (!condition) throw new Error(message);
};
const download = async (buttonName) => {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: buttonName }).click();
  const item = await pending;
  return { name: item.suggestedFilename(), body: await readFile(await item.path(), 'utf8') };
};

await page.goto('https://rename-plan-reviewer.sociobot.in/', { waitUntil: 'networkidle' });
await requireVisible('The page is clean.');

await page.getByRole('tab', { name: 'Regex rule' }).click();
await page.getByLabel('Current paths, one per line').fill('IMG_001.jpg\nIMG_002.jpg');
await page.getByLabel('Find pattern').fill('[');
await page.getByLabel('Replace with').fill('trip-$1.webp');
await requireVisible('Regex cannot be used');
requireValue(await page.getByRole('button', { name: 'Export shell plan' }).isDisabled(), 'invalid regex did not block scripts');

await page.getByLabel('Find pattern').fill('^IMG_(\\d+)\\.jpg$');
await requireVisible('No blocking risks found');
const shell = await download('Export shell plan');
const powershell = await download('Export PowerShell');
const undo = await download('Export undo manifest');
const csv = await download('Export reviewed mapping');
requireValue(shell.name === 'rename-plan.sh' && shell.body.includes('DRY RUN — prints commands only'), 'shell dry-run export failed');
requireValue(shell.body.includes('trip-001.webp') && shell.body.includes('trip-002.webp'), 'regex replacements were not exported');
requireValue(powershell.name === 'rename-plan.ps1' && powershell.body.includes('-LiteralPath'), 'PowerShell export failed');
const parsedUndo = JSON.parse(undo.body);
requireValue(undo.name === 'rename-undo.json' && parsedUndo.undo.length === 2, 'undo export failed');
requireValue(csv.name === 'reviewed-mapping.csv' && csv.body.startsWith('current,new\n'), 'CSV export failed');

await page.getByRole('tab', { name: 'Mapping table' }).click();
await page.getByLabel('Separator').selectOption(';');
await page.getByLabel('Current and new paths').fill('current;new\na.txt;b.txt');
await requireVisible('No blocking risks found');

await page.getByLabel('Separator').selectOption('\t');
await page.getByLabel('Current and new paths').fill('current\tnew\na.txt\tb.txt');
await requireVisible('No blocking risks found');

await page.getByLabel('Separator').selectOption(',');
await page.getByLabel('Import CSV or JSON').setInputFiles({
  name: 'valid-plan.json',
  mimeType: 'application/json',
  buffer: Buffer.from('{"rows":[{"current":"source.txt","new":"destination.txt"}]}')
});
await requireVisible('No blocking risks found');
requireValue((await page.getByLabel('Current and new paths').inputValue()).includes('"source.txt","destination.txt"'), 'valid JSON import failed');

await page.getByLabel('Separator').selectOption(',');
await page.getByLabel('Current and new paths').fill('"never closed,new');
await requireVisible('Input could not be read');
requireValue(await page.getByRole('button', { name: 'Export shell plan' }).isDisabled(), 'malformed CSV did not block scripts');
await page.getByLabel('Current and new paths').fill('current,new\nrecovered.txt,ready.txt');
await requireVisible('No blocking risks found');
await page.waitForTimeout(600);
await page.reload({ waitUntil: 'networkidle' });
requireValue((await page.getByLabel('Current and new paths').inputValue()).includes('recovered.txt,ready.txt'), 'real draft did not persist across reload');

page.once('dialog', (dialog) => dialog.accept());
await page.getByRole('button', { name: 'Clear desk' }).click();
await requireVisible('The page is clean.');

requireValue(external.length === 0, `unexpected external requests: ${external.join(', ')}`);
requireValue(errors.length === 0, `browser errors: ${errors.join(', ')}`);
console.log(JSON.stringify({
  result: 'pass',
  viewport: '390x844',
  covered: ['empty state', 'invalid regex and recovery', 'regex rule', 'semicolon input', 'tab input', 'valid JSON import', 'malformed CSV and recovery', 'dry shell', 'PowerShell', 'undo JSON', 'CSV', 'draft persistence', 'clear and empty recovery'],
  externalRequests: external,
  browserErrors: errors
}, null, 2));

await browser.close();
