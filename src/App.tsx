import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { EgyptLocationModal } from './components/EgyptLocationModal';
import { OfflineDownloadModal } from './components/OfflineDownloadModal';
import { Footer } from './components/Footer';
import { SciNexaNavDock } from './components/SciNexaNavDock';
import { FishAgentController } from './components/FishAgentController';
import { saveState, loadState } from './utils/persistence';
import { LABS_CATALOG } from './data/labsCatalogData';
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

const AnatomyViewer = lazy(() => import('./components/AnatomyViewer').then(m => ({ default: m.AnatomyViewer })));
const PhysicsLab    = lazy(() => import('./components/PhysicsLab').then(m => ({ default: m.PhysicsLab })));
const ChemistryLab  = lazy(() => import('./components/ChemistryLab').then(m => ({ default: m.ChemistryLab })));
const BiologyLab    = lazy(() => import('./components/BiologyLab').then(m => ({ default: m.BiologyLab })));
const GeologyLab    = lazy(() => import('./components/GeologyLab').then(m => ({ default: m.GeologyLab })));
const AstronomyLab  = lazy(() => import('./components/AstronomyLab').then(m => ({ default: m.AstronomyLab })));
const ClassroomMode = lazy(() => import('./components/ClassroomMode').then(m => ({ default: m.ClassroomMode })));

const ModuleFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <div className="w-8 h-8 border-2 border-[#1d4ed8]/20 border-t-[#1d4ed8] rounded-full animate-spin" />
    <span className="text-xs font-mono font-bold text-[#737373]">
      LOADING VIRTUAL LAB ENGINE...
    </span>
  </div>
);

const AppContent: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>(() => loadState<string>('app_tab', 'home'));
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen]   = useState<boolean>(false);
  const [showRestoredNotice, setShowRestoredNotice]   = useState<boolean>(() =>
    loadState<string>('app_tab', 'home') !== 'home'
  );

  useEffect(() => { saveState('app_tab', currentTab); }, [currentTab]);

  useEffect(() => {
    if (showRestoredNotice) {
      const timer = setTimeout(() => setShowRestoredNotice(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showRestoredNotice]);

  const activeLabMeta = LABS_CATALOG.find(l => l.id === currentTab);

  if (currentTab === 'classroom') {
    return (
      <Suspense fallback={<ModuleFallback />}>
        <ClassroomMode onExit={() => setCurrentTab('home')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col justify-between selection:bg-[#0a0a0a] selection:text-white">
      <div>
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        />

        {/* Session-restored toast */}
        {showRestoredNotice && (
          <div className="fixed top-20 right-4 sm:right-6 z-50 animate-bounce">
            <div
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid #e5e5e5',
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[#0a0a0a] text-xs shadow-xl font-bold"
            >
              <CheckCircle2 className="w-4 h-4 text-[#047857]" />
              <span>
                {language === 'ar'
                  ? 'تمت استعادة جلستك ومعاملك السابقة بنجاح ✓'
                  : 'Session & lab state restored automatically ✓'}
              </span>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="pt-2 pb-28">
          <Suspense fallback={<ModuleFallback />}>
            {currentTab === 'home' ? (
              <Home
                onNavigate={setCurrentTab}
                onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
              />
            ) : (
              <div className="sn-shell space-y-3 pt-2">

                {/* Lab Stage Header & Breadcrumbs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#e5e5e5] shadow-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentTab('home')}
                      className="sn-btn sn-btn-outline sn-btn-sm cursor-pointer font-bold"
                      aria-label={language === 'ar' ? 'العودة للمعامل' : 'Back to labs'}
                    >
                      {isRTL ? <ArrowRight size={14} strokeWidth={2} /> : <ArrowLeft size={14} strokeWidth={2} />}
                      <span>{language === 'ar' ? 'العودة للمعامل' : 'Back to Labs'}</span>
                    </button>

                    <div>
                      <div className="sn-eyebrow !text-[10px] text-[#737373]">
                        {activeLabMeta?.index} · {language === 'ar' ? activeLabMeta?.categoryAr : activeLabMeta?.categoryEn}
                      </div>
                      <h1 className="text-[16px] font-bold tracking-tight text-[#0a0a0a]">
                        {language === 'ar' ? activeLabMeta?.nameAr : activeLabMeta?.nameEn}
                      </h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="sn-badge sn-badge-green font-mono text-[11px] font-bold">
                      <Sparkles size={12} />
                      {language === 'ar' ? 'محاكاة 3D نشطة' : 'Real-Time 3D Engine'}
                    </span>
                  </div>
                </div>

                {/* 3D Lab Dark Stage Container */}
                <div className="sn-lab-stage shadow-2xl">
                  {currentTab === 'anatomy'   && <AnatomyViewer />}
                  {currentTab === 'physics'   && <PhysicsLab />}
                  {currentTab === 'chemistry' && <ChemistryLab />}
                  {currentTab === 'biology'   && <BiologyLab />}
                  {currentTab === 'geology'   && <GeologyLab />}
                  {currentTab === 'astronomy' && <AstronomyLab />}
                </div>
              </div>
            )}
          </Suspense>
        </main>
      </div>

      <Footer />

      {/* ── SciNexa Unified Navigation Dock — شريط الملاحة العلمي الموحد ── */}
      <SciNexaNavDock currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <EgyptLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <OfflineDownloadModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

      {/* Headless Darwin voice controller */}
      <FishAgentController currentTab={currentTab} setCurrentTab={setCurrentTab} language={language} />
    </div>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <LanguageProvider>
      <AuthGuard>
        <AppContent />
      </AuthGuard>
    </LanguageProvider>
  </AuthProvider>
);

export default App;
