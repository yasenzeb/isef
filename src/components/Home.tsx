import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Activity,
  Atom,
  Dna,
  Globe2,
  Presentation,
  Search,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  Terminal,
  Compass,
  Zap,
  PlayCircle,
  TrendingUp,
  Clock,
  Sparkles
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
      code: 'SYS-01',
      title: t.features.anatomyTitle,
      desc: t.features.anatomyDesc,
      icon: Activity,
      spec: '8 Biometric Layers · Draco 3D Acceleration',
      status: 'CALIBRATED',
    },
    {
      id: 'physics',
      code: 'SYS-02',
      title: t.features.physicsTitle,
      desc: t.features.physicsDesc,
      icon: Atom,
      spec: 'Interactive Circuits · Forces & Motion · Ballistics · Optics',
      status: 'ONLINE',
    },
    {
      id: 'chemistry',
      code: 'SYS-03',
      title: t.features.chemistryTitle,
      desc: t.features.chemistryDesc,
      icon: Zap,
      spec: '118 IUPAC Periodic Elements · Atomic Shells',
      status: 'VERIFIED',
    },
    {
      id: 'biology',
      code: 'SYS-04',
      title: t.features.biologyTitle,
      desc: t.features.biologyDesc,
      icon: Dna,
      spec: '3D Organelle Streaming & DNA Helix Engine',
      status: 'ACTIVE',
    },
    {
      id: 'geology',
      code: 'SYS-05',
      title: t.features.geologyTitle,
      desc: t.features.geologyDesc,
      icon: Globe2,
      spec: 'Seismic Telemetry & Structural Base-Isolation',
      status: 'MONITORING',
    },
    {
      id: 'classroom',
      code: 'SYS-06',
      title: t.features.classroomTitle,
      desc: t.features.classroomDesc,
      icon: Presentation,
      spec: 'Interactive Teacher HUD & Live Experiment Sync',
      status: 'STANDBY',
    },
  ];

  const systemPillars = [
    {
      icon: Cpu,
      title: language === 'ar' ? 'محركات حسابية تفاعلية دقيقة' : 'Real-Time Physics & Nodal Engines',
      subtitle: language === 'ar' ? 'معادلات MNA لحظية ومحاكاة المقذوفات والموجات بمعدل 60 إطار/ث' : '60fps simulation — MNA circuit solving, Snell optics, and wave harmonics.',
    },
    {
      icon: Layers,
      title: language === 'ar' ? 'أطلس ثلاثي الأبعاد موثق علمياً' : 'Open Scientific Data Fidelity',
      subtitle: language === 'ar' ? 'أصول تشريحية Z-Anatomy وBodyParts3D وجدول العناصر الكيميائية IUPAC' : 'Draco compressed 3D meshes, BodyParts3D 4.3, and certified IUPAC data.',
    },
    {
      icon: Database,
      title: language === 'ar' ? 'تزامن الفصول ونظام التعريب' : 'Bilingual RTL & Classroom HUD',
      subtitle: language === 'ar' ? 'دعم كامل للفصحى مع توجيه RTL واجهات العرض التقديمي للمعلمين' : 'Native Arabic typography with dual-language RTL alignment across all modules.',
    },
    {
      icon: Terminal,
      title: language === 'ar' ? 'محاكاة بيئة المعامل الافتراضية' : 'Zero-Downtime Virtual Lab Access',
      subtitle: language === 'ar' ? 'تجارب آمنة بلا تكلفة استهلاكية أو مخاطر كيميائية وميكانيكية' : 'Accessible interactive simulations replacing risky or expensive physical equipment.',
    },
  ];

  const filteredDisciplines = disciplines.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.spec.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-24">
      
      {/* 1. TOP STATUS BANNER (Exact equivalent to 'System Nominal HEALTHY' in image) */}
      <div className="tech-status-banner">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white tracking-wide">
                {language === 'ar' ? 'النظام العلمي متصل وحسابي بالكامل' : 'Core Simulation Matrix Nominal'}
              </span>
              <span className="tech-badge tech-badge-emerald">HEALTHY</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {language === 'ar' 
                ? 'جميع محركات MNA، التشريح ثلاثي الأبعاد، ومحاكي الموجات تعمل ضمن المعايير المثالية.' 
                : 'All physics solvers, 3D anatomical meshes, and periodic tables verified.'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span className="font-mono text-xs text-slate-400">60 FPS · LATENCY &lt; 2ms</span>
          <button 
            onClick={() => onNavigate('physics')} 
            className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-white transition-colors"
          >
            {language === 'ar' ? 'فحص المحركات ←' : 'Inspect Solvers →'}
          </button>
        </div>
      </div>

      {/* 2. MAIN HERO SPLIT SECTION (Left: Typography & CTAs, Right: System Pillars List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        
        {/* LEFT COLUMN: Industrial Title & Metrics (Matching image left layout) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.1] text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest uppercase">{t.hero.badge} · COMPREHENSIVE STEM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08] font-sans">
            Interactive Science <br />
            <span className="text-metallic-silver">Platform System</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
            {t.hero.subtitle}
          </p>

          {/* Action Buttons (Silver Primary & Black/Silver Secondary) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('physics')}
              className="btn-silver-primary"
            >
              <PlayCircle className="w-4 h-4 text-black" />
              <span>{language === 'ar' ? 'تشغيل منصة المحاكاة' : 'Launch Simulation Engine'}</span>
            </button>

            <button
              onClick={() => onNavigate('anatomy')}
              className="btn-silver-secondary"
            >
              <Activity className="w-4 h-4 text-slate-300" />
              <span>{language === 'ar' ? 'استكشاف الأطلس الطبي' : 'Inspect Anatomy Atlas'}</span>
            </button>
          </div>

          {/* Telemetry Metrics (Matching 94.8% / 14d / 99.98% from image) */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08] max-w-lg">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {language === 'ar' ? 'دقة النماذج' : 'ENGINE ACCURACY'}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                99.8%
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {language === 'ar' ? 'تحديث الإطارات' : 'SOLVER TICK'}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                60Hz
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {language === 'ar' ? 'العناصر والتجارب' : 'TOTAL MODULES'}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                {t.hero.statsSimulations}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Stacked Industrial Cards (Matching SYSTEM PILLARS in image) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-4 h-[1px] bg-white/20" />
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              SYSTEM PILLARS & ARCHITECTURE
            </span>
          </div>

          {systemPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="pillar-row-card">
                <div className="w-9 h-9 rounded-lg bg-[#14171f] border border-white/10 flex items-center justify-center flex-shrink-0 text-slate-200">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    {pillar.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                    {pillar.subtitle}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Interactive Live Banner Box (Matching the blue/cyber mini-banner in reference) */}
          <div className="relative overflow-hidden rounded-xl border border-white/15 bg-gradient-to-r from-[#070b14] to-[#0d1627] p-4 text-white flex items-center justify-between">
            <div className="space-y-1">
              <span className="tech-badge tech-badge-emerald text-[9px]">LIVE TELEMETRY ACTIVE</span>
              <div className="text-xs font-bold font-mono">PhET Wave Mechanics Engine Ready</div>
              <p className="text-[10px] text-slate-400">Sinusoidal harmonics & real-time wave tension metrics</p>
            </div>
            <button
              onClick={() => onNavigate('physics')}
              className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold font-mono hover:bg-slate-200"
            >
              TRY
            </button>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & MATRIX SECTION HEADER */}
      <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              EXPERIMENTAL SUITES & VIRTUAL LABORATORIES
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            {t.features.sectionTitle}
          </h2>
        </div>

        {/* Search input in dark industrial style */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            className="w-full bg-[#08090c] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30 font-mono"
          />
        </div>
      </div>

      {/* 4. DISCIPLINE MATRIX CARDS (Black & Silver Industrial Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDisciplines.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="tech-card p-5 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Header row: Code + Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono font-bold text-slate-500 group-hover:text-white transition-colors">
                    {item.code}
                  </span>
                  <span className="tech-badge tech-badge-silver">
                    {item.status}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#11131a] border border-white/10 flex items-center justify-center text-white group-hover:border-white/30 group-hover:scale-105 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <div className="text-[10px] font-mono text-slate-500">
                      VIRTUAL LAB SUITE
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {item.desc}
                </p>
              </div>

              {/* Footer row: Spec summary + Action */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                  {item.spec}
                </span>
                <span className="inline-flex items-center gap-1 font-mono font-bold text-white text-[11px] group-hover:translate-x-1 transition-transform">
                  <span>{t.features.launch}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
