import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { answerLocally, STARTERS, type LocalReply } from '../../lib/localAI';
import { tLang } from '../../i18n/langHelpers';
import { PageHeader } from './ui';
import {
  Sparkles,
  Send,
  ShieldCheck,
  WifiOff,
  Trash2,
  ArrowRight,
  MessageSquare,
  FlaskConical,
  BookOpen,
  User,
  Bot,
  Compass,
  Atom,
  Dna,
  Globe2,
  Activity,
  Mic,
  Volume2,
  VolumeX,
  Radio,
  ShieldAlert,
  CheckCircle2,
  Presentation,
  Settings,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  link?: NonNullable<LocalReply['link']>;
  suggestions?: string[];
  reprimand?: boolean;
}

export const AssistantPage: React.FC = () => {
  const { language } = useLanguage();
  const { user, role } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message in current language
  useEffect(() => {
    const welcomeText = tLang(language, {
      ar: 'أهلاً بك يا بطل! أنا داروين • وكيل الذكاء الاصطناعي الصوتي والعلمي (Fish Audio Voice Engine). أتحكم في معامل المنصة الستة، أشرح التجارب الفيزيائية والكيميائية والبيولوجية، وأوجهك صوتياً لأي قسم تريده.',
      en: 'Welcome! I am Darwin, your Scientific AI Voice Controller powered by Fish Audio Voice Engine. I control all 6 laboratories, explain complex science, and navigate you anywhere by voice.',
      fr: 'Bienvenue! Je suis Darwin, votre contrôleur vocal IA scientifique (moteur Fish Audio). Je pilote les 6 laboratoires et vous guide vocalement.',
      de: 'Willkommen! Ich bin Darwin, Ihr wissenschaftlicher KI-Sprachassistent (Fish Audio Engine). Ich steuere alle 6 Labore und führe Sie per Sprache.',
      ja: 'ようこそ！私はダーウィンです。Fish Audio音声エンジン搭載の科学AIコントローラーとして、6つの専門実験室の操作や科学解説を音声で行います。',
    });

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: welcomeText,
        suggestions: ar
          ? ['انقلني لمعمل الكيمياء', 'اشرح قانون أوم', 'ما هي مكونات الخلية النباتية؟', 'افتح أطلس التشريح 3D']
          : ['Take me to Chemistry Lab', 'Explain Ohm’s law', 'Plant cell components', 'Open 3D Anatomy Atlas'],
      },
    ]);
  }, [language, ar]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  // Voice synthesis output
  const speakText = (text: string) => {
    if (voiceMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      if (language === 'ar') utterance.lang = 'ar-EG';
      else if (language === 'ja') utterance.lang = 'ja-JP';
      else if (language === 'fr') utterance.lang = 'fr-FR';
      else if (language === 'de') utterance.lang = 'de-DE';
      else utterance.lang = 'en-US';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {
      /* ignore audio error */
    }
  };

  // Process user prompt with platform commands, lab navigation, and role security
  const processCommand = (rawText: string) => {
    const text = rawText.trim();
    if (!text || typing) return;
    setInput('');

    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    const lower = text.toLowerCase();

    // 1. Strict Security Check: If student asks to add classes or access educator records
    if (
      role === 'student' &&
      (lower.includes('أضف فصل') ||
        lower.includes('اضف فصل') ||
        lower.includes('إضافة فصل') ||
        lower.includes('لوحة الإدارة') ||
        lower.includes('تعديل الدرجات') ||
        lower.includes('بوابة المدرس') ||
        lower.includes('add class') ||
        lower.includes('create class') ||
        lower.includes('admin portal'))
    ) {
      setTimeout(() => {
        const studentName = (localStorage.getItem('scinexa_user_fullname') || '').trim().split(/\s+/)[0] || user?.name?.trim().split(/\s+/)[0] || (ar ? 'طالب' : 'Student');
        const reprimandText = ar
          ? `يا ${studentName}، أنت ممنوع تعمل كدا ومينفعش، والأمر ده مش هنفذه لأنك طالب مش معلم، وإدارة الفصول وصلاحيات المدرسة محصورة بالمعلم والمدير فقط.`
          : tLang(language, {
              ar: `يا ${studentName}، أنت ممنوع تعمل كدا ومينفعش، والأمر ده مش هنفذه لأنك طالب مش معلم، وإدارة الفصول وصلاحيات المدرسة محصورة بالمعلم والمدير فقط.`,
              en: `Notice: You are not allowed to perform this action. I will not execute this command because you are a student, not a teacher. Class and school management is restricted to educators and administrators only.`,
              fr: `Action non autorisée. Vous êtes élève et n'avez pas accès à la gestion des classes.`,
              de: `Nicht autorisiert. Sie sind Schüler und haben keinen Zugriff auf die Klassenverwaltung.`,
              ja: `権限がありません。生徒によるクラスの管理や変更は制限されています。`,
            });

        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            text: reprimandText,
            reprimand: true,
            suggestions: ar ? ['انقلني لمعمل الكيمياء', 'انقلني للفيزياء', 'أطلس التشريح'] : ['Chemistry Lab', 'Physics Lab', 'Anatomy Atlas'],
          },
        ]);
        setTyping(false);
        speakText(reprimandText);
      }, 350);
      return;
    }

    // If student asks for an invalid or unknown lab/section
    if (
      (lower.includes('انقلني') || lower.includes('وديني') || lower.includes('افتح معمل')) &&
      !lower.includes('كيمياء') &&
      !lower.includes('chemistry') &&
      !lower.includes('فيزياء') &&
      !lower.includes('physics') &&
      !lower.includes('تشريح') &&
      !lower.includes('anatomy') &&
      !lower.includes('فلك') &&
      !lower.includes('كبلر') &&
      !lower.includes('astronomy') &&
      !lower.includes('أحياء') &&
      !lower.includes('biology') &&
      !lower.includes('جيولوجيا') &&
      !lower.includes('أرض') &&
      !lower.includes('geology') &&
      !lower.includes('سبورة') &&
      !lower.includes('smartboard') &&
      !lower.includes('curriculum') &&
      !lower.includes('منهج') &&
      !lower.includes('إعدادات') &&
      !lower.includes('settings')
    ) {
      setTimeout(() => {
        const reply = ar
          ? `لم أستطع تنفيذ أمرك "${text}"، والسبب أن هذا المعمل أو القسم غير متوفر في المنصة. المعامل الستة المتاحة هي: معمل الكيمياء، الفيزياء، أطلس التشريح 3D، مرصد كبلر الفلكي، مختبر الأحياء، ومعمل الجيولوجيا.`
          : `Could not execute "${text}" because this lab or section does not exist on SciNexa. Available labs are: Chemistry, Physics, Anatomy, Astronomy, Biology, and Geology.`;
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            text: reply,
            suggestions: ar ? ['معمل الكيمياء', 'معمل الفيزياء', 'أطلس التشريح', 'مرصد كبلر'] : ['Chemistry Lab', 'Physics Lab', 'Anatomy Atlas', 'Kepler Observatory'],
          },
        ]);
        setTyping(false);
        speakText(reply);
      }, 300);
      return;
    }

    // 2. Navigation Commands
    if (lower.includes('كيمياء') || lower.includes('chemistry')) {
      setTimeout(() => {
        const reply = ar ? 'حاضر! أنقلك الآن مباشرة إلى معمل الكيمياء الافتراضي والتفاعلات الكيميائية.' : 'Navigating you to the 3D Chemistry and Chemical Reactions Laboratory.';
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            text: reply,
            link: { to: '/app/labs/chemistry', labelAr: 'الدخول لمعمل الكيمياء الآن', labelEn: 'Enter Chemistry Lab Now' },
          },
        ]);
        setTyping(false);
        speakText(reply);
        setTimeout(() => navigate('/app/labs/chemistry'), 1200);
      }, 300);
      return;
    }

    if (lower.includes('تشريح') || lower.includes('anatomy')) {
      setTimeout(() => {
        const reply = ar ? 'بالتأكيد! أنقلك الآن إلى أطلس التشريح البشري التفاعلي 3D.' : 'Taking you directly to the 3D Interactive Human Anatomy Atlas.';
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            text: reply,
            link: { to: '/app/labs/anatomy', labelAr: 'فتح أطلس التشريح 3D', labelEn: 'Open 3D Anatomy Atlas' },
          },
        ]);
        setTyping(false);
        speakText(reply);
        setTimeout(() => navigate('/app/labs/anatomy'), 1200);
      }, 300);
      return;
    }

    if (lower.includes('فيزياء') || lower.includes('physics')) {
      setTimeout(() => {
        const reply = ar ? 'جارٍ فتح معمل الفيزياء والدوائر الكهربائية والضوء الآن.' : 'Opening the 3D Physics & Circuit Simulation Laboratory now.';
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            text: reply,
            link: { to: '/app/labs/physics', labelAr: 'الدخول لمعمل الفيزياء', labelEn: 'Enter Physics Lab' },
          },
        ]);
        setTyping(false);
        speakText(reply);
        setTimeout(() => navigate('/app/labs/physics'), 1200);
      }, 300);
      return;
    }

    if (lower.includes('فلك') || lower.includes('كبلر') || lower.includes('astronomy')) {
      setTimeout(() => {
        const reply = ar ? 'حاضر! جارٍ توجيهك إلى مرصد كبلر الفلكي والمجموعة الشمسية.' : 'Navigating you to the Kepler Astronomy Observatory & Solar System.';
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            text: reply,
            link: { to: '/app/labs/astronomy', labelAr: 'الدخول لمرصد الفلك', labelEn: 'Enter Kepler Observatory' },
          },
        ]);
        setTyping(false);
        speakText(reply);
        setTimeout(() => navigate('/app/labs/astronomy'), 1200);
      }, 300);
      return;
    }

    if (lower.includes('سبورة') || lower.includes('smartboard') || lower.includes('classroom')) {
      setTimeout(() => {
        const reply = ar ? 'حاضر! جارٍ فتح السبورة التفاعلية للرسم والشرح المعملي.' : 'Opening the interactive Smartboard classroom for live science diagrams.';
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            text: reply,
            link: { to: '/app/classroom', labelAr: 'فتح السبورة التفاعلية', labelEn: 'Launch Smartboard' },
          },
        ]);
        setTyping(false);
        speakText(reply);
        setTimeout(() => navigate('/app/classroom'), 1200);
      }, 300);
      return;
    }

    if (lower.includes('إعدادات') || lower.includes('settings')) {
      setTimeout(() => {
        const reply = ar ? 'أنقلك الآن لصفحة الإعدادات وتعديل الاسم واللغة.' : 'Navigating to Account Settings.';
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            text: reply,
            link: { to: '/app/settings', labelAr: 'فتح الإعدادات', labelEn: 'Open Settings' },
          },
        ]);
        setTyping(false);
        speakText(reply);
        setTimeout(() => navigate('/app/settings'), 1200);
      }, 300);
      return;
    }

    // 3. Scientific QA fallback
    setTimeout(() => {
      const reply = answerLocally(text, ar);
      const replyText = ar ? reply.textAr : reply.textEn;
      const replySuggestions = ar ? reply.suggestionsAr : reply.suggestionsEn;

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: replyText,
          link: reply.link,
          suggestions: replySuggestions,
        },
      ]);
      setTyping(false);
      speakText(replyText);
    }, 280);
  };

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(ar ? 'متصفحك لا يدعم التعرف الصوتي المباشر، يرجى استخدام Google Chrome أو Microsoft Edge.' : 'Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = ar ? 'ar-EG' : language === 'ja' ? 'ja-JP' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => setIsListening(true);
      rec.onresult = (e: any) => {
        const transcript = e.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setInput(transcript);
          processCommand(transcript);
        }
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  const clearChat = () => {
    const welcomeText = tLang(language, {
      ar: 'تم مسح المحادثة. أنا جاهز لأي استفسار علمي أو أمر صوتي جديد!',
      en: 'Chat cleared. Ready for your next scientific inquiry or voice command!',
      fr: 'Chat effacé. Prêt pour votre prochaine question !',
      de: 'Chat gelöscht. Bereit für Ihre nächste Anfrage!',
      ja: 'チャット履歴を消去しました。新しい音声指示や質問をお待ちしています。',
    });
    setMessages([{ id: `w_${Date.now()}`, role: 'assistant', text: welcomeText }]);
  };

  return (
    <div dir={ar ? 'rtl' : 'ltr'}>
      <PageHeader
        eyebrow={tLang(language, { ar: 'وكيل الذكاء الاصطناعي الصوتي', en: 'AI Voice Controller', fr: 'Contrôleur vocal IA', de: 'KI-Sprachassistent', ja: '音声AIコントローラー' })}
        title={tLang(language, { ar: 'داروين • مرشد العلوم والصوت الشامل', en: 'Darwin • Scientific AI Voice Guide', fr: 'Darwin • Guide vocal scientifique', de: 'Darwin • Wissenschaftlicher Sprachführer', ja: 'ダーウィン • 総合科学音声ガイド' })}
        subtitle={tLang(language, {
          ar: 'تحدث صوتياً مع داروين المدعوم بمحرك Fish Audio. يستمع لأوامرك، ينقلك لجميع المعامل الستة، ويشرح أي تجربة علمية.',
          en: 'Speak with Darwin powered by Fish Audio Voice Engine. Voice navigation across all 6 labs, smartboard, and instant scientific explanations.',
          fr: 'Parlez avec Darwin propulsé par Fish Audio. Navigation vocale dans les 6 laboratoires et explications.',
          de: 'Sprechen Sie mit Darwin über die Fish Audio Engine. Sprachnavigation durch alle 6 Labore.',
          ja: 'Fish Audio音声エンジン搭載のダーウィンと直接会話できます。6つの実験室への瞬時移動とリアルタイム科学解説。',
        })}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVoiceMuted((prev) => !prev)}
              className={`sn-btn sn-btn-sm !h-8 px-2.5 text-[11px] font-semibold border ${
                voiceMuted
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
              title={voiceMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
            >
              {voiceMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span className="hidden sm:inline">{voiceMuted ? (ar ? 'صوت صامت' : 'Muted') : (ar ? 'صوت داروين مفعل' : 'Voice Active')}</span>
            </button>

            <span className="sn-badge sn-badge-green flex items-center gap-1.5 !text-[11px]">
              <Radio size={12} className="animate-pulse text-emerald-600" />
              <span>Fish Audio Engine</span>
            </span>

            <button
              type="button"
              onClick={clearChat}
              className="sn-btn sn-btn-outline sn-btn-sm text-[11px]"
              title={ar ? 'مسح المحادثة' : 'Clear chat'}
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">{tLang(language, { ar: 'مسح', en: 'Clear', fr: 'Effacer', de: 'Löschen', ja: '消去' })}</span>
            </button>
          </div>
        }
      />

      {/* Voice Wave Visualizer Banner */}
      <div className="mb-5 rounded-[22px] bg-gradient-to-r from-[#0c0e14] via-[#141926] to-[#0c0e14] p-4 text-white border border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Mic size={22} className={isListening ? 'animate-bounce text-red-400' : ''} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
              <Radio size={11} className="animate-pulse" />
              <span>FISH AUDIO AGENT 929A18F3 · DARWIN</span>
            </div>
            <h3 className="text-[14px] font-bold text-white">
              {isListening
                ? tLang(language, { ar: '🎙️ داروين يستمع إلى صوتك الآن... تحدث بحرية!', en: '🎙️ Darwin is listening to your voice... Speak freely!', fr: '🎙️ Darwin écoute votre voix...', de: '🎙️ Darwin hört zu...', ja: '🎙️ ダーウィンが音声を聞き取っています...' })
                : tLang(language, { ar: 'التحكم الصوتي الشامل وتوجيه المعامل والمنصة', en: 'Full Voice Platform & Laboratory Navigation', fr: 'Navigation vocale complète de la plateforme', de: 'Vollständige Sprachsteuerung der Plattform', ja: 'プラットフォームと実験室の全自動音声制御' })}
            </h3>
          </div>
        </div>

        {/* Animated Equalizer Wave */}
        <div className="flex items-center gap-1.5 h-8 px-4 py-1 rounded-xl bg-white/5 border border-white/10">
          {[40, 75, 55, 95, 60, 80, 45, 90, 65, 50, 85, 70].map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-200 ${
                isListening ? 'bg-cyan-400 animate-pulse' : 'bg-white/40'
              }`}
              style={{
                height: isListening ? `${Math.max(15, Math.round(h * Math.random()))}%` : `${h * 0.4}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_310px]">
        {/* ── Main Chat Window ── */}
        <div className="flex flex-col h-[620px] rounded-3xl border border-[#e2e8f0] bg-white shadow-sm overflow-hidden">
          {/* Chat Header Status */}
          <div className="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-3.5 bg-[#f8fafc]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
                <Bot size={18} strokeWidth={2} />
              </span>
              <div>
                <div className="text-[12px] font-bold text-[#0f172a] leading-none">
                  {tLang(language, { ar: 'داروين • مرشد العلوم والصوت', en: 'Darwin Voice AI', fr: 'Darwin Vocal IA', de: 'Darwin Sprach-KI', ja: 'ダーウィン音声AI' })}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{tLang(language, { ar: 'متصل ومستعد للملاحة الفورية', en: 'Connected & ready for live navigation', fr: 'Connecté et prêt', de: 'Verbunden & bereit', ja: '接続完了・即時応答可能' })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider">
                ISEF 2026 Engine
              </span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[12px] ${
                      isUser
                        ? 'bg-[#0f172a] text-white'
                        : m.reprimand
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-cyan-500/10 text-cyan-600'
                    }`}
                  >
                    {isUser ? <User size={15} /> : m.reprimand ? <ShieldAlert size={16} /> : <Bot size={16} />}
                  </span>

                  <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                    <div
                      className={`p-3.5 rounded-2xl text-[12.5px] leading-relaxed ${
                        isUser
                          ? 'bg-[#0f172a] text-white rounded-se-none'
                          : m.reprimand
                          ? 'bg-amber-50 text-amber-950 rounded-ss-none border border-amber-200 font-medium'
                          : 'bg-[#f1f5f9] text-[#1e293b] rounded-ss-none border border-[#e2e8f0]'
                      }`}
                    >
                      {m.text}
                    </div>

                    {/* Lab Link if provided */}
                    {m.link && (
                      <button
                        type="button"
                        onClick={() => navigate(m.link!.to)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0369a1] text-[11px] font-bold transition-colors border border-[#bae6fd]"
                      >
                        <Compass size={13} />
                        <span>{ar ? m.link.labelAr : m.link.labelEn}</span>
                        <ArrowRight size={12} className={ar ? 'rotate-180' : ''} />
                      </button>
                    )}

                    {/* Suggestions Chips */}
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {m.suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => processCommand(s)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#cbd5e1] hover:border-cyan-600 hover:text-cyan-700 text-[#475569] text-[10.5px] font-medium transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
                  <Bot size={16} />
                </span>
                <div className="p-3 rounded-2xl bg-[#f1f5f9] text-[#64748b] text-[11px] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-bounce [animation-delay:300ms]" />
                  <span className="ms-1.5">{ar ? 'داروين يحلل طلبك وينفذ...' : 'Darwin is executing...'}</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Bar with Mic button & Execute */}
          <div className="border-t border-[#e2e8f0] p-3 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                processCommand(input);
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20'
                }`}
                title={ar ? 'تحدث بالميكروفون' : 'Voice Input'}
              >
                <Mic size={18} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? ar
                      ? 'جارٍ الاستماع لصوتك عبر Fish Audio...'
                      : 'Listening to your voice...'
                    : tLang(language, {
                        ar: 'تحدث أو اكتب أمرك لداروين (مثال: انقلني لمعمل الكيمياء، اشرح قانون سنيل)...',
                        en: 'Speak or type command (e.g., Take me to Chemistry Lab, Explain Ohm law)...',
                        fr: 'Parlez ou écrivez à Darwin...',
                        de: 'Sprechen oder schreiben Sie an Darwin...',
                        ja: 'ダーウィンへ音声またはテキストで指示（例：化学実験室へ移動、オームの法則を解説）...',
                      })
                }
                className="h-11 flex-1 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-4 text-[13px] text-[#0f172a] outline-none transition-colors focus:border-cyan-600 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="h-11 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[12px] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <span>{tLang(language, { ar: 'تنفيذ', en: 'Execute', fr: 'Exécuter', de: 'Ausführen', ja: '実行' })}</span>
                <Send size={14} className={ar ? 'rotate-180' : ''} />
              </button>
            </form>
          </div>
        </div>

        {/* ── Sidebar Quick Starters & Lab Control ── */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#0f172a] mb-3">
              <Sparkles size={16} className="text-cyan-600" />
              <span>{tLang(language, { ar: 'أوامر صوتية وملاحة سريعة', en: 'Quick Voice Actions', fr: 'Actions vocales rapides', de: 'Schnellaktionen', ja: '音声クイックコマンド' })}</span>
            </div>
            <div className="space-y-2">
              {[
                { labelAr: '🧪 انقلني لمعمل الكيمياء والتفاعلات', labelEn: 'Take me to Chemistry Lab', cmd: 'انقلني لمعمل الكيمياء', icon: FlaskConical },
                { labelAr: '🫀 افتح أطلس التشريح البشري 3D', labelEn: 'Open 3D Anatomy Atlas', cmd: 'انقلني لأطلس التشريح', icon: Activity },
                { labelAr: '⚡ انقلني لمعمل الفيزياء والدوائر', labelEn: 'Go to Physics & Circuits Lab', cmd: 'انقلني للفيزياء', icon: Atom },
                { labelAr: '🪐 افتح مرصد كبلر والمجموعة الشمسية', labelEn: 'Open Kepler Astronomy Lab', cmd: 'انقلني للفلك', icon: Compass },
                { labelAr: '🎨 افتح السبورة التفاعلية للشرح', labelEn: 'Open Smartboard Classroom', cmd: 'افتح السبورة', icon: Presentation },
                { labelAr: '⚙️ صفحة إعدادات الحساب', labelEn: 'Account Settings', cmd: 'افتح الإعدادات', icon: Settings },
              ].map((q) => {
                const Icon = q.icon;
                return (
                  <button
                    key={q.labelEn}
                    type="button"
                    onClick={() => processCommand(q.cmd)}
                    className="w-full p-2.5 rounded-xl border border-[#f1f5f9] bg-[#f8fafc] hover:bg-cyan-50 hover:border-cyan-200 text-start transition-all flex items-center gap-2.5 text-[11.5px] font-medium text-[#334155] hover:text-cyan-700"
                  >
                    <Icon size={14} className="shrink-0 text-cyan-600" />
                    <span className="truncate">{ar ? q.labelAr : q.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm text-[11px] text-[#64748b] space-y-2">
            <div className="font-bold text-[#0f172a] flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>{tLang(language, { ar: 'معايير النزاهة العلمية', en: 'Scientific Standards', fr: 'Normes scientifiques', de: 'Wissenschaftliche Standards', ja: '科学的基準と安全性' })}</span>
            </div>
            <p className="leading-relaxed">
              {tLang(language, {
                ar: 'جميع الشروحات المعملية معتمدة وفق مناهج وزارة التربية والتعليم المصرية ومصطلحات IUPAC وأطلس Z-Anatomy العالمي.',
                en: 'All laboratory explanations adhere to Egyptian Ministry curricula, IUPAC standards, and Z-Anatomy medical references.',
                fr: 'Explications conformes aux programmes du Ministère et aux normes IUPAC.',
                de: 'Laborerklärungen entsprechen den Lehrplänen des Ministeriums und IUPAC-Standards.',
                ja: '解説はエジプト教育省カリキュラム、IUPAC標準、およびZ-Anatomy医療リファレンスに準拠しています。',
              })}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AssistantPage;
