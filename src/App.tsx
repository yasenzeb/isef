import React, { useState, lazy, Suspense } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { EgyptLocationModal } from './components/EgyptLocationModal';
import { OfflineDownloadModal } from './components/OfflineDownloadModal';
import { Footer } from './components/Footer';

const AnatomyViewer = lazy(() => import('./components/AnatomyViewer').then(m => ({ default: m.AnatomyViewer })));
const PhysicsLab = lazy(() => import('./components/PhysicsLab').then(m => ({ default: m.PhysicsLab })));
const ChemistryLab = lazy(() => import('./components/ChemistryLab').then(m => ({ default: m.ChemistryLab })));
const BiologyLab = lazy(() => import('./components/BiologyLab').then(m => ({ default: m.BiologyLab })));
const GeologyLab = lazy(() => import('./components/GeologyLab').then(m => ({ default: m.GeologyLab })));
const AstronomyLab = lazy(() => import('./components/AstronomyLab').then(m => ({ default: m.AstronomyLab })));
const ClassroomMode = lazy(() => import('./components/ClassroomMode').then(m => ({ default: m.ClassroomMode })));

const ModuleFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
    <span className="font-mono text-xs text-slate-400">LOADING VIRTUAL LAB ENGINE...</span>
  </div>
);

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);

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

        <main className="pt-6">
          <Suspense fallback={<ModuleFallback />}>
            {currentTab === 'home' && <Home onNavigate={setCurrentTab} onOpenOfflineModal={() => setIsOfflineModalOpen(true)} />}
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

      <EgyptLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <OfflineDownloadModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
