/**
 * LoginPage.tsx — SciNexa Secure Login
 * Two methods:
 *  1. 🔵 Microsoft OAuth (one-click, requires Supabase Azure config)
 *  2. 📧 Magic Link (works immediately with any ministry email)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isMinistryEmail } from '../lib/supabase';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type Stage = 'idle' | 'loading_ms' | 'loading_magic' | 'sent' | 'error';

const ROLE_EXAMPLES = [
  { icon: '🎓', ar: 'طالب',       hint: 'ahmed@students.cairo1.edu.eg' },
  { icon: '👨‍🏫', ar: 'معلم',        hint: 'mona@teachers.cairo1.edu.eg'  },
  { icon: '🏫', ar: 'مدير مدرسة', hint: 'admin@principal.cairo1.edu.eg' },
  { icon: '🏛️', ar: 'وزارة',      hint: 'staff@moe.gov.eg'             },
];

export const LoginPage: React.FC = () => {
  const { sendMagicLink, loginWithMicrosoft } = useAuth();

  const [email,  setEmail]  = useState('');
  const [stage,  setStage]  = useState<Stage>('idle');
  const [errMsg, setErrMsg] = useState('');

  // Read ?error= param from URL (OAuth redirect errors)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const e = p.get('error_description') || p.get('error');
    if (e) { setErrMsg(decodeURIComponent(e)); setStage('error'); }
  }, []);

  // ── Microsoft login ──────────────────────────────────────────────────────
  const handleMicrosoft = async () => {
    setStage('loading_ms');
    setErrMsg('');
    const { error } = await loginWithMicrosoft();
    if (error) { setErrMsg(error); setStage('error'); }
    // On success the page redirects — no further action needed
  };

  // ── Magic link ───────────────────────────────────────────────────────────
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (!email.trim()) {
      setErrMsg('يرجى إدخال بريدك الإلكتروني الوزاري.');
      setStage('error');
      return;
    }

    if (!isMinistryEmail(email)) {
      setErrMsg('هذا الإيميل غير مقبول — يجب أن يكون إيميلاً وزارياً (.edu.eg أو moe.gov.eg).');
      setStage('error');
      return;
    }

    setStage('loading_magic');
    const { error } = await sendMagicLink(email);

    if (error) {
      setErrMsg(error);
      setStage('error');
    } else {
      setStage('sent');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: `
        radial-gradient(circle at 20% 10%, rgba(79,140,255,.18), transparent 40%),
        radial-gradient(circle at 80% 90%, rgba(124,92,255,.18), transparent 40%),
        #090a0d`,
      fontFamily: '"Segoe UI", system-ui, -apple-system, Arial, sans-serif',
      direction: 'rtl',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: '#12141a',
        border: '1px solid #262a35',
        borderRadius: 20,
        padding: '36px 32px',
        boxShadow: '0 24px 60px rgba(0,0,0,.6)',
        color: '#e8eaf0',
      }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 8 }}>🔬</div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            SciNexa
          </h1>
          <p style={{ margin: 0, color: '#8b90a0', fontSize: '0.9rem' }}>
            المنصة التعليمية العلمية التفاعلية
          </p>
        </div>

        {/* ── Sent state ── */}
        {stage === 'sent' ? (
          <SentState email={email} onBack={() => { setStage('idle'); setEmail(''); }} />
        ) : (
          <>
            {/* ── Error banner ── */}
            {stage === 'error' && errMsg && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: 'rgba(248,113,113,.1)',
                border: '1px solid rgba(248,113,113,.3)',
                borderRadius: 12, padding: '12px 14px', marginBottom: 20,
                color: '#fca5a5', fontSize: '0.86rem', lineHeight: 1.5,
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{errMsg}</span>
              </div>
            )}

            {/* ── Microsoft button ── */}
            <button
              onClick={handleMicrosoft}
              disabled={stage === 'loading_ms' || stage === 'loading_magic'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, width: '100%', padding: '14px 20px',
                background: stage === 'loading_ms' ? '#1a6fd8' : '#2f7fe8',
                border: 'none', borderRadius: 12,
                color: '#fff', fontSize: '1rem', fontWeight: 700,
                cursor: 'pointer', transition: 'background .2s',
                marginBottom: 8,
                opacity: (stage === 'loading_magic') ? 0.5 : 1,
              }}
            >
              {stage === 'loading_ms' ? (
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <MicrosoftLogo />
              )}
              {stage === 'loading_ms' ? 'جاري الاتصال بمايكروسوفت...' : 'تسجيل الدخول بحساب المدرسة Microsoft'}
            </button>

            {/* MS note */}
            <p style={{ textAlign: 'center', color: '#565b6b', fontSize: '0.76rem', margin: '6px 0 16px' }}>
              يتطلب إعداد Azure من مدير المنصة — سيُفعَّل قريباً
            </p>

            {/* ── Divider ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              color: '#8b90a0', fontSize: '0.82rem', margin: '0 0 16px',
            }}>
              <div style={{ flex: 1, height: 1, background: '#262a35' }} />
              <span>أو سجّل بإيميلك الوزاري</span>
              <div style={{ flex: 1, height: 1, background: '#262a35' }} />
            </div>

            {/* ── Magic link form ── */}
            <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={17}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8b90a0' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (stage === 'error') setStage('idle'); }}
                  placeholder="ahmed@students.cairo1.edu.eg"
                  dir="ltr"
                  style={{
                    width: '100%', padding: '13px 44px 13px 14px',
                    background: '#0d0f14',
                    border: `1px solid ${stage === 'error' ? 'rgba(248,113,113,.5)' : '#262a35'}`,
                    borderRadius: 12, color: '#e8eaf0', fontSize: '0.95rem',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color .2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#4f8cff')}
                  onBlur={e  => (e.currentTarget.style.borderColor = stage === 'error' ? 'rgba(248,113,113,.5)' : '#262a35')}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={stage === 'loading_ms' || stage === 'loading_magic'}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, width: '100%', padding: '13px',
                  background: 'linear-gradient(135deg, #4f8cff, #7c5cff)',
                  border: 'none', borderRadius: 12,
                  color: '#fff', fontSize: '1rem', fontWeight: 700,
                  cursor: 'pointer',
                  opacity: stage === 'loading_magic' ? 0.8 : 1,
                  transition: 'opacity .2s',
                }}
              >
                {stage === 'loading_magic' ? (
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Send size={17} />
                )}
                {stage === 'loading_magic' ? 'جاري الإرسال...' : 'إرسال رابط الدخول على إيميلك'}
              </button>
            </form>

            {/* ── Roles info ── */}
            <div style={{
              marginTop: 20, padding: '14px',
              background: 'rgba(79,140,255,.07)',
              border: '1px solid rgba(79,140,255,.18)',
              borderRadius: 12,
            }}>
              <p style={{ margin: '0 0 10px', color: '#93c5fd', fontSize: '0.82rem', fontWeight: 600 }}>
                🔒 الأدوار تُكتشف تلقائياً من الإيميل:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ROLE_EXAMPLES.map(r => (
                  <div key={r.ar} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, textAlign: 'center' }}>{r.icon}</span>
                    <span style={{ color: '#8b90a0', fontSize: '0.78rem', minWidth: 70 }}>{r.ar}</span>
                    <span style={{ color: '#4b5563', fontSize: '0.72rem', direction: 'ltr', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.hint}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </>
        )}
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const MicrosoftLogo: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 21 21" aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="1"  y="1"  width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1"  width="9" height="9" fill="#7fba00"/>
    <rect x="1"  y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

const SentState: React.FC<{ email: string; onBack: () => void }> = ({ email, onBack }) => (
  <div style={{ textAlign: 'center' }}>
    <CheckCircle2 size={52} style={{ color: '#4ade80', margin: '0 auto 16px' }} />
    <h2 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: 700, color: '#4ade80' }}>
      تم إرسال الرابط! ✅
    </h2>
    <p style={{ color: '#8b90a0', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 6px' }}>
      تم إرسال رابط الدخول إلى:
    </p>
    <p style={{ color: '#93c5fd', fontWeight: 600, direction: 'ltr', fontSize: '0.95rem', margin: '0 0 20px' }}>
      {email}
    </p>

    <div style={{
      background: 'rgba(74,222,128,.08)',
      border: '1px solid rgba(74,222,128,.2)',
      borderRadius: 12, padding: '14px',
      color: '#86efac', fontSize: '0.85rem', lineHeight: 1.7,
      textAlign: 'right', marginBottom: 20,
    }}>
      📧 <strong>افتح بريدك الإلكتروني الآن</strong><br/>
      ستجد رسالة من SciNexa — اضغط على الرابط بداخلها<br/>
      الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط
    </div>

    <button
      onClick={onBack}
      style={{
        background: 'transparent',
        border: '1px solid #262a35',
        borderRadius: 10,
        color: '#8b90a0',
        padding: '10px 24px',
        cursor: 'pointer',
        fontSize: '0.88rem',
        width: '100%',
      }}
    >
      ← العودة وتغيير الإيميل
    </button>
  </div>
);
