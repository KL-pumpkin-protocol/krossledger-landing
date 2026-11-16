const SLUG = /^[a-z][a-z0-9-]{0,38}$/;

export const PROVISION_MS = 5 * 60 * 1000;
export const ESTIMATE_MS = 3 * 60 * 1000;
export const ALERT_MS = 5 * 60 * 1000;

function cleanDomain(value) {
  const domain = String(value || '').trim().toLowerCase();
  if (!domain || domain.length > 253 || domain.startsWith('.') || domain.includes('..')) return 'krossledger.com';
  if (!/^[a-z0-9.-]+$/.test(domain)) return 'krossledger.com';
  return domain;
}

const envDomain = import.meta.env?.VITE_LEDGER_DOMAIN;
export const LEDGER_DOMAIN = cleanDomain(envDomain || 'krossledger.com');

export function isLedgerSlug(name) {
  return SLUG.test(name) && !name.endsWith('-');
}

export function hostnameFor(name) {
  return `https://${name}.${LEDGER_DOMAIN}`;
}

export function ledgerHealthUrl(hostname) {
  let url;
  try {
    url = new URL(hostname);
  } catch {
    return '';
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return '';
  const host = url.hostname.toLowerCase();
  if (host !== LEDGER_DOMAIN && !host.endsWith(`.${LEDGER_DOMAIN}`)) return '';
  return `${url.origin}/health`;
}

export function parseTime(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value) return Date.now();
  const text = String(value).trim();
  const normalized = text.includes('T') ? text : text.replace(' ', 'T');
  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export function formatClock(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function countdown(acceptedAt, now = Date.now()) {
  const remaining = Math.max(0, parseTime(acceptedAt) + PROVISION_MS - now);
  const ratio = Math.min(1, remaining / PROVISION_MS);
  return { remaining, ratio, ready: remaining === 0 };
}

export function alertDue(acceptedAt, now = Date.now()) {
  return now >= parseTime(acceptedAt) + ALERT_MS;
}

export function ledgerFromResponse(row, fallbackName) {
  const name = String(row?.ledger_name || fallbackName || '').trim().toLowerCase();
  if (!isLedgerSlug(name)) return null;
  return {
    name,
    hostname: hostnameFor(name),
    acceptedAt: row?.accepted_at ? String(row.accepted_at) : new Date().toISOString(),
    operationId: row?.operation_id ? String(row.operation_id) : '',
    status: row?.status ? String(row.status) : 'accepted',
  };
}

const storageKey = (userId) => `krossledger.accepted.${userId}`;

export function readStoredLedger(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return ledgerFromResponse(parsed, parsed?.name);
  } catch {
    return null;
  }
}

export function writeStoredLedger(userId, ledger) {
  if (!userId || !ledger?.name) return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify({
      ledger_name: ledger.name,
      name: ledger.name,
      accepted_at: ledger.acceptedAt,
      operation_id: ledger.operationId || '',
      status: ledger.status || 'accepted',
    }));
  } catch {
    // Private mode can reject the write. The server copy still hides the form on the next visit.
  }
}
