import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { analyze } from '../src/analyze';
import { parseDelimited, rowsFromRule } from '../src/csv';
import { powershellPlan, shellPlan, stageRows } from '../src/export';
import type { Assumptions, RenameRow } from '../src/types';

const assumptions: Assumptions = { caseInsensitive: true, unicode: 'NFC', platform: 'portable' };
const row = (current: string, next: string, line: number): RenameRow => ({ id: `row-${line}`, current, next, line });

describe('mapping input', () => {
  it('reads headers, quoted commas, and escaped quotes', () => {
    const result = parseDelimited('current,new\n"old, one.txt","new ""one"".txt"');
    expect(result.errors).toEqual([]);
    expect(result.rows[0]).toMatchObject({ current: 'old, one.txt', next: 'new "one".txt' });
  });

  it('preserves significant whitespace inside quoted filenames', () => {
    const result = parseDelimited('current,new\na.txt,"bad "');
    expect(result.errors).toEqual([]);
    expect(result.rows[0]).toMatchObject({ current: 'a.txt', next: 'bad ' });
    expect(analyze(result.rows, assumptions).findings.map((finding) => finding.code)).toContain('trailing-character');
  });

  it('reports malformed and short records', () => {
    expect(parseDelimited('current,new\nonly-one-column').errors[0]).toContain('expected two columns');
    expect(parseDelimited('"never closed,new').errors[0]).toContain('not closed');
  });

  it('applies a regular expression to every source', () => {
    const result = rowsFromRule('IMG_001.jpg\nIMG_002.jpg', '^IMG_(\\d+)\\.jpg$', 'trip-$1.webp', 'g');
    expect(result.rows.map((item) => item.next)).toEqual(['trip-001.webp', 'trip-002.webp']);
  });
});

describe('safety review', () => {
  it('detects swaps, duplicate targets, reserved names, and numbering gaps', () => {
    const review = analyze([
      row('a.jpg', 'b.jpg', 1),
      row('b.jpg', 'a.jpg', 2),
      row('c.jpg', 'album/scan-001.jpg', 3),
      row('d.jpg', 'album/scan-003.jpg', 4),
      row('e.jpg', 'album/scan-003.jpg', 5),
      row('f.jpg', 'CON.txt', 6)
    ], assumptions);
    const codes = review.findings.map((finding) => finding.code);
    expect(codes).toContain('cycle');
    expect(codes).toContain('target-collision');
    expect(codes).toContain('reserved-name');
    expect(codes).toContain('number-gap');
    expect(review.safe).toBe(false);
  });

  it('detects traversal, absolute paths, invalid characters, and Unicode collisions', () => {
    const review = analyze([
      row('a', '../escape.txt', 1),
      row('b', '/absolute.txt', 2),
      row('c', 'bad?.txt', 3),
      row('d', 'caf\u00e9.txt', 4),
      row('e', 'cafe\u0301.txt', 5)
    ], { ...assumptions, unicode: 'none' });
    const codes = review.findings.map((finding) => finding.code);
    expect(codes).toEqual(expect.arrayContaining(['path-traversal', 'absolute-path', 'invalid-character', 'unicode-collision']));
  });

  it('blocks sources outside the reviewed root and Windows backslash absolute targets', () => {
    const review = analyze([
      row('/tmp/outside.txt', 'safe-a.txt', 1),
      row('../outside.txt', 'safe-b.txt', 2),
      row('inside.txt', 'C:\\outside\\bad.txt', 3)
    ], assumptions);
    expect(review.findings.map((finding) => finding.code)).toEqual(expect.arrayContaining([
      'source-absolute-path',
      'source-path-traversal',
      'absolute-path'
    ]));
    expect(review.safe).toBe(false);
  });

  it('blocks a destination nested under another moving source', () => {
    const review = analyze([row('folder', 'archive', 1), row('photo.jpg', 'folder/photo.jpg', 2)], assumptions);
    expect(review.findings.map((finding) => finding.code)).toContain('moving-parent');
  });

  it('uses filesystem assumptions when finding a moving parent', () => {
    const review = analyze([row('Folder', 'Archive', 1), row('other.txt', 'folder/other.txt', 2)], assumptions);
    expect(review.findings.map((finding) => finding.code)).toContain('moving-parent');
    expect(review.safe).toBe(false);
  });

  it('reviews 1,000 safe mappings and stages unique names', () => {
    const rows = Array.from({ length: 1_000 }, (_, index) => row(`in/file-${index}.jpg`, `out/photo-${String(index).padStart(4, '0')}.jpg`, index + 1));
    const review = analyze(rows, assumptions);
    const staged = stageRows(rows);
    expect(review.errors).toBe(0);
    expect(review.safe).toBe(true);
    expect(new Set(staged.map((item) => item.temporary)).size).toBe(1_000);
  });
});

describe('reversible exports', () => {
  const swap = [row("a's file.txt", 'b.txt', 1), row('b.txt', "a's file.txt", 2)];

  it('quotes shell paths and completes phase one before phase two', () => {
    const script = shellPlan(swap, assumptions, true);
    expect(script).toContain("'a'\"'\"'s file.txt'");
    expect(script.indexOf('# Phase 2')).toBeGreaterThan(script.lastIndexOf('.rpr-', script.indexOf('# Phase 2')));
    expect(script).toContain('set -eu');
    expect(shellPlan([row('a.txt', 'folder/b.txt', 1)], assumptions, true)).toContain('Destination folder is missing');
  });

  it('executes dry and live same-folder swaps without inventing destination folders', () => {
    const directory = mkdtempSync(join(tmpdir(), 'rpr-export-'));
    try {
      writeFileSync(join(directory, "a's file.txt"), 'first');
      writeFileSync(join(directory, 'b.txt'), 'second');
      const dryPath = join(directory, 'dry.sh');
      writeFileSync(dryPath, shellPlan(swap, assumptions, false));
      const dryOutput = execFileSync('/bin/sh', [dryPath], { cwd: directory, encoding: 'utf8' });
      expect(dryOutput).toContain('Dry run only. 2 renames would be applied.');
      expect(readFileSync(join(directory, "a's file.txt"), 'utf8')).toBe('first');
      const livePath = join(directory, 'live.sh');
      writeFileSync(livePath, shellPlan(swap, assumptions, true));
      const liveOutput = execFileSync('/bin/sh', [livePath], { cwd: directory, encoding: 'utf8' });
      expect(liveOutput).toContain('Applied 2 renames.');
      expect(readFileSync(join(directory, "a's file.txt"), 'utf8')).toBe('second');
      expect(readFileSync(join(directory, 'b.txt'), 'utf8')).toBe('first');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('uses literal PowerShell paths and defaults can print only', () => {
    const script = powershellPlan(swap, assumptions, false);
    expect(script).toContain('Write-Output');
    expect(script).toContain('-LiteralPath');
    expect(script).toContain("a''s file.txt");
    expect(script).not.toContain('Destination folder is missing');
  });
});
