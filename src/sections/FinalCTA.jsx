import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { MagneticButton, Reveal } from '../components/ui';

const ROWS = [
  ['Rent · Q3', '48,250.00', '48,520.00'],
  ['Interest · Sept', '12,480.00', '12,840.00'],
  ['Premium · inst. 2', '84,300.00', '84,300.00'],
  ['Invoice #1042', '32,900.00', '29,300.00'],
];

export default function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30%' });
  const [agreed, setAgreed] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setAgreed(true), 1600);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <section id="contact" ref={ref} className="relative scroll-mt-20 px-4 pb-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-line bg-paper">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="relative grid items-center gap-10 p-6 sm:p-12 lg:grid-cols-2 lg:p-16">
          <div>
            <Reveal>
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-ink">
                <span className="text-brand">08</span> · Final word
              </div>
              <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-navy sm:text-5xl">
                The books already exist on both sides.
              </h2>
              <p className="mt-5 text-lg text-ink">
                They just don’t agree as often as they should, and <span className="font-semibold text-brand">that disagreement costs money.</span>
              </p>
            </Reveal>
            <Reveal delay={0.15} className="mt-8">
              <MagneticButton href="mailto:hello@krossledger.com?subject=One%20relationship">Make one relationship stop arguing</MagneticButton>
            </Reveal>
          </div>

          {/* two ledgers snapping into agreement */}
          <Reveal delay={0.1}>
            <div
              onMouseEnter={() => setAgreed(true)}
              onClick={() => setAgreed((a) => !a)}
              className="cursor-pointer rounded-3xl border border-line bg-white p-4 shadow-[0_30px_80px_-40px_rgba(5,32,63,0.5)] sm:p-6"
            >
              <div className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-2 border-b border-line pb-3 font-mono text-[10px] uppercase tracking-wider text-ink sm:gap-4">
                <span>Event</span>
                <span className="text-right">Your books</span>
                <span className="text-right">Their books</span>
                <span className="w-6" />
              </div>
              {ROWS.map(([label, ours, theirs], i) => {
                const mismatch = ours !== theirs && !agreed;
                return (
                  <div key={label} className="grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-2 border-b border-line py-3 last:border-0 sm:gap-4">
                    <span className="text-sm font-medium text-navy">{label}</span>
                    <span className="text-right font-mono text-sm text-navy">{ours}</span>
                    <span className="relative h-5 overflow-hidden text-right font-mono text-sm">
                      <motion.span
                        className="absolute right-0 block"
                        animate={{ y: mismatch ? 0 : -22, color: '#D30011' }}
                        transition={{ delay: i * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
                      >
                        {theirs}
                      </motion.span>
                      <motion.span
                        className="absolute right-0 block text-navy"
                        initial={{ y: 22 }}
                        animate={{ y: mismatch ? 22 : 0 }}
                        transition={{ delay: i * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
                      >
                        {ours}
                      </motion.span>
                    </span>
                    <motion.span
                      animate={{ backgroundColor: mismatch ? '#fdecee' : '#05203F', rotate: mismatch ? 0 : 360 }}
                      transition={{ delay: i * 0.12 }}
                      className="grid h-6 w-6 place-items-center rounded-full"
                    >
                      {mismatch ? <X className="h-3.5 w-3.5 text-brand" /> : <Check className="h-3.5 w-3.5 text-white" />}
                    </motion.span>
                  </div>
                );
              })}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-ink">{agreed ? 'One shared record' : 'Two sets of books'}</span>
                <motion.span
                  animate={{ color: agreed ? '#05203F' : '#D30011' }}
                  className="font-semibold"
                >
                  {agreed ? '4 of 4 agree' : '1 of 4 agree'}
                </motion.span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
