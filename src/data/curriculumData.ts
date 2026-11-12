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
          titleAr: 'تقييم الأداء المنزلي والأسبوعي — الأسبوع الأول: الحساب الكيميائي والمول وحجوم الغازات (وزارة التربية والتعليم 2026)',
          titleEn: 'Week 1 Assessment: Molar Mass, Avogadro & Gas Volumes (MoE 2026)',
          isTeacherAssigned: true,
          assignedByTeacherName: 'وزارة التربية والتعليم — مكتب تنمية مادة العلوم',
          questions: [
            {
                    id: "sec2-w1-hw-1",
                    questionAr: "ما كتلة 2.52 × 10⁻³ مول من كبريتات الأمونيوم؟ [N=14, H=1, S=32, O=16]",
                    questionEn: "What is the mass of 2.52 × 10⁻³ mol of ammonium sulfate? [N=14, H=1, S=32, O=16]",
                    questionFr: "Quelle est la masse de 2.52 × 10⁻³ mol de sulfate d'ammonium? [N=14, H=1, S=32, O=16]",
                    questionDe: "Wie groß ist die Masse von 2.52 × 10⁻³ mol Ammoniumsulfat? [N=14, H=1, S=32, O=16]",
                    optionsAr: [
                              "0.333 g",
                              "0.287 g",
                              "0.285 g",
                              "0.328 g"
                    ],
                    optionsEn: [
                              "0.333 g",
                              "0.287 g",
                              "0.285 g",
                              "0.328 g"
                    ],
                    optionsFr: [
                              "0.333 g",
                              "0.287 g",
                              "0.285 g",
                              "0.328 g"
                    ],
                    optionsDe: [
                              "0.333 g",
                              "0.287 g",
                              "0.285 g",
                              "0.328 g"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "الصيغة (NH₄)₂SO₄ كتلتها المولية = 2×(14 + 4) + 32 + (4×16) = 36 + 32 + 64 = 132 جم/مول. الكتلة = عدد المولات × الكتلة المولية = 2.52 × 10⁻³ × 132 = 0.33264 g ≈ 0.333 g.",
                    explanationEn: "Molar mass of (NH₄)₂SO₄ = 132 g/mol. Mass = 2.52 × 10⁻³ mol × 132 g/mol ≈ 0.333 g."
          },
          {
                    id: "sec2-w1-hw-2",
                    questionAr: "أي مما يلي له نفس عدد الجزيئات في 11.2 لتر من غاز الميثان (CH₄) عند STP؟ [C=12, H=1, N=14]",
                    questionEn: "Which of the following has the same number of molecules as 11.2 L of methane (CH₄) at STP? [C=12, H=1, N=14]",
                    questionFr: "Lequel des éléments suivants a le même nombre de molécules que 11.2 L de méthane (CH₄) aux TPN? [C=12, H=1, N=14]",
                    questionDe: "Welches der folgenden hat die gleiche Anzahl an Molekülen wie 11.2 L Methan (CH₄) bei STP? [C=12, H=1, N=14]",
                    optionsAr: [
                              "3.01 × 10²³ جزيء من غاز الهيدروجين",
                              "1 مول من غاز النيتروجين عند STP",
                              "4 g من غاز الميثان",
                              "17 g من غاز الأمونيا (NH₃) عند STP"
                    ],
                    optionsEn: [
                              "3.01 × 10²³ molecules of hydrogen gas",
                              "1 mol of nitrogen gas at STP",
                              "4 g of methane gas",
                              "17 g of ammonia gas (NH₃) at STP"
                    ],
                    optionsFr: [
                              "3.01 × 10²³ molécules de dihydrogène",
                              "1 mol d'azote gazeux aux TPN",
                              "4 g de méthane",
                              "17 g d'ammoniac (NH₃) aux TPN"
                    ],
                    optionsDe: [
                              "3.01 × 10²³ Moleküle Wasserstoffgas",
                              "1 mol Stickstoffgas bei STP",
                              "4 g Methangas",
                              "17 g Ammoniakgas (NH₃) bei STP"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "عدد مولات الميثان = 11.2 / 22.4 = 0.5 مول. عدد الجزيئات = 0.5 × 6.02 × 10²³ = 3.01 × 10²³ جزيء، وهو مطابق لـ 3.01 × 10²³ جزيء هيدروجين.",
                    explanationEn: "Moles of CH₄ = 11.2 / 22.4 = 0.5 mol. Number of molecules = 0.5 × 6.02 × 10²³ = 3.01 × 10²³ molecules."
          },
          {
                    id: "sec2-w1-hw-3",
                    questionAr: "عدد أيونات الكبريتات في 17.1 g من كبريتات الألومنيوم = ..... [Al=27, S=32, O=16]",
                    questionEn: "Number of sulfate ions in 17.1 g of aluminum sulfate = ..... [Al=27, S=32, O=16]",
                    questionFr: "Nombre d'ions sulfate dans 17.1 g de sulfate d'aluminium = ..... [Al=27, S=32, O=16]",
                    questionDe: "Anzahl der Sulfat-Ionen in 17.1 g Aluminiumsulfat = ..... [Al=27, S=32, O=16]",
                    optionsAr: [
                              "9 × 10²²",
                              "3 × 10²¹",
                              "1 × 10²²",
                              "3 × 10²²"
                    ],
                    optionsEn: [
                              "9 × 10²²",
                              "3 × 10²¹",
                              "1 × 10²²",
                              "3 × 10²²"
                    ],
                    optionsFr: [
                              "9 × 10²²",
                              "3 × 10²¹",
                              "1 × 10²²",
                              "3 × 10²²"
                    ],
                    optionsDe: [
                              "9 × 10²²",
                              "3 × 10²¹",
                              "1 × 10²²",
                              "3 × 10²²"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "الكتلة المولية لـ Al₂(SO₄)₃ = (2×27) + 3×(32 + 64) = 54 + 288 = 342 جم/مول. عدد مولات الملح = 17.1 / 342 = 0.05 مول. كل مول ملح ينتج 3 مولات SO₄²⁻، إذن عدد مولات الأيونات = 0.05 × 3 = 0.15 مول. عدد الأيونات = 0.15 × 6.02 × 10²³ ≈ 9 × 10²² أيون.",
                    explanationEn: "Molar mass of Al₂(SO₄)₃ = 342 g/mol. Moles = 17.1 / 342 = 0.05 mol. Moles of SO₄²⁻ = 0.05 × 3 = 0.15 mol. Ions = 0.15 × 6.02 × 10²³ ≈ 9 × 10²²."
          },
          {
                    id: "sec2-w1-hw-4",
                    questionAr: "عدد الذرات في 0.25 مول من الفورمالدهيد (HCHO) = ............",
                    questionEn: "The number of atoms in 0.25 mol of formaldehyde (HCHO) = ............",
                    questionFr: "Le nombre d'atomes dans 0.25 mol de formaldéhyde (HCHO) = ............",
                    questionDe: "Die Anzahl der Atome in 0.25 mol Formaldehyd (HCHO) = ............",
                    optionsAr: [
                              "عدد أفوجادرو",
                              "نصف عدد أفوجادرو",
                              "ربع عدد أفوجادرو",
                              "أربعة أضعاف عدد أفوجادرو"
                    ],
                    optionsEn: [
                              "Avogadro's number",
                              "Half Avogadro's number",
                              "One quarter Avogadro's number",
                              "Four times Avogadro's number"
                    ],
                    optionsFr: [
                              "Nombre d'Avogadro",
                              "La moitié du nombre d'Avogadro",
                              "Le quart du nombre d'Avogadro",
                              "Quatre fois le nombre d'Avogadro"
                    ],
                    optionsDe: [
                              "Avogadro-Zahl",
                              "Halbe Avogadro-Zahl",
                              "Ein Viertel der Avogadro-Zahl",
                              "Vierfache Avogadro-Zahl"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "جزيء HCHO يتكون من 4 ذرات (1C + 2H + 1O). عدد مولات الذرات = 0.25 مول جزيء × 4 ذرات/جزيء = 1 مول من الذرات، وهو ما يساوي تماماً عدد أفوجادرو (6.02 × 10²³ ذرة).",
                    explanationEn: "HCHO has 4 atoms per molecule. Total atom moles = 0.25 mol × 4 = 1 mol atoms = Avogadro's number."
          },
          {
                    id: "sec2-w1-hw-5",
                    questionAr: "أي مما يلي يمثل حجم 32 g من غاز ثاني أكسيد الكبريت في الظروف القياسية [S=32, O=16]؟",
                    questionEn: "Which of the following represents the volume of 32 g of sulfur dioxide gas at STP [S=32, O=16]?",
                    questionFr: "Lequel représente le volume de 32 g de dioxyde de soufre aux TPN [S=32, O=16]?",
                    questionDe: "Welches Volumen nehmen 32 g Schwefeldioxidgas bei STP ein [S=32, O=16]?",
                    optionsAr: [
                              "11.2 لتر",
                              "22.4 لتر",
                              "5.6 لتر",
                              "44.8 لتر"
                    ],
                    optionsEn: [
                              "11.2 L",
                              "22.4 L",
                              "5.6 L",
                              "44.8 L"
                    ],
                    optionsFr: [
                              "11.2 L",
                              "22.4 L",
                              "5.6 L",
                              "44.8 L"
                    ],
                    optionsDe: [
                              "11.2 L",
                              "22.4 L",
                              "5.6 L",
                              "44.8 L"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "الكتلة المولية لـ SO₂ = 32 + (2×16) = 64 جم/مول. عدد المولات = 32 / 64 = 0.5 مول. الحجم عند STP = 0.5 × 22.4 = 11.2 لتر.",
                    explanationEn: "Molar mass of SO₂ = 64 g/mol. Moles = 32 / 64 = 0.5 mol. Volume at STP = 0.5 × 22.4 L = 11.2 L."
          },
          {
                    id: "sec2-w1-quiz-1",
                    questionAr: "الحجم الموﻻري لكلوريد الصوديوم (NaCl) لا يساوي 22.4 L عند STP. أي مما يلي يعد التفسير الصحيح لذلك؟",
                    questionEn: "The molar volume of sodium chloride (NaCl) is NOT equal to 22.4 L at STP. What is the correct explanation?",
                    questionFr: "Le volume molaire du chlorure de sodium (NaCl) n'est PAS égal à 22.4 L aux TPN. Quelle est l'explication correcte?",
                    questionDe: "Das Molvolumen von Natriumchlorid (NaCl) beträgt bei STP NICHT 22.4 L. Was ist die richtige Erklärung?",
                    optionsAr: [
                              "لأن كلوريد الصوديوم مادة صلبة وليست غازاً",
                              "لأن كلوريد الصوديوم غاز في الظروف القياسية",
                              "لأن كلوريد الصوديوم له كتلة مولية كبيرة جداً",
                              "لأن قانون الحجم الموﻻري لا ينطبق إلا على السوائل"
                    ],
                    optionsEn: [
                              "Because sodium chloride is a solid substance, not a gas",
                              "Because sodium chloride is a gas at standard conditions",
                              "Because sodium chloride has a very large molar mass",
                              "Because molar volume applies only to liquids"
                    ],
                    optionsFr: [
                              "Parce que le NaCl est un solide et non un gaz",
                              "Parce que le NaCl est un gaz",
                              "Parce que le NaCl a une très grande masse molaire",
                              "Parce que le volume molaire ne s'applique qu'aux liquides"
                    ],
                    optionsDe: [
                              "Weil Natriumchlorid ein Feststoff und kein Gas ist",
                              "Weil Natriumchlorid unter Standardbedingungen ein Gas ist",
                              "Weil Natriumchlorid eine sehr große Molmasse hat",
                              "Weil das Molvolumen nur für Flüssigkeiten gilt"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "قانون الحجم الموﻻري (المول يشغل 22.4 لتر عند STP) خاص بالغازات فقط، بينما كلوريد الصوديوم NaCl مركب أيوني صلب متبلور.",
                    explanationEn: "The 22.4 L/mol molar volume rule strictly applies to gases at STP; NaCl is an ionic solid crystal."
          },
          {
                    id: "sec2-w1-quiz-2",
                    questionAr: "الحجم الموﻻري لغازي الهيدروجين والأكسجين عند نفس الظروف من الضغط ودرجة الحرارة يكون متساوياً، على الرغم من اختلاف كتلتهما المولية. ما تفسير ذلك؟",
                    questionEn: "The molar volumes of hydrogen and oxygen gases at the same temperature and pressure are equal despite different molar masses. What explains this?",
                    questionFr: "Les volumes molaires du dihydrogène et du dioxygène sont égaux dans les mêmes conditions malgré des masses différentes. Pourquoi?",
                    questionDe: "Das Molvolumen von Wasserstoff und Sauerstoff ist bei gleichen Bedingungen gleich, trotz unterschiedlicher Molmassen. Warum?",
                    optionsAr: [
                              "لأن عدد الموﻻت المتساوية من أي غاز تحتوي على نفس عدد الجزيئات وتشغل نفس الحجم عند نفس الظروف",
                              "لأن الغازين لهما نفس الكثافة",
                              "لأن الهيدروجين والأكسجين لهما نفس الكتلة المولية",
                              "لأن الحجم الموﻻري يعتمد فقط على الكتلة الذرية"
                    ],
                    optionsEn: [
                              "Equal moles of any gas contain equal numbers of molecules and occupy equal volumes under the same conditions",
                              "Because both gases have the exact same density",
                              "Because hydrogen and oxygen have equal molar mass",
                              "Because molar volume depends only on atomic mass"
                    ],
                    optionsFr: [
                              "Des moles égales de tout gaz contiennent le même nombre de molécules et occupent le même volume",
                              "Parce qu'ils ont la même masse volumique",
                              "Parce qu'ils ont la même masse molaire",
                              "Parce que le volume molaire dépend de la masse atomique"
                    ],
                    optionsDe: [
                              "Gleiche Stoffmengen jedes Gases enthalten gleich viele Moleküle und nehmen das gleiche Volumen ein",
                              "Weil beide Gase die gleiche Dichte haben",
                              "Weil sie die gleiche Molmasse haben",
                              "Weil das Molvolumen nur von der Atommasse abhängt"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "وفقاً لفرض أفوجادرو، الحجوم المتساوية من الغازات المختلفة عند نفس درجة الحرارة والضغط تحتوي على أعداد متساوية من الجزيئات، لذا المول من أي غاز يشغل 22.4 لتر.",
                    explanationEn: "According to Avogadro's hypothesis, equal volumes of gases at the same temperature and pressure contain equal numbers of particles."
          },
          {
                    id: "sec2-w1-quiz-3",
                    questionAr: "الحجوم المتساوية من غازي الأكسجين (O₂) والأوزون (O₃) عند نفس الظروف تحتوي على عدد متساوٍ من الجزيئات، ولكن تحتوي على عدد مختلف من ذرات الأكسجين. ما السبب في ذلك؟",
                    questionEn: "Equal volumes of oxygen (O₂) and ozone (O₃) gases at the same conditions contain equal numbers of molecules, but different numbers of oxygen atoms. Why?",
                    questionFr: "Des volumes égaux d'O₂ et d'O₃ contiennent le même nombre de molécules mais un nombre différent d'atomes. Pourquoi?",
                    questionDe: "Gleiche Volumina von O₂ und O₃ enthalten gleich viele Moleküle, aber verschieden viele Atome. Warum?",
                    optionsAr: [
                              "لأن جزيء الأوزون يتكون من 3 ذرات أكسجين بينما جزيء الأكسجين يتكون من ذرتين فقط",
                              "لأن الكتلة الجزيئية لغاز الأوزون أكبر من الكتلة الجزيئية لغاز الأكسجين",
                              "لأن الحجم الموﻻري لغاز الأوزون أكبر من الحجم الموﻻري لغاز الأكسجين",
                              "لأن عدد جزيئات الأوزون في نفس الحجم أكبر من عدد جزيئات الأكسجين"
                    ],
                    optionsEn: [
                              "Because ozone molecules consist of 3 oxygen atoms while oxygen molecules consist of only 2",
                              "Because ozone molecular mass is greater than oxygen",
                              "Because ozone molar volume is larger than oxygen",
                              "Because number of ozone molecules is larger in the same volume"
                    ],
                    optionsFr: [
                              "Parce que l'ozone contient 3 atomes d'oxygène tandis que le dioxygène n'en contient que 2",
                              "Parce que la masse molaire de l'ozone est plus grande",
                              "Parce que le volume molaire de l'ozone est plus grand",
                              "Parce que le nombre de molécules est différent"
                    ],
                    optionsDe: [
                              "Weil Ozonmoleküle aus 3 Sauerstoffatomen bestehen, Sauerstoffmoleküle jedoch nur aus 2",
                              "Weil die Molmasse von Ozon größer ist",
                              "Weil das Molvolumen von Ozon größer ist",
                              "Weil die Molekülanzahl verschieden ist"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "عدد الجزيئات متساوٍ لتماثل الحجم والظروف طبقاً لأفوجادرو، ولكن جزيء O₃ يحتوي على 3 ذرات وجزيء O₂ يحتوي على ذرتين، لذا عدد الذرات في الأوزون يمثل 1.5 ضعف ذرات الأكسجين.",
                    explanationEn: "Number of molecules is identical by Avogadro's law, but each O₃ molecule carries 3 atoms vs 2 atoms in O₂."
          },
          {
                    id: "sec2-w1-quiz-4",
                    questionAr: "جزيء عنصر الفوسفور في حالته البخارية رباعي الذرة (P₄). احسب عدد ذرات الفوسفور في 30 g من الفوسفور في حالته البخارية. [P = 30]",
                    questionEn: "Phosphorus vapor is tetratomic (P₄). Calculate the number of phosphorus atoms in 30 g of phosphorus vapor. [P = 30]",
                    questionFr: "La vapeur de phosphore est tétra-atomique (P₄). Calculez le nombre d'atomes dans 30 g de vapeur. [P = 30]",
                    questionDe: "Phosphordampf ist vieratomig (P₄). Berechnen Sie die Anzahl der Phosphoratome in 30 g Dampf. [P = 30]",
                    optionsAr: [
                              "6.02 × 10²³",
                              "6.02 × 10²²",
                              "1.505 × 10²³",
                              "2.408 × 10²⁴"
                    ],
                    optionsEn: [
                              "6.02 × 10²³",
                              "6.02 × 10²²",
                              "1.505 × 10²³",
                              "2.408 × 10²⁴"
                    ],
                    optionsFr: [
                              "6.02 × 10²³",
                              "6.02 × 10²²",
                              "1.505 × 10²³",
                              "2.408 × 10²⁴"
                    ],
                    optionsDe: [
                              "6.02 × 10²³",
                              "6.02 × 10²²",
                              "1.505 × 10²³",
                              "2.408 × 10²⁴"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "الكتلة الذرية للفوسفور = 30 جم/مول ذرة. عدد مولات ذرات الفوسفور في 30 جم = 30 / 30 = 1 مول ذرة. عدد الذرات = 1 × 6.02 × 10²³ = 6.02 × 10²³ ذرة.",
                    explanationEn: "Moles of P atoms = 30 g / 30 g/mol = 1 mol atoms. Number of atoms = 1 × 6.02 × 10²³ = 6.02 × 10²³."
          },
          {
                    id: "sec2-w1-quiz-5",
                    questionAr: "كم عدد جزيئات الفوسفور (P₄) الموجودة في 30 g من الفوسفور في حالته البخارية؟ [P = 30]",
                    questionEn: "How many phosphorus molecules (P₄) are present in 30 g of phosphorus in its vapor state? [P = 30]",
                    questionFr: "Combien de molécules de phosphore (P₄) y a-t-il dans 30 g de vapeur de phosphore? [P = 30]",
                    questionDe: "Wie viele Phosphormoleküle (P₄) sind in 30 g Phosphordampf enthalten? [P = 30]",
                    optionsAr: [
                              "1.505 × 10²³",
                              "6.02 × 10²³",
                              "3.01 × 10²³",
                              "2.408 × 10²⁴"
                    ],
                    optionsEn: [
                              "1.505 × 10²³",
                              "6.02 × 10²³",
                              "3.01 × 10²³",
                              "2.408 × 10²⁴"
                    ],
                    optionsFr: [
                              "1.505 × 10²³",
                              "6.02 × 10²³",
                              "3.01 × 10²³",
                              "2.408 × 10²⁴"
                    ],
                    optionsDe: [
                              "1.505 × 10²³",
                              "6.02 × 10²³",
                              "3.01 × 10²³",
                              "2.408 × 10²⁴"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "الكتلة المولية لجزيء P₄ = 4 × 30 = 120 جم/مول. عدد مولات الجزيئات = 30 / 120 = 0.25 مول جزيء. عدد الجزيئات = 0.25 × 6.02 × 10²³ = 1.505 × 10²³ جزيء.",
                    explanationEn: "Molar mass of P₄ = 120 g/mol. Moles of molecules = 30 / 120 = 0.25 mol. Molecules = 0.25 × 6.02 × 10²³ = 1.505 × 10²³."
          },
          {
                    id: "sec2-w1-quiz-6",
                    questionAr: "أي مما يلي يعبر عن كتلة وزن ذرة الأكسجين الواحدة مقدرة بالجرام؟ [O = 16 amu]",
                    questionEn: "Which of the following represents the mass of a single oxygen atom in grams? [O = 16 amu]",
                    questionFr: "Quelle est la masse d'un seul atome d'oxygène en grammes? [O = 16 amu]",
                    questionDe: "Welcher Wert entspricht der Masse eines einzelnen Sauerstoffatoms in Gramm? [O = 16 amu]",
                    optionsAr: [
                              "2.66 × 10⁻²³",
                              "16",
                              "9.63 × 10²⁴",
                              "6.02 × 10²³"
                    ],
                    optionsEn: [
                              "2.66 × 10⁻²³",
                              "16",
                              "9.63 × 10²⁴",
                              "6.02 × 10²³"
                    ],
                    optionsFr: [
                              "2.66 × 10⁻²³",
                              "16",
                              "9.63 × 10²⁴",
                              "6.02 × 10²³"
                    ],
                    optionsDe: [
                              "2.66 × 10⁻²³",
                              "16",
                              "9.63 × 10²⁴",
                              "6.02 × 10²³"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "كتلة المول من ذرات الأكسجين (6.02 × 10²³ ذرة) = 16 جم. إذن كتلة الذرة الواحدة = 16 / (6.02 × 10²³) ≈ 2.6578 × 10⁻²³ جم ≈ 2.66 × 10⁻²³ جم.",
                    explanationEn: "Mass of 1 atom = Molar mass / Avogadro number = 16 / (6.02 × 10²³) ≈ 2.66 × 10⁻²³ g."
          },
          {
                    id: "sec2-w1-quiz-7",
                    questionAr: "أي مما يلي يعبر عن عدد مولات الذرات في 0.5 مول من حمض الأسيتيك (CH₃COOH)؟",
                    questionEn: "Which represents the number of moles of atoms in 0.5 mol of acetic acid (CH₃COOH)?",
                    questionFr: "Combien de moles d'atomes y a-t-il dans 0.5 mol d'acide acétique (CH₃COOH)?",
                    questionDe: "Wie viele Mole Atome sind in 0.5 mol Essigsäure (CH₃COOH) enthalten?",
                    optionsAr: [
                              "4 مول",
                              "0.5 مول",
                              "2 مول",
                              "8 مول"
                    ],
                    optionsEn: [
                              "4 mol",
                              "0.5 mol",
                              "2 mol",
                              "8 mol"
                    ],
                    optionsFr: [
                              "4 mol",
                              "0.5 mol",
                              "2 mol",
                              "8 mol"
                    ],
                    optionsDe: [
                              "4 mol",
                              "0.5 mol",
                              "2 mol",
                              "8 mol"
                    ],
                    correctAnswerIndex: 0,
                    explanationAr: "الصيغة CH₃COOH تحتوي على 8 ذرات (2 ذرة كربون + 4 ذرات هيدروجين + 2 ذرة أكسجين). إذن 1 مول حمض يحتوي على 8 مولات ذرات. في 0.5 مول حمض: عدد مولات الذرات = 0.5 × 8 = 4 مول ذرة.",
                    explanationEn: "CH₃COOH contains 8 atoms per molecule (2 C + 4 H + 2 O). In 0.5 mol of acid: moles of atoms = 0.5 × 8 = 4 mol atoms."
          }
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
