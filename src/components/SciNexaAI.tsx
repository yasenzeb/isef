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
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  suggestions?: string[];
  source?: 'gemini_official' | 'openai_official' | 'openai_gpt' | 'local_lab' | 'open_science';
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
}

const PERSONAS: Persona[] = [
  {
    id: 'scinexa',
    nameAr: 'SciNexa AI (Gemini / GPT)',
    nameEn: 'SciNexa AI (Gemini / GPT)',
    titleAr: 'باحث ومعلم آيسف الذكي التفاعلي',
    titleEn: 'ISEF Interactive Science Scholar'
  },
  {
    id: 'professor',
    nameAr: 'البروفيسور الذكي',
    nameEn: 'Prof. SciNexa',
    titleAr: 'المشرف الأكاديمي الافتراضي',
    titleEn: 'Virtual Academic Mentor'
  },
  {
    id: 'tutor',
    nameAr: 'المعلم الافتراضي',
    nameEn: 'Virtual Tutor',
    titleAr: 'مبسط العلوم والتجارب الحية',
    titleEn: 'Interactive Science Tutor'
  },
  {
    id: 'copilot',
    nameAr: 'المساعد المخبري',
    nameEn: 'Lab Copilot',
    titleAr: 'مرشد المعامل والمحاكاة',
    titleEn: 'Virtual Lab Copilot'
  }
];

const OPENAI_VOICES = [
  { id: 'alloy', nameAr: 'Alloy (الصوت الرسمي لشات جي بي تي - متوازن)', nameEn: 'Alloy (Iconic Balanced Voice)' },
  { id: 'nova', nameAr: 'Nova (صوت نسائي مشرق وحيوي)', nameEn: 'Nova (Bright & Energetic Female)' },
  { id: 'echo', nameAr: 'Echo (صوت رجالي رخيم وهادئ)', nameEn: 'Echo (Warm & Resonant Male)' },
  { id: 'fable', nameAr: 'Fable (صوت تعبيري راقٍ)', nameEn: 'Fable (Expressive British/Global)' },
  { id: 'onyx', nameAr: 'Onyx (صوت رجالي عميق وقوي)', nameEn: 'Onyx (Deep Male Voice)' },
  { id: 'shimmer', nameAr: 'Shimmer (صوت نسائي دافئ)', nameEn: 'Shimmer (Warm Female Voice)' }
];

// Lab Names Context
const LAB_NAMES: Record<string, { ar: string; en: string }> = {
  home: { ar: 'المنصة العلمية العامة', en: 'SciNexa Matrix' },
  anatomy: { ar: 'أطلس التشريح الطبي 3D', en: '3D Human Anatomy Atlas' },
  physics: { ar: 'مختبر الفيزياء والدوائر والموجات', en: 'Physics & Circuit Lab' },
  chemistry: { ar: 'مختبر الكيمياء والتفاعلات (PraxiLabs)', en: 'Chemistry & Reaction Simulator' },
  biology: { ar: 'مختبر الأحياء والخلية والكائنات الدقيقة', en: 'Biology & Cell Lab' },
  geology: { ar: 'مختبر علوم الأرض والزلازل', en: 'Geology & Seismic Lab' },
  astronomy: { ar: 'مختبر علوم الفلك والنظام الشمسي', en: 'Astronomy & Solar System Lab' }
};

export const SciNexaAI: React.FC<SciNexaAIProps> = ({ currentTab }) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';

  // State
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(() => {
    return localStorage.getItem('scinexa_ai_persona') || 'scinexa';
  });
  const [customName, setCustomName] = useState<string>(() => {
    return localStorage.getItem('scinexa_ai_custom_name') || '';
  });

  // API Keys (Gemini & OpenAI)
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('scinexa_gemini_api_key') || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
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
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueIndexRef = useRef<number>(0);
  const audioQueueChunksRef = useRef<string[]>([]);
  const audioQueueLangRef = useRef<'ar' | 'en' | 'fr'>('ar');

  const currentLabName = LAB_NAMES[currentTab] || LAB_NAMES.home;
  const currentPersona = PERSONAS.find(p => p.id === selectedPersonaId) || PERSONAS[0];
  const activeDisplayName = customName.trim() || (ar ? currentPersona.nameAr : currentPersona.nameEn);

  // Persistence
  useEffect(() => {
    localStorage.setItem('scinexa_ai_persona', selectedPersonaId);
  }, [selectedPersonaId]);
  useEffect(() => {
    localStorage.setItem('scinexa_ai_custom_name', customName);
  }, [customName]);
  useEffect(() => {
    localStorage.setItem('scinexa_gemini_api_key', geminiApiKey);
  }, [geminiApiKey]);
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
    localStorage.setItem('scinexa_ai_speech_rate', String(speechRate));
  }, [speechRate]);

  // Initial welcome message upon lab change
  useEffect(() => {
    const welcomeText = ar
      ? `أهلاً بك يا بطل! أنا ${activeDisplayName}. أنا نموذج ذكاء اصطناعي تفاعلي حقيقي 100%، جاهز للإجابة بدقة وتحليل أي تجربة أو قانون علمي في ${currentLabName.ar}. اسألني أي سؤال يخطر ببالك وسأشرحه لك بالصوت والصورة!`
      : `Welcome champion! I am ${activeDisplayName}, a genuine interactive AI tutor ready to explain and analyze any scientific experiment or theory in ${currentLabName.en}. Ask me any question and I will answer with voice!`;

    const initialMsg: Message = {
      id: 'welcome-' + currentTab + '-' + Date.now(),
      sender: 'ai',
      text: welcomeText,
      timestamp: Date.now(),
      suggestions: ar
        ? [
            `كيف أبدأ تجربة تفاعلية في ${currentLabName.ar}؟`,
            'ما هي النظرية الفيزيائية أو الكيميائية الأساسية هنا؟',
            'اقترح علي سؤالاً ذكياً لأختبر معلوماتي!'
          ]
        : [
            `How do I run an experiment in ${currentLabName.en}?`,
            'What is the fundamental scientific principle here?',
            'Quiz me with a thought-provoking challenge!'
          ],
      source: geminiApiKey ? 'gemini_official' : openaiApiKey ? 'openai_official' : 'openai_gpt'
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

      if (!response.ok) return false;

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

  // Play next chunk in audio queue (Neural voiceover)
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
      // Fallback to next chunk or finish
      audioQueueIndexRef.current += 1;
      playNextAudioChunk();
    };

    audio.play().catch(() => {
      audioQueueIndexRef.current += 1;
      playNextAudioChunk();
    });
  };

  // Unified Text-To-Speech
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

    // If OpenAI key is active, use official OpenAI tts-1 voice
    const activeOpenAIKey = openaiApiKey.trim();
    if (activeOpenAIKey) {
      const ok = await speakViaOpenAI(cleanedText, activeOpenAIKey, openaiVoice);
      if (ok) return;
    }

    // Default Neural Stream Queue Player (Free & crystal-clear Arabic/English)
    const chunks = chunkTextForTTS(cleanedText, 140);
    if (chunks.length > 0) {
      audioQueueChunksRef.current = chunks;
      audioQueueIndexRef.current = 0;
      audioQueueLangRef.current = langCode;
      playNextAudioChunk();
    }
  };

  // Test Voice Button
  const handleTestVoice = async () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    setIsTestingVoice(true);
    const sample = ar
      ? `مرحباً بك في منصة ساينكسا! هذا هو الصوت التفاعلي المباشر للذكاء الاصطناعي.`
      : `Welcome to SciNexa platform! This is the live interactive AI voice.`;

    const activeOpenAIKey = openaiApiKey.trim();
    if (activeOpenAIKey) {
      const ok = await speakViaOpenAI(sample, activeOpenAIKey, openaiVoice);
      if (ok) {
        setIsTestingVoice(false);
        return;
      }
    }
    speak(sample);
    setIsTestingVoice(false);
  };

  // Live Real AI Query Handler (Gemini -> OpenAI -> Free Live LLM)
  const handleQuery = async (userQuery: string): Promise<{ answer: string; source: Message['source']; suggestions?: string[] }> => {
    const cleanQuery = userQuery.trim();
    const systemPrompt = `أنت "${activeDisplayName}"، معلم وباحث العلوم التفاعلي الذكي في منصة SciNexa لمسابقة ISEF الدولية للعلوم والهندسة.
المعمل الحالي الذي يتواجد فيه الطالب الآن هو: "${currentLabName.ar}".
مهمتك:
1. الإجابة بدقة علمية حقيقية وتفاعلية على أي سؤال يطرحه الطالب، وبأسلوب مبسط وممتع كمعلم حقيقي.
2. استخدام لغة السؤال (${ar ? 'اللغة العربية الفصيحة والواضحة' : 'English'}).
3. ربط الشرح بالتطبيق العملي في المعمل الافتراضي الحالي إن أمكن.
4. اقترح في النهاية سؤالاً لاحقاً أو تحدياً علمياً ممتعاً يحفز الطالب على التفكير.`;

    // 1. Priority A: Google Gemini 1.5 Flash / 2.0 Flash (Free 100% from Google AI Studio)
    const activeGeminiKey = geminiApiKey.trim();
    if (activeGeminiKey) {
      try {
        setAiStatusText(ar ? 'جاري التفكير والتوليد عبر Google Gemini...' : 'Thinking with Google Gemini...');

        // Build conversation history for genuine multi-turn chat
        const contents: any[] = [];
        const recentMessages = messages.slice(-6);
        for (const m of recentMessages) {
          if (m.sender === 'user') {
            contents.push({ role: 'user', parts: [{ text: m.text }] });
          } else if (m.sender === 'ai') {
            contents.push({ role: 'model', parts: [{ text: m.text }] });
          }
        }
        contents.push({ role: 'user', parts: [{ text: cleanQuery }] });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeGeminiKey}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 900
            }
          }),
          signal: AbortSignal.timeout(9000)
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return {
              answer: replyText.trim(),
              source: 'gemini_official',
              suggestions: [
                ar ? 'اشرح لي أكثر بالتفصيل وبأمثلة' : 'Explain in more depth with examples',
                ar ? 'كيف أطبق هذا بالتجربة في المعمل؟' : 'How can I test this in the lab?'
              ]
            };
          }
        }
      } catch {
        // Fall through to next engine
      }
    }

    // 2. Priority B: Official OpenAI Chat Completions (if key exists)
    const activeOpenAIKey = openaiApiKey.trim();
    if (activeOpenAIKey) {
      try {
        setAiStatusText(ar ? 'جاري التوليد عبر OpenAI GPT-4o...' : 'Generating via OpenAI GPT-4o...');
        const chatMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          { role: 'user', content: cleanQuery }
        ];

        const openAIRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeOpenAIKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: chatMessages,
            temperature: 0.7
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (openAIRes.ok) {
          const data = await openAIRes.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return {
              answer: replyText.trim(),
              source: 'openai_official',
              suggestions: [
                ar ? 'وضح لي كيف أقيس هذا عملياً؟' : 'How do I measure this experimentally?',
                ar ? 'اطرح علي تحدياً علمياً' : 'Give me a science challenge'
              ]
            };
          }
        }
      } catch {
        // Fall through
      }
    }

    // 3. Priority C: Free Serverless GPT-4 Live Model (Works out of the box with 0 keys!)
    try {
      setAiStatusText(ar ? 'جاري الاتصال بنموذج GPT-4 المباشر...' : 'Querying live GPT-4 engine...');
      const gptContext = `${systemPrompt}\n\nسؤال الطالب: ${cleanQuery}`;
      const liveUrl = `https://text.pollinations.ai/${encodeURIComponent(gptContext)}?model=openai`;

      const liveRes = await fetch(liveUrl, { signal: AbortSignal.timeout(6500) });
      if (liveRes.ok) {
        const liveText = await liveRes.text();
        if (liveText && liveText.trim().length > 15 && !liveText.includes('Free limit reached')) {
          return {
            answer: liveText.trim(),
            source: 'openai_gpt',
            suggestions: [
              ar ? 'أريد مثالاً عملياً من المعمل' : 'Give me a hands-on lab example',
              ar ? 'اسألني سؤالاً لاختبار فهمي' : 'Quiz my understanding'
            ]
          };
        }
      }
    } catch {
      // Fall through
    }

    // 4. Priority D: Scientific Live Encyclopedia API
    try {
      const searchLang = ar ? 'ar' : 'en';
      const searchUrl = `https://${searchLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        cleanQuery
      )}&utf8=&format=json&origin=*`;

      const response = await fetch(searchUrl, { signal: AbortSignal.timeout(2500) });
      if (response.ok) {
        const data = await response.json();
        const topHit = data.query?.search?.[0];
        if (topHit) {
          const summaryUrl = `https://${searchLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topHit.title)}`;
          const sumRes = await fetch(summaryUrl, { signal: AbortSignal.timeout(2000) });
          if (sumRes.ok) {
            const sumData = await sumRes.json();
            if (sumData.extract) {
              return {
                answer: `🔬 **${sumData.title}**:\n${sumData.extract}\n\n💡 *فكرة تطبيقية في ${currentLabName.ar}*: يمكنك تجربة وملاحظة هذا المبدأ مباشرة داخل أدوات المحاكاة ومراقبة التغير في القياسات!`,
                source: 'open_science',
                suggestions: [
                  ar ? 'ما هي المعادلة الرياضية الحاكمة؟' : 'What is the governing equation?',
                  ar ? 'وضح لي أكثر' : 'Elaborate further'
                ]
              };
            }
          }
        }
      }
    } catch {
      // Fall through
    }

    // 5. Intelligent Socratic Pedagogical Fallback
    return {
      answer: ar
        ? `سؤال ذكي جداً يا بطل! في معمل "${currentLabName.ar}"، كل ظاهرة علمية ترتبط بمعادلة فيزيائية أو تفاعل كيميائي يمكنك اختباره بيدك الآن. جرب تغيير المتغيرات وملاحظة النتائج. تحب نركز على تجربة محددة من معمل اليوم؟`
        : `Brilliant inquiry! In "${currentLabName.en}", every concept ties directly into the interactive simulations on your screen. Try tweaking the parameters and observing the telemetry!`,
      source: 'local_lab',
      suggestions: [
        ar ? 'اشرح لي أهم أدوات هذا المعمل' : 'Explain the primary tools of this lab',
        ar ? 'ما هي التجربة الأكثر إثارة هنا؟' : 'What is the most exciting experiment here?'
      ]
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
                {geminiApiKey ? 'Google Gemini AI (نشط)' : openaiApiKey ? 'OpenAI GPT-4o (نشط)' : 'ذكاء اصطناعي تفاعلي وصوت'}
              </span>
              <span className="block text-sm font-black tracking-wide">
                {ar ? `تحدث مع ${activeDisplayName} 💡` : `Chat with ${activeDisplayName} 💡`}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Main AI Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 w-[95vw] sm:w-[460px] rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/40 bg-[#070b14]/95 backdrop-blur-xl transition-all duration-300 flex flex-col ${
            isMinimized ? 'h-16' : 'h-[630px] max-h-[92vh]'
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
                    {geminiApiKey ? 'Gemini 1.5' : openaiApiKey ? `GPT-4o` : 'Live AI'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block -mt-0.5 truncate max-w-[190px]">
                  {ar ? currentLabName.ar : currentLabName.en}
                </span>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              {/* Stop Speaking Button */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-colors animate-pulse"
                  title={ar ? 'إيقاف الصوت' : 'Stop voice'}
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
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
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
                title={ar ? 'إعدادات مفاتيح AI (Gemini / OpenAI) والصوت' : 'AI Models & Voice Settings'}
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
            <div className="p-3.5 bg-slate-950/98 border-b border-emerald-500/30 text-xs space-y-3 max-h-[380px] overflow-y-auto animate-in slide-in-from-top duration-200">
              {/* Google Gemini API Key Section (100% Free) */}
              <div className="p-2.5 rounded-2xl bg-sky-950/30 border border-sky-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    {ar ? 'مفتاح Google Gemini API (مجاني 100% للأبد):' : 'Google Gemini API Key (100% Free):'}
                  </label>
                  {geminiApiKey ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {ar ? 'نشط الآن' : 'Active'}
                    </span>
                  ) : (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
                    >
                      {ar ? 'احصل عليه مجاناً' : 'Get free key'}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiApiKey}
                      onChange={e => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-slate-900/90 border border-sky-500/30 focus:border-sky-400 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-white"
                    >
                      {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {geminiApiKey && (
                    <button
                      type="button"
                      onClick={() => setGeminiApiKey('')}
                      className="px-2 py-1.5 text-[11px] rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                      title={ar ? 'مسح المفتاح' : 'Clear Key'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {ar
                    ? '💡 احصل على المفتاح مجاناً في 5 ثوانٍ من Google AI Studio، وسيحول المعلم فوراً إلى نموذج Gemini 1.5 الذكي!'
                    : '💡 Get it free in 5 seconds from Google AI Studio to power SciNexa with full Gemini 1.5 Flash.'}
                </p>
              </div>

              {/* OpenAI API Key Section (Optional) */}
              <div className="p-2.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    {ar ? 'مفتاح OpenAI (اختياري لصوت شات جي بي تي الرسمي):' : 'OpenAI API Key (Optional for ChatGPT Voice):'}
                  </label>
                  {openaiApiKey && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {ar ? 'مفعل' : 'Active'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type={showOpenaiKey ? 'text' : 'password'}
                      value={openaiApiKey}
                      onChange={e => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-proj-..."
                      className="w-full bg-slate-900/90 border border-emerald-500/30 focus:border-emerald-400 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-white"
                    >
                      {showOpenaiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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

                {/* Voice Selector */}
                {openaiApiKey && (
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {OPENAI_VOICES.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setOpenaiVoice(v.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] border transition-all text-left rtl:text-right ${
                          openaiVoice === v.id
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {v.id.toUpperCase()} ({ar ? v.nameAr.split('(')[1]?.replace(')', '') || v.id : v.id})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice Test & Language */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-bold flex items-center gap-1.5 cursor-pointer text-[11px]"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-300" />
                  {isTestingVoice ? (ar ? 'جاري النطق...' : 'Speaking...') : (ar ? '🔊 تجربة الصوت التفاعلي' : '🔊 Test AI Voice')}
                </button>

                <div className="flex items-center gap-1">
                  {(['ar', 'en', 'auto'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => setVoiceLanguage(l)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        voiceLanguage === l
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {l === 'ar' ? '🇸🇦 عربية' : l === 'en' ? '🇬🇧 English' : '🌐 تلقائي'}
                    </button>
                  ))}
                </div>
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
                            {msg.source === 'gemini_official' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/25 text-sky-300 font-bold border border-sky-500/40">
                                Google Gemini 1.5
                              </span>
                            )}
                            {msg.source === 'openai_official' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/40">
                                OpenAI GPT-4o
                              </span>
                            )}
                            {msg.source === 'openai_gpt' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-teal-500/20 text-teal-300 font-normal">
                                Live AI
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => speak(msg.text)}
                            className="p-1 hover:text-white transition-colors flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-300 cursor-pointer"
                            title={ar ? 'استمع بالنطق الصوتي الفصيح' : 'Listen with AI voice'}
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
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/80 border border-white/10 max-w-[260px] text-xs text-emerald-400">
                    <BrainCircuit className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">
                      {aiStatusText || (ar ? 'جاري التفكير والتوليد...' : 'Thinking & Generating...')}
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
                        ? `اسأل ${activeDisplayName} أي سؤال علمي في ${currentLabName.ar}...`
                        : `Ask ${activeDisplayName} any question in ${currentLabName.en}...`
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
