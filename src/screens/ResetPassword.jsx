import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const inputClass =
  'rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10';

export default function ResetPassword({ token }) {
  const { confirmPasswordReset } = useAuth();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState(token ? '' : 'This password link is missing a token.');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    if (!token) {
      setError('This password link is missing a token.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setPending(true);
    try {
      await confirmPasswordReset(token, password, passwordConfirm);
      setDone(true);
    } catch (err) {
      setError(err.message || 'This password link could not be used.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight text-navy">Choose a new password</h1>
      {done ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-ink">Your password is updated. Log in with the new one.</p>
          <a href="#/login" className="mt-8 inline-flex w-fit rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white">
            Log in
          </a>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink">This link came from the password email. It can be used once.</p>
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-navy">
              New password
              <input
                className={inputClass}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-navy">
              Confirm password
              <input
                className={inputClass}
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
            {error ? (
              <p role="alert" className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={pending || !token}
              className="mt-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? 'Saving…' : 'Save password'}
            </button>
          </form>
        </>
      )}
    </main>
  );
}
