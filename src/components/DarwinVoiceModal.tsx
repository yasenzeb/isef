/**
 * DarwinVoiceModal.tsx — واجهة المساعد العلمي "داروين" التفاعلية والمخصصة
 * بتصميم زجاجي Apple Glassmorphic متناسق ومتموضع بدقة فوق شريط الـ Dock.
 * تم تعديل وتنسيق وكيل Fish Audio ومعالجة جميع عيوب العرض والخلفية البيضاء.
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 * SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  Mic,
  MicOff,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  Phone,
  Volume2,
  VolumeX,
  Send,
  Zap,
  Globe2,
  FlaskConical,
  Activity,
  Orbit,
  Dna,
  Home
} from 'lucide-react';
import { resolveNavigation } from './FishAgentController';

interface DarwinVoiceModalProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const LAB_LABELS: Record<string, { ar: string; en: string }> = {
  home: { ar: 'الرئيسية', en: 'Home' },
  anatomy: { ar: 'أطلس التشريح 3D', en: '3D Anatomy' },
  physics: { ar: 'مختبر الفيزياء', en: 'Physics' },
  chemistry: { ar: 'الجدول الدوري والكيمياء', en: 'Chemistry' },
  biology: { ar: 'مختبر الأحياء والخلية', en: 'Biology' },
  geology: { ar: 'علوم الأرض والزلازل', en: 'Geology' },
  astronomy: { ar: 'علم الفلك والفضاء', en: 'Astronomy' },
};

export const DarwinVoiceModal: React.FC<DarwinVoiceModalProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'voice' | 'agent'>('voice');

  // Voice Call & Interaction State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [replyText, setReplyText] = useState(
    isAr
      ? 'أهلاً بك يا بطل! أنا داروين مرشدك العلمي المباشر في منصة SciNexa. اضغط على الميكروفون واسألني أي سؤال أو اطلب فتح أي مختبر!'
      : 'Welcome! I am Darwin, your interactive science AI guide in SciNexa. Tap the microphone to talk or explore any laboratory!'
  );
  const [inputText, setInputText] = useState('');

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Listen for global open-darwin event from the dock
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('open-darwin', handleOpen);
    return () => window.removeEventListener('open-darwin', handleOpen);
  }, []);

  // 2. Load Fish Audio Widget script on demand if Agent tab is chosen
  useEffect(() => {
    if (isOpen && activeTab === 'agent') {
      if (!document.querySelector('script[src*="agent-widget-embed"]')) {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/@fishaudio/agent-widget-embed';
        s.async = true;
        document.body.appendChild(s);
      }
    }
  }, [isOpen, activeTab]);

  // 3. Shadow DOM Style Injection to fix Fish Audio default white/buggy styles
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const agentEl = document.querySelector('fish-agent') as any;
      if (agentEl && agentEl.shadowRoot) {
        if (!agentEl.shadowRoot.querySelector('#scinexa-fish-theme')) {
          const style = document.createElement('style');
          style.id = 'scinexa-fish-theme';
          style.textContent = `
            /* Fix Fish Audio inside SciNexa Dark Glass UI */
            :host {
              font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Arabic", "Cairo", sans-serif !important;
            }
            /* Dark background on all modal containers */
            div, section, main, [class*="dialog"], [class*="modal"], [class*="card"], [class*="panel"], [class*="wrapper"] {
              background-color: #12141c !important;
              color: #FFFFFF !important;
              border-color: rgba(255, 255, 255, 0.12) !important;
            }
            h1, h2, h3, h4, p, span, label {
              color: #F2F2F7 !important;
            }
            input, textarea {
              background: rgba(255, 255, 255, 0.08) !important;
              border: 1px solid rgba(255, 255, 255, 0.16) !important;
              color: #FFFFFF !important;
              border-radius: 12px !important;
            }
            button {
              background: linear-gradient(135deg, #007AFF, #5856D6) !important;
              color: #FFFFFF !important;
              border-radius: 9999px !important;
              border: none !important;
            }
          `;
          agentEl.shadowRoot.appendChild(style);
        }
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Stop speaking
  const stopAudio = () => {
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

  // Play audio response using Fish Audio / Neural TTS API
  const speakResponse = async (text: string) => {
    stopAudio();
    setIsSpeaking(true);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        await audio.play();
        return;
      }
    } catch {
      // Fallback
    }

    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = isAr ? 'ar-SA' : 'en-US';
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    } else {
      setIsSpeaking(false);
    }
  };

  // Handle user speech input
  const startListening = () => {
    stopAudio();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        isAr
          ? 'التعرف الصوتي غير مدعوم في متصفحك. يرجى استخدام متصفح Google Chrome أو Edge.'
          : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = isAr ? 'ar-EG' : 'en-US';
    rec.continuous = false;
    rec.interimResults = true;

    recognitionRef.current = rec;
    setIsListening(true);
    setTranscriptText('');

    rec.onresult = (e: any) => {
      const current = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscriptText(current);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    try {
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Submit query
  const handleQuery = (textToProcess?: string) => {
    const q = (textToProcess || transcriptText || inputText).trim();
    if (!q) return;

    // Check if voice command wants to navigate to another lab
    const resolved = resolveNavigation(q);
    if (resolved && resolved.mainTab) {
      setCurrentTab(resolved.mainTab);
      const ack = isAr
        ? `حاضر يا بطل! فتحت لك الآن ${resolved.labelAr}.`
        : `Opening ${resolved.labelEn} for you right now!`;
      setReplyText(ack);
      speakResponse(ack);
      setInputText('');
      setTranscriptText('');
      return;
    }

    // Process scientific inquiry
    const answer = isAr
      ? `أهلاً بك يا بطل! بخصوص سؤالك عن "${q}"، في منصة ساينكسا يتم فحص هذا المفهوم علمياً من خلال المحاكاة ثلاثية الأبعاد والتجارب التفاعلية الدقيقة.`
      : `Regarding your query about "${q}", in SciNexa you can explore this scientific phenomenon through our interactive 3D simulations.`;

    setReplyText(answer);
    speakResponse(answer);
    setInputText('');
    setTranscriptText('');
  };

  if (!isOpen) return null;

  const currentLab = LAB_LABELS[currentTab] || LAB_LABELS.home;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`fixed bottom-24 ${
        isRTL ? 'left-3 sm:left-6' : 'right-3 sm:right-6'
      } z-50 w-[94vw] sm:w-[460px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col`}
      style={{
        background: 'rgba(18, 18, 24, 0.94)',
        backdropFilter: 'blur(36px) saturate(190%)',
        WebkitBackdropFilter: 'blur(36px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow:
          '0 24px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
        height: isMinimized ? '68px' : '580px',
        maxHeight: '82vh',
      }}
    >
      {/* ── Modal Header (Apple Glassmorphic Bar) ── */}
      <div className="px-4 py-3 bg-white/[0.04] border-b border-white/[0.08] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          {/* Darwin Squircle Avatar */}
          <div
            className="w-9 h-9 rounded-[11px] flex items-center justify-center text-white shrink-0 shadow-lg relative"
            style={{
              background: 'linear-gradient(135deg, #10b981, #06b6d4, #6366f1)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.45)',
            }}
          >
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white font-sans">
                {isAr ? 'داروين | المرشد العلمي' : 'Darwin AI Guide'}
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Fish Audio
              </span>
            </div>
            <span className="text-[10px] text-[#8E8E93] block -mt-0.5 font-medium">
              {isAr ? `متصل بمعمل: ${currentLab.ar}` : `Active Lab: ${currentLab.en}`}
            </span>
          </div>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-full text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isMinimized ? 'تكبير' : 'تصغير'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              stopAudio();
              setIsOpen(false);
            }}
            className="p-1.5 rounded-full text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* ── Mode Segmented Control ── */}
          <div className="px-4 py-2 bg-black/40 border-b border-white/[0.06] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
              <button
                onClick={() => setActiveTab('voice')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'voice'
                    ? 'bg-white text-black shadow-md'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                {isAr ? 'المحادثة الصوتية' : 'Voice Chat'}
              </button>
              <button
                onClick={() => setActiveTab('agent')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'agent'
                    ? 'bg-white text-black shadow-md'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                {isAr ? 'وكيل Fish Audio' : 'Fish Audio Agent'}
              </button>
            </div>

            {isSpeaking && (
              <button
                onClick={stopAudio}
                className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 animate-pulse cursor-pointer"
              >
                <VolumeX className="w-3 h-3" />
                <span>{isAr ? 'إيقاف الصوت' : 'Mute'}</span>
              </button>
            )}
          </div>

          {/* ── Content Area ── */}
          {activeTab === 'voice' ? (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
              {/* Animated Siri/Gemini Orb */}
              <div className="flex flex-col items-center justify-center my-auto py-4">
                <div className="relative flex items-center justify-center">
                  {/* Outer Pulsing Rings */}
                  <div
                    className={`absolute w-32 h-32 rounded-full transition-all duration-700 ${
                      isListening
                        ? 'bg-teal-500/25 scale-125 animate-ping'
                        : isSpeaking
                          ? 'bg-indigo-500/25 scale-110 animate-pulse'
                          : 'bg-white/5 scale-100'
                    }`}
                  />
                  <div
                    className={`absolute w-24 h-24 rounded-full transition-all duration-500 ${
                      isListening
                        ? 'bg-cyan-500/30 scale-110'
                        : isSpeaking
                          ? 'bg-teal-500/30 scale-105'
                          : 'bg-white/5'
                    }`}
                  />

                  {/* Core Orb */}
                  <button
                    onClick={isListening ? () => stopListening() : startListening}
                    className="w-18 h-18 rounded-full flex items-center justify-center cursor-pointer shadow-2xl relative z-10 transition-transform active:scale-95 duration-150"
                    style={{
                      background: isListening
                        ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                        : isSpeaking
                          ? 'linear-gradient(135deg, #6366f1, #007AFF)'
                          : 'linear-gradient(135deg, #1e293b, #0f172a)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: isListening
                        ? '0 0 32px rgba(6, 182, 212, 0.6)'
                        : '0 8px 24px rgba(0, 0, 0, 0.5)',
                    }}
                    title={isListening ? 'اضغط لإيقاف الاستماع' : 'اضغط للتحدث مع داروين'}
                  >
                    {isListening ? (
                      <Mic className="w-8 h-8 text-white animate-bounce" />
                    ) : (
                      <Mic className="w-8 h-8 text-white" />
                    )}
                  </button>
                </div>

                {/* Status Indicator */}
                <span className="mt-4 text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isListening
                        ? 'bg-cyan-400 animate-ping'
                        : isSpeaking
                          ? 'bg-indigo-400 animate-pulse'
                          : 'bg-emerald-400'
                    }`}
                  />
                  {isListening
                    ? isAr ? 'يستمع لصوتك الآن...' : 'Listening to your voice...'
                    : isSpeaking
                      ? isAr ? 'داروين يتحدث...' : 'Darwin is speaking...'
                      : isAr ? 'اضغط على الميكروفون للتحدث' : 'Tap mic to speak with Darwin'}
                </span>
              </div>

              {/* Live Transcript & Reply Card */}
              <div className="space-y-2 mt-auto">
                {transcriptText && (
                  <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 text-xs text-white">
                    <span className="text-[10px] text-[#8E8E93] block mb-0.5 font-bold">
                      {isAr ? 'أنت:' : 'You:'}
                    </span>
                    <p className="font-medium">{transcriptText}</p>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/20 text-xs text-slate-100 leading-relaxed shadow-sm">
                  <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/[0.06]">
                    <span className="text-[10px] text-teal-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {isAr ? 'رد داروين العلمي:' : 'Darwin Response:'}
                    </span>
                    <button
                      onClick={() => speakResponse(replyText)}
                      className="text-[#8E8E93] hover:text-white p-0.5 transition-colors cursor-pointer"
                      title="إعادة نطق الشرح"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-normal text-[12px]">{replyText}</p>
                </div>

                {/* Quick Voice Command Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: isAr ? '⚡ افتح الفيزياء' : 'Physics', cmd: 'افتح مختبر الفيزياء' },
                    { label: isAr ? '🧪 الجدول الدوري' : 'Chemistry', cmd: 'افتح الكيمياء' },
                    { label: isAr ? '🦴 أطلس التشريح' : 'Anatomy', cmd: 'افتح التشريح' },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuery(chip.cmd)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/[0.08] transition-all cursor-pointer active:scale-95"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Text Fallback Input */}
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                    placeholder={
                      isAr
                        ? 'أو اكتب لداروين هنا: "افتح مختبر الأحياء"...'
                        : 'Or type your question here...'
                    }
                    className="flex-1 px-3 py-2 rounded-full bg-white/[0.06] border border-white/10 text-white text-xs placeholder:text-[#8E8E93] outline-none focus:border-teal-400 transition-colors"
                  />
                  <button
                    onClick={() => handleQuery()}
                    disabled={!inputText.trim()}
                    className="w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-black flex items-center justify-center cursor-pointer transition-all shrink-0 active:scale-95"
                  >
                    <Send className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Official Fish Audio Agent Embed Mode (Custom Styled) ── */
            <div className="flex-1 flex flex-col p-3 bg-black/60 relative overflow-hidden">
              <div className="p-2.5 mb-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-200 flex items-center justify-between">
                <span>{isAr ? 'وكيل Fish Audio المرتبط بالمختبرات' : 'Fish Audio Agent Attached'}</span>
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              </div>

              <div
                className="flex-1 rounded-2xl border border-white/10 bg-[#12141c] overflow-hidden flex flex-col items-center justify-center p-2 relative shadow-inner"
                dangerouslySetInnerHTML={{
                  __html:
                    '<fish-agent agent-id="929a1bf391db4185b03ae62f05a49207" language="ar" greeting="أهلاً بك يا بطل! أنا داروين مرشدك العلمي في منصة ساينكسا، جاهز لاستكشاف أي تجربة أو فحص أي عضو معايا؟"></fish-agent>',
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DarwinVoiceModal;
