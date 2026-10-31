import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo, MagneticButton } from '../components/ui';

const LINKS = [
  { href: '#cost', label: 'The real cost' },
  { href: '#changes', label: 'What changes' },
  { href: '#audit', label: 'Audit' },
  { href: '#who', label: 'Who uses it' },
  { href: '#how', label: 'How it works' },
  { href: '#faq', label: 'FAQ' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* announcement bar */}
      <a
        href="#offer"
        className="group relative z-50 flex items-center justify-center gap-2 bg-navy px-4 py-2 text-center text-xs font-medium text-white/85 sm:text-sm"
      >
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
        90-day offer: one relationship. If the arguments don’t drop, walk away.
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </a>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'border-b border-line bg-white/80 backdrop-blur-xl' : 'border-b border-transparent bg-white/0'
        }`}
      >
        <motion.div style={{ scaleX: progress }} className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand" />
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group relative rounded-full px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:text-navy"
                >
                  {l.label}
                  <span className="absolute inset-x-3.5 bottom-1 h-px origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
          <div className="hidden lg:block">
            <MagneticButton href="#how" variant="dark" className="!px-5 !py-2.5 text-sm">
              See it on one relationship
            </MagneticButton>
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-line bg-white lg:hidden"
            >
              <motion.ul
                className="flex flex-col px-4 py-4"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
              >
                {LINKS.map((l) => (
                  <motion.li key={l.href} variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}>
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between border-b border-line py-3.5 font-display text-lg font-semibold"
                    >
                      {l.label}
                      <ArrowRight className="h-4 w-4 text-brand" />
                    </a>
                  </motion.li>
                ))}
                <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="pt-4">
                  <MagneticButton href="#offer" className="w-full" onClick={() => setOpen(false)}>
                    Start with one relationship
                  </MagneticButton>
                </motion.li>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
