import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { answerLocally, STARTERS, type LocalReply } from '../../lib/localAI';
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
  Layers
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  link?: NonNullable<LocalReply['link']>;
  suggestions?: string[];
}

export const AssistantPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message in current language
  useEffect(() => {
    const welcomeText = ar
      ? 'أهلاً بك يا بطل! أنا داروين • مرشدك العلمي الذكي المباشر في منصة SciNexa. أعمل محلياً بالكامل ومتاح حتى دون اتصال بالإنترنت. اسألني عن أي تجربة معملية، أو قانون فيزيائي، أو تفاعل كيميائي، أو تركيب تشريحي.'
      : language === 'fr'
        ? 'Bienvenue! Je suis Darwin, votre assistant scientifique local dans SciNexa. Entièrement hors ligne. Posez-moi des questions sur les laboratoires ou les leçons.'
        : language === 'de'
          ? 'Willkommen! Ich bin Darwin, Ihr lokaler wissenschaftlicher Assistent in SciNexa. Funktioniert vollständig offline. Fragen Sie mich nach Laboren oder Formeln.'
          : 'Welcome! I am Darwin, your local scientific AI guide in SciNexa. Operating completely offline and locally. Ask me about any 3D lab, formula, or curriculum experiment.';

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: welcomeText,
        suggestions: ar
          ? ['ما هو قانون أوم؟', 'كيف يعمل أطلس التشريح؟', 'ما هي مكونات الخلية النباتية؟', 'اشرح انكسار الضوء وقانون سنيل']
          : ['Explain Ohm’s law', 'How does the Anatomy Atlas work?', 'Plant cell organelles', 'Explain light refraction'],
      },
    ]);
  }, [language, ar]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || typing) return;
    setInput('');

    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', text: value };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      const reply = answerLocally(value, ar);
      const replyText = ar
        ? reply.textAr
        : language === 'fr'
          ? reply.textEn // localAI fallback to clean English
          : reply.textEn;

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
    }, 280);
  };

  const clearChat = () => {
    const welcomeText = ar
      ? 'تم مسح المحادثة. أنا جاهز لأي استفسار علمي جديد!'
      : 'Chat cleared. Ready for your next scientific inquiry!';
    setMessages([{ id: `w_${Date.now()}`, role: 'assistant', text: welcomeText }]);
  };

  return (
    <div dir={ar ? 'rtl' : 'ltr'}>
      <PageHeader
        eyebrow={ar ? 'المرشد العلمي الذكي' : 'Local Science Assistant'}
        title={ar ? 'داروين • المساعد العلمي المحلي الذكي' : 'Darwin • Local AI Science Guide'}
        subtitle={
          ar
            ? 'مساعد علمي مدمج يعمل محلياً في متصفحك دون اتصال بالإنترنت، يقدم شروحات معملية فورية ويوجهك للتجارب المناسبة.'
            : 'Built-in local scientific assistant working 100% offline without network calls. Instant explanations for all 6 laboratories.'
        }
        actions={
          <div className="flex items-center gap-2">
            <span className="sn-badge sn-badge-green flex items-center gap-1.5 !text-[11px]">
              <WifiOff size={12} />
              <span>{ar ? 'يعمل دون إنترنت (Offline)' : 'Offline Ready'}</span>
            </span>
            <button
              type="button"
              onClick={clearChat}
              className="sn-btn sn-btn-outline sn-btn-sm text-[11px]"
              title={ar ? 'مسح المحادثة' : 'Clear chat'}
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">{ar ? 'مسح' : 'Clear'}</span>
            </button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_310px]">
        {/* ── Main Chat Window ── */}
        <div className="flex flex-col h-[600px] rounded-3xl border border-[#e2e8f0] bg-white shadow-sm overflow-hidden">
          {/* Chat Header Status */}
          <div className="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-3.5 bg-[#f8fafc]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
                <Bot size={18} strokeWidth={2} />
              </span>
              <div>
                <div className="text-[12px] font-bold text-[#0f172a] leading-none">
                  {ar ? 'داروين • مرشد العلوم' : 'Darwin AI Guide'}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{ar ? 'جاهز للاستجابة الفورية' : 'Active & ready locally'}</span>
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
                        : 'bg-[#0284c7]/10 text-[#0284c7]'
                    }`}
                  >
                    {isUser ? <User size={15} /> : <Bot size={16} />}
                  </span>

                  <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                    <div
                      className={`p-3.5 rounded-2xl text-[12.5px] leading-relaxed ${
                        isUser
                          ? 'bg-[#0f172a] text-white rounded-se-none'
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
                            onClick={() => send(s)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#cbd5e1] hover:border-[#0284c7] hover:text-[#0284c7] text-[#475569] text-[10.5px] font-medium transition-colors"
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
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
                  <Bot size={16} />
                </span>
                <div className="p-3 rounded-2xl bg-[#f1f5f9] text-[#64748b] text-[11px] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0284c7] animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0284c7] animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0284c7] animate-bounce [animation-delay:300ms]" />
                  <span className="ms-1.5">{ar ? 'داروين يكتب الإجابة...' : 'Darwin is preparing answer...'}</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-[#e2e8f0] p-3 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  ar
                    ? 'اكتب سؤالك العلمي هنا (مثال: اشرح قانون أوم، أو كيف تعمل الخلية)...'
                    : 'Ask any science question (e.g., Explain Ohm law, or how cells work)...'
                }
                className="h-11 flex-1 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-4 text-[13px] text-[#0f172a] outline-none transition-colors focus:border-[#0284c7] focus:bg-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="h-11 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[12px] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <span>{ar ? 'إرسال' : 'Send'}</span>
                <Send size={14} className={ar ? 'rotate-180' : ''} />
              </button>
            </form>
          </div>
        </div>

        {/* ── Sidebar Quick Starters ── */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#0f172a] mb-3">
              <Sparkles size={16} className="text-amber-500" />
              <span>{ar ? 'استفسارات علمية جاهزة' : 'Quick Scientific Inquiries'}</span>
            </div>
            <div className="space-y-2">
              {[
                { labelAr: 'قانون أوم والدوائر الكهربائية', labelEn: 'Ohm’s law and DC circuits', icon: Atom },
                { labelAr: 'أطلس التشريح البشري والأجهزة', labelEn: 'Human Anatomy 3D Atlas', icon: Activity },
                { labelAr: 'الجدول الدوري وعناصر IUPAC', labelEn: 'IUPAC Periodic Table', icon: FlaskConical },
                { labelAr: 'الخلية النباتية والميتوكوندريا', labelEn: 'Plant cell and mitochondria', icon: Dna },
                { labelAr: 'الموجات الزلزالية وطبقات الأرض', labelEn: 'Seismic waves and Earth crust', icon: Globe2 },
                { labelAr: 'مدارات الكواكب والمجموعة الشمسية', labelEn: 'Kepler orbits & solar system', icon: Compass },
              ].map((q) => {
                const Icon = q.icon;
                return (
                  <button
                    key={q.labelEn}
                    type="button"
                    onClick={() => send(ar ? q.labelAr : q.labelEn)}
                    className="w-full p-2.5 rounded-xl border border-[#f1f5f9] bg-[#f8fafc] hover:bg-[#e0f2fe] hover:border-[#bae6fd] text-start transition-all flex items-center gap-2.5 text-[11.5px] font-medium text-[#334155] hover:text-[#0369a1]"
                  >
                    <Icon size={14} className="shrink-0 text-[#0284c7]" />
                    <span className="truncate">{ar ? q.labelAr : q.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm text-[11px] text-[#64748b] space-y-2">
            <div className="font-bold text-[#0f172a] flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>{ar ? 'معايير النزاهة العلمية' : 'Scientific Standards'}</span>
            </div>
            <p className="leading-relaxed">
              {ar
                ? 'جميع الإجابات مستندة إلى مراجع IUPAC والكتب المعتمدة لوزارة التربية والتعليم المصرية وأطلس Z-Anatomy.'
                : 'All answers verified according to IUPAC, Egyptian Ministry curricula, and Z-Anatomy standards.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
