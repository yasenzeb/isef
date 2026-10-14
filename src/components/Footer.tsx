import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Atom, Shield, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="border-t border-white/[0.08] bg-[#000000] text-slate-400 py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-white/[0.06] pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#0e1015] border border-white/20 flex items-center justify-center text-white">
              <Atom className="w-4 h-4 text-white" />
            </div>
            <div className={isRTL ? "mr-3 text-right" : ""}>
              <span className="text-sm font-mono font-bold text-white block uppercase tracking-wider">{t.appName}</span>
              <span className="text-xs text-slate-500 font-mono block">{t.appTagline}</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono max-w-md">
            {t.footer.tagline}
          </div>
        </div>

        {/* Attribution & Legal Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400">
          <div>
            <h4 className="font-mono font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>Scientific Data & Assets Attribution</span>
            </h4>
            <p className="leading-relaxed text-slate-400">
              {t.footer.credits}
            </p>
            <p className="mt-1 text-[11px] font-mono text-slate-500">
              {t.footer.sources}
            </p>
          </div>

          <div>
            <h4 className="font-mono font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Licensing & Pedagogical Scope</span>
            </h4>
            <p className="leading-relaxed text-slate-400">
              {t.footer.license} {t.footer.disclaimer}
            </p>
          </div>
        </div>

        <div className="text-center font-mono text-[11px] text-slate-600 pt-3 border-t border-white/[0.04]">
          SciNexa &bull; Interactive Science Learning Platform &amp; Virtual Laboratory Matrix v3.0
        </div>

      </div>
    </footer>
  );
};
