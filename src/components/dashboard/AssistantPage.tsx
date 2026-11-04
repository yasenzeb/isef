import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
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
  Radio,
  ExternalLink,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  link?: NonNullable<LocalReply['link']>;
}

export const AssistantPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [activeTab, setActiveTab] = useState<'fish' | 'local'>('fish');
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const fishContainerRef = useRef<HTMLDivElement>(null);

  // Mount Fish Audio element dynamically if not yet attached
  useEffect(() => {
    if (activeTab !== 'fish' || !fishContainerRef.current) return;

    // Load widget script if not already present
    if (!document.querySelector('script[src*="agent-widget-embed"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@fishaudio/agent-widget-embed';
      script.async = true;
      document.body.appendChild(script);
    }

    // Mount fish-agent custom element
    const container = fishContainerRef.current;
    if (!container.querySelector('fish-agent')) {
      const el = document.createElement('fish-agent');
      el.setAttribute('agent-id', '929a1bf391db4185b03ae62f05a49207');
      el.setAttribute('language', ar ? 'ar' : 'en');
      el.setAttribute(
        'greeting',
        ar
          ? 'أهلاً بك يا بطل! أنا داروين مرشدك العلمي في منصة SciNexa، جاهز للإجابة عن أسئلتك ومساعدتك في المعامل.'
          : 'Welcome! I am Darwin, your science guide in SciNexa. Ready to answer your questions and assist you across all labs.'
      );
      el.style.width = '100%';
      el.style.minHeight = '480px';
      el.style.display = 'block';
      container.appendChild(el);
    }
  }, [activeTab, ar]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: ar
          ? 'أهلًا بك في وضع الاختبار المحلي. أجيبي مكتوبة مسبقًا وتعمل حتى دون اتصال بالشبكة. اسألني عن أي معمل أو تجربة.'
          : 'Welcome to local test mode. My answers are pre-written and work without network connectivity. Ask me about any lab or lesson.',
      },
    ]);
  }, [ar]);

  useEffect(() => {
    if (activeTab === 'local') {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, typing, activeTab]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || typing) return;
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: `u_${Date.now()}`, role: 'user', text: value },
    ]);
    setTyping(true);

    window.setTimeout(() => {
      const reply = answerLocally(value, ar);
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: ar ? reply.textAr : reply.textEn,
          link: reply.link,
        },
      ]);
      setTyping(false);
    }, 420);
  };

  const clear = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        text: ar
          ? 'تم مسح المحادثة المحلية. اسألني عن أي معمل أو درس.'
          : 'Local conversation cleared. Ask me about any lab or lesson.',
      },
    ]);
  };

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'المرشد العلمي' : 'Science Assistant'}
        title={ar ? 'داروين · وكيل الذكاء الاصطناعي العلمي.' : 'Darwin · Science AI Agent.'}
        subtitle={
          ar
            ? 'تحدث صوتيًا مع داروين المدعوم بمحرك Fish Audio المتصل بمعامل المنصة، أو استخدم المساعد المحلي دون شبكة.'
            : 'Speak with Darwin powered by Fish Audio, or use the local text assistant offline.'
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="sn-segmented">
              <button
                type="button"
                onClick={() => setActiveTab('fish')}
                className={`sn-segment ${activeTab === 'fish' ? 'active' : ''}`}
              >
                <Radio size={12} strokeWidth={2} className="inline me-1" />
                {ar ? 'وكيل Fish Audio' : 'Fish Audio Agent'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('local')}
                className={`sn-segment ${activeTab === 'local' ? 'active' : ''}`}
              >
                <WifiOff size={12} strokeWidth={2} className="inline me-1" />
                {ar ? 'المساعد المحلي' : 'Offline Local'}
              </button>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Main Panel */}
        {activeTab === 'fish' ? (
          <section className="sn-card flex min-h-[560px] flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[#f0f0f0] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#eff6ff] text-[#1d4ed8]">
                  <Bot size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <div className="text-[13px] font-semibold">داروين | Fish Audio Agent</div>
                  <div className="text-[10px] text-[#737373]">
                    {ar ? 'وكيل صوتي ذكي مباشر للعلوم والمعامل' : 'Live interactive science voice agent'}
                  </div>
                </div>
              </div>
              <span className="sn-badge sn-badge-green !text-[10px]">
                <span className="sn-live-dot h-1.5 w-1.5 rounded-full bg-[#047857]" />
                {ar ? 'متصل' : 'Online'}
              </span>
            </div>

            {/* Fish Audio Element Stage */}
            <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 bg-[#0a0a0a] text-white rounded-b-[18px]">
              <div className="mb-4 w-full flex items-center justify-between border-b border-white/10 pb-3 text-[11px] text-white/60">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#38bdf8] animate-ping" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#38bdf8]">
                    Fish Audio Engine 929a1bf3
                  </span>
                </div>
                <span className="text-[10px] text-white/40">ISEF 2026 · SciNexa</span>
              </div>

              {/* Custom Fish Audio Container */}
              <div
                ref={fishContainerRef}
                className="w-full flex-1 min-h-[460px] flex flex-col items-center justify-center rounded-2xl bg-[#12141c]/90 border border-white/10 p-4 shadow-2xl relative"
              />

              <p className="mt-4 text-center text-[11px] text-white/50">
                {ar
                  ? 'يمكنك التحدث صوتيًا مع داروين وسؤاله عن أي ظاهرة فيزيائية أو تفاعل كيميائي أو تركيب تشريحي.'
                  : 'You can talk with Darwin directly and ask about physics formulas, reactions, or anatomy.'}
              </p>
            </div>
          </section>
        ) : (
          /* Local Text Chat */
          <section className="sn-card flex min-h-[560px] flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[#f0f0f0] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f5f5f5] text-[#0a0a0a]">
                  <Sparkles size={15} strokeWidth={1.8} />
                </span>
                <div>
                  <div className="text-[13px] font-semibold">SciNexa Local Assistant</div>
                  <div className="text-[10px] text-[#737373]">
                    {ar ? 'إجابات محلية دون إنترنت' : 'Offline local answers'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="sn-badge sn-badge-soft !text-[10px]">
                  <WifiOff size={10} strokeWidth={1.8} />
                  {ar ? 'بدون شبكة' : 'Offline'}
                </span>
                <button type="button" onClick={clear} className="sn-btn sn-btn-outline sn-btn-sm !h-7 !px-2">
                  <Trash2 size={12} strokeWidth={1.8} />
                  {ar ? 'مسح' : 'Clear'}
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
              {messages.map((message) => {
                const mine = message.role === 'user';
                return (
                  <div key={message.id} className={`flex items-start gap-2.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                    {!mine && (
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-white">
                        <Sparkles size={12} strokeWidth={1.9} />
                      </span>
                    )}

                    <div className={`max-w-[82%] ${mine ? 'order-first' : ''}`}>
                      <div
                        className={`rounded-[14px] px-3.5 py-2.5 text-[12.5px] leading-[1.65] ${
                          mine
                            ? 'bg-[#0a0a0a] text-white'
                            : 'border border-[#e5e5e5] bg-[#fafafa] text-[#171717]'
                        }`}
                      >
                        {message.text}
                      </div>

                      {message.link && (
                        <button
                          type="button"
                          onClick={() => navigate(message.link!.to)}
                          className="sn-link mt-2 !text-[11px]"
                        >
                          {ar ? message.link.labelAr : message.link.labelEn}
                          <ArrowRight size={12} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
                        </button>
                      )}

                      <div className={`mt-1 text-[9px] text-[#a3a3a3] ${mine ? 'text-end' : ''}`}>
                        {mine ? (ar ? 'أنت' : 'You') : ar ? 'مساعد محلي' : 'Local assistant'}
                      </div>
                    </div>

                    {mine && (
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#737373]">
                        <User size={12} strokeWidth={1.9} />
                      </span>
                    )}
                  </div>
                );
              })}

              {typing && (
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-white">
                    <Sparkles size={12} strokeWidth={1.9} />
                  </span>
                  <div className="flex items-center gap-1 rounded-[14px] border border-[#e5e5e5] bg-[#fafafa] px-3.5 py-3">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a3a3a3]"
                        style={{ animationDelay: `${dot * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            <div className="border-t border-[#f0f0f0] p-3 sm:p-4">
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {(ar ? STARTERS.map((s) => s.ar) : STARTERS.map((s) => s.en)).map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => send(starter)}
                    className="rounded-full border border-[#e5e5e5] bg-white px-2.5 py-1 text-[10px] font-medium text-[#737373] transition-colors hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
                  >
                    {starter}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={
                    ar ? 'اكتب سؤالًا عن معمل أو درس…' : 'Ask about a lab or a lesson…'
                  }
                  aria-label={ar ? 'رسالة المساعد' : 'Assistant message'}
                  className="sn-input !h-10 flex-1"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  className="sn-btn sn-btn-primary sn-btn-icon !h-10 !w-10"
                  aria-label={ar ? 'إرسال' : 'Send'}
                >
                  <Send size={15} strokeWidth={1.9} className={ar ? 'rotate-180' : ''} />
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Side Panel */}
        <aside className="space-y-3">
          <div className="sn-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck size={14} strokeWidth={1.8} className="text-[#047857]" />
              <span className="text-[12px] font-semibold">{ar ? 'معلومات الوكيل' : 'Agent details'}</span>
            </div>
            <ul className="space-y-2.5 text-[11px] leading-relaxed text-[#737373]">
              {(ar
                ? [
                    'داروين مدعوم بوكيل Fish Audio الرسمي.',
                    'يتعرف على أسئلتك العلمية فورًا بالصوت أو النص.',
                    'يعمل كمرشد تفاعلي لجميع معامل المنصة الستة.',
                  ]
                : [
                    'Darwin is powered by official Fish Audio agent.',
                    'Understands scientific voice and text questions in real time.',
                    'Acts as an interactive mentor across all 6 platform labs.',
                  ]
              ).map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#0a0a0a]" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="sn-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare size={14} strokeWidth={1.8} className="text-[#737373]" />
              <span className="text-[12px] font-semibold">{ar ? 'أسئلة مقترحة لداروين' : 'Try asking'}</span>
            </div>
            <div className="space-y-1">
              {(ar
                ? ['ما هي مكونات الهيكل العظمي؟', 'كيف يتم اختزال أكاسيد النحاس بالهيدروجين؟', 'اشرح قانون أوم بالتفصيل', 'ما هي قوانين كبلر لحركة الكواكب؟']
                : ['What makes up the skeletal system?', 'How is copper oxide reduced by hydrogen?', 'Explain Ohm law in detail', 'What are Kepler laws of planetary motion?']
              ).map((line) => (
                <button
                  key={line}
                  type="button"
                  onClick={() => {
                    setActiveTab('local');
                    send(line);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-[8px] px-2 py-1.5 text-start text-[11px] text-[#737373] hover:bg-[#fafafa] hover:text-[#0a0a0a]"
                >
                  <span>{line}</span>
                  <ArrowRight size={11} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
                </button>
              ))}
            </div>
          </div>

          <div className="sn-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <FlaskConical size={14} strokeWidth={1.8} className="text-[#737373]" />
              <span className="text-[12px] font-semibold">{ar ? 'حالة النظام' : 'System status'}</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">{ar ? 'المحرك الصوتي' : 'Voice engine'}</span>
                <span className="font-mono text-[#047857]">Fish Audio Agent</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">{ar ? 'الوضع النشط' : 'Active mode'}</span>
                <span className="sn-badge sn-badge-soft !text-[9px]">
                  {activeTab === 'fish' ? 'FISH AUDIO' : 'OFFLINE LOCAL'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">{ar ? 'المستخدم' : 'User'}</span>
                <span className="max-w-[120px] truncate font-medium">{user?.name}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/labs')}
            className="sn-btn sn-btn-outline w-full sn-btn-sm"
          >
            <BookOpen size={13} strokeWidth={1.8} />
            {ar ? 'تصفح المعامل' : 'Browse labs'}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default AssistantPage;
