import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SciNexaBrand } from './SciNexaLogo';
import { Shield, FileText, Copyright } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';

  const footerLinks = [
    {
      h: ar ? 'المنتج والمعامل' : 'Product & Labs',
      items: [
        [ar ? 'أطلس التشريح' : 'Anatomy Atlas', '#labs'],
        [ar ? 'الفيزياء والدوائر' : 'Physics & Circuits', '#labs'],
        [ar ? 'الكيمياء والتفاعلات' : 'Chemistry Lab', '#labs'],
        [ar ? 'السبورة التفاعلية' : 'Smartboard', '#roles']
      ]
    },
    {
      h: ar ? 'البيئة المدرسية' : 'School & LAN',
      items: [
        [ar ? 'الطلاب والمعلمون' : 'Students & Teachers', '#roles'],
        [ar ? 'التشغيل بدون إنترنت' : 'Offline & USB LAN', '#offline'],
        [ar ? 'معايير STEM والوزارة' : 'STEM Standards', '#curriculum']
      ]
    },
    {
      h: ar ? 'المشروع والاعتماد' : 'Project & Authors',
      items: [
        ['ISEF 2026', '#'],
        [ar ? 'إسلام وياسين' : 'Islam & Yaseen', '#'],
        [ar ? 'قانون الملكية الفكرية' : 'IP Protections', '#']
      ]
    }
  ];

  return (
    <footer className="border-t border-[#e5e5e5] bg-[#fafafa] text-[#737373] pb-32 pt-14" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="sn-shell space-y-12">

        {/* ── Top Navigation Grid ── */}
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <SciNexaBrand compact={false} />
            <p className="mt-4 max-w-[32ch] text-[13px] leading-relaxed text-[#737373]">
              {ar
                ? 'منصة المختبرات العلمية التفاعلية ثلاثية الأبعاد المعتمدة لمسابقة آيسف ٢٠٢٦.'
                : 'Next-generation interactive 3D virtual science laboratories for ISEF 2026.'}
            </p>
          </div>

          {footerLinks.map((col) => (
            <div key={col.h}>
              <div className="mb-3 text-[13px] font-bold text-[#0a0a0a]">{col.h}</div>
              <ul className="space-y-2">
                {col.items.map(([title, href]) => (
                  <li key={title}>
                    <a href={href} className="text-[12px] text-[#737373] hover:text-[#0a0a0a] transition-colors">
                      {title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Intellectual Property Box ── */}
        <div className="sn-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-[#0a0a0a] text-xs flex items-center gap-2">
              <Copyright className="w-4 h-4 text-[#1d4ed8]" />
              <span>{ar ? 'حقوق الملكية الفكرية والابتكار' : 'Intellectual Property & Author Rights'}</span>
            </h4>
            <span className="font-mono text-[10px] text-[#737373] bg-[#f5f5f5] px-2.5 py-0.5 rounded-full border border-[#e5e5e5]">
              ISEF 2026 · Cairo, Egypt
            </span>
          </div>

          <p className="text-[12px] leading-relaxed text-[#525252]">
            {ar ? (
              <>
                <strong className="text-[#0a0a0a]">منصة SciNexa</strong> — جميع حقوق الملكية الفكرية والتقنية والابتكارية محفوظة للمؤلفين:{' '}
                <strong className="text-[#1d4ed8]">إسلام </strong>و<strong className="text-[#1d4ed8]">ياسين</strong>، مشروع مسابقة ISEF 2026.
                محمي بموجب قوانين حماية حقوق الملكية الفكرية المصرية (قانون رقم 82 لسنة 2002) والاتفاقيات الدولية (Berne Convention).
              </>
            ) : (
              <>
                <strong className="text-[#0a0a0a]">SciNexa Platform</strong> — All intellectual property and innovations reserved to:{' '}
                <strong className="text-[#1d4ed8]">Islam </strong>&amp; <strong className="text-[#1d4ed8]">Yaseen</strong>, ISEF 2026 Project.
                Protected under international copyright law (Berne Convention) and Egyptian IP Law 82/2002.
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f0f0f0] text-[10px] font-mono">
            <span className="text-[#737373]">{ar ? 'البصمة الرقمية المعتمدة (SHA-256):' : 'Verified Digital Fingerprint (SHA-256):'}</span>
            <code className="text-[#1d4ed8] font-bold break-all bg-[#eff6ff] px-2 py-0.5 rounded">
              b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f
            </code>
          </div>
        </div>

        {/* ── Bottom Line ── */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-[#e5e5e5] pt-6 text-[12px] text-[#737373] md:flex-row md:items-center">
          <span>
            © {new Date().getFullYear()} SciNexa · Islam &amp; Yaseen · ISEF 2026
          </span>
          <span className="font-mono text-[11px] text-[#a3a3a3]">
            Science Observatory v15.0 · Clean Labs
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
