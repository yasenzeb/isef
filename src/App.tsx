import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { EgyptLocationModal } from './components/EgyptLocationModal';
import { OfflineDownloadModal } from './components/OfflineDownloadModal';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FishAgentController } from './components/FishAgentController';
import { saveState, loadState } from './utils/persistence';
import { CheckCircle2 } from 'lucide-react';

const AnatomyViewer = lazy(() => import('./components/AnatomyViewer').then(m => ({ default: m.AnatomyViewer })));
const PhysicsLab = lazy(() => import('./components/PhysicsLab').then(m => ({ default: m.PhysicsLab })));
const ChemistryLab = lazy(() => import('./components/ChemistryLab').then(m => ({ default: m.ChemistryLab })));
const BiologyLab = lazy(() => import('./components/BiologyLab').then(m => ({ default: m.BiologyLab })));
const GeologyLab = lazy(() => import('./components/GeologyLab').then(m => ({ default: m.GeologyLab })));
const AstronomyLab = lazy(() => import('./components/AstronomyLab').then(m => ({ default: m.AstronomyLab })));
const ClassroomMode = lazy(() => import('./components/ClassroomMode').then(m => ({ default: m.ClassroomMode })));

const ModuleFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
    <span className="font-mono text-xs text-slate-400">LOADING VIRTUAL LAB ENGINE...</span>
  </div>
);

const AppContent: React.FC = () => {
  const { language } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>(() => loadState<string>('app_tab', 'home'));
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(() => {
    return loadState<string>('app_tab', 'home') !== 'home';
  });

  // Auto-save active tab
  useEffect(() => {
    saveState('app_tab', currentTab);
  }, [currentTab]);

  // Hide restore toast after 3 seconds
  useEffect(() => {
    if (showRestoredNotice) {
      const timer = setTimeout(() => setShowRestoredNotice(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showRestoredNotice]);

  if (currentTab === 'classroom') {
    return (
      <Suspense fallback={<ModuleFallback />}>
        <ClassroomMode onExit={() => setCurrentTab('home')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col justify-between selection:bg-white selection:text-black">
      <div>
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        />

        {/* Auto-Restored Session Toast */}
        {showRestoredNotice && (
          <div className="fixed top-20 right-4 sm:right-6 z-50 animate-bounce">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-950/90 border border-indigo-400/40 text-indigo-200 text-xs shadow-xl backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {language === 'ar' ? 'تمت استعادة جلستك ومعاملك السابقة بنجاح ✓' : 'Session & lab state restored automatically ✓'}
              </span>
            </div>
          </div>
        )}

        <main className="pt-6 pb-20 md:pb-6">
          <Suspense fallback={<ModuleFallback />}>
            {currentTab === 'home' && (
              <Home
                onNavigate={setCurrentTab}
                onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
              />
            )}
            {currentTab === 'anatomy' && <AnatomyViewer />}
            {currentTab === 'physics' && <PhysicsLab />}
            {currentTab === 'chemistry' && <ChemistryLab />}
            {currentTab === 'biology' && <BiologyLab />}
            {currentTab === 'geology' && <GeologyLab />}
            {currentTab === 'astronomy' && <AstronomyLab />}
          </Suspense>
        </main>
      </div>

      <Footer />

      {/* Dedicated Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
      />

      <EgyptLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <OfflineDownloadModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

      {/* Headless Fish Audio Controller - empowers the official Fish Agent widget with full platform control */}
      <FishAgentController currentTab={currentTab} setCurrentTab={setCurrentTab} language={language} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AuthGuard>
          <AppContent />
        </AuthGuard>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
