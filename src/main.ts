import './style.css';
import { analyze } from './analyze';
import { parseDelimited, rowsFromRule, toCsv } from './csv';
import { buyUrl, cachedUnlock, captureLicense, purchasesEnabled, restoreLicense, verifyLicense } from './billing';
import { powershellPlan, reviewPacket, shellPlan, undoManifest } from './export';
import { clearDraft, loadDraft, saveDraft } from './storage';
import type { Assumptions, Draft, Finding, RenameRow, Severity } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const DEMO_NAMESPACE = 'demo:';
const SAMPLE_INPUT = 'current,new\nphotos/a.jpg,photos/b.jpg\nphotos/b.jpg,photos/a.jpg\nscan-001.tif,archive/scan-001.tif\nscan-002.tif,archive/scan-003.tif\nnotes.txt,CON.txt';

function isDemoRoute(): boolean {
  return location.pathname === '/demo' || location.pathname === '/demo/' || new URLSearchParams(location.search).get('demo') === '1';
}

function renderLegal(page: 'privacy' | 'terms'): void {
  document.title = `${page === 'privacy' ? 'Privacy' : 'Terms'} — Rename Plan Reviewer`;
  const privacy = `<p><strong>Effective 28 August 2026.</strong></p><p>Your rename mappings, rule inputs, and draft are processed on this device. The app stores the current draft in your browser’s IndexedDB so it survives a refresh. Rename paths are never uploaded to us.</p><p>If you buy or verify a Plus license, your browser contacts the Sociobot billing API with the license token. Sociobot/Dodo acts as merchant of record and handles payment data; this app never receives card details. The license token and a daily verification result are stored in localStorage.</p><p>The service worker caches application files for offline use. There is no advertising, behavioral analytics, third-party font, or tracking script.</p><p>You can erase the plan with “Clear desk” and remove the app’s site data in browser settings. Questions: <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p>`;
  const terms = `<p><strong>Effective 28 August 2026.</strong></p><p>Rename Plan Reviewer analyzes a proposed mapping and generates scripts; it does not inspect your filesystem or guarantee that the filesystem is unchanged since review. Read the findings, keep a backup, run the dry-run plan, and verify the output before enabling live commands.</p><p>The free reviewer includes safety checks and individual exports. Plus is priced at US $12 once when checkout is available. It adds the combined review packet described in the reviewer. Sociobot/Dodo is the merchant of record. Refunds are handled by the merchant and revoke the associated license.</p><p>The software is provided under the MIT License, without warranty. You remain responsible for the commands you run and for maintaining backups. Do not use generated scripts where you lack permission to rename the files.</p><p>These terms are governed by applicable law. Questions: <a href="mailto:support@sociobot.in">support@sociobot.in</a>.</p>`;
  app.innerHTML = `${header()}<main id="main" tabindex="-1" class="legal-page"><p class="eyebrow">FIELD NOTE / ${page === 'privacy' ? 'PRIVACY' : 'TERMS'}</p><h1>${page === 'privacy' ? 'Your paths stay on your desk.' : 'Review first. Keep a backup.'}</h1>${page === 'privacy' ? privacy : terms}<p><a href="/">← Return to the reviewer</a></p></main>${footer()}`;
}

const DEFAULT_ASSUMPTIONS: Assumptions = { caseInsensitive: true, unicode: 'NFC', platform: 'portable' };
const DEFAULT_DRAFT: Draft = { version: 1, mode: 'csv', input: '', sourceList: '', pattern: '', replacement: '', flags: 'g', delimiter: ',', assumptions: DEFAULT_ASSUMPTIONS, liveCommands: false, updatedAt: new Date().toISOString() };

async function startApp(demo = isDemoRoute()): Promise<void> {
  const storageNamespace = demo ? DEMO_NAMESPACE : '';
  if (!demo) captureLicense();
  document.title = demo ? 'Demo — Rename Plan Reviewer' : 'Rename Plan Reviewer — review batch renames';
  app.innerHTML = shell(demo);
  let draft = demo ? sampleDraft() : DEFAULT_DRAFT;
  let storageMessage = demo ? 'Sample plan is stored only in this demo.' : 'Drafts stay on this device.';
  if (!demo) try {
    const saved = await loadDraft(storageNamespace);
    if (saved?.version === 1) {
      draft = saved;
      storageMessage = `Restored local draft from ${new Date(saved.updatedAt).toLocaleString()}.`;
    }
  } catch {
    storageMessage = 'Local saving is unavailable in this browser session.';
  }
  let unlocked = demo ? false : cachedUnlock();
  let activeFilter: Severity | 'all' = 'all';
  let parseErrors: string[] = [];
  let rows: RenameRow[] = [];
  let saveTimer = 0;
  let reviewFrame = 0;
  let installPrompt: Event | undefined;

  const $ = <T extends Element>(selector: string): T => app.querySelector<T>(selector)!;
  const csvPanel = $<HTMLElement>('#csv-panel');
  const rulePanel = $<HTMLElement>('#rule-panel');
  const csvInput = $<HTMLTextAreaElement>('#mapping-input');
  const sourceInput = $<HTMLTextAreaElement>('#source-input');
  const patternInput = $<HTMLInputElement>('#pattern');
  const replacementInput = $<HTMLInputElement>('#replacement');
  const flagsInput = $<HTMLSelectElement>('#flags');
  const delimiterInput = $<HTMLSelectElement>('#delimiter');
  const liveInput = $<HTMLInputElement>('#live-commands');
  const platformInput = $<HTMLSelectElement>('#platform');
  const unicodeInput = $<HTMLSelectElement>('#unicode');
  const caseInput = $<HTMLInputElement>('#case-insensitive');
  const report = $('#report');
  const storageStatus = $('#storage-status');
  const plusState = $('#plus-state');
  const packetButton = $<HTMLButtonElement>('#export-packet');
  let reviewIsSafe = false;

  csvInput.value = draft.input;
  sourceInput.value = draft.sourceList;
  patternInput.value = draft.pattern;
  replacementInput.value = draft.replacement;
  flagsInput.value = draft.flags;
  delimiterInput.value = draft.delimiter;
  liveInput.checked = draft.liveCommands;
  platformInput.value = draft.assumptions.platform;
  unicodeInput.value = draft.assumptions.unicode;
  caseInput.checked = draft.assumptions.caseInsensitive;
  storageStatus.textContent = storageMessage;
  setMode(draft.mode);

  function assumptions(): Assumptions {
    return { caseInsensitive: caseInput.checked, unicode: unicodeInput.value as Assumptions['unicode'], platform: platformInput.value as Assumptions['platform'] };
  }

  function currentDraft(): Draft {
    return { version: 1, mode: csvPanel.hidden ? 'rule' : 'csv', input: csvInput.value, sourceList: sourceInput.value, pattern: patternInput.value, replacement: replacementInput.value, flags: flagsInput.value, delimiter: delimiterInput.value as Draft['delimiter'], assumptions: assumptions(), liveCommands: liveInput.checked, updatedAt: new Date().toISOString() };
  }

  function setMode(mode: 'csv' | 'rule'): void {
    csvPanel.toggleAttribute('hidden', mode !== 'csv');
    rulePanel.toggleAttribute('hidden', mode !== 'rule');
    app.querySelectorAll<HTMLButtonElement>('[role="tab"]').forEach((tab) => {
      const selected = tab.dataset.mode === mode;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    review();
  }

  function queueSave(): void {
    window.clearTimeout(saveTimer);
    storageStatus.textContent = 'Saving draft locally…';
    saveTimer = window.setTimeout(async () => {
      try {
        const value = currentDraft();
        await saveDraft(value, storageNamespace);
        storageStatus.textContent = `Saved locally at ${new Date(value.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
      } catch {
        storageStatus.textContent = 'Could not save this draft locally. Export it before closing.';
      }
    }, 350);
  }

  function readPlan() {
    const result = csvPanel.hidden ? rowsFromRule(sourceInput.value, patternInput.value, replacementInput.value, flagsInput.value) : parseDelimited(csvInput.value, delimiterInput.value);
    return { result, reviewed: analyze(result.rows, assumptions()) };
  }

  function review(): void {
    const { result, reviewed } = readPlan();
    rows = result.rows;
    parseErrors = result.errors;
    renderReport(report, reviewed.rows, reviewed.findings, reviewed.safe, reviewed.errors + parseErrors.length, reviewed.warnings, reviewed.notes, activeFilter, parseErrors);
    const unsafe = !reviewed.safe || parseErrors.length > 0;
    reviewIsSafe = !unsafe;
    app.querySelectorAll<HTMLButtonElement>('[data-safe-export]').forEach((button) => button.disabled = unsafe);
    packetButton.disabled = !unlocked || unsafe;
    if (unlocked) plusState.textContent = unsafe
      ? 'Resolve error findings before exporting a review packet with scripts.'
      : 'Plus is active on this device.';
    $('#export-state').textContent = unsafe ? 'Resolve error findings before generating a script.' : `${rows.length} mappings are ready for a two-phase export.`;
    $('#live-warning').toggleAttribute('hidden', !liveInput.checked);
  }

  function update(): void {
    queueSave();
    if (reviewFrame) return;
    reviewFrame = requestAnimationFrame(() => {
      reviewFrame = 0;
      review();
    });
  }

  const tabs = [...app.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => { setMode(tab.dataset.mode as 'csv' | 'rule'); queueSave(); });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = tabs.indexOf(tab);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      const nextTab = tabs[next];
      setMode(nextTab.dataset.mode as 'csv' | 'rule');
      nextTab.focus();
      queueSave();
    });
  });
  [csvInput, sourceInput, patternInput, replacementInput].forEach((control) => control.addEventListener('input', update));
  [flagsInput, delimiterInput, liveInput, platformInput, unicodeInput, caseInput].forEach((control) => control.addEventListener('change', update));

  $('#load-example').addEventListener('click', () => {
    setMode('csv');
    csvInput.value = SAMPLE_INPUT;
    update();
    csvInput.focus();
  });
  if (demo) {
    const resetDemo = async () => {
      await clearDraft(storageNamespace).catch(() => undefined);
      csvInput.value = SAMPLE_INPUT;
      sourceInput.value = patternInput.value = replacementInput.value = '';
      liveInput.checked = false;
      setMode('csv');
      queueSave();
      storageStatus.textContent = 'Sample plan reset. It is stored only in this demo.';
      csvInput.focus();
    };
    $('#reset-demo').addEventListener('click', () => { void resetDemo(); });
    $('#reset-demo-hero').addEventListener('click', () => { void resetDemo(); });
  }
  $('#clear-plan').addEventListener('click', async () => {
    if (rows.length && !confirm(`Clear ${rows.length} mappings from this device? Exported files will not be affected.`)) return;
    Object.assign(draft, DEFAULT_DRAFT);
    csvInput.value = sourceInput.value = patternInput.value = replacementInput.value = '';
    setMode('csv');
    await clearDraft(storageNamespace).catch(() => undefined);
    storageStatus.textContent = demo ? 'Demo sample cleared. Reset it to bring the sample back.' : 'Local draft cleared.';
    review();
  });
  $('#file-input').addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) { announce('That file is over 5 MB. Split it into smaller plans first.'); return; }
    const content = await file.text();
    if (file.name.endsWith('.json')) {
      try {
        const parsed = JSON.parse(content) as { rows?: Array<{ current: string; new: string }> };
        if (!Array.isArray(parsed.rows)) throw new Error('No rows');
        csvInput.value = toCsv(parsed.rows.map((row, index) => ({ id: `row-${index + 1}`, line: index + 1, current: row.current, next: row.new })));
      } catch { announce('That JSON is not a Rename Plan Reviewer plan export.'); return; }
    } else csvInput.value = content;
    setMode('csv'); update(); announce(`Imported ${file.name}.`);
  });

  report.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
    if (!button) return;
    activeFilter = button.dataset.filter as Severity | 'all';
    review();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && activeFilter !== 'all') { activeFilter = 'all'; review(); } });

  app.querySelectorAll<HTMLButtonElement>('[data-export]').forEach((button) => button.addEventListener('click', () => {
    const { result, reviewed } = readPlan();
    const type = button.dataset.export;
    if (type !== 'manifest' && type !== 'csv' && (!reviewed.safe || result.errors.length)) return;
    if (type === 'shell') download('rename-plan.sh', shellPlan(result.rows, assumptions(), liveInput.checked), 'text/x-shellscript');
    if (type === 'powershell') download('rename-plan.ps1', powershellPlan(result.rows, assumptions(), liveInput.checked), 'text/plain');
    if (type === 'manifest') download('rename-undo.json', undoManifest(reviewed, assumptions()), 'application/json');
    if (type === 'csv') download('reviewed-mapping.csv', toCsv(result.rows), 'text/csv');
  }));

  function paintLicense(message?: string): void {
    unlocked = (!demo && cachedUnlock()) || unlocked;
    packetButton.disabled = !unlocked || !reviewIsSafe;
    plusState.textContent = message ?? (unlocked
      ? (reviewIsSafe ? 'Plus is active on this device.' : 'Resolve error findings before exporting a review packet with scripts.')
      : 'Free reviewer active. Plus is optional.');
    $('#buy-plus').toggleAttribute('hidden', unlocked);
  }
  paintLicense();
  if (!demo) void verifyLicense().then((verdict) => {
    if (!verdict) return;
    unlocked = verdict.valid;
    paintLicense(verdict.valid ? 'Plus license verified.' : 'License no longer active. Free review and exports remain available.');
  });
  $('#restore-license').addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = $<HTMLInputElement>('#license-token');
    if (!input.value.trim()) return;
    plusState.textContent = 'Checking license…';
    const verdict = await restoreLicense(input.value);
    unlocked = verdict?.valid === true;
    paintLicense(verdict ? (verdict.valid ? 'Plus restored on this device.' : 'That license is not active for this product.') : 'Could not verify right now. Check your connection and try again.');
    input.value = '';
  });
  packetButton.addEventListener('click', () => {
    if (!unlocked) return;
    const { result, reviewed } = readPlan();
    if (!reviewed.safe || result.errors.length) return;
    download('rename-review-packet.md', reviewPacket(reviewed, assumptions(), liveInput.checked, result.errors), 'text/markdown');
  });

  window.addEventListener('offline', () => setConnection(false));
  window.addEventListener('online', () => setConnection(true));
  setConnection(navigator.onLine);
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installPrompt = event; $('#install-app').removeAttribute('hidden'); });
  $('#install-app').addEventListener('click', async () => {
    if (!installPrompt) return;
    const prompt = installPrompt as Event & { prompt: () => Promise<void> };
    await prompt.prompt(); installPrompt = undefined; $('#install-app').setAttribute('hidden', '');
  });
  registerServiceWorker();
  review();

  function setConnection(online: boolean): void {
    const badge = $('#connection');
    badge.textContent = online ? 'On-device' : 'Offline · on-device';
    badge.classList.toggle('offline', !online);
  }
}

function sampleDraft(): Draft {
  return { ...DEFAULT_DRAFT, assumptions: { ...DEFAULT_ASSUMPTIONS }, input: SAMPLE_INPUT, updatedAt: new Date().toISOString() };
}

function header(): string {
  return `<header class="site-head"><a class="brand" href="/" aria-label="Rename Plan Reviewer home"><span class="brand-mark" aria-hidden="true">↝</span><span>Rename Plan Reviewer</span></a><nav class="site-nav" aria-label="Primary"><a href="/demo/">Demo</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav><div class="head-actions"><span id="connection" class="connection">On-device</span><button id="install-app" class="text-button" hidden>Install app</button></div></header>`;
}

function shell(demo: boolean): string {
  const purchaseAction = purchasesEnabled
    ? `<a id="buy-plus" class="primary-link" href="${escapeHtml(buyUrl)}">Buy Plus — $12 once</a>`
    : `<p id="buy-plus" class="purchase-paused">Checkout is not available right now. Verify an existing license below.</p>`;
  return `${header()}${demo ? `<aside class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><span>Use the risky sample to inspect the reviewer.</span><button id="reset-demo" class="text-button">Reset demo</button><a href="/">Start for real</a></aside>` : ''}
  <main id="main" tabindex="-1">
    <section class="hero" aria-labelledby="page-title"><div class="hero-copy"><p class="eyebrow">BATCH RENAME / PRE-FLIGHT</p><h1 id="page-title">Review batch renames<br><em>before</em> you run them.</h1><p class="lede">For people preparing risky spreadsheet or regex batch renames.</p><div class="hero-action-row">${demo ? `<button id="reset-demo-hero" class="primary-link">Reset sample plan</button><span>The risky sample is ready to inspect.</span>` : `<a class="primary-link" href="/demo/">Try it with sample data</a><span>Loads a risky sample plan to inspect.</span>`}</div><div class="trust-line"><span>✓ Data stays in this browser</span><span>✓ Works offline after first visit</span><span>✓ Exports start as dry runs</span></div></div><figure class="hero-art"><img src="/assets/rename-ledger.webp" width="960" height="640" alt="Paper file tabs connected by pencil arrows, with a collision mark and a green check" fetchpriority="high" decoding="async"><figcaption>A rename is a hypothesis until you run it.</figcaption></figure></section>
    <section class="workbench" aria-label="Rename plan workbench">
      <div class="input-column"><div class="section-heading"><span class="step">01</span><div><h2>Add the proposed names</h2><p>Paste two columns, import a file, or derive names with a rule.</p></div></div>
        <div class="tabs" role="tablist" aria-label="Input method"><button role="tab" data-mode="csv" aria-controls="csv-panel">Mapping table</button><button role="tab" data-mode="rule" aria-controls="rule-panel">Regex rule</button></div>
        <div id="csv-panel" role="tabpanel"><label for="mapping-input">Current and new paths</label><textarea id="mapping-input" spellcheck="false" placeholder="current,new&#10;IMG_001.jpg,trip/day-01.jpg&#10;IMG_002.jpg,trip/day-02.jpg" aria-describedby="mapping-help"></textarea><p id="mapping-help" class="field-help">Header optional. Quoted CSV, tab-separated, and semicolon-separated files are supported.</p><div class="inline-controls"><label>Separator<select id="delimiter"><option value=",">Comma</option><option value="&#9;">Tab</option><option value=";">Semicolon</option></select></label><label class="file-button" for="file-input">Import CSV or JSON<input id="file-input" type="file" accept=".csv,.tsv,.txt,.json,text/csv,application/json"></label><button id="load-example" class="text-button">Load risky example</button></div></div>
        <div id="rule-panel" role="tabpanel" hidden><label for="source-input">Current paths, one per line</label><textarea id="source-input" spellcheck="false" placeholder="IMG_001.jpg&#10;IMG_002.jpg"></textarea><div class="rule-grid"><label for="pattern">Find pattern<input id="pattern" type="text" spellcheck="false" placeholder="^IMG_(\\d+)\\.jpg$"></label><label for="replacement">Replace with<input id="replacement" type="text" spellcheck="false" placeholder="trip-$1.jpg"></label><label for="flags">Flags<select id="flags"><option value="g">global</option><option value="gi">global + ignore case</option><option value="i">ignore case</option><option value="">none</option></select></label></div></div>
        <details class="assumptions"><summary><span class="step">02</span><span><strong>Filesystem assumptions</strong><small>Conservative defaults for portable plans</small></span></summary><div class="assumption-grid"><label for="platform">Target platform<select id="platform"><option value="portable">Portable (strictest)</option><option value="windows">Windows</option><option value="macos">macOS</option><option value="linux">Linux</option></select></label><label for="unicode">Unicode comparison<select id="unicode"><option value="NFC">NFC normalized</option><option value="NFD">NFD normalized (macOS)</option><option value="none">Exact code points</option></select></label><label class="check"><input id="case-insensitive" type="checkbox"><span><strong>Case-insensitive names</strong><small>Typical Windows and macOS default</small></span></label></div><p class="caution">This browser cannot see the destination folder. Scripts therefore preflight existing sources, destinations, and temporary paths when run.</p></details>
        <div class="local-row"><span id="storage-status" role="status">Drafts stay on this device.</span><button id="clear-plan" class="text-button danger-text">Clear desk</button></div>
      </div>
      <div class="review-column"><div class="section-heading"><span class="step">03</span><div><h2>Review the evidence</h2><p>Errors block scripts. Warnings need your judgment.</p></div></div><section id="report" aria-live="polite" aria-label="Review findings"></section></div>
    </section>
    <section class="export-section"><div class="section-heading"><span class="step">04</span><div><h2>Take away a reversible plan</h2><p id="export-state">Add mappings to prepare exports.</p></div></div><div class="live-toggle"><label class="switch"><input id="live-commands" type="checkbox"><span><strong>Generate live commands</strong><small>Off by default. Leave off until the printed dry run is correct.</small></span></label><p id="live-warning" class="live-warning" hidden><strong>Live mode:</strong> exported scripts will rename files. Back up first.</p></div><div class="export-grid"><button data-export="shell" data-safe-export><span class="file-type">.SH</span><span><strong>Export shell plan</strong><small>macOS / Linux</small></span></button><button data-export="powershell" data-safe-export><span class="file-type">.PS1</span><span><strong>Export PowerShell</strong><small>Windows plan</small></span></button><button data-export="manifest"><span class="file-type">↶</span><span><strong>Export undo manifest</strong><small>JSON destinations → originals</small></span></button><button data-export="csv"><span class="file-type">.CSV</span><span><strong>Export reviewed mapping</strong><small>Your portable source of truth</small></span></button></div></section>
    <section class="plus-section" aria-labelledby="plus-title"><div><p class="eyebrow">OPTIONAL BENCH UPGRADE</p><h2 id="plus-title">Keep the reviewer free. Pack the paperwork with Plus.</h2><p>Plus is priced at US $12 once. It adds a combined Markdown review packet with findings and both scripts. Every safety check, dry run, CSV and undo export stays free.</p><p class="legal-links">Sociobot/Dodo is merchant of record. <a href="/terms/">Terms</a> · <a href="/privacy/">Privacy</a></p></div><div class="license-box">${purchaseAction}<form id="restore-license"><label for="license-token">Have a license? Paste it</label><div class="restore-row"><input id="license-token" type="password" autocomplete="off"><button>Verify</button></div></form><button id="export-packet" disabled>Export Plus review packet</button><p id="plus-state" role="status">Free reviewer active. Plus is optional.</p></div></section>
  </main>${footer()}<div id="toast" class="toast" role="status" hidden></div>`;
}

function renderReport(container: Element, rows: RenameRow[], findings: Finding[], safe: boolean, errors: number, warnings: number, notes: number, filter: Severity | 'all', parseErrors: string[]): void {
  if (!rows.length && !parseErrors.length) {
    container.innerHTML = `<div class="empty-report"><div class="empty-mark" aria-hidden="true">↝</div><h3>The page is clean.</h3><p>Add a mapping on the left. Checks run here as you type.</p><ol><li>We compare destinations.</li><li>We circle portability risks.</li><li>We stage a reversible order.</li></ol></div>`;
    return;
  }
  const allFindings: Finding[] = [...parseErrors.map((detail, index) => ({ severity: 'error' as const, code: `parse-${index}`, title: 'Input could not be read', detail, rows: [] })), ...findings];
  const shown = filter === 'all' ? allFindings : allFindings.filter((finding) => finding.severity === filter);
  const statusClass = errors ? 'bad' : warnings ? 'caution-status' : 'good';
  const statusTitle = errors ? 'Plan needs correction' : warnings ? 'Safe order, with cautions' : 'No blocking risks found';
  const preview = rows.slice(0, 100);
  container.innerHTML = `<div class="verdict ${statusClass}"><span class="verdict-mark" aria-hidden="true">${errors ? '!' : warnings ? '?' : '✓'}</span><div><strong>${statusTitle}</strong><small>${rows.length.toLocaleString()} mapping${rows.length === 1 ? '' : 's'} checked${rows.length > 100 ? '; first 100 shown below' : ''}</small></div></div>
    <div class="counters" aria-label="Filter findings"><button data-filter="all" aria-pressed="${filter === 'all'}"><strong>${allFindings.length}</strong><span>All</span></button><button data-filter="error" aria-pressed="${filter === 'error'}"><strong>${errors}</strong><span>Errors</span></button><button data-filter="warning" aria-pressed="${filter === 'warning'}"><strong>${warnings}</strong><span>Warnings</span></button><button data-filter="note" aria-pressed="${filter === 'note'}"><strong>${notes}</strong><span>Notes</span></button></div>
    <div class="findings" tabindex="0" aria-label="${shown.length} review findings. Use arrow keys to scroll.">${shown.length ? shown.map(findingHtml).join('') : `<p class="no-findings">No ${filter} findings. Press Escape to show all.</p>`}</div>
    <details class="mapping-preview"><summary>Inspect mapping table <span>${rows.length.toLocaleString()} rows</span></summary><div class="table-wrap"><table><thead><tr><th scope="col">#</th><th scope="col">Current</th><th scope="col">New</th></tr></thead><tbody>${preview.map((row) => `<tr><td>${row.line}</td><td><code>${escapeHtml(row.current || '—')}</code></td><td><code>${escapeHtml(row.next || '—')}</code></td></tr>`).join('')}</tbody></table></div></details>`;
  if (!safe && errors === 0) { /* only occurs for empty rows, handled above */ }
}

function findingHtml(finding: Finding): string {
  const label = finding.severity === 'error' ? 'ERROR' : finding.severity === 'warning' ? 'CHECK' : 'NOTE';
  return `<article class="finding ${finding.severity}"><span class="finding-label">${label}</span><div><h3>${escapeHtml(finding.title)}</h3><p>${escapeHtml(finding.detail)}</p>${finding.rows.length ? `<small>Row${finding.rows.length > 1 ? 's' : ''} ${finding.rows.join(', ')}</small>` : ''}</div></article>`;
}

function footer(): string {
  return `<footer><p><span class="brand-mark" aria-hidden="true">↝</span> A Param Factory utility.</p><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-rename-plan-reviewer">Source</a></nav><p class="build-id" data-build-id>Version ${escapeHtml(__APP_VERSION__)}</p><p class="provenance">Notebook illustration generated for this product with the factory image model.</p></footer>`;
}

function renderNotFound(): void {
  document.title = 'Page not found — Rename Plan Reviewer';
  app.innerHTML = `${header()}<main id="main" tabindex="-1" class="legal-page"><p class="eyebrow">MISFILED NOTE</p><h1>That page is not on this desk.</h1><p>Return to the reviewer to check a rename plan.</p><p><a href="/">← Open Rename Plan Reviewer</a></p></main>${footer()}`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
  announce(`${name} exported.`);
}

function announce(message: string): void {
  const toast = document.querySelector<HTMLElement>('#toast');
  if (!toast) return;
  toast.textContent = message; toast.hidden = false;
  window.setTimeout(() => toast.hidden = true, 4_000);
}

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  void navigator.serviceWorker.register('/sw.js').then((registration) => {
    if (registration.waiting) showUpdate(registration);
    registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', () => {
      if (registration.waiting && navigator.serviceWorker.controller) showUpdate(registration);
    }));
  }).catch(() => announce('Offline setup could not finish. The reviewer still works while this tab is open.'));
}

function showUpdate(registration: ServiceWorkerRegistration): void {
  const toast = document.querySelector<HTMLElement>('#toast');
  if (!toast) return;
  toast.hidden = false;
  toast.replaceChildren(document.createTextNode('A fresh notebook is ready. '));
  const button = document.createElement('button');
  button.textContent = 'Update now';
  button.addEventListener('click', () => registration.waiting?.postMessage({ type: 'SKIP_WAITING' }));
  toast.append(button);
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
}

if (location.pathname.startsWith('/privacy')) renderLegal('privacy');
else if (location.pathname.startsWith('/terms')) renderLegal('terms');
else if (location.pathname === '/' || isDemoRoute()) void startApp();
else renderNotFound();
