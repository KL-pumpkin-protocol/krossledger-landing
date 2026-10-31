import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, DoorOpen, Flag, Link2, MessagesSquare, Target, TrendingDown, Users } from 'lucide-react';
import { MagneticButton, Reveal, SectionHeader } from '../components/ui';

const MILESTONES = [
  { day: 0, icon: Target, title: 'Pick one relationship', body: 'The one that currently costs you the most time or money to reconcile.' },
  { day: 7, icon: Link2, title: 'Connect it', body: 'One counterparty, one set of transactions. We help get the other party on.' },
  { day: 30, icon: Check, title: 'First month on one record', body: 'Both sides confirm each event as it happens.' },
  { day: 60, icon: MessagesSquare, title: 'Questions answered with the record', body: 'Disputes get pulled from the shared record, not a new email thread.' },
  { day: 90, icon: Flag, title: 'You decide', body: 'Did the arguments and the matching work drop? You judge it.' },
];

export default function Offer() {
  const [active, setActive] = useState(0);
  const done = active === MILESTONES.length - 1;

  return (
    <section id="offer" className="relative scroll-mt-20 overflow-hidden bg-navy py-20 text-white sm:py-28">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.12] invert" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-brand/30 blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader dark index="06" eyebrow="Simple offer" title="Pick one relationship that currently costs you time or money to reconcile.">
          We run it for 90 days. Hover or tap the milestones.
        </SectionHeader>

        {/* timeline */}
        <Reveal className="mt-14">
          <div className="relative">
            {/* track (desktop horizontal) */}
            <div
              className="absolute left-6 top-6 hidden h-1 -translate-y-1/2 rounded-full bg-white/10 md:block"
              style={{ width: 'calc(4 * ((100% - 4rem) / 5 + 1rem))' }}
            >
              <motion.div className="h-full rounded-full bg-brand" animate={{ width: `${(active / (MILESTONES.length - 1)) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
            </div>
            {/* track (mobile vertical) */}
            <div className="absolute bottom-6 left-6 top-6 w-1 -translate-x-1/2 rounded-full bg-white/10 md:hidden">
              <motion.div className="w-full rounded-full bg-brand" animate={{ height: `${(active / (MILESTONES.length - 1)) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
            </div>

            <ol className="relative grid gap-6 md:grid-cols-5 md:gap-4">
              {MILESTONES.map((m, i) => {
                const reached = i <= active;
                return (
                  <li
                    key={m.day}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className="group flex cursor-pointer gap-4 md:flex-col md:gap-0"
                  >
                    <motion.div
                      animate={{ scale: i === active ? 1.15 : 1, backgroundColor: reached ? '#D30011' : '#0a2b52' }}
                      whileHover={{ scale: 1.2 }}
                      className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-white/20 md:mx-0"
                    >
                      <m.icon className="h-5 w-5" />
                      {i === active && (
                        <motion.span layoutId="ms-ring" className="absolute -inset-1.5 rounded-full border-2 border-brand" />
                      )}
                    </motion.div>
                    <div className="md:mt-5">
                      <div className={`font-mono text-xs uppercase tracking-wider ${reached ? 'text-[#ff6b75]' : 'text-white/40'}`}>Day {m.day}</div>
                      <div className={`mt-1 font-display text-lg font-bold transition-colors ${reached ? 'text-white' : 'text-white/50'}`}>{m.title}</div>
                      <AnimatePresence initial={false}>
                        {i === active && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden text-sm text-white/70"
                          >
                            <span className="block pt-1">{m.body}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </Reveal>

        {/* the fork at day 90 */}
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {[
            { icon: DoorOpen, title: 'If they don’t drop', body: 'The arguments and the matching work stay the same? You walk away.', tone: 'muted' },
            { icon: TrendingDown, title: 'If they do', body: 'We talk about the rest of your counterparties.', tone: 'brand' },
          ].map((o, i) => (
            <motion.div
              key={o.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              animate={{ opacity: done ? 1 : 0.55, scale: done && o.tone === 'brand' ? 1.02 : 1 }}
              whileHover={{ y: -5, opacity: 1 }}
              className={`rounded-3xl border p-6 transition-colors ${
                o.tone === 'brand' ? 'border-brand/60 bg-brand/15 hover:bg-brand/25' : 'border-white/15 bg-white/5 hover:bg-white/10'
              }`}
            >
              <o.icon className={`h-6 w-6 ${o.tone === 'brand' ? 'text-[#ff6b75]' : 'text-white/70'}`} />
              <div className="mt-3 font-display text-xl font-bold">{o.title}</div>
              <p className="mt-1 text-white/70">{o.body}</p>
            </motion.div>
          ))}
        </div>

        <Reveal className="mt-12 flex flex-col items-center gap-3 text-center">
          <MagneticButton href="#contact">Start with one relationship</MagneticButton>
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            <Users className="h-4 w-4" /> 90 days · one counterparty · no ERP changes
          </span>
        </Reveal>
      </div>
    </section>
  );
}
