import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SectionHeader, Stagger, staggerItem } from '../components/ui';

const FAQS = [
  {
    q: 'Do both sides have to use it?',
    short: 'Yes',
    a: 'Yes. The value is mutual. One side alone is just another report. We help you get the other party on.',
  },
  {
    q: 'Does this replace my ERP or my invoicing?',
    short: 'No',
    a: 'No. It sits on top of what you already do and makes the shared record checkable.',
  },
  {
    q: 'What if the other party refuses?',
    short: 'Nothing changes',
    a: 'Then that relationship stays the way it is. We focus on the ones where both sides feel the pain.',
  },
  {
    q: 'How much does it cost?',
    short: 'Priced on value',
    a: 'We price against the time and disputes you remove, not per click. We’ll show you the number after we look at one real relationship.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeader index="07" eyebrow="FAQ" title="The questions controllers ask first." />
        </div>
        <Stagger className="divide-y divide-line border-y border-line">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div key={f.q} variants={staggerItem}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="group flex w-full items-center gap-4 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-mono text-xs text-brand">0{i + 1}</span>
                  <span className="flex-1 font-display text-lg font-bold text-navy transition-colors group-hover:text-brand sm:text-xl">{f.q}</span>
                  <span
                    className={`hidden rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors sm:inline ${
                      isOpen ? 'bg-navy text-white' : 'bg-paper text-ink'
                    }`}
                  >
                    {f.short}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${
                      isOpen ? 'border-brand bg-brand text-white' : 'border-line text-navy group-hover:border-navy'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pl-8 pr-12 text-lg leading-relaxed text-ink">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
