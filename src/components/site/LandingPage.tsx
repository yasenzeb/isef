import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { LAB_MODULES, type LabModule } from '../../data/labs';
import {
  Activity,
  Atom,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Users,
  ShieldCheck,
  WifiOff,
  Check,
  Play,
  ChevronRight,
  GraduationCap,
  Presentation,
  BarChart3,
} from 'lucide-react';
import { BrandMark, Wordmark } from '../ui/Brand';

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  anatomy: Activity,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  geology: Globe2,
  astronomy: Sparkles,
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sn-eyebrow">{children}</span>
);

const LandingHeader: React.FC<{ ar: boolean; signedIn: boolean }> = ({ ar, signedIn }) => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const links = [
    { href: '#labs', en: 'Labs', ar: 'المعامل' },
    { href: '#curriculum', en: 'Curriculum', ar: 'المناهج' },
    { href: '#roles', en: 'For schools', ar: 'للمدارس' },
    { href: '#offline', en: 'Offline', ar: 'بدون إنترنت' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white/85 backdrop-blur-xl">
      <div className="sn-shell flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="SciNexa home">
          <Wordmark compact />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-[#737373] transition-colors hover:text-[#0a0a0a]"
            >
              {ar ? link.ar : link.en}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="sn-btn sn-btn-quiet sn-btn-sm"
            aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            {ar ? 'EN' : 'العربية'}
          </button>
          {!signedIn && (
            <Link to="/sign-in" className="hidden sn-btn sn-btn-ghost sn-btn-sm sm:inline-flex">
              {ar ? 'تسجيل الدخول' : 'Sign in'}
            </Link>
          )}
          <Link to={signedIn ? '/app' : '/sign-up'} className="sn-btn sn-btn-primary sn-btn-sm">
            {signedIn ? (ar ? 'لوحة التحكم' : 'Dashboard') : ar ? 'ابدأ مجانًا' : 'Start free'}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="sn-btn sn-btn-quiet sn-btn-sm md:hidden"
            aria-label={ar ? 'القائمة' : 'Menu'}
            aria-expanded={open}
          >
            <span className="flex flex-col gap-[3px]">
              <span className="h-[1.5px] w-4 bg-current" />
              <span className="h-[1.5px] w-4 bg-current" />
              <span className="h-[1.5px] w-4 bg-current" />
            </span>
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-[#e5e5e5] bg-white md:hidden">
          <nav className="sn-shell flex flex-col py-2" aria-label={ar ? 'قائمة الجوال' : 'Mobile navigation'}>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#171717] hover:bg-[#f5f5f5]"
              >
                {ar ? link.ar : link.en}
              </a>
            ))}
            <Link to="/sign-in" className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#171717] hover:bg-[#f5f5f5]">
              {ar ? 'تسجيل الدخول' : 'Sign in'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

const DashboardPreview: React.FC<{ ar: boolean }> = ({ ar }) => (
  <div className="relative min-w-0">
    <div className="absolute -inset-6 -z-10 rounded-[36px] bg-[radial-gradient(circle_at_70%_20%,#e8efff_0,transparent_58%)]" />
    <div className="sn-card overflow-hidden p-0 shadow-[0_24px_70px_-28px_rgba(10,10,10,0.35)]">
      <div className="flex items-center gap-2 border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-[#e5e5e5]" />
        <span className="h-2 w-2 rounded-full bg-[#e5e5e5]" />
        <span className="h-2 w-2 rounded-full bg-[#e5e5e5]" />
        <span className="ms-3 rounded-full border border-[#e5e5e5] bg-white px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#737373]">
          app.scinexa.school
        </span>
      </div>

      <div className="grid grid-cols-[88px_1fr] sm:grid-cols-[112px_1fr]">
        <div className="border-e border-[#e5e5e5] bg-[#fafafa] p-3">
          <div className="mb-4 flex items-center gap-1.5">
            <BrandMark size={20} />
            <span className="text-[11px] font-semibold tracking-tight">SciNexa</span>
          </div>
          <div className="space-y-1.5">
            {[
              { icon: BarChart3, active: true },
              { icon: BookOpen },
              { icon: FlaskConical },
              { icon: Users },
              { icon: Presentation },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className={`flex h-6 items-center gap-1.5 rounded-[7px] px-1.5 ${
                    item.active ? 'border border-[#e5e5e5] bg-white' : ''
                  }`}
                >
                  <Icon size={11} strokeWidth={1.6} className={item.active ? 'text-[#0a0a0a]' : 'text-[#a3a3a3]'} />
                  <span className={`h-1 rounded-full ${item.active ? 'w-8 bg-[#d4d4d4]' : 'w-6 bg-[#ececec]'}`} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-[#a3a3a3]">
                {ar ? 'لوحة الطالب' : 'Student overview'}
              </div>
              <div className="text-[13px] font-semibold tracking-tight">
                {ar ? 'صباح الخير، ياسين' : 'Good morning, Yaseen'}
              </div>
            </div>
            <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[8px] font-medium text-[#047857]">
              {ar ? '٣ أيام متتالية' : '3-day streak'}
            </span>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            {[
              { v: '68%', l: ar ? 'تقدم المنهج' : 'Curriculum' },
              { v: '12', l: ar ? 'دروس مكتملة' : 'Lessons' },
              { v: '480', l: ar ? 'نقاط' : 'XP' },
            ].map((s) => (
              <div key={s.l} className="rounded-[10px] border border-[#e5e5e5] bg-white p-2">
                <div className="text-[15px] font-semibold tracking-[-0.04em]">{s.v}</div>
                <div className="text-[8px] text-[#737373]">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mb-2 flex items-end justify-between">
            <div className="text-[10px] font-semibold">{ar ? 'متابعة التعلم' : 'Continue learning'}</div>
            <div className="text-[8px] text-[#737373]">{ar ? 'عرض الكل' : 'View all'}</div>
          </div>

          <div className="space-y-1.5">
            {[
              { name: ar ? 'اختزال أكاسيد الفلزات' : 'Metal oxide reduction', accent: 'chemistry', pct: 72 },
              { name: ar ? 'الحركة على وتر' : 'Wave on a string', accent: 'physics', pct: 45 },
              { name: ar ? 'الجهاز العصبي' : 'Nervous system', accent: 'anatomy', pct: 28 },
            ].map((row) => (
              <div
                key={row.name}
                className={`sn-${row.accent} flex items-center gap-2 rounded-[9px] border border-[#e5e5e5] bg-white px-2 py-1.5`}
              >
                <span className="sn-accent-line h-5 w-[2px] rounded-full" />
                <span className="flex-1 text-[9px] font-medium">{row.name}</span>
                <span className="h-1 w-10 overflow-hidden rounded-full bg-[#f0f0f0]">
                  <span className="block h-full rounded-full bg-[#0a0a0a]" style={{ width: `${row.pct}%` }} />
                </span>
                <ChevronRight size={10} className="text-[#a3a3a3]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="absolute -bottom-5 -start-5 hidden sn-card sn-card-pad !p-3 shadow-lg sm:block">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#ecfdf5] text-[#047857]">
          <ShieldCheck size={14} strokeWidth={1.8} />
        </span>
        <div>
          <div className="text-[10px] font-semibold">{ar ? 'مطابق للمنهج' : 'MOE aligned'}</div>
          <div className="text-[8px] text-[#737373]">K–12 · Baccalaureate</div>
        </div>
      </div>
    </div>

    <div className="absolute -top-4 -end-3 hidden sn-card sn-card-pad !p-3 shadow-lg sm:block">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#eff6ff] text-[#1d4ed8]">
          <Play size={13} strokeWidth={1.8} className="fill-current" />
        </span>
        <div>
          <div className="text-[10px] font-semibold">{ar ? 'مباشر الآن' : 'Live simulation'}</div>
          <div className="text-[8px] text-[#737373]">{ar ? '٦ معامل' : '6 labs online'}</div>
        </div>
      </div>
    </div>
  </div>
);

const LabCard: React.FC<{ lab: LabModule; ar: boolean; onOpen: () => void }> = ({ lab, ar, onOpen }) => {
  const Icon = ICONS[lab.id];
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`sn-${lab.accent} sn-card sn-card-hover group flex flex-col p-5 text-start`}
    >
      <div className="mb-5 flex items-start justify-between">
        <span className="sn-icon-tile">
          <Icon size={18} strokeWidth={1.6} />
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-[#a3a3a3]">{lab.index}</span>
      </div>
      <div className="sn-eyebrow mb-1 !text-[10px]">{ar ? lab.categoryAr : lab.categoryEn}</div>
      <h3 className="sn-h3 mb-1.5">{ar ? lab.nameAr : lab.nameEn}</h3>
      <p className="mb-4 text-[13px] leading-relaxed text-[#737373]">{ar ? lab.taglineAr : lab.taglineEn}</p>
      <div className="mt-auto flex items-end justify-between border-t border-[#f0f0f0] pt-4">
        <div>
          <div className="sn-number text-[20px] font-semibold leading-none tracking-[-0.04em]">
            {lab.statValue}
          </div>
          <div className="mt-1 text-[10px] text-[#737373]">{ar ? lab.statLabelAr : lab.statLabelEn}</div>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] text-[#737373] transition-all group-hover:border-[#0a0a0a] group-hover:bg-[#0a0a0a] group-hover:text-white">
          <ArrowUpRight size={15} strokeWidth={1.8} />
        </span>
      </div>
    </button>
  );
};

export const LandingPage: React.FC = () => {
  const { language } = useLanguage();
  const { isSignedIn } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const openLab = (id: string) => navigate(isSignedIn ? `/app/labs/${id}` : '/sign-in');

  const copy = {
    eyebrow: ar ? 'آيسف ٢٠٢٦ · القاهرة، مصر' : 'ISEF 2026 · Cairo, Egypt',
    title: ar ? 'مختبر العلوم الذي يتّسع داخل المتصفح.' : 'The science lab that fits in a browser.',
    subtitle: ar
      ? 'ستة معامل تفاعلية ثلاثية الأبعاد، مرتبطة بمناهج وزارة التربية والتعليم المصرية. التشريح، الفيزياء، الكيمياء، الأحياء، الأرض، والفلك — في بيئة واحدة هادئة ودقيقة.'
      : 'Six interactive 3D laboratories, mapped to the Egyptian Ministry of Education curriculum. Anatomy, physics, chemistry, biology, earth and space — in one calm, precise environment.',
    start: ar ? 'ابدأ مجانًا' : 'Start free',
    explore: ar ? 'استكشف المعامل' : 'Explore the labs',
    noCard: ar ? 'بدون بطاقة بنكية' : 'No credit card',
    guest: ar ? 'وضع الزائر متاح' : 'Guest mode available',
    curriculum: ar ? 'مطابق للمنهج' : 'Curriculum-mapped',
    stats: ar
      ? [
          { v: '٦', l: 'معامل تخصصية' },
          { v: '٢٬٨٢١', l: 'بنية تشريحية' },
          { v: '١١٨', l: 'عنصرًا كيميائيًا' },
          { v: '١٠٠٪', l: 'مطابقة للمنهج' },
        ]
      : [
          { v: '6', l: 'specialist labs' },
          { v: '2,821', l: 'anatomical structures' },
          { v: '118', l: 'chemical elements' },
          { v: '100%', l: 'curriculum-mapped' },
        ],
    labsEyebrow: ar ? 'المعامل' : 'The laboratories',
    labsTitle: ar ? 'ستّ مساحات للاكتشاف، بلا فوضى.' : 'Six rooms for discovery. No clutter.',
    labsSub: ar
      ? 'كل معمل مصمم حول سؤال علمي واحد، مع أدوات قياس حقيقية ونتائج مباشرة.'
      : 'Each lab is built around one scientific question, with real measurement tools and immediate results.',
    curriculumEyebrow: ar ? 'المناهج' : 'Curriculum',
    curriculumTitle: ar ? 'كل درس له تجربة. كل تجربة لها دليل.' : 'Every lesson has an experiment. Every experiment has evidence.',
    curriculumSub: ar
      ? 'اختر صفك، وتابع وحدات كتاب الوزارة، مع تجربة ثلاثية الأبعاد وفيديو موثّق وتقييم أسبوعي لكل درس.'
      : 'Choose a grade, follow the Ministry textbook units, and get a linked 3D experiment, a verified video and a weekly assessment for every lesson.',
    rolesEyebrow: ar ? 'الأدوار' : 'Roles',
    rolesTitle: ar ? 'مصمّم للطالب، والمعلم، والمدرسة.' : 'Designed for the student, the teacher and the school.',
    roles: ar
      ? [
          { icon: GraduationCap, t: 'الطالب', d: 'مسار واضح، تقدّم محفوظ، ومعامل تُفتح بلا انتظار.', b: ['نقاط ومستويات', 'تقييمات أسبوعية', 'متابعة تلقائية'] },
          { icon: Presentation, t: 'المعلم', d: 'سبورة تفاعلية، فصول، واجبات، وتقارير جاهزة للعرض.', b: ['وضع السبورة', 'إدارة الفصول', 'تقارير الطلاب'] },
          { icon: ShieldCheck, t: 'الإدارة', d: 'نظرة على المدرسة، الاستخدام، والوصول حسب الدور.', b: ['إدارة المؤسسة', 'تحليلات', 'صلاحيات'] },
        ]
      : [
          { icon: GraduationCap, t: 'Student', d: 'A clear path, saved progress, and labs that open instantly.', b: ['XP & levels', 'Weekly assessments', 'Auto-resume'] },
          { icon: Presentation, t: 'Teacher', d: 'A smartboard, classes, assignments and presentable reports.', b: ['Board mode', 'Class management', 'Student reports'] },
          { icon: ShieldCheck, t: 'Administrator', d: 'A school-level view of usage, access and roles.', b: ['Institution admin', 'Analytics', 'Role permissions'] },
        ],
    offlineTitle: ar ? 'يعمل حين تنقطع الشبكة.' : 'Works when the network does not.',
    offlineSub: ar
      ? 'نسخة محلية كاملة على USB أو شبكة المدرسة، مع تحديث تلقائي عند العودة للإنترنت.'
      : 'A complete local build on USB or the school LAN, with automatic sync when the connection returns.',
    ctaTitle: ar ? 'افتح أول معمل خلال دقيقة.' : 'Open your first lab in a minute.',
    ctaSub: ar
      ? 'أنشئ حسابًا مدرسيًا أو ادخل كزائر. لا تحتاج إلى تثبيت أي شيء.'
      : 'Create a school account or enter as a guest. Nothing to install.',
    footerTag: ar ? 'منصة المختبرات العلمية التفاعلية' : 'Interactive science laboratory platform',
  };

  const lessons = ar
    ? [
        { n: '٠١', t: 'اختزال أكاسيد الفلزات', u: 'الفصل الثالث · كيمياء', lab: 'chemistry', p: 'ص ٤٢–٤٧' },
        { n: '٠٢', t: 'الحركة على وتر', u: 'الموجات · فيزياء', lab: 'physics', p: 'ص ٥٣–٥٨' },
        { n: '٠٣', t: 'الجهاز العصبي', u: 'التشريح · أحياء', lab: 'anatomy', p: 'ص ٦٠–٦٤' },
      ]
    : [
        { n: '01', t: 'Metal oxide reduction', u: 'Chapter 3 · Chemistry', lab: 'chemistry', p: 'pp. 42–47' },
        { n: '02', t: 'Wave on a string', u: 'Waves · Physics', lab: 'physics', p: 'pp. 53–58' },
        { n: '03', t: 'The nervous system', u: 'Anatomy · Biology', lab: 'anatomy', p: 'pp. 60–64' },
      ];

  return (
    <div className="min-h-screen bg-[#f5f5f5]" dir={ar ? 'rtl' : 'ltr'}>
      <LandingHeader ar={ar} signedIn={isSignedIn} />

      <main>
        {/* Hero */}
        <section className="sn-blueprint border-b border-[#e5e5e5]">
          <div className="sn-shell grid items-center gap-14 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
            <div className="sn-rise max-w-[560px]">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5">
                <span className="sn-live-dot h-1.5 w-1.5 rounded-full bg-[#1d4ed8]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#737373]">
                  {copy.eyebrow}
                </span>
              </div>

              <h1 className="sn-display">{copy.title}</h1>

              <p className="mt-6 max-w-[48ch] text-[15px] leading-[1.7] text-[#737373]">
                {copy.subtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to={isSignedIn ? '/app' : '/sign-up'} className="sn-btn sn-btn-primary sn-btn-lg">
                  {copy.start}
                  <ArrowRight size={16} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
                </Link>
                <a href="#labs" className="sn-btn sn-btn-ghost sn-btn-lg">
                  {copy.explore}
                </a>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#737373]">
                <span className="inline-flex items-center gap-1.5">
                  <Check size={13} strokeWidth={2} className="text-[#047857]" />
                  {copy.noCard}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={13} strokeWidth={2} className="text-[#047857]" />
                  {copy.guest}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={13} strokeWidth={2} className="text-[#047857]" />
                  {copy.curriculum}
                </span>
              </div>
            </div>

            <div className="sn-rise sn-rise-2 min-w-0">
              <DashboardPreview ar={ar} />
            </div>
          </div>

          <div className="border-t border-[#e5e5e5] bg-white/60">
            <div className="sn-shell grid grid-cols-2 divide-x divide-[#e5e5e5] py-0 md:grid-cols-4 [&>*]:border-[#e5e5e5] rtl:divide-x-reverse">
              {copy.stats.map((s) => (
                <div key={s.l} className="px-5 py-5 first:ps-0 md:px-7">
                  <div className="sn-number text-[24px] font-semibold leading-none tracking-[-0.04em]">{s.v}</div>
                  <div className="mt-1.5 text-[11px] text-[#737373]">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Labs */}
        <section id="labs" className="border-b border-[#e5e5e5] bg-[#f5f5f5] py-16 lg:py-24">
          <div className="sn-shell">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <SectionLabel>{copy.labsEyebrow}</SectionLabel>
                <h2 className="sn-h1 mt-3 max-w-[22ch]">{copy.labsTitle}</h2>
              </div>
              <p className="max-w-[38ch] text-[14px] leading-relaxed text-[#737373]">{copy.labsSub}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LAB_MODULES.map((lab) => (
                <LabCard key={lab.id} lab={lab} ar={ar} onOpen={() => openLab(lab.id)} />
              ))}
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section id="curriculum" className="border-b border-[#e5e5e5] bg-white py-16 lg:py-24">
          <div className="sn-shell grid items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionLabel>{copy.curriculumEyebrow}</SectionLabel>
              <h2 className="sn-h1 mt-3 max-w-[20ch]">{copy.curriculumTitle}</h2>
              <p className="mt-5 max-w-[46ch] text-[14px] leading-[1.7] text-[#737373]">{copy.curriculumSub}</p>

              <div className="mt-8 space-y-4">
                {[
                  ar ? 'وحدات كتاب الوزارة، لا قائمة دروس عشوائية.' : 'Ministry textbook units, not a random lesson list.',
                  ar ? 'تجربة ثلاثية الأبعاد مرتبطة بكل درس.' : 'A 3D experiment linked to every lesson.',
                  ar ? 'فيديو موثّق وتقييم أسبوعي في نفس المكان.' : 'A verified video and weekly assessment in one place.',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#1d4ed8]">
                      <Check size={11} strokeWidth={2.4} />
                    </span>
                    <span className="text-[13px] leading-relaxed text-[#171717]">{line}</span>
                  </div>
                ))}
              </div>

              <Link to={isSignedIn ? '/app/curriculum' : '/sign-up'} className="sn-link mt-8">
                {ar ? 'استعرض المسار الدراسي' : 'Browse the curriculum path'}
                <ArrowRight size={14} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
              </Link>
            </div>

            <div className="sn-card overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
                <div>
                  <div className="sn-eyebrow">{ar ? 'الصف الثاني الثانوي' : '2nd Secondary'}</div>
                  <div className="mt-1 text-[15px] font-semibold">{ar ? 'الكيمياء · بكالوريا' : 'Chemistry · Baccalaureate'}</div>
                </div>
                <span className="sn-badge sn-badge-soft">13%</span>
              </div>

              <div className="divide-y divide-[#f0f0f0]">
                {lessons.map((lesson) => (
                  <div key={lesson.n} className="flex items-center gap-4 px-5 py-4">
                    <span className="font-mono text-[10px] tracking-[0.12em] text-[#a3a3a3]">{lesson.n}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-[#0a0a0a]">{lesson.t}</div>
                      <div className="mt-0.5 text-[11px] text-[#737373]">
                        {lesson.u} · {lesson.p}
                      </div>
                    </div>
                    <span className={`sn-${lesson.lab} sn-badge`} style={{ background: 'var(--sn-accent-soft)', color: 'var(--sn-accent)' }}>
                      {ar ? 'معمل' : 'Lab'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-[#e5e5e5] bg-[#fafafa] px-5 py-3">
                <span className="text-[11px] text-[#737373]">{ar ? '٣ من ٨ دروس مكتملة' : '3 of 8 lessons complete'}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0a0a0a]">
                  {ar ? 'فتح المسار' : 'Open path'}
                  <ArrowUpRight size={12} strokeWidth={1.8} />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="border-b border-[#e5e5e5] bg-[#f5f5f5] py-16 lg:py-24">
          <div className="sn-shell">
            <SectionLabel>{copy.rolesEyebrow}</SectionLabel>
            <h2 className="sn-h1 mt-3 max-w-[24ch]">{copy.rolesTitle}</h2>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {copy.roles.map((role) => {
                const Icon = role.icon;
                return (
                  <div key={role.t} className="sn-card sn-card-hover p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#e5e5e5] bg-white text-[#0a0a0a]">
                      <Icon size={18} strokeWidth={1.6} />
                    </span>
                    <h3 className="sn-h3 mt-5">{role.t}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#737373]">{role.d}</p>
                    <ul className="mt-5 space-y-2 border-t border-[#f0f0f0] pt-4">
                      {role.b.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-[12px] text-[#171717]">
                          <Check size={12} strokeWidth={2.2} className="text-[#047857]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Offline */}
        <section id="offline" className="bg-white py-14">
          <div className="sn-shell">
            <div className="sn-card flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#1d4ed8]">
                  <WifiOff size={19} strokeWidth={1.6} />
                </span>
                <div>
                  <h3 className="sn-h3">{copy.offlineTitle}</h3>
                  <p className="mt-1 max-w-[58ch] text-[13px] leading-relaxed text-[#737373]">{copy.offlineSub}</p>
                </div>
              </div>
              <span className="sn-badge sn-badge-outline shrink-0">USB · LAN · PWA</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white pb-20">
          <div className="sn-shell">
            <div className="relative overflow-hidden rounded-[24px] bg-[#0a0a0a] px-6 py-12 md:px-12 md:py-14">
              <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
              <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                    {ar ? 'ابدأ الآن' : 'Get started'}
                  </span>
                  <h2 className="mt-3 max-w-[20ch] text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-white">
                    {copy.ctaTitle}
                  </h2>
                  <p className="mt-3 max-w-[42ch] text-[13px] leading-relaxed text-white/55">{copy.ctaSub}</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    to={isSignedIn ? '/app' : '/sign-up'}
                    className="sn-btn sn-btn-lg bg-white text-[#0a0a0a] hover:bg-[#f0f0f0]"
                  >
                    {copy.start}
                    <ArrowRight size={16} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
                  </Link>
                  <Link
                    to="/sign-in"
                    className="sn-btn sn-btn-lg border border-white/20 bg-transparent text-white hover:bg-white/10"
                  >
                    {ar ? 'تسجيل الدخول' : 'Sign in'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e5e5e5] bg-[#fafafa]">
        <div className="sn-shell py-12">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Wordmark />
              <p className="mt-4 max-w-[30ch] text-[12px] leading-relaxed text-[#737373]">{copy.footerTag}</p>
            </div>
            {[
              { h: ar ? 'المنتج' : 'Product', items: [[ar ? 'المعامل' : 'Labs', '#labs'], [ar ? 'المناهج' : 'Curriculum', '#curriculum'], [ar ? 'السبورة' : 'Classroom', '#roles']] },
              { h: ar ? 'المدرسة' : 'School', items: [[ar ? 'المعلمون' : 'Teachers', '#roles'], [ar ? 'الإدارة' : 'Administrators', '#roles'], [ar ? 'بدون إنترنت' : 'Offline', '#offline']] },
              { h: ar ? 'المشروع' : 'Project', items: [['ISEF 2026', '#'], [ar ? 'الفريق' : 'Team', '#'], [ar ? 'التراخيص' : 'Licenses', '#']] },
            ].map((col) => (
              <div key={col.h}>
                <div className="mb-3 text-[12px] font-semibold text-[#0a0a0a]">{col.h}</div>
                <ul className="space-y-2">
                  {col.items.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="text-[12px] text-[#737373] hover:text-[#0a0a0a]">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#e5e5e5] pt-6 text-[11px] text-[#737373] md:flex-row md:items-center">
            <span>© {new Date().getFullYear()} SciNexa · Islam &amp; Yaseen · ISEF 2026</span>
            <span className="font-mono text-[10px] tracking-[0.06em]">b35dcc2b…38123f</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
