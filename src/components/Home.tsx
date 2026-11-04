import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Atom,
  Dna,
  Globe2,
  Presentation,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  MapPin,
  Compass,
  Play,
  CheckCircle2,
  HelpCircle,
  Eye,
  Sliders,
  Flame,
  Radio,
  BookOpen
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
  onOpenOfflineModal?: () => void;
  onOpenLocationModal?: () => void;
}

// AI Smart Keyword Knowledge Base for Instant Navigation
const AI_SEARCH_RULES: { keywords: string[]; tab: string; labNameEn: string; labNameAr: string }[] = [
  {
    keywords: [
      'قلب', 'دماغ', 'مخ', 'عصب', 'عين', 'جمجمة', 'عظم', 'كلية', 'كبد', 'معدة', 'رئة', 'تشريح', 'غضروف', 'مفصل', 'عضلة', 'أعصاب', 'شريان', 'وريد', 'جهاز عصبي', 'قرنية', 'شبكية', 'نخاع', 'رئتين',
      'heart', 'brain', 'nerve', 'eye', 'skull', 'bone', 'kidney', 'liver', 'stomach', 'lung', 'anatomy', 'cartilage', 'joint', 'muscle', 'artery', 'vein', 'cornea', 'retina', 'medulla', 'pons'
    ],
    tab: 'anatomy',
    labNameEn: 'Human 3D Anatomy Atlas',
    labNameAr: 'أطلس تشريح جسم الإنسان ثلاثي الأبعاد'
  },
  {
    keywords: [
      'فيزياء', 'قوة', 'تسارع', 'حركة', 'مقذوف', 'دائرة', 'أوم', 'كيرشوف', 'مقاومة', 'جهد', 'تيار', 'انكسار', 'عدسة', 'سنيل', 'موجة', 'وتر', 'phet', 'تردد', 'سعة', 'كهرباء', 'سرعة',
      'physics', 'force', 'acceleration', 'motion', 'projectile', 'circuit', 'ohm', 'kirchhoff', 'resistor', 'voltage', 'current', 'refraction', 'snell', 'wave', 'string', 'frequency', 'amplitude'
    ],
    tab: 'physics',
    labNameEn: 'Physics & Circuit Simulation Lab',
    labNameAr: 'مختبر الفيزياء والدوائر والموجات'
  },
  {
    keywords: [
      'كيمياء', 'جدول دوري', 'عنصر', 'ذرة', 'بروتون', 'إلكترون', 'نيوترون', 'مدار', 'توزيع', 'هيدروجين', 'أكسجين', 'كربون', 'تفاعل', 'مركب', 'مجموعة ذرية', 'بوهر',
      'chemistry', 'periodic table', 'element', 'atom', 'proton', 'electron', 'neutron', 'orbital', 'bohr', 'hydrogen', 'oxygen', 'carbon', 'reaction', 'radical'
    ],
    tab: 'chemistry',
    labNameEn: 'Interactive Periodic Table & 3D Atoms',
    labNameAr: 'الجدول الدوري ونماذج الذرة ثلاثية الأبعاد'
  },
  {
    keywords: [
      'أحياء', 'خلية', 'نواة', 'ميتوكوندريا', 'بلاستيدة', 'جدار خلوي', 'dna', 'حمض نووي', 'وراثة', 'أميبا', 'يوجلينا', 'براميسيوم', 'بكتيريا', 'أهداب', 'سوط', 'أقدام كاذبة', 'بلعمة',
      'biology', 'cell', 'nucleus', 'mitochondria', 'chloroplast', 'dna', 'genetics', 'amoeba', 'euglena', 'paramecium', 'microorganism', 'cilia', 'flagellum', 'pseudopodia'
    ],
    tab: 'biology',
    labNameEn: 'Cytology & Molecular Genetics Lab',
    labNameAr: 'مختبر الأحياء والخلية والكائنات الدقيقة'
  },
  {
    keywords: [
      'جيولوجيا', 'أرض', 'زلزال', 'تسونامي', 'طبقات الأرض', 'لب', 'وشاح', 'قشرة', 'انهيار', 'مبنى', 'صدع', 'ريختر', 'صخور', 'صفائح', 'ليمان',
      'geology', 'earth', 'earthquake', 'tsunami', 'layers', 'core', 'mantle', 'crust', 'collapse', 'building', 'fault', 'richter', 'seismic', 'tectonics'
    ],
    tab: 'geology',
    labNameEn: 'Geology & 3D Structural Collapse Simulator',
    labNameAr: 'علوم الأرض ومحاكاة انهيار المباني'
  },
  {
    keywords: [
      'فلك', 'فضاء', 'شمس', 'قمر', 'كواكب', 'نظام شمسي', 'أطوار القمر', 'مدار', 'عطارد', 'الزهرة', 'المريخ', 'المشتري', 'زحل', 'أورانوس', 'نبتون', 'كيبلر', 'جاذبية', 'مد وجزر', 'محاق', 'بدر',
      'astronomy', 'space', 'sun', 'moon', 'planets', 'solar system', 'moon phases', 'orbit', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'kepler', 'tides'
    ],
    tab: 'astronomy',
    labNameEn: 'Astronomy & 3D Solar System Lab',
    labNameAr: 'مختبر علوم الفلك والنظام الشمسي'
  },
  {
    keywords: [
      'فصل', 'شاشة', 'عرض', 'سبورة', 'بروجكتور', 'معلم', 'سمارت',
      'classroom', 'presentation', 'smartboard', 'projector', 'teacher'
    ],
    tab: 'classroom',
    labNameEn: 'Smart Classroom & Presentation Mode',
    labNameAr: 'وضع الفصل والشاشات الذكية التفاعلية'
  }
];

export const Home: React.FC<HomeProps> = ({ onNavigate, onOpenOfflineModal, onOpenLocationModal }) => {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const isArabic = language === 'ar';

  // Smart Search Matching Engine
  const detectedAIIntent = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return null;
    for (const rule of AI_SEARCH_RULES) {
      for (const kw of rule.keywords) {
        if (q.includes(kw.toLowerCase())) {
          return {
            tab: rule.tab,
            matchedTerm: kw,
            labNameEn: rule.labNameEn,
            labNameAr: rule.labNameAr
          };
        }
      }
    }
    return null;
  }, [searchQuery]);

  // The 6 Signature Interactive Laboratories (HeroUI Bento Grid Configuration)
  const labCards = [
    {
      id: 'anatomy',
      title: isArabic ? 'أطلس التشريح البشري ثلاثي الأبعاد' : '3D Human Anatomy Atlas',
      subtitle: isArabic ? 'أكثر من 2,821 عضواً وبنية تشريحية حقيقية' : '2,821+ High-Precision Anatomical Entities',
      description: isArabic 
        ? 'استكشف أدق التفاصيل الطبية لجسم الإنسان: الهيكل العظمي، العضلات، القلب والشرايين، الدماغ والأعصاب، والأعضاء الحشوية مع ميزة العزل 3D.'
        : 'Explore certified medical 3D anatomy: skeleton, muscular system, heart & vessels, nervous system, and visceral organs with 3D isolation.',
      icon: Activity,
      accentColor: '#f43f5e',
      gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
      borderColor: 'hover:border-rose-500/50',
      badge: isArabic ? 'أطلس طبي معتمد' : 'Medical Grade 3D',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      features: isArabic 
        ? ['7 أجهزة تشريحية عميقة', 'فحص وعزل أي عضو', 'شرح طبي فوري'] 
        : ['7 Deep Anatomical Systems', 'Isolate & Inspect Any Organ', 'Instant Medical Descriptions'],
      actionText: isArabic ? 'ابدأ فحص وتشريح الأعضاء 3D' : 'Launch Anatomy Atlas'
    },
    {
      id: 'physics',
      title: isArabic ? 'مختبر الفيزياء والدوائر والموجات' : 'Interactive Physics & Waves Lab',
      subtitle: isArabic ? 'الكهرباء، القوى والحركة، المقذوفات، والأمواج' : 'DC Circuits, Dynamics, Projectiles & Waves',
      description: isArabic 
        ? 'ركّب الدوائر الكهربائية، اختبر قانون أوم والمقاومات في الوقت الفعلي، أطلق المقذوفات بزوايا مختلفة، وشاهد انتشار الموجات وانكسار الضوء.'
        : 'Construct live DC circuits, solve Ohm & Kirchhoff laws in real-time, launch projectile motion, and simulate wave harmonics.',
      icon: Zap,
      accentColor: '#38bdf8',
      gradient: 'from-sky-500/20 via-cyan-500/10 to-transparent',
      borderColor: 'hover:border-sky-500/50',
      badge: isArabic ? 'محاكاة فيزيائية حية' : 'Real-Time Physics',
      badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      features: isArabic 
        ? ['دوائر كهربائية DC تفاعلية', 'محاكي المقذوفات والقوى', 'محاكاة الموجات والضوء'] 
        : ['Interactive DC Circuits', 'Forces & Projectile Engine', 'Wave & Optics Simulation'],
      actionText: isArabic ? 'دخول مختبر الفيزياء' : 'Launch Physics Lab'
    },
    {
      id: 'chemistry',
      title: isArabic ? 'الجدول الدوري وبنية الذرة 3D' : 'Periodic Table & 3D Atoms',
      subtitle: isArabic ? '118 عنصراً كيميائياً ومعمل تفاعلات PraxiLabs' : '118 IUPAC Elements & PraxiLabs Reactions',
      description: isArabic 
        ? 'تعرف على العناصر الـ 118 مع دوران الإلكترونات في مدارات بوهر ثلاثية الأبعاد، واستكشف تفاعلات المحاليل الكيميائية والمجموعات الذرية.'
        : 'Explore 118 elements with real-time 3D Bohr electron orbitals, chemical solution reactions, and polyatomic ionic structures.',
      icon: Atom,
      accentColor: '#f59e0b',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'hover:border-amber-500/50',
      badge: isArabic ? 'الجدول الدوري الشامل' : '118 IUPAC Elements',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      features: isArabic 
        ? ['توزيع الإلكترونات 3D', 'معمل PraxiLabs للتفاعلات', 'المجموعات الذرية الكيميائية'] 
        : ['3D Bohr Orbitals', 'PraxiLabs Reaction Simulator', 'Polyatomic Radicals 3D'],
      actionText: isArabic ? 'استكشف الجدول الدوري' : 'Explore Chemistry Lab'
    },
    {
      id: 'biology',
      title: isArabic ? 'مختبر الأحياء والخلية والوراثة' : 'Cytology & Genetics Laboratory',
      subtitle: isArabic ? 'مجسم الخلية الحقيقي، الكائنات الدقيقة، وشريط DNA' : '3D Realistic Cell, Microorganisms & DNA',
      description: isArabic 
        ? 'انظر عبر المجهر إلى الخلية الحية ومكوناتها الدقيقة، راقب حركة الأميبا واليوجلينا والبراميسيوم، وفكك التركيب الحلزوني للحمض النووي DNA.'
        : 'Look through the virtual microscope into 3D cells, observe live unicellular microorganisms, and unpack the DNA double-helix.',
      icon: Dna,
      accentColor: '#10b981',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'hover:border-emerald-500/50',
      badge: isArabic ? 'أحياء مجهرية 3D' : '3D Cell Microscopy',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      features: isArabic 
        ? ['مجسم ثلاثي الأبعاد للخلية', 'أميبا ويوجلينا وبراميسيوم', 'شريط الحمض النووي DNA'] 
        : ['Realistic 3D Living Cell', 'Unicellular Microorganisms', '3D DNA Double Helix'],
      actionText: isArabic ? 'دخول مختبر الأحياء' : 'Explore Biology Lab'
    },
    {
      id: 'geology',
      title: isArabic ? 'علوم الأرض ومحاكاة انهيار المباني' : 'Geology & Seismic Collapse Sim',
      subtitle: isArabic ? 'الزلازل بمقياس ريختر، أمواج التسونامي، وباطن الأرض' : 'Richter Quakes, Tsunami Wave & Earth Layers',
      description: isArabic 
        ? 'قم باختبار متانة المباني والمنشآت تحت قوى الهزات الأرضية والزلازل الحية واندفاع موجات التسونامي، واستكشف مقطعاً تفاعلياً لطبقات الأرض.'
        : 'Test real structural stability and building collapse physics under Richter earthquakes and tsunami surges with 3D Earth layers.',
      icon: Globe2,
      accentColor: '#a855f7',
      gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
      borderColor: 'hover:border-purple-500/50',
      badge: isArabic ? 'محاكاة كوارث 3D' : '3D Seismic Physics',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      features: isArabic 
        ? ['محاكاة انهيار المباني الحية', 'اندفاع قوى تسونامي الهيدروديناميكية', 'مقطع طبقات باطن الأرض'] 
        : ['Real-Time Building Collapse', 'Tsunami Surge Hydrodynamics', '3D Earth Interior Cutaway'],
      actionText: isArabic ? 'تجربة محاكاة الزلازل' : 'Run Geology Simulator'
    },
    {
      id: 'astronomy',
      title: isArabic ? 'علم الفلك والنظام الشمسي 3D' : 'Astronomy & Solar System 3D',
      subtitle: isArabic ? 'مدارات الكواكب، أطوار القمر، وقوانين كيبلر' : 'Planetary Orbits, Moon Phases & Kepler Laws',
      description: isArabic 
        ? 'انطلق في رحلة فضائية بين كواكب المجموعة الشمسية بدقة مدارية حقيقية، راقب دورة أطوار القمر الـ 8 في 3D، وتعرف على قوانين كيبلر والجاذبية.'
        : 'Journey through the real 3D solar system with precise Keplerian orbital mechanics, explore the 8 lunar phases, and learn cosmic laws.',
      icon: Sparkles,
      accentColor: '#eab308',
      gradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
      borderColor: 'hover:border-yellow-500/50',
      badge: isArabic ? 'محاكاة مدارات الفضاء' : 'Orbital Mechanics 3D',
      badgeColor: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
      features: isArabic 
        ? ['كواكب المجموعة الشمسية 3D', 'أطوار القمر التفاعلية', 'قوانين كيبلر والجاذبية'] 
        : ['Real 3D Solar System', 'Interactive 8 Moon Phases', 'Kepler & Gravity Laws'],
      actionText: isArabic ? 'انطلق لمختبر الفضاء' : 'Launch Astronomy Lab'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-28 pt-2" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* ── 1. WELCOME HERO SECTION (HeroUI Signature Hero) ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0c1022] via-[#070a16] to-[#04060d] border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl">
        {/* Glow Halos */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          {/* Top ISEF Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/15 text-xs font-bold text-slate-200 backdrop-blur-md shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isArabic ? 'منصة المختبرات العلمية والمحاكاة التفاعلية ثلاثية الأبعاد' : 'Interactive 3D Virtual Science Platform'}</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] border border-indigo-500/30 font-mono">
              ISEF 2026
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            {isArabic ? (
              <>
                تعلّم واكتشف العلوم <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                  بتجارب ثلاثية الأبعاد حقيقية
                </span>
              </>
            ) : (
              <>
                Learn & Discover Science <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                  Through Real 3D Interactive Labs
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
            {isArabic
              ? 'بيئة علمية تفاعلية شاملة: فكك أعضاء جسم الإنسان، شغّل دوائر الكهرباء، استكشف عناصر الجدول الدوري، حاكي انهيار المباني والزلازل، وتحدث صوتياً مع مرشدك الذكي داروين.'
              : 'A comprehensive virtual science ecosystem: inspect human anatomy, wire electrical circuits, interact with 118 elements, simulate structural earthquakes, and talk directly with AI Darwin.'}
          </p>

          {/* Direct CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('anatomy')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-rose-500/25 flex items-center gap-2 transition-all hover:scale-[1.03] cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>{isArabic ? 'ابدأ بأطلس التشريح 3D' : 'Open Anatomy Atlas'}</span>
            </button>

            <button
              onClick={() => onNavigate('physics')}
              className="px-6 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-bold text-sm backdrop-blur-md flex items-center gap-2 transition-all hover:scale-[1.03] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-sky-400" />
              <span>{isArabic ? 'مختبر الفيزياء والكهرباء' : 'Explore Physics Lab'}</span>
            </button>

            <button
              onClick={() => onNavigate('classroom')}
              className="px-5 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-sm flex items-center gap-2 transition-all hover:scale-[1.03] cursor-pointer"
            >
              <Presentation className="w-4 h-4 text-amber-400" />
              <span>{isArabic ? 'السبورة الذكية للمعلم' : 'Smartboard Presentation'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. "HOW IT WORKS" 3-STEP INTUITIVE ONBOARDING GUIDE ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {isArabic ? 'كيف تبدأ استخدام المنصة في 3 خطوات بسيطة؟' : 'How It Works: 3 Simple Steps to Start'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden space-y-2 hover:border-indigo-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 font-mono font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                1
              </span>
              <Compass className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white pt-1">
              {isArabic ? 'اختر المعمل العلمي' : '1. Select Your Lab'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isArabic
                ? 'انقر على أي مختبر من الستة في الأسفل (التشريح، الفيزياء، الكيمياء، الأحياء، الجيولوجيا، أو الفلك).'
                : 'Choose any of the 6 specialized laboratories below to enter instantly with zero loading friction.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden space-y-2 hover:border-sky-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 font-mono font-bold flex items-center justify-center text-sm border border-sky-500/30">
                2
              </span>
              <Sliders className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-base font-bold text-white pt-1">
              {isArabic ? 'تفاعل وتحكّم بالمجسمات 3D' : '2. Interact in Real 3D'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isArabic
                ? 'استخدم الماوس أو اللمس لتدوير النماذج، عزل الأعضاء، بناء الدوائر الكهربائية، أو اختبار الزلازل.'
                : 'Rotate, zoom, isolate body parts, build electronic circuits, or trigger live earthquake collapse simulations.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden space-y-2 hover:border-emerald-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold flex items-center justify-center text-sm border border-emerald-500/30">
                3
              </span>
              <Radio className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white pt-1">
              {isArabic ? 'تحدث مع المرشد داروين' : '3. Speak with Darwin AI'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isArabic
                ? 'اضغط على زر داروين الصوتي أسفل الشاشة واسأله بصوتك عن أي مفهوم علمي وسيرشدك فوراً.'
                : 'Click the voice assistant icon in the bottom corner and talk freely to learn and navigate directly.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. SMART SEARCH & INSTANT JUMP OMNIBAR ── */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#090d1a] border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{isArabic ? 'البحث الذكي السريع عن أي تجربة أو عضو' : 'Smart Scientific Search & Quick Lab Jump'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isArabic 
                ? 'اكتب اسم أي عضو، عنصر كيميائي، أو قانون فيزيائي للانتقال إليه مباشرة' 
                : 'Type any anatomical organ, chemical element, or physics term for instant navigation'}
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="relative">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && detectedAIIntent) {
                onNavigate(detectedAIIntent.tab);
              }
            }}
            placeholder={isArabic ? 'ابحث هنا (مثال: القلب، الصوديوم، قانون أوم، الخلية، الزلازل، القمر)...' : 'Search (e.g. Heart, Sodium, Ohm, Cell, Earthquake, Moon)...'}
            className="w-full bg-black/60 border border-white/15 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
          />
        </div>

        {/* Instant Detection Alert */}
        {detectedAIIntent && (
          <div 
            onClick={() => onNavigate(detectedAIIntent.tab)}
            className="cursor-pointer p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-indigo-950/60 to-slate-900 border border-cyan-400/50 flex items-center justify-between text-white shadow-lg shadow-cyan-500/10 hover:border-cyan-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                <Play className="w-4 h-4 fill-cyan-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-cyan-400 block">
                  {isArabic ? 'نتيجة البحث المباشر:' : 'Direct Match Found:'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {isArabic 
                    ? `انقر هنا للانتقال فوراً إلى ${detectedAIIntent.labNameAr}`
                    : `Click here to navigate directly to ${detectedAIIntent.labNameEn}`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/30 shrink-0">
              <span>{isArabic ? 'فتح الآن' : 'Launch'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-xs font-semibold">
            {isArabic ? 'تجارب مقترحة:' : 'Suggestions:'}
          </span>
          {[
            { label: isArabic ? '🫀 تشريح القلب' : '🫀 Heart Anatomy', tab: 'anatomy' },
            { label: isArabic ? '⚡ دوائر الكهرباء' : '⚡ DC Circuits', tab: 'physics' },
            { label: isArabic ? '🧪 ذرة الهيدروجين' : '🧪 Hydrogen Atom', tab: 'chemistry' },
            { label: isArabic ? '🔬 الخلية والكائنات المجهرية' : '🔬 3D Cell Specimen', tab: 'biology' },
            { label: isArabic ? '🌋 انهيار مبنى بزلزال' : '🌋 Building Collapse', tab: 'geology' },
            { label: isArabic ? '🪐 أطوار القمر وكواكب الفضاء' : '🪐 Moon & Planets', tab: 'astronomy' },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(chip.tab)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.08] text-slate-300 transition-all text-xs font-medium cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 4. THE 6 PRIMARY INTERACTIVE LABORATORIES (HeroUI BENTO GRID) ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{isArabic ? 'المعامل العلمية الستة' : 'The 6 Core Virtual Laboratories'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isArabic ? 'اختر المعمل العلمي وابدأ التجربة' : 'Select a Laboratory & Start Exploring'}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className={`group relative rounded-3xl p-6 sm:p-7 bg-gradient-to-b ${card.gradient} bg-[#080b15]/90 border border-white/10 ${card.borderColor} shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden`}
              >
                {/* Glow Orb in corner */}
                <div 
                  className="absolute -top-16 -left-16 w-36 h-36 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                  style={{ background: card.accentColor }}
                />

                <div className="space-y-4 relative z-10">
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                      style={{ 
                        background: card.accentColor + '20', 
                        border: `1px solid ${card.accentColor}40`,
                        color: card.accentColor
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Features Bullets */}
                  <div className="space-y-1.5 pt-1">
                    {card.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: card.accentColor }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-6 border-t border-white/[0.08] mt-6 relative z-10">
                  <div 
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-between transition-all group-hover:brightness-110 shadow-md"
                    style={{ background: `linear-gradient(135deg, ${card.accentColor}dd, ${card.accentColor}99)` }}
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. SMARTBOARD CLASSROOM HIGHLIGHT CARD ── */}
      <section 
        onClick={() => onNavigate('classroom')}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold font-mono">
            <Presentation className="w-3.5 h-3.5" />
            <span>{isArabic ? 'وضع المعلم والشاشات الذكية' : 'Teacher Smartboard Mode'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {isArabic ? 'جاهز للشاشات التفاعلية وأجهزة العرض في الفصول' : 'Engineered for Classroom Projectors & Touch Displays'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isArabic
              ? 'واجهة ذات تباين بصري فائق، نصوص كبيرة واضحة، وأدوات عرض خطوة بخطوة لشرح التجارب العلمية للطلاب بوضوح تام.'
              : 'High-contrast visual mode with large readable typography and step-by-step tools built for classroom smartboards.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('classroom')}
          className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm shadow-xl shadow-amber-400/20 transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>{isArabic ? 'فتح السبورة الذكية الآن' : 'Launch Smartboard'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
};

export default Home;
