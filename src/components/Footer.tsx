import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Atom, Shield, FileText, Copyright } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <footer
      style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#000000' }}
      className="text-slate-400 py-10 pb-36"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-7">

        {/* ── Brand Row ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-white/[0.06] pb-6">
          <div className="flex items-center gap-3">
            <div
              style={{
                borderRadius: '22.37%',
                background: 'linear-gradient(135deg, #007AFF, #5856D6)',
                boxShadow: '0 4px 16px rgba(0,122,255,0.3)',
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Atom className="w-5 h-5 text-white" />
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <span className="text-base font-black text-white block tracking-wider">SciNexa</span>
              <span className="text-xs text-slate-400 block">{t.appTagline}</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 max-w-md leading-relaxed">
            {t.footer.tagline}
          </div>
        </div>

        {/* ── Attribution & License ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400">
          <div>
            <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>{isAr ? 'إسناد البيانات العلمية والأصول' : 'Scientific Data & Assets Attribution'}</span>
            </h4>
            <p className="leading-relaxed">{t.footer.credits}</p>
            <p className="mt-1 text-[11px] text-slate-500">{t.footer.sources}</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#34C759]" />
              <span>{isAr ? 'التراخيص ونطاق الاستخدام الأكاديمي' : 'Licensing & Pedagogical Scope'}</span>
            </h4>
            <p className="leading-relaxed">{t.footer.license} {t.footer.disclaimer}</p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            ██  حقوق الملكية الفكرية الكاملة  ██
            ══════════════════════════════════════════════════════ */}
        <div
          style={{
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          className="p-4 space-y-3"
        >
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Copyright className="w-4 h-4 text-[#007AFF]" />
            {isAr ? 'حقوق الملكية الفكرية' : 'Intellectual Property Rights'}
          </h4>

          <div className="text-xs leading-relaxed space-y-2 text-slate-300">
            {isAr ? (
              <>
                <p>
                  <span className="text-white font-semibold">منصة SciNexa</span> — جميع حقوق الملكية الفكرية محفوظة لأصحابها:
                  <span className="text-[#007AFF] font-bold"> إسلام </span>و<span className="text-[#007AFF] font-bold"> ياسين</span>،
                  مشروع ISEF 2026.
                </p>
                <p>
                  يُحظر نسخ أو توزيع أو استخدام أي جزء من هذا البرنامج أو تصميمه أو بنيته التقنية أو محتواه العلمي لأغراض تجارية
                  أو أكاديمية دون إذن كتابي صريح من المؤلفين.
                </p>
                <p>
                  هذا المشروع محمي بموجب قوانين حقوق النشر الدولية (<span className="font-mono text-slate-300">Berne Convention</span>)
                  وقوانين الملكية الفكرية المصرية (قانون رقم 82 لسنة 2002).
                </p>
                <p className="text-slate-400">
                  يُسمح بالاستخدام الشخصي والتعليمي غير التجاري مع الإشارة الصريحة إلى المصدر والمؤلفين.
                </p>
              </>
            ) : (
              <>
                <p>
                  <span className="text-white font-semibold">SciNexa Platform</span> — All intellectual property rights reserved to:
                  <span className="text-[#007AFF] font-bold"> Islam </span>&amp;<span className="text-[#007AFF] font-bold"> Yaseen</span>,
                  ISEF 2026 Project.
                </p>
                <p>
                  Copying, distributing, or using any part of this software, its design, technical architecture, or scientific
                  content for commercial or academic purposes is strictly prohibited without explicit written permission from the authors.
                </p>
                <p>
                  This project is protected under international copyright law (<span className="font-mono text-slate-300">Berne Convention</span>)
                  and Egyptian Intellectual Property Law (Law No. 82 of 2002).
                </p>
                <p className="text-slate-400">
                  Personal and non-commercial educational use is permitted with explicit attribution to the source and authors.
                </p>
              </>
            )}
          </div>

          {/* Digital Fingerprint Row */}
          <div
            className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]"
          >
            <span className="text-[10px] text-slate-500">{isAr ? 'البصمة الرقمية:' : 'Digital Fingerprint:'}</span>
            <code
              className="text-[10px] text-[#007AFF] font-mono break-all"
              title="SHA-256 — SCINEXA_ISEF_2026_PROJECT_AUTHORS_ISLAM_AND_YASEEN_VIRTUAL_SCIENCE_LABS"
            >
              b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f
            </code>
          </div>
        </div>

        {/* ── Bottom Line ── */}
        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-white/[0.04]">
          © {new Date().getFullYear()} SciNexa &bull;{' '}
          {isAr
            ? 'إسلام وياسين — منصة العلوم التفاعلية والمختبرات الافتراضية'
            : 'Islam & Yaseen — Interactive Science Platform & Virtual Labs'}
          {' '}· ISEF 2026
        </div>
      </div>
    </footer>
  );
};
