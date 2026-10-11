import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { AnatomyViewer } from './components/AnatomyViewer';
import { PhysicsLab } from './components/PhysicsLab';
import { ChemistryLab } from './components/ChemistryLab';
import { BiologyLab } from './components/BiologyLab';
import { GeologyLab } from './components/GeologyLab';
import { ClassroomMode } from './components/ClassroomMode';
import { EgyptLocationModal } from './components/EgyptLocationModal';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // If in dedicated classroom presentation mode, render fullscreen interface
  if (currentTab === 'classroom') {
    return <ClassroomMode onExit={() => setCurrentTab('home')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <div>
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
        />

        <main className="pt-6">
          {currentTab === 'home' && <Home onNavigate={setCurrentTab} />}
          {currentTab === 'anatomy' && <AnatomyViewer />}
          {currentTab === 'physics' && <PhysicsLab />}
          {currentTab === 'chemistry' && <ChemistryLab />}
          {currentTab === 'biology' && <BiologyLab />}
          {currentTab === 'geology' && <GeologyLab />}
        </main>
      </div>

      <Footer />

      <EgyptLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
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
