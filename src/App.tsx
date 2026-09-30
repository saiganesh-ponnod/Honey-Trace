import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/public/LandingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { VerifyResultPage } from './pages/public/VerifyResultPage';
import { LoginPage } from './pages/public/LoginPage';
import { RequestAccessPage } from './pages/public/RequestAccessPage';
import { ProducerDashboard } from './pages/producer/ProducerDashboard';
import { ProcessorDashboard } from './pages/processor/ProcessorDashboard';
import { DistributorDashboard } from './pages/distributor/DistributorDashboard';
import { RetailerDashboard } from './pages/retailer/RetailerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { QrScannerModal } from './components/qr/QrScannerModal';
import { DemoGuideModal } from './components/common/DemoGuideModal';

const AppContent: React.FC = () => {
  const { currentUser } = useStore();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [verifyBatchCode, setVerifyBatchCode] = useState<string>('HT-2026-DEMO01');
  const [showScanner, setShowScanner] = useState(false);
  const [showDemoGuide, setShowDemoGuide] = useState(false);

  // Hash-based URL navigation support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('verify/')) {
        const code = hash.replace('verify/', '');
        setVerifyBatchCode(code);
        setCurrentPage('verify');
      } else if (hash) {
        setCurrentPage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerifyCode = (code: string) => {
    setVerifyBatchCode(code.trim().toUpperCase());
    setCurrentPage('verify');
    window.location.hash = `verify/${code.trim().toUpperCase()}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-800">
      {/* Universal Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenScanner={() => setShowScanner(true)}
        onOpenDemoGuide={() => setShowDemoGuide(true)}
        onVerifyCode={handleVerifyCode}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            onVerifyCode={handleVerifyCode}
            onOpenScanner={() => setShowScanner(true)}
            onOpenDemoGuide={() => setShowDemoGuide(true)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'how-it-works' && (
          <HowItWorksPage
            onVerifyCode={handleVerifyCode}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'verify' && (
          <VerifyResultPage
            batchCode={verifyBatchCode}
            onNavigate={handleNavigate}
            onVerifyOtherCode={handleVerifyCode}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'request-access' && (
          <RequestAccessPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'producer' && (
          <ProducerDashboard onVerifyCode={handleVerifyCode} />
        )}

        {currentPage === 'producer-new-batch' && (
          <ProducerDashboard onVerifyCode={handleVerifyCode} />
        )}

        {currentPage === 'processor' && (
          <ProcessorDashboard onVerifyCode={handleVerifyCode} />
        )}

        {currentPage === 'distributor' && (
          <DistributorDashboard onVerifyCode={handleVerifyCode} />
        )}

        {currentPage === 'retailer' && (
          <RetailerDashboard onVerifyCode={handleVerifyCode} />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard onVerifyCode={handleVerifyCode} />
        )}
      </main>

      {/* Universal Accessible Footer */}
      <Footer onVerifyCode={handleVerifyCode} />

      {/* Global QR Scanner Modal */}
      {showScanner && (
        <QrScannerModal
          onClose={() => setShowScanner(false)}
          onScanCode={handleVerifyCode}
        />
      )}

      {/* Global 13-Step Live Demo Guide Modal */}
      {showDemoGuide && (
        <DemoGuideModal
          onClose={() => setShowDemoGuide(false)}
          onNavigate={handleNavigate}
          onVerifyCode={handleVerifyCode}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
