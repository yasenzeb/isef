import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LABS_CATALOG, LabCatalogItem } from '../data/labsCatalogData';
import { SciNexaLogoIcon } from './SciNexaLogo';
import {
  Activity,
  Zap,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  HardDrive,
  User,
  GraduationCap,
  ShieldCheck,
  Flame,
  BookOpen
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
  onOpenOfflineModal: () => void;
  onOpenLocationModal: () => void;
}

const LAB_ICONS: Record<string, React.FC<{ size?: number; className?: string; strokeWidth?: number }>> = {
  anatomy: Activity,
  physics: Zap,
  chemistry: FlaskConical,
  biology: Dna,
  geology: Globe2,
  astronomy: Sparkles
};

export const Home: React.FC<HomeProps> = ({ onNavigate, onOpenOfflineModal }) => {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const ar = language === 'ar';

  const studentName = user?.displayName?.trim().split(/\s+/)[0] || (ar ? 'بطلنا' : 'Student');

  // Filter labs based on search query
  const filteredLabs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return LABS_CATALOG;
    return LABS_CATALOG.filter(
      (lab) =>
        lab.nameEn.toLowerCase().includes(q) ||
        lab.nameAr.includes(q) ||
        lab.categoryEn.toLowerCase().includes(q) ||
        lab.categoryAr.includes(q) ||
        lab.taglineAr.includes(q) ||
        lab.taglineEn.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const curriculumHighlights = ar
    ? [
        { n: '٠١', t: 'اختزال أكاسيد الفلزات وتحضير الغازات', u: 'الكيمياء غير العضوية', lab: 'chemistry', p: 'ص ٤٢–٤٧' },
        { n: '٠٢', t: 'الحركة الموجية وتراكب النبضات', u: 'الفيزياء والميكانيكا', lab: 'physics', p: 'ص ٥٣–٥٨' },
        { n: '٠٣', t: 'التشريح البشري والأعصاب القحفية', u: 'التشريح والأحياء', lab: 'anatomy', p: 'ص ٦٠–٦٤' }
      ]
    : [
        { n: '01', t: 'Metal Oxide Reduction & Gas Synthesis', u: 'Inorganic Chemistry', lab: 'chemistry', p: 'pp. 42–47' },
        { n: '02', t: 'Wave Motion & Superposition', u: 'Physics Dynamics', lab: 'physics', p: 'pp. 53–58' },
        { n: '03', t: 'Human Anatomy & Cranial Nerves', u: 'Medical Anatomy', lab: 'anatomy', p: 'pp. 60–64' }
      ];

  const roles = ar
    ? [
        {
          icon: User,
          t: 'الطالب',
          d: 'مسار واضح، تقدّم محفوظ، ومعامل ثلاثية الأبعاد تُفتح بلا انتظار.',
          b: ['تجارب تفاعلية 3D', 'تقييمات علمية فورية', 'حفظ التقدم التلقائي']
        },
        {
          icon: GraduationCap,
          t: 'المعلم',
          d: 'سبورة تفاعلية، تحكم بالتجارب، وشرح حي متكامل على الشاشة الكبيرة.',
          b: ['وضع السبورة الذكية', 'أدوات قياس معملية حية', 'محاكاة تفاعلية شاملة']
        },
        {
          icon: ShieldCheck,
          t: 'الإدارة المدرسية',
          d: 'نظرة شمولية على استخدام المعامل العلمية والتجهيز الكامل للأنشطة والمسابقات.',
          b: ['تشغيل كامل على شبكة المدرسة', 'دعم كامل لمعارض ISEF', 'اعتماد معايير STEM']
        }
      ]
    : [
        {
          icon: User,
          t: 'Student',
          d: 'A clear path, saved progress, and 3D laboratories that open instantly.',
          b: ['Interactive 3D labs', 'Instant scientific checks', 'Automatic auto-save']
        },
        {
          icon: GraduationCap,
          t: 'Teacher',
          d: 'A smartboard canvas, experiment control, and live demonstrations.',
          b: ['Smartboard mode', 'Live laboratory sensors', 'Comprehensive simulations']
        },
        {
          icon: ShieldCheck,
          t: 'Administration',
          d: 'Holistic observatory over school science lab usage and STEM readiness.',
          b: ['Full school LAN support', 'ISEF science fair compliant', 'STEM standards ready']
        }
      ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a]" dir={isRTL ? 'rtl' : 'ltr'}>
      <main>

        {/* ── 1. HERO SECTION (Science Observatory Blueprint) ── */}
        <section className="sn-blueprint border-b border-[#e5e5e5]">
          <div className="sn-shell grid items-center gap-14 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">

            {/* Left Column: Headlines & Call to Action */}
            <div className="sn-rise max-w-[580px]">

              {/* Eyebrow Pill */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 shadow-sm">
                <span className="sn-live-dot h-2 w-2 rounded-full bg-[#1d4ed8]" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#737373]">
                  {ar ? 'آيسف ٢٠٢٦ · القاهرة، مصر' : 'ISEF 2026 · Cairo, Egypt'}
                </span>
              </div>

              {/* Display Headline */}
              <h1 className="sn-display text-[#0a0a0a]">
                {ar ? 'مختبر العلوم الذي يتّسع داخل المتصفح.' : 'The science lab that fits in a browser.'}
              </h1>

              {/* Subtitle */}
              <p className="mt-6 max-w-[50ch] text-[15px] leading-[1.7] text-[#737373] font-medium">
                {ar
                  ? 'ستة معامل تفاعلية ثلاثية الأبعاد، مرتبطة بمناهج وزارة التربية والتعليم المصرية. التشريح الطبي، الفيزياء، الكيمياء وتحضير الغازات، الأحياء، الأرض والزلازل، والفلك — في بيئة واحدة هادئة ودقيقة.'
                  : 'Six interactive 3D laboratories, mapped to the Egyptian Ministry of Education curriculum. Medical anatomy, physics, chemistry & gas synthesis, biology, earth geophysics, and astronomy — in one calm, precise environment.'}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('labs');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="sn-btn sn-btn-primary sn-btn-lg shadow-md"
                >
                  <span>{ar ? 'ابدأ مجانًا' : 'Start Free'}</span>
                  {isRTL ? <ArrowLeft size={16} strokeWidth={1.8} /> : <ArrowRight size={16} strokeWidth={1.8} />}
                </button>

                <a
                  href="#labs"
                  className="sn-btn sn-btn-ghost sn-btn-lg"
                >
                  {ar ? 'استكشف المعامل' : 'Explore the Labs'}
                </a>
              </div>

              {/* Guarantee Checkmarks */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium text-[#737373]">
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} strokeWidth={2.4} className="text-[#047857]" />
                  {ar ? 'بدون بطاقة بنكية' : 'No credit card'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} strokeWidth={2.4} className="text-[#047857]" />
                  {ar ? 'وضع الزائر متاح' : 'Guest mode available'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} strokeWidth={2.4} className="text-[#047857]" />
                  {ar ? 'مطابق للمنهج والمعايير' : 'Curriculum-mapped'}
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Window Mockup (app.scinexa.school) */}
            <div className="sn-rise sn-rise-2 min-w-0">
              <div className="relative min-w-0">

                {/* Soft Ambient Glow */}
                <div className="absolute -inset-6 -z-10 rounded-[36px] bg-[radial-gradient(circle_at_70%_20%,#e8efff_0,transparent_58%)]" />

                {/* Window Frame */}
                <div className="sn-card overflow-hidden p-0 shadow-[0_24px_70px_-28px_rgba(10,10,10,0.30)]">

                  {/* Window Titlebar */}
                  <div className="flex items-center gap-2 border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-[#e5e5e5]" />
                    <span className="h-2 w-2 rounded-full bg-[#e5e5e5]" />
                    <span className="h-2 w-2 rounded-full bg-[#e5e5e5]" />
                    <span className="ms-3 rounded-full border border-[#e5e5e5] bg-white px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#737373]">
                      app.scinexa.school
                    </span>
                  </div>

                  {/* Window Content */}
                  <div className="grid grid-cols-[88px_1fr] sm:grid-cols-[112px_1fr]">

                    {/* Mini Sidebar */}
                    <div className="border-e border-[#e5e5e5] bg-[#fafafa] p-3 flex flex-col justify-between">
                      <div>
                        <div className="mb-4 flex items-center gap-1.5">
                          <SciNexaLogoIcon size={20} />
                          <span className="text-[11px] font-bold tracking-tight text-[#0a0a0a]">SciNexa</span>
                        </div>
                        <div className="space-y-1.5">
                          {[Activity, Zap, FlaskConical, Dna, Globe2].map((IconComp, idx) => (
                            <div
                              key={idx}
                              className={`flex h-6 items-center gap-1.5 rounded-[7px] px-1.5 ${
                                idx === 0 ? 'border border-[#e5e5e5] bg-white shadow-xs' : ''
                              }`}
                            >
                              <IconComp
                                size={11}
                                strokeWidth={1.8}
                                className={idx === 0 ? 'text-[#0a0a0a]' : 'text-[#a3a3a3]'}
                              />
                              <span
                                className={`h-1 rounded-full ${
                                  idx === 0 ? 'w-8 bg-[#d4d4d4]' : 'w-6 bg-[#ececec]'
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#e5e5e5] text-[8px] font-mono text-[#a3a3a3]">
                        v15.0
                      </div>
                    </div>

                    {/* Mini Dashboard Content */}
                    <div className="min-w-0 p-4">

                      {/* Header in Mockup */}
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] uppercase tracking-[0.12em] text-[#a3a3a3] font-mono">
                            {ar ? 'لوحة الطالب' : 'Student Overview'}
                          </div>
                          <div className="text-[13px] font-bold tracking-tight text-[#0a0a0a]">
                            {ar ? `صباح الخير، ${studentName}` : `Good morning, ${studentName}`}
                          </div>
                        </div>
                        <div className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[8px] font-bold text-[#047857] flex items-center gap-1">
                          <Flame size={10} className="text-[#047857]" />
                          {ar ? '٣ أيام متتالية' : '3-day streak'}
                        </div>
                      </div>

                      {/* Metric Tiles */}
                      <div className="mb-3 grid grid-cols-3 gap-2">
                        {[
                          { v: '68%', l: ar ? 'تقدم المنهج' : 'Curriculum' },
                          { v: '12', l: ar ? 'دروس مكتملة' : 'Lessons' },
                          { v: '480', l: ar ? 'نقاط XP' : 'XP Points' }
                        ].map((m) => (
                          <div key={m.l} className="rounded-[10px] border border-[#e5e5e5] bg-white p-2 shadow-xs">
                            <div className="text-[15px] font-bold tracking-[-0.04em] text-[#0a0a0a] font-mono">{m.v}</div>
                            <div className="text-[8px] font-medium text-[#737373]">{m.l}</div>
                          </div>
                        ))}
                      </div>

                      {/* In-Progress Lessons */}
                      <div className="mb-2 flex items-end justify-between">
                        <div className="text-[10px] font-bold text-[#0a0a0a]">
                          {ar ? 'متابعة التجارب' : 'Continue learning'}
                        </div>
                        <div className="text-[8px] text-[#737373]">
                          {ar ? 'عرض الكل' : 'View all'}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {[
                          { name: ar ? 'اختزال أكسيد النحاس بالهيدروجين' : 'Reduction of CuO by H2', accent: 'chemistry', pct: 85 },
                          { name: ar ? 'الحركة على وتر والموجات' : 'Wave on a string', accent: 'physics', pct: 60 },
                          { name: ar ? 'تشريح الجهاز العصبي والدماغ' : 'Nervous system & brain', accent: 'anatomy', pct: 40 }
                        ].map((item) => (
                          <div
                            key={item.name}
                            className={`sn-${item.accent} flex items-center gap-2 rounded-[9px] border border-[#e5e5e5] bg-white px-2 py-1.5 shadow-xs`}
                          >
                            <span className="sn-accent-line h-4 w-[2.5px] rounded-full" />
                            <span className="flex-1 text-[9px] font-semibold truncate text-[#0a0a0a]">
                              {item.name}
                            </span>
                            <div className="h-1 w-10 overflow-hidden rounded-full bg-[#f0f0f0]">
                              <span
                                className="block h-full rounded-full bg-[#0a0a0a]"
                                style={{ width: `${item.pct}%` }}
                              />
                            </div>
                            <span className="text-[8px] font-mono text-[#737373]">{item.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Bottom Badge */}
                <div className="absolute -bottom-4 -start-4 hidden sm:block sn-card !p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#ecfdf5] text-[#047857]">
                      <Check size={14} strokeWidth={2.4} />
                    </span>
                    <div>
                      <div className="text-[10px] font-bold text-[#0a0a0a]">
                        {ar ? 'مطابق للمنهج والمعايير' : 'MOE Aligned'}
                      </div>
                      <div className="text-[8px] text-[#737373] font-mono">
                        K–12 · Baccalaureate
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Top Badge */}
                <div className="absolute -top-4 -end-3 hidden sm:block sn-card !p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#eff6ff] text-[#1d4ed8]">
                      <Sparkles size={14} strokeWidth={2} />
                    </span>
                    <div>
                      <div className="text-[10px] font-bold text-[#0a0a0a]">
                        {ar ? 'معامل حية 3D' : 'Live 3D Labs'}
                      </div>
                      <div className="text-[8px] text-[#737373] font-mono">
                        {ar ? '٦ معامل تفاعلية نشطة' : '6 labs online'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="border-t border-[#e5e5e5] bg-white/70">
            <div className="sn-shell grid grid-cols-2 divide-x divide-[#e5e5e5] py-0 md:grid-cols-4 [&>*]:border-[#e5e5e5] rtl:divide-x-reverse">
              {[
                { v: '٦', en: '6', l: ar ? 'معامل تخصصية حية' : 'specialist 3D labs' },
                { v: '٢٬٨٢١', en: '2,821', l: ar ? 'بنية تشريحية طبية 3D' : 'anatomical structures' },
                { v: '١١٨', en: '118', l: ar ? 'عنصرًا وتفاعلات غازات' : 'chemical elements & reactions' },
                { v: '١٠٠٪', en: '100%', l: ar ? 'مطابقة للمنهج والاستكشاف' : 'curriculum & inquiry aligned' }
              ].map((s) => (
                <div className="px-5 py-5 first:ps-0 md:px-7" key={s.l}>
                  <div className="sn-number text-[26px] font-bold leading-none tracking-[-0.04em] text-[#0a0a0a]">
                    {ar ? s.v : s.en}
                  </div>
                  <div className="mt-1.5 text-[11px] font-medium text-[#737373]">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── 2. LABORATORIES CATALOG GRID (#labs) ── */}
        <section id="labs" className="border-b border-[#e5e5e5] bg-[#f5f5f5] py-16 lg:py-24">
          <div className="sn-shell">

            {/* Section Header & Filter */}
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <span className="sn-eyebrow text-[#1d4ed8]">
                  {ar ? 'المعامل التخصصية' : 'The Laboratories'}
                </span>
                <h2 className="sn-h1 mt-3 max-w-[24ch] text-[#0a0a0a]">
                  {ar ? 'ستّ مساحات للاكتشاف، بلا فوضى.' : 'Six rooms for discovery. No clutter.'}
                </h2>
              </div>

              {/* Spotlight Filter Input */}
              <div className="w-full md:w-80">
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={ar ? 'ابحث عن معمل، تجربة، أو عنصر...' : 'Search labs, experiments, elements...'}
                    className="sn-input ps-9 pe-4 !h-10 text-xs font-semibold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[#737373] hover:text-[#0a0a0a]"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 6 Lab Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLabs.map((lab: LabCatalogItem) => {
                const IconComponent = LAB_ICONS[lab.id] || Sparkles;
                return (
                  <button
                    key={lab.id}
                    type="button"
                    onClick={() => onNavigate(lab.id)}
                    className={`sn-${lab.accent} sn-card sn-card-hover group flex flex-col p-6 text-start cursor-pointer transition-all`}
                  >
                    {/* Top Row: Icon + Index */}
                    <div className="mb-5 flex items-start justify-between">
                      <div className="sn-icon-tile shadow-xs">
                        <IconComponent size={20} strokeWidth={1.8} />
                      </div>
                      <span className="font-mono text-[11px] font-bold tracking-[0.16em] text-[#a3a3a3]">
                        {lab.index}
                      </span>
                    </div>

                    {/* Category Eyebrow */}
                    <div className="sn-eyebrow mb-1 !text-[10px] text-[#737373]">
                      {ar ? lab.categoryAr : lab.categoryEn}
                    </div>

                    {/* Name */}
                    <h3 className="sn-h3 mb-2 text-[#0a0a0a] group-hover:text-[#1d4ed8] transition-colors">
                      {ar ? lab.nameAr : lab.nameEn}
                    </h3>

                    {/* Tagline */}
                    <p className="mb-5 text-[13px] leading-relaxed text-[#737373] line-clamp-2">
                      {ar ? lab.taglineAr : lab.taglineEn}
                    </p>

                    {/* Features list */}
                    <div className="mb-5 flex flex-wrap gap-1.5">
                      {(ar ? lab.featuresAr : lab.featuresEn).map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] text-[10px] font-semibold text-[#525252]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* Footer Row: Metric Stat + Open Arrow */}
                    <div className="mt-auto flex items-end justify-between border-t border-[#f0f0f0] pt-4">
                      <div>
                        <div className="sn-number text-[20px] font-bold leading-none tracking-[-0.04em] text-[#0a0a0a]">
                          {lab.statValue}
                        </div>
                        <div className="mt-1 text-[10px] font-medium text-[#737373]">
                          {ar ? lab.statLabelAr : lab.statLabelEn}
                        </div>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] text-[#737373] transition-all group-hover:border-[#0a0a0a] group-hover:bg-[#0a0a0a] group-hover:text-white shadow-xs">
                        {isRTL ? <ArrowLeft size={14} strokeWidth={2} /> : <ArrowRight size={14} strokeWidth={2} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>


        {/* ── 3. CURRICULUM ALIGNMENT SHOWCASE (#curriculum) ── */}
        <section id="curriculum" className="border-b border-[#e5e5e5] bg-white py-16 lg:py-24">
          <div className="sn-shell grid items-center gap-14 lg:grid-cols-2">

            {/* Left Column: Text & Features */}
            <div>
              <span className="sn-eyebrow text-[#1d4ed8]">
                {ar ? 'المناهج والتجارب التفاعلية' : 'Curriculum & Inquiry'}
              </span>
              <h2 className="sn-h1 mt-3 max-w-[22ch] text-[#0a0a0a]">
                {ar ? 'كل درس له تجربة. كل تجربة لها دليل.' : 'Every lesson has an experiment. Every experiment has evidence.'}
              </h2>
              <p className="mt-5 max-w-[46ch] text-[14px] leading-[1.7] text-[#737373]">
                {ar
                  ? 'منهج علمي تفاعلي يربط وحدات كتاب الوزارة بتجارب ثلاثية الأبعاد حية، مع أدوات تفاعل السحب والإفلات والتسخين وقياس الملاحظات العلمية لحظياً.'
                  : 'An interactive scientific curriculum connecting Ministry textbook units with real-time 3D experiments, complete with drag & drop reagent mixing and thermal reactions.'}
              </p>

              <div className="mt-8 space-y-4">
                {[
                  ar ? 'تجارب تحضير الغازات والمواد غير العضوية بالسحب والإفلات والتسخين.' : 'Gas synthesis & inorganic reactions with live drag & drop.',
                  ar ? 'ربط مباشر بالمفاهيم الفيزيائية والتشريحية بدون تعقيد أو تشويش.' : 'Direct coupling to physical and anatomical concepts without clutter.',
                  ar ? 'الاستكشاف المعملي الحر متاح لجميع الطلاب في أي وقت.' : 'Free laboratory sandbox open for all students at any time.'
                ].map((text) => (
                  <div className="flex items-start gap-3" key={text}>
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#1d4ed8]">
                      <Check size={12} strokeWidth={2.4} />
                    </span>
                    <span className="text-[13px] font-medium leading-relaxed text-[#171717]">{text}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onNavigate('chemistry')}
                className="sn-link mt-8 cursor-pointer font-semibold"
              >
                <span>{ar ? 'افتح معمل التفاعلات الكيميائية الآن' : 'Open Chemical Reactions Workbench'}</span>
                {isRTL ? <ArrowLeft size={14} strokeWidth={2} /> : <ArrowRight size={14} strokeWidth={2} />}
              </button>
            </div>

            {/* Right Column: Interactive Curriculum Card */}
            <div className="sn-card overflow-hidden p-0 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4 bg-[#fafafa]">
                <div>
                  <div className="sn-eyebrow text-[#737373]">
                    {ar ? 'تجارب تحضير الغازات والمواد غير العضوية' : 'Gas Synthesis Lab'}
                  </div>
                  <div className="mt-1 text-[15px] font-bold text-[#0a0a0a]">
                    {ar ? 'معمل التفاعلات الكيميائية والاستقصاء' : 'Virtual Chemical Reactions Lab'}
                  </div>
                </div>
                <span className="sn-badge sn-badge-green font-mono font-bold">
                  {ar ? 'جاهز للاستكشاف' : 'Ready'}
                </span>
              </div>

              <div className="divide-y divide-[#f0f0f0]">
                {curriculumHighlights.map((item) => (
                  <div
                    key={item.n}
                    onClick={() => onNavigate(item.lab)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors cursor-pointer group"
                  >
                    <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-[#a3a3a3]">
                      {item.n}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold text-[#0a0a0a] group-hover:text-[#1d4ed8] transition-colors">
                        {item.t}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#737373]">
                        {item.u} · {item.p}
                      </div>
                    </div>
                    <span
                      className={`sn-${item.lab} sn-badge`}
                      style={{
                        background: 'var(--sn-accent-soft)',
                        color: 'var(--sn-accent)'
                      }}
                    >
                      {ar ? 'ابدأ التجربة' : 'Launch'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-[#e5e5e5] bg-[#fafafa] px-5 py-3">
                <span className="text-[11px] font-medium text-[#737373]">
                  {ar ? 'محاكاة تفاعلية ثلاثية الأبعاد 3D' : 'Interactive 3D simulation'}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('chemistry')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0a0a0a] hover:text-[#1d4ed8]"
                >
                  <span>{ar ? 'فتح المعمل' : 'Open lab'}</span>
                  {isRTL ? <ArrowLeft size={12} strokeWidth={2} /> : <ArrowRight size={12} strokeWidth={2} />}
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* ── 4. ROLES SECTION (#roles) ── */}
        <section id="roles" className="border-b border-[#e5e5e5] bg-[#f5f5f5] py-16 lg:py-24">
          <div className="sn-shell">
            <span className="sn-eyebrow text-[#1d4ed8]">{ar ? 'الأدوار والبيئات' : 'Designed for everyone'}</span>
            <h2 className="sn-h1 mt-3 max-w-[24ch] text-[#0a0a0a]">
              {ar ? 'مصمّم للطالب، والمعلم، والمدرسة.' : 'Designed for the student, teacher and school.'}
            </h2>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {roles.map((r) => {
                const RoleIcon = r.icon;
                return (
                  <div className="sn-card sn-card-hover p-6 bg-white" key={r.t}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#e5e5e5] bg-[#fafafa] text-[#0a0a0a]">
                      <RoleIcon size={18} strokeWidth={1.8} />
                    </span>
                    <h3 className="sn-h3 mt-5 text-[#0a0a0a]">{r.t}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#737373]">{r.d}</p>
                    <ul className="mt-5 space-y-2 border-t border-[#f0f0f0] pt-4">
                      {r.b.map((feat) => (
                        <li className="flex items-center gap-2 text-[12px] font-medium text-[#171717]" key={feat}>
                          <Check size={13} strokeWidth={2.4} className="text-[#047857]" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* ── 5. OFFLINE & LAN DEPLOYMENT (#offline) ── */}
        <section id="offline" className="bg-white py-14 border-b border-[#e5e5e5]">
          <div className="sn-shell">
            <div className="sn-card flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8 bg-[#fafafa]">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#1d4ed8]">
                  <HardDrive size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="sn-h3 text-[#0a0a0a]">
                    {ar ? 'يعمل حين تنقطع الشبكة.' : 'Works when the network does not.'}
                  </h3>
                  <p className="mt-1 max-w-[58ch] text-[13px] leading-relaxed text-[#737373]">
                    {ar
                      ? 'نسخة محلية كاملة جاهزة للعمل على فلاش ميموري USB أو خادم المدرسة المحلي، مع إمكانية التحميل المسبق لكافة النماذج والتجارب.'
                      : 'A complete local build ready on USB or school LAN server, with full offline precaching of 3D models and simulations.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="sn-badge sn-badge-outline font-mono text-[11px]">
                  USB · LAN · PWA
                </span>
                <button
                  type="button"
                  onClick={onOpenOfflineModal}
                  className="sn-btn sn-btn-primary sn-btn-sm"
                >
                  {ar ? 'تحميل المعمل محلياً' : 'Download Lab'}
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* ── 6. CALL TO ACTION (Dark Science Observatory Banner) ── */}
        <section className="bg-white pb-20 pt-10">
          <div className="sn-shell">
            <div className="relative overflow-hidden rounded-[24px] bg-[#0a0a0a] px-6 py-12 md:px-12 md:py-14 text-white shadow-2xl">
              <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
              <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                    {ar ? 'ابدأ الآن' : 'Get Started'}
                  </span>
                  <h2 className="mt-3 max-w-[20ch] text-[clamp(1.75rem,3.4vw,2.5rem)] font-bold leading-[1.12] tracking-[-0.04em] text-white">
                    {ar ? 'افتح أول معمل خلال دقيقة.' : 'Open your first lab in a minute.'}
                  </h2>
                  <p className="mt-3 max-w-[42ch] text-[13px] leading-relaxed text-white/60">
                    {ar
                      ? 'اختر المعمل العلمي الذي ترغب في استكشافه الآن وابدأ التجربة ثلاثية الأبعاد فوراً دون تثبيت أي برامج خارجية.'
                      : 'Choose the scientific lab you wish to explore right now and launch real-time 3D inquiry without any installs.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('labs');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="sn-btn sn-btn-lg bg-white text-[#0a0a0a] hover:bg-[#f0f0f0] shadow-lg font-bold"
                  >
                    <span>{ar ? 'استكشف المعامل 3D' : 'Explore 3D Labs'}</span>
                    {isRTL ? <ArrowLeft size={16} strokeWidth={2} /> : <ArrowRight size={16} strokeWidth={2} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('classroom')}
                    className="sn-btn sn-btn-lg border border-white/20 bg-transparent text-white hover:bg-white/10"
                  >
                    <BookOpen size={16} strokeWidth={1.8} />
                    <span>{ar ? 'وضع السبورة' : 'Smartboard'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
