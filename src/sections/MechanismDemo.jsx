import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, PenLine, RotateCcw, Send, ShieldAlert, X } from 'lucide-react';
import { Reveal, SectionHeader, Slider } from '../components/ui';

/**
 * Mechanism demo: issue an invoice, send it to the counterparty, lock the FX rate,
 * sign it, and have both sides confirm it once at the source. Then tamper with the
 * counterparty's copy and watch the mismatch get detected immediately.
 */

const RATES = { 'EUR/USD': 1.0842, 'GBP/EUR': 1.1735, 'USD/CHF': 0.8861, 'EUR/SEK': 11.412 };
const CURRENCIES = [
  ['EUR/USD', 'EUR → USD'],
  ['GBP/EUR', 'GBP → EUR'],
  ['USD/CHF', 'USD → CHF'],
  ['EUR/SEK', 'EUR → SEK'],
];
const ERPS = [
  ['SAP S/4HANA|Oracle NetSuite', 'SAP S/4HANA → Oracle NetSuite'],
  ['Microsoft Dynamics 365|SAP S/4HANA', 'Microsoft Dynamics 365 → SAP S/4HANA'],
  ['Oracle NetSuite|Microsoft Dynamics 365', 'Oracle NetSuite → Microsoft Dynamics 365'],
  ['Xero|SAP S/4HANA', 'Xero Accounting → SAP S/4HANA'],
  ['QuickBooks Online|Oracle NetSuite', 'QuickBooks Online → Oracle NetSuite'],
];
const STEPS = [
  ['create', 'Create invoice'],
  ['send', 'Send transaction'],
  ['fx', 'Lock FX rate'],
  ['sign', 'Transaction signed'],
  ['confirm', 'Both sides confirm'],
];
const COUNTERPARTY = 'Company B';

const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const canonical = (e) => [e.inv, e.from, e.to, e.amount.toFixed(2), e.rate ? e.rate.toFixed(4) : '', e.date].join('|');
const IDLE_STEPS = Object.fromEntries(STEPS.map(([k]) => [k, '']));
const IDLE_PILL = { t: 'Idle', cls: '' };

export default function MechanismDemo() {
  const reduce = useReducedMotion();
  const [pair, setPair] = useState('EUR/USD');
  const [amount, setAmount] = useState(48000);
  const [erp, setErp] = useState(ERPS[0][0]);

  const [entries, setEntries] = useState({ you: null, them: null });
  const [pills, setPills] = useState({ you: IDLE_PILL, them: IDLE_PILL });
  const [steps, setSteps] = useState(IDLE_STEPS);
  const [bridge, setBridge] = useState('off'); // off | on | sealed | broken
  const [sync, setSync] = useState('idle'); // idle | live | alert
  const [checks, setChecks] = useState(0);
  const [status, setStatus] = useState('Ready. Choose settings and press Send invoices.');
  const [running, setRunning] = useState(false);
  const [record, setRecord] = useState(null); // confirmed entry
  const [tampered, setTampered] = useState(false);
  const [openInfo, setOpenInfo] = useState(true);
  const runId = useRef(0);

  const [from, to] = pair.split('/');
  const [erpYou, erpThem] = erp.split('|');

  const wait = useCallback((ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms)), [reduce]);
  const step = (k, v) => setSteps((s) => ({ ...s, [k]: v }));

  // heartbeat while in sync
  useEffect(() => {
    if (sync !== 'live') return;
    setChecks(1);
    const t = setInterval(() => setChecks((n) => n + 1), 3000);
    return () => clearInterval(t);
  }, [sync]);

  const reset = useCallback((msg) => {
    runId.current += 1;
    setEntries({ you: null, them: null });
    setPills({ you: IDLE_PILL, them: IDLE_PILL });
    setSteps(IDLE_STEPS);
    setBridge('off');
    setSync('idle');
    setRecord(null);
    setTampered(false);
    setRunning(false);
    if (msg) setStatus(msg);
  }, []);

  // changing settings after a run resets quietly
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current) {
      touched.current = true;
      return;
    }
    if (record || running) reset('Settings changed. Press Send invoices to run again.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair, amount, erp]);

  const send = async () => {
    if (running) return;
    reset();
    const id = runId.current;
    const alive = () => runId.current === id;
    setRunning(true);

    const e = { inv: `INV-${2000 + Math.floor(Math.random() * 900)}`, from, to, amount, rate: null, date: new Date().toISOString().slice(0, 10) };

    step('create', 'active');
    setStatus(`Step 1 of 5: creating ${e.inv} in ${erpYou}.`);
    setPills((p) => ({ ...p, you: { t: 'Drafting', cls: 'wait' } }));
    await wait(600);
    if (!alive()) return;
    setEntries({ you: { ...e }, them: null });
    step('create', 'done');
    setPills((p) => ({ ...p, you: { t: 'Issued', cls: 'wait' } }));

    step('send', 'active');
    setStatus(`Step 2 of 5: sending transaction to ${COUNTERPARTY} (${erpThem}).`);
    setBridge('on');
    await wait(900);
    if (!alive()) return;
    setEntries({ you: { ...e }, them: { ...e } });
    setPills((p) => ({ ...p, them: { t: 'Received', cls: 'wait' } }));
    step('send', 'done');

    step('fx', 'active');
    setStatus(`Step 3 of 5: locking the ${from}/${to} rate both sides agree on.`);
    await wait(700);
    if (!alive()) return;
    e.rate = RATES[pair];
    setEntries({ you: { ...e }, them: { ...e } });
    step('fx', 'done');

    step('sign', 'active');
    setStatus('Step 4 of 5: signing the transaction.');
    await wait(700);
    if (!alive()) return;
    step('sign', 'done');

    step('confirm', 'active');
    setStatus(`Step 5 of 5: your books and ${COUNTERPARTY} confirm the same transaction.`);
    await wait(800);
    if (!alive()) return;
    setPills({ you: { t: 'Confirmed', cls: 'ok' }, them: { t: 'Confirmed', cls: 'ok' } });
    setBridge('sealed');
    step('confirm', 'done');
    setRecord(e);
    setStatus(`Confirmed. ${e.inv} is confirmed in both books. Nothing to re-reconcile for this transaction.`);
    setSync('live');
    setRunning(false);
  };

  const tamper = () => {
    if (!record) return;
    if (tampered) {
      setEntries((x) => ({ ...x, them: { ...record } }));
      setBridge('sealed');
      setPills({ you: { t: 'Confirmed', cls: 'ok' }, them: { t: 'Confirmed', cls: 'ok' } });
      step('sign', 'done');
      setSync('live');
      setTampered(false);
      setStatus(`${COUNTERPARTY} copy restored. Both sides confirmed.`);
      return;
    }
    const changed = { ...record, amount: record.amount - 1 };
    const mismatch = canonical(changed) !== canonical(record);
    setEntries((x) => ({ ...x, them: changed }));
    if (mismatch) {
      setBridge('broken');
      setPills({ you: { t: 'Mismatch', cls: 'bad' }, them: { t: 'Mismatch', cls: 'bad' } });
      step('sign', 'fail');
      setSync('alert');
      setStatus('Mismatch detected');
    }
    setTampered(true);
  };

  const sealed = bridge === 'sealed';
  const broken = bridge === 'broken';

  return (
    <section id="demo" className="relative scroll-mt-20 overflow-hidden bg-navy py-20 text-white sm:py-28">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.1] invert" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full blur-3xl"
        animate={{ backgroundColor: broken ? 'rgba(211,0,17,0.35)' : 'rgba(211,0,17,0.15)' }}
        transition={{ duration: 0.8 }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader dark index="07b" eyebrow="Mechanism demo" title="Reconcile at the moment of the transaction.">
          Agree once. Stop re-reconciling for connected transactions. Set up an invoice, send it, then try tampering with{' '}
          {COUNTERPARTY}’s copy.
        </SectionHeader>

        <Reveal className="mt-12">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.5fr]">
            {/* controls */}
            <div className="flex flex-col gap-5 rounded-[24px] bg-white p-5 text-navy sm:p-6" role="group" aria-label="Demo controls">
              <Select label="Currency pair" value={pair} onChange={setPair} options={CURRENCIES} />
              <Slider
                label="Invoice amount"
                value={amount}
                min={1000}
                max={500000}
                step={1000}
                onChange={setAmount}
                display={`${amount.toLocaleString('en-US')} ${from}`}
              />
              <Select label={`ERP pair (your books → ${COUNTERPARTY})`} value={erp} onChange={setErp} options={ERPS} />

              <div className="mt-1 flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: running ? 1 : 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={running}
                  onClick={send}
                  className="group flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(211,0,17,0.7)] transition-opacity disabled:opacity-60"
                >
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  {running ? 'Sending…' : 'Send invoices'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: record ? 1.02 : 1 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!record}
                  onClick={tamper}
                  className={`flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ring-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    tampered ? 'bg-navy text-white ring-navy' : 'text-navy ring-navy/20 hover:ring-brand hover:text-brand'
                  }`}
                >
                  {tampered ? <RotateCcw className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
                  {tampered ? `Restore ${COUNTERPARTY} copy` : `Tamper with ${COUNTERPARTY} copy`}
                </motion.button>
                <button
                  onClick={() => reset('Reset. Choose settings and press Send invoices.')}
                  className="rounded-full px-5 py-2 text-sm font-medium text-ink transition-colors hover:text-navy"
                >
                  Reset
                </button>
                <p className="text-xs leading-relaxed text-ink">
                  Tamper edits {COUNTERPARTY}’s stored amount by 1 unit and verifies the transaction.
                </p>
              </div>
            </div>

            {/* stage */}
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 sm:p-6">
              {/* two books + bridge */}
              <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <Book title="Your books" erp={erpYou} entry={entries.you} pill={pills.you} state={sealed ? 'ok' : broken ? 'bad' : ''} />
                <Bridge state={bridge} />
                <Book title={COUNTERPARTY} erp={erpThem} entry={entries.them} pill={pills.them} state={sealed ? 'ok' : broken ? 'bad' : ''} diff={tampered} />
              </div>

              {/* steps */}
              <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Transaction steps">
                {STEPS.map(([k, label], i) => (
                  <StepChip key={k} n={i + 1} label={label} state={steps[k]} />
                ))}
              </ol>

              {/* status bar */}
              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-navy/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={status}
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className={`text-sm ${broken ? 'font-semibold text-[#ff6b75]' : 'text-white/80'}`}
                  >
                    {status}
                  </motion.span>
                </AnimatePresence>
                <Heartbeat sync={sync} checks={checks} />
              </div>

              {/* progressive disclosure */}
              <div className="mt-4 rounded-2xl border border-white/10">
                <button
                  onClick={() => setOpenInfo((o) => !o)}
                  aria-expanded={openInfo}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
                >
                  What happens
                  <motion.span animate={{ rotate: openInfo ? 180 : 0 }}>
                    <ChevronDown className="h-4 w-4 text-white/60" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openInfo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm leading-relaxed text-white/70">
                        You issue an invoice. {COUNTERPARTY} receives the same entry. Both confirm it once, at the source. That
                        confirmed entry is the record both books reference, so connected parties stop re-reconciling it at
                        month-end.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- pieces ---------- */

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-ink">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded-xl border border-line bg-paper px-3.5 py-2.5 pr-9 text-sm font-medium text-navy outline-none transition-colors hover:border-navy/30 focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/15"
        >
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
      </span>
    </label>
  );
}

const PILL_STYLES = {
  '': 'bg-white/10 text-white/60',
  wait: 'bg-white/15 text-white',
  ok: 'bg-white text-navy',
  bad: 'bg-brand text-white',
};

function Book({ title, erp, entry, pill, state, diff = false }) {
  return (
    <motion.article
      animate={{
        borderColor: state === 'ok' ? 'rgba(255,255,255,0.55)' : state === 'bad' ? 'rgba(211,0,17,0.9)' : 'rgba(255,255,255,0.12)',
        boxShadow:
          state === 'ok'
            ? '0 0 30px -8px rgba(255,255,255,0.35)'
            : state === 'bad'
              ? '0 0 30px -6px rgba(211,0,17,0.6)'
              : '0 0 0 0 rgba(0,0,0,0)',
      }}
      whileHover={{ y: -3 }}
      className="flex min-h-[210px] flex-col rounded-2xl border bg-navy/70 p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <b className="font-display text-base">{title}</b>
        <small className="truncate font-mono text-[10px] uppercase tracking-wider text-white/50">{erp}</small>
      </div>

      <div className="mt-3 flex-1">
        <AnimatePresence mode="wait">
          {entry ? (
            <motion.dl
              key={`${entry.inv}${entry.rate}${entry.amount}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2 text-sm"
            >
              <Row k="Invoice" v={entry.inv} />
              <Row k="Amount" v={`${fmt(entry.amount)} ${entry.from}`} highlight={diff} />
              {entry.rate && <Row k="FX locked" v={`${entry.rate.toFixed(4)} → ${fmt(entry.amount * entry.rate)} ${entry.to}`} highlight={diff} />}
            </motion.dl>
          ) : (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-white/40">
              No entry yet.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3">
        <motion.span
          key={pill.t}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${PILL_STYLES[pill.cls]}`}
        >
          {pill.cls === 'ok' && <Check className="h-3 w-3" />}
          {pill.cls === 'bad' && <X className="h-3 w-3" />}
          {pill.cls === 'wait' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
          {pill.t}
        </motion.span>
      </div>
    </motion.article>
  );
}

function Row({ k, v, highlight }) {
  return (
    <div className="grid grid-cols-[72px_1fr] gap-2">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-white/50">{k}</dt>
      <dd className={`font-mono text-[13px] ${highlight ? 'text-[#ff6b75]' : 'text-white'}`}>{v}</dd>
    </div>
  );
}

function Bridge({ state }) {
  const on = state !== 'off';
  const sealed = state === 'sealed';
  const broken = state === 'broken';
  return (
    <div className="relative flex items-center justify-center py-2 sm:w-16 sm:py-0" aria-hidden>
      {/* rail: vertical on mobile, horizontal on desktop */}
      <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-white/10 sm:left-0 sm:top-1/2 sm:h-0.5 sm:w-full sm:-translate-y-1/2 sm:translate-x-0">
        <motion.div
          className={`h-full w-full ${broken ? 'bg-brand' : 'bg-white/60'}`}
          animate={{ opacity: on ? 1 : 0 }}
        />
        {state === 'on' && (
          <motion.span
            className="absolute left-0 top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-white sm:block"
            animate={{ left: ['0%', '100%'] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
      <motion.div
        animate={{
          backgroundColor: sealed ? '#ffffff' : broken ? '#D30011' : 'rgba(5,32,63,1)',
          borderColor: sealed ? '#ffffff' : broken ? '#D30011' : 'rgba(255,255,255,0.2)',
          scale: sealed || broken ? [1, 1.25, 1] : 1,
        }}
        transition={{ duration: 0.5 }}
        className="relative z-10 grid h-10 w-10 place-items-center rounded-full border-2"
      >
        {broken ? (
          <ShieldAlert className="h-4 w-4 text-white" />
        ) : (
          <Check className={`h-4 w-4 ${sealed ? 'text-brand' : 'text-white/40'}`} strokeWidth={3} />
        )}
      </motion.div>
    </div>
  );
}

function StepChip({ n, label, state }) {
  const styles = {
    '': 'border-white/10 text-white/50',
    active: 'border-white text-white',
    done: 'border-white bg-white text-navy',
    fail: 'border-brand bg-brand text-white',
  };
  return (
    <motion.li
      animate={state === 'active' ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={state === 'active' ? { duration: 0.9, repeat: Infinity } : { duration: 0.2 }}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors duration-300 ${styles[state]}`}
    >
      <span className="font-mono text-[10px] opacity-70">0{n}</span>
      <span className="leading-tight">{label}</span>
      {state === 'done' && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={3} />}
      {state === 'fail' && <X className="ml-auto h-3.5 w-3.5 shrink-0" strokeWidth={3} />}
    </motion.li>
  );
}

function Heartbeat({ sync, checks }) {
  const live = sync === 'live';
  const alert = sync === 'alert';
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider sm:self-auto ${
        alert ? 'bg-brand text-white' : live ? 'bg-white text-navy' : 'bg-white/10 text-white/60'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {(live || alert) && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${alert ? 'bg-white' : 'bg-brand'}`} />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${alert ? 'bg-white' : live ? 'bg-brand' : 'bg-white/40'}`} />
      </span>
      {alert ? 'Mismatch detected' : live ? `In sync · check ${checks}` : 'Idle'}
    </span>
  );
}
