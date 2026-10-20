import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  Lightbulb,
  X,
  Minimize2,
  Maximize2,
  BrainCircuit,
  Phone,
  Mic,
  MicOff,
  Waves,
  Radio,
  Bot,
  Zap,
  Dna,
  FlaskConical,
  Globe2,
  Bone,
  Home,
  Orbit,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface DarwinAssistantProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

// Lab metadata and navigation options in SciNexa
const SCINEXA_LABS = [
  { id: 'home', ar: 'الرئيسية', en: 'Home', icon: Home, color: 'text-slate-300' },
  { id: 'anatomy', ar: 'أطلس التشريح 3D', en: 'Anatomy 3D', icon: Bone, color: 'text-rose-400' },
  { id: 'physics', ar: 'مختبر الفيزياء والدوائر', en: 'Physics & Circuits', icon: Zap, color: 'text-amber-400' },
  { id: 'chemistry', ar: 'مختبر الكيمياء والجدول الدوري', en: 'Chemistry Lab', icon: FlaskConical, color: 'text-cyan-400' },
  { id: 'biology', ar: 'مختبر الأحياء والخلية', en: 'Biology Lab', icon: Dna, color: 'text-emerald-400' },
  { id: 'geology', ar: 'علوم الأرض والزلازل', en: 'Geology & Seismic', icon: Globe2, color: 'text-orange-400' },
  { id: 'astronomy', ar: 'علم الفلك ومدارات كبلر', en: 'Astronomy Lab', icon: Orbit, color: 'text-purple-400' },
];

export const DarwinAssistant: React.FC<DarwinAssistantProps> = ({ currentTab, setCurrentTab }) => {
  const { isRTL } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTabMode, setActiveTabMode] = useState<'agent' | 'chat'>('agent');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'darwin'; text: string }>>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);

  // Live telemetry of what the user touches in 3D labs
  const [liveContext, setLiveContext] = useState<{
    lab: string;
    title: string;
    desc: string;
    type?: string;
    timestamp: number;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Register Global SciNexa Bridge for Lab Control
  useEffect(() => {
    (window as any).SciNexa = {
      navigate: (tab: string) => setCurrentTab(tab),
      getLab: () => currentTab,
      notifyContext: (detail: any) => {
        setLiveContext({ ...detail, timestamp: Date.now() });
      }
    };

    const handleLabContext = (e: any) => {
      if (e.detail) {
        setLiveContext({ ...e.detail, timestamp: Date.now() });
      }
    };

    window.addEventListener('scinexa:context', handleLabContext);
    return () => window.removeEventListener('scinexa:context', handleLabContext);
  }, [currentTab, setCurrentTab]);

  // Load welcome greeting on lab switch
  useEffect(() => {
    const currentLabMeta = SCINEXA_LABS.find(l => l.id === currentTab) || SCINEXA_LABS[0];
    const greetingText = `مرحباً بك! أنا "داروين" المرشد العلمي لمنصة ساينكسا.\n\nأنت الآن في **${currentLabMeta.ar}**.\nيمكنني فتح أي مختبر لك فوراً، شرح أي عظمة أو عضو تحدده، أو تحليل ومراجعة توصيل دوائرك الكهربائية وقوانين أوم وتفاعلات الكيمياء بالكامل!`;

    setMessages([
      {
        id: 'darwin-welcome-' + currentTab,
        sender: 'darwin',
        text: greetingText
      }
    ]);
  }, [currentTab]);

  // Expand Fish Audio Agent Widget
  const triggerAgentCall = () => {
    try {
      document.dispatchEvent(new CustomEvent('fish-agent:expand'));
    } catch (e) {
      console.warn('Could not trigger agent expand:', e);
    }
  };

  // Dictation Microphone
  const toggleInputMic = () => {
    if (isMicListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsMicListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('خاصية الميكروفون الصوتي غير مدعومة في متصفحك. يرجى استخدام Google Chrome أو Microsoft Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    setIsMicListening(true);

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setInputText(transcript);
    };

    recognition.onerror = () => setIsMicListening(false);
    recognition.onend = () => setIsMicListening(false);

    try { recognition.start(); } catch { setIsMicListening(false); }
  };

  // Smart Query handling (with lab navigation detection)
  const handleSendMessage = async (queryText?: string) => {
    const query = (queryText || inputText).trim();
    if (!query) return;

    setMessages(prev => [...prev, { id: 'user-' + Date.now(), sender: 'user', text: query }]);
    setInputText('');
    setIsThinking(true);

    // 1. Check if user asked to open a lab
    const lower = query.toLowerCase();
    let targetLab: string | null = null;
    if (lower.includes('تشريح') || lower.includes('عظام') || lower.includes('جسم الإنسان') || lower.includes('عضلة')) {
      targetLab = 'anatomy';
    } else if (lower.includes('فيزياء') || lower.includes('دوائر') || lower.includes('أوم') || lower.includes('كهرباء')) {
      targetLab = 'physics';
    } else if (lower.includes('كيمياء') || lower.includes('جدول دوري') || lower.includes('عناصر') || lower.includes('تفاعل')) {
      targetLab = 'chemistry';
    } else if (lower.includes('أحياء') || lower.includes('خلية') || lower.includes('dna') || lower.includes('كائنات')) {
      targetLab = 'biology';
    } else if (lower.includes('جيولوجيا') || lower.includes('أرض') || lower.includes('زلزال') || lower.includes('تسونامي')) {
      targetLab = 'geology';
    } else if (lower.includes('فلك') || lower.includes('كواكب') || lower.includes('كبلر') || lower.includes('نظام شمسي')) {
      targetLab = 'astronomy';
    } else if (lower.includes('رئيسية') || lower.includes('البداية') || lower.includes('خروج')) {
      targetLab = 'home';
    }

    if (targetLab && targetLab !== currentTab) {
      setCurrentTab(targetLab);
      const targetMeta = SCINEXA_LABS.find(l => l.id === targetLab);
      setIsThinking(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'darwin-' + Date.now(),
          sender: 'darwin',
          text: `🎯 تم تنفيذ أمرك فوراً! قمت بفتح **${targetMeta?.ar}** لك الآن.\n\nتفضل بالاستكشاف وسأقوم بتحليل وتفسير كل جزء وعنصر تتفاعل معه مباشرة!`
        }
      ]);
      return;
    }

    // 2. Query Gemini Brain if available
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }],
          currentTab
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { id: 'darwin-' + Date.now(), sender: 'darwin', text: data.reply || data.text }]);
        setIsThinking(false);
        return;
      }
    } catch {}

    // Fallback response
    setIsThinking(false);
    setMessages(prev => [
      ...prev,
      {
        id: 'darwin-' + Date.now(),
        sender: 'darwin',
        text: `أهلاً بك! في مختبر ${currentTab}، يمكنك إجراء التجارب ثلاثية الأبعاد التفاعلية. استخدم أزرار التحكم أعلاه أو تحدث معي صوتياً عبر وكيل داروين للتحكم الفوري!`
      }
    ]);
  };

  const currentLabMeta = SCINEXA_LABS.find(l => l.id === currentTab) || SCINEXA_LABS[0];

  return (
    <>
      {/* Sleek Floating Darwin Launcher */}
      {!isOpen && (
        <div className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50`}>
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-600 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-sm shadow-2xl shadow-teal-500/30 border-2 border-white/20 transition-all hover:scale-105 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-teal-300 border-2 border-[#090a0d] rounded-full animate-ping" />
            </div>
            <div className="text-right">
              <span className="block leading-none text-xs font-bold text-teal-200">
                المرشد العلمي لمنصة ساينكسا
              </span>
              <span className="block text-sm font-black tracking-wide">
                داروين | Darwin AI 🎙️
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Main Darwin Assistant Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 w-[95vw] sm:w-[490px] rounded-3xl overflow-hidden shadow-2xl border border-teal-500/40 bg-[#070b14]/98 backdrop-blur-2xl transition-all duration-300 flex flex-col ${
            isMinimized ? 'h-16' : 'h-[650px] max-h-[92vh]'
          }`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-teal-400 border-2 border-black rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white font-mono">
                    داروين | المرشد العلمي
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    تحكم بالمنصة
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block -mt-0.5 truncate max-w-[210px]">
                  موقعك الآن: {currentLabMeta.ar}
                </span>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Header: Lab Quick Navigation & Modes */}
          {!isMinimized && (
            <div className="px-3 py-2 bg-[#04060e] border-b border-white/10 space-y-2">
              {/* Mode Tabs */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setActiveTabMode('agent')}
                    className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                      activeTabMode === 'agent'
                        ? 'bg-gradient-to-r from-teal-500/30 to-indigo-500/30 text-teal-200 border border-teal-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    <span>مكالمة داروين الصوتية 🎙️</span>
                  </button>

                  <button
                    onClick={() => setActiveTabMode('chat')}
                    className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                      activeTabMode === 'chat'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                    <span>شات المنصة والتحكم</span>
                  </button>
                </div>

                <button
                  onClick={triggerAgentCall}
                  className="px-2.5 py-1 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer animate-pulse"
                >
                  <Phone className="w-3 h-3" />
                  <span>اتصل الآن</span>
                </button>
              </div>

              {/* Quick Lab Control Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-thin">
                <span className="text-slate-500 text-[9px] shrink-0 font-bold">المختبرات:</span>
                {SCINEXA_LABS.map(lab => {
                  const Icon = lab.icon;
                  const isActive = currentTab === lab.id;
                  return (
                    <button
                      key={lab.id}
                      onClick={() => {
                        setCurrentTab(lab.id);
                        setMessages(prev => [
                          ...prev,
                          {
                            id: 'nav-' + Date.now(),
                            sender: 'darwin',
                            text: `تم الانتقال مباشرة إلى **${lab.ar}**. تفضل بالاستكشاف!`
                          }
                        ]);
                      }}
                      className={`px-2 py-0.5 rounded-lg border transition-all shrink-0 flex items-center gap-1 font-medium cursor-pointer ${
                        isActive
                          ? 'bg-teal-500/25 border-teal-500/50 text-white shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-2.5 h-2.5 ${lab.color}`} />
                      <span>{lab.ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Body Content */}
          {!isMinimized && (
            <>
              {/* Live Context Telemetry Alert (Whenever User Interacts in 3D Labs) */}
              {liveContext && (
                <div className="px-3 py-1.5 bg-gradient-to-r from-teal-950/60 to-slate-900/60 border-b border-teal-500/20 text-xs text-teal-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse shrink-0" />
                    <span className="truncate">
                      <strong>رصد داروين:</strong> {liveContext.title} {liveContext.desc && `— ${liveContext.desc}`}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleSendMessage(`اشرح لي بالتفصيل ما هو ${liveContext.title} ووظيفته العلمية في منصة ساينكسا؟`);
                      setActiveTabMode('chat');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold shrink-0 cursor-pointer"
                  >
                    اشرح لي 💡
                  </button>
                </div>
              )}

              {/* 1. DARWIN FISH AUDIO VOICE AGENT MODE */}
              {activeTabMode === 'agent' && (
                <div className="flex-1 flex flex-col p-4 bg-gradient-to-b from-[#050813] via-[#04060f] to-black relative overflow-y-auto">
                  <div className="p-3 mb-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold block text-white">وكيل داروين الصوتي المباشر (Darwin Voice Agent)</span>
                        <span className="text-[10px] text-slate-400">تقنية المكالمة الصوتية الفورية بالذكاء الاصطناعي</span>
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                      Live Call
                    </span>
                  </div>

                  {/* Trigger Direct Voice Call Button */}
                  <div className="mb-3 flex justify-center">
                    <button
                      onClick={triggerAgentCall}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-teal-500/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer animate-pulse"
                    >
                      <Phone className="w-4 h-4" />
                      <span>افتح شاشة المكالمة الصوتية مع داروين 🎙️</span>
                    </button>
                  </div>

                  {/* Embedded Custom Fish Audio Element */}
                  <div
                    className="flex-1 rounded-2xl border border-white/10 bg-slate-950/90 overflow-hidden flex flex-col items-center justify-center p-3 min-h-[380px] relative shadow-2xl"
                    dangerouslySetInnerHTML={{
                      __html: '<fish-agent agent-id="97720634298f4e94bdec0811de4cb3f3"></fish-agent>'
                    }}
                  />
                </div>
              )}

              {/* 2. TEXT CHAT & PLATFORM CONTROL MODE */}
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
                              ? 'bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 text-white rounded-br-sm shadow-teal-900/30'
                              : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-bl-sm shadow-black/50'
                          }`}
                        >
                          {msg.sender === 'darwin' && (
                            <div className="flex items-center gap-1.5 pb-1.5 mb-2 border-b border-white/10 text-[10px] text-teal-400 font-bold">
                              <Sparkles className="w-3 h-3 text-teal-400" />
                              داروين | المرشد العلمي
                            </div>
                          )}
                          <p className="whitespace-pre-line font-medium">{msg.text}</p>
                        </div>
                      </div>
                    ))}

                    {isThinking && (
                      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/90 border border-teal-500/30 max-w-[280px] text-xs text-teal-400 animate-pulse">
                        <BrainCircuit className="w-4 h-4 animate-spin text-teal-400 shrink-0" />
                        <span className="font-mono text-[11px]">جاري التفكير والتحليل العلمي عبر داروين...</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
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
                        placeholder="قل لداروين: 'افتح مختبر التشريح' أو اسأله عن أي تجربة..."
                        className="flex-1 bg-slate-950/80 border border-white/15 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />

                      <button
                        type="button"
                        onClick={toggleInputMic}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isMicListening
                            ? 'bg-rose-500/30 border-rose-500 text-rose-300 animate-pulse'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={isMicListening ? 'إيقاف الاستماع' : 'تحدث بصوتك'}
                      >
                        {isMicListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
                      </button>

                      <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 disabled:opacity-40 text-white transition-all shadow-md cursor-pointer"
                      >
                        <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
