import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const inputClass =
  'rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10';

export default function AuthScreen({ mode }) {
  const { user, ready, login, signup } = useAuth();
  const isSignup = mode === 'signup';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && user) window.location.hash = '#/app';
  }, [ready, user]);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    if (isSignup && password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setPending(true);
    try {
      if (isSignup) {
        await signup({ name, email, password, passwordConfirm });
      } else {
        await login(email, password);
      }
      window.location.hash = '#/app';
    } catch (err) {
      const message = err.message || 'Something went wrong';
      if (isSignup && /verified|verification/i.test(message)) {
        setError('Account created. Confirm the email from auth.hexcros.com, then log in.');
      } else {
        setError(message);
      }
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
          ? 'This account is on auth.hexcros.com. You will use it to create a KrossLedger.'
          : 'Use the account you created on auth.hexcros.com.'}
      </p>
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
        {error && (
          <p role="alert" className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </button>
      </form>
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
    </main>
  );
}
