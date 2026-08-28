const SLUG = 'rename-plan-reviewer';
const STORAGE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${STORAGE_KEY}:verdict`;
const DAY = 86_400_000;
const API_BASE = (import.meta.env.VITE_BILLING_BASE as string | undefined) ?? 'https://api.sociobot.in/api/v1';

export const buyUrl = `${API_BASE}/products/${SLUG}/checkout`;
export const purchasesEnabled = import.meta.env.VITE_PURCHASES_ENABLED === 'true';

interface Verdict {
  valid: boolean;
  checkedAt: number;
  reason?: string;
}

export function captureLicense(): void {
  const url = new URL(window.location.href);
  const license = url.searchParams.get('license');
  if (!license) return;
  localStorage.setItem(STORAGE_KEY, license);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function cachedUnlock(): boolean {
  if (!localStorage.getItem(STORAGE_KEY)) return false;
  try {
    return (JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '{}') as Verdict).valid === true;
  } catch {
    return false;
  }
}

export async function verifyLicense(force = false): Promise<Verdict | undefined> {
  const license = localStorage.getItem(STORAGE_KEY);
  if (!license) return undefined;
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '{}') as Verdict;
    if (!force && cached.checkedAt && Date.now() - cached.checkedAt < DAY) return cached;
  } catch { /* verify malformed cache */ }
  try {
    const response = await fetch(`${API_BASE}/products/${SLUG}/verify?license=${encodeURIComponent(license)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const data = await response.json() as { valid: boolean; reason?: string };
    const verdict = { valid: data.valid, reason: data.reason, checkedAt: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    return verdict;
  } catch {
    return undefined;
  }
}

export async function restoreLicense(license: string): Promise<Verdict | undefined> {
  localStorage.setItem(STORAGE_KEY, license.trim());
  localStorage.removeItem(VERDICT_KEY);
  return verifyLicense(true);
}
