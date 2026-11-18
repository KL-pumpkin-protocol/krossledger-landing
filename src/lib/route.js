import { useEffect, useState } from 'react';
import { PUBLIC_SIGNUP } from './signup';

const CONFIRM = '#/confirm-verification/';
const RESET = '#/reset-password/';

function tokenFrom(hash, prefix) {
  try {
    return decodeURIComponent(hash.slice(prefix.length));
  } catch {
    return '';
  }
}

export function parseHash(hash) {
  const value = hash || '';
  if (value === '#/login') return { name: 'login', token: '' };
  if (value === '#/signup') return { name: PUBLIC_SIGNUP ? 'signup' : 'login', token: '' };
  if (value === '#/app') return { name: 'app', token: '' };
  if (value.startsWith(CONFIRM)) return { name: 'confirm-verification', token: tokenFrom(value, CONFIRM) };
  if (value.startsWith(RESET)) return { name: 'reset-password', token: tokenFrom(value, RESET) };
  return { name: 'home', token: '' };
}

export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '');

  useEffect(() => {
    const sync = () => setHash(window.location.hash || '');
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return parseHash(hash);
}
