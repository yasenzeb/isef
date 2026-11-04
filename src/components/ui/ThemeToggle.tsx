import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { language } = useLanguage();
  const ar = language === 'ar';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="sn-btn sn-btn-outline sn-btn-sm !h-8 !w-8 !p-0 flex items-center justify-center text-[#171717] dark:text-white border-[#e5e5e5] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#f5f5f5] dark:hover:bg-white/10 transition-colors"
      aria-label={isDark ? (ar ? 'تفعيل الوضع الفاتح' : 'Switch to light mode') : (ar ? 'تفعيل الوضع الداكن' : 'Switch to dark mode')}
      title={isDark ? (ar ? 'الوضع الفاتح' : 'Light Mode') : (ar ? 'الوضع الداكن' : 'Dark Mode')}
    >
      {isDark ? (
        <Sun size={15} strokeWidth={1.9} className="text-amber-400" />
      ) : (
        <Moon size={15} strokeWidth={1.9} className="text-[#737373]" />
      )}
    </button>
  );
};

export default ThemeToggle;
