import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { POCKETBASE_URL, errorText, getPb } from '../lib/pb';

const DETAILS = [
  ['instance_id', 'Instance'],
  ['instance_type', 'Type'],
  ['owner', 'Owner'],
  ['ec2_state', 'EC2'],
  ['provisioning_state', 'Provisioning'],
  ['readiness', 'Readiness'],
  ['public_ip', 'Public IP'],
  ['private_ip', 'Private IP'],
];

function newTerminateKey() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `terminate-${suffix}`;
}

function domainHref(domain) {
  if (!domain || !/^[a-z0-9.-]+$/i.test(domain) || domain.includes('..')) return '';
  return `https://${domain}`;
}

function canTerminate(instanceId) {
  return /^i-[0-9a-f]{8,30}$/i.test(instanceId || '');
}

export default function AdminDashboard() {
  const { user, ready } = useAuth();
  const [instances, setInstances] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const [updatedAt, setUpdatedAt] = useState('');
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (ready && !user && window.location.hash === '#/app') window.location.hash = '#/login';
  }, [ready, user]);

  useEffect(() => {
    if (!ready || !user) return undefined;
    let cancelled = false;
    setLoading(true);
    getPb()
      .send('/api/krossledger/admin/instances', { method: 'GET' })
      .then((row) => {
        if (cancelled) return;
        setInstances(Array.isArray(row?.instances) ? row.instances : []);
        setError('');
        setUpdatedAt(new Date().toLocaleTimeString());
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorText(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user, tick]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!pending) return undefined;
    function onKey(event) {
      if (event.key === 'Escape' && !deleting) setPending(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, deleting]);

  async function confirmDelete() {
    if (!pending || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await getPb().send(`/api/krossledger/admin/instances/${pending.instance_id}`, {
        method: 'DELETE',
        body: { confirm: 'terminate', idempotency_key: newTerminateKey() },
      });
      setNotice(`Terminate requested for ${pending.name || pending.instance_id}.`);
      setPending(null);
      setTick((value) => value + 1);
    } catch (err) {
      setDeleteError(errorText(err));
    } finally {
      setDeleting(false);
    }
  }

  if (!ready || !user) {
    return <main className="px-4 py-24 text-center text-sm text-ink">Checking your session…</main>;
  }

  const pocketUrl = `${POCKETBASE_URL.replace(/\/$/, '')}/_/`;
  const rows = instances || [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink">
        <span className="text-brand">Admin</span> · {user.email}
      </p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">Instances</h1>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={pocketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-navy"
          >
            PocketBase
          </a>
          <button
            type="button"
            onClick={() => setTick((value) => value + 1)}
            disabled={loading}
            className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink">
        The list reloads every minute{updatedAt ? ` · last update ${updatedAt}` : ''}.
      </p>

      {notice ? (
        <p className="mt-4 rounded-2xl bg-navy px-4 py-3 text-sm text-white" role="status">{notice}</p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand" role="alert">{error}</p>
      ) : null}

      {instances === null && !error ? (
        <p className="mt-8 text-sm text-ink">Loading instances…</p>
      ) : null}
      {instances && rows.length === 0 ? (
        <p className="mt-8 text-sm text-ink">No instances.</p>
      ) : null}

      <div className="mt-6 flex flex-col gap-4">
        {rows.map((instance) => {
          const href = domainHref(instance.domain);
          const id = instance.instance_id || instance.name || instance.domain;
          return (
            <article key={id} className="rounded-3xl border border-line bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold text-navy">{instance.name || 'Unnamed instance'}</h2>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-mono text-sm text-navy hover:text-brand">
                      {instance.domain}
                    </a>
                  ) : (
                    <p className="mt-1 font-mono text-sm text-ink">{instance.domain || 'No domain'}</p>
                  )}
                </div>
                {canTerminate(instance.instance_id) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError('');
                      setPending(instance);
                    }}
                    className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-50"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {DETAILS.map(([key, label]) => (
                  <div key={key}>
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-ink">{label}</dt>
                    <dd className="mt-1 break-all font-mono text-sm text-navy">{instance[key] || '—'}</dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>

      {pending ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 px-4" role="presentation" onClick={() => { if (!deleting) setPending(null); }}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="terminate-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="terminate-title" className="font-display text-xl font-semibold text-navy">Terminate this instance?</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink">
              {pending.name || 'This instance'} ({pending.instance_id}) will be terminated. This cannot be undone.
            </p>
            {deleteError ? (
              <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand" role="alert">{deleteError}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPending(null)}
                disabled={deleting}
                className="rounded-full px-4 py-2 text-sm font-semibold text-navy disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleting ? 'Terminating…' : 'Terminate'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
