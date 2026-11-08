/**
 * AssistantPage.tsx — صفحة المرشد والباحث العلمي داروين في لوحة التحكم
 * يضم الشات العلمي المتطور، والمكالمة الصوتية المباشرة، ووكيل Fish Audio الرسمي
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { tLang } from '../../i18n/langHelpers';
import { PageHeader } from './ui';
import { SciNexaAIModal } from '../SciNexaAIModal';
import {
  Sparkles,
  ShieldCheck,
  FlaskConical,
  Activity,
  Atom,
  Compass,
  Radio,
  Volume2,
} from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useSession();
  const ar = language === 'ar';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={tLang(language, {
          ar: 'المرشد والباحث العلمي التفاعلي',
          en: 'Interactive Science Mentor',
          fr: 'Tuteur scientifique interactif',
          de: 'Interaktiver Wissenschaftsmentor',
          ja: 'インタラクティブ科学メンター',
        })}
        title={tLang(language, {
          ar: 'داروين · وكيل الذكاء الاصطناعي والصوتي لمنصة SciNexa.',
          en: 'Darwin · SciNexa AI & Voice Agent.',
          fr: 'Darwin · Agent IA & Vocal SciNexa.',
          de: 'Darwin · SciNexa KI- & Sprachagent.',
          ja: 'ダーウィン · SciNexa 科学AI・音声エージェント。',
        })}
        subtitle={tLang(language, {
          ar: 'تحدث صوتاً أو نصاً مع داروين: شات علمي متكامل، ومكالمة صوتية مباشرة، ووكيل Fish Audio الرسمي للتحكم بالمعامل وتفسير التجارب بدقة.',
          en: 'Speak or chat with Darwin: complete science chat, real-time live voice call, and official Fish Audio model for lab control and experiment analysis.',
          fr: 'Discutez vocalement ou par écrit avec Darwin pour piloter les laboratoires.',
          de: 'Sprechen oder schreiben Sie mit Darwin zur Steuerung der Labore.',
          ja: '音声またはテキストでダーウィンと対話：実験室の操作や科学実験の精密な解説を行います。',
        })}
      />

      {/* Main Grid: AI Assistant Matrix + Quick Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Assistant Stage: Embedded SciNexaAIModal */}
        <div className="lg:col-span-3">
          <SciNexaAIModal
            isOpen={true}
            onClose={() => {}}
            isEmbedded={true}
            initialTab="chat"
          />
        </div>

        {/* Sidebar Info & Standards */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm text-[12px] space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#0f172a]">
              <Radio size={16} className="text-cyan-600 animate-pulse" />
              <span>
                {tLang(language, {
                  ar: 'المحركات الذكية النشطة',
                  en: 'Active AI Engines',
                  fr: 'Moteurs IA actifs',
                  de: 'Aktive KI-Engines',
                  ja: '稼働中AIエンジン',
                })}
              </span>
            </div>

            <div className="space-y-2 text-[11px] text-[#475569]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
                <span className="font-medium">{ar ? 'المحرك الصوتي المباشر:' : 'Voice Engine:'}</span>
                <span className="font-mono text-cyan-700 font-bold">Fish Audio Agent</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
                <span className="font-medium">{ar ? 'التحليل العلمي:' : 'Science Analysis:'}</span>
                <span className="font-mono text-indigo-700 font-bold">Gemini & SciNexa</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
                <span className="font-medium">{ar ? 'معرف الوكيل (ID):' : 'Agent ID:'}</span>
                <span className="font-mono text-emerald-700 font-bold">929a1bf3</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm text-[11px] text-[#64748b] space-y-2.5">
            <div className="font-bold text-[#0f172a] flex items-center gap-1.5 text-[12px]">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>
                {tLang(language, {
                  ar: 'المعايير والنزاهة الأكاديمية',
                  en: 'Academic Integrity & Standards',
                  fr: 'Intégrité et normes académiques',
                  de: 'Akademische Integrität & Standards',
                  ja: '学術的基準と完全性',
                })}
              </span>
            </div>
            <p className="leading-relaxed">
              {tLang(language, {
                ar: 'جميع الشروحات المعملية معتمدة ومطابقة لمناهج وزارة التربية والتعليم المصرية ومصطلحات IUPAC الكيميائية وأطلس Z-Anatomy الطبي العالمي.',
                en: 'All laboratory explanations adhere to Egyptian Ministry curricula, IUPAC nomenclature, and Z-Anatomy global medical references.',
                fr: 'Explications conformes aux programmes officiels et aux normes IUPAC.',
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
