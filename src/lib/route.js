import { useEffect, useState } from 'react';

export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '');

  useEffect(() => {
    const sync = () => setHash(window.location.hash || '');
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  if (hash === '#/login') return 'login';
  if (hash === '#/signup') return 'signup';
  if (hash === '#/app') return 'app';
  return 'home';
}
