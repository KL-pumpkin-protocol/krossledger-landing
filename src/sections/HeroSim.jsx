import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, Clock, Mail } from 'lucide-react';
import { AnimatedNumber, Segmented, Slider } from '../components/ui';

/**
 * Living infographic of the core value proposition.
 * Company A books the same economic events as each of its counterparties (B and C).
 * Today: a share of those events diverge and pile up as open disputes in email threads.
 * With KrossLedger: every relationship gets its OWN bilateral shared state —
 * A⇄B has one record, A⇄C has another. There is no single central ledger.
 * The "booked events per month" slider is the simulated traffic.
 */

const A = { x: 92, y: 200 };
const PAIRS = {
  B: { node: { x: 512, y: 92 }, mid: { x: 312, y: 128 }, name: 'Company B', labels: ['Rent', 'Service charge', 'Settlement', 'Invoice'] },
  C: { node: { x: 512, y: 308 }, mid: { x: 312, y: 272 }, name: 'Company C', labels: ['Interest', 'Drawdown', 'Repayment', 'Premium'] },
};
const MISMATCH_P = 0.3;
const GUIDE_LANES = [-26, 0, 26];

const rand = (a, b) => a + Math.random() * (b - a);
const midpoint = (p, q) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });

export default function HeroSim() {
  const wrap = useRef(null);
  const inView = useInView(wrap, { margin: '-10% 0px' });
  const [mode, setMode] = useState('without');
  const [events, setEvents] = useState(80);
  const [packets, setPackets] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [openCount, setOpenCount] = useState(0);
  const [agreed, setAgreed] = useState({ B: 0, C: 0 });
  const [pulse, setPulse] = useState({ B: 0, C: 0 });
  const idRef = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // spawn packets proportional to simulated traffic
  useEffect(() => {
    if (!inView) return;
    const interval = Math.max(110, 14000 / events);
    const t = setInterval(() => {
      setPackets((ps) => {
        if (ps.length > 44) return ps;
        const id = ++idRef.current;
        const pair = Math.random() > 0.5 ? 'B' : 'C';
        const labels = PAIRS[pair].labels;
        return [
          ...ps,
          {
            id,
            pair,
            fromA: Math.random() > 0.5,
            lane: rand(-30, 30),
            label: id % 3 === 0 ? labels[id % labels.length] : null,
            mismatch: mode === 'without' && Math.random() < MISMATCH_P,
            mode,
          },
        ];
      });
    }, interval);
    return () => clearInterval(t);
  }, [events, mode, inView]);

  // switching to "with" resolves each open dispute into ITS OWN relationship's shared state
  useEffect(() => {
    if (mode !== 'with') return;
    const t = setTimeout(() => {
      setAgreed((g) => {
        const next = { ...g };
        disputes.forEach((d) => (next[d.pair] += 1));
        return next;
      });
      setDisputes([]);
      setOpenCount(0);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const finish = useCallback((p) => {
    setPackets((ps) => ps.filter((x) => x.id !== p.id));
    if (p.mode === 'with') {
      setAgreed((g) => ({ ...g, [p.pair]: g[p.pair] + 1 }));
      setPulse((g) => ({ ...g, [p.pair]: g[p.pair] + 1 }));
    } else if (p.mismatch && modeRef.current === 'without') {
      const m = PAIRS[p.pair].mid;
      setOpenCount((n) => n + 1);
      setDisputes((ds) => [...ds.slice(-15), { id: p.id, pair: p.pair, x: m.x + rand(-55, 55), y: m.y + p.lane }]);
    }
  }, []);

  const nodeR = 24 + events / 15;
  const hours = mode === 'without' ? events * 0.15 : events * 0.01;
  const agreement = mode === 'without' ? 100 - MISMATCH_P * 100 : 100;
  const isWith = mode === 'with';

  return (
    <div ref={wrap} className="relative">
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_40px_100px_-40px_rgba(5,32,63,0.45)]">
        {/* top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-xs font-medium text-ink">
            <Activity className="h-4 w-4 text-brand" />
            <span className="font-mono uppercase tracking-wider">Live relationship simulation</span>
          </div>
          <Segmented
            layoutId="hero-mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'without', label: 'Today', tone: 'brand' },
              { value: 'with', label: 'With KrossLedger' },
            ]}
          />
        </div>

        {/* canvas */}
        <div className="grid-bg relative bg-paper/60">
          <svg viewBox="0 0 600 400" className="block h-auto w-full" role="img" aria-label="Company A exchanging booked events with Company B and Company C">
            <defs>
              <radialGradient id="nodeGlow">
                <stop offset="0%" stopColor="#D30011" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#D30011" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* guide paths, one bundle per relationship */}
            {Object.entries(PAIRS).map(([key, pr]) =>
              GUIDE_LANES.map((lane) =>
                isWith ? (
                  <g key={`w${key}${lane}`}>
                    {[A, pr.node].map((end, k) => {
                      const c = midpoint(end, pr.mid);
                      return (
                        <motion.path
                          key={k}
                          d={`M${end.x},${end.y} Q${c.x},${c.y + lane} ${pr.mid.x},${pr.mid.y}`}
                          fill="none"
                          stroke="#05203F"
                          strokeOpacity="0.16"
                          strokeWidth="1.4"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.9 }}
                        />
                      );
                    })}
                  </g>
                ) : (
                  <path
                    key={`o${key}${lane}`}
                    d={`M${A.x},${A.y} Q${pr.mid.x},${pr.mid.y + lane * 2} ${pr.node.x},${pr.node.y}`}
                    fill="none"
                    stroke="#595959"
                    strokeOpacity="0.18"
                    strokeDasharray="4 6"
                  />
                )
              )
            )}

            {/* packets */}
            {packets.map((p) => (
              <Packet key={p.id} p={p} onDone={finish} />
            ))}

            {/* open disputes */}
            <AnimatePresence>
              {disputes.map((d) => {
                const m = PAIRS[d.pair].mid;
                return (
                  <motion.g
                    key={d.id}
                    initial={{ x: d.x, y: d.y, scale: 0, opacity: 0 }}
                    animate={isWith ? { x: m.x, y: m.y, scale: 0.4, opacity: 0 } : { x: d.x, y: [d.y, d.y - 4, d.y], scale: 1, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={
                      isWith
                        ? { duration: 0.9, ease: 'easeIn' }
                        : { y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }, default: { type: 'spring', stiffness: 300, damping: 15 } }
                    }
                  >
                    <circle r="10" fill="#fff" stroke="#D30011" strokeWidth="1.6" />
                    <text textAnchor="middle" dy="4.5" fontSize="12" fontWeight="700" fill="#D30011" fontFamily="JetBrains Mono">
                      ≠
                    </text>
                  </motion.g>
                );
              })}
            </AnimatePresence>

            {/* one shared state PER relationship (or an email thread, today) */}
            {Object.entries(PAIRS).map(([key, pr]) => (
              <g key={key} transform={`translate(${pr.mid.x} ${pr.mid.y})`}>
                <AnimatePresence mode="wait">
                  {isWith ? (
                    <motion.g
                      key="shared"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: key === 'C' ? 0.12 : 0 }}
                    >
                      <motion.rect
                        key={pulse[key]}
                        x="-52" y="-24" width="104" height="48" rx="12"
                        fill="none" stroke="#05203F" strokeWidth="2"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.35, opacity: 0 }}
                        transition={{ duration: 0.8 }}
                      />
                      <rect x="-52" y="-24" width="104" height="48" rx="12" fill="#05203F" />
                      <text y="-7" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Inter Tight">
                        A ⇄ {key} <tspan fill="#ff6b75">record</tspan>
                      </text>
                      <text y="6" textAnchor="middle" fontSize="7" fill="#fff" fillOpacity="0.6" fontFamily="JetBrains Mono" letterSpacing="0.8">
                        SHARED STATE
                      </text>
                      <text y="17" textAnchor="middle" fontSize="7.5" fill="#fff" fontFamily="JetBrains Mono">
                        ✓ {agreed[key]} agreed
                      </text>
                    </motion.g>
                  ) : (
                    <motion.g key="email" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <circle r="22" fill="#fff" stroke="#595959" strokeOpacity="0.35" strokeDasharray="3 4" />
                      <foreignObject x="-9" y="-13" width="18" height="18">
                        <Mail className="h-[18px] w-[18px] text-ink" />
                      </foreignObject>
                      <text y="13" textAnchor="middle" fontSize="6.5" fill="#595959" fontFamily="JetBrains Mono" letterSpacing="0.5">
                        RE: RE:
                      </text>
                    </motion.g>
                  )}
                </AnimatePresence>
              </g>
            ))}

            {/* company nodes, scaled by traffic */}
            {[
              { ...A, name: 'Your books', sub: 'Company A' },
              { ...PAIRS.B.node, name: 'Company B' },
              { ...PAIRS.C.node, name: 'Company C' },
            ].map((n) => (
              <g key={n.name} transform={`translate(${n.x} ${n.y})`}>
                <motion.circle r={nodeR * 1.8} fill="url(#nodeGlow)" animate={{ r: nodeR * 1.8 }} />
                <motion.circle
                  fill="#fff"
                  stroke="#05203F"
                  strokeWidth="2"
                  animate={{ r: [nodeR, nodeR * 1.06, nodeR] }}
                  transition={{ duration: Math.max(0.5, 3 - events / 80), repeat: Infinity, ease: 'easeInOut' }}
                />
                <text textAnchor="middle" dy={n.sub ? -2 : 4} fontSize="10.5" fontWeight="700" fill="#05203F" fontFamily="Inter Tight">
                  {n.name}
                </text>
                {n.sub && (
                  <text textAnchor="middle" dy="11" fontSize="8" fill="#595959" fontFamily="JetBrains Mono">
                    {n.sub}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* floating explainer chip */}
          <AnimatePresence>
            {isWith && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-navy shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-navy" />
                A separate shared state for each counterparty
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* controls + metrics */}
        <div className="grid gap-5 border-t border-line p-4 sm:p-5 md:grid-cols-[1.1fr_1fr]">
          <div>
            <Slider
              label="Simulated traffic · booked events per month"
              value={events}
              min={10}
              max={200}
              step={5}
              onChange={setEvents}
            />
            <p className="mt-2 text-xs text-ink/80">Drag it. Then flip the toggle above.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric icon={Clock} label="Matching hrs / mo" tone={isWith ? 'navy' : 'brand'}>
              <AnimatedNumber value={hours} format={(n) => n.toFixed(n < 10 ? 1 : 0)} />
            </Metric>
            <Metric icon={AlertTriangle} label="Open disputes" tone={openCount ? 'brand' : 'navy'}>
              <AnimatedNumber value={openCount} />
            </Metric>
            <Metric icon={CheckCircle2} label="Books agree" tone={isWith ? 'navy' : 'brand'}>
              <AnimatedNumber value={agreement} format={(n) => `${Math.round(n)}%`} />
            </Metric>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-ink/60">
        Illustrative model · A⇄B {agreed.B.toLocaleString('en-US')} · A⇄C {agreed.C.toLocaleString('en-US')} events agreed this session
      </p>
    </div>
  );
}

function Metric({ icon: Icon, label, tone, children }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-line bg-paper/70 p-2.5 sm:p-3">
      <Icon className={`mb-1.5 h-3.5 w-3.5 ${tone === 'brand' ? 'text-brand' : 'text-navy'}`} />
      <div className={`font-mono text-lg font-semibold leading-none sm:text-xl ${tone === 'brand' ? 'text-brand' : 'text-navy'}`}>{children}</div>
      <div className="mt-1 text-[10px] leading-tight text-ink sm:text-[11px]">{label}</div>
    </motion.div>
  );
}

function Packet({ p, onDone }) {
  const pr = PAIRS[p.pair];
  const from = p.fromA ? A : pr.node;
  const to = p.fromA ? pr.node : A;
  const m = pr.mid;
  let anim;
  let duration;
  if (p.mode === 'with') {
    // travel only to this relationship's own shared state
    const c = midpoint(from, m);
    anim = { x: [from.x, c.x, m.x], y: [from.y, c.y + p.lane * 0.6, m.y] };
    duration = 1.5;
  } else if (p.mismatch) {
    anim = { x: [from.x, m.x], y: [from.y, m.y + p.lane] };
    duration = 1.3;
  } else {
    anim = { x: [from.x, m.x, to.x], y: [from.y, m.y + p.lane, to.y] };
    duration = 2.6;
  }
  const color = p.mismatch ? '#D30011' : '#05203F';

  return (
    <motion.g
      initial={{ x: from.x, y: from.y, opacity: 0 }}
      animate={{ ...anim, opacity: 1 }}
      transition={{ duration, ease: 'easeInOut', opacity: { duration: 0.2 } }}
      onAnimationComplete={() => onDone(p)}
    >
      <circle r="5" fill={color} />
      <circle r="8.5" fill={color} fillOpacity="0.15" />
      {p.label && (
        <text y="-11" textAnchor="middle" fontSize="8" fill={color} fontFamily="JetBrains Mono" fontWeight="500">
          {p.label}
        </text>
      )}
    </motion.g>
  );
}
