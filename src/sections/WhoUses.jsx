import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ArrowLeftRight, Building, Check, ChevronLeft, ChevronRight, Home, Landmark, LineChart, Repeat, Umbrella } from 'lucide-react';
import { Reveal, SectionHeader } from '../components/ui';

const TYPES = [
  {
    key: 'property',
    tab: 'Landlords & tenants',
    icon: Home,
    a: 'Landlord',
    b: 'Tenant',
    events: [
      ['Rent · Q3', '$48,250.00'],
      ['Service charge · Sept', '$6,120.00'],
      ['Year-end settlement', '−$1,430.00'],
    ],
  },
  {
    key: 'lending',
    tab: 'Lenders & borrowers',
    icon: Landmark,
    a: 'Lender',
    b: 'Borrower',
    events: [
      ['Drawdown #4', '$2,400,000.00'],
      ['Interest · Sept', '$12,480.00'],
      ['Repayment', '$150,000.00'],
    ],
  },
  {
    key: 'insurance',
    tab: 'Insurers, brokers & insureds',
    icon: Umbrella,
    a: 'Insurer',
    b: 'Insured',
    events: [
      ['Premium · instalment 2', '$84,300.00'],
      ['Broker commission', '$8,430.00'],
      ['Claim #2291 paid', '$212,000.00'],
    ],
  },
  {
    key: 'securities',
    tab: 'Securities & settlement',
    icon: LineChart,
    a: 'Buyer',
    b: 'Seller',
    events: [
      ['Trade · 40,000 units', '$1,236,000.00'],
      ['Settlement T+1', '$1,236,000.00'],
      ['Coupon', '$18,540.00'],
    ],
  },
  {
    key: 'any',
    tab: 'Any two parties',
    icon: Repeat,
    a: 'Company A',
    b: 'Company B',
    events: [
      ['Invoice #1042', '$32,900.00'],
      ['Credit note #88', '−$2,100.00'],
      ['Payment', '$30,800.00'],
    ],
  },
];

export default function WhoUses() {
  const [i, setI] = useState(0);
  const t = TYPES[i];
  const go = (d) => setI((x) => (x + d + TYPES.length) % TYPES.length);

  return (
    <section id="who" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader index="04" eyebrow="Who uses it" title="Any bilateral financial relationship that lives longer than a single invoice." />

        {/* tabs — horizontal swipe strip on mobile */}
        <Reveal className="mt-10">
          <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {TYPES.map((x, idx) => {
              const active = idx === i;
              return (
                <button
                  key={x.key}
                  onClick={() => setI(idx)}
                  className={`relative flex shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active ? 'border-navy text-white' : 'border-line bg-white text-ink hover:border-navy/30 hover:text-navy'
                  }`}
                >
                  {active && (
                    <motion.span layoutId="who-tab" className="absolute inset-0 -z-0 rounded-full bg-navy" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                  <x.icon className={`relative h-4 w-4 ${active ? 'text-white' : 'text-brand'}`} />
                  <span className="relative">{x.tab}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-6">
          <div className="relative overflow-hidden rounded-[28px] border border-line bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={t.key}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) go(1);
                  else if (info.offset.x > 70) go(-1);
                }}
                className="grid cursor-grab touch-pan-y gap-6 p-4 [&>*]:min-w-0 sm:p-5 active:cursor-grabbing sm:p-8 lg:grid-cols-[1fr_1.15fr] lg:gap-10"
              >
                <PairDiagram t={t} />
                <SharedLedger t={t} />
              </motion.div>
            </AnimatePresence>

            {/* pager */}
            <div className="flex items-center justify-between border-t border-line px-5 py-3 sm:px-8">
              <div className="flex gap-1.5">
                {TYPES.map((x, idx) => (
                  <button key={x.key} onClick={() => setI(idx)} aria-label={x.tab} className="py-2">
                    <motion.span className="block h-1.5 rounded-full" animate={{ width: idx === i ? 24 : 6, backgroundColor: idx === i ? '#D30011' : '#e3e7ee' }} />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="mr-2 hidden text-xs text-ink sm:inline">Swipe or use arrows</span>
                {[
                  [ChevronLeft, -1],
                  [ChevronRight, 1],
                ].map(([Icon, d]) => (
                  <motion.button
                    key={d}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => go(d)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-line text-navy hover:border-navy"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10 text-center">
          <p className="font-display text-2xl font-bold text-navy sm:text-3xl">
            If both sides record it, <span className="text-brand">both sides can verify it.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function PairDiagram({ t }) {
  return (
    <div className="relative flex min-h-[260px] items-center justify-between rounded-2xl bg-paper px-3 py-8 sm:px-8">
      <div className="grid-bg pointer-events-none absolute inset-0 rounded-2xl opacity-70" />
      {[t.a, t.b].map((name, k) => (
        <motion.div
          key={name}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: k * 0.1 }}
          whileHover={{ scale: 1.06 }}
          className={`relative z-10 flex w-20 flex-col items-center gap-2 sm:w-28 ${k === 1 ? 'order-3' : ''}`}
        >
          <div className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-navy bg-white shadow-md sm:h-20 sm:w-20">
            <Building className="h-7 w-7 text-navy" />
          </div>
          <span className="text-center font-display text-sm font-bold text-navy">{name}</span>
        </motion.div>
      ))}

      {/* flowing events between parties */}
      <div className="relative z-0 order-2 mx-2 flex h-40 flex-1 flex-col justify-center">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-navy/15" />
        <div className="absolute left-1/2 top-1/2 z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-navy text-white shadow-lg">
          <ArrowLeftRight className="h-5 w-5" />
        </div>
        {t.events.map(([label], k) => (
          <motion.div
            key={label}
            className="absolute left-0 whitespace-nowrap rounded-full border border-line bg-white px-2 py-0.5 font-mono text-[9px] text-navy shadow-sm sm:text-[10px]"
            style={{ top: `${18 + k * 30}%` }}
            initial={{ left: k % 2 ? '70%' : '0%', opacity: 0 }}
            animate={{ left: k % 2 ? ['70%', '0%'] : ['0%', '70%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: k * 0.9, ease: 'easeInOut' }}
          >
            {label.split(' ·')[0]}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SharedLedger({ t }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    setStep(0);
    const id = setInterval(() => setStep((s) => (s >= t.events.length * 2 ? s : s + 1)), 450);
    return () => clearInterval(id);
  }, [t.key, inView, t.events.length]);

  return (
    <div ref={ref} className="flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-wider text-ink">Shared record</div>
        <motion.div
          animate={{ opacity: step >= t.events.length * 2 ? 1 : 0.4 }}
          className="flex items-center gap-1.5 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy"
        >
          <Check className="h-3.5 w-3.5" /> {Math.min(t.events.length, Math.floor(step / 2))}/{t.events.length} agreed
        </motion.div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="grid grid-cols-[1.4fr_1fr_auto_auto] gap-2 bg-paper px-3 sm:gap-3 sm:px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-ink">
          <span>Event</span>
          <span className="text-right">Amount</span>
          <span className="w-10 text-center sm:w-14">{t.a.split(' ')[0]}</span>
          <span className="w-10 text-center sm:w-14">{t.b.split(' ')[0]}</span>
        </div>
        {t.events.map(([label, amt], k) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + k * 0.08 }}
            className="grid grid-cols-[1.4fr_1fr_auto_auto] items-center gap-2 border-t border-line px-3 sm:gap-3 sm:px-4 py-3.5 text-sm transition-colors hover:bg-paper/60"
          >
            <span className="font-medium text-navy">{label}</span>
            <span className="text-right font-mono text-xs text-navy sm:text-sm">{amt}</span>
            <Tick on={step > k * 2} />
            <Tick on={step > k * 2 + 1} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Tick({ on }) {
  return (
    <span className="grid w-10 place-items-center sm:w-14">
      <motion.span
        animate={on ? { scale: 1, backgroundColor: '#05203F' } : { scale: 0.8, backgroundColor: '#e3e7ee' }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="grid h-6 w-6 place-items-center rounded-full"
      >
        {on && <Check className="h-3.5 w-3.5 text-white" />}
      </motion.span>
    </span>
  );
}
