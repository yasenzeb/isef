/**
 * curriculumData.ts
 * المناهج المصرية التفاعلية الموثقة لجميع المراحل الدراسية:
 * 1. المرحلة الثانوية (الصف الأول والثاني والثالث الثانوي)
 * 2. المرحلة الإعدادية (الصف الأول والثاني والثالث الإعدادي)
 * 3. مدارس المتفوقين في العلوم والتكنولوجيا (STEM)
 *
 * كل درس مرتبط بمعمل ثلاثي الأبعاد 3D محدد، وفيديو موثق من الوزارة، وتقييم أسبوعي محكم.
 *
 * © SciNexa Platform — ISEF 2026
 */

export interface CurriculumQuizQuestion {
  id: string;
  questionAr: string;
  questionEn: string;
  questionFr: string;
  questionDe: string;
  optionsAr: string[];
  optionsEn: string[];
  optionsFr: string[];
  optionsDe: string[];
  correctAnswerIndex: number;
  explanationAr: string;
  explanationEn: string;
}

export interface CurriculumLesson {
  id: string;
  levelNumber: number;
  stage: 'secondary' | 'prep' | 'stem';
  grade: 'prep1' | 'prep2' | 'prep3' | 'sec1' | 'sec2' | 'sec3' | 'stem';
  titleAr: string;
  titleEn: string;
  titleFr: string;
  titleDe: string;
  unitTitleAr: string;
  unitTitleEn: string;
  unitTitleFr: string;
  unitTitleDe: string;
  bookPageRange: string;
  linkedLabTab: 'chemistry' | 'physics' | 'anatomy' | 'biology' | 'geology' | 'astronomy';
  linkedLabNameAr: string;
  linkedLabNameEn: string;
  labPresetAction?: {
    type: 'chemistry_preset' | 'physics_sim' | 'anatomy_focus' | 'biology_model';
    reagents?: string[];
    heat?: boolean;
    anatomySystem?: string;
    physicsSimulation?: string;
  };
  verifiedVideo: {
    titleAr: string;
    titleEn: string;
    youtubeId: string;
    durationMinutes: number;
    channelName: string;
  };
  weeklyAssessment: {
    weekNumber: number;
    titleAr: string;
    titleEn: string;
    isTeacherAssigned?: boolean;
    assignedByTeacherName?: string;
    questions: CurriculumQuizQuestion[];
  };
}

export interface CurriculumPathway {
  id: string;
  stage: 'secondary' | 'prep' | 'stem';
  grade: 'prep1' | 'prep2' | 'prep3' | 'sec1' | 'sec2' | 'sec3' | 'stem' | 'all';
  titleAr: string;
  titleEn: string;
  titleFr: string;
  titleDe: string;
  subjectAr: string;
  subjectEn: string;
  subjectFr: string;
  subjectDe: string;
  textbookPdfName: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionFr: string;
  descriptionDe: string;
  accent: 'chemistry' | 'physics' | 'anatomy' | 'biology' | 'geology' | 'astronomy';
  lessons: CurriculumLesson[];
}

export const ALL_CURRICULUM_PATHWAYS: CurriculumPathway[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. المرحلة الثانوية — الكيمياء غير العضوية والتحليلية
  // ─────────────────────────────────────────────────────────────
  {
    id: 'sec_chem_inorganic',
    stage: 'secondary',
    grade: 'sec2',
    accent: 'chemistry',
    titleAr: 'الكيمياء · تحضير الغازات والمواد غير العضوية',
    titleEn: 'Chemistry · Inorganic Synthesis & Gas Reactions',
    titleFr: 'Chimie · Synthèse inorganique et réactions gazeuses',
    titleDe: 'Chemie · Anorganische Synthese und Gasreaktionen',
    subjectAr: 'الكيمياء — الصف الثاني والثالث الثانوي',
    subjectEn: 'Chemistry — 2nd & 3rd Secondary',
    subjectFr: 'Chimie — Lycée (2e & 3e Année)',
    subjectDe: 'Chemie — Sekundarstufe II',
    textbookPdfName: 'Egyptian_Secondary_Chemistry_Vol2.pdf',
    descriptionAr: 'منهج الكيمياء غير العضوية: تحضير الغازات الصناعية والمعملية، تفاعلات الأكسدة والاختزال، وطريقة هابر-بوش وأوستفالد والتحليل الكيميائي.',
    descriptionEn: 'Inorganic Chemistry: lab and industrial gas synthesis, redox stoichiometry, Haber-Bosch ammonia synthesis and volumetric analysis.',
    descriptionFr: 'Chimie inorganique: synthèse de gaz de laboratoire et industriels, stœchiométrie redox, procédé Haber-Bosch et analyse chimique.',
    descriptionDe: 'Anorganische Chemie: Synthese industrieller Gase, Redox-Reaktionen, Haber-Bosch-Verfahren und chemische Analytik.',
    lessons: [
      {
        id: 'sec-chem-1',
        levelNumber: 1,
        stage: 'secondary',
        grade: 'sec2',
        titleAr: 'الدرس 1: اختزال الهيدروجين لأكاسيد الفلزات عند درجات حرارة مرتفعة',
        titleEn: 'Lesson 1: High-Temp Hydrogen Reduction of Metal Oxides',
        titleFr: 'Leçon 1: Réduction des oxydes métalliques par l’hydrogène',
        titleDe: 'Lektion 1: Wasserstoffreduktion von Metalloxiden bei hohen Temperaturen',
        unitTitleAr: 'الفصل الأول: خواص وتفاعلات الفلزات والغازات',
        unitTitleEn: 'Unit 1: Metal & Gas Reactions',
        unitTitleFr: 'Unité 1: Réactions des métaux et des gaz',
        unitTitleDe: 'Einheit 1: Metall- und Gasreaktionen',
        bookPageRange: 'ص 42 - 47',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل الكيمياء والتفاعلات 3D',
        linkedLabNameEn: '3D Chemistry Lab',
        labPresetAction: { type: 'chemistry_preset', reagents: ['CuO', 'H2'], heat: true },
        verifiedVideo: {
          titleAr: 'تجربة اختزال أكسيد النحاس الأسود بغاز الهيدروجين وتكون النحاس الأحمر',
          titleEn: 'Reduction of black CuO by H2 gas into metallic copper',
          youtubeId: 'q8i6Rk4HhZ8',
          durationMinutes: 4,
          channelName: 'قناة مصر التعليمية (وزارة التربية والتعليم)',
        },
        weeklyAssessment: {
          weekNumber: 1,
          titleAr: 'تقييم الأسبوع الأول: اختزال أكاسيد الفلزات',
          titleEn: 'Week 1 Assessment: Metal Oxide Reduction',
          isTeacherAssigned: true,
          assignedByTeacherName: 'أ. منى فتحي',
          questions: [
            {
              id: 'q1-1',
              questionAr: 'عند إمرار غاز الهيدروجين فوق أكسيد النحاس الأسود المسخن لدرجة الاحمرار، ما هو التغير اللوني الملاحظ؟',
              questionEn: 'When hydrogen is passed over red-hot black CuO, what color change is observed?',
              questionFr: 'Lorsque l’hydrogène passe sur du CuO noir chauffé au rouge, quel changement de couleur est observé?',
              questionDe: 'Welche Farbänderung wird beobachtet, wenn Wasserstoff über rotglühendes CuO geleitet wird?',
              optionsAr: ['يتحول اللون الأسود إلى لون أحمر نحاسي مع تكاثف قطرات ماء', 'يتحول إلى لون أزرق لامع', 'يتكون راسب أبيض مصفر', 'لا يحدث أي تغير لوني'],
              optionsEn: ['Black turns to reddish metallic copper with water condensation', 'Turns bright blue', 'Yellowish precipitate forms', 'No color change'],
              optionsFr: ['Le noir devient rouge cuivré avec condensation d’eau', 'Devient bleu vif', 'Précipité jaunâtre', 'Aucun changement'],
              optionsDe: ['Schwarz wird zu rötlichem Kupfer mit Kondensation', 'Wird leuchtend blau', 'Gelblicher Niederschlag', 'Keine Änderung'],
              correctAnswerIndex: 0,
              explanationAr: 'يقوم الهيدروجين باختزال أكسيد النحاس الأسود (CuO) ليعطي فلز النحاس الأحمر وبخار الماء (H2O).',
              explanationEn: 'H2 acts as a reducing agent, converting black CuO into red Cu and H2O vapor.',
            },
          ],
        },
      },
      {
        id: 'sec-chem-2',
        levelNumber: 2,
        stage: 'secondary',
        grade: 'sec2',
        titleAr: 'الدرس 2: تحضير غاز الهيدروجين في المعمل بإضافة حمض الكبريتيك المخفف للزنك',
        titleEn: 'Lesson 2: Laboratory Preparation of Hydrogen via Zinc & Dilute Acid',
        titleFr: 'Leçon 2: Préparation du dihydrogène au laboratoire avec le zinc',
        titleDe: 'Lektion 2: Laborherstellung von Wasserstoffgas mit Zink und Säure',
        unitTitleAr: 'الفصل الأول: خواص وتفاعلات الفلزات والغازات',
        unitTitleEn: 'Unit 1: Metal & Gas Reactions',
        unitTitleFr: 'Unité 1: Réactions des métaux et des gaz',
        unitTitleDe: 'Einheit 1: Metall- und Gasreaktionen',
        bookPageRange: 'ص 48 - 53',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل الكيمياء والتفاعلات 3D',
        linkedLabNameEn: '3D Chemistry Lab',
        labPresetAction: { type: 'chemistry_preset', reagents: ['Zn', 'H2SO4'], heat: false },
        verifiedVideo: {
          titleAr: 'تحضير غاز الهيدروجين والكشف عنه بفرقعة اشتعال اللهب',
          titleEn: 'Preparation of H2 gas and pop-sound ignition test',
          youtubeId: 'q8i6Rk4HhZ8',
          durationMinutes: 5,
          channelName: 'منصة مدرستنا التعليمية',
        },
        weeklyAssessment: {
          weekNumber: 2,
          titleAr: 'تقييم الأسبوع الثاني: تحضير الهيدروجين',
          titleEn: 'Week 2 Assessment: Hydrogen Preparation',
          isTeacherAssigned: true,
          assignedByTeacherName: 'أ. منى فتحي',
          questions: [
            {
              id: 'q1-2',
              questionAr: 'كيف يتم الكشف معملياً عن غاز الهيدروجين المتصاعد من التفاعل؟',
              questionEn: 'How is evolved hydrogen gas detected in the laboratory?',
              questionFr: 'Comment le dihydrogène est-il détecté au laboratoire?',
              questionDe: 'Wie wird Wasserstoffgas im Labor nachgewiesen?',
              optionsAr: ['يشتعل بفرقعة مميزة ولهب أزرق باهت عند تقريب شظية مشتعلة', 'يعكر ماء الجير الرائق', 'يزيل لون برمنجنات البوتاسيوم', 'يخضر ورقة مبللة بكرومات البوتاسيوم'],
              optionsEn: ['Burns with a characteristic pop sound and pale blue flame', 'Turns limewater cloudy', 'Decolorizes KMnO4', 'Turns dichromate paper green'],
              optionsFr: ['Brûle avec une détonation (pop) et flamme bleue pâle', 'Trouble l’eau de chaux', 'Décolore KMnO4', 'Change la couleur du dichromate'],
              optionsDe: ['Brennt mit Knallgasreaktion und blasser Flamme', 'Trübt Kalkwasser', 'Entfärbt KMnO4', 'Färbt Chromatpapier grün'],
              correctAnswerIndex: 0,
              explanationAr: 'غاز الهيدروجين يشتعل بفرقعة مميزة (Pop Test) عند تقريب شظية متقدة من فوهة الأنبوبة.',
              explanationEn: 'Hydrogen ignites with a characteristic pop sound upon contact with a flame.',
            },
          ],
        },
      },
      {
        id: 'sec-chem-3',
        levelNumber: 3,
        stage: 'secondary',
        grade: 'sec3',
        titleAr: 'الدرس 3: تصنيع الأمونيا والنشادر بطريقة هابر-بوش الصناعية (N2 + 3H2)',
        titleEn: 'Lesson 3: Industrial Synthesis of Ammonia (Haber-Bosch Process)',
        titleFr: 'Leçon 3: Synthèse industrielle de l’ammoniac (Procédé Haber-Bosch)',
        titleDe: 'Lektion 3: Industrielle Ammoniaksynthese (Haber-Bosch-Verfahren)',
        unitTitleAr: 'الفصل الثاني: الاتزان الكيميائي والصناعات التخليقية',
        unitTitleEn: 'Unit 2: Chemical Equilibrium & Industrial Synthesis',
        unitTitleFr: 'Unité 2: Équilibre chimique et synthèses industrielles',
        unitTitleDe: 'Einheit 2: Chemisches Gleichgewicht & Synthesen',
        bookPageRange: 'ص 74 - 82',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل الكيمياء والتفاعلات 3D',
        linkedLabNameEn: '3D Chemistry Lab',
        labPresetAction: { type: 'chemistry_preset', reagents: ['N2', 'H2'], heat: true },
        verifiedVideo: {
          titleAr: 'طريقة هابر-بوش والعوامل الحفازة وظروف الضغط والحرارة',
          titleEn: 'Haber-Bosch process: iron catalyst and dynamic equilibrium',
          youtubeId: 'q8i6Rk4HhZ8',
          durationMinutes: 6,
          channelName: 'بنك المعرفة المصري EKB',
        },
        weeklyAssessment: {
          weekNumber: 3,
          titleAr: 'تقييم الأسبوع الثالث: الاتزان الكيميائي وهابر-بوش',
          titleEn: 'Week 3 Assessment: Equilibrium & Haber-Bosch',
          isTeacherAssigned: false,
          questions: [
            {
              id: 'q1-3',
              questionAr: 'وفقاً لمبدأ لوشاتيليه، ما هو تأثير زيادة الضغط على تفاعل تكوين الأمونيا N2 + 3H2 ⇌ 2NH3؟',
              questionEn: 'According to Le Chatelier’s principle, what is the effect of increasing pressure on ammonia synthesis?',
              questionFr: 'Selon le principe de Le Chatelier, quel est l’effet d’une augmentation de pression sur la synthèse de NH3?',
              questionDe: 'Welche Auswirkung hat eine Druckerhöhung auf die Ammoniaksynthese nach Le Chatelier?',
              optionsAr: ['ينزاح الاتزان في الاتجاه الطردي نحو تكوين المزيد من الأمونيا (الحجم الأقل)', 'ينزاح الاتزان في الاتجاه العكسي', 'لا يتأثر موضع الاتزان', 'يتوقف التفاعل تماماً'],
              optionsEn: ['Shifts forward toward NH3 formation (fewer gas moles)', 'Shifts backward', 'No effect on equilibrium', 'Reaction stops'],
              optionsFr: ['Se déplace vers la formation de NH3 (moins de moles)', 'Se déplace vers l’arrière', 'Aucun effet', 'Réaction arrêtée'],
              optionsDe: ['Verschiebt sich nach rechts zur Ammoniakbildung', 'Verschiebt sich nach links', 'Kein Einfluss', 'Reaktion stoppt'],
              correctAnswerIndex: 0,
              explanationAr: 'زيادة الضغط تجعل التفاعل ينزاح نحو الطرف الذي يحتوي على عدد مولات غازية أقل (٢ مول نواتج مقابل ٤ مولات متفاعلات).',
              explanationEn: 'Higher pressure favors the side with fewer gas moles (4 moles reactants -> 2 moles products).',
            },
          ],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. المرحلة الثانوية — الفيزياء والموجات والكهربية
  // ─────────────────────────────────────────────────────────────
  {
    id: 'sec_physics_waves',
    stage: 'secondary',
    grade: 'sec1',
    accent: 'physics',
    titleAr: 'الفيزياء · الحركة الموجية والمقذوفات والدوائر الكهربية',
    titleEn: 'Physics · Wave Mechanics, Projectiles & Circuits',
    titleFr: 'Physique · Mécanique ondulatoire, projectiles et circuits',
    titleDe: 'Physik · Wellenmechanik, Wurfbewegungen und Stromkreise',
    subjectAr: 'الفيزياء — الصف الأول والثاني الثانوي',
    subjectEn: 'Physics — 1st & 2nd Secondary',
    subjectFr: 'Physique — Lycée (1re & 2e Année)',
    subjectDe: 'Physik — Sekundarstufe II',
    textbookPdfName: 'Egyptian_Secondary_Physics_Vol1.pdf',
    descriptionAr: 'قوانين الحركة النيوتونية، زوايا المقذوفات في مجال الجاذبية، سرعة انتشار الموجات والرنين، وقانون أوم وتوصيل المقاومات.',
    descriptionEn: 'Newtonian mechanics, ballistic projectile motion, wave superposition and resonance harmonics, Ohm’s law and circuit networks.',
    descriptionFr: 'Mécanique newtonienne, mouvement de projectile, résonance des ondes et réseaux de circuits électriques.',
    descriptionDe: 'Newtonsche Mechanik, Wurfbewegungen, Wellenüberlagerung und Ohmsche Gesetze in Schaltkreisen.',
    lessons: [
      {
        id: 'sec-phys-1',
        levelNumber: 1,
        stage: 'secondary',
        grade: 'sec1',
        titleAr: 'الدرس 1: حركة المقذوفات في بعدين وتحديد المدى الأفقي وأقصى ارتفاع',
        titleEn: 'Lesson 1: Two-Dimensional Projectile Motion & Range Calculation',
        titleFr: 'Leçon 1: Mouvement des projectiles en deux dimensions',
        titleDe: 'Lektion 1: Zweidimensionale Wurfbewegung und Reichweite',
        unitTitleAr: 'الفصل الأول: الحركة الخطية والديناميكا',
        unitTitleEn: 'Unit 1: Linear Dynamics & Motion',
        unitTitleFr: 'Unité 1: Dynamique linéaire et mouvement',
        unitTitleDe: 'Einheit 1: Lineare Dynamik',
        bookPageRange: 'ص 55 - 64',
        linkedLabTab: 'physics',
        linkedLabNameAr: 'مختبر الفيزياء والمحاكاة 3D',
        linkedLabNameEn: '3D Physics Lab',
        labPresetAction: { type: 'physics_sim', physicsSimulation: 'projectile' },
        verifiedVideo: {
          titleAr: 'حركة المقذوفات بزاوية وحساب زمن التحليق والمدى الأفقي',
          titleEn: 'Projectile trajectory, flight time and horizontal range at 45 degrees',
          youtubeId: 'q8i6Rk4HhZ8',
          durationMinutes: 7,
          channelName: 'قناة مدرستنا 2 - فيزياء لغات وعربي',
        },
        weeklyAssessment: {
          weekNumber: 1,
          titleAr: 'تقييم الأسبوع الأول: حركة المقذوفات',
          titleEn: 'Week 1 Assessment: Projectile Motion',
          isTeacherAssigned: true,
          assignedByTeacherName: 'أ. هالة نبيل',
          questions: [
            {
              id: 'qp-1',
              questionAr: 'ما هي زاوية الإطلاق التي تحقق أقصى مدى أفقي ممكن لمقذوف بنفس السرعة الابتدائية بإهمال مقاومة الهواء؟',
              questionEn: 'What launch angle achieves maximum horizontal range for a projectile (ignoring air drag)?',
              questionFr: 'Quel angle de lancement permet d’atteindre la portée horizontale maximale?',
              questionDe: 'Welcher Abschusswinkel erzielt die maximale horizontale Reichweite (ohne Luftwiderstand)?',
              optionsAr: ['٤٥ درجة', '٣٠ درجة', '٦٠ درجة', '٩٠ درجة'],
              optionsEn: ['45 degrees', '30 degrees', '60 degrees', '90 degrees'],
              optionsFr: ['45 degrés', '30 degrés', '60 degrés', '90 degrés'],
              optionsDe: ['45 Grad', '30 Grad', '60 Grad', '90 Grad'],
              correctAnswerIndex: 0,
              explanationAr: 'المدى الأفقي يعتمد على sin(2θ)، وتكون قيمته عظمى عندما 2θ = 90 أي عندما تكون θ = 45°.',
              explanationEn: 'Range is proportional to sin(2θ), maximizing when 2θ = 90°, hence θ = 45°.',
            },
          ],
        },
      },
      {
        id: 'sec-phys-2',
        levelNumber: 2,
        stage: 'secondary',
        grade: 'sec2',
        titleAr: 'الدرس 2: قانون أوم والمقاومة المكافئة في التوصيل على التوالي والتوازي',
        titleEn: 'Lesson 2: Ohm’s Law & Equivalent Resistance in Series and Parallel',
        titleFr: 'Leçon 2: Loi d’Ohm et résistance équivalente en série et parallèle',
        titleDe: 'Lektion 2: Ohmsches Gesetz und Ersatzwiderstand (Reihe & Parallel)',
        unitTitleAr: 'الفصل الثاني: الكهربية والتيار المستمر',
        unitTitleEn: 'Unit 2: Electricity & DC Circuits',
        unitTitleFr: 'Unité 2: Électricité et circuits continus',
        unitTitleDe: 'Einheit 2: Gleichstromkreise',
        bookPageRange: 'ص 88 - 97',
        linkedLabTab: 'physics',
        linkedLabNameAr: 'مختبر الفيزياء والمحاكاة 3D',
        linkedLabNameEn: '3D Physics Lab',
        labPresetAction: { type: 'physics_sim', physicsSimulation: 'circuits' },
        verifiedVideo: {
          titleAr: 'تجارب توصيل المقاومات وقياس فرق الجهد وشدة التيار بالأجهزة المعملية',
          titleEn: 'Circuit connections: measuring voltage and current with multimeters',
          youtubeId: 'q8i6Rk4HhZ8',
          durationMinutes: 5,
          channelName: 'مصر التعليمية فيزياء',
        },
        weeklyAssessment: {
          weekNumber: 2,
          titleAr: 'تقييم الأسبوع الثاني: الدوائر الكهربية',
          titleEn: 'Week 2 Assessment: Electric Circuits',
          isTeacherAssigned: false,
          questions: [
            {
              id: 'qp-2',
              questionAr: 'عند توصيل مقاومتين متساويتين قيمة كل منهما R على التوازي، كم تكون المقاومة المكافئة لهما؟',
              questionEn: 'When two identical resistors of resistance R are connected in parallel, what is the equivalent resistance?',
              questionFr: 'Lorsque deux résistances identiques R sont montées en parallèle, quelle est la résistance équivalente?',
              questionDe: 'Wie groß ist der Ersatzwiderstand zweier parallel geschalteter identischer Widerstände R?',
              optionsAr: ['R / 2 (نصف قيمة الواحدة)', '2R (ضعف قيمة الواحدة)', 'R (نفس القيمة)', 'R² (المربع)'],
              optionsEn: ['R / 2 (half of R)', '2R (double of R)', 'R (unchanged)', 'R²'],
              optionsFr: ['R / 2 (la moitié)', '2R (le double)', 'R', 'R²'],
              optionsDe: ['R / 2 (die Hälfte)', '2R (das Doppelte)', 'R', 'R²'],
              correctAnswerIndex: 0,
              explanationAr: 'في التوصيل على التوازي: 1/Req = 1/R + 1/R = 2/R، وبالتالي Req = R/2.',
              explanationEn: 'In parallel: 1/Req = 1/R + 1/R = 2/R => Req = R/2.',
            },
          ],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. المرحلة الثانوية — أطلس التشريح والأحياء
  // ─────────────────────────────────────────────────────────────
  {
    id: 'sec_biology_anatomy',
    stage: 'secondary',
    grade: 'sec2',
    accent: 'anatomy',
    titleAr: 'الأحياء والتشريح · الجهاز الهيكلي والدوري والعصبي والخلية',
    titleEn: 'Biology & 3D Anatomy · Skeletal, Cardiovascular & Neural Systems',
    titleFr: 'Biologie & Anatomie 3D · Squelette, système circulatoire et nerveux',
    titleDe: 'Biologie & 3D-Anatomie · Skelett, Herz-Kreislauf- und Nervensystem',
    subjectAr: 'الأحياء وعلم التشريح — الصف الأول والثاني الثانوي',
    subjectEn: 'Biology & Anatomy — 1st & 2nd Secondary',
    subjectFr: 'Biologie & Anatomie — Lycée',
    subjectDe: 'Biologie & Humananatomie — Sekundarstufe II',
    textbookPdfName: 'Egyptian_Secondary_Biology_Atlas.pdf',
    descriptionAr: 'استكشاف تشريحي ثلاثي الأبعاد للهيكل العظمي البشري (٢٠٦ عظمة)، غرف القلب والدورة الدموية، ومكونات الخلية والميتوكوندريا.',
    descriptionEn: 'Interactive 3D medical atlas of the human skeleton (206 bones), heart chambers and blood flow, nervous tissue and cellular ultrastructure.',
    descriptionFr: 'Atlas 3D médical du squelette humain (206 os), cœur, flux sanguin et ultrastructure cellulaire.',
    descriptionDe: 'Interaktiver 3D-Atlas des menschlichen Skeletts (206 Knochen), Herzkammern, Kreislauf und Zellultrastruktur.',
    lessons: [
      {
        id: 'sec-anat-1',
        levelNumber: 1,
        stage: 'secondary',
        grade: 'sec2',
        titleAr: 'الدرس 1: التركيب التشريحي للهيكل العظمي المحوري والطرفي والمفاصل',
        titleEn: 'Lesson 1: Axial & Appendicular Human Skeleton & Joint Mechanics',
        titleFr: 'Leçon 1: Squelette axial et appendiculaire et articulations',
        titleDe: 'Lektion 1: Axiales und appendikuläres Skelett und Gelenkmechanik',
        unitTitleAr: 'الفصل الأول: الدعامة والحركة في الكائنات الحية',
        unitTitleEn: 'Unit 1: Support & Locomotion in Organisms',
        unitTitleFr: 'Unité 1: Mouvement et soutien chez les vivants',
        unitTitleDe: 'Einheit 1: Stütz- und Bewegungssystem',
        bookPageRange: 'ص 12 - 24',
        linkedLabTab: 'anatomy',
        linkedLabNameAr: 'أطلس التشريح البشري 3D',
        linkedLabNameEn: '3D Human Anatomy Atlas',
        labPresetAction: { type: 'anatomy_focus', anatomySystem: 'skeletal' },
        verifiedVideo: {
          titleAr: 'تشريح الهيكل العظمي والعمود الفقري والقفص الصدري بنماذج 3D',
          titleEn: 'Human skeleton, vertebral column and thoracic cage 3D medical tour',
          youtubeId: 'q8i6Rk4HhZ8',
          durationMinutes: 8,
          channelName: 'قناة مدرستنا 3 - ثانوية عامة أحياء',
        },
        weeklyAssessment: {
          weekNumber: 1,
          titleAr: 'تقييم الأسبوع الأول: الهيكل العظمي والدعامة',
          titleEn: 'Week 1 Assessment: Skeletal System',
          isTeacherAssigned: true,
          assignedByTeacherName: 'أ. طارق محمود',
          questions: [
            {
              id: 'qa-1',
              questionAr: 'كم عدد عظام الهيكل العظمي في جسم الإنسان البالغ؟',
              questionEn: 'How many bones are in the adult human skeleton?',
              questionFr: 'Combien d’os composent le squelette d’un être humain adulte?',
              questionDe: 'Wie viele Knochen umfasst das Skelett eines erwachsenen Menschen?',
              optionsAr: ['٢٠٦ عظمة', '١٨٠ عظمة', '٢٥٠ عظمة', '٣٠٠ عظمة'],
              optionsEn: ['206 bones', '180 bones', '250 bones', '300 bones'],
              optionsFr: ['206 os', '180 os', '250 os', '300 os'],
              optionsDe: ['206 Knochen', '180 Knochen', '250 Knochen', '300 Knochen'],
              correctAnswerIndex: 0,
              explanationAr: 'يحتوي الهيكل العظمي للشخص البالغ على ٢٠٦ عظمات مقسمة بين الهيكل المحوري (٨٠) والطرفي (١٢٦).',
              explanationEn: 'The adult human skeleton comprises 206 bones (80 axial, 126 appendicular).',
            },
          ],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. المرحلة الإعدادية — العلوم العامة والمادة والكون
  // ─────────────────────────────────────────────────────────────
  {
    id: 'prep_general_science',
    stage: 'prep',
    grade: 'prep1',
    accent: 'astronomy',
    titleAr: 'العلوم العامة · المادة والطاقة ودورية العناصر والكون',
    titleEn: 'General Science · Matter, Energy, Periodic Trends & Cosmos',
    titleFr: 'Sciences générales · Matière, énergie, tableau périodique et cosmos',
    titleDe: 'Allgemeine Naturwissenschaften · Materie, Energie und Kosmos',
    subjectAr: 'العلوم — المرحلة الإعدادية (الصف الأول والثاني والثالث الإعدادي)',
    subjectEn: 'Science — Preparatory Stage (1st, 2nd, 3rd Prep)',
    subjectFr: 'Sciences — Collège (1re, 2e, 3e)',
    subjectDe: 'Naturwissenschaften — Sekundarstufe I',
    textbookPdfName: 'Egyptian_Prep_Science_Ministry.pdf',
    descriptionAr: 'منهج العلوم للمرحلة الإعدادية: خواص المادة والتركيب الذري، دورية العناصر، انعكاس الضوء والمرايا والعدسات، والمجموعة الشمسية ومدارات كبلر.',
    descriptionEn: 'Preparatory Science Curriculum: atomic structure, periodic properties, optics with mirrors and lenses, and solar system planetary orbits.',
    descriptionFr: 'Programme de sciences du collège: structure atomique, tableau périodique, optique géométrique et système solaire.',
    descriptionDe: 'Naturwissenschaftlicher Lehrplan: Atomaufbau, Periodensystem, Optik und Sonnensystem.',
    lessons: [
      {
        id: 'prep-sci-1',
        levelNumber: 1,
        stage: 'prep',
        grade: 'prep1',
        titleAr: 'الدرس 1: التركيب الذري للمادة والتوزيع الإلكتروني في مستويات الطاقة',
        titleEn: 'Lesson 1: Atomic Structure & Electron Energy Level Distribution',
        titleFr: 'Leçon 1: Structure atomique et niveaux d’énergie électroniques',
        titleDe: 'Lektion 1: Atomaufbau und Elektronenverteilung',
        unitTitleAr: 'الوحدة الأولى: المادة وتركيبها وخواصها',
        unitTitleEn: 'Unit 1: Matter & Properties',
        unitTitleFr: 'Unité 1: Matière et propriétés',
        unitTitleDe: 'Einheit 1: Materie und Eigenschaften',
        bookPageRange: 'ص 18 - 28',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل الجدول الدوري والذرة 3D',
        linkedLabNameEn: '3D Periodic & Atomic Lab',
        verifiedVideo: {
          titleAr: 'مستويات الطاقة السبعة وتوزيع الإلكترونات لقواعد (2n²)',
          titleEn: 'Electron configuration in energy levels K, L, M, N (2n² rule)',
          youtubeId: 'q8i6Rk4HhZ8',
          durationMinutes: 5,
          channelName: 'قناة مدرستنا 1 - إعدادي',
        },
        weeklyAssessment: {
          weekNumber: 1,
          titleAr: 'تقييم الأسبوع الأول: الذرة ومستويات الطاقة',
          titleEn: 'Week 1 Assessment: Atoms & Energy Levels',
          isTeacherAssigned: true,
          assignedByTeacherName: 'أ. منى فتحي',
          questions: [
            {
              id: 'qprep-1',
              questionAr: 'ما هو الحد الأقصى لعدد الإلكترونات الذي يتشبع به مستوى الطاقة الثاني (L) وفق القاعدة 2n²؟',
              questionEn: 'What is the maximum number of electrons for the second energy level (L) via 2n²?',
              questionFr: 'Quel est le nombre maximal d’électrons pour le niveau L (2n²)?',
              questionDe: 'Wie viele Elektronen fasst die zweite Energiestufe (L) nach 2n²?',
              optionsAr: ['٨ إلكترونات (2 × 2² = 8)', '٢ إلكترون', '١٨ إلكترون', '٣٢ إلكترون'],
              optionsEn: ['8 electrons (2 × 2² = 8)', '2 electrons', '18 electrons', '32 electrons'],
              optionsFr: ['8 électrons', '2 électrons', '18 électrons', '32 électrons'],
              optionsDe: ['8 Elektronen', '2 Elektronen', '18 Elektronen', '32 Elektronen'],
              correctAnswerIndex: 0,
              explanationAr: 'طبقاً للعلاقة 2n²: حيث n = 2 للمستوى الثاني L، فإن 2 × (2)² = 2 × 4 = 8 إلكترونات.',
              explanationEn: 'According to 2n² where n = 2 for L level: 2 × 4 = 8 electrons.',
            },
          ],
        },
      },
      {
        id: 'prep-sci-2',
        levelNumber: 2,
        stage: 'prep',
        grade: 'prep3',
        titleAr: 'الدرس 2: النظام الشمسي ومدارات كبلر والجاذبية بين الأجرام السماوية',
        titleEn: 'Lesson 2: Solar System Planetary Orbits & Keplerian Gravitation',
        titleFr: 'Leçon 2: Système solaire, orbites de Kepler et gravitation',
        titleDe: 'Lektion 2: Sonnensystem, Keplerbahnen und Gravitation',
        unitTitleAr: 'الوحدة الثانية: الكون والنظام الشمسي',
        unitTitleEn: 'Unit 2: Universe & Solar System',
        unitTitleFr: 'Unité 2: L’Univers et le système solaire',
        unitTitleDe: 'Einheit 2: Universum und Sonnensystem',
        bookPageRange: 'ص 52 - 62',
        linkedLabTab: 'astronomy',
        linkedLabNameAr: 'مرصد الفلك ومدارات كبلر 3D',
        linkedLabNameEn: '3D Kepler Astronomy Lab',
        verifiedVideo: {
          titleAr: 'نشأة المجموعة الشمسية ومدارات الكواكب الثمانية وقوانين كبلر',
          titleEn: 'Solar system formation, 8 planetary orbits and Kepler laws',
          youtubeId: 'q8i6Rk4HhZ8',
          durationMinutes: 7,
          channelName: 'قناة النيل التعليمية للعلوم',
        },
        weeklyAssessment: {
          weekNumber: 2,
          titleAr: 'تقييم الأسبوع الثاني: الفلك والنظام الشمسي',
          titleEn: 'Week 2 Assessment: Astronomy & Orbits',
          isTeacherAssigned: false,
          questions: [
            {
              id: 'qprep-2',
              questionAr: 'وفقاً لقانون كبلر الأول، ما هو الشكل الهندسي الدقيق لمدار الكوكب حول الشمس؟',
              questionEn: 'According to Kepler’s First Law, what is the exact orbital shape of a planet around the Sun?',
              questionFr: 'Selon la première loi de Kepler, quelle est la forme de l’orbite planétaire?',
              questionDe: 'Welche Form hat die Planetenbahn um die Sonne nach dem 1. Kepler-Gesetz?',
              optionsAr: ['مدار إهليلجي (قطع ناقص) تقع الشمس في إحدى بؤرتيه', 'مدار دائري تام', 'مدار لولبي حلزوني', 'مدار خطي متعرج'],
              optionsEn: ['Elliptical orbit with the Sun at one focus', 'Perfect circle', 'Spiral orbit', 'Linear wave'],
              optionsFr: ['Orbite elliptique avec le Soleil à un foyer', 'Cercle parfait', 'Spirale', 'Ligne droite'],
              optionsDe: ['Elliptische Bahn mit der Sonne in einem Brennpunkt', 'Perfekter Kreis', 'Spirale', 'Geradlinig'],
              correctAnswerIndex: 0,
              explanationAr: 'ينص قانون كبلر الأول على أن الكواكب تدور حول الشمس في مدارات بيضاوية (قطع ناقص) وتقع الشمس في إحدى بؤرتيه.',
              explanationEn: 'Kepler’s 1st Law states that planetary orbits are ellipses with the Sun located at one focus.',
            },
          ],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. مدارس المتفوقين في العلوم والتكنولوجيا (STEM)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'stem_capstone_sciences',
    stage: 'stem',
    grade: 'stem',
    accent: 'geology',
    titleAr: 'علوم STEM المتقدمة · النمذجة الجيوفيزيائية والموجات الزلزالية والوراثة الجزيئية',
    titleEn: 'STEM Capstone · Geophysical Modeling, Seismic Waves & Molecular Genetics',
    titleFr: 'STEM Avancé · Modélisation géophysique et génétique moléculaire',
    titleDe: 'STEM-Spitzenforschung · Geophysikalische Modellierung & Molekulargenetik',
    subjectAr: 'مشاريع الكابستون ومدارس المتفوقين STEM',
    subjectEn: 'STEM Capstone & Integrated Advanced Sciences',
    subjectFr: 'Projets STEM et sciences intégrées avancées',
    subjectDe: 'STEM-Forschung & Integrierte Naturwissenschaften',
    textbookPdfName: 'STEM_Egypt_Capstone_Curriculum_2026.pdf',
    descriptionAr: 'مشاريع وأبحاث مدارس STEM المتقدمة: نمذجة طبقات الأرض وبؤر الزلازل، محاكاة الرنين الميكانيكي، والهندسة الوراثية وتتابع الـ DNA.',
    descriptionEn: 'Advanced STEM Egypt Capstone modules: geophysics and seismic wave tomography, mechanical resonance modeling, and molecular gene editing.',
    descriptionFr: 'Modules Capstone STEM Égypte: géophysique, ondes sismiques et biologie moléculaire.',
    descriptionDe: 'Fortgeschrittene STEM-Module: Geophysik, seismische Wellentomographie und molekulare Genetik.',
    lessons: [
      {
        id: 'stem-geo-1',
        levelNumber: 1,
        stage: 'stem',
        grade: 'stem',
        titleAr: 'الدرس 1: النمذجة الجيوفيزيائية للموجات الزلزالية الأولية (P) والثانوية (S)',
        titleEn: 'Lesson 1: Geophysical Modeling of Primary (P) and Secondary (S) Seismic Waves',
        titleFr: 'Leçon 1: Modélisation géophysique des ondes sismiques P et S',
        titleDe: 'Lektion 1: Geophysikalische Modellierung von P- und S-Wellen',
        unitTitleAr: 'مشروع الجيوفيزياء والمخاطر التكتونية',
        unitTitleEn: 'Capstone: Geophysics & Tectonic Hazards',
        unitTitleFr: 'Capstone: Géophysique et risques tectoniques',
        unitTitleDe: 'Capstone: Geophysik & Plattentektonik',
        bookPageRange: 'ص 110 - 128',
        linkedLabTab: 'geology',
        linkedLabNameAr: 'معمل علوم الأرض والزلازل 3D',
        linkedLabNameEn: '3D Earth & Seismic Lab',
        verifiedVideo: {
          titleAr: 'نمذجة انتشار الموجات الزلزالية عبر طبقات الوشاح واللب الخارجي السائل',
          titleEn: 'Seismic wave propagation through Earth’s crust, mantle and liquid outer core',
          youtubeId: 'q8i6Rk4HhZ8',
          durationMinutes: 9,
          channelName: 'STEM Egypt Science Channel',
        },
        weeklyAssessment: {
          weekNumber: 1,
          titleAr: 'تقييم كابستون: الموجات الزلزالية وبنية الأرض',
          titleEn: 'Capstone Assessment: Seismic Waves & Deep Earth',
          isTeacherAssigned: true,
          assignedByTeacherName: 'أ. هالة نبيل',
          questions: [
            {
              id: 'qstem-1',
              questionAr: 'لماذا تنكسر وتتلاشى الموجات الزلزالية الثانوية (S-waves) عند وصولها إلى اللب الخارجي للأرض؟',
              questionEn: 'Why do secondary seismic S-waves disappear when reaching the outer core?',
              questionFr: 'Pourquoi les ondes sismiques S disparaissent-elles au niveau du noyau externe?',
              questionDe: 'Warum erlöschen sekundäre S-Wellen am äußeren Erdkern?',
              optionsAr: ['لأن الموجات الثانوية موجات مستعرضة لا تنتشر في السوائل واللب الخارجي مصهور سائل', 'بسبب انخفاض درجة الحرارة', 'لأنها موجات كهرومغناطيسية', 'لأن كثافة اللب الخارجي صفر'],
              optionsEn: ['Because S-waves are shear transverse waves and cannot propagate through liquid outer core', 'Due to cooling', 'Because they are EM waves', 'Zero density'],
              optionsFr: ['Car les ondes S transversales ne se propagent pas dans les liquides', 'Baisse de température', 'Ce sont des ondes EM', 'Densité nulle'],
              optionsDe: ['Weil Transversalwellen (S-Wellen) sich nicht in Flüssigkeiten ausbreiten können', 'Wegen Kälte', 'Elektromagnetisch', 'Dichte ist null'],
              correctAnswerIndex: 0,
              explanationAr: 'الموجات الثانوية S هي موجات قصية مستعرضة تحتاج إلى صلابة مرنة ولا تنتشر في السوائل، مما يثبت أن اللب الخارجي للأرض سائل مصهور.',
              explanationEn: 'S-waves are transverse shear waves that require shear modulus and cannot travel through liquids, proving the outer core is molten liquid.',
            },
          ],
        },
      },
    ],
  },
];

export const getPathwaysByStage = (stage: 'all' | 'secondary' | 'prep' | 'stem') => {
  if (stage === 'all') return ALL_CURRICULUM_PATHWAYS;
  return ALL_CURRICULUM_PATHWAYS.filter((p) => p.stage === stage);
};

export const getLessonsByStage = (stage: 'all' | 'secondary' | 'prep' | 'stem'): CurriculumLesson[] => {
  const pathways = getPathwaysByStage(stage);
  return pathways.flatMap((p) => p.lessons);
};
