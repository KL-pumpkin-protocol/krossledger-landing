import { ArrowLeftRight } from 'lucide-react';
import { Reveal } from '../components/ui';

const PAIRS = [
  ['Landlord', 'Tenant'],
  ['Lender', 'Borrower'],
  ['Insurer', 'Insured'],
  ['Broker', 'Insurer'],
  ['Buyer', 'Seller'],
  ['Supplier', 'Customer'],
  ['Fund', 'Investor'],
  ['Lessor', 'Lessee'],
];
const EVENTS = ['Rent', 'Service charges', 'Settlements', 'Drawdowns', 'Interest', 'Repayments', 'Premiums', 'Claims', 'Trades', 'Invoices'];

export default function Marquee() {
  return (
    <section className="relative py-14">
      <Reveal>
        <p className="mb-8 px-4 text-center font-mono text-xs uppercase tracking-[0.18em] text-ink">
          Built for relationships that live longer than a single invoice
        </p>
      </Reveal>
      <div className="group/marquee marquee-mask space-y-3 overflow-hidden">
        <div className="flex w-max animate-marquee gap-3">
          {[...PAIRS, ...PAIRS].map(([a, b], i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-full border border-line bg-white px-5 py-2.5 font-display text-[15px] font-semibold text-navy transition-colors hover:border-brand/40 hover:bg-brand-50"
            >
              {a}
              <ArrowLeftRight className="h-4 w-4 text-brand" />
              {b}
            </div>
          ))}
        </div>
        <div className="flex w-max animate-marquee-rev gap-3">
          {[...EVENTS, ...EVENTS].map((e, i) => (
            <div key={i} className="rounded-full bg-paper px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:bg-navy hover:text-white">
              {e}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
