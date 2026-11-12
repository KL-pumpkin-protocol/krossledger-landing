import PocketBase from 'pocketbase';

export const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'https://auth.hexcros.com';

let client;

export function getPb() {
  if (!client) {
    client = new PocketBase(POCKETBASE_URL);
    client.autoCancellation(false);
  }
  return client;
}

export function errorText(err) {
  const data = err?.response?.data || err?.response;
  if (data && typeof data === 'object') {
    const fieldNotes = data.data && typeof data.data === 'object'
      ? Object.entries(data.data)
          .map(([key, value]) => {
            const message = value && typeof value === 'object' ? value.message : value;
            return message ? `${key}: ${message}` : '';
          })
          .filter(Boolean)
          .join(' ')
      : '';
    if (data.message && fieldNotes) return `${data.message} ${fieldNotes}`;
    if (data.message) return String(data.message);
    if (data.error) return String(data.error);
  }
  return err?.message || 'Something went wrong';
}
