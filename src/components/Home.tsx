import React, { useState, useMemo } from 'react';
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
  Orbit,
  Zap,
  PlayCircle,
  Download,
  Sparkles
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
  onOpenOfflineModal?: () => void;
}

interface AIIntent {
  tab: string;
  matchedTerm: string;
  labNameEn: string;
  labNameAr: string;
  confidence: number;
}

// AI Smart Keyword Knowledge Base
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
    labNameEn: 'Smartboard Presentation & Classroom HUD',
    labNameAr: 'وضع الفصل والشاشات الذكية التفاعلية'
  }
];

export const Home: React.FC<HomeProps> = ({ onNavigate, onOpenOfflineModal }) => {
  const { t, isRTL, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // AI Intent Classifier: Analyzes natural query to detect student destination
  const detectedAIIntent: AIIntent | null = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return null;

    for (const rule of AI_SEARCH_RULES) {
      for (const kw of rule.keywords) {
        if (q.includes(kw.toLowerCase()) || kw.toLowerCase().includes(q)) {
          return {
            tab: rule.tab,
            matchedTerm: kw,
            labNameEn: rule.labNameEn,
            labNameAr: rule.labNameAr,
            confidence: 96,
          };
        }
      }
    }
    return null;
  }, [searchQuery]);

  const isArabic = language === 'ar';
  const isFrench = language === 'fr';
  const isGerman = language === 'de';

  const disciplines = [
    {
      id: 'anatomy',
      code: isArabic ? 'مختبر-01' : isFrench ? 'LAB-01' : isGerman ? 'LABOR-01' : 'SYS-01',
      title: t.features.anatomyTitle,
      desc: t.features.anatomyDesc,
      icon: Activity,
      spec: isArabic 
        ? '٢,٨٢١ بنية تشريحية · ٨ طبقات سريرية · مجسمات ثلاثية الأبعاد' 
        : isFrench 
          ? '2 821 structures anatomiques · 8 couches cliniques · 3D Draco'
          : isGerman 
            ? '2.821 anatomische Strukturen · 8 klinische Schichten · 3D Draco'
            : '2,821 Anatomical Structures · 8 Layers · Draco 3D',
      status: isArabic ? 'موثق علمياً' : isFrench ? 'VÉRIFIÉ' : isGerman ? 'GEPRÜFT' : 'VERIFIED',
    },
    {
      id: 'physics',
      code: isArabic ? 'مختبر-02' : isFrench ? 'LAB-02' : isGerman ? 'LABOR-02' : 'SYS-02',
      title: t.features.physicsTitle,
      desc: t.features.physicsDesc,
      icon: Atom,
      spec: isArabic 
        ? 'محلل دوائر MNA · المقذوفات · انكسار سنيل · محرك الموجات' 
        : isFrench 
          ? 'Solveur MNA · Projectiles · Optique de Snell · Moteur d’ondes'
          : isGerman 
            ? 'MNA-Schaltkreislöser · Projektile · Snellius-Optik · Wellenmotor'
            : 'MNA Circuit Solver · Projectiles · Snell Optics · Wave Engine',
      status: isArabic ? 'متصل ونشط' : isFrench ? 'EN LIGNE' : isGerman ? 'ONLINE' : 'ONLINE',
    },
    {
      id: 'chemistry',
      code: isArabic ? 'مختبر-03' : isFrench ? 'LAB-03' : isGerman ? 'LABOR-03' : 'SYS-03',
      title: t.features.chemistryTitle,
      desc: t.features.chemistryDesc,
      icon: Zap,
      spec: isArabic 
        ? '١١٨ عنصراً كيميائياً · مدارات بوهر ثلاثية الأبعاد · مجموعات ذرية' 
        : isFrench 
          ? '118 éléments IUPAC · Orbitales de Bohr 3D · Ions polyatomiques'
          : isGerman 
            ? '118 IUPAC-Elemente · 3D-Bohr-Orbitale · Polyatomare Ionen'
            : '118 IUPAC Elements · 3D Rotating Bohr Orbitals · Polyatomic Ions',
      status: isArabic ? 'مضبوط ومعاير' : isFrench ? 'ÉTALONNÉ' : isGerman ? 'KALIBRIERT' : 'CALIBRATED',
    },
    {
      id: 'biology',
      code: isArabic ? 'مختبر-04' : isFrench ? 'LAB-04' : isGerman ? 'LABOR-04' : 'SYS-04',
      title: t.features.biologyTitle,
      desc: t.features.biologyDesc,
      icon: Dna,
      spec: isArabic 
        ? 'خلايا نباتية وحيوانية · شريط الحمض النووي · كائنات دقيقة' 
        : isFrench 
          ? 'Cellules végétales et animales · Hélice d’ADN · Micro-organismes'
          : isGerman 
            ? 'Pflanzen- & Tierzellen · DNA-Doppelhelix · Mikroorganismen'
            : '3D Plant & Animal Cells · DNA Helix · Microorganisms',
      status: isArabic ? 'نشط وتفاعلي' : isFrench ? 'ACTIF' : isGerman ? 'AKTIV' : 'ACTIVE',
    },
    {
      id: 'geology',
      code: isArabic ? 'مختبر-05' : isFrench ? 'LAB-05' : isGerman ? 'LABOR-05' : 'SYS-05',
      title: t.features.geologyTitle,
      desc: t.features.geologyDesc,
      icon: Globe2,
      spec: isArabic 
        ? 'فيزياء الانهيار الزلزالي للمباني · اندفاع تسونامي · طبقات الأرض' 
        : isFrench 
          ? 'Physique de l’effondrement sismique · Tsunami 3D · Coupe de la Terre'
          : isGerman 
            ? 'Seismische Einsturzphysik · 3D-Tsunami · Erdaufbau'
            : 'Real Building Collapse Physics · 3D Tsunami Surge · Earth Cutaway',
      status: isArabic ? 'قيد الرصد' : isFrench ? 'SURVEILLANCE' : isGerman ? 'ÜBERWACHUNG' : 'MONITORING',
    },
    {
      id: 'astronomy',
      code: isArabic ? 'مختبر-06' : isFrench ? 'LAB-06' : isGerman ? 'LABOR-06' : 'SYS-06',
      title: t.features.astronomyTitle,
      desc: t.features.astronomyDesc,
      icon: Orbit,
      spec: isArabic 
        ? 'نظام شمسي ثلاثي الأبعاد · مدارات كوكبية · أطوار القمر · قوانين كبلر' 
        : isFrench 
          ? 'Système solaire 3D · Orbites planétaires · Phases lunaires · Kepler'
          : isGerman 
            ? '3D-Sonnensystem · Planetenbahnen · Mondphasen · Kepler-Gesetze'
            : '3D Solar System · Planetary Orbits · Annual Moon Phases · Keplerian Math',
      status: isArabic ? 'محسوب فلكياً' : isFrench ? 'CALCULÉ' : isGerman ? 'BERECHNET' : 'COMPUTED',
    },
    {
      id: 'classroom',
      code: isArabic ? 'مختبر-07' : isFrench ? 'LAB-07' : isGerman ? 'LABOR-07' : 'SYS-07',
      title: t.features.classroomTitle,
      desc: t.features.classroomDesc,
      icon: Presentation,
      spec: isArabic 
        ? 'وضع الشاشات الذكية وأجهزة العرض · تباين عالي · شروحات منظمة' 
        : isFrench 
          ? 'Mode projecteur pour tableau interactif · HUD contrasté · Étape par étape'
          : isGerman 
            ? 'Beamer-Modus für Smartboards · Hoher Kontrast · Schritt-für-Schritt'
            : 'Teacher Smartboard Projector Mode · High Contrast HUD · Step-by-Step',
      status: isArabic ? 'جاهز للعرض' : isFrench ? 'PRÊT' : isGerman ? 'BEREIT' : 'STANDBY',
    },
  ];

  const systemPillars = [
    {
      icon: Cpu,
      title: isArabic 
        ? 'محركات فيزيائية وحسابية فورية' 
        : isFrench 
          ? 'Moteurs physiques et de calcul en temps réel' 
          : isGerman 
            ? 'Echtzeit-Physik- & Berechnungsmotoren' 
            : 'Real-Time Physics & Nodal Engines',
      subtitle: isArabic 
        ? 'معادلات عقدية فورية ومحاكاة المقذوفات والموجات بمعدل ستين إطاراً في الثانية.' 
        : isFrench 
          ? 'Simulation à 60 ips — analyse nodale de circuits, optique de Snell et harmoniques d’ondes.' 
          : isGerman 
            ? '60-fps-Simulation — Schaltungsanalyse, Snellius-Optik und Wellenharmonik.' 
            : '60fps simulation — MNA circuit solving, Snell optics, and wave harmonics.',
    },
    {
      icon: Layers,
      title: isArabic 
        ? 'أطالس ثلاثية الأبعاد موثقة علمياً' 
        : isFrench 
          ? 'Précision des données scientifiques ouvertes' 
          : isGerman 
            ? 'Wissenschaftlich zertifizierte 3D-Daten' 
            : 'Open Scientific Data Fidelity',
      subtitle: isArabic 
        ? 'مجسمات تشريحية ثلاثية الأبعاد بدقة معتمدة وجدول العناصر الكيميائية الدولي المعتمد.' 
        : isFrench 
          ? 'Modèles 3D compressés Draco, conformité anatomique et données certifiées IUPAC.' 
          : isGerman 
            ? 'Draco-komprimierte 3D-Netze, anatomische Präzision und IUPAC-zertifizierte Daten.' 
            : 'Draco compressed 3D meshes, BodyParts3D 4.3, and certified IUPAC data.',
    },
    {
      icon: Database,
      title: isArabic 
        ? 'تعدد اللغات الكامل ووضع المعلم' 
        : isFrench 
          ? 'Support multilingue et affichage pour enseignants' 
          : isGerman 
            ? 'Vollständige Mehrsprachigkeit & Lehrer-HUD' 
            : 'Bilingual RTL & Classroom HUD',
      subtitle: isArabic 
        ? 'واجهات متكاملة تدعم التوجيه من اليمين إلى اليسار وعرض الشاشات الذكية التفاعلية.' 
        : isFrench 
          ? 'Alignement RTL/LTR complet et interface adaptée aux projecteurs de classe.' 
          : isGerman 
            ? 'Komplette RTL/LTR-Unterstützung und HUD-Präsentationsmodus für den Unterricht.' 
            : 'Native typography with dual-language RTL alignment across all modules.',
    },
    {
      icon: Terminal,
      title: isArabic 
        ? 'معامل افتراضية آمنة وبلا تكلفة' 
        : isFrench 
          ? 'Accès sécurisé aux laboratoires virtuels' 
          : isGerman 
            ? 'Virtuelle Labore ohne Ausfallzeiten' 
            : 'Zero-Downtime Virtual Lab Access',
      subtitle: isArabic 
        ? 'تجارب علمية تفاعلية تحل محل الأجهزة المعملية المكلفة وتلغي مخاطر التجارب الواقعية.' 
        : isFrench 
          ? 'Simulations interactives éliminant les risques de sécurité et le coût des équipements physiques.' 
          : isGerman 
            ? 'Interaktive Simulationen ersetzen gefährliche Chemikalien und teure Laborgeräte.' 
            : 'Accessible interactive simulations replacing risky or expensive physical equipment.',
    },
  ];

  const filteredDisciplines = disciplines.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.spec.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-24">
      
      {/* 1. TOP STATUS BANNER */}
      <div className="tech-status-banner">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white tracking-wide">
                {isArabic 
                  ? 'منظومة SciNexa العلمية تعمل بكفاءة تامة' 
                  : isFrench 
                    ? 'Matrice de Simulation SciNexa Opérationnelle' 
                    : isGerman 
                      ? 'SciNexa Simulationsmatrix Vollständig Betriebsbereit' 
                      : 'SciNexa Core Simulation Matrix Nominal'}
              </span>
              <span className="tech-badge tech-badge-emerald">
                {isArabic ? 'جاهز للعمل' : isFrench ? 'OPÉRATIONNEL' : isGerman ? 'BETRIEBSBEREIT' : 'HEALTHY'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {isArabic 
                ? 'جميع محركات المحاكاة الفيزيائية، الأطالس ثلاثية الأبعاد، نماذج الذرة، ومحاكاة الزلازل تعمل بدقة حسابية عالية.' 
                : isFrench 
                  ? 'Tous les solveurs physiques, maillages 3D, modèles de Bohr et simulations sismiques fonctionnent.' 
                  : isGerman 
                    ? 'Alle Physik-Solver, anatomischen 3D-Modelle, Bohr-Atome und Erdbebensimulationen einsatzbereit.' 
                    : 'All physics solvers, 3D anatomical meshes, chemistry Bohr models, and collapse physics operational.'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span className="font-mono text-xs text-slate-400">
            {isArabic 
              ? '٦٠ إطار/ثانية · استجابة فائقة السرعة' 
              : '60 FPS · LATENCY < 2ms'}
          </span>
          <button 
            onClick={() => onNavigate('physics')} 
            className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-white transition-colors"
          >
            {isArabic ? 'فحص المحركات العلمية ←' : isFrench ? 'Inspecter les solveurs →' : isGerman ? 'Solver prüfen →' : 'Inspect Solvers →'}
          </button>
        </div>
      </div>

      {/* 2. MAIN HERO SPLIT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        
        {/* LEFT COLUMN: Industrial Title & Metrics */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.1] text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest uppercase">
              {isArabic 
                ? `${t.hero.badge} · منظومة المحاكاة المتكاملة` 
                : isFrench 
                  ? `${t.hero.badge} · SYSTÈME SCIENTIFIQUE INTÉGRÉ` 
                  : isGerman 
                    ? `${t.hero.badge} · INTEGRIERTE WISSENSCHAFTSPLATTFORM` 
                    : `${t.hero.badge} · COMPREHENSIVE STEM`}
            </span>
          </div>

          {/* PROJECT NAME IN GIANT ENGLISH ONLY */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none font-mono">
              Sci<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">Nexa</span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-slate-200 tracking-tight leading-snug">
              {isArabic 
                ? 'منظومة المحاكاة العلمية والمختبرات الافتراضية التفاعلية' 
                : isFrench 
                  ? 'Plateforme de Simulation Scientifique et Laboratoires Virtuels' 
                  : isGerman 
                    ? 'Interaktive wissenschaftliche Simulationsplattform & Virtuelle Labore' 
                    : 'Interactive Science Simulation Matrix & Virtual Laboratories'}
            </p>
          </div>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
            {t.hero.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('physics')}
              className="btn-silver-primary"
            >
              <PlayCircle className="w-4 h-4 text-black" />
              <span>{isArabic ? 'تشغيل منصة المحاكاة' : isFrench ? 'Démarrer la simulation' : isGerman ? 'Simulation starten' : 'Launch Simulation Engine'}</span>
            </button>

            <button
              onClick={() => onNavigate('anatomy')}
              className="btn-silver-secondary"
            >
              <Activity className="w-4 h-4 text-slate-300" />
              <span>{isArabic ? 'استكشاف الأطلس الطبي' : isFrench ? 'Explorer l’anatomie 3D' : isGerman ? 'Anatomie-Atlas öffnen' : 'Inspect Anatomy Atlas'}</span>
            </button>

            {onOpenOfflineModal && (
              <button
                onClick={onOpenOfflineModal}
                className="btn-silver-secondary border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{isArabic ? 'تحميل المنصة للعمل بدون إنترنت' : isFrench ? 'Télécharger hors-ligne' : isGerman ? 'Offline herunterladen' : 'Offline Download'}</span>
              </button>
            )}
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08] max-w-lg">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {isArabic ? 'البنى التشريحية' : isFrench ? 'STRUCTURES 3D' : isGerman ? 'STRUKTUREN' : 'ANATOMY ENTITIES'}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                {isArabic ? '٢,٨٢١+' : '2,821+'}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {isArabic ? 'العناصر الكيميائية' : isFrench ? 'ÉLÉMENTS IUPAC' : isGerman ? 'ELEMENTE' : 'IUPAC ELEMENTS'}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                {isArabic ? '١١٨' : '118'}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {isArabic ? 'معدل التحديث' : isFrench ? 'FRÉQUENCE IPS' : isGerman ? 'BILDWIEDERHOLUNG' : 'SOLVER TICK'}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                {isArabic ? '٦٠ إطار/ث' : '60 FPS'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Stacked Industrial Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-4 h-[1px] bg-white/20" />
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              {isArabic 
                ? 'الركائز والمعمارية الهندسية للمنظومة' 
                : isFrench 
                  ? 'PILIER DU SYSTÈME & ARCHITECTURE' 
                  : isGerman 
                    ? 'SYSTEMPFEILER & ARCHITEKTUR' 
                    : 'SYSTEM PILLARS & ARCHITECTURE'}
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

          {/* Interactive Live Banner Box */}
          <div className="relative overflow-hidden rounded-xl border border-white/15 bg-gradient-to-r from-[#070b14] to-[#0d1627] p-4 text-white flex items-center justify-between">
            <div className="space-y-1">
              <span className="tech-badge tech-badge-emerald text-[9px]">
                {isArabic ? 'القياسات الفيزيائية اللحظية نشطة' : isFrench ? 'TÉLÉMÉTRIE EN DIRECT' : isGerman ? 'LIVE-TELEMETRIE AKTIV' : 'LIVE TELEMETRY ACTIVE'}
              </span>
              <div className="text-xs font-bold font-mono">
                {isArabic 
                  ? 'محاكاة انهيار المباني وفيزياء الأمواج' 
                  : isFrench 
                    ? 'Effondrement 3D & Physique des Vagues' 
                    : isGerman 
                      ? '3D-Gebäudeeinsturz & Wellenphysik' 
                      : '3D Building Collapse & Wave Physics'}
              </div>
              <p className="text-[10px] text-slate-400">
                {isArabic 
                  ? 'عتبات الانهيار بمقياس ريختر والسحب الهيدروديناميكي لأمواج التسونامي' 
                  : isFrench 
                    ? 'Seuils sismiques de Richter & poussée hydrodynamique de tsunami' 
                    : isGerman 
                      ? 'Richter-Einsturzgrenzen & hydrodynamischer Tsunami-Schub' 
                      : 'Richter failure thresholds & hydrodynamic tsunami drag'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('geology')}
              className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold font-mono hover:bg-slate-200 transition-colors"
            >
              {isArabic ? 'تجربة المحاكاة' : isFrench ? 'TESTER' : isGerman ? 'TESTEN' : 'RUN TEST'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. AI SMART SEARCH & MATRIX SECTION HEADER */}
      <div className="pt-8 border-t border-white/[0.08] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                {isArabic 
                  ? 'المختبرات العلمية والمعامل التفاعلية' 
                  : isFrench 
                    ? 'LABORATOIRES VIRTUELS STEM' 
                    : isGerman 
                      ? 'VIRTUELLE STEM-LABORE' 
                      : 'STEM VIRTUAL LABORATORIES'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              {t.features.sectionTitle}
            </h2>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && detectedAIIntent) {
                  onNavigate(detectedAIIntent.tab);
                }
              }}
              placeholder={isArabic ? 'ابحث في المعامل (مثل: قلب، أميبا، تسونامي، كواكب، عناصر)...' : 'Search labs (e.g. heart, amoeba, tsunami, moon, atom)...'}
              className="w-full bg-[#08090c] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            />
          </div>
        </div>

        {/* AI Intent Detection Interactive Banner */}
        {detectedAIIntent && (
          <div 
            onClick={() => onNavigate(detectedAIIntent.tab)}
            className="cursor-pointer p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-400/50 flex items-center justify-between text-white shadow-lg shadow-cyan-500/10 hover:border-cyan-300 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-cyan-400 block font-bold">
                  {isArabic ? '🔍 اقتراح الانتقال المباشر للمختبر:' : '🔍 Direct Lab Navigation:'}
                </span>
                <span className="text-xs font-bold text-white">
                  {isArabic 
                    ? `الانتقال إلى ${detectedAIIntent.labNameAr} بناءً على "${detectedAIIntent.matchedTerm}"`
                    : `Query "${detectedAIIntent.matchedTerm}" → Navigate to ${detectedAIIntent.labNameEn}`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/30">
              <span>{isArabic ? 'انتقال فوري' : 'Launch'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* AI Quick Query Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
          <span className="text-slate-500 text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{isArabic ? 'استكشاف سريع:' : isFrench ? 'Accès rapide :' : isGerman ? 'Schnellzugriff:' : 'Quick Jump:'}</span>
          </span>
          {[
            { label: isArabic ? '🫀 تشريح القلب والرئتين' : '🫀 Heart & Lungs', tab: 'anatomy' },
            { label: isArabic ? '⚡ الدوائر والموجات' : '⚡ Circuits & Waves', tab: 'physics' },
            { label: isArabic ? '🧪 الذرة والجدول الدوري' : '🧪 Atom & Elements', tab: 'chemistry' },
            { label: isArabic ? '🔬 الأحياء والكائنات الدقيقة' : '🔬 Cells & Microorganisms', tab: 'biology' },
            { label: isArabic ? '🌋 انهيار المباني والتسونامي' : '🌋 Earthquake Collapse', tab: 'geology' },
            { label: isArabic ? '🪐 النظام الشمسي وأطوار القمر' : '🪐 Solar System & Moon', tab: 'astronomy' },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(chip.tab)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.08] text-slate-300 transition-all text-[11px]"
            >
              {chip.label}
            </button>
          ))}
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
                      {isArabic ? 'مختبر علمي متكامل' : isFrench ? 'SUITE VIRTUELLE' : isGerman ? 'VIRTUELLES LABOR' : 'VIRTUAL LAB SUITE'}
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
export default Home;