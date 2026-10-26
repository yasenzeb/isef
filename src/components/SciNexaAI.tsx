import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { EGYPT_GOVERNORATES } from '../data/egyptLocationData';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  Lightbulb,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
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
  Bot
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  suggestions?: string[];
  modelBadge?: string;
}

interface SciNexaAIProps {
  currentTab: string;
}

// Blocklist for content moderation in educational STEM context
const SENSITIVE_KEYWORDS = [
  'فرج', 'جنس', 'مهبل', 'بظر', 'قضيب', 'اباحي', 'إباحي', 'نيك', 'شذوذ', 'عري',
  'porn', 'sex', 'cunnilingus', 'vagina', 'penis', 'erotic'
];

function isSafeQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return !SENSITIVE_KEYWORDS.some(k => lower.includes(k));
}

// Scientific Speech Normalization Dictionary
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
  ['STEM', 'العلوم والتكنولوجيا والهندسة والرياضيات'],
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

function cleanTextForSpeech(text: string): string {
  let cleaned = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[`~_]/g, '')
    .replace(/->|→/g, ' ينتج ')
    .replace(/\+/g, ' زائد ')
    .replace(/×/g, ' مضروباً في ')
    .replace(/=/g, ' يساوي ');

  const sorted = [...SCIENTIFIC_SPEECH_MAP_AR].sort((a, b) => b[0].length - a[0].length);
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

// Lab Metadata
const LAB_CONTEXTS: Record<string, { ar: string; en: string; descriptionAr: string; defaultPromptsAr: string[] }> = {
  home: {
    ar: 'المنصة العلمية العامة',
    en: 'SciNexa General Science Matrix',
    descriptionAr: 'منظومة محاكاة العلوم المعتمدة للمختبرات الافتراضية التفاعلية (تشريح، فيزياء، كيمياء، أحياء، جيولوجيا، فلك).',
    defaultPromptsAr: [
      'ما هي أهداف ورؤية منظومة SciNexa في تطوير التعليم التجريبي؟',
      'كيف تساهم المعامل الافتراضية في حل عجز التجهيزات المخبرية؟',
      'اقترح علي تجربة علمية شيقة أبدأ بها اليوم!'
    ]
  },
  anatomy: {
    ar: 'أطلس التشريح الطبي البشري ثلاثي الأبعاد',
    en: '3D Human Medical Anatomy Atlas',
    descriptionAr: 'فحص عظام الهيكل العظمي البالغ (210 عظمة) والأجهزة الحيوية السبعة مع إمكانية فحص وعزل أي عضو 3D.',
    defaultPromptsAr: [
      'كم عدد عظام جسم الإنسان البالغ وما أقواها وأطولها؟',
      'كيف يتناسق عمل العضلات الباسطة والقابضة في حركة الذراع؟',
      'ما هي الوظيفة الحيوية لحماية المخ عبر عظام الجمجمة؟'
    ]
  },
  physics: {
    ar: 'مختبر الفيزياء والدوائر الكهربائية والموجات',
    en: 'Physics, DC Circuits & Wave Lab',
    descriptionAr: 'محاكاة دوائر التيار المستمر، قوانين أوم، التوصيل على التوالي والتوازي، وحسابات سرعة الموجات.',
    defaultPromptsAr: [
      'كيف أطبق قانون أوم لحساب شدة التيار وفرق الجهد والمقاومة؟',
      'ما الفرق بين التوصيل على التوالي والتوازي في شدة الإضاءة؟',
      'ماذا يحدث فيزيائياً عند حدوث قصر بالدائرة (Short Circuit)؟'
    ]
  },
  chemistry: {
    ar: 'مختبر الكيمياء والجدول الدوري (PraxiLabs)',
    en: 'Chemistry & Reaction Simulator',
    descriptionAr: 'دمج عناصر الجدول الدوري الـ 118، محاكاة تفاعلات الأكسدة والاختزال، والطاقة المنطلقة والماصة.',
    defaultPromptsAr: [
      'ماذا يحدث عند دمج الصوديوم مع غاز الكلور وما نوع الرابطة الناتجة؟',
      'كيف أفرق بين التفاعل الطارد والتفاعل الماص للحرارة عملياً؟',
      'لماذا يحترق شريط الماغنسيوم في الأكسجين بلهب أبيض مبهر؟'
    ]
  },
  biology: {
    ar: 'مختبر الأحياء والخلية والكائنات الدقيقة',
    en: 'Biology, Cytology & Protozoa Lab',
    descriptionAr: 'فحص الخلية النباتية والحيوانية، تركيب جزيء DNA، ودراسة حركة كائنات المستنقعات (أميبا، يوجلينا، براميسيوم).',
    defaultPromptsAr: [
      'ما هي الميتوكوندريا ولماذا تسمى مصنع الطاقة الخلوية ATP؟',
      'ما الفروق التركيبية الأساسية بين الخلية النباتية والخلية الحيوانية؟',
      'كيف تتحرك الأميبا واليوجلينا والبراميسيوم تحت الميكروسكوب؟'
    ]
  },
  geology: {
    ar: 'مختبر علوم الأرض والزلازل',
    en: 'Geology & Seismic Resonance Lab',
    descriptionAr: 'محاكاة طبقات الأرض الأربعة، موجات الزلازل، ظاهرة الرنين الميكانيكي، ومقياس ريختر.',
    defaultPromptsAr: [
      'ما هي طبقات الأرض الأربعة من السطح إلى اللب الداخلي؟',
      'كيف تسبب ظاهرة الرنين انهيار الأبراج والمباني أثناء الزلازل؟',
      'ما الفرق بين مقياس ريختر ومقياس ميركالي في قياس الزلازل؟'
    ]
  },
  astronomy: {
    ar: 'مختبر علوم الفلك والنظام الشمسي',
    en: 'Astronomy & Solar Mechanics Lab',
    descriptionAr: 'محاكاة كواكب المجموعة الشمسية الثمانية، مدارات كبلر، أطوار القمر، وظواهر الكسوف والخسوف.',
    defaultPromptsAr: [
      'ما هو أكبر كوكب في مجموعتنا الشمسية وما خصائص كوكب المشتري؟',
      'لماذا تتغير أطوار القمر الظاهرية خلال الشهر القمري؟',
      'كيف تحدث ظاهرة كسوف الشمس وخسوف القمر فلكياً؟'
    ]
  }
};

// Safe Clean Formatter
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-emerald-300 text-xs mt-2 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {trimmed.slice(4)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-black text-emerald-200 text-sm mt-2.5 mb-1 border-b border-white/10 pb-0.5">
              {trimmed.slice(3)}
            </h3>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pr-2">
              <span className="text-emerald-400 mt-1 shrink-0 text-[10px]">•</span>
              <span dangerouslySetInnerHTML={{ __html: renderInlineFormatting(trimmed.slice(2)) }} />
            </div>
          );
        }

        return (
          <p key={idx} dangerouslySetInnerHTML={{ __html: renderInlineFormatting(line) }} />
        );
      })}
    </div>
  );
};

function renderInlineFormatting(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-200 font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-amber-200">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-[11px]">$1</code>');
}

export const SciNexaAI: React.FC<SciNexaAIProps> = ({ currentTab }) => {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const ar = language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Unified Voice Call & Mode State
  const [activeTabMode, setActiveTabMode] = useState<'chat' | 'call' | 'darwin'>('chat');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isMicListening, setIsMicListening] = useState(false);
  const [callTranscript, setCallTranscript] = useState('');
  const isCallActiveRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueIndexRef = useRef<number>(0);
  const audioQueueChunksRef = useRef<string[]>([]);
  const audioSessionIdRef = useRef<number>(0);

  const labContext = LAB_CONTEXTS[currentTab] || LAB_CONTEXTS.home;

  // Load Fish Audio widget script dynamically if Darwin Agent tab is selected
  useEffect(() => {
    if (activeTabMode === 'darwin') {
      const existing = document.querySelector('script[src*="agent-widget-embed"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@fishaudio/agent-widget-embed';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [activeTabMode]);

  // Purge any contaminated historical storage on mount
  useEffect(() => {
    try {
      localStorage.removeItem('scinexa_ai_messages');
      localStorage.removeItem('scinexa_chat_history');
    } catch {}
  }, []);

  // Initialize fresh clean message per lab
  useEffect(() => {
    const welcomeText = ar
      ? `أهلاً بك يا بطل! أنا "SciNexa AI" باحث ومعلم العلوم الذكي المعتمد في منصة ساينكسا.\n\nأنت الآن في **${labContext.ar}**.\n${labContext.descriptionAr}\n\nاسألني عن أي تجربة أو قانون علمي، وسأقوم بتحليله وشرحه لك بدقة علمية وبالصوت الفصيح!`
      : `Welcome champion! I am "SciNexa AI", your interactive science mentor in SciNexa.\n\nYou are in **${labContext.en}**.\nAsk me any scientific concept or experiment!`;

    const initialMsg: Message = {
      id: 'welcome-' + currentTab + '-' + Date.now(),
      sender: 'ai',
      text: welcomeText,
      timestamp: Date.now(),
      suggestions: labContext.defaultPromptsAr,
      modelBadge: 'Gemini 1.5'
    };

    setMessages([initialMsg]);

    if (isOpen && isVoiceEnabled) {
      speak(welcomeText);
    }
  }, [currentTab, language]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Speech engine stop
  const stopSpeaking = () => {
    audioSessionIdRef.current += 1;
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
  };

  // Play next chunk in audio queue with Fish Audio / Neural TTS support
  const playNextAudioChunk = () => {
    const chunks = audioQueueChunksRef.current;
    const index = audioQueueIndexRef.current;
    const sessionId = audioSessionIdRef.current;

    if (index >= chunks.length) {
      setIsSpeaking(false);
      currentAudioRef.current = null;
      if (isCallActiveRef.current) {
        setCallStatus('listening');
        startCallListening();
      }
      return;
    }

    const chunk = chunks[index];

    const playAudioSrc = (src: string, isBlobUrl = false) => {
      if (audioSessionIdRef.current !== sessionId) {
        if (isBlobUrl) URL.revokeObjectURL(src);
        return;
      }
      const audio = new Audio(src);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        if (audioSessionIdRef.current === sessionId) {
          setIsSpeaking(true);
          if (isCallActiveRef.current) {
            setCallStatus('speaking');
          }
        }
      };

      const advance = () => {
        if (isBlobUrl) URL.revokeObjectURL(src);
        if (audioSessionIdRef.current === sessionId) {
          audioQueueIndexRef.current += 1;
          playNextAudioChunk();
        }
      };

      audio.onended = advance;
      audio.onerror = advance;
      audio.play().catch(advance);
    };

    // First attempt: call serverless /api/tts (uses Fish Audio ultra-realistic voice or server neural fallback)
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: chunk })
    })
      .then(async (res) => {
        if (audioSessionIdRef.current !== sessionId) return;
        if (!res.ok) throw new Error('TTS response not ok');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        playAudioSrc(blobUrl, true);
      })
      .catch(() => {
        // Direct browser fallback if /api/tts is unavailable
        if (audioSessionIdRef.current !== sessionId) return;
        const encoded = encodeURIComponent(chunk);
        const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ar&client=tw-ob`;
        playAudioSrc(fallbackUrl, false);
      });
  };

  // Text-To-Speech Synthesis
  const speak = (rawText: string) => {
    if (!isVoiceEnabled && !isCallActiveRef.current) return;
    stopSpeaking();

    const cleanedText = cleanTextForSpeech(rawText);
    // Use cohesive paragraph chunks (450 chars) so the entire answer speaks in one uniform voice
    const chunks = chunkTextForTTS(cleanedText, 450);
    if (chunks.length > 0) {
      audioQueueChunksRef.current = chunks;
      audioQueueIndexRef.current = 0;
      playNextAudioChunk();
    }
  };

  // Speech Recognition (Web Speech API)
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

  // Toggle Dictation Mic for Text Input
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
      alert(ar ? 'خاصية الميكروفون والتعرف الصوتي غير مدعومة في متصفحك. يرجى تجربة Google Chrome أو Microsoft Edge.' : 'Speech recognition is not supported in your browser.');
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

    recognition.onerror = () => {
      setIsMicListening(false);
    };

    recognition.onend = () => {
      setIsMicListening(false);
    };

    try {
      recognition.start();
    } catch {
      setIsMicListening(false);
    }
  };

  // Start Call Mode Listening Loop
  const startCallListening = () => {
    if (!isCallActiveRef.current) return;
    const recognition = getSpeechRecognition();
    if (!recognition) {
      setCallStatus('idle');
      return;
    }

    setCallStatus('listening');
    setCallTranscript('');
    recognitionRef.current = recognition;

    let finalTranscript = '';

    recognition.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setCallTranscript(finalTranscript || interim);
    };

    recognition.onend = async () => {
      if (!isCallActiveRef.current) return;
      const spokenText = finalTranscript.trim();
      if (spokenText) {
        setCallStatus('thinking');
        await handleCallConversation(spokenText);
      } else {
        // Restart listening if call remains active
        setTimeout(() => {
          if (isCallActiveRef.current && callStatus !== 'speaking') {
            startCallListening();
          }
        }, 800);
      }
    };

    recognition.onerror = (err: any) => {
      console.warn('Call recognition error:', err);
      if (isCallActiveRef.current && callStatus !== 'speaking') {
        setTimeout(() => startCallListening(), 1000);
      }
    };

    try {
      recognition.start();
    } catch {}
  };

  // Start Voice Call
  const startVoiceCall = () => {
    stopSpeaking();
    setIsCallActive(true);
    isCallActiveRef.current = true;
    setActiveTabMode('call');
    setCallStatus('listening');
    setCallTranscript('');
    startCallListening();
  };

  // End Voice Call
  const endVoiceCall = () => {
    stopSpeaking();
    setIsCallActive(false);
    isCallActiveRef.current = false;
    setCallStatus('idle');
    setCallTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
  };

  // Handle Voice Call Speech & Auto-Response
  const handleCallConversation = async (spokenText: string) => {
    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: spokenText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    const result = await queryAI(spokenText);

    const aiMsg: Message = {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: result.text,
      timestamp: Date.now(),
      modelBadge: result.modelBadge
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);

    // Speak AI response with voice engine
    speak(result.text);
  };

  // Copy message text
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear chat
  const handleClearChat = () => {
    stopSpeaking();
    const initialMsg: Message = {
      id: 'fresh-' + Date.now(),
      sender: 'ai',
      text: ar
        ? `بدأنا جلسة علمية جديدة في **${labContext.ar}**! ما هو السؤال العلمي أو التجربة التي تود مناقشتها الآن؟`
        : `Started a fresh session in **${labContext.en}**! What concept would you like to explore?`,
      timestamp: Date.now(),
      suggestions: labContext.defaultPromptsAr,
      modelBadge: 'Gemini 1.5'
    };
    setMessages([initialMsg]);
  };

  // Live Query Dispatcher (Gemini Serverless API -> Direct Gemini -> STEM Science Engine)
  const queryAI = async (userPrompt: string): Promise<{ text: string; modelBadge: string }> => {
    // 0. Strict Ethical & Educational Moderation Gate
    if (!isSafeQuery(userPrompt)) {
      return {
        text: `أنا "SciNexa AI"، مساعد علمي وتعليمي مخصص للمناهج العلمية والمختبرات الافتراضية المتقدمة (الفيزياء، الكيمياء، أطلس التشريح الطبي للأعضاء والعظام، الأحياء، علوم الأرض والفلك).\n\nيرجى طرح استفسار علمي يتعلق بالتجارب والظواهر المعملية.`,
        modelBadge: 'Safety Gate'
      };
    }

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    const openAIKey = import.meta.env.VITE_OPENAI_API_KEY as string;

    const systemPrompt = `أنت "SciNexa AI"، العقل المفكر والمعلم العلمي والباحث الذكي التفاعلي لمنظومة SciNexa للمختبرات الافتراضية العلمية.
أنت لست روبوتاً تقليدياً ولا تستخدم إجابات معلبة أو نصوصاً مسبقة. لديك استيعاب كامل وتفصيلي لكل معامل وأدوات وتجارب المنصة:

المعمل النشط الآن أمام الطالب: "${labContext.ar}".
تجهيزات وتفاصيل هذا المعمل: ${labContext.descriptionAr}.

خريطة المنصة الشاملة وصلاحياتك المعرفية:
1. أطلس التشريح الطبي 3D: 210 عظمة، والفك السفلي المتحرك، والفقرات الـ 33، وعظم الفخذ الأطول والأقوى، و7 أجهزة حيوية. أدوات الفحص: عزل العضو 3D، الدوران الحر، الشفافية.
2. مختبر الفيزياء: دوائر DC، بطاريات، مقاومات، مصابيح، أجهزة قياس، قانون أوم V = I × R، التوالي والتوازي، قصر الدائرة، سرعة الموجة على الوتر v = √(T/μ)، وانكسار الضوء وقانون سنيل.
3. مختبر الكيمياء (PraxiLabs): 118 عنصراً، دورق تفاعل لدمج العناصر، نواتج تفاعل فورية ومعادلات موزونة، وحساب الطاقة الطاردة والماصة ΔH.
4. مختبر الأحياء: الخلية النباتية والحيوانية، الميتوكوندريا وتوليد ATP، لولب DNA المزدوج، وكائنات المستنقعات (أميبا، يوجلينا، براميسيوم).
5. مختبر الجيولوجيا: طبقات الأرض الـ 4، موجات الزلازل P و S، وظاهرة الرنين الميكانيكي وانهيار المباني عند تطابق التردد.
6. مختبر الفلك: كواكب المجموعة الشمسية الثمانية، قوانين كبلر، أطوار القمر، وكسوف الشمس وخسوف القمر.

طريقة إجابتك:
1. حلل سؤال الطالب بمنطق وعمق علمي حقيقي دون سرد إجابات مجهزة؛ تصرف كمعلم نابغة ومرشد بحثي.
2. اربط إجابتك بأدوات المعمل المتاحة للطالب حالياً؛ وجهه خطوة بخطوة لما يمكنه تجربته وفحصه بنفسه على الشاشة.
3. استخدم اللغة العربية الفصيحة الواضحة، ونسق إجابتك بنقاط وعناوين موجزة (###).
4. اختم بتحدٍ علمي أو سؤال ذكي يدفع الطالب للتفكير والاكتشاف المستقل.`;

    // 1. Vercel Serverless Function /api/chat (Reads GEMINI_API_KEY from Vercel)
    try {
      const savedGovId = localStorage.getItem('scinexa_gov_id') || '';
      const savedAdminId = localStorage.getItem('scinexa_admin_id') || '';
      const activeGov = EGYPT_GOVERNORATES.find(g => g.id === savedGovId);
      const activeAdmin = activeGov?.administrations.find(a => a.id === savedAdminId);

      const govName = activeGov?.nameAr || user?.governorateAr || '';
      const adminName = activeAdmin?.nameAr || user?.administrationAr || '';

      const userProfile = user ? {
        name: user.displayName,
        role: user.role,
        governorate: govName,
        administration: adminName,
        grade: user.grade,
        stage: user.stage,
        code: user.studentCode,
        isGuest: user.isGuest,
      } : null;

      const serverRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat([{ id: 'temp', sender: 'user', text: userPrompt, timestamp: Date.now() }]),
          currentLab: currentTab,
          labName: labContext.ar,
          language: language,
          userProfile
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (serverRes.ok) {
        const contentType = serverRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await serverRes.json();
          if (data.reply && data.reply.trim()) {
            return {
              text: data.reply.trim(),
              modelBadge: data.model === 'gemini-1.5-flash' ? 'Gemini 1.5' : data.model === 'gpt-4o-mini' ? 'GPT-4o' : 'SciNexa AI'
            };
          }
        }
      }
    } catch {
      // Fall through to client direct query
    }

    // 2. Direct Gemini Live API via Client Key (VITE_GEMINI_API_KEY)
    if (geminiKey && geminiKey.trim()) {
      try {
        const contents: any[] = [];
        let hasUser = false;
        for (const m of messages.slice(-6)) {
          if (!hasUser && m.sender !== 'user') continue;
          hasUser = true;
          const role = m.sender === 'user' ? 'user' : 'model';
          const text = (m.text || '').trim();
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += '\n' + text;
          } else {
            contents.push({ role, parts: [{ text }] });
          }
        }
        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts[0].text = userPrompt;
        } else {
          contents.push({ role: 'user', parts: [{ text: userPrompt }] });
        }

        const candidateModels = [
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-2.5-pro',
          'gemini-1.5-flash-latest',
          'gemini-pro'
        ];

        for (const model of candidateModels) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey.trim()}`;

            const res = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: contents,
                safetySettings: [
                  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
                  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
                  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
                  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1200
                }
              }),
              signal: AbortSignal.timeout(8000)
            });

            if (res.ok) {
              const data = await res.json();
              const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (reply) {
                return {
                  text: reply.trim(),
                  modelBadge: model
                };
              }
            }
          } catch {
            // Try next candidate model
          }
        }
      } catch (e: any) {
        console.warn('[SciNexa AI] Gemini fallback error:', e?.message);
      }
    }

    // 3. Fallback when keys are missing or serverless unreachable
    return {
      text: `⚠️ لم يتمكن الشات من الاتصال بـ Google Gemini API.\n\nيرجى التأكد من إضافة **GEMINI_API_KEY** في إعدادات Vercel Environment Variables وعمل Redeploy حتى يعمل الذكاء الاصطناعي الحي مباشرة!`,
      modelBadge: 'Setup Required'
    };
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

    const result = await queryAI(query);

    const aiMsg: Message = {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: result.text,
      timestamp: Date.now(),
      modelBadge: result.modelBadge,
      suggestions: [
        'اشرح لي هذا المبدأ بمثال تطبيقي أكثر',
        'كيف أصمم تجربة لاختبار هذه النظرية عملياً؟'
      ]
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);

    if (isVoiceEnabled) {
      speak(result.text);
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
                المعلم والباحث الذكي
              </span>
              <span className="block text-sm font-black tracking-wide">
                SciNexa AI 💡
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Main AI Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 w-[95vw] sm:w-[480px] rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/40 bg-[#070b14]/98 backdrop-blur-2xl transition-all duration-300 flex flex-col ${
            isMinimized ? 'h-16' : 'h-[640px] max-h-[92vh]'
          }`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-950/60 via-teal-950/50 to-indigo-950/60 border-b border-white/10 flex items-center justify-between">
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
                    SciNexa AI Scholar
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Gemini Live
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block -mt-0.5 truncate max-w-[210px]">
                  {labContext.ar}
                </span>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              {/* Stop Speaking */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-colors animate-pulse cursor-pointer"
                  title="إيقاف الصوت"
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
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  isVoiceEnabled
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
                title={isVoiceEnabled ? 'كتم الصوت التلقائي' : 'تفعيل الصوت التلقائي'}
              >
                {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Start Fresh Chat */}
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="بدء جلسة علمية جديدة"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Minimize/Restore */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  stopSpeaking();
                  if (isCallActive) endVoiceCall();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Header Mode Switcher */}
          {!isMinimized && (
            <div className="px-3 py-1.5 bg-[#040711] border-b border-white/10 flex items-center justify-between gap-1 text-[11px]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTabMode('chat')}
                  className={`px-3.5 py-1 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                    activeTabMode === 'chat'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>الشات العلمي 3D</span>
                </button>

                <button
                  onClick={() => {
                    stopSpeaking();
                    setActiveTabMode('darwin');
                  }}
                  className={`px-3.5 py-1 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                    activeTabMode === 'darwin'
                      ? 'bg-gradient-to-r from-indigo-500/30 to-teal-500/30 text-teal-200 border border-teal-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <span>مكالمة وكيل داروين الصوتي 🎙️</span>
                </button>
              </div>

              {activeTabMode === 'chat' && (
                <button
                  onClick={() => {
                    stopSpeaking();
                    setActiveTabMode('darwin');
                  }}
                  className="px-2.5 py-1 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-[10px] flex items-center gap-1 transition-all cursor-pointer font-bold"
                  title="بدء مكالمة صوتية مع داروين"
                >
                  <Phone className="w-3 h-3 text-teal-400" />
                  <span>اتصل بداروين</span>
                </button>
              )}
            </div>
          )}

          {/* Modal Content */}
          {!isMinimized && (
            <>
              {/* 1. CHAT MODE */}
              {activeTabMode === 'chat' && (
                <>
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/40">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed transition-all shadow-md ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white rounded-br-sm shadow-emerald-900/30'
                              : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-bl-sm shadow-black/50'
                          }`}
                        >
                          {msg.sender === 'ai' && (
                            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10 text-[10px] text-emerald-400 font-bold">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                SciNexa AI
                                {msg.modelBadge && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-normal border border-emerald-500/30">
                                    {msg.modelBadge}
                                  </span>
                                )}
                              </span>

                              <div className="flex items-center gap-1">
                                {/* Copy button */}
                                <button
                                  onClick={() => handleCopy(msg.text, msg.id)}
                                  className="p-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
                                  title="نسخ الشرح"
                                >
                                  {copiedId === msg.id ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {/* Speak button */}
                                <button
                                  onClick={() => speak(msg.text)}
                                  className="p-1 hover:text-white text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
                                  title="استمع للنطق الصوتي الفصيح"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Render formatted message content */}
                          {msg.sender === 'ai' ? (
                            <MarkdownContent content={msg.text} />
                          ) : (
                            <p className="whitespace-pre-line font-medium">{msg.text}</p>
                          )}
                        </div>

                        {/* Suggestions Pills */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
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
                      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 max-w-[280px] text-xs text-emerald-400 animate-pulse">
                        <BrainCircuit className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                        <span className="font-mono text-[11px]">
                          جاري التفكير والتحليل العلمي عبر AI...
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
                        placeholder={`اسأل SciNexa AI أي سؤال علمي في ${labContext.ar}...`}
                        className="flex-1 bg-slate-950/80 border border-white/15 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />

                      {/* Microphone Dictation Button */}
                      <button
                        type="button"
                        onClick={toggleInputMic}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isMicListening
                            ? 'bg-rose-500/30 border-rose-500 text-rose-300 animate-pulse'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={isMicListening ? 'إيقاف الاستماع' : 'تحدث بصوتك بالميكروفون'}
                      >
                        {isMicListening ? (
                          <MicOff className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </button>

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

              {/* 2. DARWIN VOICE AGENT MODE */}
              {activeTabMode === 'darwin' && (
                <div className="flex-1 flex flex-col p-4 bg-gradient-to-b from-[#050813] via-[#04060f] to-black relative overflow-y-auto">
                  <div className="p-3 mb-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold block text-white">وكيل داروين الصوتي المباشر (Darwin Voice Agent)</span>
                        <span className="text-[10px] text-slate-400">تقنية المكالمة الصوتية الفورية من Fish Audio</span>
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      Live Call
                    </span>
                  </div>

                  {/* Quick Connect Trigger Button */}
                  <div className="mb-3 flex justify-center">
                    <button
                      onClick={() => {
                        try {
                          document.dispatchEvent(new CustomEvent('fish-agent:expand'));
                        } catch {}
                      }}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-teal-500/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer animate-pulse"
                    >
                      <Phone className="w-4 h-4" />
                      <span>افتح شاشة المكالمة الصوتية مع داروين 🎙️</span>
                    </button>
                  </div>

                  <div
                    className="flex-1 rounded-2xl border border-white/10 bg-slate-950/90 overflow-hidden flex flex-col items-center justify-center p-3 min-h-[400px] relative shadow-2xl"
                    dangerouslySetInnerHTML={{
                      __html: '<fish-agent agent-id="97720634298f4e94bdec0811de4cb3f3"></fish-agent>'
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
