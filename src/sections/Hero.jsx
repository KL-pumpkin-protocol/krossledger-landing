import { motion } from 'framer-motion';
import {
  Banknote,
  CheckCircle2,
  FileText,
  Home,
  Landmark,
  LineChart,
  Percent,
  Receipt,
  ShieldCheck,
  Umbrella,
} from 'lucide-react';
import { Counter, EASE, MagneticButton } from '../components/ui';
import HeroSim from './HeroSim';

const WORDS = 'Stop arguing with your counterparties about'.split(' ');

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand/10 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-60 h-[420px] w-[420px] rounded-full bg-navy/10 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pt-16 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-8 lg:pb-24 lg:pt-20">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            One shared, checkable record for both sides
          </motion.div>

          <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-navy sm:text-6xl lg:text-[4.1rem]">
            {WORDS.map((w, i) => (
              <motion.span
                key={i}
                className="mr-[0.22em] inline-block"
                initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, delay: 0.08 + i * 0.06, ease: EASE }}
              >
                {w}
              </motion.span>
            ))}
            <motion.span
              className="relative inline-block text-brand"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            >
              the numbers.
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden>
                <motion.path
                  d="M2 8 C 60 2, 120 11, 180 5 S 270 3, 298 7"
                  fill="none"
                  stroke="#D30011"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
                />
              </svg>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-ink"
          >
            KrossLedger gives both sides of any B2B relationship one shared, checkable record of{' '}
            <strong className="font-semibold text-navy">what was agreed</strong> and{' '}
            <strong className="font-semibold text-navy">what was booked</strong>.
          </motion.p>

          {/* the money types as tactile chips instead of a comma list */}
          <motion.ul
            className="mt-5 flex max-w-xl flex-wrap gap-2"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.85 } } }}
          >
            {[
              [Home, 'Rents'],
              [Landmark, 'Loans'],
              [Umbrella, 'Insurance premiums'],
              [Percent, 'Interest'],
              [LineChart, 'Securities'],
              [Receipt, 'Invoices'],
            ].map(([Icon, label]) => (
              <motion.li
                key={label}
                variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
                whileHover={{ y: -3, scale: 1.04 }}
                className="flex cursor-default items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-navy shadow-sm transition-colors hover:border-brand/40"
              >
                <Icon className="h-3.5 w-3.5 text-brand" />
                {label}
              </motion.li>
            ))}
          </motion.ul>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-4 max-w-xl text-[15px] text-ink"
          >
            If two companies have to agree on the money, this ends the back-and-forth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0, ease: EASE }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <MagneticButton href="#how">See it on one relationship</MagneticButton>
            <MagneticButton href="#cost" variant="ghost">
              What the gap costs you
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: EASE }}
          className="relative"
        >
          <HeroSim />
          {/* floating overlay card */}
          <motion.div
            className="absolute -bottom-6 -right-6 hidden items-center gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-xl backdrop-blur xl:flex"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-navy">Audit-ready evidence</div>
              <div className="text-[11px] text-ink">Stronger than “trust us”</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* stat row (blueprint: 5 Core · 12 Apps · 6 Agents) */}
      <div className="relative border-y border-line bg-white/70 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-line px-4 sm:px-6 md:grid-cols-4 md:divide-x lg:px-8">
          {[
            { to: 1, label: 'shared record per relationship', icon: FileText },
            { to: 2, label: 'sides confirming every event', icon: CheckCircle2 },
            { to: 0, label: 'ERPs replaced', icon: Banknote },
            { to: 90, label: 'days to prove it — or walk away', icon: ShieldCheck },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: EASE }}
              className="group flex items-center gap-4 py-6 md:px-6 md:first:pl-0"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-navy-50 text-navy transition-all duration-300 group-hover:rotate-6 group-hover:bg-navy group-hover:text-white">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <Counter to={s.to} className="font-display text-3xl font-bold text-navy" />
                <div className="text-xs leading-snug text-ink sm:text-sm">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
