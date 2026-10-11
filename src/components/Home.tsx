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
  Cpu, 
  Layers, 
  BookOpen,
  CheckCircle2
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t, isRTL, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const disciplines = [
    {
      id: 'anatomy',
      title: t.features.anatomyTitle,
      desc: t.features.anatomyDesc,
      icon: Activity,
      badge: '8 Layers • Draco 3D',
      color: 'border-sky-500/20 text-sky-400 hover:border-sky-400/40',
      btnColor: 'bg-sky-600 hover:bg-sky-500',
    },
    {
      id: 'physics',
      title: t.features.physicsTitle,
      desc: t.features.physicsDesc,
      icon: Atom,
      badge: 'MNA Solver & Mechanics',
      color: 'border-indigo-500/20 text-indigo-400 hover:border-indigo-400/40',
      btnColor: 'bg-indigo-600 hover:bg-indigo-500',
    },
    {
      id: 'chemistry',
      title: t.features.chemistryTitle,
      desc: t.features.chemistryDesc,
      icon: Atom,
      badge: '118 IUPAC Elements • 3D',
      color: 'border-amber-500/20 text-amber-400 hover:border-amber-400/40',
      btnColor: 'bg-amber-600 hover:bg-amber-500',
    },
    {
      id: 'biology',
      title: t.features.biologyTitle,
      desc: t.features.biologyDesc,
      icon: Dna,
      badge: '3D Cell & DNA Helix',
      color: 'border-teal-500/20 text-teal-400 hover:border-teal-400/40',
      btnColor: 'bg-teal-600 hover:bg-teal-500',
    },
    {
      id: 'geology',
      title: t.features.geologyTitle,
      desc: t.features.geologyDesc,
      icon: Globe2,
      badge: 'Seismology & Base Isolation',
      color: 'border-cyan-500/20 text-cyan-400 hover:border-cyan-400/40',
      btnColor: 'bg-cyan-600 hover:bg-cyan-500',
    },
    {
      id: 'classroom',
      title: t.features.classroomTitle,
      desc: t.features.classroomDesc,
      icon: Presentation,
      badge: 'Interactive Smartboard',
      color: 'border-purple-500/20 text-purple-400 hover:border-purple-400/40',
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
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.18),rgba(0,0,0,0))]" />
        
        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {t.hero.title}{' '}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent block sm:inline">
              {t.hero.titleAccent}
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            {t.hero.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onNavigate('anatomy')}
              className="px-6 py-3.5 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xl shadow-sky-600/30 hover:scale-105 transition-all flex items-center space-x-2"
            >
              <span>{t.hero.exploreModules}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('classroom')}
              className="px-6 py-3.5 rounded-xl text-sm font-bold sci-surface hover:bg-slate-800 text-white border border-slate-700 shadow-lg transition-all flex items-center space-x-2"
            >
              <Presentation className="w-4 h-4 text-amber-400" />
              <span>{t.hero.openClassroom}</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8 border-t border-sky-500/10">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{t.hero.statsMeshes}</div>
              <div className="text-xs text-slate-400 mt-1">{t.hero.statsMeshesLabel}</div>
            </div>
            <div className="text-center border-x border-sky-500/10">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{t.hero.statsSimulations}</div>
              <div className="text-xs text-slate-400 mt-1">{t.hero.statsSimulationsLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{t.hero.statsLanguages}</div>
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
            className={`w-full bg-slate-950/80 border border-sky-500/20 rounded-2xl py-3.5 text-sm text-white focus:outline-none focus:border-sky-400 shadow-inner ${
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
                className={`sci-card flex flex-col justify-between p-6 hover:translate-y-[-2px] transition-all border ${item.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-sky-500/20 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950 border border-sky-500/20 text-slate-300 font-mono">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">{item.desc}</p>
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
        <div className="sci-card p-8 lg:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div className={isRTL ? "mr-4 text-right" : ""}>
                <h4 className="text-base font-bold text-white mb-1">
                  {language === 'ar' ? 'محركات محاكاة حسابية حقيقية' : 'Authentic Simulation Engines'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'ar' 
                    ? 'حسابات تفاعلية لحظية: تحليل الدوائر MNA، مسار المقذوفات، انكسار سنيل، وسرعة موجات تسونامي.' 
                    : 'Real formulas computed on every animation frame: MNA circuit solving, projectile dynamics, and Snell refraction.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Layers className="w-6 h-6" />
              </div>
              <div className={isRTL ? "mr-4 text-right" : ""}>
                <h4 className="text-base font-bold text-white mb-1">
                  {language === 'ar' ? 'نماذج ثلاثية الأبعاد وبيانات معتمدة' : 'Open Science & Data Fidelity'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'ar'
                    ? 'بيانات موثقة من أطلس التشريح Z-Anatomy وBodyParts3D، والجدول الدوري لعناصر IUPAC.'
                    : 'Powered by verified datasets: BodyParts3D 4.3, Z-Anatomy Draco models, and IUPAC element standards.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className={isRTL ? "mr-4 text-right" : ""}>
                <h4 className="text-base font-bold text-white mb-1">
                  {language === 'ar' ? 'تعريب علمي دقيق ومتكامل' : 'Universal Inclusive Learning'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'ar'
                    ? 'مصطلحات عربية فصحى دقيقة مع محاذاة RTL كاملة بجانب الإنجليزية والفرنسية والألمانية.'
                    : 'Native right-to-left layout for Arabic students alongside English, French, and German curricula.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
