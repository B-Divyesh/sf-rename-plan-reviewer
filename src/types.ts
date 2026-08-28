export type Severity = 'error' | 'warning' | 'note';

export interface RenameRow {
  id: string;
  current: string;
  next: string;
  line: number;
}

export interface Finding {
  severity: Severity;
  code: string;
  title: string;
  detail: string;
  rows: number[];
}

export interface Assumptions {
  caseInsensitive: boolean;
  unicode: 'none' | 'NFC' | 'NFD';
  platform: 'portable' | 'windows' | 'macos' | 'linux';
}

export interface Review {
  rows: RenameRow[];
  findings: Finding[];
  errors: number;
  warnings: number;
  notes: number;
  safe: boolean;
  cycles: string[][];
}

export interface Draft {
  version: 1;
  mode: 'csv' | 'rule';
  input: string;
  sourceList: string;
  pattern: string;
  replacement: string;
  flags: string;
  delimiter: ',' | '\t' | ';';
  assumptions: Assumptions;
  liveCommands: boolean;
  updatedAt: string;
}
