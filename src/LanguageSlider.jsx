import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from './translations';

const LanguageSlider = ({ className = '', showIcon = true }) => {
  const { lang, setLang } = useTranslation();

  return (
    <div
      className={`relative inline-flex items-center p-1 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-sm select-none h-8 sm:h-9 ${className}`}
      role="group"
      aria-label="Language selector"
    >
      {showIcon && (
        <span className="pl-2 pr-1 text-zinc-400 dark:text-zinc-500 flex items-center justify-center pointer-events-none">
          <Globe size={13} />
        </span>
      )}

      <div className="relative flex items-center">
        {/* Animated sliding indicator pill */}
        <div
          className={`absolute top-0 bottom-0 left-0 w-8 sm:w-9 rounded-full bg-white dark:bg-zinc-800 shadow-[0_1px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4)] border border-black/5 dark:border-white/10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            lang === 'id' ? 'translate-x-full' : 'translate-x-0'
          }`}
        />

        {/* English Button */}
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`relative z-10 w-8 sm:w-9 h-6 sm:h-7 flex items-center justify-center text-[10px] sm:text-[11px] font-mono font-bold tracking-wider rounded-full transition-colors duration-200 ${
            lang === 'en'
              ? 'text-zinc-950 dark:text-white'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
          title="English"
        >
          EN
        </button>

        {/* Indonesian Button */}
        <button
          type="button"
          onClick={() => setLang('id')}
          className={`relative z-10 w-8 sm:w-9 h-6 sm:h-7 flex items-center justify-center text-[10px] sm:text-[11px] font-mono font-bold tracking-wider rounded-full transition-colors duration-200 ${
            lang === 'id'
              ? 'text-zinc-950 dark:text-white'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
          title="Bahasa Indonesia"
        >
          ID
        </button>
      </div>
    </div>
  );
};

export default LanguageSlider;
