import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const inputClass =
  'rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10';

export default function AuthScreen({ mode }) {
  const { user, ready, login, signup, requestVerification, requestPasswordReset } = useAuth();
  const isSignup = mode === 'signup';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState('');

  useEffect(() => {
    if (ready && user) window.location.hash = '#/app';
  }, [ready, user]);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (isSignup && password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setPending(true);
    try {
      if (isSignup) {
        await signup({ name, email, password, passwordConfirm });
        setSentTo(email.trim());
      } else {
        await login(email, password);
        window.location.hash = '#/app';
      }
    } catch (err) {
      const message = err.message || 'Something went wrong';
      if (isSignup && err.code === 'verification-email') {
        setSentTo(email.trim());
        setError(`Your account is created, but the confirmation email could not be sent. ${message}`);
      } else {
        setError(message);
      }
    } finally {
      setPending(false);
    }
  }

  async function sendVerification() {
    const identity = (sentTo || email).trim();
    if (!identity) {
      setError('Enter your email first.');
      return;
    }
    setPending(true);
    setError('');
    setNotice('');
    try {
      await requestVerification(identity);
      setNotice(`If that account still needs confirmation, a link is on its way to ${identity}.`);
    } catch (err) {
      setError(err.message || 'The confirmation email could not be sent.');
    } finally {
      setPending(false);
    }
  }

  async function sendPasswordReset() {
    const identity = email.trim();
    if (!identity) {
      setError('Enter your email first.');
      setNotice('');
      return;
    }
    setPending(true);
    setError('');
    setNotice('');
    try {
      await requestPasswordReset(identity);
      setNotice(`If an account exists for ${identity}, a password link is on its way.`);
    } catch (err) {
      setError(err.message || 'The password email could not be sent.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight text-navy">
        {isSignup ? 'Create your account' : 'Log in'}
      </h1>
      <p className="mt-2 text-sm text-ink">
        {isSignup
          ? 'This account is on auth.hexcros.com. A confirmation email finishes the signup.'
          : 'Use the account you created on auth.hexcros.com.'}
      </p>
      {isSignup && sentTo ? (
        <div className="mt-8 rounded-3xl border border-line bg-white p-5">
          <p className="text-sm leading-relaxed text-ink">
            {error ? (
              <>
                Your account for <span className="font-medium text-navy">{sentTo}</span> is created.
                Send the confirmation email again once mail is working.
              </>
            ) : (
              <>
                A confirmation link is on its way to <span className="font-medium text-navy">{sentTo}</span>.
                Open it, then log in.
              </>
            )}
          </p>
          {error ? (
            <p role="alert" className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand">{error}</p>
          ) : null}
          {notice ? (
            <p role="status" className="mt-4 rounded-xl bg-navy-50 px-3 py-2 text-sm text-navy">{notice}</p>
          ) : null}
          <button
            type="button"
            onClick={sendVerification}
            disabled={pending}
            className="mt-5 rounded-full border border-navy px-5 py-2.5 text-sm font-semibold text-navy disabled:opacity-60"
          >
            {pending ? 'Sending…' : 'Send the email again'}
          </button>
          <p className="mt-6 text-sm text-ink">
            <a href="#/login" className="font-semibold text-navy hover:text-brand">
              Log in
            </a>
          </p>
        </div>
      ) : (
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        {isSignup && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-navy">
            Name
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </label>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy">
          Email
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy">
          Password
          <input
            className={inputClass}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />
        </label>
        {isSignup && (
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
        )}
        {error ? (
          <p role="alert" className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="rounded-xl bg-navy-50 px-3 py-2 text-sm text-navy">
            {notice}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </button>
        {isSignup ? null : (
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <button type="button" onClick={sendPasswordReset} disabled={pending} className="font-semibold text-navy hover:text-brand disabled:opacity-60">
              Forgot your password?
            </button>
            <button type="button" onClick={sendVerification} disabled={pending} className="font-semibold text-navy hover:text-brand disabled:opacity-60">
              Resend confirmation email
            </button>
          </div>
        )}
      </form>
      )}
      {isSignup && sentTo ? null : (
      <p className="mt-6 text-sm text-ink">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <a href="#/login" className="font-semibold text-navy hover:text-brand">
              Log in
            </a>
          </>
        ) : (
          <>
            No account yet?{' '}
            <a href="#/signup" className="font-semibold text-navy hover:text-brand">
              Sign up
            </a>
          </>
        )}
      </p>
      )}
    </main>
  );
}
