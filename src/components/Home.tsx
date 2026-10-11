import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Activity, 
  Atom, 
  Dna, 
  Globe2, 
  Presentation, 
  Search, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  BookOpen 
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const disciplines = [
    {
      id: 'anatomy',
      title: t.features.anatomyTitle,
      desc: t.features.anatomyDesc,
      icon: Activity,
      badge: '10M+ Triangles',
      color: 'from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-400',
      btnColor: 'bg-rose-600 hover:bg-rose-500',
    },
    {
      id: 'physics',
      title: t.features.physicsTitle,
      desc: t.features.physicsDesc,
      icon: Atom,
      badge: 'Calculated Mechanics & Optics',
      color: 'from-sky-500/20 to-indigo-500/20 border-sky-500/30 text-sky-400',
      btnColor: 'bg-sky-600 hover:bg-sky-500',
    },
    {
      id: 'chemistry',
      title: t.features.chemistryTitle,
      desc: t.features.chemistryDesc,
      icon: Atom,
      badge: '118 Elements (IUPAC)',
      color: 'from-amber-500/20 to-emerald-500/20 border-amber-500/30 text-amber-400',
      btnColor: 'bg-amber-600 hover:bg-amber-500',
    },
    {
      id: 'biology',
      title: t.features.biologyTitle,
      desc: t.features.biologyDesc,
      icon: Dna,
      badge: '3D Organelles & Genetics',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500',
    },
    {
      id: 'geology',
      title: t.features.geologyTitle,
      desc: t.features.geologyDesc,
      icon: Globe2,
      badge: '3D Earth Cross-Section',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
      btnColor: 'bg-cyan-600 hover:bg-cyan-500',
    },
    {
      id: 'classroom',
      title: t.features.classroomTitle,
      desc: t.features.classroomDesc,
      icon: Presentation,
      badge: 'Smartboard Ready',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
      btnColor: 'bg-purple-600 hover:bg-purple-500',
    },
  ];

  const filteredDisciplines = disciplines.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {t.hero.title}{' '}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent block sm:inline">
              {t.hero.titleAccent}
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('anatomy')}
              className="px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 transition-all flex items-center space-x-2"
            >
              <span>{t.hero.exploreModules}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('classroom')}
              className="px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 shadow-lg transition-all flex items-center space-x-2"
            >
              <Presentation className="w-4 h-4 text-amber-400" />
              <span>{t.hero.openClassroom}</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{t.hero.statsMeshes}</div>
              <div className="text-xs text-slate-400 mt-1">{t.hero.statsMeshesLabel}</div>
            </div>
            <div className="text-center border-x border-slate-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{t.hero.statsSimulations}</div>
              <div className="text-xs text-slate-400 mt-1">{t.hero.statsSimulationsLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{t.hero.statsLanguages}</div>
              <div className="text-xs text-slate-400 mt-1">{t.hero.statsLanguagesLabel}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery & Search Bar */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            className={`w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner ${
              isRTL ? "pr-12 text-right" : "pl-12"
            }`}
          />
        </div>
      </section>

      {/* Disciplines Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">{t.features.sectionTitle}</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto">{t.features.sectionSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDisciplines.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-2xl border bg-gradient-to-br ${item.color} p-6 shadow-xl hover:translate-y-[-2px] transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">{item.desc}</p>
                </div>

                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-md transition-all flex items-center justify-center space-x-2 ${item.btnColor}`}
                >
                  <span>{t.features.launch}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Educational Pedagogy / How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 lg:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div className={isRTL ? "mr-4 text-right" : ""}>
                <h4 className="text-base font-bold text-white mb-1">Authentic Simulation Engines</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real formulas computed on every animation frame: projectile drag, Snell's law, and Kirchhoff's loop rules.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Layers className="w-6 h-6" />
              </div>
              <div className={isRTL ? "mr-4 text-right" : ""}>
                <h4 className="text-base font-bold text-white mb-1">Open Science & Data Fidelity</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Powered by verified datasets: BodyParts3D 4.3, Z-Anatomy, and IUPAC element standards.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className={isRTL ? "mr-4 text-right" : ""}>
                <h4 className="text-base font-bold text-white mb-1">Universal Inclusive Learning</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Native right-to-left layout for Arabic students alongside English, French, and German curricula.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
