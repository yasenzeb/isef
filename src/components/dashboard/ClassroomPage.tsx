import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ClassroomMode } from '../ClassroomMode';
import { ArrowLeft, Presentation } from 'lucide-react';

export const ClassroomPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
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
            <div className="sn-eyebrow !text-[10px]">{ar ? 'وضع المعلم' : 'Teacher mode'}</div>
            <h1 className="text-[17px] font-semibold tracking-[-0.02em]">{ar ? 'السبورة التفاعلية' : 'Classroom smartboard'}</h1>
          </div>
        </div>
        <span className="sn-badge sn-badge-amber">
          <Presentation size={11} strokeWidth={1.8} />
          {ar ? 'عرض تقديمي' : 'Presentation'}
        </span>
      </div>

      <div className="sn-lab-stage !p-0 overflow-hidden [&>div]:min-h-[calc(100vh-190px)]">
        <ClassroomMode onExit={() => navigate('/app')} />
      </div>
    </div>
  );
};

export default ClassroomPage;
