import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ClassroomMode } from '../ClassroomMode';
import { ArrowLeft, Presentation, Sparkles } from 'lucide-react';

export const ClassroomPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';

  return (
    <div dir={ar ? 'rtl' : 'ltr'} className="space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e5e5e5] bg-white p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="sn-btn sn-btn-outline sn-btn-icon"
            aria-label={ar ? 'العودة' : 'Back'}
          >
            <ArrowLeft size={16} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
          </button>
          <div>
            <div className="sn-eyebrow !text-[10px]">{ar ? 'وضع المعلم والفصول' : 'Teacher & Smartboard Mode'}</div>
            <h1 className="text-[17px] font-bold tracking-tight text-[#0a0a0a]">
              {ar ? 'السبورة التفاعلية والشاشات الذكية' : 'Interactive Classroom & Whiteboard'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="sn-badge sn-badge-amber">
            <Presentation size={12} strokeWidth={1.8} />
            {ar ? 'عرض تفاعلي' : 'Interactive View'}
          </span>
          <span className="sn-badge sn-badge-green">
            <Sparkles size={11} strokeWidth={1.8} />
            {ar ? 'مدعوم باللمس' : 'Touch Enabled'}
          </span>
        </div>
      </div>

      {/* Main Integrated Workspace */}
      <div className="w-full">
        <ClassroomMode onExit={() => navigate('/app')} />
      </div>
    </div>
  );
};

export default ClassroomPage;
