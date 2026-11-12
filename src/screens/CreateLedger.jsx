import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { SECTIONS, buildLedgerRequest, emptyLedgerValues, newIdempotencyKey } from '../lib/ledger';
import { errorText, getPb } from '../lib/pb';

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

export default function CreateLedger() {
  const { user, ready } = useAuth();
  const [values, setValues] = useState(emptyLedgerValues);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
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
    setResult(null);
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
      setResult(response);
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink">
        <span className="text-brand">Signed in</span> · {user.email}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">Create a KrossLedger</h1>
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
        {result ? (
          <div className="rounded-2xl bg-navy px-4 py-4 text-sm text-white">
            <p className="font-semibold">Ledger accepted.</p>
            <p className="mt-1 text-white/80">
              Operation {result.operation_id || 'pending'} is {result.status || 'accepted'}.
              {result.step ? ` Step: ${result.step}.` : ''}
            </p>
          </div>
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
