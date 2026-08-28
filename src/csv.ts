import type { RenameRow } from './types';

export interface ParseResult {
  rows: RenameRow[];
  errors: string[];
}

export function parseDelimited(text: string, delimiter = ','): ParseResult {
  const records: Array<Array<{ value: string; quoted: boolean }>> = [];
  const errors: string[] = [];
  let record: Array<{ value: string; quoted: boolean }> = [];
  let field = '';
  let quoted = false;
  let fieldWasQuoted = false;
  let line = 1;
  let recordLine = 1;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
        if (char === '\n') line += 1;
      }
      continue;
    }
    if (char === '"' && field.length === 0) {
      quoted = true;
      fieldWasQuoted = true;
    } else if (char === delimiter) {
      record.push({ value: field, quoted: fieldWasQuoted });
      field = '';
      fieldWasQuoted = false;
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      record.push({ value: field, quoted: fieldWasQuoted });
      if (record.some((cell) => cell.value.trim() !== '')) records.push(record);
      record = [];
      field = '';
      fieldWasQuoted = false;
      line += 1;
      recordLine = line;
    } else {
      field += char;
    }
  }

  if (quoted) errors.push(`Line ${recordLine}: an opening quote is not closed.`);
  record.push({ value: field, quoted: fieldWasQuoted });
  if (record.some((cell) => cell.value.trim() !== '')) records.push(record);

  const first = records[0]?.map(({ value }) => value.trim().toLowerCase()) ?? [];
  const hasHeader = first.length >= 2 && ['current', 'old', 'source', 'from'].includes(first[0]) && ['new', 'next', 'target', 'to'].includes(first[1]);
  const start = hasHeader ? 1 : 0;
  const rows: RenameRow[] = [];
  for (let index = start; index < records.length; index += 1) {
    const cells = records[index];
    const physicalLine = index + 1;
    if (cells.length < 2) {
      errors.push(`Line ${physicalLine}: expected two columns (current and new).`);
      continue;
    }
    if (cells.length > 2 && cells.slice(2).some((cell) => cell.value.trim())) {
      errors.push(`Line ${physicalLine}: found extra columns; quote paths that contain the delimiter.`);
      continue;
    }
    const value = (cell: { value: string; quoted: boolean }): string => cell.quoted ? cell.value : cell.value.trim();
    rows.push({ id: `row-${physicalLine}`, current: value(cells[0]), next: value(cells[1]), line: physicalLine });
  }
  return { rows, errors };
}

export function rowsFromRule(sourceList: string, pattern: string, replacement: string, flags: string): ParseResult {
  const errors: string[] = [];
  let expression: RegExp;
  try {
    expression = new RegExp(pattern, flags);
  } catch (error) {
    return { rows: [], errors: [`Regex cannot be used: ${error instanceof Error ? error.message : 'invalid expression'}`] };
  }
  const sources = sourceList.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  const rows = sources.map((current, index) => {
    expression.lastIndex = 0;
    return { id: `row-${index + 1}`, current, next: current.replace(expression, replacement), line: index + 1 };
  });
  return { rows, errors };
}

export function toCsv(rows: RenameRow[]): string {
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return ['current,new', ...rows.map((row) => `${quote(row.current)},${quote(row.next)}`)].join('\n');
}
