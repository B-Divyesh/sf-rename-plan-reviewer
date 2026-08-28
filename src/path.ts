/**
 * Treat both slash styles as separators throughout the reviewer. The UI has
 * always accepted either style for portable plans, so every comparison and
 * export must use this same lexical form.
 */
export function canonicalPath(path: string, separator: '/' | '\\' = '/'): string {
  const portable = path.replace(/[\\/]+/g, '/');
  return separator === '/' ? portable : portable.replaceAll('/', '\\');
}

export function pathParts(path: string): string[] {
  return canonicalPath(path).split('/');
}
