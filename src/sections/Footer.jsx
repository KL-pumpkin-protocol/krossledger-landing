import { Logo } from '../components/ui';

const COLS = [
  { title: 'Product', links: [['How it works', '#how'], ['What changes', '#changes'], ['The 90-day offer', '#offer'], ['FAQ', '#faq']] },
  { title: 'Relationships', links: [['Landlords & tenants', '#who'], ['Lenders & borrowers', '#who'], ['Insurers & brokers', '#who'], ['Securities', '#who']] },
  { title: 'Company', links: [['Contact', '#contact'], ['Mechanism demo', '#demo']] },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink">One shared, checkable record of what was agreed and what was booked — for both sides.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <div className="font-mono text-xs uppercase tracking-wider text-ink">{c.title}</div>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([l, h]) => (
                <li key={l}>
                  <a href={h} className="group inline-flex items-center gap-1 text-sm font-medium text-navy transition-colors hover:text-brand">
                    {l}
                    <span className="inline-block -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-6 text-xs text-ink sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} KrossLedger. All rights reserved.</span>
          <span>Your ERP stays. The arguments don’t.</span>
        </div>
      </div>
    </footer>
  );
}
