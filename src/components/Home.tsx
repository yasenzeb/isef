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
  BookOpen
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
      badge: '8 Layers · Draco 3D',
      gradient: 'linear-gradient(135deg, #6366f1, #06b6d4)',
      glow: 'rgba(99,102,241,0.3)',
    },
    {
      id: 'physics',
      title: t.features.physicsTitle,
      desc: t.features.physicsDesc,
      icon: Atom,
      badge: 'MNA Solver & Mechanics',
      gradient: 'linear-gradient(135deg, #06b6d4, #10b981)',
      glow: 'rgba(6,182,212,0.3)',
    },
    {
      id: 'chemistry',
      title: t.features.chemistryTitle,
      desc: t.features.chemistryDesc,
      icon: Atom,
      badge: '118 IUPAC Elements · 3D',
      gradient: 'linear-gradient(135deg, #f59e0b, #f43f5e)',
      glow: 'rgba(245,158,11,0.3)',
    },
    {
      id: 'biology',
      title: t.features.biologyTitle,
      desc: t.features.biologyDesc,
      icon: Dna,
      badge: '3D Cell & DNA Helix',
      gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
      glow: 'rgba(16,185,129,0.3)',
    },
    {
      id: 'geology',
      title: t.features.geologyTitle,
      desc: t.features.geologyDesc,
      icon: Globe2,
      badge: 'Seismology & Base Isolation',
      gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
      glow: 'rgba(168,85,247,0.3)',
    },
    {
      id: 'classroom',
      title: t.features.classroomTitle,
      desc: t.features.classroomDesc,
      icon: Presentation,
      badge: 'Interactive Smartboard',
      gradient: 'linear-gradient(135deg, #f59e0b, #a855f7)',
      glow: 'rgba(245,158,11,0.3)',
    },
  ];

  const filteredDisciplines = disciplines.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-20 pb-24 fade-in-up">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-24 pb-8">
        {/* Animated Background Glows */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 60% at 50% -5%, rgba(99,102,241,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />

        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#818cf8' }}>{t.hero.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-white">{t.hero.title}{' '}</span>
            <span className="gradient-text-primary block sm:inline">{t.hero.titleAccent}</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button onClick={() => onNavigate('anatomy')} className="btn-glow flex items-center gap-2">
              <span>{t.hero.exploreModules}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('classroom')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
            >
              <Presentation className="w-4 h-4" style={{ color: '#fbbf24' }} />
              <span>{t.hero.openClassroom}</span>
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { val: t.hero.statsMeshes, label: t.hero.statsMeshesLabel },
              { val: t.hero.statsSimulations, label: t.hero.statsSimulationsLabel },
              { val: t.hero.statsLanguages, label: t.hero.statsLanguagesLabel },
            ].map((stat, i) => (
              <div key={i} className="text-center" style={i === 1 ? { borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)' } : {}}>
                <div className="text-3xl font-extrabold gradient-text-primary" style={{ fontFamily: 'var(--font-display)' }}>{stat.val}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="relative">
          <Search className="absolute top-3.5 w-5 h-5 text-slate-500" style={isRTL ? { right: '1rem' } : { left: '1rem' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            className="w-full py-3.5 text-sm text-white focus:outline-none rounded-2xl"
            style={{
              paddingLeft: isRTL ? '1rem' : '3rem',
              paddingRight: isRTL ? '3rem' : '1rem',
              textAlign: isRTL ? 'right' : 'left',
              background: 'rgba(17,24,39,0.8)',
              border: '1px solid rgba(99,102,241,0.2)',
              backdropFilter: 'blur(12px)',
            }}
          />
        </div>
      </section>

      {/* Disciplines Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{t.features.sectionTitle}</h2>
          <p className="text-sm text-slate-500 mt-3 max-w-xl mx-auto">{t.features.sectionSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDisciplines.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="glass-card p-6 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: item.gradient, boxShadow: `0 0 16px ${item.glow}` }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">{item.desc}</p>
                </div>
                <button
                  onClick={() => onNavigate(item.id)}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all group-hover:opacity-100"
                  style={{ background: item.gradient, boxShadow: `0 0 12px ${item.glow}`, opacity: 0.85 }}
                >
                  <span>{t.features.launch}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Cpu,
                gradient: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                glow: 'rgba(99,102,241,0.3)',
                title: language === 'ar' ? 'محركات محاكاة حسابية حقيقية' : 'Authentic Simulation Engines',
                desc: language === 'ar'
                  ? 'حسابات تفاعلية لحظية: تحليل الدوائر MNA، مسار المقذوفات، انكسار سنيل، وسرعة موجات تسونامي.'
                  : 'Real formulas on every frame: MNA circuit solving, projectile dynamics, Snell refraction.',
              },
              {
                icon: Layers,
                gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
                glow: 'rgba(16,185,129,0.3)',
                title: language === 'ar' ? 'نماذج ثلاثية الأبعاد وبيانات معتمدة' : 'Open Science & Data Fidelity',
                desc: language === 'ar'
                  ? 'بيانات موثقة من أطلس التشريح Z-Anatomy وBodyParts3D، والجدول الدوري لعناصر IUPAC.'
                  : 'BodyParts3D 4.3, Z-Anatomy Draco models, and IUPAC element standards.',
              },
              {
                icon: BookOpen,
                gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
                glow: 'rgba(168,85,247,0.3)',
                title: language === 'ar' ? 'تعريب علمي دقيق ومتكامل' : 'Universal Inclusive Learning',
                desc: language === 'ar'
                  ? 'مصطلحات عربية فصحى دقيقة مع محاذاة RTL كاملة بجانب الإنجليزية والفرنسية والألمانية.'
                  : 'Native RTL for Arabic students alongside English, French, and German curricula.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className={`flex items-start gap-4 ${isRTL ? 'text-right' : ''}`}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: f.gradient, boxShadow: `0 0 16px ${f.glow}` }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>{f.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
