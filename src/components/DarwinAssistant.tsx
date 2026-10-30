/**
 * DarwinAssistant.tsx
 * ─────────────────────────────────────────────────────────────────
 * واجهة داروين المرشد العلمي لمنصة ساينكسا
 * يعمل عبر LiveKit (livekit-client) للتواصل الصوتي المباشر مع
 * Fish Audio Agent — مما يتيح لداروين:
 *   ✓ معرفة كل ما يحدده المستخدم في المختبرات (عظمة / عنصر / دائرة)
 *   ✓ التحكم الكامل في المنصة (التنقل بين المختبرات)
 *   ✓ الرد الصوتي الفوري بصوت داروين
 * ─────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { EGYPT_GOVERNORATES } from '../data/egyptLocationData';
import {
  Sparkles, Send, X, Minimize2, Maximize2, BrainCircuit,
  Phone, Mic, MicOff, Bot, Zap, Dna, FlaskConical,
  Globe2, Bone, Home, Orbit, Activity, PhoneOff, PhoneCall,
  Wifi, WifiOff, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useDarwinBridge, DarwinConnectionStatus } from '../lib/DarwinBridge';

// ─── Lab metadata ─────────────────────────────────────────────────

const SCINEXA_LABS = [
  { id: 'home',      ar: 'الرئيسية',                    en: 'Home',          icon: Home,         color: 'text-slate-300' },
  { id: 'anatomy',   ar: 'أطلس التشريح 3D',             en: 'Anatomy 3D',    icon: Bone,         color: 'text-rose-400' },
  { id: 'physics',   ar: 'مختبر الفيزياء والدوائر',     en: 'Physics',       icon: Zap,          color: 'text-amber-400' },
  { id: 'chemistry', ar: 'مختبر الكيمياء والجدول الدوري', en: 'Chemistry',  icon: FlaskConical, color: 'text-cyan-400' },
  { id: 'biology',   ar: 'مختبر الأحياء والخلية',       en: 'Biology',       icon: Dna,          color: 'text-emerald-400' },
  { id: 'geology',   ar: 'علوم الأرض والزلازل',          en: 'Geology',       icon: Globe2,       color: 'text-orange-400' },
  { id: 'astronomy', ar: 'علم الفلك ومدارات كبلر',      en: 'Astronomy',     icon: Orbit,        color: 'text-purple-400' },
];

// ─── Status indicator helpers ─────────────────────────────────────

const STATUS_CONFIG: Record<DarwinConnectionStatus, {
  label: string; color: string; icon: React.ReactNode; pulse: boolean;
}> = {
  idle:         { label: 'في انتظار الاتصال',  color: 'text-slate-400',  icon: <Bot className="w-3 h-3" />,           pulse: false },
  connecting:   { label: 'جاري الاتصال...',    color: 'text-amber-400',  icon: <Wifi className="w-3 h-3" />,          pulse: true  },
  connected:    { label: 'متصل — يستمع الآن', color: 'text-teal-400',   icon: <CheckCircle2 className="w-3 h-3" />,  pulse: true  },
  reconnecting: { label: 'إعادة الاتصال...',   color: 'text-amber-400',  icon: <Wifi className="w-3 h-3" />,          pulse: true  },
  disconnected: { label: 'غير متصل',           color: 'text-slate-500',  icon: <WifiOff className="w-3 h-3" />,       pulse: false },
  error:        { label: 'خطأ في الاتصال',     color: 'text-rose-400',   icon: <AlertCircle className="w-3 h-3" />,   pulse: false },
};

// ─── Props ────────────────────────────────────────────────────────

interface DarwinAssistantProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

// ─── Component ───────────────────────────────────────────────────

export const DarwinAssistant: React.FC<DarwinAssistantProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const { isRTL } = useLanguage();

  const [isOpen, setIsOpen]         = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText]   = useState('');
  const [activeMode, setActiveMode] = useState<'call' | 'chat'>('call');

  const { user } = useAuth();

  const userProfile = useMemo(() => {
    const savedGovId = localStorage.getItem('scinexa_gov_id') || '';
    const savedAdminId = localStorage.getItem('scinexa_admin_id') || '';
    const activeGov = EGYPT_GOVERNORATES.find(g => g.id === savedGovId);
    const activeAdmin = activeGov?.administrations.find(a => a.id === savedAdminId);

    const govName = activeGov?.nameAr || user?.governorateAr || '';
    const adminName = activeAdmin?.nameAr || user?.administrationAr || '';

    return user ? {
      name: user.displayName,
      role: user.role,
      governorate: govName,
      administration: adminName,
      grade: user.grade,
      stage: user.stage,
      code: user.studentCode,
      isGuest: user.isGuest,
    } : null;
  }, [user]);

  // ── Darwin Bridge (LiveKit) ───────────────────────────────────────
  const {
    status,
    transcript,
    isMuted,
    connect,
    disconnect,
    toggleMute,
    sendTextMessage,
  } = useDarwinBridge({
    currentTab,
    userProfile,
    onNavigate: (tab) => {
      setCurrentTab(tab);
    },
    onTranscript: (msg) => {
      // Transcript is managed inside the hook; handled via `transcript`
    },
  });

  const statusCfg = STATUS_CONFIG[status];
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || status === 'reconnecting';

  // ── Register Global SciNexa Bridge ───────────────────────────────
  useEffect(() => {
    (window as any).SciNexa = {
      navigate: (tab: string) => setCurrentTab(tab),
      getLab: () => currentTab,
    };
  }, [currentTab, setCurrentTab]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleConnect = async () => {
    if (isConnected || isConnecting) {
      await disconnect();
    } else {
      await connect();
    }
  };

  const handleSend = () => {
    const q = inputText.trim();
    if (!q) return;

    // Check for local navigation commands first
    const lower = q.toLowerCase();
    const labMatch = SCINEXA_LABS.find(lab => {
      if (lab.id === 'home') return lower.includes('رئيسية') || lower.includes('البداية');
      if (lab.id === 'anatomy') return lower.includes('تشريح') || lower.includes('عظام') || lower.includes('عضلة');
      if (lab.id === 'physics') return lower.includes('فيزياء') || lower.includes('دوائر') || lower.includes('كهرباء');
      if (lab.id === 'chemistry') return lower.includes('كيمياء') || lower.includes('جدول دوري') || lower.includes('عناصر');
      if (lab.id === 'biology') return lower.includes('أحياء') || lower.includes('خلية') || lower.includes('dna');
      if (lab.id === 'geology') return lower.includes('جيولوجيا') || lower.includes('زلزال') || lower.includes('أرض');
      if (lab.id === 'astronomy') return lower.includes('فلك') || lower.includes('كواكب') || lower.includes('كبلر');
      return false;
    });

    if (labMatch) setCurrentTab(labMatch.id);

    // Send to Darwin via LiveKit data channel
    sendTextMessage(q);
    setInputText('');
  };

  const currentLabMeta = SCINEXA_LABS.find(l => l.id === currentTab) || SCINEXA_LABS[0];

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Launcher ─────────────────────────────────────── */}
      {!isOpen && (
        <div className={`fixed bottom-20 sm:bottom-6 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50`}>
          <button
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-600 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-2xl shadow-teal-500/30 border-2 border-white/20 transition-all hover:scale-105 cursor-pointer group"
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

      {/* ── Main Window ───────────────────────────────────────────── */}
      {isOpen && (
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className={`fixed bottom-20 sm:bottom-4 ${isRTL ? 'left-2.5 sm:left-6' : 'right-2.5 sm:right-6'} z-50 w-[95vw] sm:w-[500px] rounded-3xl overflow-hidden shadow-2xl border border-teal-500/40 bg-[#070b14]/98 backdrop-blur-2xl transition-all duration-300 flex flex-col ${
            isMinimized ? 'h-16' : 'h-[620px] max-h-[82vh] sm:max-h-[92vh]'
          }`}
        >
          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="px-4 py-3 bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                {/* Connection indicator dot */}
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-black rounded-full ${
                  isConnected ? 'bg-teal-400' : isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white font-mono">داروين | المرشد العلمي</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    تحكم كامل بالمنصة
                  </span>
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-medium mt-0.5 ${statusCfg.color} ${statusCfg.pulse ? 'animate-pulse' : ''}`}>
                  {statusCfg.icon}
                  <span>{statusCfg.label}</span>
                  <span className="text-slate-500 mx-1">·</span>
                  <span className="text-slate-400">{currentLabMeta.ar}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => { setIsOpen(false); disconnect(); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* ── Lab Quick Navigation ──────────────────────────── */}
              <div className="px-3 py-2 bg-[#04060e] border-b border-white/10 shrink-0">
                {/* Mode tabs */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      onClick={() => setActiveMode('call')}
                      className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                        activeMode === 'call'
                          ? 'bg-gradient-to-r from-teal-500/30 to-indigo-500/30 text-teal-200 border border-teal-500/40'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
                      <span>مكالمة داروين 🎙️</span>
                    </button>
                    <button
                      onClick={() => setActiveMode('chat')}
                      className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                        activeMode === 'chat'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                      <span>نص وتحكم</span>
                    </button>
                  </div>
                </div>

                {/* Lab shortcuts */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                  <span className="text-slate-500 text-[9px] shrink-0 font-bold">المختبرات:</span>
                  {SCINEXA_LABS.map(lab => {
                    const Icon = lab.icon;
                    return (
                      <button
                        key={lab.id}
                        onClick={() => {
                          setCurrentTab(lab.id);
                          sendTextMessage(`انتقلت إلى ${lab.ar}`);
                        }}
                        className={`px-2 py-0.5 rounded-lg border transition-all shrink-0 flex items-center gap-1 font-medium cursor-pointer ${
                          currentTab === lab.id
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

              {/* ── Call Mode ─────────────────────────────────────── */}
              {activeMode === 'call' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6 bg-gradient-to-b from-[#050813] to-black overflow-y-auto">
                  {/* Status circle */}
                  <div className="relative">
                    <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all ${
                      isConnected
                        ? 'border-teal-500 bg-teal-900/30 shadow-[0_0_40px_rgba(20,184,166,0.4)]'
                        : isConnecting
                        ? 'border-amber-500 bg-amber-900/20 animate-pulse'
                        : 'border-slate-700 bg-slate-900/50'
                    }`}>
                      <Bot className={`w-12 h-12 ${isConnected ? 'text-teal-400' : isConnecting ? 'text-amber-400' : 'text-slate-500'}`} />
                    </div>
                    {isConnected && (
                      <>
                        <span className="absolute inset-0 rounded-full border-2 border-teal-400/30 animate-ping" />
                        <span className="absolute inset-[-8px] rounded-full border border-teal-500/20 animate-ping" style={{ animationDelay: '0.3s' }} />
                      </>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-black text-white mb-1">داروين</p>
                    <p className="text-sm text-slate-400">المرشد العلمي لمنصة ساينكسا</p>
                    <div className={`flex items-center justify-center gap-1.5 mt-2 text-xs font-medium ${statusCfg.color}`}>
                      {statusCfg.icon}
                      <span>{statusCfg.label}</span>
                    </div>
                  </div>

                  {/* Connect / Disconnect button */}
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all cursor-pointer disabled:opacity-60 ${
                      isConnected
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                        : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-teal-900/40 hover:scale-105'
                    }`}
                  >
                    {isConnected
                      ? <><PhoneOff className="w-4 h-4" /><span>إنهاء المكالمة</span></>
                      : isConnecting
                      ? <><Wifi className="w-4 h-4 animate-pulse" /><span>جاري الاتصال...</span></>
                      : <><Phone className="w-4 h-4" /><span>ابدأ المكالمة الصوتية مع داروين 🎙️</span></>
                    }
                  </button>

                  {/* Mute button (when connected) */}
                  {isConnected && (
                    <button
                      onClick={toggleMute}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isMuted
                          ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      {isMuted ? 'أعد تشغيل الميكروفون' : 'كتم الميكروفون'}
                    </button>
                  )}

                  {/* Info box when not connected */}
                  {!isConnected && !isConnecting && (
                    <div className="max-w-xs text-center">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        داروين سيعرف كل ما تفعله في المختبرات ويشرح لك فوراً بصوته.
                        تحدث بالعربية وسيفهمك ويتحكم في المنصة نيابةً عنك.
                      </p>
                    </div>
                  )}

                  {/* Live transcript while connected */}
                  {isConnected && transcript.length > 0 && (
                    <div className="w-full max-w-sm bg-slate-900/60 border border-white/10 rounded-2xl p-3 max-h-40 overflow-y-auto">
                      <p className="text-[10px] text-teal-400 font-bold mb-2 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Transcript
                      </p>
                      {transcript.slice(-6).map((msg, i) => (
                        <p key={i} className={`text-xs mb-1.5 leading-relaxed ${
                          msg.role === 'assistant' ? 'text-teal-200' : 'text-slate-300'
                        }`}>
                          <span className="font-bold opacity-60 text-[10px]">
                            {msg.role === 'assistant' ? 'داروين: ' : 'أنت: '}
                          </span>
                          {msg.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Chat Mode ─────────────────────────────────────── */}
              {activeMode === 'chat' && (
                <>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#040609]">
                    {transcript.length === 0 && (
                      <div className="text-center text-slate-600 text-xs mt-6">
                        <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>اكتب سؤالاً أو أمراً لداروين</p>
                        <p className="text-[10px] mt-1 text-slate-700">مثال: "افتح مختبر الكيمياء" أو "اشرح قانون أوم"</p>
                      </div>
                    )}
                    {transcript.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-br-sm'
                            : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-bl-sm'
                        }`}>
                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-1 pb-1.5 mb-2 border-b border-white/10 text-[10px] text-teal-400 font-bold">
                              <Sparkles className="w-3 h-3" />
                              داروين | المرشد العلمي
                            </div>
                          )}
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat input */}
                  <div className="p-3 bg-[#050811] border-t border-white/10 shrink-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="اكتب لداروين: 'افتح مختبر التشريح' أو اسأل عن أي شيء..."
                        className="flex-1 bg-slate-950/80 border border-white/15 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 disabled:opacity-40 text-white transition-all cursor-pointer"
                      >
                        <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {!isConnected && (
                      <p className="text-[10px] text-slate-600 mt-1.5 text-center">
                        اتصل بداروين صوتياً لتفعيل الرد الآني ← اضغط "مكالمة داروين"
                      </p>
                    )}
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
