/**
 * gradesCurriculumData.ts — قاعدة بيانات المناهج والمستويات التتابعية الرسمية (منهج وزارة التربية والتعليم المصرية والبكالوريا)
 * مستوحاة من هيكلية منصة كيريو (QUREO) التفاعلية لربط الدروس بالتجارب المعملية 3D وبنك تقييمات الوزارة.
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 * SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f
 */

export interface CurriculumQuizQuestion {
  id: string;
  questionAr: string;
  questionEn: string;
  optionsAr: string[];
  optionsEn: string[];
  correctAnswerIndex: number;
  explanationAr: string;
  explanationEn: string;
}

export interface CurriculumLesson {
  id: string;
  levelNumber: number;
  titleAr: string;
  titleEn: string;
  unitTitleAr: string;
  unitTitleEn: string;
  bookPageRange?: string;
  linkedLabTab: 'chemistry' | 'physics' | 'anatomy' | 'biology' | 'geology' | 'astronomy';
  linkedLabNameAr: string;
  labPresetAction?: {
    type: 'chemistry_preset' | 'physics_sim' | 'anatomy_focus' | 'biology_model';
    reagents?: string[];
    heat?: boolean;
    anatomySystem?: string;
    physicsSimulation?: string;
  };
  verifiedVideo: {
    titleAr: string;
    youtubeId: string;
    durationMinutes: number;
    channelName: string;
  };
  weeklyAssessment: {
    weekNumber: number;
    titleAr: string;
    questions: CurriculumQuizQuestion[];
  };
}

export interface GradeCurriculum {
  id: string;
  stageAr: string;
  stageEn: string;
  gradeAr: string;
  gradeEn: string;
  subjectAr: string;
  subjectEn: string;
  icon: string;
  color: string;
  textbookPdfName: string;
  descriptionAr: string;
  descriptionEn: string;
  lessons: CurriculumLesson[];
}

export const GRADES_CURRICULUM_DATA: GradeCurriculum[] = [
  // =========================================================================
  // 1. الصف الثاني الثانوي — بكالوريا الفصل الثالث (المواد غير العضوية)
  // =========================================================================
  {
    id: 'sec2_chem_bac',
    stageAr: 'المرحلة الثانوية والبكالوريا',
    stageEn: 'Secondary & Baccalaureate',
    gradeAr: 'الصف الثاني الثانوي (بكالوريا)',
    gradeEn: '2nd Secondary (Baccalaureate)',
    subjectAr: 'الكيمياء — الفصل الثالث (المواد غير العضوية)',
    subjectEn: 'Chemistry — Chapter 3 (Inorganic Chemistry)',
    icon: '🧪',
    color: '#007AFF',
    textbookPdfName: 'Chemistry_Arabic_2_Secondary_TR1.pdf',
    descriptionAr: 'منهج الكيمياء غير العضوية والبكالوريا: تحضير الغازات الصناعية والمعملية، تفاعلات الأكسدة والاختزال، وطريقة هابر-بوش وأوستفالد والكشف عن الغازات.',
    descriptionEn: 'Inorganic Chemistry & Baccalaureate: preparation of industrial gases, redox, Haber-Bosch and Ostwald catalytic syntheses.',
    lessons: [
      {
        id: 'sec2-lesson-1',
        levelNumber: 1,
        titleAr: 'الدرس 1: اختزال الهيدروجين لأكاسيد الفلزات عند درجات حرارة مرتفعة',
        titleEn: 'Lesson 1: High-Temp Hydrogen Reduction of Metal Oxides',
        unitTitleAr: 'الفصل الثالث: خواص وتفاعلات الفلزات والغازات',
        unitTitleEn: 'Chapter 3: Metals & Gas Reactions',
        bookPageRange: 'ص 42 - 47',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل التفاعلات الكيميائية 3D',
        labPresetAction: {
          type: 'chemistry_preset',
          reagents: ['CuO', 'H2'],
          heat: true
        },
        verifiedVideo: {
          titleAr: 'تجربة اختزال أكسيد النحاس الأسود بغاز الهيدروجين وتكون النحاس الأحمر',
          youtubeId: 'q8i6Rk4HhZ8',
          durationMinutes: 4,
          channelName: 'قناة مصر التعليمية ومدرستنا'
        },
        weeklyAssessment: {
          weekNumber: 1,
          titleAr: 'تقييم الأسبوع الأول: اختزال أكاسيد الفلزات',
          questions: [
            {
              id: 'q1-1',
              questionAr: 'عند إمرار غاز الهيدروجين فوق أكسيد النحاس الأسود المسخن لدرجة الاحمرار، ما هو التغير اللوني الملاحظ؟',
              questionEn: 'When hydrogen is passed over red-hot black copper oxide, what color change is observed?',
              optionsAr: [
                'يتحول المسحوق الأسود إلى فلز النحاس الأحمر وتتكثف قطرات الماء',
                'يتحول إلى راسب أزرق مخضر وتتصاعد أبخرة صفراء',
                'يتحول إلى مسحوق أبيض لامع مع تصاعد غاز الأكسجين',
                'لا يحدث أي تغير لوني لعدم توفر عامل مؤكسد'
              ],
              optionsEn: [
                'Black powder turns to reddish-brown copper metal with water condensation',
                'Turns into blue-green precipitate with yellow fumes',
                'Turns into white powder with oxygen release',
                'No color change occurs'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'يعمل غاز الهيدروجين كعامل مختزل قوي فينتزع الأكسجين من CuO مكوناً Cu الأحمر النقي وبخار الماء H2O.',
              explanationEn: 'H2 acts as a reducing agent, reducing black CuO to red elemental copper.'
            },
            {
              id: 'q1-2',
              questionAr: 'ما هو الدور الكيميائي لأكسيد النحاس CuO في هذا التفاعل؟',
              questionEn: 'What is the chemical role of CuO in this reaction?',
              optionsAr: [
                'عامل مؤكسد (يمنح الأكسجين ويحدث له اختزال)',
                'عامل مختزل (يكتسب الأكسجين ويحدث له أكسدة)',
                'عامل حفاز موجب لا يتغير تركيبه',
                'مذيب قطبي غير عضوي'
              ],
              optionsEn: [
                'Oxidizing agent (donates oxygen, undergoes reduction)',
                'Reducing agent (gains oxygen)',
                'Positive heterogeneous catalyst',
                'Inorganic polar solvent'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'CuO يمنح الأكسجين للهيدروجين فيحدث له اختزال، وبالتالي فهو العامل المؤكسد.',
              explanationEn: 'CuO provides oxygen to H2 and gets reduced, making it the oxidizing agent.'
            }
          ]
        }
      },
      {
        id: 'sec2-lesson-2',
        levelNumber: 2,
        titleAr: 'الدرس 2: تحضير غاز الهيدروجين في المعمل بإضافة الحديد لحمض الكبريتيك المخفف',
        titleEn: 'Lesson 2: Hydrogen Gas Prep via Iron & Dilute H2SO4',
        unitTitleAr: 'الفصل الثالث: خواص وتفاعلات الفلزات والغازات',
        unitTitleEn: 'Chapter 3: Metals & Gas Reactions',
        bookPageRange: 'ص 48 - 53',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل التفاعلات الكيميائية 3D',
        labPresetAction: {
          type: 'chemistry_preset',
          reagents: ['Fe', 'H2SO4'],
          heat: false
        },
        verifiedVideo: {
          titleAr: 'تحضير واختبار غاز الهيدروجين وتفاعله مع الأحماض المخففة',
          youtubeId: 'pS3vW9Xk5Z8',
          durationMinutes: 5,
          channelName: 'بوابة التعليم التفاعلي — كيمياء البكالوريا'
        },
        weeklyAssessment: {
          weekNumber: 2,
          titleAr: 'تقييم الأسبوع الثاني: تحضير الهيدروجين وتفاعلات الإحلال',
          questions: [
            {
              id: 'q2-1',
              questionAr: 'ما هو لون المحلول الناتج عند تفاعل برادة الحديد مع حمض الكبريتيك المخفف؟',
              questionEn: 'What is the color of the solution formed when iron reacts with dilute H2SO4?',
              optionsAr: [
                'أخضر باهت لوجود أيونات كبريتات الحديد الثنائي Fe²⁺',
                'أصفر بني لوجود كبريتات الحديد الثلاثي',
                'أزرق سماوي ساطع لوجود النحاس',
                'عديم اللون وشفاف تماماً كالمحلول الحمضي الأصلي'
              ],
              optionsEn: [
                'Pale green due to Fe2+ sulfate ions',
                'Yellow-brown due to Fe3+',
                'Bright royal blue',
                'Completely colorless'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'ينتج كبريتات الحديد الثنائي FeSO4 ذات اللون الأخضر الباهت وتتصاعد فقاعات الهيدروجين H2.',
              explanationEn: 'FeSO4 solution has a characteristic pale green color.'
            },
            {
              id: 'q2-2',
              questionAr: 'كيف نكشف عملياً عن غاز الهيدروجين المتصاعد من الأنبوبة؟',
              questionEn: 'How do we test for the evolving hydrogen gas?',
              optionsAr: [
                'بتقريب شظية مشتعلة فيشتعل بفرقعة خفيفة ولهب أزرق شاحب',
                'بإمراره على ماء الجير الرائق فيتعكر',
                'بتقريب ساق مبللة بالنشادر فتتكون سحب بيضاء',
                'بتقريب ورقة دوار الشمس الجافة فيحولها للأحمر'
              ],
              optionsEn: [
                'Bring a burning splint; it pops with a pale blue flame',
                'Pass through limewater to turn turbid',
                'Bring ammonia rod to form white smoke',
                'Use dry litmus paper'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'غاز الهيدروجين يشتعل بفرقعة مميزة (Pop test) مكوناً بخار ماء.',
              explanationEn: 'H2 gas burns with a distinctive pop sound.'
            }
          ]
        }
      },
      {
        id: 'sec2-lesson-3',
        levelNumber: 3,
        titleAr: 'الدرس 3: تحضير غاز الكلور بتسخين أكسيد المنجنيز الرباعي مع حمض الهيدروكلوريك المركز',
        titleEn: 'Lesson 3: Chlorine Gas Prep via MnO2 & Conc. HCl',
        unitTitleAr: 'الفصل الثالث: الهالوجينات والغازات السامة',
        unitTitleEn: 'Chapter 3: Halogens & Toxic Gases',
        bookPageRange: 'ص 54 - 60',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل التفاعلات الكيميائية 3D',
        labPresetAction: {
          type: 'chemistry_preset',
          reagents: ['MnO2', 'HCl'],
          heat: true
        },
        verifiedVideo: {
          titleAr: 'التجربة المعملية لتحضير غاز الكلور الأخضر المصفر في خزانة الغازات',
          youtubeId: 'k7J3m5p9Q2w',
          durationMinutes: 4,
          channelName: 'معامل البكالوريا الوطنية'
        },
        weeklyAssessment: {
          weekNumber: 3,
          titleAr: 'تقييم الأسبوع الثالث: الهالوجينات وغاز الكلور',
          questions: [
            {
              id: 'q3-1',
              questionAr: 'ما هي الخواص الفيزيائية المميزة لغاز الكلور Cl₂ المتصاعد؟',
              questionEn: 'What are the characteristic physical properties of evolving chlorine gas?',
              optionsAr: [
                'غاز ذو لون أخضر مصفر ورائحة نفاذة خانقة وأثقل من الهواء',
                'غاز عديم اللون والرائحة وأخف بكثير من الهواء',
                'غاز بني محمر ذو رائحة تشبه البيض الفاسد',
                'غاز أزرق ساطع يشتعل ذاتياً عند ملامسة الأكسجين'
              ],
              optionsEn: [
                'Yellowish-green gas with sharp suffocating odor, denser than air',
                'Colorless, odorless gas lighter than air',
                'Red-brown gas smelling like rotten eggs',
                'Blue gas that ignites spontaneously'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'الكلور هالوجين غازي ذو لون أخضر مصفر خانق وكثافته أعلى من كثافة الهواء.',
              explanationEn: 'Chlorine is a yellowish-green, dense, suffocating halogen gas.'
            }
          ]
        }
      },
      {
        id: 'sec2-lesson-4',
        levelNumber: 4,
        titleAr: 'الدرس 4: تحضير غاز الأكسجين بالتحلل الحفزي لفوق أكسيد الهيدروجين (H₂O₂ + MnO₂)',
        titleEn: 'Lesson 4: Catalytic Oxygen Prep via H2O2 & MnO2',
        unitTitleAr: 'الفصل الثالث: الأكسجين والعوامل الحفازة',
        unitTitleEn: 'Chapter 3: Oxygen & Catalysts',
        bookPageRange: 'ص 61 - 66',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل التفاعلات الكيميائية 3D',
        labPresetAction: {
          type: 'chemistry_preset',
          reagents: ['H2O2', 'MnO2'],
          heat: false
        },
        verifiedVideo: {
          titleAr: 'تحضير غاز الأكسجين بتحلل ماء الأكسجين مع ثاني أكسيد المنجنيز',
          youtubeId: 'o4X9m2P1k8w',
          durationMinutes: 3,
          channelName: 'بنك المعرفة المصري ومدرستنا 2'
        },
        weeklyAssessment: {
          weekNumber: 4,
          titleAr: 'تقييم الأسبوع الرابع: التحلل الحفزي وتوليد الأكسجين',
          questions: [
            {
              id: 'q4-1',
              questionAr: 'ماذا يحدث لكتلة وتركيب مسحوق ثاني أكسيد المنجنيز MnO₂ بعد انتهاء التفاعل؟',
              questionEn: 'What happens to the mass and composition of MnO2 after the reaction finishes?',
              optionsAr: [
                'تظل كتلته وخواصه الكيميائية ثابتة دون أي استهلاك لأنه عامل حفاز',
                'تستهلك كتلته بالكامل وتذوب في الماء كأملاح منجنيز',
                'تتضاعف كتلته لاكتسابه ذرات أكسجين إضافية',
                'يتحول لونه من الأسود إلى الأبيض الناصع'
              ],
              optionsEn: [
                'Mass and properties remain unchanged because it acts as a catalyst',
                'Consumed completely into soluble manganese salt',
                'Mass doubles due to added oxygen',
                'Turns from black to bright white'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'العامل الحفاز يخفض طاقة التنشيط ويسرع التفاعل دون أن يشترك في النواتج أو ينقص من كتلته.',
              explanationEn: 'Catalysts accelerate reactions without undergoing permanent chemical change or mass loss.'
            }
          ]
        }
      },
      {
        id: 'sec2-lesson-5',
        levelNumber: 5,
        titleAr: 'الدرس 5: تحضير النشادر (الأمونيا) في الصناعة بطريقة هابر ـ بوش (N₂ + 3H₂ ⇌ 2NH₃)',
        titleEn: 'Lesson 5: Industrial Ammonia Synthesis via Haber-Bosch',
        unitTitleAr: 'الفصل الثالث: الاتزان الكيميائي والصناعات الكبرى',
        unitTitleEn: 'Chapter 3: Equilibrium & Chemical Industry',
        bookPageRange: 'ص 67 - 73',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل التفاعلات الكيميائية 3D',
        labPresetAction: {
          type: 'chemistry_preset',
          reagents: ['N2', 'H2'],
          heat: true
        },
        verifiedVideo: {
          titleAr: 'شرح وتطبيق طريقة هابر بوش لتخليق الأمونيا صناعياً في مصر',
          youtubeId: 'v8N2k4X1p9w',
          durationMinutes: 6,
          channelName: 'قناة النيل التعليمية'
        },
        weeklyAssessment: {
          weekNumber: 5,
          titleAr: 'تقييم الأسبوع الخامس: طريقة هابر-بوش وقاعدة لوشاتيليه',
          questions: [
            {
              id: 'q5-1',
              questionAr: 'لماذا يوضع سهم انعكاسي (⇌) في معادلة تخليق النشادر بطريقة هابر-بوش؟',
              questionEn: 'Why is a reversible arrow (⇌) used in the Haber-Bosch equation?',
              optionsAr: [
                'لأن التفاعل انعكاسي يصل لحالة اتزان ديناميكي بين المتفاعلات والنواتج',
                'لأن التفاعل يسير في اتجاه واحد فقط حتى نفاد النيتروجين كلياً',
                'للإشارة إلى أن التفاعل يحتاج لدرجات حرارة تحت الصفر المئوي',
                'لأن النشادر تنفجر فور تكوينها وتعود لعناصرها'
              ],
              optionsEn: [
                'Because it is a dynamic reversible equilibrium between reactants and products',
                'Because it is an irreversible reaction to completion',
                'Indicates sub-zero temperatures are needed',
                'Because ammonia explodes immediately'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'تفاعل N2 + 3H2 ⇌ 2NH3 تفاعل متزن يخضع لقاعدة لوشاتيليه ويتأثر بالضغط والحرارة.',
              explanationEn: 'The reaction is a reversible equilibrium governed by Le Chatelier principle.'
            }
          ]
        }
      },
      {
        id: 'sec2-lesson-6',
        levelNumber: 6,
        titleAr: 'الدرس 6: تحضير حمض النيتريك في الصناعة بطريقة أوستفالد (أكسدة النشادر بالبلاتين)',
        titleEn: 'Lesson 6: Ostwald Process for Nitric Acid Manufacture',
        unitTitleAr: 'الفصل الثالث: الأحماض المعدنية والصناعات الكيميائية',
        unitTitleEn: 'Chapter 3: Mineral Acids & Chemical Synthesis',
        bookPageRange: 'ص 74 - 81',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل التفاعلات الكيميائية 3D',
        labPresetAction: {
          type: 'chemistry_preset',
          reagents: ['NH3', 'O2'],
          heat: true
        },
        verifiedVideo: {
          titleAr: 'مراحل طريقة أوستفالد لتحضير حمض النيتريك وأكسدة النشادر',
          youtubeId: 'w9M4p2k1Q8x',
          durationMinutes: 5,
          channelName: 'مدرستنا الثانوية'
        },
        weeklyAssessment: {
          weekNumber: 6,
          titleAr: 'تقييم الأسبوع السادس: طريقة أوستفالد وأكاسيد النيتروجين',
          questions: [
            {
              id: 'q6-1',
              questionAr: 'ما هو الغاز ذو اللون البني المحمر الذي يتكون كمركب وسيط في طريقة أوستفالد؟',
              questionEn: 'Which reddish-brown gas forms as an intermediate in the Ostwald process?',
              optionsAr: [
                'غاز ثاني أكسيد النيتروجين NO₂',
                'غاز أكسيد النيتروز (غاز الضحك) N₂O',
                'غاز النشادر NH₃',
                'غاز أول أكسيد الكربون CO'
              ],
              optionsEn: [
                'Nitrogen dioxide gas (NO2)',
                'Nitrous oxide (N2O)',
                'Ammonia (NH3)',
                'Carbon monoxide (CO)'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'يتأكسد NO المتكون في المرحلة الأولى تلقائياً مع أكسجين الهواء إلى غاز NO2 البني المحمر.',
              explanationEn: 'NO rapidly oxidizes in air to form reddish-brown NO2 gas.'
            }
          ]
        }
      },
      {
        id: 'sec2-lesson-7',
        levelNumber: 7,
        titleAr: 'الدرس 7: تحضير غاز أول أكسيد الكربون بالمعمل بنزع الماء من حمض الفورميك',
        titleEn: 'Lesson 7: Preparation of Carbon Monoxide via Formic Acid Dehydration',
        unitTitleAr: 'الفصل الثالث: الكربون وأكاسيده',
        unitTitleEn: 'Chapter 3: Carbon & Its Oxides',
        bookPageRange: 'ص 82 - 88',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل التفاعلات الكيميائية 3D',
        labPresetAction: {
          type: 'chemistry_preset',
          reagents: ['HCOOH', 'H2SO4'],
          heat: true
        },
        verifiedVideo: {
          titleAr: 'تجربة نزع الماء من حمض الفورميك واشتعال غاز أول أكسيد الكربون بلهب أزرق',
          youtubeId: 'z7P3m9k2X1w',
          durationMinutes: 4,
          channelName: 'معامل البكالوريا التفاعلية'
        },
        weeklyAssessment: {
          weekNumber: 7,
          titleAr: 'تقييم الأسبوع السابع: أكاسيد الكربون وخواص CO',
          questions: [
            {
              id: 'q7-1',
              questionAr: 'ما هو الدور الذي يؤديه حمض الكبريتيك المركز في هذا التفاعل؟',
              questionEn: 'What role does concentrated sulfuric acid play in this reaction?',
              optionsAr: [
                'عامل نازع للماء (Dehydrating agent) ينتزع جزيء H₂O من حمض الفورميك',
                'عامل مختزل قوي يمنح إلكترونات لحمض الفورميك',
                'مذيب مائي مخفف لتقليل حرارة التفاعل',
                'كاشف حمضي ملون يتغير لونه للأخضر'
              ],
              optionsEn: [
                'Dehydrating agent stripping H2O from formic acid',
                'Strong reducing agent donating electrons',
                'Diluting aqueous solvent',
                'Color indicator turning green'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'حمض الكبريتيك المركز شره جداً للماء فينزع جزيء الماء من HCOOH ليتحرر غاز CO.',
              explanationEn: 'Conc. H2SO4 acts as a powerful dehydrating agent.'
            }
          ]
        }
      },
      {
        id: 'sec2-lesson-8',
        levelNumber: 8,
        titleAr: 'الدرس 8: تحضير غاز ثاني أكسيد الكربون والكشف عنه بتعكير ماء الجير الرائق',
        titleEn: 'Lesson 8: Preparation and Limewater Test for CO2',
        unitTitleAr: 'الفصل الثالث: الكربونات والكشف التأكيدي',
        unitTitleEn: 'Chapter 3: Carbonates & Confirmatory Tests',
        bookPageRange: 'ص 89 - 96',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل التفاعلات الكيميائية 3D',
        labPresetAction: {
          type: 'chemistry_preset',
          reagents: ['CaCO3', 'HCl'],
          heat: false
        },
        verifiedVideo: {
          titleAr: 'تحضير غاز ثاني أكسيد الكربون والكشف عنه بماء الجير الرائق',
          youtubeId: 'y2K8p4X9m1w',
          durationMinutes: 4,
          channelName: 'قناة مدرستنا 2 — علوم وكيمياء'
        },
        weeklyAssessment: {
          weekNumber: 8,
          titleAr: 'تقييم الأسبوع الثامن: الكشف عن ثاني أكسيد الكربون',
          questions: [
            {
              id: 'q8-1',
              questionAr: 'لماذا يتعكر ماء الجير الرائق (هيدروكسيد الكالسيوم) عند إمرار غاز CO₂ فيه لفترة قصيرة؟',
              questionEn: 'Why does clear limewater turn turbid when CO2 is bubbled for a short time?',
              optionsAr: [
                'بسبب تكون راسب أبيض غير ذائب في الماء من كربونات الكالسيوم CaCO₃',
                'بسبب انحلال هيدروكسيد الكالسيوم وتكون مسحوق الجير الحي CaO',
                'بسبب غليان المحلول وتبخر الماء سريعاً',
                'بسبب تكون بيكربونات الكالسيوم الذائبة في الماء'
              ],
              optionsEn: [
                'Due to precipitation of insoluble white calcium carbonate CaCO3',
                'Due to dissolution of calcium hydroxide into quicklime',
                'Due to rapid boiling of solution',
                'Due to soluble calcium bicarbonate formation'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'تفاعل CO2 مع Ca(OH)2 يعطي كربونات كالسيوم CaCO3 وهي مادة شحيحة الذوبان تظهر كعكارة بيضاء.',
              explanationEn: 'Insoluble CaCO3 precipitates, creating the white cloudy suspension.'
            }
          ]
        }
      }
    ]
  },

  // =========================================================================
  // 2. الصف الأول الثانوي — العلوم المتكاملة (المنهج المطور 2025)
  // =========================================================================
  {
    id: 'sec1_integrated_science',
    stageAr: 'المرحلة الثانوية',
    stageEn: 'Secondary Stage',
    gradeAr: 'الصف الأول الثانوي',
    gradeEn: '1st Secondary',
    subjectAr: 'العلوم المتكاملة (Integrated Science)',
    subjectEn: 'Integrated Science (Physics, Chemistry & Biology)',
    icon: '🧬',
    color: '#34C759',
    textbookPdfName: 'integratedscience_ARABIC_1_Secondary_TR1.pdf',
    descriptionAr: 'منهج العلوم المتكاملة الجديد للثانوية العامة: دمج الفيزياء والكيمياء والأحياء في دراسة النظم البيئية المائية، وتكنولوجيا النانو، والطاقة المستدامة.',
    descriptionEn: 'New integrated STEM science curriculum combining physics, chemistry, and biology in environmental and nanotech studies.',
    lessons: [
      {
        id: 'sec1-lesson-1',
        levelNumber: 1,
        titleAr: 'المحور 1: النظام البيئي المائي والخصائص الكيميائية والفيزيائية للماء',
        titleEn: 'Unit 1: Aquatic Ecosystem & Physicochemical Water Dynamics',
        unitTitleAr: 'المحور الأول: الاستدامة المائية والبيئية',
        unitTitleEn: 'Module 1: Water Sustainability',
        bookPageRange: 'ص 12 - 28',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل الكيمياء والتحليل المائي',
        labPresetAction: {
          type: 'chemistry_preset',
          reagents: ['H2', 'O2'],
          heat: false
        },
        verifiedVideo: {
          titleAr: 'تكامل العلوم في دراسة النظام البيئي المائي — منصة مدرستنا',
          youtubeId: 'e2R8k3P9x1w',
          durationMinutes: 5,
          channelName: 'وزارة التربية والتعليم المصرية'
        },
        weeklyAssessment: {
          weekNumber: 1,
          titleAr: 'تقييم الأسبوع الأول: الخواص الفيزيوكيميائية للماء',
          questions: [
            {
              id: 'sec1-q1',
              questionAr: 'ما هي الخاصية الفريدة التي تمكن الكائنات المائية من البقاء حية في المناطق القطبية المتجمدة؟',
              questionEn: 'Which unique water property allows marine life to survive under frozen polar surfaces?',
              optionsAr: [
                'شذوذ كثافة الماء (يتمدد الماء بالبرودة وتقل كثافة الجليد فيطفو عازلاً للحرارة)',
                'انخفاض الحرارة النوعية للماء مما يجعله يسخن ويبرد بسرعة',
                'قدرة الماء الفائقة على إذابة جميع المركبات غير القطبية',
                'زيادة كثافة الماء عند الصفر المئوي مما يجعله يهبط للقاع'
              ],
              optionsEn: [
                'Density anomaly (ice expands, becomes less dense and floats as an insulator)',
                'Low specific heat capacity',
                'Ability to dissolve nonpolar substances',
                'Higher density at freezing point'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'يتميز الماء بشذوذ الكثافة عند 4 درجات مئوية؛ حيث يتمدد الجليد ويطفو على السطح ليشكل طبقة عازلة تحمي الكائنات الحية في القاع.',
              explanationEn: 'Water expands when freezing, causing ice to float and insulate deep water ecosystems.'
            }
          ]
        }
      },
      {
        id: 'sec1-lesson-2',
        levelNumber: 2,
        titleAr: 'المحور 2: تكنولوجيا النانو وتطبيقاتها في تنقية المياه والطب الحيوي',
        titleEn: 'Unit 2: Nanotechnology in Water Filtration & Biomedicine',
        unitTitleAr: 'المحور الثاني: المواد النانوية والمستقبل',
        unitTitleEn: 'Module 2: Nanomaterials & Future Tech',
        bookPageRange: 'ص 29 - 45',
        linkedLabTab: 'physics',
        linkedLabNameAr: 'معمل الفيزياء والموجات النانوية',
        labPresetAction: {
          type: 'physics_sim',
          physicsSimulation: 'refraction'
        },
        verifiedVideo: {
          titleAr: 'أبعاد المادة وتطبيقات النانو تكنولوجي — أولى ثانوي',
          youtubeId: 'b9M4p2x8Q1w',
          durationMinutes: 6,
          channelName: 'بنك المعرفة المصري'
        },
        weeklyAssessment: {
          weekNumber: 2,
          titleAr: 'تقييم الأسبوع الثاني: مقياس النانو والمساحة السطحية الفائقة',
          questions: [
            {
              id: 'sec1-q2',
              questionAr: 'ما هو السبب العلمي وراء اكتساب المواد النانوية خواص فائقة وغير مسبوقة؟',
              questionEn: 'Why do nanomaterials exhibit unprecedented macroscopic properties?',
              optionsAr: [
                'الزيادة الهائلة في النسبة بين مساحة السطح إلى الحجم',
                'تحول الذرات من الحالة المستقرة إلى الحالة المشعة',
                'فقدان الإلكترونات لمداراتها حول النواة',
                'انخفاض سرعة الضوء داخل المادة النانوية'
              ],
              optionsEn: [
                'Huge increase in surface area to volume ratio',
                'Transition to radioactive state',
                'Loss of orbital electrons',
                'Decrease in speed of light'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'تقسيم المادة لأبعاد النانو يزيد مساحة السطح المعرضة للتفاعل بشكل هائل بالنسبة للحجم.',
              explanationEn: 'Massive surface-area-to-volume ratio at nanoscale triggers unique reactivity.'
            }
          ]
        }
      }
    ]
  },

  // =========================================================================
  // 3. الصف الثالث الإعدادي — العلوم العامة (Prep 3)
  // =========================================================================
  {
    id: 'prep3_science',
    stageAr: 'المرحلة الإعدادية',
    stageEn: 'Preparatory Stage',
    gradeAr: 'الصف الثالث الإعدادي',
    gradeEn: '3rd Preparatory',
    subjectAr: 'العلوم — القوى والحركة والضوء والوراثة',
    subjectEn: 'General Science — Forces, Optics & Genetics',
    icon: '⚡',
    color: '#AF52DE',
    textbookPdfName: 'Science_AR_Prp3_Tr1.pdf',
    descriptionAr: 'منهج العلوم للشهادة الإعدادية: الحركة في اتجاه واحد، السرعة والعجلة، المرايا الكرية والعدسات، نشأة الكون، والانقسام الميتوزي والميوزي.',
    descriptionEn: '3rd Prep Science: linear dynamics, mirrors & lenses, cosmic origin, and mitosis/meiosis.',
    lessons: [
      {
        id: 'prep3-lesson-1',
        levelNumber: 1,
        titleAr: 'الوحدة 1: الحركة في اتجاه واحد ومفهوم السرعة المنتظمة والنسبية',
        titleEn: 'Unit 1: Motion in One Direction & Relative Velocity',
        unitTitleAr: 'الوحدة الأولى: القوى والحركة',
        unitTitleEn: 'Unit 1: Forces & Motion',
        bookPageRange: 'ص 4 - 18',
        linkedLabTab: 'physics',
        linkedLabNameAr: 'معمل الفيزياء والمقذوفات 3D',
        labPresetAction: {
          type: 'physics_sim',
          physicsSimulation: 'projectile'
        },
        verifiedVideo: {
          titleAr: 'تجارب حساب السرعة والعجلة عملياً — الشهادة الإعدادية',
          youtubeId: 'x7K1p3M9w2q',
          durationMinutes: 5,
          channelName: 'قناة مدرستنا الإعدادية'
        },
        weeklyAssessment: {
          weekNumber: 1,
          titleAr: 'تقييم الأسبوع الأول: السرعة والمسافة والزمن',
          questions: [
            {
              id: 'prep3-q1',
              questionAr: 'سيارة تتحرك بسرعة منتظمة 72 كم/ساعة، كم تبلغ سرعتها بوحدة متر/ثانية (م/ث)؟',
              questionEn: 'A car moves at uniform speed of 72 km/h. What is its speed in m/s?',
              optionsAr: [
                '20 م/ث (عن طريق الضرب في 5/18)',
                '15 م/ث',
                '25 م/ث',
                '40 م/ث'
              ],
              optionsEn: [
                '20 m/s (multiplying by 5/18)',
                '15 m/s',
                '25 m/s',
                '40 m/s'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'للتحويل من كم/س إلى م/ث نضرب في 5/18: 72 × (5/18) = 20 م/ث.',
              explanationEn: '72 * (5/18) = 20 m/s.'
            }
          ]
        }
      },
      {
        id: 'prep3-lesson-2',
        levelNumber: 2,
        titleAr: 'الوحدة 2: المرايا الكرية والعدسات وتكوين الصور الحقيقية والتقديرية',
        titleEn: 'Unit 2: Spherical Mirrors, Lenses & Optics',
        unitTitleAr: 'الوحدة الثانية: الطاقة الضوئية',
        unitTitleEn: 'Unit 2: Light Energy',
        bookPageRange: 'ص 22 - 38',
        linkedLabTab: 'physics',
        linkedLabNameAr: 'معمل الفيزياء والبصريات',
        labPresetAction: {
          type: 'physics_sim',
          physicsSimulation: 'optics'
        },
        verifiedVideo: {
          titleAr: 'تجربة تحديد البؤرة والبعد البؤري للمرآة المقعرة عملياً',
          youtubeId: 'j9P2k4X1w8m',
          durationMinutes: 6,
          channelName: 'المركز القومي للمناهج'
        },
        weeklyAssessment: {
          weekNumber: 2,
          titleAr: 'تقييم الأسبوع الثاني: مسارات الأشعة والبعد البؤري',
          questions: [
            {
              id: 'prep3-q2',
              questionAr: 'إذا وُضع جسم عند مركز تكور مرآة مقعرة (م)، أين تتكون الصورة وما هي خواصها؟',
              questionEn: 'If an object is placed at the center of curvature of a concave mirror, where is the image formed?',
              optionsAr: [
                'عند مركز التكور (م)، وتكون حقيقية ومقلوبة ومساوية للجسم',
                'بين البؤرة ومركز التكور، وتكون مصغرة',
                'خلف المرآة، وتكون تقديرية ومعتدلة ومكبرة',
                'في المالانهاية على هيئة بقعة مضيئة'
              ],
              optionsEn: [
                'At center of curvature (C); real, inverted, equal in size',
                'Between focus and center; diminished',
                'Behind mirror; virtual, upright, magnified',
                'At infinity'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'الجسم عند مركز التكور تنعكس أشعته لتلتقي عند مركز التكور وتكون الصورة حقيقية مقلوبة ومساوية للجسم تماماً.',
              explanationEn: 'At center of curvature C, the reflected rays form a real, inverted, equal-sized image at C.'
            }
          ]
        }
      }
    ]
  },

  // =========================================================================
  // 4. الصف الأول الإعدادي — العلوم المطور 2025 (Prep 1)
  // =========================================================================
  {
    id: 'prep1_science',
    stageAr: 'المرحلة الإعدادية',
    stageEn: 'Preparatory Stage',
    gradeAr: 'الصف الأول الإعدادي (المطور)',
    gradeEn: '1st Preparatory (New Curriculum)',
    subjectAr: 'العلوم — المادة والذرة والطاقة الحركية',
    subjectEn: 'General Science — Matter, Atomic Structure & Energy',
    icon: '🔬',
    color: '#00C7BE',
    textbookPdfName: 'Science_Prep1_T1.pdf',
    descriptionAr: 'منهج الصف الأول الإعدادي المطور: المادة وخواصها، الكثافة والطفو، البنية الذرية والإلكترونية، صور الطاقة وتحولاتها.',
    descriptionEn: '1st Prep upgraded science: density & buoyancy, Bohr atomic models, energy transformations.',
    lessons: [
      {
        id: 'prep1-lesson-1',
        levelNumber: 1,
        titleAr: 'الوحدة 1: المادة وخواصها المميزة وحساب الكثافة عملياً',
        titleEn: 'Unit 1: Matter, Properties & Density Calculations',
        unitTitleAr: 'الوحدة الأولى: المادة وتركيبها',
        unitTitleEn: 'Unit 1: Matter & Structure',
        bookPageRange: 'ص 3 - 15',
        linkedLabTab: 'chemistry',
        linkedLabNameAr: 'معمل خواص المادة والجدول الدوري 3D',
        labPresetAction: {
          type: 'chemistry_preset',
          reagents: ['Na', 'H2O'],
          heat: false
        },
        verifiedVideo: {
          titleAr: 'تجارب تعيين كثافة الأجسام الصلبة والطفو والغوص عملياً',
          youtubeId: 'm4X8p2k1Q9w',
          durationMinutes: 4,
          channelName: 'مدرستنا 1 إعدادي'
        },
        weeklyAssessment: {
          weekNumber: 1,
          titleAr: 'تقييم الأسبوع الأول: قانون الكثافة والطفو',
          questions: [
            {
              id: 'prep1-q1',
              questionAr: 'قطعة من معدن كتلتها 78 جرام وحجمها 10 سم³، هل تطفو أم تغوص في الماء (علماً بأن كثافة الماء 1 جم/سم³)؟',
              questionEn: 'A piece of metal has mass 78g and volume 10cm³. Does it float or sink in water (density 1g/cm³)?',
              optionsAr: [
                'تغوص؛ لأن كثافتها (7.8 جم/سم³) أكبر من كثافة الماء',
                'تطفو؛ لأن كتلتها خفيفة جداً',
                'تتعلق في منتصف الماء لتعادل الضغط',
                'تطفو لتكون طبقة زيتية'
              ],
              optionsEn: [
                'Sinks because density (7.8 g/cm³) > water density (1 g/cm³)',
                'Floats because it is light',
                'Suspends midway',
                'Floats forming oily layer'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'الكثافة = الكتلة / الحجم = 78 / 10 = 7.8 جم/سم³. بما أنها أكبر من 1 جم/سم³ فإنها تغوص في الماء.',
              explanationEn: 'Density = mass / volume = 7.8 g/cm³ > 1 g/cm³, so it sinks.'
            }
          ]
        }
      }
    ]
  },

  // =========================================================================
  // 5. الصف الرابع الابتدائي — العلوم المطور (Primary 4)
  // =========================================================================
  {
    id: 'prim4_science',
    stageAr: 'المرحلة الابتدائية',
    stageEn: 'Primary Stage',
    gradeAr: 'الصف الرابع الابتدائي',
    gradeEn: '4th Primary',
    subjectAr: 'العلوم — التكيف والبقاء والطاقة والحركة',
    subjectEn: 'Science — Adaptation, Energy & Motion',
    icon: '🦊',
    color: '#FF9500',
    textbookPdfName: 'Science_Ar_prim4_t1.pdf',
    descriptionAr: 'منهج رابع ابتدائي المطور: التكيف التركيبي والسلوكي، الحواس والضوء، تحولات الطاقة، وتصادم الأجسام وحفظ الطاقة.',
    descriptionEn: '4th Primary science: structural adaptation, animal senses, energy conservation and collision physics.',
    lessons: [
      {
        id: 'prim4-lesson-1',
        levelNumber: 1,
        titleAr: 'المفهوم 1: التكيف من أجل البقاء (ثعلب الفنك، الدب القطبي، حرباء النمر)',
        titleEn: 'Concept 1: Adaptation for Survival',
        unitTitleAr: 'الوحدة الأولى: الأنظمة الحية',
        unitTitleEn: 'Unit 1: Living Systems',
        bookPageRange: 'ص 8 - 25',
        linkedLabTab: 'biology',
        linkedLabNameAr: 'معمل الأحياء والكائنات الحية 3D',
        labPresetAction: {
          type: 'biology_model'
        },
        verifiedVideo: {
          titleAr: 'التكيف التركيبي والسلوكي في الحيوانات — علوم رابعة ابتدائي',
          youtubeId: 'd8M2k4P1q9w',
          durationMinutes: 5,
          channelName: 'مدرستنا 1'
        },
        weeklyAssessment: {
          weekNumber: 1,
          titleAr: 'تقييم الأسبوع الأول: التكيف التركيبي والسلوكي',
          questions: [
            {
              id: 'prim4-q1',
              questionAr: 'الأذنان الطويلتان لثعلب الفنك تعتبر تكيفاً تركيبياً يساعده على:',
              questionEn: 'The long ears of the fennec fox are a structural adaptation that helps it to:',
              optionsAr: [
                'فقد الحرارة لتبريد جسمه في الصحراء الحارة وسماع الفرائس',
                'التدفئة وحبس الهواء الدافئ',
                'السباحة في البرك المائية',
                'تغيير لونه للاختباء بين الصخور'
              ],
              optionsEn: [
                'Radiate body heat in hot desert and detect faint prey sounds',
                'Keep body warm in snow',
                'Swim across rivers',
                'Change color'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'الأذن الكبيرة بها أوعية دموية تساعد في إشعاع وتبريد حرارة الجسم في الصحراء الحارة.',
              explanationEn: 'Large ears help radiate body heat to keep cool in the desert heat.'
            }
          ]
        }
      }
    ]
  },

  // =========================================================================
  // 6. الصف الثالث الثانوي — الثانوية العامة (Sec 3)
  // =========================================================================
  {
    id: 'sec3_general',
    stageAr: 'المرحلة الثانوية',
    stageEn: 'Secondary Stage',
    gradeAr: 'الصف الثالث الثانوي (الثانوية العامة)',
    gradeEn: '3rd Secondary (General Certificate)',
    subjectAr: 'العلوم التخصصية (تشريح وعظام، كيمياء انتقالية، فيزياء حديثة)',
    subjectEn: 'Advanced Sciences (Anatomy, Chemistry, Modern Physics)',
    icon: '🎓',
    color: '#FF2D55',
    textbookPdfName: 'Biology_ARABIC_Sec3.pdf',
    descriptionAr: 'منهج الثانوية العامة التخصصي: الجهاز الهيكلي والدعامة والحركة في الإنسان، العناصر الانتقالية ومعايرة الكيمياء، والفيزياء الحديثة وقوانين كيرشوف.',
    descriptionEn: '3rd Sec Curriculum: full skeletal human anatomy & biomechanics, transition metal chemistry, and advanced physics.',
    lessons: [
      {
        id: 'sec3-lesson-1',
        levelNumber: 1,
        titleAr: 'الفصل 1 (أحياء): الدعامة في الإنسان والهيكل العظمي المحوري والطرفي',
        titleEn: 'Chapter 1: Human Skeletal System & Biomechanics',
        unitTitleAr: 'الباب الأول: التركيب والوظيفة في الكائنات الحية',
        unitTitleEn: 'Unit 1: Structure & Function',
        bookPageRange: 'ص 4 - 24',
        linkedLabTab: 'anatomy',
        linkedLabNameAr: 'أطلس التشريح البشري الطبي 3D',
        labPresetAction: {
          type: 'anatomy_focus',
          anatomySystem: 'skeletal'
        },
        verifiedVideo: {
          titleAr: 'شرح الهيكل العظمي المحوري والطرفي ثلاثي الأبعاد — ثانوية عامة',
          youtubeId: 'h4P8x1k9m2w',
          durationMinutes: 7,
          channelName: 'قناة مصر التعليمية 3 ثانوي'
        },
        weeklyAssessment: {
          weekNumber: 1,
          titleAr: 'تقييم الأسبوع الأول: عدد عظام الهيكل المحوري والطرفي والفقرات',
          questions: [
            {
              id: 'sec3-q1',
              questionAr: 'كم يبلغ عدد عظام الهيكل العظمي في جسم الإنسان البالغ السليم؟',
              questionEn: 'How many bones are there in the healthy adult human skeleton?',
              optionsAr: [
                '206 عظمة (80 عظمة في الهيكل المحوري و 126 عظمة في الهيكل الطرفي)',
                '300 عظمة متصلة بالكامل',
                '180 عظمة فقط',
                '250 عظمة'
              ],
              optionsEn: [
                '206 bones (80 axial + 126 appendicular)',
                '300 bones',
                '180 bones',
                '250 bones'
              ],
              correctAnswerIndex: 0,
              explanationAr: 'يحتوي الهيكل العظمي للبالغ على 206 عظمة موزعة بين الهيكل المحوري (80 عظمة) والطرفي (126 عظمة).',
              explanationEn: 'The adult human skeleton consists of 206 distinct articulated bones.'
            }
          ]
        }
      }
    ]
  }
];

export function getCurriculumByGradeId(gradeId: string): GradeCurriculum {
  return GRADES_CURRICULUM_DATA.find(g => g.id === gradeId) || GRADES_CURRICULUM_DATA[0];
}
