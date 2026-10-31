import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Building, Check, CheckCircle2, Database, FileCheck2, GripVertical, Link2, Mail, RotateCcw, Users } from 'lucide-react';
import { Reveal, SectionHeader } from '../components/ui';

const STEPS = [
  { n: '01', title: 'Connect the relationship', body: 'One counterparty, one set of transactions.', icon: Link2 },
  { n: '02', title: 'Both sides confirm', body: 'Both sides see and confirm the same record of each event.', icon: Users },
  { n: '03', title: 'Pull the record, not the thread', body: 'When someone questions a number, you pull the shared record instead of starting another email thread.', icon: FileCheck2 },
];
const STEP_MS = 7000;

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-20%' });
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || !inView) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [step, auto, inView]);

  const pick = (i) => {
    setAuto(false);
    setStep(i);
  };

  return (
    <section id="how" ref={ref} className="relative scroll-mt-20 bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader index="05" eyebrow="How it works" title="Three steps. One relationship at a time." />

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.2fr] lg:gap-10">
          {/* step list */}
          <div className="flex flex-col gap-3">
            {STEPS.map((s, i) => {
              const active = i === step;
              return (
                <motion.button
                  key={s.n}
                  onClick={() => pick(i)}
                  whileHover={{ x: active ? 0 : 4 }}
                  className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-colors ${
                    active ? 'border-navy bg-white shadow-[0_20px_50px_-30px_rgba(5,32,63,0.5)]' : 'border-line bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${
                        active ? 'bg-brand text-white' : 'bg-navy-50 text-navy'
                      }`}
                    >
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-mono text-xs text-ink">{s.n} / 03</div>
                      <h3 className="font-display text-lg font-bold text-navy">{s.title}</h3>
                      <AnimatePresence initial={false}>
                        {active && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden text-sm leading-relaxed text-ink"
                          >
                            <span className="block pt-1">{s.body}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {active && auto && inView && (
                    <motion.div
                      key={`bar${step}`}
                      className="absolute bottom-0 left-0 h-[3px] bg-brand"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* visual stage */}
          <div className="relative min-h-[380px] overflow-hidden rounded-[28px] border border-line bg-white" onPointerDown={() => setAuto(false)}>
            <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="relative h-full p-5 sm:p-8"
              >
                {step === 0 && <ConnectViz />}
                {step === 1 && <ConfirmDnD />}
                {step === 2 && <PullRecordViz />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <LayerDiagram />
      </div>
    </section>
  );
}

/* --- step 1 --- */
function ConnectViz() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center">
      <svg viewBox="0 0 400 180" className="w-full max-w-md">
        <motion.path
          d="M80 90 C 160 20, 240 160, 320 90"
          fill="none"
          stroke="#D30011"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeInOut' }}
        />
        <circle r="6" fill="#D30011">
          <animateMotion path="M80 90 C 160 20, 240 160, 320 90" dur="2s" begin="1.6s" repeatCount="indefinite" />
        </circle>
        {[80, 320].map((x, i) => (
          <motion.g key={x} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: i * 0.15 }} style={{ originX: `${x}px`, originY: '90px' }}>
            <circle cx={x} cy="90" r="38" fill="#fff" stroke="#05203F" strokeWidth="2.5" />
            <foreignObject x={x - 12} y="78" width="24" height="24">
              <Building className="h-6 w-6 text-navy" />
            </foreignObject>
          </motion.g>
        ))}
      </svg>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {['You', '1 counterparty', '1 set of transactions'].map((l, i) => (
          <motion.span
            key={l}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 + i * 0.15 }}
            className="rounded-full border border-line bg-white px-3 py-1.5 font-mono text-xs text-navy"
          >
            {l}
          </motion.span>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-5 flex items-center gap-2 text-sm font-semibold text-navy">
        <CheckCircle2 className="h-4 w-4 text-brand" /> Relationship connected
      </motion.div>
    </div>
  );
}

/* --- step 2: drag-and-drop confirmation widget --- */
const INITIAL = [
  { id: 'r1', label: 'Rent · October', amt: '$16,083.33' },
  { id: 'r2', label: 'Service charge · Oct', amt: '$2,040.00' },
  { id: 'r3', label: 'Late fee waiver', amt: '−$250.00' },
];

function ConfirmDnD() {
  const zone = useRef(null);
  const [pending, setPending] = useState(INITIAL);
  const [shared, setShared] = useState([]); // {..., them: bool}
  const [hot, setHot] = useState(false);

  const inZone = (pt) => {
    const r = zone.current?.getBoundingClientRect();
    if (!r) return false;
    const x = pt.x - window.scrollX;
    const y = pt.y - window.scrollY;
    return x > r.left && x < r.right && y > r.top && y < r.bottom;
  };

  const confirm = (item) => {
    setPending((p) => p.filter((x) => x.id !== item.id));
    setShared((s) => [...s, { ...item, them: false }]);
    setTimeout(() => setShared((s) => s.map((x) => (x.id === item.id ? { ...x, them: true } : x))), 900);
  };
  const reset = () => {
    setPending(INITIAL);
    setShared([]);
  };

  return (
    <div className="grid h-full gap-4 sm:grid-cols-2">
      <div>
        <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ink">Your books · drag or tap</div>
        <div className="space-y-2">
          <AnimatePresence>
            {pending.map((it) => (
              <motion.div
                key={it.id}
                layout
                drag
                dragSnapToOrigin
                dragElastic={0.6}
                whileDrag={{ scale: 1.06, rotate: -2, zIndex: 50, boxShadow: '0 20px 40px -12px rgba(5,32,63,0.4)' }}
                whileHover={{ y: -2 }}
                onDrag={(_, info) => setHot(inZone(info.point))}
                onDragEnd={(_, info) => {
                  setHot(false);
                  if (inZone(info.point)) confirm(it);
                }}
                onTap={() => confirm(it)}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative flex cursor-grab touch-none items-center gap-2 rounded-xl border border-line bg-white px-3 py-3 active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-ink/50" />
                <span className="flex-1 text-sm font-medium text-navy">{it.label}</span>
                <span className="font-mono text-xs text-navy">{it.amt}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {pending.length === 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={reset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-sm text-ink hover:text-navy"
            >
              <RotateCcw className="h-4 w-4" /> Run it again
            </motion.button>
          )}
        </div>
      </div>

      <div
        ref={zone}
        className={`relative min-h-[240px] rounded-2xl border-2 border-dashed p-3 transition-all duration-200 ${
          hot ? 'scale-[1.02] border-brand bg-brand-50' : 'border-navy/20 bg-paper/70'
        }`}
      >
        <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-ink">
          <span className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" /> Shared record
          </span>
          <span>{shared.filter((s) => s.them).length}/{INITIAL.length}</span>
        </div>
        {shared.length === 0 && <div className="grid h-40 place-items-center text-center text-sm text-ink/70">Drop events here</div>}
        <div className="space-y-2">
          {shared.map((it) => (
            <motion.div
              key={it.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-line bg-white px-3 py-2.5"
            >
              <div className="flex justify-between text-sm">
                <span className="font-medium text-navy">{it.label}</span>
                <span className="font-mono text-xs text-navy">{it.amt}</span>
              </div>
              <div className="mt-1.5 flex gap-1.5 text-[10px] font-semibold">
                <span className="flex items-center gap-1 rounded-full bg-navy px-2 py-0.5 text-white">
                  <Check className="h-3 w-3" /> You
                </span>
                <motion.span
                  animate={{ backgroundColor: it.them ? '#05203F' : '#e3e7ee', color: it.them ? '#fff' : '#595959' }}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5"
                >
                  {it.them ? <Check className="h-3 w-3" /> : <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>…</motion.span>}
                  Tenant
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- step 3 --- */
const THREAD = ['Re: Q3 rent — your figure?', 'Re: Re: Q3 rent — see attached', 'Re: Re: Re: which version?', 'Fwd: Re: Re: Re: need sign-off'];

function PullRecordViz() {
  const [pulled, setPulled] = useState(false);
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center">
      <div className="relative h-56 w-full max-w-sm">
        <AnimatePresence>
          {!pulled &&
            THREAD.map((t, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                animate={{ opacity: 1, y: i * 40, rotate: (i % 2 ? 1 : -1) * (1 + i) }}
                exit={{ opacity: 0, y: 80, scale: 0.6, rotate: 0, transition: { delay: (THREAD.length - i) * 0.05 } }}
                transition={{ delay: i * 0.2, type: 'spring', stiffness: 200, damping: 18 }}
                className="absolute inset-x-0 flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-md"
              >
                <Mail className="h-4 w-4 shrink-0 text-brand" />
                <span className="truncate text-sm text-navy">{t}</span>
              </motion.div>
            ))}
        </AnimatePresence>
        <AnimatePresence>
          {pulled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 20 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.3 }}
              className="absolute inset-x-0 rounded-2xl border-2 border-navy bg-white p-5 shadow-xl"
            >
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-ink">
                <span>Shared record · Q3 rent</span>
                <FileCheck2 className="h-4 w-4 text-navy" />
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold text-navy">$48,250.00</div>
              <div className="mt-3 space-y-1.5 text-xs text-ink">
                <div className="flex justify-between"><span>Agreed in</span><span className="text-navy">Lease §4.1</span></div>
                <div className="flex justify-between"><span>Confirmed by landlord</span><span className="text-navy">01 Jul · 09:12</span></div>
                <div className="flex justify-between"><span>Confirmed by tenant</span><span className="text-navy">01 Jul · 11:40</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setPulled((p) => !p)}
        className={`mt-6 rounded-full px-6 py-3 text-sm font-semibold ${pulled ? 'bg-navy-50 text-navy' : 'bg-brand text-white shadow-lg shadow-brand/30'}`}
      >
        {pulled ? 'Show the old way' : 'Pull the shared record'}
      </motion.button>
    </div>
  );
}

/* --- layer diagram: "no new system, just a layer" --- */
function LayerDiagram() {
  const [hover, setHover] = useState(null);
  const layers = [
    { k: 'you', title: 'Your ERP & invoicing', tag: 'Unchanged', dark: false },
    { k: 'kl', title: 'KrossLedger', tag: 'The shared, checkable layer', dark: true },
    { k: 'them', title: 'Their ERP & invoicing', tag: 'Unchanged', dark: false },
  ];
  return (
    <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
      <Reveal>
        <h3 className="font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">
          No new system to replace your accounting.
        </h3>
        <p className="mt-4 text-lg text-ink">Just a layer that makes the existing numbers mutually checkable.</p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="relative flex flex-col items-center gap-3 [perspective:1000px]">
          {layers.map((l) => (
            <motion.div
              key={l.k}
              onHoverStart={() => setHover(l.k)}
              onHoverEnd={() => setHover(null)}
              initial={{ rotateX: 30 }}
              animate={{ rotateX: hover === l.k ? 0 : 30, scale: hover === l.k ? 1.04 : 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              className={`relative flex w-full max-w-md cursor-default items-center justify-between rounded-2xl px-6 py-5 ${
                l.dark ? 'z-10 bg-navy text-white shadow-[0_20px_50px_-15px_rgba(211,0,17,0.55)] ring-2 ring-brand' : 'border border-line bg-white text-navy shadow-sm'
              }`}
            >
              <span className="font-display text-lg font-bold">{l.title}</span>
              <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${l.dark ? 'bg-brand text-white' : 'bg-paper text-ink'}`}>{l.tag}</span>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
