import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ClassroomMode } from '../ClassroomMode';

export const ClassroomPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';

  return (
    <div dir={ar ? 'rtl' : 'ltr'} className="w-full">
      <ClassroomMode onExit={() => navigate('/app')} />
    </div>
  );
};

export default ClassroomPage;
