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
  Cpu,
  BrainCircuit,
  Sliders,
  Key,
  Eye,
  EyeOff,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  suggestions?: string[];
  source?: 'openai_official' | 'openai_gpt' | 'local_lab' | 'open_science' | 'socratic';
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
  ['ISEF', 'مسابقة آيسف الدولية'],
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
  ['ATP', 'A T P energy molecules'],
  ['DNA', 'D N A double helix'],
  ['3D', 'Three Dimensional'],
  ['ISEF', 'I-S-E-F International Science Fair'],
  ['DC', 'Direct Current'],
  ['AC', 'Alternating Current'],
  ['V = I × R', 'Voltage equals current times resistance'],
  ['v = λ × f', 'Wave velocity equals wavelength times frequency']
];

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

  cleaned = cleaned.replace(/[()[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned;
}

function chunkTextForTTS(text: string, maxLen = 150): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  const parts = clean.split(/([.!؟،,\n]+)/);
  let current = '';

  for (let i = 0; i < parts.length; i += 2) {
    const sentence = (parts[i] || '') + (parts[i + 1] || '');
    if ((current + sentence).length > maxLen) {
      if (current.trim()) chunks.push(current.trim());
      if (sentence.length > maxLen) {
        const words = sentence.split(' ');
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).length > maxLen) {
            if (sub.trim()) chunks.push(sub.trim());
            sub = w;
          } else {
            sub += (sub ? ' ' : '') + w;
          }
        }
        current = sub;
      } else {
        current = sentence;
      }
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(c => c.trim().length > 0);
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
    nameAr: 'SciNexa AI (ChatGPT)',
    nameEn: 'SciNexa AI (ChatGPT)',
    titleAr: 'باحث ومعلم آيسف الذكي',
    titleEn: 'ISEF AI Science Scholar',
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

// Official OpenAI Voice Options
const OPENAI_VOICES = [
  { id: 'alloy', nameAr: 'Alloy (الصوت الرسمي المتوازن لشات جي بي تي)', nameEn: 'Alloy (Iconic Balanced ChatGPT Voice)', gender: 'neutral' },
  { id: 'nova', nameAr: 'Nova (صوت نسائي مشرق وحيوي)', nameEn: 'Nova (Energetic & Bright Voice)', gender: 'female' },
  { id: 'echo', nameAr: 'Echo (صوت رجالي رخيم وهادئ)', nameEn: 'Echo (Warm & Resonant Voice)', gender: 'male' },
  { id: 'fable', nameAr: 'Fable (صوت تعبيري راقٍ)', nameEn: 'Fable (Expressive British/Global Accent)', gender: 'neutral' },
  { id: 'onyx', nameAr: 'Onyx (صوت رجالي عميق وقوي)', nameEn: 'Onyx (Deep & Authoritative Voice)', gender: 'male' },
  { id: 'shimmer', nameAr: 'Shimmer (صوت نسائي دافئ وواضح)', nameEn: 'Shimmer (Warm & Clear Female Voice)', gender: 'female' }
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
    welcomeAr: 'مرحباً بك! أنا SciNexa AI، مدعوم بتقنيات وصوت ChatGPT الرسمي. جاهز للإجابة بدقة ونطق صوتي طبيعي عن أي تجربة أو قانون في التشريح، الفيزياء، الكيمياء، الأحياء، الجيولوجيا والفلك!',
    welcomeEn: 'Welcome! I am SciNexa AI, powered by genuine ChatGPT intelligence and voice. Ready to explain any concept across 3D Anatomy, Physics, Chemistry, Biology, Geology, and Astronomy!',
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
        keywords: ['اسمك', 'مين انت', 'مين أنت', 'who are you', 'عنان', 'شارح', 'gpt'],
        answerAr: 'أنا SciNexa AI، مساعد ومعلم العلوم الذكي المدمج في منصة ساينكسا، مدعوم بنموذج وصوت ChatGPT فائق الدقة، لمساعدتك على فهم وتطبيق التجارب المعملية بدقة متناهية!',
        answerEn: 'I am SciNexa AI, your smart science tutor powered by ChatGPT voice and intelligence to guide your scientific investigations!'
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
  const [openaiApiKey, setOpenaiApiKey] = useState<string>(() => {
    return localStorage.getItem('scinexa_openai_api_key') || (import.meta.env.VITE_OPENAI_API_KEY as string) || '';
  });
  const [openaiVoice, setOpenaiVoice] = useState<string>(() => {
    return localStorage.getItem('scinexa_openai_voice') || 'alloy';
  });
  const [voiceLanguage, setVoiceLanguage] = useState<'ar' | 'en' | 'fr' | 'auto'>(() => {
    return (localStorage.getItem('scinexa_ai_voice_lang') as any) || 'ar';
  });
  const [speechEngineMode, setSpeechEngineMode] = useState<'openai_tts' | 'hd_voiceover' | 'system_tts'>(() => {
    return (localStorage.getItem('scinexa_ai_speech_mode') as any) || 'openai_tts';
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
  const [aiStatusText, setAiStatusText] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // System voices list
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueIndexRef = useRef<number>(0);
  const audioQueueChunksRef = useRef<string[]>([]);
  const audioQueueLangRef = useRef<'ar' | 'en' | 'fr'>('ar');

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
    localStorage.setItem('scinexa_openai_api_key', openaiApiKey);
  }, [openaiApiKey]);
  useEffect(() => {
    localStorage.setItem('scinexa_openai_voice', openaiVoice);
  }, [openaiVoice]);
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
    audioQueueChunksRef.current = [];
    audioQueueIndexRef.current = 0;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsTestingVoice(false);
  };

  // Official OpenAI Speech (tts-1) API Caller
  const speakViaOpenAI = async (text: string, apiKey: string, voice: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice || 'alloy',
          response_format: 'mp3',
          speed: speechRate
        })
      });

      if (!response.ok) {
        return false;
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      return true;
    } catch {
      return false;
    }
  };

  // Play next chunk in audio queue (Fallback neural engine)
  const playNextAudioChunk = () => {
    const chunks = audioQueueChunksRef.current;
    const index = audioQueueIndexRef.current;
    const langCode = audioQueueLangRef.current;

    if (index >= chunks.length) {
      setIsSpeaking(false);
      currentAudioRef.current = null;
      return;
    }

    const chunk = chunks[index];
    const encoded = encodeURIComponent(chunk);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${langCode}&client=tw-ob`;

    const audio = new Audio(ttsUrl);
    audio.playbackRate = speechRate;
    currentAudioRef.current = audio;

    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => {
      audioQueueIndexRef.current += 1;
      playNextAudioChunk();
    };
    audio.onerror = () => {
      speakViaSystemTTS(chunk, langCode);
    };

    audio.play().catch(() => {
      speakViaSystemTTS(chunk, langCode);
    });
  };

  // Text-To-Speech Synthesis Router
  const speak = async (rawText: string) => {
    if (!isVoiceEnabled) return;
    stopSpeaking();

    let langCode: 'ar' | 'en' | 'fr' = 'ar';
    if (voiceLanguage === 'auto') {
      const isArabic = /[\u0600-\u06FF]/.test(rawText);
      const isFrench = /[éèêàùçôîâëï]/i.test(rawText);
      langCode = isArabic ? 'ar' : isFrench ? 'fr' : 'en';
    } else {
      langCode = voiceLanguage;
    }

    const cleanedText = cleanTextForSpeech(rawText, langCode);

    // Mode 1: Genuine OpenAI ChatGPT Voice (tts-1) if API Key is configured
    const activeKey = openaiApiKey.trim();
    if (activeKey && (speechEngineMode === 'openai_tts' || speechEngineMode === 'hd_voiceover')) {
      const success = await speakViaOpenAI(cleanedText, activeKey, openaiVoice);
      if (success) return;
    }

    // Mode 2: Neural Studio Audio Queue (Free Fallback)
    if (speechEngineMode !== 'system_tts') {
      const chunks = chunkTextForTTS(cleanedText, 140);
      if (chunks.length > 0) {
        audioQueueChunksRef.current = chunks;
        audioQueueIndexRef.current = 0;
        audioQueueLangRef.current = langCode;
        playNextAudioChunk();
        return;
      }
    }

    // Mode 3: Local System Voices (Works 100% Offline)
    speakViaSystemTTS(cleanedText, langCode);
  };

  const speakViaSystemTTS = (text: string, langCode: 'ar' | 'en' | 'fr') => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === 'ar' ? 'ar-SA' : langCode === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    const hasArabicVoice = availableVoices.some(v => v.lang.toLowerCase().startsWith('ar'));

    if (selectedVoiceURI) {
      const chosen = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (chosen) utterance.voice = chosen;
    } else if (langCode === 'ar' && !hasArabicVoice) {
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 140))}&tl=ar&client=tw-ob`;
      const fallbackAudio = new Audio(audioUrl);
      fallbackAudio.play().catch(() => {});
      return;
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

    window.speechSynthesis.speak(utterance);
  };

  // Test OpenAI Voice Button Handler
  const handleTestOpenAIVoice = async () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    setIsTestingVoice(true);
    const sample = ar
      ? `أهلاً بك! هذا هو الصوت الحقيقي لشات جي بي تي بصوت ${openaiVoice} في منصة ساينكسا.`
      : `Hello! This is the genuine ChatGPT voice ${openaiVoice} speaking on SciNexa.`;

    const activeKey = openaiApiKey.trim();
    if (activeKey) {
      const ok = await speakViaOpenAI(sample, activeKey, openaiVoice);
      if (ok) {
        setIsTestingVoice(false);
        return;
      }
    }
    // Fallback test
    speak(sample);
    setIsTestingVoice(false);
  };

  // Smart Query Resolver: OpenAI Direct API + Lab Knowledge + Open Science Search Fallback
  const handleQuery = async (userQuery: string) => {
    const cleanQuery = userQuery.toLowerCase().trim();
    const activeKey = openaiApiKey.trim();

    // 1. Official OpenAI Chat Completions API if key exists
    if (activeKey) {
      try {
        setAiStatusText(ar ? 'جاري الاستعلام المباشر من OpenAI API...' : 'Calling official OpenAI API...');
        const systemPrompt = `أنت ${activeDisplayName}، خبير ومدرس العلوم في منصة SciNexa لمسابقة ISEF الدولية. المعمل الحالي هو: "${activeLab.nameAr}". أجب على سؤال الطالب بالتفصيل وبدقة علمية فائقة باللغة التي سأل بها (${ar ? 'اللغة العربية الفصيحة' : 'English'}). اشرح المفهوم العلمي بوضوح، وقدم نصيحة عملية يطبقها في المعمل.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: cleanQuery }
            ],
            temperature: 0.7
          }),
          signal: AbortSignal.timeout(7000)
        });

        if (response.ok) {
          const data = await response.json();
          const answer = data.choices?.[0]?.message?.content;
          if (answer) {
            return {
              answer: answer.trim(),
              suggestions: (ar ? activeLab.defaultQuestionsAr : activeLab.defaultQuestionsEn).filter(q => q !== userQuery).slice(0, 2),
              source: 'openai_official' as const
            };
          }
        }
      } catch {
        // Fall through to fallback engine
      }
    }

    // 2. Open-Source GPT-4 Query
    try {
      setAiStatusText(ar ? 'جاري الاستعلام من نموذج GPT-4...' : 'Querying GPT-4 model...');
      const gptSystemContext = `أنت ${activeDisplayName}، خبير ومدرس العلوم في منصة SciNexa لمسابقة ISEF الدولية. المعمل الحالي هو: "${activeLab.nameAr}". أجب على سؤال الطالب بالتفصيل باللغة التي سأل بها (${ar ? 'اللغة العربية الفصيحة' : 'English'}). اشرح المفهوم العلمي بوضوح تام، وقدم نصيحة مخبرية عملية يطبقها في المعمل: ${cleanQuery}`;

      const gptUrl = `https://text.pollinations.ai/${encodeURIComponent(gptSystemContext)}?model=openai`;
      const gptRes = await fetch(gptUrl, { signal: AbortSignal.timeout(5500) });

      if (gptRes.ok) {
        const gptText = await gptRes.text();
        if (gptText && gptText.trim().length > 10 && !gptText.includes('Free limit reached')) {
          return {
            answer: gptText.trim(),
            suggestions: (ar ? activeLab.defaultQuestionsAr : activeLab.defaultQuestionsEn).filter(q => q !== userQuery).slice(0, 2),
            source: 'openai_gpt' as const
          };
        }
      }
    } catch {
      // Graceful local fallback
    }

    // 3. Search in current lab knowledge base
    setAiStatusText(ar ? 'جاري البحث في المعمل...' : 'Searching lab database...');
    for (const item of activeLab.knowledge) {
      if (item.keywords.some(k => cleanQuery.includes(k.toLowerCase()))) {
        return {
          answer: ar ? item.answerAr : item.answerEn,
          suggestions: (ar ? activeLab.defaultQuestionsAr : activeLab.defaultQuestionsEn).filter(q => q !== userQuery).slice(0, 2),
          source: 'local_lab' as const
        };
      }
    }

    // 4. Search across other labs
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

    // 5. Dynamic Open-Source Scientific Knowledge Query
    try {
      const searchLang = ar ? 'ar' : 'en';
      const searchUrl = `https://${searchLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        cleanQuery
      )}&utf8=&format=json&origin=*`;

      const response = await fetch(searchUrl, { signal: AbortSignal.timeout(2500) });
      if (response.ok) {
        const data = await response.json();
        const hits = data.query?.search;
        if (hits && hits.length > 0) {
          const topHit = hits[0];
          const pageTitle = topHit.title;

          const summaryUrl = `https://${searchLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
          const sumRes = await fetch(summaryUrl, { signal: AbortSignal.timeout(2000) });
          if (sumRes.ok) {
            const sumData = await sumRes.json();
            if (sumData.extract) {
              const formatted = ar
                ? `📚 **${sumData.title}** (الموسوعة العلمية):\n${sumData.extract}\n\n💡 *نصيحة مخبرية*: يمكنك اختبار هذا المفهوم مباشرة في معمل "${activeLab.nameAr}" بتغيير المتغيرات وملاحظة النتيجة!`
                : `📚 **${sumData.title}** (Science Archive):\n${sumData.extract}\n\n💡 *Lab Insight*: You can test this empirical concept right inside "${activeLab.nameEn}"!`;
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

    // 6. Intelligent Socratic Pedagogical Fallback
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
    setAiStatusText('');

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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-sm shadow-2xl shadow-emerald-500/30 border-2 border-white/20 transition-all hover:scale-105 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#090a0d] rounded-full animate-ping" />
            </div>
            <div className="text-right">
              <span className="block leading-none text-xs font-bold text-emerald-200">
                {openaiApiKey ? 'صوت ونموذج ChatGPT الرسمي' : 'مدعوم بـ ChatGPT (GPT-4)'}
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
          className={`fixed bottom-4 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 w-[95vw] sm:w-[450px] rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/40 bg-[#070b14]/95 backdrop-blur-xl transition-all duration-300 flex flex-col ${
            isMinimized ? 'h-16' : 'h-[620px] max-h-[90vh]'
          }`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-indigo-900/40 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-black rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white font-mono">
                    {activeDisplayName}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {openaiApiKey ? `ChatGPT (${openaiVoice})` : 'GPT-4'}
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
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
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
                    ? 'bg-emerald-500/30 border-emerald-400 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10 border-transparent'
                }`}
                title={ar ? 'إعدادات صوت ChatGPT ومفتاح OpenAI API' : 'ChatGPT Voice & OpenAI Settings'}
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
            <div className="p-3.5 bg-slate-950/98 border-b border-emerald-500/30 text-xs space-y-3.5 max-h-[360px] overflow-y-auto animate-in slide-in-from-top duration-200">
              {/* OpenAI API Key Section */}
              <div className="p-2.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    {ar ? 'مفتاح OpenAI API الرسمي (لتفعيل صوت ChatGPT الحقيقي):' : 'Official OpenAI API Key:'}
                  </label>
                  {openaiApiKey ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {ar ? 'مفعل رسمي' : 'Active'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {ar ? 'وضع مجاني' : 'Free Mode'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={openaiApiKey}
                      onChange={e => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-proj-..."
                      className="w-full bg-slate-900/90 border border-emerald-500/30 focus:border-emerald-400 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {openaiApiKey && (
                    <button
                      type="button"
                      onClick={() => setOpenaiApiKey('')}
                      className="px-2 py-1.5 text-[11px] rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                      title={ar ? 'مسح المفتاح' : 'Clear Key'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {ar
                    ? '💡 يمكنك وضع المفتاح هنا مباشرة أو وضعه في ملف .env باسم VITE_OPENAI_API_KEY. عند إدخال المفتاح يتم استدعاء نموذج tts-1 بصوت ChatGPT الرسمي فوراً!'
                    : '💡 Enter your OpenAI key here or in .env as VITE_OPENAI_API_KEY to activate genuine ChatGPT tts-1 neural voice!'}
                </p>
              </div>

              {/* Official OpenAI Voices Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                    🎙️ {ar ? 'اختر صوت ChatGPT الحقيقي المفصل:' : 'Select Official ChatGPT Voice:'}
                  </label>
                  <button
                    type="button"
                    onClick={handleTestOpenAIVoice}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-emerald-300" />
                    {isTestingVoice ? (ar ? 'جاري التشغيل...' : 'Playing...') : (ar ? 'تجربة الصوت' : 'Test Voice')}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {OPENAI_VOICES.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setOpenaiVoice(v.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-left rtl:text-right border transition-all flex items-center justify-between ${
                        openaiVoice === v.id
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold shadow-md shadow-emerald-500/10'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-bold text-[11px] block">{v.id.toUpperCase()}</span>
                        <span className="text-[9px] text-slate-400 block truncate">
                          {ar ? v.nameAr.split('(')[1]?.replace(')', '') || v.nameAr : v.nameEn}
                        </span>
                      </div>
                      {openaiVoice === v.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Persona / Name Customization */}
              <div className="pt-2 border-t border-white/10">
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  🏷️ {ar ? 'تخصيص هوية واسم المعلم:' : 'Tutor Persona & Name:'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PERSONAS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPersonaId(p.id);
                        setCustomName('');
                      }}
                      className={`px-2 py-1.5 rounded-xl text-left rtl:text-right border transition-all flex items-center justify-between ${
                        selectedPersonaId === p.id && !customName
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="truncate text-[11px]">{ar ? p.nameAr : p.nameEn}</span>
                      {selectedPersonaId === p.id && !customName && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  ))}
                </div>

                {/* Custom Name Write-In */}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder={ar ? 'أو اكتب اسماً مخصصاً (مثال: مستر أحمد / د. ساينكسا)...' : 'Or type a custom name...'}
                    className="flex-1 bg-slate-900 border border-white/15 focus:border-emerald-400 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
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

              {/* Language Selection */}
              <div className="pt-2 border-t border-white/10 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 shrink-0">
                  {ar ? 'لغة النطق:' : 'Voice Lang:'}
                </span>
                {(['ar', 'en', 'fr', 'auto'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setVoiceLanguage(l)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      voiceLanguage === l
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {l === 'ar' ? '🇸🇦 عربية' : l === 'en' ? '🇬🇧 English' : l === 'fr' ? '🇫🇷 Français' : '🌐 تلقائي'}
                  </button>
                ))}
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
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-sm shadow-lg'
                          : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-bl-sm shadow-md'
                      }`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[10px] text-emerald-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            {activeDisplayName}:
                            {msg.source === 'openai_official' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/40">
                                OpenAI GPT-4o
                              </span>
                            )}
                            {msg.source === 'openai_gpt' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                                GPT-4
                              </span>
                            )}
                            {msg.source === 'open_science' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-normal">
                                بحث علمي
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => speak(msg.text)}
                            className="p-1 hover:text-white transition-colors flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-300 cursor-pointer"
                            title={ar ? 'استمع بصوت ChatGPT الحقيقي' : 'Listen with ChatGPT voice'}
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
                            className="text-[11px] px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 transition-all text-right hover:scale-102 flex items-center gap-1 cursor-pointer"
                          >
                            <Lightbulb className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* AI Thinking Animation */}
                {isThinking && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/80 border border-white/10 max-w-[240px] text-xs text-emerald-400">
                    <BrainCircuit className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">
                      {aiStatusText || (ar ? 'جاري التحليل...' : 'Analyzing...')}
                    </span>
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
                        ? `اسأل ${activeDisplayName} (ChatGPT) في أي تجربة أو قانون علمي...`
                        : `Ask ${activeDisplayName} (ChatGPT) any science question...`
                    }
                    className="flex-1 bg-slate-950/80 border border-white/15 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white transition-all shadow-md cursor-pointer"
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
