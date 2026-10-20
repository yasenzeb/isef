import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Bot,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  HelpCircle,
  Lightbulb,
  X,
  Minimize2,
  Maximize2,
  Flame,
  Atom,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'shareh';
  text: string;
  timestamp: number;
  suggestions?: string[];
}

interface SharehAIProps {
  currentTab: string;
}

// Deep Scientific Knowledge Base covering all labs in SciNexa
const LAB_KNOWLEDGE: Record<string, {
  nameAr: string;
  nameEn: string;
  welcomeAr: string;
  welcomeEn: string;
  defaultQuestionsAr: string[];
  defaultQuestionsEn: string[];
  knowledge: { keywords: string[]; answerAr: string; answerEn: string }[];
}> = {
  home: {
    nameAr: 'المنصة العلمية العامة',
    nameEn: 'SciNexa Matrix',
    welcomeAr: 'أهلاً بك يا بطل! أنا "شارح" معلمك ورفيقك العلمي الذكي في SciNexa. تحب نبدأ بأي معمل اليوم؟ عندنا تشريح 3D، فيزياء، كيمياء تفاعلية، أحياء، جيولوجيا وفلك!',
    welcomeEn: 'Welcome champion! I am "Shareh", your AI Science Tutor in SciNexa. Which lab would you like to explore today? We have 3D Anatomy, Physics, Chemistry, Biology, Geology, and Astronomy!',
    defaultQuestionsAr: [
      'ما هي أهداف منصة SciNexa لمسابقة آيسف؟',
      'كيف أبدأ تجربة تفاعلية ممتعة في الكيمياء؟',
      'إزاي أفحص عظام جسم الإنسان 3D؟'
    ],
    defaultQuestionsEn: [
      'What are SciNexa engineering goals for ISEF?',
      'How to run an interactive chemical reaction?',
      'How do I inspect 3D human bones?'
    ],
    knowledge: [
      {
        keywords: ['آيسف', 'isef', 'مشروع', 'هدف', 'ساينكسا', 'scinexa', 'منصة', 'فكرة'],
        answerAr: 'منصة SciNexa هي مشروع علمي رائد في مسابقة ISEF يهدف إلى حل عجز التجهيزات المخبرية والتشريحية في المدارس. توفر المنصة محاكيات حقيقية بالمعادلات الرياضية وأطلس تشريح 3D متكامل يعمل بدون إنترنت ومجاناً 100%!',
        answerEn: 'SciNexa is an ISEF research platform solving lab equipment shortages by providing real-time physics solvers, 3D medical anatomy, and chemistry engines that run 100% offline and free.'
      },
      {
        keywords: ['شارح', 'مين انت', 'مين أنت', 'عبدالله', 'عنان', 'اسمك'],
        answerAr: 'أنا "شارح"! مساعدك العلمي الذكي المستوحى من روح تبسيط العلوم وحب الاستكشاف والتجربة العملية، ومهمتي أشرحلك كل خطوة في المعامل الافتراضية وأساعدك تفكر وتكتشف الإجابة بنفسك!',
        answerEn: 'I am "Shareh"! Your AI science companion inspired by experiential science learning. My goal is to guide you through virtual simulations and help you discover scientific principles hands-on!'
      }
    ]
  },
  anatomy: {
    nameAr: 'أطلس التشريح البشري 3D',
    nameEn: '3D Human Anatomy Atlas',
    welcomeAr: 'أهلاً بك في معمل التشريح البشري ثلاثي الأبعاد! هنا تقدر تفحص الـ 210 عظمة وكل أجهزة الجسم السبعة. اسألني عن أي عظمة أو عضو وسأشرحلك موقعه ووظيفته السريرية!',
    welcomeEn: 'Welcome to the 3D Anatomy Lab! Here you can inspect all 210 human bones and 7 vital systems. Ask me about any organ or bone and I will explain its anatomical function!',
    defaultQuestionsAr: [
      'كم عدد عظام جسم الإنسان البالغ؟',
      'ما هي أطول وأقوى عظمة في الجسم؟',
      'كيف تعمل عضلات الذراع (الباي والتراي) في الثني والبسط؟',
      'ما الفرق بين العظم والغضروف؟'
    ],
    defaultQuestionsEn: [
      'How many bones are in the adult human body?',
      'What is the longest and strongest bone?',
      'How do biceps and triceps coordinate motion?',
      'What is the difference between bone and cartilage?'
    ],
    knowledge: [
      {
        keywords: ['عظام', 'عدد', 'عظمة', 'bones', 'كم'],
        answerAr: 'يحتوي جسم الإنسان البالغ على 206 إلى 210 عظمة معتمدة وفق المعاجم التشريحية العالمية. ترتبط العظام بالمفاصل وتتحرك بواسطة أوتار العضلات، وتحمي الأعضاء الحيوية مثل الجمجمة للمخ والقفص الصدري للقلب والرئتين.',
        answerEn: 'The adult human skeleton comprises 206-210 bones articulated via synovial joints, safeguarding vital organs like the brain, heart, and lungs.'
      },
      {
        keywords: ['فخذ', 'femur', 'أطول', 'أقوى'],
        answerAr: 'عظم الفخذ (Femur) هو أطول وأقوى وأثقل عظمة في جسم الإنسان على الإطلاق! يتحمل وزناً هائلاً أثناء الجري والقفز، ويتفصل بالأعلى مع الحوض عبر المفصل الكروي الحقي وبالأسفل مع قصبة الساق والرضفة.',
        answerEn: 'The Femur (thigh bone) is the longest, heaviest, and strongest bone in the human body, articulating with the acetabulum of the pelvis and the tibia at the knee.'
      },
      {
        keywords: ['قلب', 'heart', 'دورة', 'دم'],
        answerAr: 'القلب هو مضخة عضلية مجوفة بحجم قبضة اليد تنبض حوالي 100,000 مرة يومياً. يتكون من 4 غرف (أذينان وبطينان) ويضخ الدم المحمل بالأكسجين عبر الشريان الأورطي للجسم والدم غير المؤكسج للرئتين.',
        answerEn: 'The heart is a muscular organ pumping ~100,000 times daily across four chambers (two atria, two ventricles), distributing oxygenated blood via the aorta.'
      },
      {
        keywords: ['جمجمة', 'skull', 'cranium', 'مخ'],
        answerAr: 'الجمجمة تتكون من 22 عظمة (8 عظام قحفية تحمي الدماغ و14 عظمة وجهية). العظمة الوحيدة المتحركة في الجمجمة هي الفك السفلي (Mandible) مما يمكننا من المضغ والكلام!',
        answerEn: 'The human skull contains 22 bones. The cranium encloses the brain, and the mandible (lower jaw) is the only movable bone, facilitating mastication and speech.'
      },
      {
        keywords: ['غضروف', 'cartilage', 'أنف', 'مفصل'],
        answerAr: 'الغضروف نسيج ضام مرن لا يحتوي على أوعية دموية أو أعصاب حسية مباشرة، مثل غضروف الأنف وصيوان الأذن والغضاريف الضلعية والوسائد بين الفقرات لمنع احتكاك العظام.',
        answerEn: 'Cartilage is a flexible connective tissue lacking direct blood vessels, cushioning joints (intervertebral discs, costal cartilage) and shaping the nose and ears.'
      }
    ]
  },
  physics: {
    nameAr: 'مختبر الفيزياء والدوائر والموجات',
    nameEn: 'Physics & Circuit Lab',
    welcomeAr: 'يا مرحب في معمل الفيزياء! هنا تقدر تبني دوائر تيار مستمر DC وتشوف حركة الإلكترونات، أو تحسب سرعة الموجات وقوانين نيوتن وانكسار الضوء. عايز نجرب إيه؟',
    welcomeEn: 'Welcome to the Physics Lab! Here you can assemble DC circuits, observe electron drift, simulate transverse waves, and test Newton mechanics. What shall we explore?',
    defaultQuestionsAr: [
      'ما هو قانون أوم وكيف أحسب شدة التيار؟',
      'ما الفرق بين التوصيل على التوالي والتوازي؟',
      'كيف تتحدد سرعة انتشار الموجة على وتر مشدود؟',
      'ماذا يحدث عند حدوث قصر في الدائرة (Short Circuit)؟'
    ],
    defaultQuestionsEn: [
      'What is Ohm’s Law and how to calculate current?',
      'Difference between series and parallel circuits?',
      'What determines wave velocity on a string?',
      'What happens during a short circuit?'
    ],
    knowledge: [
      {
        keywords: ['أوم', 'ohm', 'v=ir', 'جهد', 'مقاومة', 'تيار'],
        answerAr: 'ينص قانون أوم على أن شدة التيار (I) المار في موصل تتناسب طردياً مع فرق الجهد (V) وعكسياً مع المقاومة (R): V = I × R. عند زيادة المقاومة يقل تدفق الإلكترونات، وعند رفع الجهد تزداد الطاقة!',
        answerEn: 'Ohm’s Law dictates V = I × R: current is directly proportional to voltage and inversely proportional to electrical resistance.'
      },
      {
        keywords: ['توالي', 'توازي', 'series', 'parallel'],
        answerAr: 'في التوصيل على التوالي: التيار ثابت في كل العناصر والجهد يتجزأ (Rt = R1 + R2). أما في التوصيل على التوازي: الجهد ثابت والتيار يتفرع (1/Rt = 1/R1 + 1/R2)، فإذا احترق مصباح تظل باقي المصابيح مضيئة!',
        answerEn: 'In series circuits, current is uniform and resistance sums up. In parallel, voltage is identical across branches, ensuring other lamps stay lit if one fails.'
      },
      {
        keywords: ['موجة', 'وتر', 'wave', 'تردد', 'سعة'],
        answerAr: 'سرعة الموجة على الوتر تحكمها المعادلة v = √(T/μ) حيث T قوة الشد وμ كتلة وحدة الأطوال. والعلاقة بين السرعة والتردد هي v = λ × f، حيث كلما زاد التردد قل الطول الموجي λ!',
        answerEn: 'Wave velocity on a string equals v = sqrt(T/μ). Velocity also relates to frequency and wavelength by v = λ × f.'
      },
      {
        keywords: ['قصر', 'شورت', 'short circuit'],
        answerAr: 'قفلة الدائرة أو القصر (Short Circuit) تحدث عند توصيل قطبي البطارية بسلك عديم المقاومة (R ≈ 0)، فتندفع شدة تيار لانهائية تتسبب في توهج البطارية وانفجارها أو احتراق السلك حرارياً!',
        answerEn: 'A short circuit happens when terminals connect via near-zero resistance, prompting a surging current spike that overloads components thermally.'
      }
    ]
  },
  chemistry: {
    nameAr: 'مختبر الكيمياء والتفاعلات (PraxiLabs)',
    nameEn: 'Chemistry & Reaction Simulator',
    welcomeAr: 'مرحباً بك في معمل الكيمياء ونظام PraxiLabs التفاعلي! هنا الرف المخبري فيه عناصر جاهزة للدمج الفوري. اسألني عن أي تفاعل كيميائي، أو معادلة موزونة، أو توزيع إلكتروني!',
    welcomeEn: 'Welcome to the Chemistry & Reaction Lab! Here you can mix elemental reagents in the reaction beaker. Ask me about balanced equations, exothermic reactions, or electron configurations!',
    defaultQuestionsAr: [
      'ماذا يحدث عند دمج الصوديوم (Na) مع الكلور (Cl)؟',
      'لماذا يحترق الماغنسيوم بلهب أبيض مبهر؟',
      'ما الفرق بين التفاعل الطارد والتفاعل الماص للحرارة؟',
      'ما هي المجموعة الذرية وكيف تتصرف في التفاعل؟'
    ],
    defaultQuestionsEn: [
      'What happens when Sodium (Na) reacts with Chlorine (Cl)?',
      'Why does Magnesium burn with a blinding white flare?',
      'Difference between exothermic and endothermic reactions?',
      'What is a polyatomic radical and its valence?'
    ],
    knowledge: [
      {
        keywords: ['صوديوم', 'كلور', 'na', 'cl', 'ملح'],
        answerAr: 'تفاعل عنيف وطارد جداً للحرارة: 2Na(صلب) + Cl₂(غاز) → 2NaCl(ملح طعام صلب). يفقد الصوديوم إلكترون تكافؤه للكلور لتكوين رابطة أيونية مكعبة شديدة الاستقرار مع وميض أصفر ودخان أبيض يتكثف لبلورات ملح!',
        answerEn: '2Na + Cl2 -> 2NaCl: An intense exothermic redox synthesis yielding table salt. Sodium transfers its valence electron to chlorine, emitting radiant yellow incandescence.'
      },
      {
        keywords: ['ماغنسيوم', 'أكسجين', 'mg', 'o'],
        answerAr: 'يحترق شريط الماغنسيوم في الأكسجين بلهب أبيض مبهج يعمي البصر محرراً طاقة حرارية وأشعة فوق بنفسجية (2Mg + O₂ → 2MgO)، ويترك مسحوق رماد أبيض عالي النقاوة!',
        answerEn: '2Mg + O2 -> 2MgO: Magnesium oxidizes violently emitting blinding broad-spectrum visible and UV light, depositing white magnesium oxide ash.'
      },
      {
        keywords: ['طارد', 'ماص', 'حرارة', 'exothermic', 'endothermic'],
        answerAr: 'التفاعل الطارد للحرارة (Exothermic) يفرز طاقة للوسط المحيط وترتفع درجة حرارة الكأس (ΔH سالبة كاحتراق الهيدروجين). أما التفاعل الماص (Endothermic) فيمتص حرارة من الوسط فتنخفض حرارته (ΔH موجبة).',
        answerEn: 'Exothermic reactions release thermal enthalpy (negative ΔH) heating the beaker, whereas endothermic reactions absorb heat from ambient surroundings.'
      },
      {
        keywords: ['مجموعة ذرية', 'radical', 'هيدروكسيد', 'نترات'],
        answerAr: 'المجموعة الذرية هي حزمة من الذرات المختلفة مرتبطة تساهمياً وتسلك مسلك الذرة الواحدة في التفاعل ولها تكافؤ وشحنة خاصة بها (مثل النترات NO₃⁻ أحادية، والكبريتات SO₄²⁻ ثنائية، والفوسفات PO₄³⁻ ثلاثية).',
        answerEn: 'A polyatomic ion acts as a singular charged entity in chemical reactions with its own distinct valence (e.g., Nitrate NO3-, Sulfate SO4-2).'
      }
    ]
  },
  biology: {
    nameAr: 'مختبر الأحياء والخلية والكائنات الدقيقة',
    nameEn: 'Biology & Microbiology Lab',
    welcomeAr: 'أهلاً بك في معمل الأحياء والميكروسكوب! هنا ندرس الخلية النباتية والحيوانية والـ DNA وكائنات المستنقعات (أميبا، يوجلينا، براميسيوم). اسألني عن أي عضية خلوية وسأشرحهالك!',
    welcomeEn: 'Welcome to the Cytology & Microbiology Lab! Here we explore plant & animal cells, DNA helices, and protozoa (Amoeba, Euglena, Paramecium). Ask me about cellular organelles!',
    defaultQuestionsAr: [
      'ما هي الميتوكوندريا ولماذا تسمى مصنع الطاقة؟',
      'ما الفرق بين الخلية النباتية والحيوانية؟',
      'كيف تتحرك الأميبا واليوجلينا والبراميسيوم؟',
      'ما هو تركيب جزيء الحمض النووي DNA؟'
    ],
    defaultQuestionsEn: [
      'What are mitochondria and why called powerhouses?',
      'Differences between plant and animal cells?',
      'How do Amoeba, Euglena, and Paramecium locomote?',
      'What is the structure of the DNA double helix?'
    ],
    knowledge: [
      {
        keywords: ['ميتوكوندريا', 'طاقة', 'atp', 'mitochondria'],
        answerAr: 'الميتوكوندريا هي محطة توليد الطاقة في الخلية الحية! تقوم بالتنفس الخلوي وأكسدة الجلوكوز لإنتاج جزيئات ATP (أدينوسين ثلاثي الفوسفات) التي تغذي جميع الوظائف الحيوية.',
        answerEn: 'Mitochondria are the powerhouses of eukaryotic cells, converting glucose into ATP energy via the citric acid cycle and oxidative phosphorylation.'
      },
      {
        keywords: ['نباتية', 'حيوانية', 'خلية', 'جدار'],
        answerAr: 'الخلية النباتية تتميز بوجود: جدار خلوي سيليلوزي صلب يعطيها شكلاً محدداً، وبلاستيدات خضراء للبناء الضوئي، وفجوة عصارية مركزية كبيرة. الخلية الحيوانية تفتقر للجدار وتكتفي بالغشاء البلازمي المرن وبها جسم مركزي (سنتريول).',
        answerEn: 'Plant cells possess a rigid cellulose cell wall, chloroplasts for photosynthesis, and a large central vacuole, while animal cells have flexible membranes and centrioles.'
      },
      {
        keywords: ['أميبا', 'يوجلينا', 'براميسيوم', 'حركة', 'كائنات دقيقة'],
        answerAr: 'تتحرك الأميبا بالأقدام الكاذبة (Pseudopodia) وتلتهم الغذاء بالبلعمة، واليوجلينا تتحرك بسوط مفرد (Flagellum) وتحتوي على بقعة عينية، والبراميسيوم يتحرك بالآلاف من الأهداب الدقيقة (Cilia).',
        answerEn: 'Amoeba locomotes via cytoplasmic pseudopodia, Euglena swims using a single whip-like flagellum, and Paramecium glides via coordinated beating of thousands of cilia.'
      },
      {
        keywords: ['dna', 'حمض نووي', 'وراثة', 'قواعد'],
        answerAr: 'الحمض النووي DNA شريط مزدوج لولبي (Double Helix) يتكون من نيوكليوتيدات مرتبطة بروابط هيدروجينية بين 4 قواعد نيتروجينية: الأدينين (A) يرتبط بالثايمين (T)، والجوانين (G) يرتبط بالسيتوزين (C).',
        answerEn: 'DNA is a double helix built from nucleotide rungs bonded by complementary hydrogen pairs: Adenine pairs with Thymine (A=T) and Guanine with Cytosine (G≡C).'
      }
    ]
  },
  geology: {
    nameAr: 'مختبر علوم الأرض والزلازل',
    nameEn: 'Geology & Seismic Lab',
    welcomeAr: 'مرحباً بك في معمل الجيولوجيا وديناميكا المباني! هنا نحاكي طبقات الأرض وموجات الزلازل وانهيار المباني الإنشائية. اسألني عن درجات ريختر أو أنواع الصدوع!',
    welcomeEn: 'Welcome to the Geology & Structural Simulation Lab! Here we simulate Earth’s internal layers, tectonic faults, and seismic collapse. Ask me about Richter scales!',
    defaultQuestionsAr: [
      'ما هي طبقات الأرض الأربعة من الخارج للداخل؟',
      'كيف يتسبب الزلزال في انهيار الأبراج والمباني؟',
      'ما الفرق بين مقياس ريختر ومقياس ميركالي؟'
    ],
    defaultQuestionsEn: [
      'What are the 4 interior layers of Earth?',
      'How do seismic shear waves collapse tall buildings?',
      'Difference between Richter and Mercalli scales?'
    ],
    knowledge: [
      {
        keywords: ['طبقات', 'أرض', 'لب', 'وشاح', 'قشرة'],
        answerAr: 'تتكون الأرض من 4 طبقات: 1) القشرة الأرضية الصلبة (5-70 كم)، 2) الوشاح أو الستار من صخور السليكات اللدنة، 3) اللب الخارجي المنصهر من الحديد والنيكل السائل، 4) اللب الداخلي الصلب بفعل الضغط الهائل.',
        answerEn: 'Earth consists of 4 primary layers: crust, semi-viscous mantle, liquid outer core generating the magnetic shield, and solid iron-nickel inner core.'
      },
      {
        keywords: ['زلزال', 'ريختر', 'انهيار', 'مبنى'],
        answerAr: 'تنتج الزلازل عن تحرر طاقة مفاجئة في الصدوع التكتونية. تصل الموجات السطحية (Love & Rayleigh waves) للأبنية، وإذا تطابق تردد الموجة الزلزالية مع التردد الطبيعي للمبنى تحدث ظاهرة "الرنين" فيهتز المبنى بعنف وينهار!',
        answerEn: 'Earthquakes generate seismic waves. Resonance occurs when ground motion frequency matches a structure’s natural frequency, inducing devastating structural shear.'
      }
    ]
  },
  astronomy: {
    nameAr: 'مختبر علوم الفلك والنظام الشمسي',
    nameEn: 'Astronomy & Solar System Lab',
    welcomeAr: 'يا هلا بك في معمل الفضاء الكوني! هنا كواكب المجموعة الشمسية الثمانية وأطوار القمر والمد والجزر. اسألني عن كوكب المشتري، حلقات زحل، أو ظاهرة الكسوف والخسوف!',
    welcomeEn: 'Welcome to the Astronomy & Solar System Lab! Here we explore planets, Kepler orbital mechanics, and lunar phases. Ask me about planetary orbits or solar eclipses!',
    defaultQuestionsAr: [
      'ما هو أكبر كوكب في المجموعة الشمسية؟',
      'لماذا تتغير أطوار القمر خلال الشهر العربي؟',
      'ما سبب ظاهرتي كسوف الشمس وخسوف القمر؟'
    ],
    defaultQuestionsEn: [
      'What is the largest planet in our solar system?',
      'Why does the Moon exhibit monthly phases?',
      'What causes solar and lunar eclipses?'
    ],
    knowledge: [
      {
        keywords: ['مشترى', 'مشتري', 'jupiter', 'أكبر'],
        answerAr: 'كوكب المشتري (Jupiter) هو عملاق غازي وأكبر كواكب مجموعتنا الشمسية، كتلته تعادل أكثر من ضعف كتلة باقي الكواكب مجتمعة! ويتميز بالبقعة الحمراء العظيمة وهي عاصفة مستمرة منذ مئات السنين.',
        answerEn: 'Jupiter is the largest gas giant in the Solar System, possessing over 2.5 times the mass of all other planets combined, famous for its Great Red Spot storm.'
      },
      {
        keywords: ['قمر', 'أطوار', 'محاق', 'بدر', 'هلال'],
        answerAr: 'أطوار القمر تنتج عن تغير زاوية الرؤية للجزء المضاء من القمر أثناء دورانه حول الأرض كل 29.5 يوماً بالنسبة للشمس: يبدأ محاقاً، ثم هلالاً، ثم تربيعاً أولاً، ثم بدراً تاماً، ثم يتناقص تدريجياً.',
        answerEn: 'Lunar phases arise from the changing angle between the Earth, Moon, and Sun as the Moon completes its 29.5-day synodic orbit, progressing from New Moon to Full Moon.'
      }
    ]
  }
};

export const SharehAI: React.FC<SharehAIProps> = ({ currentTab }) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSpeechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const activeLab = LAB_KNOWLEDGE[currentTab] || LAB_KNOWLEDGE.home;

  // Initial welcome message per lab change
  useEffect(() => {
    const welcomeText = ar ? activeLab.welcomeAr : activeLab.welcomeEn;
    const initialMsg: Message = {
      id: 'welcome-' + currentTab + '-' + Date.now(),
      sender: 'shareh',
      text: welcomeText,
      timestamp: Date.now(),
      suggestions: ar ? activeLab.defaultQuestionsAr : activeLab.defaultQuestionsEn
    };
    setMessages([initialMsg]);

    // Optional subtle voice greeting if opened
    if (isOpen && isVoiceEnabled) {
      speak(welcomeText);
    }
  }, [currentTab, language]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Natural Speech Synthesis (Text-to-Speech)
  const speak = (text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ar ? 'ar-SA' : 'en-US';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick best Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar') || v.name.includes('Arabic') || v.name.includes('Maged') || v.name.includes('Tarik') || v.name.includes('Laila'));
    if (ar && arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    currentSpeechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Smart Query Resolver (Matches Question to Knowledge Base)
  const resolveAnswer = (userQuery: string): { answer: string; suggestions?: string[] } => {
    const cleanQuery = userQuery.toLowerCase().trim();

    // 1. Search in current lab knowledge
    for (const item of activeLab.knowledge) {
      if (item.keywords.some(k => cleanQuery.includes(k.toLowerCase()))) {
        return {
          answer: ar ? item.answerAr : item.answerEn,
          suggestions: (ar ? activeLab.defaultQuestionsAr : activeLab.defaultQuestionsEn).filter(q => q !== userQuery).slice(0, 2)
        };
      }
    }

    // 2. Search across ALL labs knowledge if not matched in current
    for (const labKey of Object.keys(LAB_KNOWLEDGE)) {
      const otherLab = LAB_KNOWLEDGE[labKey];
      for (const item of otherLab.knowledge) {
        if (item.keywords.some(k => cleanQuery.includes(k.toLowerCase()))) {
          const crossRefNote = ar
            ? `(معلومة من ${otherLab.nameAr}):\n`
            : `(Insight from ${otherLab.nameEn}):\n`;
          return {
            answer: crossRefNote + (ar ? item.answerAr : item.answerEn),
            suggestions: ar ? activeLab.defaultQuestionsAr.slice(0, 2) : activeLab.defaultQuestionsEn.slice(0, 2)
          };
        }
      }
    }

    // 3. Intelligent Socratic Pedagogical Fallback (like Shareh AI)
    if (ar) {
      return {
        answer: `سؤال ذكي وممتاز يا بطل! في معمل "${activeLab.nameAr}" المبدأ العلمي الأساسي يعتمد على الملاحظة والتجربة المباشرة. جرب تضغط على أدوات المعمل، وراقب التغير في القياسات أو الأشكال. تحب نركز على نقطة معينة من التحديات المقترحة بالأسفل؟`,
        suggestions: activeLab.defaultQuestionsAr.slice(0, 3)
      };
    } else {
      return {
        answer: `Brilliant scientific inquiry! In the "${activeLab.nameEn}", scientific fidelity relies on observation and empirical parameter tweaking. Try adjusting the lab sliders and observe the telemetry. Would you like to explore one of these questions?`,
        suggestions: activeLab.defaultQuestionsEn.slice(0, 3)
      };
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Add user message
    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);
    stopSpeaking();

    // Simulate smart AI thinking response latency
    setTimeout(() => {
      const responseData = resolveAnswer(query);
      const sharehMsg: Message = {
        id: 'shareh-' + Date.now(),
        sender: 'shareh',
        text: responseData.answer,
        timestamp: Date.now(),
        suggestions: responseData.suggestions
      };

      setMessages(prev => [...prev, sharehMsg]);
      setIsThinking(false);

      if (isVoiceEnabled) {
        speak(responseData.answer);
      }
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button (FAB) at Bottom-Right/Left */}
      {!isOpen && (
        <div className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 animate-bounce`}>
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              const lastMsg = messages[messages.length - 1];
              if (lastMsg && lastMsg.sender === 'shareh' && isVoiceEnabled) {
                speak(lastMsg.text);
              }
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-sm shadow-2xl shadow-amber-500/30 border-2 border-white/20 transition-all hover:scale-105 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#090a0d] rounded-full animate-ping" />
            </div>
            <div className="text-right">
              <span className="block leading-none text-xs font-bold text-amber-200">
                {ar ? 'المعلم الافتراضي' : 'Virtual AI Tutor'}
              </span>
              <span className="block text-sm font-black tracking-wide">
                {ar ? 'اسأل "شارح" 💡' : 'Ask Shareh 💡'}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Main Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 w-[94vw] sm:w-[420px] rounded-3xl overflow-hidden shadow-2xl border border-amber-500/40 bg-[#070b14]/95 backdrop-blur-xl transition-all duration-300 flex flex-col ${
            isMinimized ? 'h-16' : 'h-[580px] max-h-[85vh]'
          }`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-amber-600/30 via-purple-900/30 to-indigo-900/40 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-black rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white font-mono">
                    {ar ? 'شارح AI (معلم العلوم)' : 'Shareh AI (Science Tutor)'}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    v1.0
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block -mt-0.5 truncate max-w-[190px]">
                  {ar ? activeLab.nameAr : activeLab.nameEn}
                </span>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              {/* Voice Mute/Unmute Button */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setIsVoiceEnabled(!isVoiceEnabled);
                }}
                className={`p-1.5 rounded-xl border transition-colors ${
                  isVoiceEnabled
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
                title={isVoiceEnabled ? (ar ? 'كتم الصوت' : 'Mute Voice') : (ar ? 'تفعيل الصوت' : 'Enable Voice')}
              >
                {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Minimize/Restore */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-black/40">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-br-sm'
                          : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-bl-sm shadow-md'
                      }`}
                    >
                      {msg.sender === 'shareh' && (
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/5 text-[10px] text-amber-400 font-bold">
                          <span>💡 {ar ? 'شارح يقول:' : 'Shareh:'}</span>
                          <button
                            onClick={() => speak(msg.text)}
                            className="p-1 hover:text-white transition-colors"
                            title={ar ? 'إعادة نطق الإجابة' : 'Read aloud'}
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    {/* Suggestions Pills if available */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(sug)}
                            className="text-[11px] px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 transition-all text-right hover:scale-102 flex items-center gap-1 cursor-pointer"
                          >
                            <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* AI Thinking Animation Indicator */}
                {isThinking && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/80 border border-white/10 w-28 text-xs text-amber-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span className="font-mono text-[11px]">{ar ? 'يفكر...' : 'Thinking...'}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-[#050811] border-t border-white/10">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder={ar ? 'اسأل شارح في أي تجربة أو قانون علمي...' : 'Ask Shareh any lab question...'}
                    className="flex-1 bg-slate-950/80 border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 text-white transition-all shadow-md cursor-pointer"
                  >
                    <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
