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
  Settings,
  Globe,
  Radio,
  Check,
  RotateCcw,
  Square,
  BookOpen,
  Cpu
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  suggestions?: string[];
  spokenText?: string;
  source?: 'local_lab' | 'open_science' | 'socratic';
}

interface SciNexaAIProps {
  currentTab: string;
}

// Scientific Speech Normalization Dictionary (Arabic & English)
const SCIENTIFIC_SPEECH_MAP_AR: [string, string][] = [
  ['2NaCl', 'مركب كلوريد الصوديوم'],
  ['NaCl', 'كلوريد الصوديوم'],
  ['2Na', 'ذرتين صوديوم'],
  ['Na', 'عنصر الصوديوم'],
  ['Cl2', 'غاز الكلور'],
  ['Cl', 'عنصر الكلور'],
  ['2MgO', 'أكسيد الماغنسيوم'],
  ['MgO', 'أكسيد الماغنسيوم'],
  ['2Mg', 'ذرتين ماغنسيوم'],
  ['Mg', 'عنصر الماغنسيوم'],
  ['H2O', 'جزيء الماء'],
  ['CO2', 'غاز ثاني أكسيد الكربون'],
  ['O2', 'غاز الأكسجين'],
  ['H2', 'غاز الهيدروجين'],
  ['ATP', 'أدينوسين ثلاثي الفوسفات'],
  ['DNA', 'الحمض النووي دي إن إيه'],
  ['3D', 'ثلاثي الأبعاد'],
  ['ISEF', 'آيسف الدولية'],
  ['DC', 'التيار المستمر'],
  ['AC', 'التيار المتردد'],
  ['Femur', 'عظم الفخذ'],
  ['Skull', 'عظام الجمجمة'],
  ['Mandible', 'عظمة الفك السفلي'],
  ['Amoeba', 'الأميبا'],
  ['Euglena', 'اليوجلينا'],
  ['Paramecium', 'البراميسيوم'],
  ['V = I × R', 'الجهد الكهربائي يساوي شدة التيار مضروبة في المقاومة'],
  ['V = I * R', 'الجهد الكهربائي يساوي شدة التيار مضروبة في المقاومة'],
  ['v = λ × f', 'سرعة الموجة تساوي الطول الموجي مضروباً في التردد'],
  ['v = λ * f', 'سرعة الموجة تساوي الطول الموجي مضروباً في التردد'],
  ['ΔH', 'التغير الحراري'],
  ['Short Circuit', 'قفلة أو قصر في الدائرة الكهربائية']
];

const SCIENTIFIC_SPEECH_MAP_EN: [string, string][] = [
  ['2NaCl', 'Sodium Chloride salt'],
  ['NaCl', 'Sodium Chloride'],
  ['2Na', 'two Sodium atoms'],
  ['Na', 'Sodium'],
  ['Cl2', 'Chlorine gas'],
  ['Cl', 'Chlorine'],
  ['2MgO', 'Magnesium Oxide'],
  ['MgO', 'Magnesium Oxide'],
  ['2Mg', 'two Magnesium atoms'],
  ['Mg', 'Magnesium'],
  ['H2O', 'Water'],
  ['CO2', 'Carbon Dioxide'],
  ['O2', 'Oxygen gas'],
  ['H2', 'Hydrogen gas'],
  ['ATP', 'A T P cellular energy'],
  ['DNA', 'D N A helix'],
  ['3D', 'Three Dimensional'],
  ['ISEF', 'I-S-E-F Science Fair'],
  ['DC', 'Direct Current'],
  ['AC', 'Alternating Current'],
  ['V = I × R', 'Voltage equals Current times Resistance'],
  ['v = λ × f', 'Wave velocity equals wavelength times frequency']
];

// Clean text and convert chemical/mathematical formulas to clear pronounceable words
function cleanTextForSpeech(text: string, lang: 'ar' | 'en' | 'fr' = 'ar'): string {
  let cleaned = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[`~_]/g, '')
    .replace(/->|→/g, lang === 'ar' ? ' ينتج ' : ' yields ')
    .replace(/\+/g, lang === 'ar' ? ' زائد ' : ' plus ')
    .replace(/×/g, lang === 'ar' ? ' مضروباً في ' : ' times ')
    .replace(/=/g, lang === 'ar' ? ' يساوي ' : ' equals ');

  const dict = lang === 'ar' ? SCIENTIFIC_SPEECH_MAP_AR : SCIENTIFIC_SPEECH_MAP_EN;
  const sorted = [...dict].sort((a, b) => b[0].length - a[0].length);
  for (const [key, val] of sorted) {
    cleaned = cleaned.split(key).join(val);
  }

  // Remove brackets and excessive punctuation
  cleaned = cleaned.replace(/[()[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned;
}

// Persona Definitions
export interface Persona {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  tagAr: string;
  tagEn: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'scinexa',
    nameAr: 'SciNexa AI',
    nameEn: 'SciNexa AI',
    titleAr: 'الباحث والمعلم العلمي الذكي',
    titleEn: 'Smart AI Science Scholar',
    tagAr: 'الافتراضي لمسابقة آيسف',
    tagEn: 'Default ISEF Scholar'
  },
  {
    id: 'professor',
    nameAr: 'البروفيسور الذكي',
    nameEn: 'Prof. SciNexa',
    titleAr: 'المشرف الأكاديمي الافتراضي',
    titleEn: 'Virtual Academic Mentor',
    tagAr: 'أسلوب أكاديمي دقيق',
    tagEn: 'Rigorous Academic Style'
  },
  {
    id: 'tutor',
    nameAr: 'المعلم الافتراضي',
    nameEn: 'Virtual Tutor',
    titleAr: 'مبسط العلوم والتجارب',
    titleEn: 'Interactive Science Tutor',
    tagAr: 'تبسيط ومحاكاة عملية',
    tagEn: 'Simplified Experiential'
  },
  {
    id: 'copilot',
    nameAr: 'المساعد المخبري',
    nameEn: 'Lab Copilot',
    titleAr: 'مرشد المعامل والمحاكاة',
    titleEn: 'Virtual Lab Copilot',
    tagAr: 'مساعد سريع ومباشر',
    tagEn: 'Rapid Lab Assistant'
  }
];

// Deep Scientific Knowledge Base covering all labs
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
    welcomeAr: 'مرحباً بك! أنا مساعدك وباحثك العلمي الذكي في SciNexa. جاهز للإجابة بدقة عن أي تجربة أو قانون علمي في التشريح والفيزياء والكيمياء والأحياء والجيولوجيا والفلك!',
    welcomeEn: 'Welcome! I am your AI Science Scholar in SciNexa. Ready to answer and explain any concept across 3D Anatomy, Physics, Chemistry, Biology, Geology, and Astronomy!',
    defaultQuestionsAr: [
      'ما هي أهداف منصة SciNexa لمسابقة آيسف؟',
      'كيف أبدأ تفاعلاً كيميائياً ممتعاً؟',
      'كيف أفحص عظام جسم الإنسان 3D؟'
    ],
    defaultQuestionsEn: [
      'What are SciNexa engineering goals for ISEF?',
      'How to run an interactive chemical reaction?',
      'How do I inspect 3D human bones?'
    ],
    knowledge: [
      {
        keywords: ['آيسف', 'isef', 'مشروع', 'هدف', 'ساينكسا', 'scinexa', 'منصة', 'فكرة'],
        answerAr: 'منصة SciNexa هي مشروع علمي رائد لمسابقة ISEF يهدف إلى حل عجز المعامل المدرسية بتوفير أطلس تشريح ثلاثي الأبعاد ومختبرات فيزياء وكيمياء تفاعلية تعمل أوفلاين بدون إنترنت ومجاناً 100%!',
        answerEn: 'SciNexa is an ISEF research platform solving lab equipment shortages through interactive 3D anatomy, physics, and chemistry simulation engines that run 100% offline and free.'
      },
      {
        keywords: ['اسمك', 'مين انت', 'مين أنت', 'who are you', 'عنان', 'شارح'],
        answerAr: 'أنا SciNexa AI، الباحث والمعلم العلمي التفاعلي المدمج في منصة ساينكسا! مهمتي شرح المفاهيم العلمية بدقة وبكل اللغات، وتوجيهك خطوة بخطوة داخل المعامل الافتراضية.',
        answerEn: 'I am SciNexa AI, your interactive science scholar built into SciNexa to clarify scientific principles and guide you through virtual lab experiments!'
      }
    ]
  },
  anatomy: {
    nameAr: 'أطلس التشريح البشري 3D',
    nameEn: '3D Human Anatomy Atlas',
    welcomeAr: 'أهلاً بك في معمل التشريح البشري 3D! هنا يمكنك فحص الهيكل العظمي وأجهزة الجسم. اسألني عن أي عظمة أو عضو وسأشرح لك وظيفته وموقعه بدقة!',
    welcomeEn: 'Welcome to the 3D Anatomy Lab! Here you can inspect all 210 human bones and vital systems. Ask me about any organ or bone!',
    defaultQuestionsAr: [
      'كم عدد عظام جسم الإنسان البالغ؟',
      'ما هي أطول وأقوى عظمة في الجسم؟',
      'ما هي وظيفة الجمجمة والفك السفلي؟',
      'ما الفرق بين العظم والغضروف؟'
    ],
    defaultQuestionsEn: [
      'How many bones are in the adult human body?',
      'What is the longest and strongest bone?',
      'What is the function of skull and mandible?',
      'What is the difference between bone and cartilage?'
    ],
    knowledge: [
      {
        keywords: ['عظام', 'عدد', 'عظمة', 'bones', 'كم'],
        answerAr: 'يحتوي جسم الإنسان البالغ على 206 إلى 210 عظمات معتمدة تشريحياً. ترتبط بالمفاصل وتتحرك بواسطة العضلات وتحمي الأعضاء الحيوية كالمخ والقلب والرئتين.',
        answerEn: 'The adult human skeleton comprises 206-210 articulated bones, providing structural support and safeguarding vital organs.'
      },
      {
        keywords: ['فخذ', 'femur', 'أطول', 'أقوى'],
        answerAr: 'عظم الفخذ (Femur) هو أطول وأثقل وأقوى عظمة في جسم الإنسان. يتحمل ضغطاً هائلاً أثناء الحركة ويتفصل بالأعلى مع تجويف الحوض وبالأسفل مع الركبة.',
        answerEn: 'The Femur (thigh bone) is the longest, heaviest, and strongest bone in the body, articulating with the hip socket and the knee.'
      },
      {
        keywords: ['جمجمة', 'فك', 'skull', 'mandible'],
        answerAr: 'الجمجمة تتكون من 22 عظمة لحماية الدماغ. العظمة الوحيدة المتحركة هي الفك السفلي (Mandible) مما يسمح بالمضغ والنطق بحرية.',
        answerEn: 'The human skull contains 22 bones protecting the brain. The mandible (lower jaw) is the only movable bone, facilitating speech and chewing.'
      },
      {
        keywords: ['غضروف', 'cartilage', 'أنف', 'مفصل'],
        answerAr: 'الغضروف نسيج ضام مرن يمتص الصدمات بين الفقرات والمفاصل ويشكل صيوان الأذن ومقدمة الأنف، ولا يحتوي على أوعية دموية مباشرة.',
        answerEn: 'Cartilage is an avascular, flexible connective tissue that cushions skeletal joints and shapes the ears and nose.'
      }
    ]
  },
  physics: {
    nameAr: 'مختبر الفيزياء والدوائر والموجات',
    nameEn: 'Physics & Circuit Lab',
    welcomeAr: 'مرحباً في معمل الفيزياء! هنا نحاكي دوائر التيار المستمر والموجات وانكسار الضوء. اسألني عن قانون أوم، التوصيل على التوالي والتوازي، أو سرعة الموجات!',
    welcomeEn: 'Welcome to the Physics Lab! Here we simulate DC circuits, light refraction, and wave mechanics. Ask about Ohm’s law, circuit wiring, or wave velocity!',
    defaultQuestionsAr: [
      'ما هو نص قانون أوم وكيف يحسب فرق الجهد؟',
      'ما الفرق بين التوصيل على التوالي والتوصيل على التوازي؟',
      'ماذا يحدث عند حدوث قصر في الدائرة (Short Circuit)؟',
      'كيف تتحدد سرعة انتشار الموجة على الوتر؟'
    ],
    defaultQuestionsEn: [
      'What is Ohm’s Law and how to compute voltage?',
      'What is the difference between series and parallel circuits?',
      'What happens during an electrical short circuit?',
      'How is wave speed calculated along a string?'
    ],
    knowledge: [
      {
        keywords: ['أوم', 'ohm', 'جهد', 'مقاومة', 'تيار', 'v=ir'],
        answerAr: 'ينص قانون أوم على أن فرق الجهد (V) يساوي شدة التيار (I) مضروبة في المقاومة (R): V = I × R. كلما زادت المقاومة قل تدفق التيار عند ثبات الجهد.',
        answerEn: 'Ohm’s Law establishes V = I × R: electric potential equals current multiplied by resistance.'
      },
      {
        keywords: ['توالي', 'توازي', 'series', 'parallel'],
        answerAr: 'في التوصيل على التوالي: التيار ثابت والجهد يتجزأ، فإذا انقطع مسار يتوقف الكل. وفي التوصيل على التوازي: الجهد متساوٍ والتيار يتفرع، وتظل باقي المصابيح مضيئة.',
        answerEn: 'In series wiring, current is identical across components. In parallel, voltage is uniform across branches, preventing total failure if one element disconnects.'
      },
      {
        keywords: ['قصر', 'قفلة', 'شورت', 'short circuit'],
        answerAr: 'دائرة القصر (Short Circuit) تحدث عند اتصال قطبي المصدر بسلك شبه منعدم المقاومة، فتندفع شدة تيار هائلة تؤدي لارتفاع حراري شديد واحتراق!',
        answerEn: 'A short circuit happens when terminals connect via negligible resistance, creating an intense current spike that causes overheating.'
      },
      {
        keywords: ['موجة', 'وتر', 'wave', 'تردد', 'سرعة'],
        answerAr: 'سرعة الموجة تحكمها المعادلة v = λ × f، حيث λ الطول الموجي و f التردد. وعلى الأوتار تعتمد السرعة على قوة الشد وكتلة وحدة الأطوال.',
        answerEn: 'Wave velocity equals wavelength times frequency (v = λ × f), governed on strings by tension and linear mass density.'
      }
    ]
  },
  chemistry: {
    nameAr: 'مختبر الكيمياء والتفاعلات (PraxiLabs)',
    nameEn: 'Chemistry & Reaction Simulator',
    welcomeAr: 'مرحباً في مختبر الكيمياء التفاعلي! يمكنك دمج العناصر بالمعمل ومراقبة التفاعلات. اسألني عن أي معادلة كيميائية أو تفاعل طارد وماص للحرارة!',
    welcomeEn: 'Welcome to the Chemistry & PraxiLabs Simulator! Mix elemental reagents and observe reactions. Ask about balanced equations or thermodynamics!',
    defaultQuestionsAr: [
      'ماذا يحدث عند دمج الصوديوم (Na) مع الكلور (Cl)؟',
      'لماذا يحترق الماغنسيوم (Mg) بلهب أبيض ساطع؟',
      'ما الفرق بين التفاعل الطارد والتفاعل الماص للحرارة؟',
      'ما هي المجموعة الذرية وكيف تتصرف في التفاعل؟'
    ],
    defaultQuestionsEn: [
      'What happens when Sodium (Na) reacts with Chlorine (Cl)?',
      'Why does Magnesium burn with a brilliant white flame?',
      'Difference between exothermic and endothermic reactions?',
      'What is a chemical radical or polyatomic ion?'
    ],
    knowledge: [
      {
        keywords: ['صوديوم', 'كلور', 'na', 'cl', 'ملح'],
        answerAr: 'تفاعل اتحاد مباشر طارد للحرارة: 2Na + Cl₂ → 2NaCl (ملح طعام صلب). يفقد الصوديوم إلكترون تكافؤه للكلور ليكونا رابطة أيونية مكعبة شديدة الاستقرار مع وميض أصفر.',
        answerEn: '2Na + Cl2 -> 2NaCl: An energetic exothermic synthesis forming crystalline table salt via ionic bonding with bright light emission.'
      },
      {
        keywords: ['ماغنسيوم', 'أكسجين', 'mg', 'o'],
        answerAr: 'يحترق شريط الماغنسيوم في الأكسجين بلهب أبيض مبهر: 2Mg + O₂ → 2MgO (أكسيد الماغنسيوم)، محرراً طاقة ضوئية وحرارية عالية ومسحوقاً أبيض.',
        answerEn: '2Mg + O2 -> 2MgO: Magnesium oxidizes vigorously, producing an intense white flare and leaving white magnesium oxide residue.'
      },
      {
        keywords: ['طارد', 'ماص', 'حرارة', 'exothermic', 'endothermic'],
        answerAr: 'التفاعل الطارد يطلق حرارة للوسط فترتفع درجة حرارته (ΔH سالبة). أما التفاعل الماص فيمتص حرارة من الوسط المحيط فتنخفض درجة حرارته (ΔH موجبة).',
        answerEn: 'Exothermic reactions emit thermal energy (negative ΔH), while endothermic reactions absorb heat from the surroundings.'
      }
    ]
  },
  biology: {
    nameAr: 'مختبر الأحياء والخلية',
    nameEn: 'Biology & Cell Lab',
    welcomeAr: 'مرحباً بك في معمل الأحياء والميكروسكوب! هنا نفحص الخلية النباتية والحيوانية وكائنات المستنقعات والـ DNA. اسألني عن أي عضية خلوية وسأشرحها لك!',
    welcomeEn: 'Welcome to the Biology & Microscopy Lab! Examine plant & animal cells, protozoa, and DNA helices. Ask about cellular organelles!',
    defaultQuestionsAr: [
      'ما هي الميتوكوندريا ولماذا تسمى مصنع الطاقة؟',
      'ما الفرق بين الخلية النباتية والخلية الحيوانية؟',
      'كيف تتحرك الأميبا واليوجلينا والبراميسيوم؟',
      'ما هو تركيب جزيء الحمض النووي DNA؟'
    ],
    defaultQuestionsEn: [
      'What are mitochondria and why called powerhouses?',
      'Differences between plant and animal cells?',
      'How do Amoeba, Euglena, and Paramecium move?',
      'What is the structure of the DNA double helix?'
    ],
    knowledge: [
      {
        keywords: ['ميتوكوندريا', 'طاقة', 'atp', 'mitochondria'],
        answerAr: 'الميتوكوندريا هي محطة توليد الطاقة في الخلية، حيث تقوم بالتنفس الخلوي لإنتاج جزيئات ATP التي تمد جميع الأنشطة الحيوية بالطاقة اللازمة.',
        answerEn: 'Mitochondria generate cellular chemical energy by producing ATP molecules through cellular respiration.'
      },
      {
        keywords: ['نباتية', 'حيوانية', 'خلية', 'جدار'],
        answerAr: 'الخلية النباتية تتميز بجدار خلوي صلب وبلاستيدات خضراء للبناء الضوئي وفجوة عصارية كبيرة، بينما تحتوي الخلية الحيوانية على غشاء بلازمي مرن وسنتريول.',
        answerEn: 'Plant cells have a rigid cellulose wall, chloroplasts, and large vacuoles, while animal cells have flexible membranes and centrosomes.'
      },
      {
        keywords: ['dna', 'حمض نووي', 'وراثة'],
        answerAr: 'الـ DNA شريط لولبي مزدوج يتكون من 4 قواعد نيتروجينية مرتبطة بروابط هيدروجينية: الأدينين يرتبط بالثايمين، والجوانين يرتبط بالسيتوزين.',
        answerEn: 'DNA is a double-helix polymer carrying genetic codes via four paired nucleotide bases: A pairs with T, and G pairs with C.'
      }
    ]
  },
  geology: {
    nameAr: 'مختبر علوم الأرض والزلازل',
    nameEn: 'Geology & Seismic Lab',
    welcomeAr: 'مرحباً في معمل الجيولوجيا والزلازل! هنا نحاكي طبقات الأرض والتصدعات وانهيار المباني الزلزالي. اسألني عن مقياس ريختر أو بنية الأرض!',
    welcomeEn: 'Welcome to the Geology & Seismic Lab! Simulate Earth layers, fault lines, and structural resonance. Ask about seismic scales!',
    defaultQuestionsAr: [
      'ما هي طبقات الأرض الأربعة؟',
      'كيف يسبب الزلزال انهيار المباني عبر ظاهرة الرنين؟',
      'ما الفرق بين مقياس ريختر ومقياس ميركالي؟'
    ],
    defaultQuestionsEn: [
      'What are the 4 interior layers of Earth?',
      'How does seismic resonance cause structural collapse?',
      'Difference between Richter and Mercalli scales?'
    ],
    knowledge: [
      {
        keywords: ['طبقات', 'أرض', 'قشرة', 'وشاح', 'لب'],
        answerAr: 'طبقات الأرض: 1) القشرة الخارجية الصلبة، 2) الوشاح أو الستار من صخور السليكات، 3) اللب الخارجي المنصهر من الحديد والنيكل، 4) اللب الداخلي الصلب تحت الضغط الفائق.',
        answerEn: 'Earth layers: outer crust, silicate mantle, liquid iron-nickel outer core, and super-dense solid inner core.'
      },
      {
        keywords: ['زلزال', 'رنين', 'انهيار', 'مبنى'],
        answerAr: 'يحدث الانهيار عندما يتطابق تردد الموجات الزلزالية الأرضية مع التردد الطبيعي لاهتزاز المبنى، فيحدث "الرنين الميكانيكي" وتتضاعف سعة الاهتزاز حتى ينهار المبنى.',
        answerEn: 'Structural failure occurs when seismic wave frequency matches a building’s natural resonance frequency, amplifying destructive oscillation.'
      }
    ]
  },
  astronomy: {
    nameAr: 'مختبر علوم الفلك والنظام الشمسي',
    nameEn: 'Astronomy & Solar System Lab',
    welcomeAr: 'مرحباً في معمل الفضاء والنظام الشمسي! يمكنك فحص مدارات الكواكب وأطوار القمر وظواهر الكسوف والخسوف. اسألني عن أي كوكب أو ظاهرة فلكية!',
    welcomeEn: 'Welcome to the Astronomy & Solar Lab! Inspect planetary orbits and celestial mechanics. Ask about planets, moons, or eclipses!',
    defaultQuestionsAr: [
      'ما هو أكبر كوكب في مجموعتنا الشمسية؟',
      'لماذا يمر القمر بأطوار متعددة كل شهر؟',
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
        answerAr: 'كوكب المشتري هو عملاق غازي وأكبر كواكب المجموعة الشمسية على الإطلاق، كتلته تفوق ضعف كتلة جميع الكواكب الأخرى مجتمعة!',
        answerEn: 'Jupiter is the largest gas giant in the Solar System, possessing over twice the mass of all other planets combined.'
      },
      {
        keywords: ['قمر', 'أطوار', 'بدر', 'هلال'],
        answerAr: 'تحدث أطوار القمر بسبب تغير زاوية رؤية نصف القمر المضاء بنور الشمس أثناء دورانه حول كوكب الأرض كل 29.5 يوماً.',
        answerEn: 'Lunar phases occur due to the changing geometric angle of illuminated lunar surface visible from Earth during its monthly orbit.'
      }
    ]
  }
};

export const SciNexaAI: React.FC<SciNexaAIProps> = ({ currentTab }) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';

  // Persistence of settings
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(() => {
    return localStorage.getItem('scinexa_ai_persona') || 'scinexa';
  });
  const [customName, setCustomName] = useState<string>(() => {
    return localStorage.getItem('scinexa_ai_custom_name') || '';
  });
  const [voiceLanguage, setVoiceLanguage] = useState<'ar' | 'en' | 'fr' | 'auto'>(() => {
    return (localStorage.getItem('scinexa_ai_voice_lang') as any) || 'ar';
  });
  const [speechEngineMode, setSpeechEngineMode] = useState<'hd_voiceover' | 'system_tts'>(() => {
    return (localStorage.getItem('scinexa_ai_speech_mode') as any) || 'hd_voiceover';
  });
  const [speechRate, setSpeechRate] = useState<number>(() => {
    return Number(localStorage.getItem('scinexa_ai_speech_rate')) || 1.0;
  });

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // System voices list
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const activeLab = LAB_KNOWLEDGE[currentTab] || LAB_KNOWLEDGE.home;
  const currentPersona = PERSONAS.find(p => p.id === selectedPersonaId) || PERSONAS[0];
  const activeDisplayName = customName.trim() || (ar ? currentPersona.nameAr : currentPersona.nameEn);

  // Save settings on changes
  useEffect(() => {
    localStorage.setItem('scinexa_ai_persona', selectedPersonaId);
  }, [selectedPersonaId]);
  useEffect(() => {
    localStorage.setItem('scinexa_ai_custom_name', customName);
  }, [customName]);
  useEffect(() => {
    localStorage.setItem('scinexa_ai_voice_lang', voiceLanguage);
  }, [voiceLanguage]);
  useEffect(() => {
    localStorage.setItem('scinexa_ai_speech_mode', speechEngineMode);
  }, [speechEngineMode]);
  useEffect(() => {
    localStorage.setItem('scinexa_ai_speech_rate', String(speechRate));
  }, [speechRate]);

  // Load available system voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const vList = window.speechSynthesis.getVoices();
        setAvailableVoices(vList);
      }
    };
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Update initial welcome message upon lab change
  useEffect(() => {
    const welcome = ar ? activeLab.welcomeAr : activeLab.welcomeEn;
    const initialMsg: Message = {
      id: 'welcome-' + currentTab + '-' + Date.now(),
      sender: 'ai',
      text: welcome,
      timestamp: Date.now(),
      suggestions: ar ? activeLab.defaultQuestionsAr : activeLab.defaultQuestionsEn,
      source: 'local_lab'
    };
    setMessages([initialMsg]);

    if (isOpen && isVoiceEnabled) {
      speak(welcome);
    }
  }, [currentTab, language]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Speech engine stop
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Text-To-Speech Synthesis Router
  const speak = (rawText: string) => {
    if (!isVoiceEnabled) return;
    stopSpeaking();

    // Determine target spoken language
    let langCode: 'ar' | 'en' | 'fr' = 'ar';
    if (voiceLanguage === 'auto') {
      const isArabic = /[\u0600-\u06FF]/.test(rawText);
      const isFrench = /[éèêàùçôîâëï]/i.test(rawText);
      langCode = isArabic ? 'ar' : isFrench ? 'fr' : 'en';
    } else {
      langCode = voiceLanguage;
    }

    const cleanedText = cleanTextForSpeech(rawText, langCode);

    // Mode 1: High Definition Studio Voiceover via Audio Stream
    if (speechEngineMode === 'hd_voiceover') {
      try {
        const shortChunk = cleanedText.slice(0, 190);
        const encoded = encodeURIComponent(shortChunk);
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${langCode}&client=tw-ob`;

        const audio = new Audio(ttsUrl);
        audio.playbackRate = speechRate;
        audioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          // If network audio fails (e.g. offline on USB), fall back automatically to system speech
          speakViaSystemTTS(cleanedText, langCode);
        };

        audio.play().catch(() => {
          speakViaSystemTTS(cleanedText, langCode);
        });
        return;
      } catch {
        speakViaSystemTTS(cleanedText, langCode);
        return;
      }
    }

    // Mode 2: Local System Voices (Works 100% Offline)
    speakViaSystemTTS(cleanedText, langCode);
  };

  const speakViaSystemTTS = (text: string, langCode: 'ar' | 'en' | 'fr') => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === 'ar' ? 'ar-SA' : langCode === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Match chosen voice or best available voice for language
    if (selectedVoiceURI) {
      const chosen = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (chosen) utterance.voice = chosen;
    } else {
      const matchingVoice = availableVoices.find(v =>
        v.lang.toLowerCase().startsWith(langCode) ||
        (langCode === 'ar' && (v.name.includes('Arabic') || v.name.includes('Maged') || v.name.includes('Tarik') || v.name.includes('Salma') || v.name.includes('Naayf') || v.name.includes('Laila')))
      );
      if (matchingVoice) utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Smart Query Resolver: Lab Knowledge + Open Science Search Fallback
  const handleQuery = async (userQuery: string) => {
    const cleanQuery = userQuery.toLowerCase().trim();

    // 1. Search in current lab knowledge base
    for (const item of activeLab.knowledge) {
      if (item.keywords.some(k => cleanQuery.includes(k.toLowerCase()))) {
        return {
          answer: ar ? item.answerAr : item.answerEn,
          suggestions: (ar ? activeLab.defaultQuestionsAr : activeLab.defaultQuestionsEn).filter(q => q !== userQuery).slice(0, 2),
          source: 'local_lab' as const
        };
      }
    }

    // 2. Search across other labs
    for (const labKey of Object.keys(LAB_KNOWLEDGE)) {
      const otherLab = LAB_KNOWLEDGE[labKey];
      for (const item of otherLab.knowledge) {
        if (item.keywords.some(k => cleanQuery.includes(k.toLowerCase()))) {
          const crossRefNote = ar
            ? `(معلومة من ${otherLab.nameAr}):\n`
            : `(Insight from ${otherLab.nameEn}):\n`;
          return {
            answer: crossRefNote + (ar ? item.answerAr : item.answerEn),
            suggestions: (ar ? activeLab.defaultQuestionsAr : activeLab.defaultQuestionsEn).slice(0, 2),
            source: 'local_lab' as const
          };
        }
      }
    }

    // 3. Dynamic Open-Source Scientific Knowledge Query (Wikipedia Peer-Reviewed Science API)
    try {
      const searchLang = ar ? 'ar' : 'en';
      const searchUrl = `https://${searchLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        cleanQuery
      )}&utf8=&format=json&origin=*`;

      const response = await fetch(searchUrl, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        const data = await response.json();
        const hits = data.query?.search;
        if (hits && hits.length > 0) {
          const topHit = hits[0];
          const pageTitle = topHit.title;

          // Fetch clean summary for top page
          const summaryUrl = `https://${searchLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
          const sumRes = await fetch(summaryUrl, { signal: AbortSignal.timeout(2500) });
          if (sumRes.ok) {
            const sumData = await sumRes.json();
            if (sumData.extract) {
              const formatted = ar
                ? `📚 **${sumData.title}** (الموسوعة العلمية المفتوحة):\n${sumData.extract}\n\n💡 *نصيحة مخبرية*: يمكنك اختبار هذا المفهوم مباشرة في معمل "${activeLab.nameAr}" بتغيير المتغيرات وملاحظة النتيجة!`
                : `📚 **${sumData.title}** (Open Science Archive):\n${sumData.extract}\n\n💡 *Lab Insight*: You can test this empirical concept right inside "${activeLab.nameEn}"!`;
              return {
                answer: formatted,
                suggestions: (ar ? activeLab.defaultQuestionsAr : activeLab.defaultQuestionsEn).slice(0, 2),
                source: 'open_science' as const
              };
            }
          }
        }
      }
    } catch {
      // Graceful offline fallback
    }

    // 4. Intelligent Socratic Pedagogical Fallback
    if (ar) {
      return {
        answer: `سؤال علمي ممتاز يا بطل! في معمل "${activeLab.nameAr}" المبدأ الأساسي هو الملاحظة والتجربة المباشرة. تفقد أدوات المحاكاة، وراقب القياسات والقوانين الحاكمة. تحب نركز على أحد الأسئلة المقترحة بالأسفل؟`,
        suggestions: activeLab.defaultQuestionsAr.slice(0, 3),
        source: 'socratic' as const
      };
    } else {
      return {
        answer: `Great scientific inquiry! In "${activeLab.nameEn}", the core principle relies on empirical experimentation. Adjust the parameters on screen to observe telemetry. Would you like to explore one of these suggested topics?`,
        suggestions: activeLab.defaultQuestionsEn.slice(0, 3),
        source: 'socratic' as const
      };
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

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

    const response = await handleQuery(query);

    const aiMsg: Message = {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: response.answer,
      timestamp: Date.now(),
      suggestions: response.suggestions,
      source: response.source
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);

    if (isVoiceEnabled) {
      speak(response.answer);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <div className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 animate-bounce`}>
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              const lastMsg = messages[messages.length - 1];
              if (lastMsg && lastMsg.sender === 'ai' && isVoiceEnabled) {
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
                {ar ? currentPersona.titleAr : currentPersona.titleEn}
              </span>
              <span className="block text-sm font-black tracking-wide">
                {ar ? `اسأل ${activeDisplayName} 💡` : `Ask ${activeDisplayName} 💡`}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Main AI Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 w-[95vw] sm:w-[440px] rounded-3xl overflow-hidden shadow-2xl border border-amber-500/40 bg-[#070b14]/95 backdrop-blur-xl transition-all duration-300 flex flex-col ${
            isMinimized ? 'h-16' : 'h-[600px] max-h-[88vh]'
          }`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-amber-600/30 via-purple-900/30 to-indigo-900/40 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-black rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white font-mono">
                    {activeDisplayName}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    ISEF AI 2.0
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block -mt-0.5 truncate max-w-[190px]">
                  {ar ? activeLab.nameAr : activeLab.nameEn}
                </span>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              {/* Stop Speaking Button if Active */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-colors animate-pulse"
                  title={ar ? 'إيقاف الصوت حالياً' : 'Stop voice playback'}
                >
                  <Square className="w-4 h-4 fill-rose-300" />
                </button>
              )}

              {/* Voice Mute/Unmute */}
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

              {/* Settings Button */}
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-1.5 rounded-xl border transition-colors ${
                  isSettingsOpen
                    ? 'bg-indigo-500/30 border-indigo-400 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10 border-transparent'
                }`}
                title={ar ? 'إعدادات الصوت والشخصية وتغيير الاسم' : 'Voice & Name Settings'}
              >
                <Settings className="w-4 h-4" />
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

          {/* Settings Drawer */}
          {isSettingsOpen && !isMinimized && (
            <div className="p-3.5 bg-slate-950/95 border-b border-indigo-500/30 text-xs space-y-3 animate-in slide-in-from-top duration-200">
              {/* Persona / Name Customization */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  🏷️ {ar ? 'اختر شخصية واسم المعلم الذكي:' : 'Select Persona & Tutor Name:'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PERSONAS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPersonaId(p.id);
                        setCustomName('');
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-left rtl:text-right border transition-all flex items-center justify-between ${
                        selectedPersonaId === p.id && !customName
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="truncate">{ar ? p.nameAr : p.nameEn}</span>
                      {selectedPersonaId === p.id && !customName && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>

                {/* Custom Name Write-In */}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder={ar ? 'أو اكتب اسماً مخصصاً (مثال: بروفيسور أحمد)...' : 'Or type a custom name...'}
                    className="flex-1 bg-slate-900 border border-white/15 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  {customName && (
                    <button
                      onClick={() => setCustomName('')}
                      className="p-1 text-slate-400 hover:text-white"
                      title={ar ? 'إلغاء الاسم المخصص' : 'Clear custom name'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Voice Engine & Pronunciation Settings */}
              <div className="pt-2 border-t border-white/10">
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  🎙️ {ar ? 'محرك النطق الصوتي الفصيح (الفويس أوفر):' : 'Pronunciation & Voiceover Engine:'}
                </label>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <button
                    onClick={() => setSpeechEngineMode('hd_voiceover')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs border text-center transition-all ${
                      speechEngineMode === 'hd_voiceover'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    ✨ {ar ? 'فويس أوفر عالي الدقة (HD)' : 'HD Studio Voiceover'}
                  </button>
                  <button
                    onClick={() => setSpeechEngineMode('system_tts')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs border text-center transition-all ${
                      speechEngineMode === 'system_tts'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    💻 {ar ? 'أصوات النظام المحلي (Offline)' : 'Offline System TTS'}
                  </button>
                </div>

                {/* Language Selection */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {ar ? 'لغة النطق:' : 'Voice Lang:'}
                  </span>
                  {(['ar', 'en', 'fr', 'auto'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => setVoiceLanguage(l)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        voiceLanguage === l
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {l === 'ar' ? '🇸🇦 عربية' : l === 'en' ? '🇬🇧 English' : l === 'fr' ? '🇫🇷 Français' : '🌐 تلقائي'}
                    </button>
                  ))}
                </div>

                {/* System Voices Dropdown if Offline mode selected */}
                {speechEngineMode === 'system_tts' && availableVoices.length > 0 && (
                  <div className="mt-2">
                    <select
                      value={selectedVoiceURI}
                      onChange={e => setSelectedVoiceURI(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
                    >
                      <option value="">{ar ? '-- اختيار الصوت التلقائي --' : '-- Default System Voice --'}</option>
                      {availableVoices.map(v => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

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
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-br-sm shadow-lg'
                          : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-bl-sm shadow-md'
                      }`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[10px] text-amber-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            {activeDisplayName}:
                            {msg.source === 'open_science' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-normal">
                                بحث علمي مفتوح
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => speak(msg.text)}
                            className="p-1 hover:text-white transition-colors flex items-center gap-1 text-[10px] text-slate-400 hover:text-amber-300 cursor-pointer"
                            title={ar ? 'استمع للنطق الصوتي الفصيح' : 'Listen with natural voice'}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{ar ? 'نطق' : 'Speak'}</span>
                          </button>
                        </div>
                      )}
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    {/* Suggestions Pills */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
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

                {/* AI Thinking Animation */}
                {isThinking && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/80 border border-white/10 w-32 text-xs text-amber-400">
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    <span className="font-mono text-[11px]">{ar ? 'يبحث ويحلل...' : 'Analyzing...'}</span>
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
                    placeholder={
                      ar
                        ? `اسأل ${activeDisplayName} في أي تجربة أو قانون علمي...`
                        : `Ask ${activeDisplayName} any lab concept...`
                    }
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
