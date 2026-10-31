import Nav from './sections/Nav';
import Hero from './sections/Hero';
import Marquee from './sections/Marquee';
import RealCost from './sections/RealCost';
import WhatChanges from './sections/WhatChanges';
import AuditCoverage from './sections/AuditCoverage';
import WhoUses from './sections/WhoUses';
import HowItWorks from './sections/HowItWorks';
import Offer from './sections/Offer';
import FAQ from './sections/FAQ';
import MechanismDemo from './sections/MechanismDemo';
import FinalCTA from './sections/FinalCTA';
import Footer from './sections/Footer';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <RealCost />
        <WhatChanges />
        <AuditCoverage />
        <WhoUses />
        <HowItWorks />
        <Offer />
        <FAQ />
        <MechanismDemo />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
