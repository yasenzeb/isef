/**
 * SciNexaAIModal.tsx — العقل المفكر والمعلم العلمي والباحث الذكي التفاعلي لمنظومة SciNexa
 * يضم الشات العلمي الكامل، والمكالمة الصوتية المباشرة مع داروين، ووكيل Fish Audio الرسمي
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSession } from '../context/SessionContext';
import { tLang } from '../i18n/langHelpers';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  X,
  Minimize2,
  Maximize2,
  Square,
  BrainCircuit,
  Copy,
  CheckCheck,
  Trash2,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Radio,
  Waves,
  MessageSquare,
  Bot,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export interface SciNexaAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'chat' | 'call' | 'fish';
  isEmbedded?: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  suggestions?: string[];
  modelBadge?: string;
  isReprimand?: boolean;
}

// Lab metadata with detailed context and suggested prompts
const LAB_CONTEXTS: Record<
  string,
  {
    ar: string;
    en: string;
    descriptionAr: string;
    defaultPromptsAr: string[];
    defaultPromptsEn: string[];
  }
> = {
  home: {
    ar: 'المنصة العلمية العامة',
    en: 'SciNexa General Science Matrix',
    descriptionAr: 'منظومة محاكاة العلوم المعتمدة للمختبرات الافتراضية التفاعلية الستة.',
    defaultPromptsAr: [
      'ما هي أهداف ورؤية منظومة SciNexa في تطوير التعليم التجريبي؟',
      'كيف تساهم المعامل الافتراضية في حل عجز التجهيزات المخبرية؟',
      'اقترح علي تجربة علمية شيقة أبدأ بها اليوم!'
    ],
    defaultPromptsEn: [
      'What are the goals of SciNexa in experimental science?',
      'How do virtual labs solve laboratory equipment shortages?',
      'Suggest an exciting lab experiment to start today!'
    ]
  },
  anatomy: {
    ar: 'أطلس التشريح الطبي 3D',
    en: '3D Human Medical Anatomy Atlas',
    descriptionAr: 'فحص عظام الهيكل العظمي البالغ (210 عظمة) والأجهزة الحيوية السبعة مع عزل أي عضو 3D.',
    defaultPromptsAr: [
      'كم عدد عظام جسم الإنسان البالغ وما أقواها وأطولها؟',
      'كيف يتناسق عمل العضلات الباسطة والقابضة في حركة الذراع؟',
      'ما هي الوظيفة الحيوية لحماية المخ عبر عظام الجمجمة؟'
    ],
    defaultPromptsEn: [
      'How many bones are in the adult human skeleton and what is the strongest?',
      'How do flexor and extensor muscles coordinate in arm movement?',
      'What is the vital function of cranial skull bones in brain protection?'
    ]
  },
  physics: {
    ar: 'مختبر الفيزياء والدوائر الكهربائية',
    en: 'Physics, DC Circuits & Waves Lab',
    descriptionAr: 'محاكاة دوائر التيار المستمر، قوانين أوم، التوصيل على التوالي والتوازي، وسرعة الموجات.',
    defaultPromptsAr: [
      'كيف أطبق قانون أوم لحساب شدة التيار وفرق الجهد والمقاومة؟',
      'ما الفرق بين التوصيل على التوالي والتوازي في شدة الإضاءة؟',
      'ماذا يحدث فيزيائياً عند حدوث قصر بالدائرة (Short Circuit)؟'
    ],
    defaultPromptsEn: [
      'How do I apply Ohm’s law to calculate current, voltage and resistance?',
      'What is the difference between series and parallel circuits in lamp brightness?',
      'What happens physically during an electrical short circuit?'
    ]
  },
  chemistry: {
    ar: 'مختبر الكيمياء والجدول الدوري',
    en: 'Chemistry & Reaction Simulator',
    descriptionAr: 'دمج عناصر الجدول الدوري الـ 118، محاكاة تفاعلات الأكسدة والاختزال، وحساب ΔH.',
    defaultPromptsAr: [
      'ماذا يحدث عند دمج الصوديوم مع غاز الكلور وما نوع الرابطة الناتجة؟',
      'كيف أفرق بين التفاعل الطارد والتفاعل الماص للحرارة عملياً؟',
      'لماذا يحترق شريط الماغنسيوم في الأكسجين بلهب أبيض مبهر؟'
    ],
    defaultPromptsEn: [
      'What happens when sodium combines with chlorine gas?',
      'How do I differentiate exothermic from endothermic reactions?',
      'Why does magnesium ribbon burn in oxygen with a brilliant white flame?'
    ]
  },
  biology: {
    ar: 'مختبر الأحياء والخلية والكائنات الدقيقة',
    en: 'Biology, Cytology & Protozoa Lab',
    descriptionAr: 'فحص الخلية النباتية والحيوانية، وتركيب لولب DNA المزدوج، وكائنات المستنقعات.',
    defaultPromptsAr: [
      'ما هي الميتوكوندريا ولماذا تسمى مصنع الطاقة الخلوية ATP؟',
      'ما الفروق التركيبية الأساسية بين الخلية النباتية والخلية الحيوانية؟',
      'كيف تتحرك الأميبا واليوجلينا والبراميسيوم تحت الميكروسكوب؟'
    ],
    defaultPromptsEn: [
      'What are mitochondria and why are they called the ATP powerhouse?',
      'What are structural differences between plant and animal cells?',
      'How do amoeba, euglena, and paramecium move under a microscope?'
    ]
  },
  geology: {
    ar: 'مختبر علوم الأرض والزلازل',
    en: 'Geology & Seismic Resonance Lab',
    descriptionAr: 'محاكاة طبقات الأرض الأربعة، موجات الزلازل P و S، وظاهرة الرنين الميكانيكي.',
    defaultPromptsAr: [
      'ما هي طبقات الأرض الأربعة من السطح إلى اللب الداخلي؟',
      'كيف تسبب ظاهرة الرنين انهيار الأبراج والمباني أثناء الزلازل؟',
      'ما الفرق بين مقياس ريختر ومقياس ميركالي في قياس الزلازل؟'
    ],
    defaultPromptsEn: [
      'What are the four layers of the Earth from crust to inner core?',
      'How does seismic resonance cause towers to collapse during earthquakes?',
      'What is the difference between Richter scale and Mercalli scale?'
    ]
  },
  astronomy: {
    ar: 'مختبر علوم الفلك ومدارات كبلر',
    en: 'Astronomy & Kepler Orbits Lab',
    descriptionAr: 'محاكاة كواكب المجموعة الشمسية الثمانية، قوانين كبلر، وأطوار القمر والكسوف.',
    defaultPromptsAr: [
      'ما هو أكبر كوكب في مجموعتنا الشمسية وما خصائص كوكب المشتري؟',
      'لماذا تتغير أطوار القمر الظاهرية خلال الشهر القمري؟',
      'كيف تشرح قوانين كبلر حركة الكواكب الإهليجية حول الشمس؟'
    ],
    defaultPromptsEn: [
      'What is the largest planet in our solar system and its characteristics?',
      'Why do visible moon phases change throughout the lunar month?',
      'How do Kepler laws describe elliptical planetary orbits around the Sun?'
    ]
  }
};

// Quick scientific responses generator
function generateScientificAnswer(query: string, labId: string, ar: boolean): { text: string; modelBadge: string } {
  const q = query.toLowerCase();

  // Ohm's law & circuits
  if (q.includes('أوم') || q.includes('ohm') || q.includes('مقاومة') || q.includes('تيار') || q.includes('فولت')) {
    return {
      text: ar
        ? `### قانون أوم والعلاقة الرياضية الأساسية\nينص قانون أوم على أن **شدة التيار (I)** المار في موصل تتناسب طردياً مع **فرق الجهد (V)** وعكسياً مع **المقاومة (R)**:\n\n$$V = I \\times R$$\n\n- **فرق الجهد (V)** يُقاس بالفولت (Volt)\n- **شدة التيار (I)** تُقاس بالأمبير (Ampere)\n- **المقاومة (R)** تُقاس بالأوم (\\(\\Omega\\))\n\nيمكنك الآن فتح **مختبر الفيزياء والدوائر** وضبط المقاومة وملاحظة توهج المصباح وقراءة الأميتر عملياً!`
        : `### Ohm’s Law & Governing Circuit Equation\nOhm’s law states that electric current (I) is directly proportional to potential difference (V) and inversely proportional to resistance (R):\n\n$$V = I \\times R$$\n\nYou can test this directly in our **Physics & DC Circuits Lab** by adjusting voltage and observing the digital ammeter readings!`,
      modelBadge: 'Darwin Physics Engine'
    };
  }

  // Chemistry reactions
  if (q.includes('صوديوم') || q.includes('كلور') || q.includes('كيمياء') || q.includes('تفاعل') || q.includes('تفاعلات') || q.includes('chemistry')) {
    return {
      text: ar
        ? `### تفاعل الصوديوم مع غاز الكلور (تكوين ملح الطعام)\nعند تفاعل فلز الصوديوم النشط \\(2\\text{Na}\\) مع غاز الكلور السام \\(\\text{Cl}_2\\)، يحدث تفاعل أكسدة واختزال عنيف وطارد للحرارة:\n\n$$2\\text{Na} + \\text{Cl}_2 \\rightarrow 2\\text{NaCl} + \\Delta H$$\n\n- يفقد الصوديوم إلكترون تكافؤ ليتحول إلى أيون موجب \\(\\text{Na}^+\\).\n- يكتسب الكلور الإلكترون ليتحول إلى أيون سالب \\(\\text{Cl}^-\\).\n- تتكون رابطة أيونية قوية تنتج بلورات كلوريد الصوديوم الآمنة.\n\nجرب وضع الصوديوم والكلور معاً في **معمل الكيمياء الافتراضي** لمشاهدة الوميض وحساب كمية الطاقة!`
        : `### Reaction of Sodium and Chlorine Gas\nCombining reactive metallic sodium with chlorine gas triggers a violent exothermic redox reaction producing ordinary table salt:\n\n$$2\\text{Na} + \\text{Cl}_2 \\rightarrow 2\\text{NaCl} + \\Delta H$$\n\nTry mixing them inside our **Chemistry Lab** to observe the reaction enthalpy and balanced equations!`,
      modelBadge: 'Darwin Reaction Matrix'
    };
  }

  // Anatomy & Skeleton
  if (q.includes('عظم') || q.includes('جمجمة') || q.includes('فخذ') || q.includes('تشريح') || q.includes('anatomy') || q.includes('عضلة')) {
    return {
      text: ar
        ? `### الهيكل العظمي البشري في أطلس التشريح 3D\n- يتكون الهيكل العظمي للشخص البالغ من **206 إلى 210 عظمة** بعد التحام عظام الجمجمة والحوض.\n- **عظم الفخذ (Femur)** هو أطول وأقوى عظمة في جسم الإنسان، ويتحمل ضغطاً هائلاً يصل لعدة أضعاف وزن الجسم.\n- **عظام الجمجمة (Cranium)** تشكل درعاً صلباً واقياً للمخ عبر دروز عظمية مسننة غير متحركة، والعظمة الوحيدة المتحركة هي **عظمة الفك السفلي (Mandible)**.\n\nيمكنك الآن فتح **أطلس التشريح الطبي 3D** لتدوير وعزل عظام الساق والجمجمة وقراءة بطاقاتها الطبية!`
        : `### Human Skeletal Anatomy in 3D Atlas\n- The adult human skeleton contains **206 to 210 bones** after fusion.\n- The **Femur** (thigh bone) is the longest, heaviest, and strongest bone in the body.\n- The **Cranium** provides an interlocking protective vault for the brain, while the **Mandible** is the only movable skull bone.\n\nOpen the **3D Anatomy Atlas** right now to isolate and rotate any bone in full 3D!`,
      modelBadge: 'Darwin Anatomy Atlas'
    };
  }

  // Biology & Cells
  if (q.includes('خلية') || q.includes('dna') || q.includes('ميتوكوندريا') || q.includes('أحياء') || q.includes('أميبا') || q.includes('biology')) {
    return {
      text: ar
        ? `### الخلية والميتوكوندريا ولولب DNA\n- **الميتوكوندريا (Mitochondria)** هي مركز التنفس الخلوي ومصنع إنتاج جزيئات الطاقة **ATP** عن طريق أكسدة الجلوكوز.\n- **الحمض النووي (DNA)** يتكون من شريطين حلزونيين يربط بينهما أزواج القواعد النيتروجينية (A-T و C-G).\n- تختلف الخلية النباتية بوجود **الجدار الخلوي السليلوزي** و**البلاستيدات الخضراء** وفجوة عصارية مركزية كبيرة.\n\nشاهد النموذج ثلاثي الأبعاد لجزيء DNA والخلية الحية في **مختبر الأحياء**!`
        : `### Cytology, Mitochondria & DNA Double Helix\n- **Mitochondria** generate the chemical energy needed by cells in the form of ATP molecules through cellular respiration.\n- **DNA** consists of two polynucleotide chains coiling around each other, bridged by hydrogen-bonded base pairs (A-T and C-G).\n\nExplore interactive 3D organelles and DNA strands directly inside our **Biology Lab**!`,
      modelBadge: 'Darwin Bio Engine'
    };
  }

  // Astronomy
  if (q.includes('فلك') || q.includes('كوكب') || q.includes('كبلر') || q.includes('شمس') || q.includes('قمر') || q.includes('astronomy')) {
    return {
      text: ar
        ? `### ميكانيكا الفلك وقوانين كبلر لحركة الكواكب\n- **قانون كبلر الأول**: تدور الكواكب حول الشمس في مدارات إهليجية (بيضوية) تقع الشمس في إحدى بؤرتيها.\n- **قانون كبلر الثاني**: يمسح الخط الواصل بين الكوكب والشمس مساحات متساوية في أزمنة متساوية، لذا تزداد سرعة الكوكب عند نقطة الحضيض (الأقرب للشمس).\n- **المشتري (Jupiter)** هو أضخم كواكب المجموعة الشمسية وكتلته تفوق مجموع كتلة بقية الكواكب مجتمعة بأكثر من مرتين ونصف.\n\nتفضل بزيارة **مرصد الفلك ومدارات كبلر** لتشغيل المحاكاة الفضائية ثلاثية الأبعاد!`
        : `### Celestial Mechanics & Kepler’s Laws of Planetary Motion\n- **First Law**: Planets move in elliptical orbits with the Sun at one focus.\n- **Second Law**: A radius vector joining any planet to the Sun sweeps out equal areas in equal lengths of time.\n- **Jupiter** is by far the largest planet, with a mass more than 2.5 times that of all other planets combined.\n\nLaunch the **Astronomy Observatory** to manipulate Kepler orbits and celestial bodies in real time!`,
      modelBadge: 'Darwin Celestial Matrix'
    };
  }

  // Default rich guide
  return {
    text: ar
      ? `### التحليل العلمي لداروين · منصة SciNexa\nاستفسارك العلمي حول: "${query}" يرتبط مباشرة بمفاهيم العلوم والتجارب التفاعلية.\n\nمنظومة SciNexa تمنحك إمكانية إجراء هذا الاستكشاف بنفسك عملياً عبر مختبراتنا الافتراضية:\n- **معمل الفيزياء**: لقوانين الحركة والكهرباء والبصريات.\n- **معمل الكيمياء**: لاختبار تفاعلات الأكسدة والاختزال والروابط.\n- **أطلس التشريح 3D**: لتشريح عظام وأعضاء الجسم البشري.\n- **معمل الأحياء**: لفحص الخلية وDNA والكائنات الدقيقة.\n- **معمل علوم الأرض**: لرصد طبقات الأرض والزلازل.\n- **مرصد الفلك**: لدراسة مدارات الكواكب والمجموعة الشمسية.\n\nما هو الجزء الذي تود أن نبدأ بتجربته معاً الآن؟`
      : `### Darwin Scientific Synthesis · SciNexa\nRegarding your question: "${query}", this concept connects directly to interactive experimentation.\n\nYou can explore this in detail across our six virtual science laboratories. Let me know which experiment you would like to run!`,
    modelBadge: 'SciNexa AI Scholar'
  };
}

export const SciNexaAIModal: React.FC<SciNexaAIModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'chat',
  isEmbedded = false,
}) => {
  const { language, isRTL } = useLanguage();
  const { user, role, educator } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [activeTabMode, setActiveTabMode] = useState<'chat' | 'call' | 'fish'>(initialTab);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Call Mode State
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isMicListening, setIsMicListening] = useState(false);
  const [callTranscript, setCallTranscript] = useState('');
  const [reprimandAlert, setReprimandAlert] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fishWidgetContainerRef = useRef<HTMLDivElement>(null);

  // Detect current lab from URL
  const getCurrentLabId = (): string => {
    const p = location.pathname;
    if (p.includes('/labs/chemistry')) return 'chemistry';
    if (p.includes('/labs/physics')) return 'physics';
    if (p.includes('/labs/anatomy')) return 'anatomy';
    if (p.includes('/labs/biology')) return 'biology';
    if (p.includes('/labs/geology')) return 'geology';
    if (p.includes('/labs/astronomy')) return 'astronomy';
    return 'home';
  };

  const currentLabId = getCurrentLabId();
  const labContext = LAB_CONTEXTS[currentLabId] || LAB_CONTEXTS.home;

  // Clean student first name (avoiding "Simone")
  const getCleanStudentName = () => {
    const rawQuad = localStorage.getItem('scinexa_user_fullname') || '';
    const namePart = rawQuad.trim().split(/\s+/).filter((n) => !n.toLowerCase().includes('simone'))[0];
    if (namePart) return namePart;
    const userNamePart = user?.name?.trim().split(/\s+/).filter((n) => !n.toLowerCase().includes('simone'))[0];
    if (userNamePart) return userNamePart;
    return ar ? 'طالب' : 'Student';
  };

  // Mount Fish Audio widget if tab selected
  useEffect(() => {
    if (activeTabMode === 'fish' || isOpen) {
      if (!document.querySelector('script[src*="agent-widget-embed"]')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@fishaudio/agent-widget-embed@0.3.0/dist/index.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [activeTabMode, isOpen]);

  // Expand official fish-agent when clicking the button
  const triggerFishAgentExpand = () => {
    try {
      document.dispatchEvent(new CustomEvent('fish-agent:expand'));
    } catch {
      /* ignore */
    }
  };

  // Initialize fresh lab welcome message
  useEffect(() => {
    const welcome = ar
      ? `أهلاً بك يا بطل! أنا "SciNexa AI" باحث ومعلم العلوم الذكي المعتمد لمنظومة ساينكسا.\n\nأنت الآن في **${labContext.ar}**.\n${labContext.descriptionAr}\n\nاسألني عن أي تجربة أو قانون علمي، وسأشرحه لك بالصوت والصورة، أو انتقل إلى وضع المكالمة الصوتية المباشرة مع داروين!`
      : `Welcome scholar! I am SciNexa AI, your certified scientific intelligence assistant.\n\nYou are in **${labContext.en}**.\nAsk me any scientific principle or launch a real-time voice call with Darwin!`;

    const initialMsg: Message = {
      id: `welcome-${currentLabId}-${Date.now()}`,
      sender: 'ai',
      text: welcome,
      timestamp: Date.now(),
      suggestions: ar ? labContext.defaultPromptsAr : labContext.defaultPromptsEn,
      modelBadge: 'Gemini Live'
    };

    setMessages([initialMsg]);
  }, [currentLabId, language]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Voice synthesis (SpeechSynthesis)
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speakText = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`[\]()$]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = ar ? 'ar-EG' : 'en-US';
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  // Web Speech API
  const getSpeechRecognition = () => {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const recognition = new SpeechRecognition();
    recognition.lang = ar ? 'ar-EG' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    return recognition;
  };

  // Dictation mic in chat
  const toggleInputMic = () => {
    if (isMicListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsMicListening(false);
      return;
    }

    const recognition = getSpeechRecognition();
    if (!recognition) {
      alert(ar ? 'خاصية الميكروفون غير مدعومة في متصفحك. يرجى استخدام Chrome أو Edge.' : 'Speech recognition not supported in your browser.');
      return;
    }

    recognitionRef.current = recognition;
    setIsMicListening(true);

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setInputText(transcript);
    };

    recognition.onerror = () => setIsMicListening(false);
    recognition.onend = () => setIsMicListening(false);

    try {
      recognition.start();
    } catch {
      setIsMicListening(false);
    }
  };

  // Process user question / command
  const handleProcessQuery = async (queryText: string) => {
    const clean = queryText.trim();
    if (!clean) return;

    const lower = clean.toLowerCase();
    const studentName = getCleanStudentName();

    // 1. ROLE SECURITY: If student asks to manage/add classes or access educator records
    const isAdminCommand =
      lower.includes('أضف فصل') ||
      lower.includes('اضف فصل') ||
      lower.includes('إضافة فصل') ||
      lower.includes('لوحة الإدارة') ||
      lower.includes('تعديل الدرجات') ||
      lower.includes('بوابة المدرس') ||
      lower.includes('كلاس') ||
      lower.includes('add class') ||
      lower.includes('admin portal');

    if (isAdminCommand) {
      const isEducator = role === 'teacher' || role === 'admin' || Boolean(educator);
      if (!isEducator) {
        const reprimand = ar
          ? `يا ${studentName}، أنت ممنوع تعمل كدا ومينفعش، والأمر ده مش هنفذه لأنك طالب مش معلم، وإدارة الفصول وصلاحيات المدرسة محصورة بالمعلم والمدير فقط.`
          : `Notice: You are not allowed to perform this action. I will not execute this command because you are a student, not a teacher. Class and school management is restricted to educators and administrators only.`;

        setReprimandAlert(reprimand);
        const repMsg: Message = {
          id: `rep-${Date.now()}`,
          sender: 'ai',
          text: reprimand,
          timestamp: Date.now(),
          modelBadge: 'Role Security',
          isReprimand: true,
          suggestions: ar ? ['انقلني لمعمل الكيمياء', 'أطلس التشريح 3D', 'معمل الفيزياء'] : ['Chemistry Lab', 'Anatomy Atlas', 'Physics Lab']
        };
        setMessages((prev) => [...prev, repMsg]);
        speakText(reprimand);
        return;
      }
    }

    // 2. NAVIGATION COMMANDS with reason if already on page
    if (lower.includes('كيمياء') && (lower.includes('انقلني') || lower.includes('افتح') || lower.includes('معمل') || lower.includes('take me'))) {
      if (location.pathname === '/app/labs/chemistry') {
        const msg = ar ? 'لم أنقلك لأنك موجود بالفعل داخل معمل الكيمياء والتفاعلات الآن.' : 'You are already inside the Chemistry Lab.';
        speakText(msg);
        setMessages((prev) => [...prev, { id: `nav-${Date.now()}`, sender: 'ai', text: msg, timestamp: Date.now() }]);
        return;
      }
      const msg = ar ? 'حاضر، جاري نقلك إلى معمل الكيمياء والتفاعلات الآن...' : 'Launching Chemistry Lab...';
      speakText(msg);
      setTimeout(() => { if (!isEmbedded) onClose(); navigate('/app/labs/chemistry'); }, 900);
      return;
    }

    if (lower.includes('تشريح') && (lower.includes('انقلني') || lower.includes('افتح') || lower.includes('أطلس') || lower.includes('take me'))) {
      if (location.pathname === '/app/labs/anatomy') {
        const msg = ar ? 'لم أنقلك لأنك موجود بالفعل داخل أطلس التشريح الطبي 3D الآن.' : 'You are already inside the Anatomy Atlas.';
        speakText(msg);
        setMessages((prev) => [...prev, { id: `nav-${Date.now()}`, sender: 'ai', text: msg, timestamp: Date.now() }]);
        return;
      }
      const msg = ar ? 'جاري فتح أطلس التشريح البشري الطبي ثلاثي الأبعاد...' : 'Opening 3D Anatomy Atlas...';
      speakText(msg);
      setTimeout(() => { if (!isEmbedded) onClose(); navigate('/app/labs/anatomy'); }, 900);
      return;
    }

    if (lower.includes('فيزياء') && (lower.includes('انقلني') || lower.includes('افتح') || lower.includes('دوائر') || lower.includes('take me'))) {
      if (location.pathname === '/app/labs/physics') {
        const msg = ar ? 'لم أنقلك لأنك موجود بالفعل داخل معمل الفيزياء والدوائر الآن.' : 'You are already inside the Physics Lab.';
        speakText(msg);
        setMessages((prev) => [...prev, { id: `nav-${Date.now()}`, sender: 'ai', text: msg, timestamp: Date.now() }]);
        return;
      }
      const msg = ar ? 'جاري نقلك إلى مختبر الفيزياء والدوائر الكهربائية...' : 'Launching Physics Lab...';
      speakText(msg);
      setTimeout(() => { if (!isEmbedded) onClose(); navigate('/app/labs/physics'); }, 900);
      return;
    }

    if ((lower.includes('رياضيات') || lower.includes('رياضه') || lower.includes('هندسة') || lower.includes('math')) && (lower.includes('انقلني') || lower.includes('افتح') || lower.includes('معمل') || lower.includes('take me'))) {
      if (location.pathname === '/app/labs/math') {
        const msg = ar ? 'لم أنقلك لأنك موجود بالفعل داخل معمل الرياضيات والهندسة الآن.' : 'You are already inside the Math Lab.';
        speakText(msg);
        setMessages((prev) => [...prev, { id: `nav-${Date.now()}`, sender: 'ai', text: msg, timestamp: Date.now() }]);
        return;
      }
      const msg = ar ? 'جاري نقلك فوراً إلى معمل الرياضيات والهندسة...' : 'Launching Math & Geometry Lab...';
      speakText(msg);
      setTimeout(() => { if (!isEmbedded) onClose(); navigate('/app/labs/math'); }, 900);
      return;
    }

    // 3. REGULAR SCIENTIFIC QUERY
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: clean,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);
    stopSpeaking();

    // Generate intelligent scientific answer
    setTimeout(() => {
      const result = generateScientificAnswer(clean, currentLabId, ar);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.text,
        timestamp: Date.now(),
        modelBadge: result.modelBadge,
        suggestions: ar
          ? ['اشرح لي هذا المبدأ بمثال عملي', 'كيف أصمم تجربة لاختبار هذه النظرية؟']
          : ['Give me a practical example', 'How do I test this in the lab?'],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
      speakText(result.text);
    }, 450);
  };

  // Start Voice Call loop
  const startVoiceCall = () => {
    stopSpeaking();
    setIsCallActive(true);
    setCallStatus('listening');
    setCallTranscript('');
    setActiveTabMode('call');

    const recognition = getSpeechRecognition();
    if (!recognition) {
      alert(ar ? 'التعرف الصوتي غير مدعوم في متصفحك.' : 'Speech recognition not supported.');
      setIsCallActive(false);
      setCallStatus('idle');
      return;
    }

    recognitionRef.current = recognition;
    let finalTrans = '';

    recognition.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTrans += e.results[i][0].transcript + ' ';
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setCallTranscript(finalTrans || interim);
    };

    recognition.onend = async () => {
      const spoken = finalTrans.trim();
      if (spoken) {
        setCallStatus('thinking');
        await handleProcessQuery(spoken);
        setCallStatus('speaking');
      } else {
        setTimeout(() => {
          if (isCallActive) startVoiceCall();
        }, 600);
      }
    };

    recognition.onerror = () => {
      if (isCallActive) {
        setTimeout(() => startVoiceCall(), 1000);
      }
    };

    try {
      recognition.start();
    } catch {
      /* ignore */
    }
  };

  const endVoiceCall = () => {
    stopSpeaking();
    setIsCallActive(false);
    setCallStatus('idle');
    setCallTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
  };

  // Copy message
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear chat
  const handleClearChat = () => {
    stopSpeaking();
    const initialMsg: Message = {
      id: `fresh-${Date.now()}`,
      sender: 'ai',
      text: ar
        ? `بدأنا جلسة علمية جديدة في **${labContext.ar}**! اسأل داروين عن أي تجربة أو قانون علمي تود استكشافه الآن.`
        : `Started a fresh session in **${labContext.en}**! What experiment or concept would you like to explore?`,
      timestamp: Date.now(),
      suggestions: ar ? labContext.defaultPromptsAr : labContext.defaultPromptsEn,
      modelBadge: 'Gemini Live'
    };
    setMessages([initialMsg]);
  };

  // Render markdown inline formatting
  const renderFormatted = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          const t = line.trim();
          if (!t) return <div key={idx} className="h-1" />;
          if (t.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-cyan-300 text-[13px] mt-2 mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {t.slice(4)}
              </h4>
            );
          }
          if (t.startsWith('- ') || t.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pr-2 text-white/90">
                <span className="text-cyan-400 mt-1 shrink-0 text-[10px]">•</span>
                <span>{t.slice(2)}</span>
              </div>
            );
          }
          return <p key={idx} className="text-white/90">{t}</p>;
        })}
      </div>
    );
  };

  if (!isOpen && !isEmbedded) return null;

  return (
    <div
      role={isEmbedded ? 'region' : 'dialog'}
      aria-modal={!isEmbedded}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={
        isEmbedded
          ? 'w-full rounded-[24px] bg-[#07090e] border border-white/15 overflow-hidden text-white shadow-2xl flex flex-col h-[740px]'
          : 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200'
      }
    >
      <div
        className={
          isEmbedded
            ? 'w-full h-full flex flex-col'
            : `relative w-full max-w-[560px] rounded-[24px] bg-[#07090e] text-white shadow-2xl border border-white/15 overflow-hidden flex flex-col transition-all duration-300 ${
                isMinimized ? 'h-16' : 'h-[660px] max-h-[92vh]'
              }`
        }
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-950/70 via-indigo-950/60 to-transparent border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg text-white">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-cyan-400 border-2 border-black rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-white font-mono">
                  SciNexa AI Scholar
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1 font-mono">
                  <Sparkles className="w-2.5 h-2.5" />
                  Fish & Gemini Live
                </span>
              </div>
              <span className="text-[10px] text-cyan-300/80 block -mt-0.5 truncate max-w-[220px]">
                {labContext.ar}
              </span>
            </div>
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-1">
            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-colors animate-pulse"
                title={ar ? 'إيقاف الصوت' : 'Stop Audio'}
              >
                <Square className="w-4 h-4 fill-rose-300" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setIsVoiceEnabled(!isVoiceEnabled);
              }}
              className={`p-1.5 rounded-lg border transition-colors ${
                isVoiceEnabled
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
              title={isVoiceEnabled ? (ar ? 'كتم الصوت' : 'Mute') : (ar ? 'تفعيل الصوت' : 'Unmute')}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              title={ar ? 'مسح المحادثة' : 'Clear Chat'}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {!isEmbedded && (
              <>
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    if (isCallActive) endVoiceCall();
                    onClose();
                  }}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sub-Header Mode Switcher Tabs */}
        {!isMinimized && (
          <div className="px-4 py-2 bg-[#04060b] border-b border-white/10 flex items-center justify-between gap-1 text-[11px] shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setActiveTabMode('chat');
                }}
                className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold ${
                  activeTabMode === 'chat'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{ar ? 'شات الذكاء العلمي 3D' : 'Science AI Chat'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setActiveTabMode('call');
                }}
                className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold ${
                  activeTabMode === 'call'
                    ? 'bg-gradient-to-r from-indigo-500/30 to-teal-500/30 text-teal-200 border border-teal-500/40 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>{ar ? 'مكالمة داروين الصوتية 🎙️' : 'Darwin Live Call'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setActiveTabMode('fish');
                  triggerFishAgentExpand();
                }}
                className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold ${
                  activeTabMode === 'fish'
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{ar ? 'وكيل Fish Audio الرسمي' : 'Official Fish Agent'}</span>
              </button>
            </div>

            {/* Role indicator pill */}
            <span
              className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                role === 'student'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {role === 'student'
                ? ar
                  ? `طالب (${getCleanStudentName()})`
                  : `Student (${getCleanStudentName()})`
                : ar
                ? 'معلم / إدارة'
                : 'Educator'}
            </span>
          </div>
        )}

        {/* Modal Body */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#080a10]">
            {/* ── MODE 1: CHAT ── */}
            {activeTabMode === 'chat' && (
              <>
                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[92%] p-3.5 rounded-2xl text-[12px] leading-relaxed shadow-lg ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-sm'
                            : msg.isReprimand
                            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-100 rounded-bl-sm'
                            : 'bg-white/5 border border-white/10 text-white rounded-bl-sm'
                        }`}
                      >
                        {msg.sender === 'ai' && (
                          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10 text-[10px] text-cyan-400 font-bold">
                            <span className="flex items-center gap-1.5">
                              {msg.isReprimand ? (
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                              )}
                              <span>{msg.isReprimand ? (ar ? 'تنبيه أمني للصلاحيات' : 'Role Security') : 'Darwin AI'}</span>
                              {msg.modelBadge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-normal border border-cyan-500/30 font-mono">
                                  {msg.modelBadge}
                                </span>
                              )}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => speakText(msg.text)}
                                className="p-1 hover:text-white text-white/50 transition-colors"
                                title={ar ? 'استمع للشرح بالصوت' : 'Read aloud'}
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(msg.text, msg.id)}
                                className="p-1 hover:text-white text-white/50 transition-colors"
                                title={ar ? 'نسخ الشرح' : 'Copy'}
                              >
                                {copiedId === msg.id ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {renderFormatted(msg.text)}

                        {/* Suggestions Chips */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                            {msg.suggestions.map((sug) => (
                              <button
                                key={sug}
                                type="button"
                                onClick={() => handleProcessQuery(sug)}
                                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] text-cyan-300 hover:text-white transition-colors"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isThinking && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-cyan-400 text-[11px] w-fit">
                      <BrainCircuit className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>{ar ? 'داروين يحلل استفسارك العلمي...' : 'Darwin is synthesizing response...'}</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-black/40 border-t border-white/10 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (inputText.trim()) handleProcessQuery(inputText);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        isMicListening
                          ? ar
                            ? 'جارٍ الاستماع لصوتك بالميكروفون...'
                            : 'Listening to your microphone...'
                          : ar
                          ? `اسأل داروين أي سؤال في ${labContext.ar}...`
                          : `Ask Darwin about ${labContext.en}...`
                      }
                      className="flex-1 h-10 px-3.5 rounded-xl bg-white/5 border border-white/15 focus:border-cyan-400 text-[12px] text-white placeholder:text-white/40 outline-none transition-colors"
                    />

                    <button
                      type="button"
                      onClick={toggleInputMic}
                      className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all ${
                        isMicListening
                          ? 'bg-rose-500/30 border-rose-500 text-rose-300 animate-pulse'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                      title={isMicListening ? (ar ? 'إيقاف الاستماع' : 'Stop mic') : (ar ? 'تحدث بالميكروفون' : 'Dictate')}
                    >
                      {isMicListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-[12px] flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <Send className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                      <span className="hidden sm:inline">{ar ? 'إرسال' : 'Send'}</span>
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* ── MODE 2: LIVE VOICE CALL ── */}
            {activeTabMode === 'call' && (
              <div className="flex-1 flex flex-col p-6 items-center justify-center text-center bg-gradient-to-b from-[#050711] via-[#04060f] to-black relative overflow-y-auto">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                    <span>{isCallActive ? (ar ? 'المكالمة متصلة الآن' : 'Call Connected') : (ar ? 'جاهز للمكالمة الصوتية' : 'Ready to Call')}</span>
                  </span>
                </div>

                {/* Animated Pulsing Voice Orb */}
                <div className="relative my-6 flex items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-700 ${
                      callStatus === 'listening'
                        ? 'w-48 h-48 -inset-6 bg-cyan-500/20 animate-ping'
                        : callStatus === 'speaking'
                        ? 'w-48 h-48 -inset-6 bg-teal-500/25 animate-pulse'
                        : 'w-36 h-36 bg-cyan-500/5'
                    }`}
                  />
                  <div
                    className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center border transition-all duration-300 shadow-2xl ${
                      isCallActive
                        ? 'bg-gradient-to-br from-cyan-950 via-[#0a1628] to-indigo-950 border-cyan-400/50 shadow-cyan-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <Waves
                      className={`w-12 h-12 transition-transform duration-300 ${
                        isCallActive ? 'text-cyan-400 scale-110 animate-pulse' : 'text-white/40'
                      }`}
                    />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 mt-2">
                      {callStatus === 'listening'
                        ? ar
                          ? 'أستمع إليك...'
                          : 'Listening...'
                        : callStatus === 'thinking'
                        ? ar
                          ? 'داروين يفكر...'
                          : 'Thinking...'
                        : callStatus === 'speaking'
                        ? ar
                          ? 'داروين يتحدث...'
                          : 'Speaking...'
                        : ar
                        ? 'داروين في الانتظار'
                        : 'Standby'}
                    </span>
                  </div>
                </div>

                {/* Call Transcript Display */}
                {callTranscript && (
                  <div className="max-w-[85%] px-4 py-2.5 mb-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-[12px] animate-in fade-in">
                    <span className="text-white/50 text-[10px] block mb-0.5">{ar ? 'سمعت منك:' : 'Heard:'}</span>
                    <p className="font-medium">"{callTranscript}"</p>
                  </div>
                )}

                {/* Call Control Button */}
                <div className="flex items-center gap-3 my-3">
                  {!isCallActive ? (
                    <button
                      type="button"
                      onClick={startVoiceCall}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-[13px] flex items-center gap-2 shadow-xl shadow-emerald-500/25 transition-transform hover:scale-105"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{ar ? 'بدء المكالمة الصوتية مع داروين' : 'Start Voice Call with Darwin'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={endVoiceCall}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-[13px] flex items-center gap-2 shadow-xl shadow-rose-500/30 transition-transform hover:scale-105"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>{ar ? 'إنهاء المكالمة الصوتية' : 'End Call'}</span>
                    </button>
                  )}
                </div>

                {/* Navigation Quick Chips */}
                <div className="mt-4 pt-3 border-t border-white/10 w-full max-w-[480px]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-white/50 mb-2">
                    {ar ? 'أوامر تنقل واستكشاف صوتية:' : 'Try saying or clicking:'}
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {[
                      { label: '🧪 معمل الكيمياء', cmd: 'انقلني لمعمل الكيمياء' },
                      { label: '🫀 أطلس التشريح 3D', cmd: 'انقلني لأطلس التشريح' },
                      { label: '⚡ معمل الفيزياء', cmd: 'انقلني لمعمل الفيزياء' },
                      { label: '🔬 اشرح قانون أوم', cmd: 'اشرح قانون أوم بالتفصيل' },
                      { label: '🪐 مرصد الفلك', cmd: 'انقلني للفلك' },
                    ].map((chip) => (
                      <button
                        key={chip.cmd}
                        type="button"
                        onClick={() => handleProcessQuery(chip.cmd)}
                        className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white text-[11px] transition-colors"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── MODE 3: OFFICIAL FISH AUDIO AGENT ── */}
            {activeTabMode === 'fish' && (
              <div className="flex-1 flex flex-col p-4 bg-gradient-to-b from-[#050813] via-[#04060f] to-black relative overflow-y-auto">
                <div className="p-3.5 mb-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-white">
                        {ar ? 'وكيل داروين الصوتي الرسمي (Fish Audio Voice Engine)' : 'Official Fish Audio Darwin Agent'}
                      </span>
                      <span className="text-[10px] text-white/60">
                        {ar ? 'المودل الصوتي الحقيقي المعتمد · شات وكول مباشر' : 'Real-time official voice model · Live chat & call'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    929A1BF3
                  </span>
                </div>

                {/* Direct Trigger to expand widget */}
                <div className="mb-3 flex justify-center">
                  <button
                    type="button"
                    onClick={triggerFishAgentExpand}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-teal-500/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer animate-pulse"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{ar ? 'افتح شاشة المكالمة والشات الرسمية مع داروين 🎙️' : 'Open Official Darwin Voice Call & Chat'}</span>
                  </button>
                </div>

                {/* Container hosting the actual <fish-agent> custom element */}
                <div
                  ref={fishWidgetContainerRef}
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-950/90 overflow-hidden flex flex-col items-center justify-center p-3 min-h-[360px] relative shadow-2xl"
                  dangerouslySetInnerHTML={{
                    __html: `<fish-agent agent-id="929a1bf391db4185b03ae62f05a49207" language="${ar ? 'ar' : 'en'}" text-input="true" transcript="true" agent-name="${ar ? 'داروين • مرشد العلوم' : 'Darwin AI'}" greeting="${
                      ar
                        ? `أهلاً بك يا ${user?.name || 'عبد الرحمن'}! أنا داروين مرشدك العلمي في منصة SciNexa، جاهز لمساعدتك في كل المعامل وفحص التجارب معك.`
                        : `Welcome, ${user?.name || 'Student'}! I am Darwin, your science guide in SciNexa. Ready to assist across all labs.`
                    }"></fish-agent>`
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SciNexaAIModal;
