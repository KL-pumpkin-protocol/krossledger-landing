import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLedger } from '../auth/LedgerContext';
import { SECTIONS, buildLedgerRequest, emptyLedgerValues, newIdempotencyKey } from '../lib/ledger';
import { ESTIMATE_MS, PROVISION_MS, alertDue, countdown, formatClock, ledgerFromResponse, ledgerHealthUrl } from '../lib/provision';
import { errorText, getPb } from '../lib/pb';
import { EmailConfirmBanner } from './AccountMail';

const inputClass =
  'rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-navy outline-none transition focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/10';

function Field({ field, value, onChange }) {
  const id = `ledger-${field.key}`;
  return (
    <label htmlFor={id} className={`flex flex-col gap-1.5 text-sm ${field.wide ? 'sm:col-span-2' : ''}`}>
      <span className="font-medium text-navy">
        {field.label}
        {field.required ? <span className="text-brand"> *</span> : null}
      </span>
      {field.type === 'bool' ? (
        <select id={id} className={inputClass} value={value} onChange={(e) => onChange(field.key, e.target.value)}>
          <option value="">Leave unset</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
        <input
          id={id}
          className={inputClass}
          type={field.type === 'password' ? 'password' : 'text'}
          value={value}
          placeholder={field.placeholder || ''}
          autoComplete={field.autoComplete || 'off'}
          required={Boolean(field.required)}
          minLength={field.minLength || undefined}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      )}
      {field.hint ? <span className="text-xs text-ink">{field.hint}</span> : null}
    </label>
  );
}

function healthCopy(health) {
  if (health === 'up') return 'Up';
  if (health === 'down') return 'Not ready yet';
  if (health === 'unknown') return 'Waiting for a health check';
  return 'Checking';
}

async function browserSeesHealth(hostname) {
  const target = ledgerHealthUrl(hostname);
  if (!target) return false;
  try {
    const res = await fetch(target, { method: 'GET', cache: 'no-store', mode: 'cors' });
    const text = await res.text().catch(() => '');
    const body = text.trim().toLowerCase();
    return res.ok && (body === 'ok' || body === '');
  } catch {
    // /health answers 200, and its CORS header names a different site, so this origin cannot read it.
  }
  try {
    const res = await fetch(target, { method: 'GET', cache: 'no-store', mode: 'no-cors' });
    return res.type === 'opaque';
  } catch {
    return false;
  }
}

function LedgerReady({ ledger, email, verified }) {
  const [now, setNow] = useState(() => Date.now());
  const [health, setHealth] = useState('checking');

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let pending = false;
    let timer = 0;

    async function check() {
      if (pending) return;
      pending = true;
      try {
        let serverUp = false;
        let serverStatus = 0;
        try {
          const row = await getPb().send('/api/krossledger/instances/health', { method: 'GET' });
          serverStatus = Number(row?.status) || 0;
          serverUp = Boolean(row?.ok) || (serverStatus >= 200 && serverStatus < 300);
        } catch {
          serverUp = false;
          serverStatus = 0;
        }
        if (cancelled) return;
        if (!serverUp && serverStatus < 400) {
          serverUp = await browserSeesHealth(ledger.hostname);
        }
        if (cancelled) return;
        if (serverUp) {
          setHealth('up');
          window.clearInterval(timer);
          return;
        }
        setHealth('down');
      } finally {
        pending = false;
      }
    }

    setHealth('checking');
    check();
    timer = window.setInterval(check, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [ledger.hostname, ledger.name]);

  const clock = countdown(ledger.acceptedAt, now);
  const notified = health === 'down' && alertDue(ledger.acceptedAt, now);
  const estimateAt = (ESTIMATE_MS / PROVISION_MS) * 100;
  const secondsTotal = PROVISION_MS / 1000;
  const secondsElapsed = Math.min(secondsTotal, secondsTotal - Math.ceil(clock.remaining / 1000));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink">
        <span className="text-brand">Signed in</span> · {email}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">Your KrossLedger</h1>
      {verified ? null : <EmailConfirmBanner email={email} />}

      <section className="mt-8 rounded-3xl border border-line bg-white p-5 sm:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink">Ledger address</p>
        <p className="mt-3 break-all font-mono text-lg font-semibold text-navy sm:text-xl">{ledger.hostname}</p>

        {clock.ready ? null : (
          <div className="mt-8">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-navy">Bringing it up</span>
              <span className="font-mono text-navy" role="timer">{formatClock(clock.remaining)}</span>
            </div>
            <div className="relative mt-3 pt-6">
              <span
                className="absolute top-0 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-wider text-ink"
                style={{ left: `${estimateAt}%` }}
              >
                Estimated time
              </span>
              <div
                className="relative h-2 rounded-full bg-line"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={secondsTotal}
                aria-valuenow={secondsElapsed}
                aria-label="Time until the ledger can be opened"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-1000 ease-linear"
                  style={{ width: `${(1 - clock.ratio) * 100}%` }}
                />
                <span
                  className="absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-navy"
                  style={{ left: `${estimateAt}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 text-sm text-navy" aria-live="polite">
          Health: <span className="font-semibold">{healthCopy(health)}</span>
        </p>

        {notified ? (
          <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand" role="status">
            This is taking longer than expected. We&apos;ve been notified.
          </p>
        ) : null}

        {clock.ready && health === 'up' ? (
          <a
            href={ledger.hostname}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(211,0,17,0.7)]"
          >
            Open ledger
          </a>
        ) : null}
        {clock.ready && health !== 'up' ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="mt-6 inline-flex cursor-not-allowed rounded-full bg-navy/15 px-6 py-3.5 text-sm font-semibold text-navy/45"
          >
            Open ledger
          </button>
        ) : null}
      </section>
    </main>
  );
}

export default function CreateLedger() {
  const { user, ready } = useAuth();
  const { ledger, ready: ledgerReady, saveLedger } = useLedger();
  const [values, setValues] = useState(emptyLedgerValues);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const idempotencyKey = useRef(newIdempotencyKey());

  useEffect(() => {
    if (ready && !user && window.location.hash === '#/app') window.location.hash = '#/login';
  }, [ready, user]);

  useEffect(() => {
    if (!user?.email) return;
    setValues((current) => ({
      ...current,
      SETUP_ADMIN_EMAIL: current.SETUP_ADMIN_EMAIL || user.email,
      SETUP_ADMIN_CONTACT_EMAIL: current.SETUP_ADMIN_CONTACT_EMAIL || user.email,
    }));
  }, [user]);

  function onChange(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    const built = buildLedgerRequest(values, idempotencyKey.current);
    if (built.error) {
      setError(built.error);
      return;
    }
    setPending(true);
    try {
      const response = await getPb().send('/api/krossledger/instances', {
        method: 'POST',
        body: built.body,
      });
      const entry = ledgerFromResponse(response, built.body.name);
      if (!entry) {
        setError('The ledger was accepted, but the address could not be read.');
      } else {
        saveLedger(user.id, entry);
      }
      idempotencyKey.current = newIdempotencyKey();
    } catch (err) {
      if (!err?.status) {
        setError(`${errorText(err)} The same request will be retried if you submit again.`);
      } else {
        setError(errorText(err));
        idempotencyKey.current = newIdempotencyKey();
      }
    } finally {
      setPending(false);
    }
  }

  if (!ready || !user) {
    return <main className="px-4 py-24 text-center text-sm text-ink">Checking your session…</main>;
  }

  if (!ledger && !ledgerReady) {
    return <main className="px-4 py-24 text-center text-sm text-ink">Checking your ledger…</main>;
  }

  if (ledger) {
    return <LedgerReady ledger={ledger} email={user.email} verified={user.verified} />;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink">
        <span className="text-brand">Signed in</span> · {user.email}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">Create a KrossLedger</h1>
      {user.verified ? null : <EmailConfirmBanner email={user.email} />}
      <p className="mt-3 text-sm leading-relaxed text-ink">
        This sends the form to auth.hexcros.com, which creates the instance on the fleet. The fleet key stays on the server.
        Owner is <span className="font-mono text-navy">krossledger</span>. Blank fields are left out. Values may only use letters,
        digits, and <span className="font-mono">. _ : / @ + -</span>, so write names with hyphens, such as Example-AG.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <section className="rounded-3xl border border-line bg-white p-5 sm:p-7">
          <h2 className="font-display text-lg font-semibold text-navy">Ledger</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label htmlFor="ledger-name" className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-navy">
                Name <span className="text-brand">*</span>
              </span>
              <input
                id="ledger-name"
                className={inputClass}
                value={values.name}
                placeholder="setup-demo"
                autoComplete="off"
                required
                pattern={"[a-z][a-z0-9\\-]{0,38}"}
                onChange={(e) => onChange('name', e.target.value.toLowerCase())}
              />
              <span className="text-xs text-ink">Lowercase slug. The fleet assigns the hostname from this name.</span>
            </label>
            <label htmlFor="ledger-size" className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-navy">Size</span>
              <select
                id="ledger-size"
                className={inputClass}
                value={values.instance_type}
                onChange={(e) => onChange('instance_type', e.target.value)}
              >
                <option value="t3.small">t3.small</option>
                <option value="t3.medium">t3.medium</option>
                <option value="t3.large">t3.large</option>
              </select>
            </label>
          </div>
        </section>

        {SECTIONS.map((section) => (
          <section key={section.id} className="rounded-3xl border border-line bg-white p-5 sm:p-7">
            <h2 className="font-display text-lg font-semibold text-navy">{section.title}</h2>
            {section.lead ? <p className="mt-2 text-sm text-ink">{section.lead}</p> : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <Field key={field.key} field={field} value={values[field.key]} onChange={onChange} />
              ))}
            </div>
          </section>
        ))}

        {error ? (
          <p role="alert" className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(211,0,17,0.7)] disabled:opacity-60"
        >
          {pending ? 'Creating…' : 'Create KrossLedger'}
        </button>
      </form>
    </main>
  );
}
