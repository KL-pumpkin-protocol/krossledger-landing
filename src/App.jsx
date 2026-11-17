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
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LedgerProvider } from './auth/LedgerContext';
import { useHashRoute } from './lib/route';
import AuthScreen from './screens/AuthScreen';
import ConfirmVerification from './screens/ConfirmVerification';
import ResetPassword from './screens/ResetPassword';
import CreateLedger from './screens/CreateLedger';
import AdminDashboard from './screens/AdminDashboard';

function AppRoutes() {
  const route = useHashRoute();
  const { superuser } = useAuth();
  const account = route.name !== 'home';

  return (
    <>
      <Nav />
      {route.name === 'login' && <AuthScreen mode="login" />}
      {route.name === 'signup' && <AuthScreen mode="signup" />}
      {route.name === 'confirm-verification' && <ConfirmVerification token={route.token} />}
      {route.name === 'reset-password' && <ResetPassword token={route.token} />}
      {route.name === 'app' && (superuser ? <AdminDashboard /> : <CreateLedger />)}
      {route.name === 'home' && (
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
      )}
      {account ? (
        <footer className="border-t border-line px-4 py-6 text-center text-xs text-ink">
          <a href="#top" className="font-medium text-navy hover:text-brand">
            Back to KrossLedger
          </a>
        </footer>
      ) : (
        <Footer />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LedgerProvider>
        <AppRoutes />
      </LedgerProvider>
    </AuthProvider>
  );
}
