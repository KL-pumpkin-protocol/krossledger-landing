import { useEffect, useRef, useState } from 'react';
import {
  motion,
  animate,
  useInView,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const EASE = [0.22, 1, 0.36, 1];

/* ---------- Scroll reveal primitives ---------- */

export function Reveal({ children, delay = 0, y = 28, x = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export const staggerParent = (gap = 0.09, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function Stagger({ children, className = '', gap = 0.09, delay = 0 }) {
  return (
    <motion.div
      className={className}
      variants={staggerParent(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Section header (numbered, like the blueprint) ---------- */

export function SectionHeader({ index, eyebrow, title, children, center = false, dark = false }) {
  return (
    <div className={`max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
      <Reveal>
        <div
          className={`mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] ${
            center ? 'justify-center' : ''
          } ${dark ? 'text-white/60' : 'text-ink'}`}
        >
          <span className="text-brand">{index}</span>
          <span className={`h-px w-10 ${dark ? 'bg-white/30' : 'bg-navy/20'}`} />
          <span>{eyebrow}</span>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2
          className={`font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl ${
            dark ? 'text-white' : 'text-navy'
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {children && (
        <Reveal delay={0.12}>
          <p className={`mt-5 text-lg leading-relaxed ${dark ? 'text-white/70' : 'text-ink'}`}>{children}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------- Magnetic CTA button ---------- */

export function MagneticButton({ children, href = '#offer', variant = 'primary', className = '', icon = true, onClick }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const styles = {
    primary:
      'bg-brand text-white shadow-[0_10px_30px_-10px_rgba(211,0,17,0.7)] hover:shadow-[0_16px_40px_-10px_rgba(211,0,17,0.85)]',
    dark: 'bg-navy text-white shadow-[0_10px_30px_-12px_rgba(5,32,63,0.7)]',
    light: 'bg-white text-navy shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)]',
    ghost: 'bg-white/70 text-navy ring-1 ring-navy/15 backdrop-blur hover:ring-navy/40',
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={`group relative inline-flex select-none items-center justify-center overflow-hidden rounded-full px-6 py-3.5 text-[15px] font-semibold transition-shadow duration-300 ${styles[variant]} ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
      </span>
    </motion.a>
  );
}

/* ---------- Spotlight card: hover lift + border glow following the cursor ---------- */

export function SpotlightCard({ children, className = '', glow = 'rgba(211,0,17,0.14)', dark = false, as = 'div', ...rest }) {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const bg = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, ${glow}, transparent 70%)`;
  const M = motion[as];

  return (
    <M
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onMouseLeave={() => {
        mx.set(-200);
        my.set(-200);
      }}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`group relative overflow-hidden rounded-3xl border transition-[border-color,box-shadow] duration-300 ${
        dark
          ? 'border-white/10 bg-white/[0.04] hover:border-white/25'
          : 'border-line bg-white hover:border-navy/25 hover:shadow-[0_24px_60px_-28px_rgba(5,32,63,0.35)]'
      } ${className}`}
      {...rest}
    >
      <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: bg }} />
      <div className="relative h-full">{children}</div>
    </M>
  );
}

/* ---------- Numbers ---------- */

export function Counter({ to, duration = 1.8, prefix = '', suffix = '', decimals = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [inView, to, duration]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/** Smoothly tweens to whatever `value` currently is (for live calculators). */
export function AnimatedNumber({ value, format = (n) => Math.round(n).toLocaleString('en-US'), className = '' }) {
  const mv = useSpring(value, { stiffness: 110, damping: 22 });
  const fmt = useRef(format);
  fmt.current = format;
  const [display, setDisplay] = useState(() => format(value));
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  useEffect(() => mv.on('change', (v) => setDisplay(fmt.current(v))), [mv]);
  return <span className={className}>{display}</span>;
}

/* ---------- Small bits ---------- */

export function Pill({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink ${className}`}>
      {children}
    </span>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, display }) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink">{label}</span>
        <span className="font-mono font-semibold text-navy">{display ?? value}</span>
      </div>
      <input
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--fill': `${fill}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function Segmented({ options, value, onChange, layoutId, dark = false }) {
  return (
    <div className={`relative inline-flex rounded-full p-1 ${dark ? 'bg-white/10' : 'bg-navy-50'}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              active ? (dark ? 'text-navy' : 'text-white') : dark ? 'text-white/70 hover:text-white' : 'text-ink hover:text-navy'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className={`absolute inset-0 -z-10 rounded-full ${dark ? 'bg-white' : o.tone === 'brand' ? 'bg-brand' : 'bg-navy'}`}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Logo({ dark = false }) {
  return (
    <a href="#top" className="group flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[8deg]">
        <rect width="32" height="32" rx="8" fill={dark ? '#ffffff' : '#05203F'} />
        <rect x="6.5" y="9" width="11" height="14" rx="2" fill="none" stroke={dark ? '#05203F' : '#fff'} strokeWidth="2.4" className="transition-transform duration-500 group-hover:translate-x-[1.5px]" />
        <rect x="14.5" y="9" width="11" height="14" rx="2" fill="none" stroke="#D30011" strokeWidth="2.4" className="transition-transform duration-500 group-hover:-translate-x-[1.5px]" />
      </svg>
      <span className={`font-display text-lg font-bold tracking-tight ${dark ? 'text-white' : 'text-navy'}`}>
        Kross<span className="text-brand">Ledger</span>
      </span>
    </a>
  );
}
