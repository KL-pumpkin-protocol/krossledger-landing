import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Calculator, Clock, FileWarning, Hourglass, Scale } from 'lucide-react';
import { AnimatedNumber, Reveal, SectionHeader, Slider, SpotlightCard, Stagger, staggerItem } from '../components/ui';

export default function RealCost() {
  return (
    <section id="cost" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader index="02" eyebrow="The real cost" title="Every ongoing B2B relationship eventually produces the same waste." />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <Stagger className="grid gap-4 sm:grid-cols-2">
            <PainCard icon={Clock} title="Hours of matching" body="Controllers spend hours every month matching numbers that should already match.">
              <ClockViz />
            </PainCard>
            <PainCard icon={Scale} title="Disputes sit open" body="Neither side can prove what the other recorded.">
              <DisputeViz />
            </PainCard>
            <PainCard icon={Hourglass} title="Everything slows down" body="Financing, audits, and renewals wait while people chase spreadsheets and emails.">
              <StallViz />
            </PainCard>
            <PainCard icon={FileWarning} title="One wrong figure" body="Costs real cash or real time.">
              <WrongFigureViz />
            </PainCard>
          </Stagger>

          <Reveal delay={0.1}>
            <CostCalculator />
          </Reveal>
        </div>

        <Reveal className="mt-14">
          <div className="relative overflow-hidden rounded-[28px] bg-navy px-6 py-10 text-white sm:px-12 sm:py-14">
            <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.15] invert" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <p className="font-display text-2xl font-semibold leading-snug sm:text-3xl">
                You already send the documents and make the payments.{' '}
                <span className="text-white/60">You still don’t fully trust the other side’s books.</span>{' '}
                <span className="text-[#ff4d5a]">That gap is expensive.</span>
              </p>
              <GapViz />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PainCard({ icon: Icon, title, body, children }) {
  return (
    <motion.div variants={staggerItem}>
      <SpotlightCard className="h-full">
        <div className="flex h-full flex-col p-5">
          <div className="mb-4 h-28 overflow-hidden rounded-2xl bg-paper">{children}</div>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-brand transition-transform duration-300 group-hover:scale-125" />
            <h3 className="font-display text-lg font-bold">{title}</h3>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">{body}</p>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

/* --- mini visuals --- */

function ClockViz() {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} className="flex h-full items-center justify-center gap-5">
      <svg viewBox="0 0 80 80" className="h-20 w-20">
        <circle cx="40" cy="40" r="34" fill="#fff" stroke="#05203F" strokeWidth="2.5" />
        {[...Array(12)].map((_, i) => (
          <line key={i} x1="40" y1="9" x2="40" y2={i % 3 ? 12 : 15} stroke="#05203F" strokeWidth="1.6" transform={`rotate(${i * 30} 40 40)`} />
        ))}
        {[
          { y2: 16, c: '#D30011', w: 2.5, d: 2.2 },
          { y2: 24, c: '#05203F', w: 3, d: 26 },
        ].map((h) => (
          <motion.g key={h.d} animate={inView ? { rotate: 360 } : {}} transition={{ duration: h.d, repeat: Infinity, ease: 'linear' }}>
            <circle cx="40" cy="40" r="34" fill="none" />
            <line x1="40" y1="40" x2="40" y2={h.y2} stroke={h.c} strokeWidth={h.w} strokeLinecap="round" />
          </motion.g>
        ))}
        <circle cx="40" cy="40" r="3" fill="#05203F" />
      </svg>
      <div className="space-y-1.5 font-mono text-[10px]">
        {['$12,480 ↔ $12,480', '$3,050 ↔ $3,050', '$9,912 ↔ $9,921'].map((r, i) => (
          <motion.div
            key={r}
            className={`rounded-md bg-white px-2 py-1 ${i === 2 ? 'text-brand' : 'text-navy'}`}
            animate={inView ? { opacity: [0.35, 1, 0.35] } : {}}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6 }}
          >
            {r}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DisputeViz() {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [days, setDays] = useState(23);
  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setDays((d) => (d > 98 ? 23 : d + 1)), 260);
    return () => clearInterval(t);
  }, [inView]);
  return (
    <div ref={ref} className="flex h-full flex-col items-center justify-center gap-2">
      <div className="flex items-center gap-2 font-mono text-sm">
        <span className="rounded-lg bg-white px-2 py-1 text-navy">You: $12,480</span>
        <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="font-bold text-brand">≠</motion.span>
        <span className="rounded-lg bg-white px-2 py-1 text-navy">Them: $12,840</span>
      </div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-ink">
        Open for <span className="inline-block w-7 text-right font-semibold text-brand">{days}</span> days
      </div>
    </div>
  );
}

function StallViz() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const rows = [
    ['Financing', 46],
    ['Audit', 62],
    ['Renewal', 33],
  ];
  return (
    <div ref={ref} className="flex h-full flex-col justify-center gap-2.5 px-5">
      {rows.map(([label, pct], i) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-16 font-mono text-[10px] uppercase text-ink">{label}</span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white">
            <motion.div
              className="h-full rounded-full bg-navy group-hover:bg-brand"
              initial={{ width: 0 }}
              animate={inView ? { width: [`0%`, `${pct}%`, `${pct - 3}%`, `${pct}%`] } : {}}
              transition={{ duration: 2.4, delay: i * 0.2, times: [0, 0.6, 0.8, 1] }}
            />
          </div>
          <motion.span className="font-mono text-[10px] text-brand" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3 }}>
            waiting
          </motion.span>
        </div>
      ))}
    </div>
  );
}

function WrongFigureViz() {
  const [wrong, setWrong] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setWrong((w) => !w), 1600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex font-mono text-2xl font-semibold text-navy">
        $1,2
        <span className="relative inline-block w-[0.62em] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={wrong ? 'w' : 'r'}
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className={`inline-block ${wrong ? 'text-brand' : ''}`}
            >
              {wrong ? '4' : '8'}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="relative inline-block w-[0.62em] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={wrong ? 'w' : 'r'}
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className={`inline-block ${wrong ? 'text-brand' : ''}`}
            >
              {wrong ? '8' : '4'}
            </motion.span>
          </AnimatePresence>
        </span>
        ,500
      </div>
      <div className={`mt-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${wrong ? 'text-brand' : 'text-ink'}`}>
        {wrong ? 'Transposed · $36,000 gap' : 'As agreed'}
      </div>
    </div>
  );
}

function GapViz() {
  return (
    <div className="flex items-center justify-center gap-0">
      <motion.div
        className="grid h-24 w-20 place-items-center rounded-2xl border-2 border-white/80 font-mono text-[10px] uppercase tracking-wider"
        animate={{ x: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        Yours
      </motion.div>
      <motion.div
        className="mx-2 h-px w-10 bg-[#ff4d5a]"
        animate={{ scaleX: [0.6, 1.4, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="grid h-24 w-20 place-items-center rounded-2xl border-2 border-[#ff4d5a] font-mono text-[10px] uppercase tracking-wider text-[#ff4d5a]"
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        Theirs
      </motion.div>
    </div>
  );
}

/* --- interactive calculator --- */

const DISPUTE_HOURS = 10;

function CostCalculator() {
  const [parties, setParties] = useState(15);
  const [hrs, setHrs] = useState(6);
  const [rate, setRate] = useState(95);
  const [disputes, setDisputes] = useState(10);

  const matchingHours = parties * hrs * 12;
  const disputeHours = disputes * DISPUTE_HOURS;
  const totalHours = matchingHours + disputeHours;
  const cost = totalHours * rate;
  const weeks = Math.min(52, Math.round(totalHours / 40));
  const matchShare = totalHours ? matchingHours / totalHours : 0;

  return (
    <SpotlightCard className="h-full" glow="rgba(5,32,63,0.08)">
      <div className="flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <Calculator className="h-5 w-5 text-brand" /> Price the gap
          </div>
          <span className="rounded-full bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink">Your inputs</span>
        </div>

        <div className="mt-6 space-y-5">
          <Slider label="Counterparties you reconcile" value={parties} min={1} max={100} onChange={setParties} />
          <Slider label="Hours matching each, per month" value={hrs} min={1} max={20} onChange={setHrs} display={`${hrs}h`} />
          <Slider label="Loaded cost per finance hour" value={rate} min={40} max={250} step={5} onChange={setRate} display={`$${rate}`} />
          <Slider label={`Disputes per year (~${DISPUTE_HOURS}h each)`} value={disputes} min={0} max={60} onChange={setDisputes} />
        </div>

        <div className="mt-7 rounded-2xl bg-paper p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-ink">Spent each year arguing about the numbers</div>
          <div className="mt-1 font-display text-4xl font-extrabold tracking-tight text-brand sm:text-5xl">
            <AnimatedNumber value={cost} format={(n) => `$${Math.round(n).toLocaleString('en-US')}`} />
          </div>
          <div className="mt-1 text-sm text-ink">
            <AnimatedNumber value={totalHours} /> hours · about <span className="font-semibold text-navy">{weeks}</span> full-time weeks
          </div>

          {/* stacked bar */}
          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-white">
            <motion.div className="h-full bg-navy" animate={{ width: `${matchShare * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
            <motion.div className="h-full bg-brand" animate={{ width: `${(1 - matchShare) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-ink">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-navy" /> Matching</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-brand" /> Disputes</span>
          </div>

          {/* waffle: weeks of the year lost */}
          <div className="mt-4 grid grid-cols-[repeat(26,minmax(0,1fr))] gap-[3px]">
            {Array.from({ length: 52 }).map((_, i) => (
              <motion.div
                key={i}
                className="aspect-square rounded-[2px]"
                animate={{ backgroundColor: i < weeks ? '#D30011' : '#e3e7ee', scale: i < weeks ? 1 : 0.85 }}
                transition={{ delay: i * 0.008 }}
              />
            ))}
          </div>
          <div className="mt-1.5 text-[11px] text-ink">Each square = one working week of the year</div>
        </div>
      </div>
    </SpotlightCard>
  );
}
