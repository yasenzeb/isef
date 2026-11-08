/**
 * localAI.ts — deterministic, frontend-only test assistant.
 * No network calls, no API keys, no external services.
 * Every answer is pre-written domain guidance; it is not a real model.
 */

export interface LocalReply {
  textEn: string;
  textAr: string;
  link?: { to: string; labelEn: string; labelAr: string };
  suggestionsEn?: string[];
  suggestionsAr?: string[];
}

interface Rule {
  keys: string[];
  reply: LocalReply;
}

const RULES: Rule[] = [
  {
    keys: [
      'heart', 'brain', 'nerve', 'skull', 'bone', 'muscle', 'anatomy', 'organ', 'skeleton', 'digestive', 'nervous', 'kidney', 'lung',
      'قلب', 'دماغ', 'مخ', 'عصب', 'جمجمة', 'عظم', 'عضلة', 'تشريح', 'عضو', 'هيكل', 'جهاز عصبي', 'كلية', 'رئة', 'هضم',
    ],
    reply: {
      textEn:
        'The Human Anatomy Atlas contains 2,821 structures across seven systems (skeletal, muscular, cardiovascular, nervous, visceral, joints and more). In the lab you can rotate the model, isolate a single organ, and read its clinical note. The atlas is a 3D GLB scene, so it needs WebGL enabled in the browser.',
      textAr:
        'أطلس التشريح البشري يحتوي على ٢٬٨٢١ بنية موزعة على سبعة أجهزة (الهيكلي، العضلي، القلبي الوعائي، العصبي، الحشوي، المفاصل وغيرها). داخل المعمل يمكنك تدوير المجسم وعزل عضو واحد وقراءة شرحه السريري. الأطلس مبني بنماذج GLB ثلاثية الأبعاد ويحتاج WebGL مفعّلًا في المتصفح.',
      link: { to: '/app/labs/anatomy', labelEn: 'Open anatomy lab', labelAr: 'افتح معمل التشريح' },
      suggestionsEn: ['How many systems are in the atlas?', 'Open the chemistry lab'],
      suggestionsAr: ['كم عدد الأجهزة في الأطلس؟', 'افتح معمل الكيمياء'],
    },
  },
  {
    keys: [
      'physics', 'circuit', 'ohm', 'kirchhoff', 'resistor', 'voltage', 'current', 'projectile', 'motion', 'force', 'wave', 'optics', 'light', 'refraction',
      'فيزياء', 'دائرة', 'أوم', 'كيرشوف', 'مقاومة', 'جهد', 'تيار', 'مقذوف', 'حركة', 'قوة', 'موجة', 'بصريات', 'ضوء', 'انكسار',
    ],
    reply: {
      textEn:
        'The physics lab combines a DC circuit bench (Ohm and Kirchhoff laws), a projectile and forces engine, wave harmonics and ray optics. The PhET simulations for circuits, forces, projectiles and bending light are stored locally under /public/simulations, so they do not need a CDN.',
      textAr:
        'معمل الفيزياء يجمع منصة دوائر التيار المستمر (قانون أوم وكيرشوف)، ومحرك المقذوفات والقوى، والموجات، والبصريات الهندسية. محاكيات PhET للدوائر والقوى والمقذوفات وانكسار الضوء محفوظة محليًا داخل /public/simulations ولا تحتاج شبكة خارجية.',
      link: { to: '/app/labs/physics', labelEn: 'Open physics lab', labelAr: 'افتح معمل الفيزياء' },
      suggestionsEn: ['Explain Ohm law', 'Open the astronomy lab'],
      suggestionsAr: ['اشرح قانون أوم', 'افتح معمل الفلك'],
    },
  },
  {
    keys: [
      'chemistry', 'element', 'periodic', 'atom', 'bohr', 'proton', 'electron', 'neutron', 'reaction', 'acid', 'base', 'mole',
      'كيمياء', 'عنصر', 'جدول دوري', 'ذرة', 'بوهر', 'بروتون', 'إلكترون', 'نيوترون', 'تفاعل', 'حمض', 'قاعدة', 'مول',
    ],
    reply: {
      textEn:
        'The chemistry lab has all 118 IUPAC elements, 3D Bohr orbitals, polyatomic radicals and a guided reaction simulator. Select an element from the periodic table to inspect its configuration, then open the reaction bench to combine reagents.',
      textAr:
        'معمل الكيمياء يحتوي على عناصر IUPAC الـ ١١٨، ومدارات بوهر ثلاثية الأبعاد، والمجموعات الذرية، ومحاكي تفاعلات موجه. اختر عنصرًا من الجدول الدوري لفحص توزيعه الإلكتروني، ثم افتح منصة التفاعلات لدمج المواد.',
      link: { to: '/app/labs/chemistry', labelEn: 'Open chemistry lab', labelAr: 'افتح معمل الكيمياء' },
      suggestionsEn: ['Show the periodic table', 'What is in the biology lab?'],
      suggestionsAr: ['اعرض الجدول الدوري', 'ماذا يوجد في معمل الأحياء؟'],
    },
  },
  {
    keys: [
      'biology', 'cell', 'dna', 'gene', 'mitochondria', 'nucleus', 'microscope', 'amoeba', 'euglena', 'bacteria',
      'أحياء', 'خلية', 'dna', 'وراثة', 'ميتوكوندريا', 'نواة', 'مجهر', 'أميبا', 'يوجلينا', 'بكتيريا',
    ],
    reply: {
      textEn:
        'The biology lab walks through a realistic 3D cell, its organelles, live unicellular specimens and the DNA double helix. The cell and organelles are generated with Three.js geometry; some molecular models open as embedded Sketchfab scenes, which need an internet connection.',
      textAr:
        'معمل الأحياء يستعرض خلية ثلاثية الأبعاد واقعية وعضياتها والكائنات الدقيقة الحية ولولب DNA. الخلية والعضيات مبنية بهندسة Three.js، وبعض النماذج الجزيئية تُفتح كـ Sketchfab مدمج وتحتاج اتصالًا بالإنترنت.',
      link: { to: '/app/labs/biology', labelEn: 'Open biology lab', labelAr: 'افتح معمل الأحياء' },
      suggestionsEn: ['Open the geology lab', 'Show my progress'],
      suggestionsAr: ['افتح معمل الجيولوجيا', 'اعرض تقدمي'],
    },
  },
  {
    keys: [
      'geology', 'earthquake', 'richter', 'tsunami', 'seismic', 'fault', 'building', 'collapse', 'earth', 'crust', 'mantle',
      'جيولوجيا', 'زلزال', 'ريختر', 'تسونامي', 'زلزالي', 'صدع', 'مبنى', 'انهيار', 'أرض', 'قشرة', 'وشاح',
    ],
    reply: {
      textEn:
        'The geology lab simulates Richter-scaled earthquakes, tsunami surge speed and structural collapse. The earth cutaway shows crust, mantle and core, while the structural solver estimates how a building responds to a seismic wave. The building models are local GLB files.',
      textAr:
        'معمل الجيولوجيا يحاكي زلازل بمقياس ريختر وسرعة موجات التسونامي وانهيار المنشآت. مقطع الأرض يعرض القشرة والوشاح واللب، ومحرك الإنشاءات يقدّر استجابة المبنى للموجة الزلزالية. نماذج المباني ملفات GLB محلية.',
      link: { to: '/app/labs/geology', labelEn: 'Open geology lab', labelAr: 'افتح معمل الجيولوجيا' },
      suggestionsEn: ['Open the astronomy lab', 'How does curriculum work?'],
      suggestionsAr: ['افتح معمل الفلك', 'كيف يعمل المنهج؟'],
    },
  },
  {
    keys: [
      'astronomy', 'space', 'solar', 'planet', 'moon', 'orbit', 'kepler', 'sun', 'mars', 'jupiter', 'saturn',
      'فلك', 'فضاء', 'شمسي', 'كوكب', 'قمر', 'مدار', 'كبلر', 'شمس', 'مريخ', 'مشتري', 'زحل',
    ],
    reply: {
      textEn:
        'The astronomy lab presents a 3D solar system with Keplerian orbits, lunar phases and gravity demonstrations. Orbital positions are calculated from the planet data, while the visual solar-system scene is an embedded Sketchfab model.',
      textAr:
        'معمل الفلك يعرض نظامًا شمسيًا ثلاثي الأبعاد بمدارات كبلر وأطوار القمر وعروض الجاذبية. تُحسب مواقع الكواكب من بياناتها، بينما مشهد النظام الشمسي المرئي نموذج Sketchfab مدمج.',
      link: { to: '/app/labs/astronomy', labelEn: 'Open astronomy lab', labelAr: 'افتح معمل الفلك' },
      suggestionsEn: ['Show all labs', 'Explain the curriculum'],
      suggestionsAr: ['اعرض كل المعامل', 'اشرح المنهج'],
    },
  },
  {
    keys: ['curriculum', 'lesson', 'grade', 'syllabus', 'exam', 'assessment', 'منهج', 'درس', 'صف', 'تقييم', 'امتحان'],
    reply: {
      textEn:
        'The curriculum page maps Ministry textbook units to a 3D lab, a verified video and a weekly assessment. Choose a grade on the left, then press “Lab”, “Video” or “Quiz” on any lesson. Completed quizzes add XP and stars and are saved in this browser.',
      textAr:
        'صفحة المناهج تربط وحدات كتاب الوزارة بمعمل ثلاثي الأبعاد وفيديو موثّق وتقييم أسبوعي. اختر الصف من اليسار، ثم اضغط «معمل» أو «فيديو» أو «تقييم» في أي درس. التقييمات المكتملة تضيف نقاطًا ونجومًا وتُحفظ في هذا المتصفح.',
      link: { to: '/app/curriculum', labelEn: 'Open curriculum', labelAr: 'افتح المناهج' },
      suggestionsEn: ['Show my progress', 'Open the anatomy lab'],
      suggestionsAr: ['اعرض تقدمي', 'افتح معمل التشريح'],
    },
  },
  {
    keys: ['progress', 'xp', 'score', 'mastery', 'report', 'تقدم', 'نقاط', 'درجة', 'إتقان', 'تقرير'],
    reply: {
      textEn:
        'The progress page summarises mastery per subject, weekly learning minutes, recent assessments and achievements. Lesson completion is stored locally under scinexa_completed_lessons, with XP under scinexa_user_xp.',
      textAr:
        'صفحة التقدم تلخص الإتقان لكل مادة ودقائق التعلم الأسبوعية وآخر التقييمات والإنجازات. إتمام الدروس محفوظ محليًا في scinexa_completed_lessons، والنقاط في scinexa_user_xp.',
      link: { to: '/app/progress', labelEn: 'Open progress', labelAr: 'افتح التقدم' },
      suggestionsEn: ['Open settings', 'Show all labs'],
      suggestionsAr: ['افتح الإعدادات', 'اعرض كل المعامل'],
    },
  },
  {
    keys: ['class', 'student', 'teacher', 'assignment', 'school', 'role', 'فصل', 'طالب', 'معلم', 'واجب', 'مدرسة', 'دور'],
    reply: {
      textEn:
        'Teacher and administrator roles unlock classes, students, assignments, institutions, users and analytics in the sidebar. In development you can preview a role from the user menu without changing Clerk metadata; in production the role comes from Clerk publicMetadata.role.',
      textAr:
        'دور المعلم والإدارة يفتح الفصول والطلاب والواجبات والمؤسسات والمستخدمين والتحليلات في الشريط الجانبي. في وضع التطوير يمكنك معاينة أي دور من قائمة المستخدم دون تغيير Clerk metadata؛ وفي الإنتاج يأتي الدور من Clerk publicMetadata.role.',
      link: { to: '/app/classes', labelEn: 'Open classes', labelAr: 'افتح الفصول' },
      suggestionsEn: ['Open settings', 'Explain the curriculum'],
      suggestionsAr: ['افتح الإعدادات', 'اشرح المنهج'],
    },
  },
  {
    keys: ['labs', 'laboratory', 'modules', 'معامل', 'مختبر', 'وحدات'],
    reply: {
      textEn:
        'There are six labs: anatomy, physics, chemistry, biology, geology and astronomy. Each one opens in an immersive dark stage inside the dashboard, and your state is saved automatically.',
      textAr:
        'يوجد ستة معامل: التشريح، الفيزياء، الكيمياء، الأحياء، الجيولوجيا، والفلك. كل معمل يُفتح داخل مسرح داكن immersive داخل لوحة التحكم، وحالتك تُحفظ تلقائيًا.',
      link: { to: '/app/labs', labelEn: 'Open all labs', labelAr: 'افتح كل المعامل' },
      suggestionsEn: ['Open the anatomy lab', 'Show my progress'],
      suggestionsAr: ['افتح معمل التشريح', 'اعرض تقدمي'],
    },
  },
];

const FALLBACK: LocalReply = {
  textEn:
    'I am running in local test mode, so I only answer pre-written questions about the six labs, the curriculum, progress and roles. Try asking about the heart, a circuit, the periodic table, a cell, earthquakes, planets, or “show my progress”.',
  textAr:
    'أنا أعمل في وضع اختبار محلي، لذلك أجيب فقط على أسئلة مكتوبة مسبقًا عن المعامل الستة والمنهج والتقدم والأدوار. جرّب أن تسأل عن القلب، أو دائرة كهربية، أو الجدول الدوري، أو الخلية، أو الزلازل، أو الكواكب، أو «اعرض تقدمي».',
  suggestionsEn: ['Open the anatomy lab', 'How does the curriculum work?', 'Show my progress'],
  suggestionsAr: ['افتح معمل التشريح', 'كيف يعمل المنهج؟', 'اعرض تقدمي'],
};

export function answerLocally(prompt: string, ar: boolean = false): LocalReply {
  const q = prompt.trim().toLowerCase();
  if (!q) return FALLBACK;
  const rule = RULES.find((item) => item.keys.some((key) => q.includes(key.toLowerCase())));
  return rule?.reply ?? FALLBACK;
}

export const STARTERS: { en: string; ar: string }[] = [
  { en: 'Open the anatomy lab', ar: 'افتح معمل التشريح' },
  { en: 'Explain Ohm law', ar: 'اشرح قانون أوم' },
  { en: 'How does the curriculum work?', ar: 'كيف يعمل المنهج؟' },
  { en: 'Show my progress', ar: 'اعرض تقدمي' },
];
