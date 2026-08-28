import type { Assumptions, Finding, RenameRow, Review } from './types';

const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
const CONTROL = /[\u0000-\u001f\u007f]/;
const WINDOWS_BAD = /[<>:"|?*]/;

function pathParts(path: string): string[] {
  return path.replaceAll('\\', '/').split('/');
}

function isAbsolute(path: string): boolean {
  return /^(?:[a-z]:|[\\/])/i.test(path);
}

function portableKey(path: string, assumptions: Assumptions): string {
  let key = path.replaceAll('\\', '/');
  if (assumptions.unicode !== 'none') key = key.normalize(assumptions.unicode);
  return assumptions.caseInsensitive ? key.toLocaleLowerCase('en-US') : key;
}

function add(findings: Finding[], severity: Finding['severity'], code: string, title: string, detail: string, rows: number[]): void {
  findings.push({ severity, code, title, detail, rows: [...new Set(rows)].sort((a, b) => a - b) });
}

function duplicates(rows: RenameRow[], getValue: (row: RenameRow) => string, assumptions: Assumptions): Map<string, RenameRow[]> {
  const grouped = new Map<string, RenameRow[]>();
  rows.forEach((row) => {
    const key = portableKey(getValue(row), assumptions);
    const group = grouped.get(key) ?? [];
    group.push(row);
    if (!grouped.has(key)) grouped.set(key, group);
  });
  return new Map([...grouped].filter(([, group]) => group.length > 1));
}

function findCycles(rows: RenameRow[], assumptions: Assumptions): string[][] {
  const edges = new Map(rows.map((row) => [portableKey(row.current, assumptions), portableKey(row.next, assumptions)]));
  const label = new Map(rows.map((row) => [portableKey(row.current, assumptions), row.current]));
  const cycles: string[][] = [];
  const done = new Set<string>();
  for (const start of edges.keys()) {
    if (done.has(start)) continue;
    const path: string[] = [];
    const positions = new Map<string, number>();
    let node: string | undefined = start;
    while (node && edges.has(node) && !done.has(node)) {
      const previous = positions.get(node);
      if (previous !== undefined) {
        const cycle = path.slice(previous).map((key) => label.get(key) ?? key);
        if (cycle.length > 1 || edges.get(node) === node) cycles.push(cycle);
        break;
      }
      positions.set(node, path.length);
      path.push(node);
      node = edges.get(node);
    }
    path.forEach((key) => done.add(key));
  }
  return cycles;
}

function checkNumbering(rows: RenameRow[], findings: Finding[]): void {
  const groups = new Map<string, Array<{ number: number; row: RenameRow }>>();
  rows.forEach((row) => {
    const match = row.next.match(/^(.*?)(\d+)([^/\\\d]*)$/);
    if (!match) return;
    const groupKey = `${match[1]}\u0000${match[3]}\u0000${match[2].length}`;
    const group = groups.get(groupKey) ?? [];
    group.push({ number: Number(match[2]), row });
    groups.set(groupKey, group);
  });
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const ordered = [...new Set(group.map((item) => item.number))].sort((a, b) => a - b);
    const present = new Set(ordered);
    const missing: number[] = [];
    for (let number = ordered[0]; number < ordered.at(-1)! && missing.length < 8; number += 1) {
      if (!present.has(number)) missing.push(number);
    }
    if (missing.length) add(findings, 'warning', 'number-gap', 'Numbering has a gap', `Missing ${missing.join(', ')} in a destination sequence. Confirm that the gap is intentional.`, group.map((item) => item.row.line));
  }
}

export function analyze(rows: RenameRow[], assumptions: Assumptions): Review {
  const findings: Finding[] = [];
  const sourceDupes = duplicates(rows.filter((row) => row.current), (row) => row.current, assumptions);
  sourceDupes.forEach((group) => add(findings, 'error', 'duplicate-source', 'A source is listed more than once', 'One file cannot be renamed to multiple destinations in the same plan.', group.map((row) => row.line)));
  const targetDupes = duplicates(rows.filter((row) => row.next), (row) => row.next, assumptions);
  targetDupes.forEach((group) => add(findings, 'error', 'target-collision', 'Two renames share a destination', 'These paths resolve to the same destination under the selected filesystem assumptions.', group.map((row) => row.line)));

  rows.forEach((row) => {
    const parts = pathParts(row.next);
    if (!row.current) add(findings, 'error', 'missing-source', 'Current path is empty', 'Add the file’s current relative path.', [row.line]);
    if (!row.next) add(findings, 'error', 'missing-target', 'New path is empty', 'Add the intended destination path.', [row.line]);
    if (isAbsolute(row.current)) add(findings, 'error', 'source-absolute-path', 'Source path is outside the reviewed root', 'Use the file’s path relative to the folder where the exported script will run.', [row.line]);
    if (pathParts(row.current).includes('..')) add(findings, 'error', 'source-path-traversal', 'Source path leaves the working folder', 'Remove “..” segments so the script cannot pull in a file from outside the reviewed folder.', [row.line]);
    if (isAbsolute(row.next)) add(findings, 'error', 'absolute-path', 'Absolute path is unsafe', 'Use a path relative to the folder where the exported script will run.', [row.line]);
    if (parts.includes('..')) add(findings, 'error', 'path-traversal', 'Path leaves the working folder', 'Remove “..” segments so the rename stays inside the reviewed folder.', [row.line]);
    if (CONTROL.test(row.next)) add(findings, 'error', 'control-character', 'Path contains a control character', 'Remove hidden control characters from the destination.', [row.line]);
    if ((assumptions.platform === 'portable' || assumptions.platform === 'windows') && WINDOWS_BAD.test(row.next.replace(/^[a-z]:/i, ''))) add(findings, 'error', 'invalid-character', 'Path is not Windows-portable', 'Remove < > : " | ? * from the destination name.', [row.line]);
    if ((assumptions.platform === 'portable' || assumptions.platform === 'windows') && parts.some((part) => RESERVED.test(part))) add(findings, 'error', 'reserved-name', 'Destination uses a Windows reserved name', 'Rename CON, PRN, AUX, NUL, COM1–9, or LPT1–9.', [row.line]);
    if ((assumptions.platform === 'portable' || assumptions.platform === 'windows') && parts.some((part) => /[. ]$/.test(part))) add(findings, 'error', 'trailing-character', 'Name ends with a dot or space', 'Windows silently trims trailing dots and spaces, which can cause a collision.', [row.line]);
    if (row.current === row.next) add(findings, 'note', 'unchanged', 'Mapping makes no change', 'This row will be skipped in generated scripts.', [row.line]);
    else if (row.current.toLocaleLowerCase('en-US') === row.next.toLocaleLowerCase('en-US')) add(findings, 'warning', 'case-only', 'Case-only rename needs a temporary name', 'Case-insensitive filesystems cannot rename this directly. The generated two-phase plan handles it.', [row.line]);
  });

  const normalizedSources = new Map<string, RenameRow[]>();
  rows.filter((row) => row.current).forEach((row) => {
    const key = portableKey(row.current.replace(/[\\/]$/, ''), assumptions);
    const group = normalizedSources.get(key) ?? [];
    group.push(row);
    if (!normalizedSources.has(key)) normalizedSources.set(key, group);
  });
  rows.forEach((row) => {
    const targetParts = row.next.replaceAll('\\', '/').split('/');
    for (let end = targetParts.length - 1; end > 0; end -= 1) {
      const parentSource = normalizedSources.get(portableKey(targetParts.slice(0, end).join('/'), assumptions))?.find((source) => source.id !== row.id);
      if (!parentSource) continue;
      add(findings, 'error', 'moving-parent', 'Destination sits inside another moving path', `Row ${parentSource.line} moves “${parentSource.current}”, so this destination folder may disappear during staging. Split these changes into separate plans.`, [parentSource.line, row.line]);
      break;
    }
  });

  const normalizationGroups = new Map<string, RenameRow[]>();
  rows.filter((row) => row.next).forEach((row) => {
    const key = row.next.normalize('NFC').toLocaleLowerCase('en-US');
    const group = normalizationGroups.get(key) ?? [];
    group.push(row);
    if (!normalizationGroups.has(key)) normalizationGroups.set(key, group);
  });
  normalizationGroups.forEach((group) => {
    const exactForms = new Set(group.map((row) => row.next));
    if (group.length > 1 && exactForms.size > 1 && !targetDupes.has(portableKey(group[0].next, assumptions))) {
      add(findings, 'error', 'unicode-collision', 'Unicode-normalized names collide', 'These visually similar destinations may be treated as the same filename on macOS or Windows.', group.map((row) => row.line));
    }
  });

  const cycles = findCycles(rows.filter((row) => row.current && row.next && row.current !== row.next), assumptions);
  cycles.forEach((cycle) => add(findings, 'note', 'cycle', 'Rename cycle detected and staged safely', `${cycle.join(' → ')} → ${cycle[0]}. The exported plan uses temporary names to break the cycle.`, rows.filter((row) => cycle.includes(row.current)).map((row) => row.line)));
  checkNumbering(rows, findings);
  findings.sort((a, b) => ({ error: 0, warning: 1, note: 2 }[a.severity] - { error: 0, warning: 1, note: 2 }[b.severity] || (a.rows[0] ?? 0) - (b.rows[0] ?? 0)));
  const errors = findings.filter((finding) => finding.severity === 'error').length;
  const warnings = findings.filter((finding) => finding.severity === 'warning').length;
  const notes = findings.filter((finding) => finding.severity === 'note').length;
  return { rows, findings, errors, warnings, notes, safe: rows.length > 0 && errors === 0, cycles };
}
