import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export default function ConfirmVerification({ token }) {
  const { confirmVerification } = useAuth();
  const request = useRef({ token: '', promise: null });
  const [status, setStatus] = useState(token ? 'pending' : 'error');
  const [error, setError] = useState(token ? '' : 'This confirmation link is missing a token.');

  useEffect(() => {
    if (!token) return undefined;
    if (request.current.token !== token) {
      request.current = { token, promise: confirmVerification(token) };
    }
    let active = true;
    request.current.promise
      .then(() => {
        if (active) setStatus('done');
      })
      .catch((err) => {
        if (!active) return;
        setStatus('error');
        setError(err.message || 'This confirmation link could not be used.');
      });
    return () => {
      active = false;
    };
  }, [token, confirmVerification]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight text-navy">Confirm your email</h1>
      {status === 'pending' ? (
        <p className="mt-3 text-sm text-ink">Confirming your email…</p>
      ) : null}
      {status === 'done' ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-ink">Your email is confirmed. Log in to open your ledger.</p>
          <a href="#/login" className="mt-8 inline-flex w-fit rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white">
            Log in
          </a>
        </>
      ) : null}
      {status === 'error' ? (
        <>
          <p role="alert" className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand">{error}</p>
          <a href="#/login" className="mt-6 text-sm font-semibold text-navy hover:text-brand">
            Back to log in
          </a>
        </>
      ) : null}
    </main>
  );
}
