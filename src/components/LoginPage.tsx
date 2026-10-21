/**
 * LoginPage.tsx
 * Beautiful, branded Microsoft-only login page for SciNexa.
 * No username/password fields — 100% delegated to Microsoft Entra ID.
 * Reads ?error= param to show friendly error messages.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Ministry-issued domain hint for Microsoft's login UI
const TENANT_DOMAIN_HINT = 'edu.eg';

const ERROR_MESSAGES: Record<string, string> = {
  csrf_mismatch:         'فشل التحقق الأمني. يرجى المحاولة مجدداً.',
  missing_verifier:      'انتهت صلاحية جلسة تسجيل الدخول. يرجى المحاولة مجدداً.',
  token_exchange_failed: 'فشل التواصل مع خوادم مايكروسوفت. يرجى المحاولة لاحقاً.',
  graph_failed:          'تعذّر جلب بيانات الحساب من مايكروسوفت.',
  server_error:          'خطأ داخلي في الخادم. يرجى التواصل مع الدعم الفني.',
  access_denied:         'تم رفض الوصول. يرجى استخدام حساب المدرسة الرسمي.',
};

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err    = params.get('error');
    if (err) {
      setErrorMsg(ERROR_MESSAGES[err] || `خطأ: ${err}`);
    }
  }, []);

  // If already authenticated, this page won't render (AuthGuard handles it)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090a0d]">
        <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `
          radial-gradient(circle at 20% 10%, rgba(79,140,255,.15), transparent 40%),
          radial-gradient(circle at 80% 90%, rgba(124,92,255,.15), transparent 40%),
          #090a0d
        `,
        fontFamily: '"Segoe UI", system-ui, -apple-system, Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#12141a',
          border: '1px solid #262a35',
          borderRadius: 16,
          padding: '36px 28px',
          boxShadow: '0 20px 50px rgba(0,0,0,.55)',
          color: '#e8eaf0',
          textAlign: 'center',
        }}
      >
        {/* Logo area */}
        <div style={{ marginBottom: 8, fontSize: 38, lineHeight: 1 }}>🔬</div>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.7rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
          SciNexa
        </h1>
        <p style={{ margin: '0 0 28px', color: '#8b90a0', fontSize: '0.92rem' }}>
          المنصة التعليمية العلمية التفاعلية
        </p>

        {/* Error banner */}
        {errorMsg && (
          <div
            dir="rtl"
            style={{
              background: 'rgba(248,113,113,.12)',
              border: '1px solid rgba(248,113,113,.35)',
              borderRadius: 10,
              padding: '11px 14px',
              marginBottom: 20,
              color: '#fca5a5',
              fontSize: '0.88rem',
              lineHeight: 1.5,
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Microsoft login button */}
        <button
          onClick={login}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            width: '100%',
            padding: '14px 20px',
            background: '#2f7fe8',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background .2s, transform .15s',
            marginBottom: 16,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1a6fd8')}
          onMouseLeave={e => (e.currentTarget.style.background = '#2f7fe8')}
          onMouseDown={e  => (e.currentTarget.style.transform  = 'scale(.98)')}
          onMouseUp={e    => (e.currentTarget.style.transform  = 'scale(1)')}
        >
          {/* Microsoft Logo (SVG) */}
          <svg width="20" height="20" viewBox="0 0 21 21" aria-hidden="true">
            <rect x="1"  y="1"  width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1"  width="9" height="9" fill="#7fba00"/>
            <rect x="1"  y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          تسجيل الدخول بحساب المدرسة
        </button>

        {/* Info text */}
        <div
          dir="rtl"
          style={{
            background: 'rgba(79,140,255,.08)',
            border: '1px solid rgba(79,140,255,.2)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 20,
            fontSize: '0.83rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            textAlign: 'right',
          }}
        >
          <strong style={{ color: '#93c5fd' }}>🔒 تسجيل الدخول آمن تماماً</strong><br />
          استخدم إيميلك الرسمي الصادر من وزارة التربية والتعليم.<br />
          لا نقوم بتخزين كلمات المرور — المصادقة تتم عبر مايكروسوفت مباشرةً.
        </div>

        {/* Supported roles */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: '🎓', label: 'طالب' },
            { icon: '👨‍🏫', label: 'معلم' },
            { icon: '🏫', label: 'مدير مدرسة' },
            { icon: '🏛️', label: 'إدارة' },
          ].map(({ icon, label }) => (
            <span
              key={label}
              style={{
                padding: '5px 12px',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid #262a35',
                borderRadius: 20,
                fontSize: '0.8rem',
                color: '#8b90a0',
              }}
            >
              {icon} {label}
            </span>
          ))}
        </div>

        {/* Footer note */}
        <p style={{ marginTop: 24, fontSize: '0.75rem', color: '#565b6b' }}>
          بتسجيل دخولك، أنت توافق على{' '}
          <a href="/privacy" style={{ color: '#4f8cff', textDecoration: 'none' }}>سياسة الخصوصية</a>
          {' '}و{' '}
          <a href="/terms" style={{ color: '#4f8cff', textDecoration: 'none' }}>شروط الاستخدام</a>
        </p>
      </div>
    </div>
  );
};
