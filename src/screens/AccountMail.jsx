import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

function Notice({ kind, children }) {
  if (!children) return null;
  const className = kind === 'error'
    ? 'mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand'
    : 'mt-4 rounded-2xl bg-navy-50 px-4 py-3 text-sm text-navy';
  return <p className={className} role={kind === 'error' ? 'alert' : 'status'}>{children}</p>;
}

export function EmailConfirmBanner({ email }) {
  const { requestVerification, refresh } = useAuth();
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const onFocus = () => {
      refresh().catch(() => {});
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  async function send() {
    setPending(true);
    setNotice('');
    setError('');
    try {
      await requestVerification(email);
      setNotice(`A confirmation link is on its way to ${email}.`);
    } catch (err) {
      setError(err.message || 'The confirmation email could not be sent.');
    } finally {
      setPending(false);
    }
  }

  async function checkAgain() {
    setChecking(true);
    setError('');
    try {
      await refresh();
    } catch (err) {
      setError(err.message || 'The session could not be refreshed.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-brand/30 bg-brand-50 p-5 sm:p-7">
      <h2 className="font-display text-lg font-semibold text-navy">Confirm your email</h2>
      <p className="mt-2 text-sm leading-relaxed text-navy">
        Open the confirmation email sent to <span className="font-semibold">{email}</span>.
        The message comes from auth.hexcros.com.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={send}
          disabled={pending}
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Send confirmation email'}
        </button>
        <button
          type="button"
          onClick={checkAgain}
          disabled={checking}
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy disabled:opacity-60"
        >
          {checking ? 'Checking…' : 'Check again'}
        </button>
      </div>
      <Notice kind="ok">{notice}</Notice>
      <Notice kind="error">{error}</Notice>
    </section>
  );
}

export function PasswordByEmail({ email }) {
  const { requestPasswordReset } = useAuth();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function send() {
    setPending(true);
    setNotice('');
    setError('');
    try {
      await requestPasswordReset(email);
      setNotice(`A password link is on its way to ${email}. Open it to choose a new password.`);
    } catch (err) {
      setError(err.message || 'The password email could not be sent.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-line bg-white p-5 sm:p-7">
      <h2 className="font-display text-lg font-semibold text-navy">Password</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink">
        A link to <span className="font-medium text-navy">{email}</span> opens a page where you choose a new password.
      </p>
      <button
        type="button"
        onClick={send}
        disabled={pending}
        className="mt-5 rounded-full border border-navy px-5 py-2.5 text-sm font-semibold text-navy disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Email me a password link'}
      </button>
      <Notice kind="ok">{notice}</Notice>
      <Notice kind="error">{error}</Notice>
    </section>
  );
}
