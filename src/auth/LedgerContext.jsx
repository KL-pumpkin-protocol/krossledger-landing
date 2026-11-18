import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearStoredLedger, ledgerFromResponse, readStoredLedger, writeStoredLedger } from '../lib/provision';
import { getPb, isSuperuser } from '../lib/pb';
import { PUBLIC_SIGNUP } from '../lib/signup';
import { useAuth } from './AuthContext';

const LedgerContext = createContext(null);

export function LedgerProvider({ children }) {
  const { user, ready: authReady } = useAuth();
  const [ledger, setLedger] = useState(null);
  const [ledgerUserId, setLedgerUserId] = useState('');
  const [loadedFor, setLoadedFor] = useState('');

  useEffect(() => {
    if (!authReady) return undefined;
    if (!user?.id || isSuperuser(user)) {
      setLedger(null);
      setLedgerUserId('');
      setLoadedFor(user?.id || '');
      return undefined;
    }

    const userId = user.id;
    setLedger(readStoredLedger(userId));
    setLedgerUserId(userId);
    let cancelled = false;

    getPb()
      .send('/api/krossledger/instances/mine', { method: 'GET' })
      .then((row) => {
        if (cancelled) return;
        const next = ledgerFromResponse(row, row?.ledger_name || row?.name);
        if (!next) return;
        writeStoredLedger(userId, next);
        setLedger(next);
        setLedgerUserId(userId);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.status === 404 && String(err?.message || '').toLowerCase().includes('no ledger')) {
          clearStoredLedger(userId);
          setLedger(null);
          return;
        }
        // Keep the browser copy when the account route is unavailable.
      })
      .finally(() => {
        if (!cancelled) setLoadedFor(userId);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, user?.id]);

  const saveLedger = useCallback((userId, entry) => {
    writeStoredLedger(userId, entry);
    setLedger(entry);
    setLedgerUserId(userId);
    setLoadedFor(userId);
  }, []);

  const visibleLedger = user?.id && ledgerUserId === user.id ? ledger : null;

  const value = useMemo(() => ({
    ledger: visibleLedger,
    ready: !user?.id || loadedFor === user.id,
    saveLedger,
  }), [visibleLedger, user?.id, loadedFor, saveLedger]);

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const value = useContext(LedgerContext);
  if (!value) throw new Error('useLedger must be used inside LedgerProvider');
  return value;
}

export function useAccountPath() {
  const { user } = useAuth();
  const { ledger } = useLedger();
  if (!user) {
    if (!PUBLIC_SIGNUP) return null;
    return { href: '#/signup', label: 'Create your ledger', footerLabel: 'Create a ledger' };
  }
  if (isSuperuser(user)) return { href: '#/app', label: 'Admin', footerLabel: 'Admin' };
  if (ledger) return { href: '#/app', label: 'Your ledger', footerLabel: 'Your ledger' };
  return { href: '#/app', label: 'Create your ledger', footerLabel: 'Create a ledger' };
}
