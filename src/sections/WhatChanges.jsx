import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, CheckCircle2, FileSearch, Gauge, HeartPulse, MessageSquareWarning, ShieldCheck, Stamp } from 'lucide-react';
import { AnimatedNumber, Reveal, SectionHeader, Segmented, SpotlightCard, Stagger, staggerItem } from '../components/ui';

export default function WhatChanges() {
  return (
    <section id="changes" className="relative scroll-mt-20 bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader index="03" eyebrow="What changes" title="Both parties work from the same verified record of the transaction." />

        <Stagger className="mt-14 grid gap-4 md:grid-cols-6">
          <Tile className="md:col-span-3 lg:col-span-3" icon={Gauge} title="Reconciliation time drops sharply" sub="On that relationship. Toggle to compare.">
            <SpeedGauge />
          </Tile>
          <Tile className="md:col-span-3" icon={FileSearch} title="Evidence instead of opinion" sub="Disputes get resolved with the record, not another thread.">
            <DisputeResolver />
          </Tile>
          <Tile className="md:col-span-3 lg:col-span-3" icon={ShieldCheck} title="Stronger than “trust us”" sub="What auditors and lenders see. Hover to compare.">
            <TrustCompare />
          </Tile>
          <Tile className="md:col-span-3" icon={HeartPulse} title="The relationship runs cleaner" sub="Because the numbers are no longer in question.">
            <HealthLine />
          </Tile>
        </Stagger>

        <Reveal className="mt-8">
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-lg font-semibold text-navy">
              You keep your ERP and your existing process.{' '}
              <span className="text-ink">You simply stop fighting over whether the books match.</span>
            </p>
            <a href="#how" className="group shrink-0 text-sm font-semibold text-brand">
              See the layer <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Tile({ className = '', icon: Icon, title, sub, children }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      <SpotlightCard className="h-full">
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy transition-all duration-300 group-hover:bg-brand group-hover:text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold leading-tight">{title}</h3>
              <p className="mt-1 text-sm text-ink">{sub}</p>
            </div>
          </div>
          <div className="mt-6 flex-1">{children}</div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

/* --- 1. benchmark gauge --- */

function SpeedGauge() {
  const [mode, setMode] = useState('before');
  const before = mode === 'before';
  const value = before ? 92 : 9; // % of the original monthly matching effort
  const angle = -90 + (value / 100) * 180;

  return (
    <div className="flex flex-col items-center">
      <Segmented
        layoutId="gauge-toggle"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'before', label: 'Email & spreadsheets', tone: 'brand' },
          { value: 'after', label: 'Shared record' },
        ]}
      />
      <svg viewBox="0 0 240 140" className="mt-4 w-full max-w-sm">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#05203F" />
            <stop offset="55%" stopColor="#595959" />
            <stop offset="100%" stopColor="#D30011" />
          </linearGradient>
        </defs>
        <path d="M20 125 A100 100 0 0 1 220 125" fill="none" stroke="#e3e7ee" strokeWidth="16" strokeLinecap="round" />
        <motion.path
          d="M20 125 A100 100 0 0 1 220 125"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          animate={{ pathLength: value / 100 }}
          transition={{ type: 'spring', stiffness: 60, damping: 14 }}
        />
        {[0, 25, 50, 75, 100].map((t) => {
          const a = (Math.PI * (180 - t * 1.8)) / 180;
          return <circle key={t} cx={120 + Math.cos(a) * 78} cy={125 - Math.sin(a) * 78} r="2" fill="#595959" opacity="0.5" />;
        })}
        <motion.g animate={{ rotate: angle }} transition={{ type: 'spring', stiffness: 70, damping: 11 }} style={{ originX: '120px', originY: '125px' }}>
          <circle cx="120" cy="125" r="90" fill="none" />
          <line x1="120" y1="125" x2="120" y2="45" stroke="#05203F" strokeWidth="3.5" strokeLinecap="round" />
        </motion.g>
        <circle cx="120" cy="125" r="9" fill="#05203F" />
        <circle cx="120" cy="125" r="3.5" fill="#fff" />
      </svg>
      <div className="-mt-2 text-center">
        <div className={`font-display text-4xl font-extrabold ${before ? 'text-brand' : 'text-navy'}`}>
          <AnimatedNumber value={value} format={(n) => `${Math.round(n)}%`} />
        </div>
        <div className="text-xs text-ink">of the monthly matching effort, per relationship · illustrative</div>
      </div>
    </div>
  );
}

/* --- 2. dispute resolver --- */

const TRAIL = [
  { k: 'Agreed', v: 'Facility letter · 6.24% on $2.4M · 30/360', who: 'Both' },
  { k: 'Event', v: 'Sept interest · 30 days', who: 'Both' },
  { k: 'Booked', v: '$12,480.00 · confirmed 02 Oct', who: 'Both' },
];

function DisputeResolver() {
  const [pulled, setPulled] = useState(false);
  return (
    <div className="flex h-full flex-col">
      <div className="rounded-2xl border border-line bg-paper p-4">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-ink">
          <span>Interest · September</span>
          <AnimatePresence mode="wait">
            {pulled ? (
              <motion.span key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 text-navy">
                <BadgeCheck className="h-3.5 w-3.5" /> Resolved
              </motion.span>
            ) : (
              <motion.span key="open" exit={{ opacity: 0, y: -6 }} className="flex items-center gap-1 text-brand">
                <MessageSquareWarning className="h-3.5 w-3.5" /> Disputed
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 font-mono">
          <div className="rounded-xl bg-white p-2.5">
            <div className="text-[10px] uppercase text-ink">Lender says</div>
            <div className="text-base font-semibold text-navy">$12,480.00</div>
          </div>
          <div className="rounded-xl bg-white p-2.5">
            <div className="text-[10px] uppercase text-ink">Borrower says</div>
            <motion.div
              className="text-base font-semibold"
              animate={{ color: pulled ? '#05203F' : '#D30011' }}
            >
              {pulled ? '$12,480.00' : '$12,840.00'}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative mt-3 flex-1">
        <AnimatePresence>
          {pulled && (
            <motion.ol
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
              className="space-y-2"
            >
              {TRAIL.map((t) => (
                <motion.li
                  key={t.k}
                  variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-navy" />
                  <span className="w-14 font-mono text-[10px] uppercase text-ink">{t.k}</span>
                  <span className="flex-1 text-navy">{t.v}</span>
                  <span className="hidden rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-semibold text-navy sm:inline">{t.who}</span>
                </motion.li>
              ))}
            </motion.ol>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setPulled((p) => !p)}
        className={`mt-4 w-full rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
          pulled ? 'bg-navy-50 text-navy' : 'bg-navy text-white hover:bg-navy-800'
        }`}
      >
        {pulled ? 'Reset the dispute' : 'Pull the shared record'}
      </motion.button>
    </div>
  );
}

/* --- 3. trust comparison --- */

function TrustCompare() {
  const [hover, setHover] = useState('verified');
  const items = {
    trust: {
      label: '“Trust us”',
      score: 34,
      rows: ['Spreadsheet export', 'Email confirmation', 'One side’s ERP'],
      tone: 'brand',
    },
    verified: {
      label: 'Shared record',
      score: 96,
      rows: ['Agreed terms on file', 'Each event confirmed by both', 'Timestamped history'],
      tone: 'navy',
    },
  };
  const cur = items[hover];
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-2">
        {Object.entries(items).map(([k, it]) => (
          <button
            key={k}
            onMouseEnter={() => setHover(k)}
            onFocus={() => setHover(k)}
            onClick={() => setHover(k)}
            className={`relative rounded-2xl border p-3 text-left transition-all ${
              hover === k ? (it.tone === 'brand' ? 'border-brand bg-brand-50' : 'border-navy bg-navy-50') : 'border-line bg-white'
            }`}
          >
            <div className={`font-display font-bold ${it.tone === 'brand' ? 'text-brand' : 'text-navy'}`}>{it.label}</div>
            <ul className="mt-1 space-y-0.5 text-xs text-ink">
              {it.rows.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <div className="relative flex flex-col items-center justify-center rounded-2xl bg-paper p-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink">Evidence strength</div>
        <svg viewBox="0 0 120 120" className="mt-2 h-32 w-32 -rotate-90">
          <circle cx="60" cy="60" r="48" fill="none" stroke="#e3e7ee" strokeWidth="12" />
          <motion.circle
            cx="60" cy="60" r="48" fill="none" strokeWidth="12" strokeLinecap="round"
            animate={{ pathLength: cur.score / 100, stroke: cur.tone === 'brand' ? '#D30011' : '#05203F' }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          />
        </svg>
        <div className="absolute inset-0 top-6 grid place-items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={hover}
              initial={{ scale: 1.6, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className={`grid h-14 w-14 place-items-center rounded-full ${cur.tone === 'brand' ? 'bg-brand-50 text-brand' : 'bg-navy text-white'}`}
            >
              {cur.tone === 'brand' ? <MessageSquareWarning className="h-6 w-6" /> : <Stamp className="h-6 w-6" />}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-2 text-[11px] text-ink">Illustrative</div>
      </div>
    </div>
  );
}

/* --- 4. relationship health line --- */

function HealthLine() {
  const [clean, setClean] = useState(false);
  const jagged = 'M0 60 L20 30 L35 85 L50 20 L70 95 L85 35 L100 80 L120 15 L140 90 L160 40 L180 75 L200 25 L220 85 L240 45 L260 70 L280 30 L300 60';
  const smooth = 'M0 60 L20 58 L35 61 L50 59 L70 60 L85 58 L100 61 L120 60 L140 59 L160 60 L180 61 L200 59 L220 60 L240 60 L260 59 L280 60 L300 60';
  return (
    <div onMouseEnter={() => setClean(true)} onMouseLeave={() => setClean(false)} onClick={() => setClean((c) => !c)} className="cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl bg-paper p-4">
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-ink">
          <span>Variance: you vs. them</span>
          <motion.span animate={{ color: clean ? '#05203F' : '#D30011' }}>{clean ? '● Aligned' : '● Volatile'}</motion.span>
        </div>
        <svg viewBox="0 0 300 120" className="mt-2 h-32 w-full" preserveAspectRatio="none">
          <line x1="0" y1="60" x2="300" y2="60" stroke="#05203F" strokeOpacity="0.15" strokeDasharray="4 4" />
          <motion.path
            d={jagged}
            animate={{ d: clean ? smooth : jagged, stroke: clean ? '#05203F' : '#D30011' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            fill="none"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="mt-3 text-center text-xs text-ink">
        <span className="hidden md:inline">Hover</span>
        <span className="md:hidden">Tap</span> to put both sides on one record
      </div>
    </div>
  );
}
