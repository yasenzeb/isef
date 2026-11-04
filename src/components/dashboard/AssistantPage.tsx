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
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: ar
          ? 'أهلًا بك. أنا المساعد المحلي في وضع الاختبار. أجيبي مكتوب مسبقًا ولا أتصل بأي خدمة خارجية. اسألني عن معمل، أو درس، أو تقدمك.'
          : 'Welcome. I am the local assistant in test mode. My answers are pre-written and I make no external calls. Ask me about a lab, a lesson, or your progress.',
      },
    ]);
  }, [ar]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

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
          ? 'تم مسح المحادثة. اسألني عن أي معمل أو درس.'
          : 'Conversation cleared. Ask me about any lab or lesson.',
      },
    ]);
  };

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'المساعد · وضع اختبار محلي' : 'Assistant · local test mode'}
        title={ar ? 'اسأل المرصد.' : 'Ask the observatory.'}
        subtitle={
          ar
            ? 'مساعد نصي محلي بإجابات مكتوبة مسبقًا. لا يوجد اتصال بأي نموذج خارجي، ولا مفاتيح، ولا شبكة.'
            : 'A local text assistant with pre-written answers. There is no external model, no keys and no network.'
        }
        actions={
          <>
            <span className="sn-badge sn-badge-soft">
              <WifiOff size={11} strokeWidth={1.8} />
              {ar ? 'بدون شبكة' : 'No network'}
            </span>
            <span className="sn-badge sn-badge-outline">TEST MODE</span>
            <button type="button" onClick={clear} className="sn-btn sn-btn-outline sn-btn-sm">
              <Trash2 size={13} strokeWidth={1.8} />
              {ar ? 'مسح' : 'Clear'}
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Chat */}
        <section className="sn-card flex min-h-[560px] flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[#f0f0f0] px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#eff6ff] text-[#1d4ed8]">
                <Sparkles size={15} strokeWidth={1.8} />
              </span>
              <div>
                <div className="text-[13px] font-semibold">SciNexa Assistant</div>
                <div className="text-[10px] text-[#737373]">
                  {ar ? 'إجابات محلية مكتوبة مسبقًا' : 'Pre-written local answers'}
                </div>
              </div>
            </div>
            <span className="sn-badge sn-badge-soft !text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#047857]" />
              {ar ? 'جاهز' : 'Ready'}
            </span>
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
            <p className="mt-2 text-[9px] text-[#a3a3a3]">
              {ar
                ? 'إجابات مكتوبة مسبقًا لأغراض العرض. لا تُرسل أي بيانات.'
                : 'Pre-written answers for demonstration. No data is transmitted.'}
            </p>
          </div>
        </section>

        {/* Side */}
        <aside className="space-y-3">
          <div className="sn-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck size={14} strokeWidth={1.8} className="text-[#047857]" />
              <span className="text-[12px] font-semibold">{ar ? 'كيف يعمل؟' : 'How it works'}</span>
            </div>
            <ul className="space-y-2.5 text-[11px] leading-relaxed text-[#737373]">
              {(ar
                ? [
                    'مطابقة كلمات مفتاحية داخل المتصفح.',
                    'إجابات ثابتة لكل موضوع علمي.',
                    'لا يوجد Backend أو مفاتيح API.',
                  ]
                : [
                    'Keyword matching inside the browser.',
                    'A fixed answer per science topic.',
                    'No backend and no API keys.',
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
              <span className="text-[12px] font-semibold">{ar ? 'جرب أن تسأل' : 'Try asking'}</span>
            </div>
            <div className="space-y-1">
              {(ar
                ? ['ما هو أطلس التشريح؟', 'اشرح قانون أوم', 'كيف يعمل المنهج؟', 'اعرض تقدمي']
                : ['What is the anatomy atlas?', 'Explain Ohm law', 'How does the curriculum work?', 'Show my progress']
              ).map((line) => (
                <button
                  key={line}
                  type="button"
                  onClick={() => send(line)}
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
              <span className="text-[12px] font-semibold">{ar ? 'الحالة' : 'Status'}</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">{ar ? 'الوضع' : 'Mode'}</span>
                <span className="sn-badge sn-badge-soft !text-[9px]">LOCAL / TEST</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">{ar ? 'الشبكة' : 'Network'}</span>
                <span className="inline-flex items-center gap-1.5 text-[#047857]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#047857]" />
                  {ar ? 'غير مستخدمة' : 'Unused'}
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
