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
  Play,
  CheckCircle2,
  Mic,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  Tv,
  Compass,
  Radio
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
    labNameAr: 'أطلس تشريح جسم الإنسان 3D'
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
    labNameAr: 'الجدول الدوري ونماذج الذرة 3D'
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

  // The 6 Signature Apple iOS App Widgets
  const labWidgets = [
    {
      id: 'anatomy',
      title: isArabic ? 'أطلس التشريح البشري 3D' : 'Human Anatomy Atlas 3D',
      category: isArabic ? 'العلوم الطبية والتشريح' : 'Medical Science',
      subtitle: isArabic ? 'أكثر من 2,821 عضواً وبنية طبية حقيقية' : '2,821+ High-Precision 3D Entities',
      description: isArabic 
        ? 'تشريح تفاعلي معتمد: العظام، العضلات، القلب والشرايين، الدماغ والأعصاب، والأعضاء الحشوية مع ميزة العزل 3D.'
        : 'Medical 3D anatomy: skeleton, muscular system, heart & vessels, nervous system, and visceral organs with 3D isolation.',
      icon: Activity,
      gradient: 'linear-gradient(135deg, #FF2D55, #FF3B30)',
      shadowColor: 'rgba(255, 45, 85, 0.4)',
      badge: isArabic ? 'أطلس طبي معتمد' : 'Medical Grade',
      features: isArabic 
        ? ['7 أجهزة تشريحية عميقة', 'فحص وعزل أي عضو', 'شرح طبي وفسيولوجي فوري'] 
        : ['7 Deep Systems', 'Organ 3D Isolation', 'Instant Clinical Explanations']
    },
    {
      id: 'physics',
      title: isArabic ? 'الفيزياء والدوائر والموجات' : 'Physics & Circuits 3D',
      category: isArabic ? 'العلوم الفيزيائية والكهرباء' : 'Physics & Electricity',
      subtitle: isArabic ? 'الدوائر الكهربائية، القوى والمقذوفات، والأمواج' : 'DC Circuits, Dynamics & Wave Optics',
      description: isArabic 
        ? 'ركّب الدوائر الكهربائية، اختبر قانون أوم والمقاومات في الوقت الفعلي، أطلق المقذوفات بزوايا مختلفة، وشاهد انتشار الموجات.'
        : 'Construct live DC circuits, solve Ohm & Kirchhoff laws in real-time, launch projectiles, and simulate wave harmonics.',
      icon: Zap,
      gradient: 'linear-gradient(135deg, #007AFF, #5856D6)',
      shadowColor: 'rgba(0, 122, 255, 0.4)',
      badge: isArabic ? 'محاكاة فيزيائية حية' : 'Real-Time Physics',
      features: isArabic 
        ? ['دوائر كهربائية DC تفاعلية', 'محاكي المقذوفات وقوانين نيوتن', 'محاكاة الموجات وانكسار الضوء'] 
        : ['Live DC Circuit Workbench', 'Forces & Projectile Engine', 'Wave & Optics Harmonics']
    },
    {
      id: 'chemistry',
      title: isArabic ? 'الجدول الدوري وبنية الذرة 3D' : 'Periodic Table & Atoms 3D',
      category: isArabic ? 'العلوم الكيميائية والمادة' : 'Chemical Sciences',
      subtitle: isArabic ? '118 عنصراً كيميائياً وتفاعلات PraxiLabs' : '118 Elements & PraxiLabs Reactions',
      description: isArabic 
        ? 'استكشف العناصر الـ 118 مع دوران الإلكترونات في مدارات بوهر 3D، وتفاعلات المحاليل الكيميائية والمجموعات الذرية.'
        : 'Explore 118 elements with real-time 3D Bohr electron orbitals, chemical reactions, and polyatomic ionic radicals.',
      icon: Atom,
      gradient: 'linear-gradient(135deg, #FF9500, #FF3B30)',
      shadowColor: 'rgba(255, 149, 0, 0.4)',
      badge: isArabic ? 'الجدول الدوري الشامل' : '118 IUPAC Elements',
      features: isArabic 
        ? ['توزيع الإلكترونات في مدارات بوهر', 'معمل PraxiLabs للتفاعلات الكيميائية', 'المجموعات الذرية ثلاثية الأبعاد'] 
        : ['3D Bohr Orbitals', 'PraxiLabs Reaction Simulator', 'Polyatomic Radicals 3D']
    },
    {
      id: 'biology',
      title: isArabic ? 'الأحياء والخلية والوراثة' : 'Biology & Living Cells 3D',
      category: isArabic ? 'علوم الأحياء والميكروسكوب' : 'Biological Sciences',
      subtitle: isArabic ? 'مجسم الخلية الحقيقي، الكائنات الدقيقة، و DNA' : '3D Realistic Cell & DNA Helix',
      description: isArabic 
        ? 'انظر عبر المجهر إلى الخلية الحية ومكوناتها، راقب حركة الأميبا واليوجلينا والبراميسيوم، وفكك شريط الحمض النووي DNA.'
        : 'Look through the virtual microscope into 3D cells, observe live unicellular microorganisms, and unpack the DNA double-helix.',
      icon: Dna,
      gradient: 'linear-gradient(135deg, #34C759, #00C7BE)',
      shadowColor: 'rgba(52, 199, 89, 0.4)',
      badge: isArabic ? 'أحياء مجهرية 3D' : '3D Microscopy',
      features: isArabic 
        ? ['مجسم ثلاثي الأبعاد حقيقي للخلية', 'كائنات مجهرية (أميبا، يوجلينا، براميسيوم)', 'شريط الحمض النووي DNA التفاعلي'] 
        : ['Realistic 3D Cell Model', 'Microorganisms Laboratory', '3D Animated DNA Double Helix']
    },
    {
      id: 'geology',
      title: isArabic ? 'علوم الأرض ومحاكاة الزلازل' : 'Geology & Seismic Collapse',
      category: isArabic ? 'علوم الأرض والمنشآت' : 'Geology & Seismology',
      subtitle: isArabic ? 'الزلازل بمقياس ريختر، أمواج تسونامي، وباطن الأرض' : 'Richter Quakes, Tsunami & Earth Cutaway',
      description: isArabic 
        ? 'اختبر متانة المباني تحت قوى الهزات الأرضية والزلازل الحية واندفاع موجات التسونامي، واستكشف مقطع باطن الأرض 3D.'
        : 'Test real structural stability and building collapse physics under Richter earthquakes and tsunami surges with 3D Earth layers.',
      icon: Globe2,
      gradient: 'linear-gradient(135deg, #AF52DE, #5856D6)',
      shadowColor: 'rgba(175, 82, 222, 0.4)',
      badge: isArabic ? 'محاكاة كوارث 3D' : 'Seismic Physics',
      features: isArabic 
        ? ['محاكاة انهيار المباني الحية', 'اندفاع قوى تسونامي الهيدروديناميكية', 'مقطع طبقات باطن الأرض ثلاثي الأبعاد'] 
        : ['Real Building Collapse Physics', 'Tsunami Surge Hydrodynamics', '3D Earth Interior Cutaway']
    },
    {
      id: 'astronomy',
      title: isArabic ? 'علم الفلك والنظام الشمسي 3D' : 'Astronomy & Solar System 3D',
      category: isArabic ? 'علوم الفضاء والكواكب' : 'Space & Planetary Science',
      subtitle: isArabic ? 'مدارات الكواكب، أطوار القمر، وقوانين كيبلر' : 'Planetary Orbits, Moon Phases & Kepler',
      description: isArabic 
        ? 'انطلق في رحلة فضائية بين كواكب المجموعة الشمسية بدقة مدارية حقيقية، راقب دورة أطوار القمر الـ 8 في 3D، وتعرف على قوانين كيبلر.'
        : 'Journey through the real 3D solar system with precise Keplerian orbital mechanics, explore the 8 lunar phases, and learn cosmic laws.',
      icon: Sparkles,
      gradient: 'linear-gradient(135deg, #5856D6, #007AFF)',
      shadowColor: 'rgba(88, 86, 214, 0.4)',
      badge: isArabic ? 'ميكانيكا الفضاء 3D' : 'Orbital Mechanics',
      features: isArabic 
        ? ['كواكب المجموعة الشمسية ثلاثية الأبعاد', 'أطوار القمر التفاعلية الثمانية', 'قوانين كيبلر والجاذبية الكونية'] 
        : ['Real 3D Solar System', 'Interactive 8 Moon Phases', 'Kepler & Gravity Laws']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-28 pt-3" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* ── 1. APPLE iOS SPOTLIGHT SEARCH BAR ── */}
      <section className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8E8E93] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && detectedAIIntent) {
                onNavigate(detectedAIIntent.tab);
              }
            }}
            placeholder={isArabic ? 'بحث Spotlight: اكتب اسم أي عضو، عنصر كيميائي، أو تجربة علمية...' : 'Spotlight: Search any organ, element, circuit, or celestial body...'}
            className="w-full bg-transparent text-white placeholder-[#8E8E93] text-sm sm:text-base outline-none font-medium"
          />
          <Mic className="w-4 h-4 text-[#8E8E93] shrink-0 hidden sm:block" />
        </div>

        {/* Instant Detection Alert (iOS Notification Banner style) */}
        {detectedAIIntent && (
          <div 
            onClick={() => onNavigate(detectedAIIntent.tab)}
            className="cursor-pointer p-3 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-white/10 flex items-center justify-between text-white transition-all active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-[8px] ios-squircle flex items-center justify-center text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
              >
                <Play className="w-4 h-4 fill-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#007AFF] block">
                  {isArabic ? 'الانتقال المباشر للمعمل:' : 'Spotlight Match:'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {isArabic 
                    ? `انقر هنا للانتقال فوراً إلى ${detectedAIIntent.labNameAr}`
                    : `Click to navigate to ${detectedAIIntent.labNameEn}`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-white bg-[#007AFF] px-3 py-1.5 rounded-full shadow-md">
              <span>{isArabic ? 'فتح' : 'Open'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[#8E8E93] text-xs font-semibold">
            {isArabic ? 'مقترحات سريعة:' : 'Quick Jump:'}
          </span>
          {[
            { label: isArabic ? '🫀 تشريح القلب' : '🫀 Heart Anatomy', tab: 'anatomy' },
            { label: isArabic ? '⚡ دوائر الكهرباء' : '⚡ DC Circuits', tab: 'physics' },
            { label: isArabic ? '🧪 ذرة الهيدروجين' : '🧪 Hydrogen Atom', tab: 'chemistry' },
            { label: isArabic ? '🔬 الخلية المجهرية' : '🔬 3D Cell Specimen', tab: 'biology' },
            { label: isArabic ? '🌋 محاكاة الزلازل' : '🌋 Earthquake Collapse', tab: 'geology' },
            { label: isArabic ? '🪐 أطوار القمر' : '🪐 Moon Phases', tab: 'astronomy' },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(chip.tab)}
              className="px-2.5 py-1 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white border border-white/5 transition-all text-xs font-medium cursor-pointer active:scale-95"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 2. APPLE HERO SECTION (Clean, Typographic, Inviting) ── */}
      <section className="bg-[#1C1C1E] border border-white/10 rounded-[28px] p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
        {/* Soft Apple Light Refraction */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#007AFF]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#AF52DE]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          {/* iOS Category Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-bold text-white border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            <span>{isArabic ? 'منصة المختبرات العلمية والمحاكاة التفاعلية 3D' : 'Interactive 3D Virtual Science Suite'}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#007AFF] text-white text-[10px] font-bold">
              ISEF 2026
            </span>
          </div>

          {/* Large Apple Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            {isArabic ? (
              <>
                مختبرات العلوم التفاعلية 3D <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] via-[#30B0C7] to-[#34C759]">
                  صُممت لتجربة علمية فائقة السلاسة
                </span>
              </>
            ) : (
              <>
                Interactive 3D Science Suite <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] via-[#30B0C7] to-[#34C759]">
                  Engineered for Pure Scientific Discovery
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-[#8E8E93] text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
            {isArabic
              ? 'بيئة تعليمية متكاملة تواكب أحدث المعايير: تفكيك وعزل 2,821 عضواً بشرياً، تركيب دوائر الكهرباء، تفاعلات الجدول الدوري، محاكاة انهيار المباني والزلازل، ومساعد صوتي ذكي باللغة العربية.'
              : 'A certified virtual science suite: inspect 2,821 anatomical structures, wire electronic circuits, solve 118 elements, simulate structural earthquake collapses, and speak directly with Arabic voice AI.'}
          </p>

          {/* Apple Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('anatomy')}
              className="ios-btn-primary active:scale-95 duration-150"
            >
              <Activity className="w-4 h-4" />
              <span>{isArabic ? 'ابدأ بأطلس التشريح البشري' : 'Launch Anatomy Atlas'}</span>
            </button>

            <button
              onClick={() => onNavigate('physics')}
              className="ios-btn-secondary active:scale-95 duration-150"
            >
              <Zap className="w-4 h-4 text-[#007AFF]" />
              <span>{isArabic ? 'مختبر الفيزياء والكهرباء' : 'Explore Physics Lab'}</span>
            </button>

            <button
              onClick={() => onNavigate('classroom')}
              className="px-6 py-3 rounded-full bg-[#FF9500]/20 hover:bg-[#FF9500]/30 text-[#FF9500] border border-[#FF9500]/40 font-bold text-sm flex items-center gap-2 active:scale-95 duration-150 transition-all cursor-pointer"
            >
              <Presentation className="w-4 h-4 text-[#FF9500]" />
              <span>{isArabic ? 'السبورة التفاعلية للمعلم' : 'Smartboard Presentation'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. APPLE "HOW TO USE" 3-STEP GUIDE (Apple Tips Style) ── */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>{isArabic ? 'كيف تبدأ استخدام المنصة؟ 3 خطوات بسيطة' : 'Getting Started: 3 Simple Steps'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-3 shadow-lg">
            <div 
              className="w-10 h-10 rounded-[10px] ios-squircle flex items-center justify-center text-white font-bold text-base shadow-md"
              style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
            >
              1
            </div>
            <h3 className="text-base font-bold text-white">
              {isArabic ? 'اختر المعمل العلمي' : '1. Select Your Lab'}
            </h3>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              {isArabic
                ? 'انقر على أي معمل من المعامل الستة في الأسفل (التشريح، الفيزياء، الكيمياء، الأحياء، الجيولوجيا، أو الفلك).'
                : 'Choose any of the 6 specialized laboratories below to enter instantly with zero loading friction.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-3 shadow-lg">
            <div 
              className="w-10 h-10 rounded-[10px] ios-squircle flex items-center justify-center text-white font-bold text-base shadow-md"
              style={{ background: 'linear-gradient(135deg, #34C759, #00C7BE)' }}
            >
              2
            </div>
            <h3 className="text-base font-bold text-white">
              {isArabic ? 'تفاعل وتحكّم بالمجسمات 3D' : '2. Interact in Real 3D'}
            </h3>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              {isArabic
                ? 'استخدم الماوس أو شاشة اللمس لتدوير النماذج، عزل الأعضاء، بناء الدوائر الكهربائية، أو اختبار الزلازل.'
                : 'Rotate, zoom, isolate body parts, build electronic circuits, or trigger live earthquake collapse simulations.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-3 shadow-lg">
            <div 
              className="w-10 h-10 rounded-[10px] ios-squircle flex items-center justify-center text-white font-bold text-base shadow-md"
              style={{ background: 'linear-gradient(135deg, #FF9500, #FF3B30)' }}
            >
              3
            </div>
            <h3 className="text-base font-bold text-white">
              {isArabic ? 'تحدث مع المرشد داروين' : '3. Speak with Darwin AI'}
            </h3>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              {isArabic
                ? 'اضغط على زر داروين الصوتي أسفل الشاشة واسأله بصوتك عن أي مفهوم وسيرشدك فوراً.'
                : 'Click the voice assistant icon in the bottom corner and talk freely to learn and navigate directly.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. THE 6 SIGNATURE LABS (Apple App Widgets Grid) ── */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-bold text-[#007AFF] uppercase tracking-wider block mb-1">
            {isArabic ? 'المعامل العلمية المعتمدة' : 'Official Virtual Laboratories'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isArabic ? 'المعامل العلمية الستة' : 'The 6 Core Virtual Laboratories'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labWidgets.map((widget) => {
            const Icon = widget.icon;
            return (
              <div
                key={widget.id}
                onClick={() => onNavigate(widget.id)}
                className="group bg-[#1C1C1E] hover:bg-[#242426] border border-white/10 hover:border-white/20 rounded-[28px] p-6 shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between active:scale-[0.98]"
              >
                <div className="space-y-4">
                  {/* Top Row: Authentic Apple App Icon Squircle + Action Pill */}
                  <div className="flex items-center justify-between">
                    <div 
                      className="w-14 h-14 rounded-[14px] ios-squircle flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-105"
                      style={{ 
                        background: widget.gradient,
                        boxShadow: `0 6px 20px ${widget.shadowColor}`
                      }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(widget.id);
                      }}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 group-hover:bg-[#007AFF] text-[#007AFF] group-hover:text-white uppercase tracking-wider transition-all active:scale-95"
                    >
                      {isArabic ? 'فتح' : 'OPEN'}
                    </button>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                      {widget.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                      {widget.title}
                    </h3>
                    <p className="text-xs text-[#8E8E93] mt-1 font-medium">
                      {widget.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {widget.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    {widget.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Badge */}
                <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#8E8E93]">
                    {widget.badge}
                  </span>
                  <span className="text-xs font-bold text-[#007AFF] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{isArabic ? 'دخول المعمل' : 'Launch'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. APPLE KEYNOTE CLASSROOM MODE CARD ── */}
      <section 
        onClick={() => onNavigate('classroom')}
        className="p-6 sm:p-8 rounded-[28px] bg-[#1C1C1E] border border-white/10 hover:border-[#FF9500]/50 transition-all cursor-pointer shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 active:scale-[0.99]"
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-14 h-14 rounded-[14px] ios-squircle flex items-center justify-center text-white shrink-0 shadow-xl"
            style={{ 
              background: 'linear-gradient(135deg, #FFCC00, #FF9500)',
              boxShadow: '0 6px 20px rgba(255, 149, 0, 0.4)'
            }}
          >
            <Presentation className="w-7 h-7 text-white" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[#FF9500] uppercase tracking-wider block">
              {isArabic ? 'وضع المعلم والشاشات الذكية' : 'Teacher Smartboard Mode'}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {isArabic ? 'السبورة التفاعلية لشاشات الفصول وأجهزة العرض' : 'Engineered for Classroom Touchscreens & Projectors'}
            </h3>
            <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
              {isArabic
                ? 'واجهة ذات تباين فائق، نصوص كبيرة واضحة، وأدوات عرض خطوة بخطوة لشرح التجارب العلمية للطلاب بوضوح تام.'
                : 'High-contrast presentation mode with large typography and step-by-step tools built for classroom smartboards.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('classroom')}
          className="px-6 py-2.5 rounded-full bg-[#FF9500] hover:bg-[#FF8500] text-black font-bold text-xs sm:text-sm shadow-lg shadow-[#FF9500]/30 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <span>{isArabic ? 'فتح السبورة الذكية' : 'Open Smartboard'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
};

export default Home;
