import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileSearch, Receipt, ScanSearch, ShieldCheck } from 'lucide-react';
import { AnimatedNumber, Reveal, SectionHeader, Segmented, Slider } from '../components/ui';

const COLS = 12;
const ROWS = 5;
const TOTAL = COLS * ROWS;
// items an auditor would pick in a traditional sample (row, col)
const SAMPLE = new Set([[0, 3], [0, 11], [1, 6], [2, 3], [2, 10], [3, 5], [4, 7]].map(([r, c]) => r * COLS + c));
// KrossLedger-enabled audit fee as a share of the traditional fee (range)
const FEE_LOW = 0.4;
const FEE_HIGH = 0.6;

const fmt$ = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
const fmtK = (n) => `$${Math.round(n / 1000).toLocaleString('en-US')}k`;

export default function AuditCoverage() {
  const [mode, setMode] = useState('sample');
  const [fee, setFee] = useState(250000);
  const [hover, setHover] = useState(null);
  const pop = mode === 'population';

  const coverage = pop ? 100 : (SAMPLE.size / TOTAL) * 100;
  const feeLow = pop ? fee * FEE_LOW : fee;
  const feeHigh = pop ? fee * FEE_HIGH : fee;

  return (
    <section id="audit" className="relative scroll-mt-20 overflow-hidden bg-navy py-20 text-white sm:py-28">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.1] invert" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-brand/25 blur-3xl"
        animate={{ opacity: pop ? 0.9 : 0.4, scale: pop ? 1.2 : 1 }}
        transition={{ duration: 1.2 }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader dark index="03b" eyebrow="Audit coverage" title="Auditors test a sample. Or they test everything.">
          A shared record means every event is already confirmed by both sides — so the audit can cover the whole population, for less.
        </SectionHeader>

        <Reveal className="mt-12">
          <div className="grid gap-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
            <div>
            {/* header row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff6b75]">Audit coverage</div>
                <div className="relative mt-1 h-8 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.h3
                      key={mode}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -40, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="font-display text-lg font-bold tracking-tight sm:text-xl"
                    >
                      {pop ? 'KrossLedger · 100% population' : 'Traditional sample'}
                    </motion.h3>
                  </AnimatePresence>
                </div>
              </div>
              <Segmented
                dark
                layoutId="audit-toggle"
                value={mode}
                onChange={setMode}
                options={[
                  { value: 'sample', label: 'Sample' },
                  { value: 'population', label: 'Population' },
                ]}
              />
            </div>

            {/* population grid */}
            <div
              className="relative mt-5 grid grid-cols-10 gap-1 sm:grid-cols-12 sm:gap-1.5"
              onMouseLeave={() => setHover(null)}
            >
              {Array.from({ length: TOTAL }).map((_, i) => {
                const tested = pop || SAMPLE.has(i);
                const r = Math.floor(i / COLS);
                const c = i % COLS;
                return (
                  <motion.button
                    key={i}
                    type="button"
                    aria-label={`Event ${i + 1}: ${tested ? 'tested' : 'not tested'}`}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onClick={() => setHover(i)}
                    whileHover={{ scale: 1.08, zIndex: 2 }}
                    animate={{
                      backgroundColor: tested ? '#FFFFFF' : 'rgba(255,255,255,0.07)',
                      boxShadow: tested ? '0 0 14px -2px rgba(255,255,255,0.45)' : '0 0 0 0 rgba(255,255,255,0)',
                    }}
                    transition={{ duration: 0.35, delay: pop ? (r + c) * 0.035 : SAMPLE.has(i) ? 0 : (ROWS + COLS - r - c) * 0.015 }}
                    className="relative grid aspect-square place-items-center rounded-[4px] sm:rounded-md"
                  >
                    <AnimatePresence>
                      {tested && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ delay: pop ? (r + c) * 0.035 + 0.1 : 0 }}
                        >
                          <Check strokeWidth={3} className="h-2.5 w-2.5 text-brand sm:h-3 sm:w-3" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}

              {/* tooltip */}
              <AnimatePresence>
                {hover !== null && (
                  <motion.div
                    key="tip"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute -top-10 right-0 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-navy shadow-lg"
                  >
                    Event #{hover + 1} ·{' '}
                    {pop ? (
                      <span className="text-navy">confirmed by both sides</span>
                    ) : SAMPLE.has(hover) ? (
                      <span className="text-brand">sampled & tested</span>
                    ) : (
                      <span className="text-ink">never looked at</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

              <p className="mt-3 text-xs text-white/50">Each square is one booked event in the relationship. Hover or tap to inspect.</p>
            </div>

            {/* metrics */}
            <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Card icon={ScanSearch} label="Events tested">
                <div className="font-display text-2xl font-bold">
                  <AnimatedNumber value={coverage} format={(n) => `${Math.round(n)}%`} />
                </div>
                <div className="mt-1 text-xs text-white/60">
                  {pop ? `All ${TOTAL} of ${TOTAL} events` : `${SAMPLE.size} of ${TOTAL} events, the rest extrapolated`}
                </div>
                <Bar pct={coverage} />
              </Card>

              <Card icon={Receipt} label="Audit fee" highlight={pop}>
                <div className="flex items-baseline gap-2">
                  <div className="font-display text-2xl font-bold">
                    {pop ? (
                      <>
                        <AnimatedNumber value={feeLow} format={fmtK} />
                        <span className="text-white/50"> – </span>
                        <AnimatedNumber value={feeHigh} format={fmtK} />
                      </>
                    ) : (
                      <AnimatedNumber value={fee} format={fmt$} />
                    )}
                  </div>
                  <AnimatePresence>
                    {pop && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        className="rounded-full bg-white px-2 py-0.5 font-mono text-xs font-semibold text-brand"
                      >
                        −{Math.round((1 - FEE_HIGH) * 100)}–{Math.round((1 - FEE_LOW) * 100)}%
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-1 text-xs text-white/60">
                  {pop ? `${FEE_LOW * 100}–${FEE_HIGH * 100}% of the traditional fee` : 'High fee for partial coverage'}
                </div>
                <Bar pct={pop ? FEE_LOW * 100 : 100} range={pop ? (FEE_HIGH - FEE_LOW) * 100 : 0} tone={pop ? 'white' : 'brand'} />
              </Card>

              <Card icon={pop ? ShieldCheck : FileSearch} label="Evidence basis">
                <AnimatePresence mode="wait">
                  <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <div className="font-display text-base font-bold leading-snug">
                      {pop ? 'Every event confirmed by both parties' : 'Confirmation letters, emails, spreadsheets'}
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      {pop ? 'Pulled from the shared record in minutes.' : 'Chased item by item, every year.'}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </Card>
            </div>

            {/* fee input */}
            <div className="grid items-center gap-3 rounded-2xl bg-white p-4 text-navy">
              <Slider
                label="Your current (traditional) audit fee"
                value={fee}
                min={50000}
                max={1000000}
                step={10000}
                onChange={setFee}
                display={fmt$(fee)}
              />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-paper p-2.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-ink">Traditional</div>
                  <div className="font-display text-base font-bold text-ink line-through decoration-brand/60">
                    <AnimatedNumber value={fee} format={fmt$} />
                  </div>
                </div>
                <div className="rounded-xl bg-navy p-2.5 text-white">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-white/60">With KrossLedger</div>
                  <div className="font-display text-base font-bold">
                    <AnimatedNumber value={fee * FEE_LOW} format={fmtK} /> – <AnimatedNumber value={fee * FEE_HIGH} format={fmtK} />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center font-mono text-[10px] uppercase tracking-wider text-white/40">
              Illustrative · actual fees depend on your auditor and audit scope
            </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Card({ icon: Icon, label, highlight = false, children }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-2xl border p-4 transition-colors ${
        highlight ? 'border-brand/60 bg-brand/15' : 'border-white/10 bg-white/[0.04] hover:border-white/25'
      }`}
    >
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/60">
        <Icon className="h-4 w-4 text-[#ff6b75]" /> {label}
      </div>
      {children}
    </motion.div>
  );
}

function Bar({ pct, range = 0, tone = 'brand' }) {
  const spring = { type: 'spring', stiffness: 90, damping: 18 };
  return (
    <div className="mt-3 flex h-1 overflow-hidden rounded-full bg-white/10">
      <motion.div
        className={`h-full rounded-l-full ${range ? '' : 'rounded-r-full'} ${tone === 'brand' ? 'bg-brand' : 'bg-white'}`}
        animate={{ width: `${pct}%` }}
        transition={spring}
      />
      {/* uncertainty band for a range */}
      <motion.div className="h-full rounded-r-full bg-white/40" animate={{ width: `${range}%` }} transition={spring} />
    </div>
  );
}
