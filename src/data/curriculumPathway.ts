/**
 * curriculumPathway.ts — single, grade-free chemistry pathway.
 * Content is preserved from the Egyptian Baccalaureate inorganic chemistry unit.
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

export interface CurriculumPathway {
  id: string;
  titleAr: string;
  titleEn: string;
  subjectAr: string;
  subjectEn: string;
  textbookPdfName: string;
  descriptionAr: string;
  descriptionEn: string;
  lessons: CurriculumLesson[];
}

export const CURRICULUM_PATHWAY: CurriculumPathway = {
  "id": "chem_inorganic_synthesis",
  "titleAr": "الكيمياء · تحضير الغازات والمواد غير العضوية",
  "titleEn": "Chemistry · Inorganic Synthesis Pathway",
  "subjectAr": "الكيمياء — الفصل الثالث: تحضير الغازات والمواد غير العضوية",
  "subjectEn": "Chemistry — Chapter 3: Inorganic Gas Synthesis",
  "textbookPdfName": "Inorganic_Chemistry_Experiments.pdf",
  "descriptionAr": "منهج الكيمياء غير العضوية: تحضير الغازات الصناعية والمعملية، تفاعلات الأكسدة والاختزال، وطريقة هابر-بوش وأوستفالد والكشف عن الغازات.",
  "descriptionEn": "Inorganic Chemistry: preparation of industrial gases, redox, Haber-Bosch and Ostwald catalytic syntheses.",
  "lessons": [
    {
      "id": "sec2-lesson-1",
      "levelNumber": 1,
      "titleAr": "الدرس 1: اختزال الهيدروجين لأكاسيد الفلزات عند درجات حرارة مرتفعة",
      "titleEn": "Lesson 1: High-Temp Hydrogen Reduction of Metal Oxides",
      "unitTitleAr": "الفصل الثالث: خواص وتفاعلات الفلزات والغازات",
      "unitTitleEn": "Chapter 3: Metals & Gas Reactions",
      "bookPageRange": "ص 42 - 47",
      "linkedLabTab": "chemistry",
      "linkedLabNameAr": "معمل التفاعلات الكيميائية 3D",
      "labPresetAction": {
        "type": "chemistry_preset",
        "reagents": [
          "CuO",
          "H2"
        ],
        "heat": true
      },
      "verifiedVideo": {
        "titleAr": "تجربة اختزال أكسيد النحاس الأسود بغاز الهيدروجين وتكون النحاس الأحمر",
        "youtubeId": "q8i6Rk4HhZ8",
        "durationMinutes": 4,
        "channelName": "قناة مصر التعليمية ومدرستنا"
      },
      "weeklyAssessment": {
        "weekNumber": 1,
        "titleAr": "تقييم الأسبوع الأول: اختزال أكاسيد الفلزات",
        "questions": [
          {
            "id": "q1-1",
            "questionAr": "عند إمرار غاز الهيدروجين فوق أكسيد النحاس الأسود المسخن لدرجة الاحمرار، ما هو التغير اللوني الملاحظ؟",
            "questionEn": "When hydrogen is passed over red-hot black copper oxide, what color change is observed?",
            "optionsAr": [
              "يتحول المسحوق الأسود إلى فلز النحاس الأحمر وتتكثف قطرات الماء",
              "يتحول إلى راسب أزرق مخضر وتتصاعد أبخرة صفراء",
              "يتحول إلى مسحوق أبيض لامع مع تصاعد غاز الأكسجين",
              "لا يحدث أي تغير لوني لعدم توفر عامل مؤكسد"
            ],
            "optionsEn": [
              "Black powder turns to reddish-brown copper metal with water condensation",
              "Turns into blue-green precipitate with yellow fumes",
              "Turns into white powder with oxygen release",
              "No color change occurs"
            ],
            "correctAnswerIndex": 0,
            "explanationAr": "يعمل غاز الهيدروجين كعامل مختزل قوي فينتزع الأكسجين من CuO مكوناً Cu الأحمر النقي وبخار الماء H2O.",
            "explanationEn": "H2 acts as a reducing agent, reducing black CuO to red elemental copper."
          },
          {
            "id": "q1-2",
            "questionAr": "ما هو الدور الكيميائي لأكسيد النحاس CuO في هذا التفاعل؟",
            "questionEn": "What is the chemical role of CuO in this reaction?",
            "optionsAr": [
              "عامل مؤكسد (يمنح الأكسجين ويحدث له اختزال)",
              "عامل مختزل (يكتسب الأكسجين ويحدث له أكسدة)",
              "عامل حفاز موجب لا يتغير تركيبه",
              "مذيب قطبي غير عضوي"
            ],
            "optionsEn": [
              "Oxidizing agent (donates oxygen, undergoes reduction)",
              "Reducing agent (gains oxygen)",
              "Positive heterogeneous catalyst",
              "Inorganic polar solvent"
            ],
            "correctAnswerIndex": 0,
            "explanationAr": "CuO يمنح الأكسجين للهيدروجين فيحدث له اختزال، وبالتالي فهو العامل المؤكسد.",
            "explanationEn": "CuO provides oxygen to H2 and gets reduced, making it the oxidizing agent."
          }
        ]
      }
    },
    {
      "id": "sec2-lesson-2",
      "levelNumber": 2,
      "titleAr": "الدرس 2: تحضير غاز الهيدروجين في المعمل بإضافة الحديد لحمض الكبريتيك المخفف",
      "titleEn": "Lesson 2: Hydrogen Gas Prep via Iron & Dilute H2SO4",
      "unitTitleAr": "الفصل الثالث: خواص وتفاعلات الفلزات والغازات",
      "unitTitleEn": "Chapter 3: Metals & Gas Reactions",
      "bookPageRange": "ص 48 - 53",
      "linkedLabTab": "chemistry",
      "linkedLabNameAr": "معمل التفاعلات الكيميائية 3D",
      "labPresetAction": {
        "type": "chemistry_preset",
        "reagents": [
          "Fe",
          "H2SO4"
        ],
        "heat": false
      },
      "verifiedVideo": {
        "titleAr": "تحضير واختبار غاز الهيدروجين وتفاعله مع الأحماض المخففة",
        "youtubeId": "pS3vW9Xk5Z8",
        "durationMinutes": 5,
        "channelName": "بوابة التعليم التفاعلي — الكيمياء غير العضوية"
      },
      "weeklyAssessment": {
        "weekNumber": 2,
        "titleAr": "تقييم الأسبوع الثاني: تحضير الهيدروجين وتفاعلات الإحلال",
        "questions": [
          {
            "id": "q2-1",
            "questionAr": "ما هو لون المحلول الناتج عند تفاعل برادة الحديد مع حمض الكبريتيك المخفف؟",
            "questionEn": "What is the color of the solution formed when iron reacts with dilute H2SO4?",
            "optionsAr": [
              "أخضر باهت لوجود أيونات كبريتات الحديد الثنائي Fe²⁺",
              "أصفر بني لوجود كبريتات الحديد الثلاثي",
              "أزرق سماوي ساطع لوجود النحاس",
              "عديم اللون وشفاف تماماً كالمحلول الحمضي الأصلي"
            ],
            "optionsEn": [
              "Pale green due to Fe2+ sulfate ions",
              "Yellow-brown due to Fe3+",
              "Bright royal blue",
              "Completely colorless"
            ],
            "correctAnswerIndex": 0,
            "explanationAr": "ينتج كبريتات الحديد الثنائي FeSO4 ذات اللون الأخضر الباهت وتتصاعد فقاعات الهيدروجين H2.",
            "explanationEn": "FeSO4 solution has a characteristic pale green color."
          },
          {
            "id": "q2-2",
            "questionAr": "كيف نكشف عملياً عن غاز الهيدروجين المتصاعد من الأنبوبة؟",
            "questionEn": "How do we test for the evolving hydrogen gas?",
            "optionsAr": [
              "بتقريب شظية مشتعلة فيشتعل بفرقعة خفيفة ولهب أزرق شاحب",
              "بإمراره على ماء الجير الرائق فيتعكر",
              "بتقريب ساق مبللة بالنشادر فتتكون سحب بيضاء",
              "بتقريب ورقة دوار الشمس الجافة فيحولها للأحمر"
            ],
            "optionsEn": [
              "Bring a burning splint; it pops with a pale blue flame",
              "Pass through limewater to turn turbid",
              "Bring ammonia rod to form white smoke",
              "Use dry litmus paper"
            ],
            "correctAnswerIndex": 0,
            "explanationAr": "غاز الهيدروجين يشتعل بفرقعة مميزة (Pop test) مكوناً بخار ماء.",
            "explanationEn": "H2 gas burns with a distinctive pop sound."
          }
        ]
      }
    },
    {
      "id": "sec2-lesson-3",
      "levelNumber": 3,
      "titleAr": "الدرس 3: تحضير غاز الكلور بتسخين أكسيد المنجنيز الرباعي مع حمض الهيدروكلوريك المركز",
      "titleEn": "Lesson 3: Chlorine Gas Prep via MnO2 & Conc. HCl",
      "unitTitleAr": "الفصل الثالث: الهالوجينات والغازات السامة",
      "unitTitleEn": "Chapter 3: Halogens & Toxic Gases",
      "bookPageRange": "ص 54 - 60",
      "linkedLabTab": "chemistry",
      "linkedLabNameAr": "معمل التفاعلات الكيميائية 3D",
      "labPresetAction": {
        "type": "chemistry_preset",
        "reagents": [
          "MnO2",
          "HCl"
        ],
        "heat": true
      },
      "verifiedVideo": {
        "titleAr": "التجربة المعملية لتحضير غاز الكلور الأخضر المصفر في خزانة الغازات",
        "youtubeId": "k7J3m5p9Q2w",
        "durationMinutes": 4,
        "channelName": "المعامل الكيميائية التفاعلية"
      },
      "weeklyAssessment": {
        "weekNumber": 3,
        "titleAr": "تقييم الأسبوع الثالث: الهالوجينات وغاز الكلور",
        "questions": [
          {
            "id": "q3-1",
            "questionAr": "ما هي الخواص الفيزيائية المميزة لغاز الكلور Cl₂ المتصاعد؟",
            "questionEn": "What are the characteristic physical properties of evolving chlorine gas?",
            "optionsAr": [
              "غاز ذو لون أخضر مصفر ورائحة نفاذة خانقة وأثقل من الهواء",
              "غاز عديم اللون والرائحة وأخف بكثير من الهواء",
              "غاز بني محمر ذو رائحة تشبه البيض الفاسد",
              "غاز أزرق ساطع يشتعل ذاتياً عند ملامسة الأكسجين"
            ],
            "optionsEn": [
              "Yellowish-green gas with sharp suffocating odor, denser than air",
              "Colorless, odorless gas lighter than air",
              "Red-brown gas smelling like rotten eggs",
              "Blue gas that ignites spontaneously"
            ],
            "correctAnswerIndex": 0,
            "explanationAr": "الكلور هالوجين غازي ذو لون أخضر مصفر خانق وكثافته أعلى من كثافة الهواء.",
            "explanationEn": "Chlorine is a yellowish-green, dense, suffocating halogen gas."
          }
        ]
      }
    },
    {
      "id": "sec2-lesson-4",
      "levelNumber": 4,
      "titleAr": "الدرس 4: تحضير غاز الأكسجين بالتحلل الحفزي لفوق أكسيد الهيدروجين (H₂O₂ + MnO₂)",
      "titleEn": "Lesson 4: Catalytic Oxygen Prep via H2O2 & MnO2",
      "unitTitleAr": "الفصل الثالث: الأكسجين والعوامل الحفازة",
      "unitTitleEn": "Chapter 3: Oxygen & Catalysts",
      "bookPageRange": "ص 61 - 66",
      "linkedLabTab": "chemistry",
      "linkedLabNameAr": "معمل التفاعلات الكيميائية 3D",
      "labPresetAction": {
        "type": "chemistry_preset",
        "reagents": [
          "H2O2",
          "MnO2"
        ],
        "heat": false
      },
      "verifiedVideo": {
        "titleAr": "تحضير غاز الأكسجين بتحلل ماء الأكسجين مع ثاني أكسيد المنجنيز",
        "youtubeId": "o4X9m2P1k8w",
        "durationMinutes": 3,
        "channelName": "بنك المعرفة المصري ومدرستنا 2"
      },
      "weeklyAssessment": {
        "weekNumber": 4,
        "titleAr": "تقييم الأسبوع الرابع: التحلل الحفزي وتوليد الأكسجين",
        "questions": [
          {
            "id": "q4-1",
            "questionAr": "ماذا يحدث لكتلة وتركيب مسحوق ثاني أكسيد المنجنيز MnO₂ بعد انتهاء التفاعل؟",
            "questionEn": "What happens to the mass and composition of MnO2 after the reaction finishes?",
            "optionsAr": [
              "تظل كتلته وخواصه الكيميائية ثابتة دون أي استهلاك لأنه عامل حفاز",
              "تستهلك كتلته بالكامل وتذوب في الماء كأملاح منجنيز",
              "تتضاعف كتلته لاكتسابه ذرات أكسجين إضافية",
              "يتحول لونه من الأسود إلى الأبيض الناصع"
            ],
            "optionsEn": [
              "Mass and properties remain unchanged because it acts as a catalyst",
              "Consumed completely into soluble manganese salt",
              "Mass doubles due to added oxygen",
              "Turns from black to bright white"
            ],
            "correctAnswerIndex": 0,
            "explanationAr": "العامل الحفاز يخفض طاقة التنشيط ويسرع التفاعل دون أن يشترك في النواتج أو ينقص من كتلته.",
            "explanationEn": "Catalysts accelerate reactions without undergoing permanent chemical change or mass loss."
          }
        ]
      }
    },
    {
      "id": "sec2-lesson-5",
      "levelNumber": 5,
      "titleAr": "الدرس 5: تحضير النشادر (الأمونيا) في الصناعة بطريقة هابر ـ بوش (N₂ + 3H₂ ⇌ 2NH₃)",
      "titleEn": "Lesson 5: Industrial Ammonia Synthesis via Haber-Bosch",
      "unitTitleAr": "الفصل الثالث: الاتزان الكيميائي والصناعات الكبرى",
      "unitTitleEn": "Chapter 3: Equilibrium & Chemical Industry",
      "bookPageRange": "ص 67 - 73",
      "linkedLabTab": "chemistry",
      "linkedLabNameAr": "معمل التفاعلات الكيميائية 3D",
      "labPresetAction": {
        "type": "chemistry_preset",
        "reagents": [
          "N2",
          "H2"
        ],
        "heat": true
      },
      "verifiedVideo": {
        "titleAr": "شرح وتطبيق طريقة هابر بوش لتخليق الأمونيا صناعياً في مصر",
        "youtubeId": "v8N2k4X1p9w",
        "durationMinutes": 6,
        "channelName": "قناة النيل التعليمية"
      },
      "weeklyAssessment": {
        "weekNumber": 5,
        "titleAr": "تقييم الأسبوع الخامس: طريقة هابر-بوش وقاعدة لوشاتيليه",
        "questions": [
          {
            "id": "q5-1",
            "questionAr": "لماذا يوضع سهم انعكاسي (⇌) في معادلة تخليق النشادر بطريقة هابر-بوش؟",
            "questionEn": "Why is a reversible arrow (⇌) used in the Haber-Bosch equation?",
            "optionsAr": [
              "لأن التفاعل انعكاسي يصل لحالة اتزان ديناميكي بين المتفاعلات والنواتج",
              "لأن التفاعل يسير في اتجاه واحد فقط حتى نفاد النيتروجين كلياً",
              "للإشارة إلى أن التفاعل يحتاج لدرجات حرارة تحت الصفر المئوي",
              "لأن النشادر تنفجر فور تكوينها وتعود لعناصرها"
            ],
            "optionsEn": [
              "Because it is a dynamic reversible equilibrium between reactants and products",
              "Because it is an irreversible reaction to completion",
              "Indicates sub-zero temperatures are needed",
              "Because ammonia explodes immediately"
            ],
            "correctAnswerIndex": 0,
            "explanationAr": "تفاعل N2 + 3H2 ⇌ 2NH3 تفاعل متزن يخضع لقاعدة لوشاتيليه ويتأثر بالضغط والحرارة.",
            "explanationEn": "The reaction is a reversible equilibrium governed by Le Chatelier principle."
          }
        ]
      }
    },
    {
      "id": "sec2-lesson-6",
      "levelNumber": 6,
      "titleAr": "الدرس 6: تحضير حمض النيتريك في الصناعة بطريقة أوستفالد (أكسدة النشادر بالبلاتين)",
      "titleEn": "Lesson 6: Ostwald Process for Nitric Acid Manufacture",
      "unitTitleAr": "الفصل الثالث: الأحماض المعدنية والصناعات الكيميائية",
      "unitTitleEn": "Chapter 3: Mineral Acids & Chemical Synthesis",
      "bookPageRange": "ص 74 - 81",
      "linkedLabTab": "chemistry",
      "linkedLabNameAr": "معمل التفاعلات الكيميائية 3D",
      "labPresetAction": {
        "type": "chemistry_preset",
        "reagents": [
          "NH3",
          "O2"
        ],
        "heat": true
      },
      "verifiedVideo": {
        "titleAr": "مراحل طريقة أوستفالد لتحضير حمض النيتريك وأكسدة النشادر",
        "youtubeId": "w9M4p2k1Q8x",
        "durationMinutes": 5,
        "channelName": "منصة مدرستنا التعليمية"
      },
      "weeklyAssessment": {
        "weekNumber": 6,
        "titleAr": "تقييم الأسبوع السادس: طريقة أوستفالد وأكاسيد النيتروجين",
        "questions": [
          {
            "id": "q6-1",
            "questionAr": "ما هو الغاز ذو اللون البني المحمر الذي يتكون كمركب وسيط في طريقة أوستفالد؟",
            "questionEn": "Which reddish-brown gas forms as an intermediate in the Ostwald process?",
            "optionsAr": [
              "غاز ثاني أكسيد النيتروجين NO₂",
              "غاز أكسيد النيتروز (غاز الضحك) N₂O",
              "غاز النشادر NH₃",
              "غاز أول أكسيد الكربون CO"
            ],
            "optionsEn": [
              "Nitrogen dioxide gas (NO2)",
              "Nitrous oxide (N2O)",
              "Ammonia (NH3)",
              "Carbon monoxide (CO)"
            ],
            "correctAnswerIndex": 0,
            "explanationAr": "يتأكسد NO المتكون في المرحلة الأولى تلقائياً مع أكسجين الهواء إلى غاز NO2 البني المحمر.",
            "explanationEn": "NO rapidly oxidizes in air to form reddish-brown NO2 gas."
          }
        ]
      }
    },
    {
      "id": "sec2-lesson-7",
      "levelNumber": 7,
      "titleAr": "الدرس 7: تحضير غاز أول أكسيد الكربون بالمعمل بنزع الماء من حمض الفورميك",
      "titleEn": "Lesson 7: Preparation of Carbon Monoxide via Formic Acid Dehydration",
      "unitTitleAr": "الفصل الثالث: الكربون وأكاسيده",
      "unitTitleEn": "Chapter 3: Carbon & Its Oxides",
      "bookPageRange": "ص 82 - 88",
      "linkedLabTab": "chemistry",
      "linkedLabNameAr": "معمل التفاعلات الكيميائية 3D",
      "labPresetAction": {
        "type": "chemistry_preset",
        "reagents": [
          "HCOOH",
          "H2SO4"
        ],
        "heat": true
      },
      "verifiedVideo": {
        "titleAr": "تجربة نزع الماء من حمض الفورميك واشتعال غاز أول أكسيد الكربون بلهب أزرق",
        "youtubeId": "z7P3m9k2X1w",
        "durationMinutes": 4,
        "channelName": "المعامل العلمية التفاعلية"
      },
      "weeklyAssessment": {
        "weekNumber": 7,
        "titleAr": "تقييم الأسبوع السابع: أكاسيد الكربون وخواص CO",
        "questions": [
          {
            "id": "q7-1",
            "questionAr": "ما هو الدور الذي يؤديه حمض الكبريتيك المركز في هذا التفاعل؟",
            "questionEn": "What role does concentrated sulfuric acid play in this reaction?",
            "optionsAr": [
              "عامل نازع للماء (Dehydrating agent) ينتزع جزيء H₂O من حمض الفورميك",
              "عامل مختزل قوي يمنح إلكترونات لحمض الفورميك",
              "مذيب مائي مخفف لتقليل حرارة التفاعل",
              "كاشف حمضي ملون يتغير لونه للأخضر"
            ],
            "optionsEn": [
              "Dehydrating agent stripping H2O from formic acid",
              "Strong reducing agent donating electrons",
              "Diluting aqueous solvent",
              "Color indicator turning green"
            ],
            "correctAnswerIndex": 0,
            "explanationAr": "حمض الكبريتيك المركز شره جداً للماء فينزع جزيء الماء من HCOOH ليتحرر غاز CO.",
            "explanationEn": "Conc. H2SO4 acts as a powerful dehydrating agent."
          }
        ]
      }
    },
    {
      "id": "sec2-lesson-8",
      "levelNumber": 8,
      "titleAr": "الدرس 8: تحضير غاز ثاني أكسيد الكربون والكشف عنه بتعكير ماء الجير الرائق",
      "titleEn": "Lesson 8: Preparation and Limewater Test for CO2",
      "unitTitleAr": "الفصل الثالث: الكربونات والكشف التأكيدي",
      "unitTitleEn": "Chapter 3: Carbonates & Confirmatory Tests",
      "bookPageRange": "ص 89 - 96",
      "linkedLabTab": "chemistry",
      "linkedLabNameAr": "معمل التفاعلات الكيميائية 3D",
      "labPresetAction": {
        "type": "chemistry_preset",
        "reagents": [
          "CaCO3",
          "HCl"
        ],
        "heat": false
      },
      "verifiedVideo": {
        "titleAr": "تحضير غاز ثاني أكسيد الكربون والكشف عنه بماء الجير الرائق",
        "youtubeId": "y2K8p4X9m1w",
        "durationMinutes": 4,
        "channelName": "قناة مدرستنا 2 — علوم وكيمياء"
      },
      "weeklyAssessment": {
        "weekNumber": 8,
        "titleAr": "تقييم الأسبوع الثامن: الكشف عن ثاني أكسيد الكربون",
        "questions": [
          {
            "id": "q8-1",
            "questionAr": "لماذا يتعكر ماء الجير الرائق (هيدروكسيد الكالسيوم) عند إمرار غاز CO₂ فيه لفترة قصيرة؟",
            "questionEn": "Why does clear limewater turn turbid when CO2 is bubbled for a short time?",
            "optionsAr": [
              "بسبب تكون راسب أبيض غير ذائب في الماء من كربونات الكالسيوم CaCO₃",
              "بسبب انحلال هيدروكسيد الكالسيوم وتكون مسحوق الجير الحي CaO",
              "بسبب غليان المحلول وتبخر الماء سريعاً",
              "بسبب تكون بيكربونات الكالسيوم الذائبة في الماء"
            ],
            "optionsEn": [
              "Due to precipitation of insoluble white calcium carbonate CaCO3",
              "Due to dissolution of calcium hydroxide into quicklime",
              "Due to rapid boiling of solution",
              "Due to soluble calcium bicarbonate formation"
            ],
            "correctAnswerIndex": 0,
            "explanationAr": "تفاعل CO2 مع Ca(OH)2 يعطي كربونات كالسيوم CaCO3 وهي مادة شحيحة الذوبان تظهر كعكارة بيضاء.",
            "explanationEn": "Insoluble CaCO3 precipitates, creating the white cloudy suspension."
          }
        ]
      }
    }
  ]
};
