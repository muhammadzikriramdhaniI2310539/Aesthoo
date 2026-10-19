import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  QrCode,
  Sparkles,
  UserCheck,
  ArrowLeft,
  Sun,
  Moon,
  Camera
} from 'lucide-react';
import { useTranslation } from './translations';
import LanguageSlider from './LanguageSlider';

const PrivacyPage = () => {
  const { t } = useTranslation();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const savedTheme = window.localStorage.getItem('aestho-theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem('aestho-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const policyIcons = [
    <Camera key="1" size={15} />,
    <Clock key="2" size={15} />,
    <QrCode key="3" size={15} />,
    <Sparkles key="4" size={15} />,
    <UserCheck key="5" size={15} />
  ];

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <main className="h-[100dvh] max-h-[100dvh] w-full bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black px-4 sm:px-6 lg:px-10 py-3 sm:py-5 flex flex-col relative overflow-hidden select-none">
        {/* Floating Ambient Glow Orbs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-pink-100/40 dark:bg-pink-500/10 blur-3xl rounded-full -translate-x-20 -translate-y-20 pointer-events-none animate-float-slow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/40 dark:bg-blue-500/10 blur-3xl rounded-full translate-x-20 translate-y-20 pointer-events-none animate-float-reverse" />

        {/* 1. Header Bar with Smooth Entry */}
        <header className="w-full max-w-5xl mx-auto flex items-center justify-between shrink-0 relative z-10 animate-fade-down">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
              title="Kembali ke Studio"
            >
              <ArrowLeft size={18} />
            </a>
            <span className="font-title text-2xl text-zinc-900 dark:text-white tracking-tight">
              Aestho.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSlider />

            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm flex items-center justify-center group"
              title="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun size={15} className="group-hover:rotate-90 transition-transform duration-500" />
              ) : (
                <Moon size={15} className="group-hover:-rotate-12 transition-transform duration-500" />
              )}
            </button>
          </div>
        </header>

        {/* 2. Unified Centered Core: Title + Bento Grid + Action Button */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl lg:max-w-5xl mx-auto z-10 gap-3.5 sm:gap-4 lg:gap-5 my-auto">
          {/* Title Section */}
          <div
            className="w-full text-center shrink-0 animate-fade-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-[9px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1 sm:mb-1.5 shadow-sm">
              <ShieldCheck size={12} className="text-zinc-700 dark:text-zinc-300" />
              <span>{t.privacy.badge}</span>
            </div>

            <h1 className="font-title text-4xl sm:text-5xl lg:text-6xl text-zinc-900 dark:text-white leading-none mb-1 tracking-normal">
              {t.privacy.title}
            </h1>

            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              {t.privacy.subtitle}
            </p>
          </div>

          {/* Balanced Bento Grid */}
          <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
            {t.privacy.policies.map((p, idx) => (
              <div
                key={idx}
                style={{ animationDelay: `${160 + idx * 60}ms` }}
                className={`${
                  idx < 3 ? 'lg:col-span-2' : 'lg:col-span-3'
                } ${
                  idx === 4 ? 'sm:col-span-2 lg:col-span-3' : ''
                } group relative overflow-hidden bg-white/80 dark:bg-zinc-900/65 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 lg:p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-start gap-2.5 sm:gap-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/40 hover:border-zinc-400/80 dark:hover:border-zinc-700 animate-fade-up cursor-default`}
              >
                {/* Subtle Ambient Sheen on Card Top Border */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-400/40 dark:via-zinc-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Dynamic Icon Badge */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300 shadow-sm">
                  {policyIcons[idx] || <ShieldCheck size={15} />}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                    <span className="font-mono text-[9px] sm:text-[10px] text-zinc-400 font-bold group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors duration-300">
                      0{idx + 1}.
                    </span>
                    <h2 className="text-xs sm:text-xs lg:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:translate-x-0.5 transition-transform duration-300">
                      {p.title}
                    </h2>
                  </div>
                  <p className="text-[10px] sm:text-[10.5px] lg:text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug sm:leading-relaxed line-clamp-2 lg:line-clamp-3">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* Conditioned Enter Studio Action & Last Updated Info */}
          <div
            className="flex flex-col items-center gap-2 pt-1 shrink-0 animate-fade-up"
            style={{ animationDelay: '480ms' }}
          >
            <a
              href="/"
              className="group inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-modern text-[9px] sm:text-[10px] font-bold tracking-[0.16em] uppercase hover:opacity-90 hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-md hover:shadow-xl dark:shadow-white/5"
            >
              <Camera size={13} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>{t.privacy.enterStudio}</span>
            </a>

            <span className="text-[9.5px] sm:text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
              {t.privacy.lastUpdated}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
