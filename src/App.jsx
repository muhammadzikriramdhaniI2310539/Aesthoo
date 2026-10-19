import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Plus, Star, Users, Camera, RefreshCw, Sliders, Clock, Download, Check, Loader2, Play, VideoOff, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Printer, LayoutTemplate, Sparkles, Image as ImageIcon, Palette, Flame, Swords, Heart, Cloud, Moon, Zap, Music, Ghost, Sun, Upload, Trash2, Film, ImagePlus, Copy, RotateCcw, RotateCw, ZoomIn, ZoomOut, Instagram, QrCode, Globe, Mic, MicOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@supabase/supabase-js';
import AdminDashboard from './AdminDashboard';
import PrivacyPage from './PrivacyPage';
import TogetherSetupView from './TogetherSetupView';
import {
  generatePeerId,
  sendTogetherSignal,
  subscribeTogetherSignals,
  captureTogetherFrame,
  combineTwoSnapshots,
  RTC_CONFIG
} from './services/togetherRTC';
import { useTranslation } from './translations';
import LanguageSlider from './LanguageSlider';
import {
  fetchActiveFrames,
  fetchActiveCharacters,
  formatDbFrameToTemplate,
  formatDbCharacterToAppCharacter
} from './services/dynamicContent';

const isValidHttpUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const createSafeSupabaseClient = () => {
  const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  // Cegah error fatal jika url bukan HTTP/HTTPS atau masih placeholder
  if (!url || !key || !isValidHttpUrl(url) || url.includes('isi_supabase')) {
    return null;
  }

  try {
    return createClient(url, key);
  } catch (err) {
    console.warn('Supabase client initialization failed:', err);
    return null;
  }
};

const supabase = createSafeSupabaseClient();

const SHINHLIN_INSTAGRAM_URL = 'https://www.instagram.com/shinhlin/';
const TRAKTEER_SUPPORT_URL = 'https://trakteer.id/dzev';
const REQUEST_CHARACTER_URL = 'https://aesthoo.carrd.co/';

const isShinhlinTemplateName = (templateName = '') => {
  const normalizedName = String(templateName || '').toLowerCase();

  return normalizedName.includes('shinhlin');
};

const generateResultId = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = new Uint8Array(8);

  window.crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
};

const getSummaryIdFromPath = () => {
  const parts = window.location.pathname.split('/').filter(Boolean);

  if (parts[0] === 'id' && parts[1] === 'summary' && parts[2]) {
    return parts[2];
  }

  return null;
};

const toCloudinaryMp4Url = (url) => {
  if (!url || !url.includes('/video/upload/')) return url;

  const transformedUrl = url.replace('/video/upload/', '/video/upload/f_mp4,q_auto/');

  return transformedUrl.replace(/\.(webm|mov|mkv|avi|mp4)(\?.*)?$/i, '.mp4$2');
};

const EXPIRATION_HOURS = 72;
const EXPIRATION_MS = EXPIRATION_HOURS * 60 * 60 * 1000;

const formatSummaryDate = (dateString) => {
  if (!dateString) return 'Waktu tidak tercatat';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return String(dateString);
  }
};

const SummaryResultPage = () => {
  const { lang, toggleLanguage, t } = useTranslation();
  const [result, setResult] = useState(null);
  const [isLoadingResult, setIsLoadingResult] = useState(true);
  const [resultError, setResultError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = window.localStorage.getItem('aestho-theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const resultId = getSummaryIdFromPath();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem('aestho-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    const loadResult = async () => {
      if (!resultId) {
        setResultError(t.summary.invalidLink);
        setIsLoadingResult(false);
        return;
      }

      if (!supabase) {
        setResultError(t.summary.supabaseMissing);
        setIsLoadingResult(false);
        return;
      }

      const { data, error } = await supabase
        .from('aestho_results')
        .select('*')
        .eq('id', resultId)
        .single();

      if (error || !data) {
        setResultError(t.summary.resultNotFound);
        setIsLoadingResult(false);
        return;
      }

      setResult(data);
      setIsLoadingResult(false);
    };

    loadResult();
  }, [resultId, t.summary.invalidLink, t.summary.supabaseMissing, t.summary.resultNotFound]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      alert(t.finalResult.toastCopyFailed || 'Gagal menyalin link.');
    }
  };

  if (isLoadingResult) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white flex items-center justify-center p-6 font-sans">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800 shadow-2xl p-10 text-center max-w-sm w-full">
            <Loader2 className="w-9 h-9 animate-spin mx-auto mb-5 text-zinc-500" />
            <h1 className="font-title text-4xl mb-2 text-zinc-900 dark:text-white">Aestho.</h1>
            <p className="font-modern text-[10px] tracking-[0.25em] text-zinc-400 dark:text-zinc-500 uppercase">
              {t.summary.loadingSession}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (resultError) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white flex flex-col items-center justify-center p-6 font-sans relative">
          <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0"
              title="Kembali ke Studio"
            >
              <ArrowLeft size={18} />
            </a>
            <span className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-none select-none">Aestho.</span>
          </div>
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <LanguageSlider />
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors shadow-sm flex items-center justify-center"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 sm:p-10 text-center max-w-md w-full">
            <h1 className="font-title text-4xl mb-3 text-zinc-900 dark:text-white">Aestho.</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">{resultError}</p>
            <a
              href="/"
              className="inline-flex px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-modern tracking-[0.2em] uppercase font-bold hover:opacity-85 transition-opacity"
            >
              {t.summary.startNewSession}
            </a>
          </div>
        </main>
      </div>
    );
  }

  // --- LOGIKA EXPIRED 72 JAM ---
  const createdAtTime = result?.created_at ? new Date(result.created_at).getTime() : null;
  const elapsedMs = createdAtTime && !isNaN(createdAtTime) ? Date.now() - createdAtTime : 0;
  const isExpired = createdAtTime && !isNaN(createdAtTime) && elapsedMs > EXPIRATION_MS;
  const remainingMs = Math.max(0, EXPIRATION_MS - elapsedMs);
  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  // --- TAMPILAN JIKA RESULT EXPIRED (FOTO & VIDEO & TOMBOL DOWNLOAD TIDAK MUNCUL) ---
  if (isExpired) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden transition-colors duration-500">
          <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0"
              title="Kembali ke Studio"
            >
              <ArrowLeft size={18} />
            </a>
            <span className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-none select-none">Aestho.</span>
          </div>
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <LanguageSlider />
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors shadow-sm flex items-center justify-center"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          <div className="absolute top-0 left-0 w-80 h-80 bg-zinc-200/40 dark:bg-zinc-800/20 blur-3xl rounded-full -translate-x-20 -translate-y-20 pointer-events-none" />
          <div className="relative z-10 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800 shadow-2xl p-7 sm:p-10 text-center max-w-md w-full">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-7 h-7 opacity-70" />
            </div>

            <p className="font-modern text-[10px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 mb-2">
              {t.summary.sessionExpiredBadge}
            </p>

            <h1 className="font-title text-4xl sm:text-5xl mb-2 text-zinc-900 dark:text-white">
              {t.summary.sessionExpiredTitle}
            </h1>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
              {t.summary.sessionExpiredDesc}
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 mb-6 text-left font-mono text-[11px] flex flex-col gap-1.5 text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span className="text-zinc-400">{t.summary.resultId}</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{result.id}</span>
              </div>
              {result.template_name && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">{t.summary.frameStyle}</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{result.template_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-400">{t.summary.createdAtLabel}</span>
                <span>{formatSummaryDate(result.created_at)}</span>
              </div>
              <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <span>{t.summary.statusLabel}</span>
                <span>{t.summary.expiredStatus}</span>
              </div>
            </div>

            <a
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-modern font-bold tracking-[0.2em] uppercase hover:opacity-90 active:scale-95 transition-all shadow-md mb-3"
            >
              <RefreshCw className="w-4 h-4" /> {t.summary.makeAnotherBtn}
            </a>

            <a
              href="/privacy"
              className="text-[10px] font-mono text-zinc-400 hover:text-black dark:hover:text-white underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 transition-colors"
            >
              {t.summary.privacyLink}
            </a>
          </div>
        </main>
      </div>
    );
  }

  // --- TAMPILAN JIKA RESULT MASIH AKTIF (RESPONSIVE DI MOBILE & DESKTOP) ---
  const mp4Url = result.video_mp4_url || toCloudinaryMp4Url(result.video_url);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white flex flex-col items-center justify-start lg:justify-center p-4 sm:p-6 lg:p-10 overflow-x-hidden relative transition-colors duration-500 font-sans">
        {/* Top Controls: Switch Language & Dark Mode */}
        <div className="w-full max-w-6xl flex justify-between items-center mb-4 relative z-20">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0"
              title="Kembali ke Studio"
            >
              <ArrowLeft size={18} />
            </a>
            <a
              href="/"
              className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-none select-none hover:opacity-80 transition-opacity"
            >
              Aestho.
            </a>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSlider />

            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors shadow-sm flex items-center justify-center"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {/* Decorative blurs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-pink-100/40 dark:bg-pink-500/10 blur-3xl rounded-full -translate-x-24 -translate-y-24 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/40 dark:bg-blue-500/10 blur-3xl rounded-full translate-x-24 translate-y-24 pointer-events-none" />

        {/* Main Container: Vertikal di Mobile, 2 Kolom di Desktop */}
        <section className="relative z-10 w-full max-w-6xl flex flex-col lg:grid lg:grid-cols-[0.9fr_1.1fr] gap-6 sm:gap-8 lg:gap-10 items-start lg:items-center my-auto py-4">
          {/* Left Panel: Informasi & Tombol Aksi */}
          <div className="w-full bg-white/85 dark:bg-zinc-900/65 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] border border-white/60 dark:border-zinc-800 shadow-xl sm:shadow-2xl p-6 sm:p-8 lg:p-9 flex flex-col justify-center">
            {/* Header Info */}
            <div className="mb-5 sm:mb-6">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="font-modern text-[9px] tracking-[0.25em] text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-zinc-500" /> Aestho Photobooth
                </span>
                <span className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" />
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 font-mono text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t.summary.activeBadge}
                </span>
              </div>

              <h1
                className="text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mb-3 text-zinc-900 dark:text-white font-title"
              >
                {t.summary.masterpieceTitle}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {t.summary.masterpieceDesc}
              </p>
            </div>

            {/* Retention Notice Box (Available for 72 hours) */}
            <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
              <div className="flex-1 text-xs leading-relaxed">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">
                  <span className="font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                    {t.summary.available72Hours}
                  </span>
                  {createdAtTime && !isNaN(createdAtTime) && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {t.summary.remainingText(remainingHours, remainingMins)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {t.summary.retentionNotice}
                </p>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 mb-5">
              <a
                href={result.photo_url}
                target="_blank"
                rel="noopener noreferrer"
                download={`Aestho-Strip-${result.id}.jpg`}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-[10px] font-modern font-bold tracking-[0.16em] uppercase hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                <Download className="w-4 h-4" /> {t.summary.downloadJpgBtn}
              </a>

              {mp4Url && (
                <a
                  href={mp4Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`Aestho-Live-Moment-${result.id}.mp4`}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-[10px] font-modern font-bold tracking-[0.16em] uppercase hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  <Film className="w-4 h-4" /> {t.summary.downloadVideoBtn}
                </a>
              )}

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white text-[10px] font-modern font-bold tracking-[0.16em] uppercase hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? t.summary.linkCopiedBtn : t.summary.copyLinkBtn}
              </button>

              <a
                href="/"
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-[10px] font-modern font-bold tracking-[0.16em] uppercase hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> {t.summary.makeAnotherBtn}
              </a>
            </div>

            {/* Session Metadata Details */}
            <div className="pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">
              <div>
                {t.summary.resultId}: <span className="font-bold text-zinc-700 dark:text-zinc-200">{result.id}</span>
              </div>
              {result.template_name && (
                <div>
                  {t.summary.frameStyle}: <span className="font-bold text-zinc-700 dark:text-zinc-200">{result.template_name}</span>
                </div>
              )}
              {result.layout_id && (
                <div>
                  {t.summary.layoutLabel}: <span className="font-bold text-zinc-700 dark:text-zinc-200">{result.layout_id === 'grid-4r' ? 'Poster 4R' : 'Classic Strip'}</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
              <span>{t.summary.retentionPolicyLabel}</span>
              <a
                href="/privacy"
                className="hover:text-black dark:hover:text-white underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 transition-colors"
              >
                {t.summary.privacyLink}
              </a>
            </div>
          </div>

          {/* Right Panel: Display Media (Stack Vertikal di Mobile, 2 Kolom di Tablet/Desktop) */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 items-start">
            {/* Static JPG Card */}
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md rounded-3xl border border-white/60 dark:border-zinc-800 shadow-lg sm:shadow-xl p-4 sm:p-5 flex flex-col gap-3">
              <div className="text-center">
                <div className="inline-flex items-center justify-center gap-1.5 text-zinc-700 dark:text-zinc-200 font-mono text-xs font-bold uppercase">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{t.summary.staticResultJpg}</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {t.summary.staticResultDesc}
                </p>
              </div>
              <div className="bg-white dark:bg-zinc-950 p-2 sm:p-2.5 rounded-2xl shadow-inner border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                <img
                  src={result.photo_url}
                  alt={`Aestho Strip ${result.id}`}
                  className="max-h-[50vh] sm:max-h-[55vh] w-auto mx-auto rounded-xl object-contain"
                  loading="eager"
                />
              </div>
            </div>

            {/* Live Moment MP4 Card */}
            {result.video_url && (
              <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md rounded-3xl border border-white/60 dark:border-zinc-800 shadow-lg sm:shadow-xl p-4 sm:p-5 flex flex-col gap-3">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center gap-1.5 text-zinc-700 dark:text-zinc-200 font-mono text-xs font-bold uppercase">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>{t.summary.liveMomentVideo}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {t.summary.liveMomentDesc}
                  </p>
                </div>
                <div className="bg-black p-2 sm:p-2.5 rounded-2xl shadow-inner border border-zinc-800 flex items-center justify-center overflow-hidden">
                  <video
                    src={result.video_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full max-h-[50vh] sm:max-h-[55vh] rounded-xl object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const App = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin-aestho')) {
    return <AdminDashboard supabase={supabase} />;
  }
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/id/summary')) {
    return <SummaryResultPage />;
  }
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/privacy')) {
    return <PrivacyPage />;
  }
  // ==================================================================================
  // 1. KONFIGURASI DATA
  // ==================================================================================

  // --- STANDARD DIMENSIONS DYNAMIC ---
  const getLayoutConfig = (layoutId) => {
      if (layoutId === 'grid-4r') {
          return {
              W: 1200, H: 1800,
              slots: [
                  { x: 50, y: 50, w: 520, h: 390 }, // Baris 1, Kiri
                  { x: 630, y: 50, w: 520, h: 390 }, // Baris 1, Kanan
                  { x: 50, y: 480, w: 520, h: 390 }, // Baris 2, Kiri
                  { x: 630, y: 480, w: 520, h: 390 }, // Baris 2, Kanan
                  { x: 50, y: 910, w: 520, h: 390 }, // Baris 3, Kiri
                  { x: 630, y: 910, w: 520, h: 390 }  // Baris 3, Kanan
              ]
          };
      }
      // Default: classic-white
      return {
          W: 600, H: 2000,
          slots: [
              { x: 45, y: 60, w: 510, h: 383 },
              { x: 45, y: 473, w: 510, h: 383 },
              { x: 45, y: 886, w: 510, h: 383 },
              { x: 45, y: 1299, w: 510, h: 383 }
          ]
      };
  };

  // A. Pilihan Layout (Canvas Types)
  const layouts = [
    { 
      id: 'classic-white', 
      name: 'Classic White', 
      type: 'vertical', 
      desc: 'Clean white vertical strip.',
      cssContainer: 'w-16 h-[240px] md:w-24 md:h-[320px] flex-col p-2 gap-2 bg-white shadow-xl flex dark:ring-1 dark:ring-zinc-700',
      cssPhoto: 'w-full h-12 md:h-16',
      bgColor: 'bg-white',
      textColor: 'text-black',
      disabled: false
    },
    { 
      id: 'grid-4r', 
      name: 'Poster Grid (1200x1800)', 
      type: 'grid', 
      desc: '4R Wide grid format.',
      cssContainer: 'w-[120px] h-[180px] md:w-[160px] md:h-[240px] pt-2.5 px-2.5 pb-6 bg-white shadow-xl grid grid-cols-2 gap-x-1 gap-y-1.5 content-start dark:ring-1 dark:ring-zinc-700',
      cssPhoto: 'w-full aspect-[500/390] object-cover',
      bgColor: 'bg-white',
      textColor: 'text-black',
      disabled: false
    },
    { 
      id: 'coming-soon', 
      name: 'Coming Soon', 
      type: 'placeholder', 
      desc: 'More styles coming soon.',
      cssContainer: 'w-16 h-[240px] md:w-24 md:h-[320px] flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 shadow-sm',
      cssPhoto: '',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-400',
      disabled: true
    }
  ];

  // B. Pilihan Mode
  const modes = [
    { 
      id: 'original', 
      name: 'Aestho Original', 
      desc: 'Minimalist blank canvas.', 
      icon: <Star className="w-6 h-6 md:w-8 md:h-8"/>, 
      style: 'bg-white text-black border-gray-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-700'
    },
    { 
      id: 'character', 
      name: 'Character Collab', 
      desc: 'Pose with idols & anime chars.', 
      icon: <Users className="w-6 h-6 md:w-8 md:h-8"/>, 
      style: 'bg-black text-white border-black hover:shadow-xl dark:bg-zinc-800 dark:border-zinc-600'
    },
    {
      id: 'together',
      name: 'Aestho Together',
      desc: 'Capture moments, even miles apart.',
      icon: <Globe className="w-6 h-6 md:w-8 md:h-8"/>,
      style: 'bg-white text-black border-gray-200 hover:shadow-xl dark:bg-zinc-900 dark:text-white dark:border-zinc-700'
    }
  ];

  // C. Filter Presets
  const filters = [
    { id: 'normal', name: 'Normal', style: 'none' },
    { id: 'bw', name: 'BW', style: 'grayscale(100%) contrast(1.1)' },
    { id: 'vintage-booth', name: 'Vintage Booth', style: 'grayscale(100%) sepia(30%) contrast(1.22) brightness(0.92) saturate(0.75)' },
    { id: 'warm', name: 'Warm', style: 'sepia(40%) contrast(1.05) saturate(1.2)' },
    { id: 'fade', name: 'Fade', style: 'opacity(0.8) contrast(0.9) brightness(1.1)' },
  ];

  // D. Data Anime & Character
  const animeOptions = [
    {
      id: 'genshin', 
      name: 'Genshin Impact', 
      logoUrl: 'https://1000logos.net/wp-content/uploads/2021/08/Genshin-Impact-Logo.png',
      color: 'hover:shadow-blue-400/50', 
      hoverText: 'group-hover:text-blue-500',
      icon: <Star className="text-blue-500"/>,
      characters: [
        { 
            id: 'citlali', 
            name: 'Citlali', 
            overlayImg: [
                'https://lh3.googleusercontent.com/d/1d01tMQt3SmV_qZU9E7fuePHL31ECsSkV',
                'https://lh3.googleusercontent.com/d/1cxQqUJx_qVnUpLfi05pKtmfFMmesY6on',
                'https://lh3.googleusercontent.com/d/193AWYYZX4ZqfH28wxIVY0ipaNmBEcR06',
                'https://lh3.googleusercontent.com/d/1zCKSvo_c0yzG2p6aI2f5D1eukkbElN-V'
            ],
            theme: 'bg-pink-50',
            position: 'right',
            styles: { 0: 'w-[95%]', 1: 'w-[95%]', 2: 'w-[95%]', 3: 'w-[95%]' }
        },
        { 
            id: 'tartaglia', 
            name: 'Tartaglia', 
            overlayImg: [
                'https://lh3.googleusercontent.com/d/1vIbKkPK5gQBw7BEEf1550MOhC3qBTNsL',
                'https://lh3.googleusercontent.com/d/1mP_lwG4NSWqrKY5XkiNR9lcyTEo0B7nW',
                'https://lh3.googleusercontent.com/d/1Z0pGbDemIMT7UnTsaOzrzGeaT7XALVYe',
                'https://lh3.googleusercontent.com/d/1nmb5B8csJERv5pxaqd7IZ3lJk2Ls4ByD'
            ],
            theme: 'bg-red-50',
            position: 'right',
            // Tartaglia pakai height-based sizing supaya atas dan bawah frame sama-sama penuh.
            // Width-based sizing sebelumnya kurang terasa karena file PNG Tartaglia punya area transparan lebar.
            styles: {
                0: 'w-auto',
                1: 'w-auto',
                2: 'w-auto',
                3: 'w-auto'
            },
            heightStyles: {
                0: 100,
                1: 100,
                2: 100,
                3: 100
            }
        },
        { 
            id: 'furina', 
            name: 'Furina', 
            overlayImg: [
                '',
                '',
                '',
                ''
            ],
            theme: 'bg-blue-50' 
        },
        { 
            id: 'lumine', 
            name: 'Lumine', 
            overlayImg: [
                '',
                '',
                '',
                ''
            ],
            theme: 'bg-yellow-100', 
            position: 'left',
            styles: { 0: 'w-[60%]', 1: 'w-[60%]', 2: 'w-[60%]', 3: 'w-[60%]' }
        },
        { id: 'zhongli', name: 'Zhongli', overlayImg: 'https://placehold.co/600x800/transparent/d97706?text=Zhongli+Pose', theme: 'bg-yellow-50' },
        { id: 'raiden', name: 'Raiden Shogun', overlayImg: 'https://placehold.co/600x800/transparent/9333ea?text=Raiden+Pose', theme: 'bg-purple-50' },
        { id: 'nahida', name: 'Nahida', overlayImg: 'https://placehold.co/600x800/transparent/22c55e?text=Nahida+Pose', theme: 'bg-green-50' },
        { id: 'ganyu', name: 'Ganyu', overlayImg: 'https://placehold.co/600x800/transparent/3b82f6?text=Ganyu+Pose', theme: 'bg-blue-100' }
      ]
    },
    {
      id: 'hsr',
      name: 'Honkai: Star Rail',
      logoUrl: 'https://preview.redd.it/what-is-the-font-for-the-hsr-logo-v0-06d75o5cvn3b1.png?width=1290&format=png&auto=webp&s=6f720d993f23ba56cb4ab7931320f091d45c9973',
      color: 'hover:shadow-indigo-500/50',
      hoverText: 'group-hover:text-indigo-500',
      icon: <Sparkles className="text-indigo-500"/>,
      characters: [
          { 
              id: 'bronya', 
              name: 'Bronya', 
              overlayImg: [
                  '',
                  '',
                  '',
                  ''
              ],
              theme: 'bg-indigo-50' 
          },
          { id: 'danheng', name: 'Dan Heng', overlayImg: 'https://placehold.co/600x800/transparent/10b981?text=Dan+Heng', theme: 'bg-green-50' },
          { id: 'caelus', name: 'Caelus', overlayImg: 'https://placehold.co/600x800/transparent/94a3b8?text=Caelus', theme: 'bg-gray-100' },
          { id: 'stelle', name: 'Stelle', overlayImg: 'https://placehold.co/600x800/transparent/cbd5e1?text=Stelle', theme: 'bg-gray-200' },
          { id: 'march', name: 'March 7th', overlayImg: 'https://placehold.co/600x800/transparent/f472b6?text=March+7th', theme: 'bg-pink-100' },
          { id: 'himeko', name: 'Himeko', overlayImg: 'https://placehold.co/600x800/transparent/dc2626?text=Himeko', theme: 'bg-red-100' },
          { 
              id: 'silverwolf', 
              name: 'Silver Wolf', 
              overlayImg: [
                '',
                '',
                '',
                ''
              ],
              theme: 'bg-purple-100',
              position: 'right',
              styles: { 2: 'w-[85%]' },
              cameraStyles: { 2: 'translate-x-[15%]' } 
          },
          { id: 'sparkle', name: 'Sparkle', overlayImg: 'https://placehold.co/600x800/transparent/be185d?text=Sparkle', theme: 'bg-pink-200' }
      ]
    },
    {
      id: 'jjk',
      name: 'Jujutsu Kaisen',
      logoUrl: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a44778ea-3457-40e0-8979-b7e3685d23d0/dekiqwv-be5d6933-0cc6-40e1-9b67-60b3affb002b.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2E0NDc3OGVhLTM0NTctNDBlMC04OTc5LWI3ZTM2ODVkMjNkMFwvZGVraXF3di1iZTVkNjkzMy0wY2M2LTQwZTEtOWI2Ny02MGIzYWZmYjAwMmIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.MTyBudLEGmNsCm4sYllShvFfo8MopGfgIQseKhejx00',
      color: 'hover:shadow-purple-900/50',
      hoverText: 'group-hover:text-purple-800',
      icon: <Flame className="text-purple-800"/>,
      characters: [
          { 
              id: 'gojo', 
              name: 'Satoru Gojo', 
              overlayImg: [
                  '',
                  '',
                  '',
                  ''
              ],
              theme: 'bg-blue-50',
              styles: { 0: 'w-[50%]', 1: 'w-[50%]', 2: 'w-[50%]', 3: 'w-[50%]' }
          },
          { 
              id: 'nobara', 
              name: 'Nobara Kugisaki', 
              overlayImg: [
                  '',
                  '',
                  '',
                  ''
              ],
              theme: 'bg-orange-50',
              styles: { 0: 'w-[50%]' } 
          },
          { id: 'yuji', name: 'Yuji Itadori', overlayImg: 'https://placehold.co/600x800/transparent/ef4444?text=Yuji', theme: 'bg-red-50' },
          { id: 'megumi', name: 'Megumi Fushiguro', overlayImg: 'https://placehold.co/600x800/transparent/1e293b?text=Megumi', theme: 'bg-slate-200' }
      ]
    },
    {
        id: 'aot',
        name: 'Attack on Titan',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2022/01/Attack-on-Titan-Logo.png',
        color: 'hover:shadow-amber-900/50',
        hoverText: 'group-hover:text-amber-900',
        icon: <Swords className="text-amber-900"/>,
        characters: [
            { id: 'eren', name: 'Eren Yeager', overlayImg: 'https://placehold.co/600x800/transparent/451a03?text=Eren', theme: 'bg-amber-50' },
            { id: 'mikasa', name: 'Mikasa Ackerman', overlayImg: 'https://placehold.co/600x800/transparent/7f1d1d?text=Mikasa', theme: 'bg-red-900' },
            { id: 'armin', name: 'Armin Arlert', overlayImg: 'https://placehold.co/600x800/transparent/fcd34d?text=Armin', theme: 'bg-yellow-100' },
            { id: 'jean', name: 'Jean Kirstein', overlayImg: 'https://placehold.co/600x800/transparent/a8a29e?text=Jean', theme: 'bg-stone-200' }
        ]
    }
  ];

  // E. Template Strip
  const stripTemplates = [
      ...[
          { 
              id: 'aestho-signature', 
              name: 'Aestho Signature', 
              type: 'css', 
              bgColor: '#ffffff', 
              textColor: 'black',
              styleContainer: { backgroundColor: 'white' },
              photoRadius: 'rounded-xl' 
          },
          { 
              id: 'citlali-frame-1', 
              name: 'Citlali Frame (@Shinhlin)', 
              type: 'css', 
              bgColor: '#ffffff', 
              textColor: 'black',
              overlayUrl: 'https://lh3.googleusercontent.com/d/14UukRXCZnWbHQSQk2FRTPu_ta8rs3pkn',
              styleContainer: { backgroundColor: 'white' },
              photoRadius: 'rounded-none',
              hideFooter: true
          },
          { 
              id: 'citlali-frame-white', 
              name: 'Citlali Frame White Ver (Shinhlin)', 
              type: 'css', 
              bgColor: '#ffffff', 
              textColor: 'black',
              overlayUrl: 'https://lh3.googleusercontent.com/d/1cFCq0iPjCMFNnlYic9oIM3y_LwPLIV5Y',
              styleContainer: { backgroundColor: 'white' },
              photoRadius: 'rounded-none',
              hideFooter: true
          },
          { 
              id: 'tartaglia-frame-orange', 
              name: 'Tartaglia Frame Orange Ver (Shinhlin)', 
              type: 'css', 
              bgColor: '#ffffff', 
              textColor: 'black',
              overlayUrl: 'https://lh3.googleusercontent.com/d/1t3viQBnCOyfMXdVHuIigDunvPQTExerp',
              styleContainer: { backgroundColor: 'white' },
              photoRadius: 'rounded-none',
              hideFooter: true
          },
          { 
              id: 'tartaglia-frame-light-blue', 
              name: 'Tartaglia Frame Light Blue Ver (Shinhlin)', 
              type: 'css', 
              bgColor: '#ffffff', 
              textColor: 'black',
              overlayUrl: 'https://lh3.googleusercontent.com/d/185oF4tEA4rcBHBc7q4nN5eKk0O745dw7',
              styleContainer: { backgroundColor: 'white' },
              photoRadius: 'rounded-none',
              hideFooter: true
          },
          { 
              id: 'tartaglia-frame-dark-blue', 
              name: 'Tartaglia Frame Dark Blue Ver (Shinhlin)', 
              type: 'css', 
              bgColor: '#ffffff', 
              textColor: 'black',
              overlayUrl: 'https://lh3.googleusercontent.com/d/1DPMmWLjdZvKaN6ojuvltw66maC0Vkeb2',
              styleContainer: { backgroundColor: 'white' },
              photoRadius: 'rounded-none',
              hideFooter: true
          },
          { 
              id: 'aestho-fun', 
              name: 'Aestho Fun', 
              type: 'css', 
              bgColor: '#ffffff', 
              textColor: 'black',
              overlayUrl: 'https://lh3.googleusercontent.com/d/1FQLYEmowd9zI8ggdcLeDtBiP3a5NCO2C',
              styleContainer: { backgroundColor: 'white' },
              photoRadius: 'rounded-md',
              hideFooter: true
          },
          { 
              id: 'simplethic', 
              name: 'Simplethic Frame', 
              type: 'css', 
              bgColor: '#ffffff', 
              textColor: 'black',
              overlayUrl: 'https://lh3.googleusercontent.com/d/16v_Dj6UqMEV2yYmoRMxJgDfttkg5X5wx',
              styleContainer: { backgroundColor: 'white' },
              photoRadius: 'rounded-md',
              hideFooter: true
          },
          { 
              id: 'aestho-starwars', 
              name: 'Aestho Starwars', 
              type: 'css', 
              bgColor: '#000000', 
              textColor: '#ffe81f',
              overlayUrl: 'https://lh3.googleusercontent.com/d/1A8vVuVvjWx4x-ZrubsGwzxfuwFpVJWq4',
              styleContainer: { backgroundColor: 'black' },
              photoRadius: 'rounded-sm',
              hideFooter: true
          },
          { 
              id: 'aestho-jungle', 
              name: 'Aestho Jungle', 
              type: 'css', 
              bgColor: '#064e3b', 
              textColor: '#a7f3d0',
              overlayUrl: 'https://lh3.googleusercontent.com/d/1-_bxhFm1G_rZSOpdXJfoqGhlhxlavhcL',
              styleContainer: { backgroundColor: '#064e3b' },
              photoRadius: 'rounded-sm',
              hideFooter: true
          },
          { 
              id: 'cinnamon-roll', 
              name: 'Cloudy Frame', 
              type: 'css', 
              bgColor: '#ffffff', 
              textColor: '#0ea5e9',
              styleContainer: {
                  backgroundImage: 'linear-gradient(#bae6fd 2px, transparent 2px), linear-gradient(90deg, #bae6fd 2px, transparent 2px)',
                  backgroundSize: '20px 20px',
                  backgroundColor: 'white'
              },
              photoRadius: 'rounded-2xl border-4 border-sky-100 shadow-sm', 
              sticker: <Cloud className="text-sky-300 w-24 h-24 fill-sky-100 drop-shadow-sm" />
          },
          { 
              id: 'frame-genshin', 
              name: 'Teyvat Blue', 
              type: 'css', 
              bgColor: '#eff6ff', 
              textColor: '#1e40af', 
              styleContainer: { background: 'linear-gradient(to bottom, #eff6ff, #dbeafe)', border: '4px solid #bfdbfe' },
              photoRadius: 'rounded-lg',
              sticker: <img src="https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Genshin_Impact_logo.svg/2560px-Genshin_Impact_logo.svg.png" className="w-32 h-auto opacity-80" alt="Genshin" />
          },
          { 
              id: 'frame-hsr', 
              name: 'Astral Express', 
              type: 'css', 
              bgColor: '#1e1b4b', 
              textColor: '#e0e7ff', 
              styleContainer: { background: 'linear-gradient(to bottom, #0f172a, #312e81)', border: '4px solid rgba(99, 102, 241, 0.3)' },
              photoRadius: 'rounded-sm',
              sticker: <img src="https://preview.redd.it/what-is-the-font-for-the-hsr-logo-v0-06d75o5cvn3b1.png?width=1290&format=png&auto=webp&s=6f720d993f23ba56cb4ab7931320f091d45c9973" className="w-24 h-auto opacity-90 invert" alt="HSR" />
          },
          { 
              id: 'frame-jjk', 
              name: 'Jujutsu High', 
              type: 'css', 
              bgColor: '#000000', 
              textColor: '#f87171', 
              styleContainer: { backgroundColor: 'black', border: '4px solid #7f1d1d' },
              photoRadius: 'rounded-none',
              sticker: <Flame className="text-red-600 w-16 h-16 animate-pulse" />
          },
          { 
              id: 'frame-aot', 
              name: 'Survey Corps', 
              type: 'css', 
              bgColor: '#3f6212', 
              textColor: '#fef3c7', 
              styleContainer: { backgroundColor: '#2d4025', border: '4px solid #5c4d3c' },
              photoRadius: 'rounded-sm',
              sticker: <Swords className="text-amber-100 w-16 h-16" />
          },
          { 
              id: 'frame-pink', 
              name: 'Coquette Bow', 
              type: 'css', 
              bgColor: '#fdf2f8', 
              textColor: '#db2777', 
              styleContainer: { backgroundColor: '#fdf2f8', border: '4px dashed #f9a8d4' },
              photoRadius: 'rounded-[3rem]',
              sticker: <Heart className="text-pink-400 w-16 h-16 fill-pink-200" />
          },
          { 
              id: 'frame-retro', 
              name: 'Retro 90s', 
              type: 'css', 
              bgColor: '#fef08a', 
              textColor: '#854d0e', 
              styleContainer: { backgroundColor: '#fef08a', border: '8px solid #fb923c' },
              photoRadius: 'rounded-lg',
              sticker: <Sun className="text-orange-500 w-24 h-24" />
          },
          { 
              id: 'frame-mint', 
              name: 'Minty Fresh', 
              type: 'css', 
              bgColor: '#ecfdf5', 
              textColor: '#047857', 
              styleContainer: { backgroundColor: '#d1fae5', border: '2px solid #6ee7b7' },
              photoRadius: 'rounded-xl',
              sticker: <Sparkles className="text-emerald-500 w-12 h-12" />
          },
          { 
              id: 'frame-neon', 
              name: 'Neon City', 
              type: 'css', 
              bgColor: '#09090b', 
              textColor: '#22d3ee', 
              styleContainer: { backgroundColor: '#09090b', border: '2px solid #06b6d4', boxShadow: 'inset 0 0 20px rgba(6,182,212,0.5)' },
              photoRadius: 'rounded-sm',
              sticker: <Zap className="text-yellow-400 w-16 h-16 fill-yellow-400" />
          },
          { 
              id: 'frame-purple', 
              name: 'Lavender Haze', 
              type: 'css', 
              bgColor: '#f3e8ff', 
              textColor: '#7e22ce', 
              styleContainer: { backgroundColor: '#f3e8ff', border: '4px solid white' },
              photoRadius: 'rounded-3xl',
              sticker: <Moon className="text-purple-400 w-12 h-12" />
          },
          { 
              id: 'frame-cloud', 
              name: 'Sky Blue', 
              type: 'css', 
              bgColor: '#e0f2fe', 
              textColor: '#0369a1', 
              styleContainer: { backgroundColor: '#e0f2fe', border: '8px solid white' },
              photoRadius: 'rounded-[40px]',
              sticker: <Cloud className="text-white w-24 h-24 fill-white drop-shadow-md" />
          },
          { 
              id: 'frame-spooky', 
              name: 'Spooky Cute', 
              type: 'css', 
              bgColor: '#27272a', 
              textColor: '#a78bfa', 
              styleContainer: { backgroundColor: '#27272a', border: '4px dashed #52525b' },
              photoRadius: 'rounded-md',
              sticker: <Ghost className="text-white w-16 h-16" />
          }
      ].map(t => ({ ...t, layoutId: 'classic-white' })), 
      
      // Template khusus untuk Kanvas Baru (1200x1800)
      { 
          id: 'user-frame-1200',
          layoutId: 'grid-4r', 
          name: 'Custom User Frame', 
          type: 'css', 
          bgColor: 'transparent', 
          textColor: 'black', 
          overlayUrl: 'https://lh3.googleusercontent.com/d/1IrDcq0fvolJTy7D8K07qtWODhmDoOi_9',
          styleContainer: { backgroundColor: 'white' },
          photoRadius: 'rounded-none',
          hideFooter: true
      },
      { 
          id: 'grid-minimal-1200',
          layoutId: 'grid-4r', 
          name: 'Grid Minimalist', 
          type: 'css', 
          bgColor: '#ffffff', 
          textColor: 'black', 
          styleContainer: { backgroundColor: 'white' },
          photoRadius: 'rounded-2xl',
          hideFooter: false
      },
      {
          id: 'grid-aestho-yeay-1200',
          layoutId: 'grid-4r',
          name: 'Aestho Yeay',
          type: 'css',
          bgColor: 'transparent',
          textColor: 'black',
          overlayUrl: 'https://lh3.googleusercontent.com/d/1VSwrR4utvK7JSh30uONwwvoqzrNVNJFC',
          styleContainer: { backgroundColor: 'white' },
          photoRadius: 'rounded-none',
          hideFooter: true
      },
      {
          id: 'grid-aestho-fun-1200',
          layoutId: 'grid-4r',
          name: 'Aestho Fun',
          type: 'css',
          bgColor: 'transparent',
          textColor: 'black',
          overlayUrl: 'https://lh3.googleusercontent.com/d/1yLp1pIM8RGJm1L_KiT-E-85DWH3EAlqB',
          styleContainer: { backgroundColor: 'white' },
          photoRadius: 'rounded-none',
          hideFooter: true
      },
      {
          id: 'grid-aestho-flower-1200',
          layoutId: 'grid-4r',
          name: 'Aestho Flower',
          type: 'css',
          bgColor: 'transparent',
          textColor: 'black',
          overlayUrl: 'https://lh3.googleusercontent.com/d/1NwB0rgnRrhmO3KYhQY0PNDZ2W_kRNnZu',
          styleContainer: { backgroundColor: 'white' },
          photoRadius: 'rounded-none',
          hideFooter: true
      },
      {
          id: 'grid-aestho-memories-1200',
          layoutId: 'grid-4r',
          name: 'Aestho Memories',
          type: 'css',
          bgColor: 'transparent',
          textColor: 'black',
          overlayUrl: 'https://lh3.googleusercontent.com/d/1x4qqdtEAr3N-WW27ke02lRQigJ_gvjLn',
          styleContainer: { backgroundColor: 'white' },
          photoRadius: 'rounded-none',
          hideFooter: true
      },
      {
          id: 'grid-aestho-envelope-1200',
          layoutId: 'grid-4r',
          name: 'Aestho Envelope',
          type: 'css',
          bgColor: 'transparent',
          textColor: 'black',
          overlayUrl: 'https://lh3.googleusercontent.com/d/1jjTnE6LARUWgBo9Bae9u2ERrC8AIf6up',
          styleContainer: { backgroundColor: 'white' },
          photoRadius: 'rounded-none',
          hideFooter: true
      }
  ];

  // ==================================================================================
  // 2. LOGIC APLIKASI
  // ==================================================================================

  const defaultStickers = [
    'https://cdn-icons-png.flaticon.com/512/763/763725.png', 
    'https://cdn-icons-png.flaticon.com/512/1077/1077221.png', 
    'https://cdn-icons-png.flaticon.com/512/138/138533.png', 
    'https://cdn-icons-png.flaticon.com/512/1188/1188098.png', 
    'https://cdn-icons-png.flaticon.com/512/2850/2850731.png', 
    'https://cdn-icons-png.flaticon.com/512/732/732221.png', 
    'https://cdn-icons-png.flaticon.com/512/2913/2913008.png', 
    'https://cdn-icons-png.flaticon.com/512/833/833472.png', 
    'https://cdn-icons-png.flaticon.com/512/1164/1164620.png', 
    'https://cdn-icons-png.flaticon.com/512/1046/1046374.png' 
  ];

  // Dark mode dibuat pakai class strategy Tailwind.
  // Ini penting agar dark mode jalan di VSCode/Vite, bukan hanya di Google Canvas.
  const getInitialDarkMode = () => {
      if (typeof window === 'undefined') return false;

      const savedTheme = window.localStorage.getItem('aestho-theme');
      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;

      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const { lang, toggleLanguage, t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const isTogetherPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/together');
  const initialTogetherCode = useMemo(() => {
    if (typeof window === 'undefined') return '';
    if (window.location.pathname.startsWith('/together')) {
      return window.location.pathname.replace('/together', '').replace(/^\//, '').trim().toUpperCase();
    }
    return '';
  }, []);

  const [currentView, setCurrentView] = useState(() => (isTogetherPath ? 'together-setup' : 'home')); 
  const [selectedLayout, setSelectedLayout] = useState(() => (isTogetherPath ? 'classic-white' : null));
  const [selectedMode, setSelectedMode] = useState(() => (isTogetherPath ? 'together' : null));
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);

  // Jika guest masuk lewat URL langsung (/together/ASTH-XXXX), ambil layout_id room dari Supabase
  useEffect(() => {
    if (initialTogetherCode && supabase) {
      supabase
        .from('aestho_together_rooms')
        .select('layout_id')
        .eq('id', initialTogetherCode)
        .single()
        .then(({ data }) => {
          if (data?.layout_id) {
            setSelectedLayout(data.layout_id);
            setSelectedStripPhotos(Array(data.layout_id === 'grid-4r' ? 6 : 4).fill(null));
          }
        })
        .catch(() => {});
    }
  }, [initialTogetherCode, supabase]);

  // --- AESTHO TOGETHER REALTIME & WEBRTC STATE ---
  const [togetherRoomId, setTogetherRoomId] = useState(() => initialTogetherCode || '');
  const [togetherRole, setTogetherRole] = useState(() => (initialTogetherCode ? 'guest' : null));
  const [togetherPeerConnected, setTogetherPeerConnected] = useState(false);
  const togetherPeerId = useMemo(() => generatePeerId(), []);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const togetherPendingIce = useRef([]);
  const hasRemoteDescRef = useRef(false);
  const [togetherDiagnostic, setTogetherDiagnostic] = useState({
    iceState: 'new',
    connState: 'new',
    candidateType: 'unknown',
    hasRemoteTrack: false,
    remoteVideoPlaying: false,
    lastHeartbeat: Date.now(),
    isWaitingSnapshot: false,
  });
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const pendingGuestSnapshotsRef = useRef(new Map());
  const [isMicOn, setIsMicOn] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(stripTemplates[0]);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState(null);

  const [currentFilter, setCurrentFilter] = useState(filters[0]);
  const [timerDuration, setTimerDuration] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState([]); 
  const [capturedClips, setCapturedClips] = useState([]);
  
  const [selectedStripPhotos, setSelectedStripPhotos] = useState([null, null, null, null]); 
  
  // Sticker State
  const [placedStickers, setPlacedStickers] = useState([]);
  const [userStickers, setUserStickers] = useState([]);
  const [activeStickerId, setActiveStickerId] = useState(null);
  const [dragState, setDragState] = useState({ isDragging: false, id: null, startX: 0, startY: 0, initX: 0, initY: 0, scale: 1 });
  const stickerUploadRef = useRef(null);

  // Script Loading & Download state
  const [isDownloadingJPG, setIsDownloadingJPG] = useState(false);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);

  // Notification State
  const [toastMessage, setToastMessage] = useState(null);

  // QR Result State
  const [qrResultUrl, setQrResultUrl] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrGenerationMessage, setQrGenerationMessage] = useState('');

  const MAX_PHOTOS = 8;

  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // ==================================================================================
  // OPTIMASI PERFORMA MOBILE
  // ==================================================================================
  // Foto dari kamera/upload HP bisa sangat besar dan membuat React + html2canvas berat.
  // Jadi foto disimpan sebagai JPEG yang sudah diperkecil, bukan PNG/base64 ukuran asli.
  const PHOTO_MAX_SIZE_DESKTOP = 1400;
  const PHOTO_MAX_SIZE_MOBILE = 1100;
  const PHOTO_JPEG_QUALITY = 0.86;

  const getOptimizedPhotoMaxSize = () => {
      if (typeof window === 'undefined') return PHOTO_MAX_SIZE_DESKTOP;
      return window.innerWidth < 768 ? PHOTO_MAX_SIZE_MOBILE : PHOTO_MAX_SIZE_DESKTOP;
  };

  const getExportScale = () => {
      if (typeof window === 'undefined') return 2;
      // Di HP scale 2 terlalu berat, terutama untuk grid 1200x1800.
      // Desktop tetap scale 2 agar hasil JPG tajam.
      if (window.innerWidth < 768) return selectedLayout === 'grid-4r' ? 1 : 1.25;
      return 2;
  };

  const getVideoRenderScale = () => {
      if (typeof window === 'undefined') return 0.55;

      // Dibuat lebih ringan supaya export Live Moment tidak error/patah-patah.
      // Video tetap terlihat bagus, tapi canvas tidak terlalu berat untuk HP.
      if (window.innerWidth < 768) {
          return selectedLayout === 'grid-4r' ? 0.36 : 0.48;
      }

      return selectedLayout === 'grid-4r' ? 0.52 : 0.62;
  };

  const videoRef = useRef(null);
  const characterListRef = useRef(null); 
  const animeListRef = useRef(null); 
  const templateListRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const autoQRStartedRef = useRef(false);
  
  const staticStripRef = useRef(null); // Ref untuk export Canvas ke JPG
  const baseStripRef = useRef(null); // Ref untuk base background saat render Video
  const togetherRecordIntervalRef = useRef(null);
  const togetherCanvasRef = useRef(null);

  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  // Dynamic Content State (Frames & Characters from Supabase)
  const [dynamicTemplates, setDynamicTemplates] = useState([]);
  const [dynamicCharacters, setDynamicCharacters] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadFrames = async () => {
      if (!supabase) return;
      try {
        const framesData = await fetchActiveFrames(supabase);
        if (isMounted && Array.isArray(framesData) && framesData.length > 0) {
          const formatted = framesData.map(formatDbFrameToTemplate);
          setDynamicTemplates(formatted);
          console.log(`[Aestho] ${formatted.length} frame dinamis dari Supabase berhasil dimuat.`);
        }
      } catch (err) {
        console.warn('[Aestho] Fallback: Gagal memuat frame dinamis dari Supabase:', err);
      }
    };

    const loadCharacters = async () => {
      if (!supabase) return;
      try {
        const charsData = await fetchActiveCharacters(supabase);
        if (isMounted && Array.isArray(charsData) && charsData.length > 0) {
          const formatted = charsData.map(formatDbCharacterToAppCharacter);
          setDynamicCharacters(formatted);
          console.log(`[Aestho] ${formatted.length} karakter dinamis dari Supabase berhasil dimuat.`);
        }
      } catch (err) {
        console.warn('[Aestho] Fallback: Gagal memuat karakter dinamis dari Supabase:', err);
      }
    };

    loadFrames();
    loadCharacters();

    return () => { isMounted = false; };
  }, []);

  // Merged Templates (Hardcoded + Dynamic dari Supabase)
  const allTemplates = useMemo(() => {
    return [...stripTemplates, ...dynamicTemplates];
  }, [dynamicTemplates]);

  // Merged Anime Series & Characters (Hardcoded + Dynamic)
  const allAnimeOptions = useMemo(() => {
    if (!dynamicCharacters || dynamicCharacters.length === 0) {
      return animeOptions;
    }

    const cloned = animeOptions.map((series) => ({
      ...series,
      characters: [...series.characters]
    }));

    const extraSeriesMap = {};

    dynamicCharacters.forEach((dynChar) => {
      const seriesName = (dynChar.series || 'Custom').trim();
      const lower = seriesName.toLowerCase();

      if (lower.includes('genshin')) {
        const genshin = cloned.find((s) => s.id === 'genshin');
        if (genshin) genshin.characters.push(dynChar);
        return;
      }

      if (lower.includes('honkai') || lower.includes('star rail') || lower === 'hsr') {
        const hsr = cloned.find((s) => s.id === 'hsr');
        if (hsr) hsr.characters.push(dynChar);
        return;
      }

      if (lower.includes('jujutsu') || lower.includes('jjk')) {
        const jjk = cloned.find((s) => s.id === 'jjk');
        if (jjk) jjk.characters.push(dynChar);
        return;
      }

      const existing = cloned.find((s) => s.name.toLowerCase() === lower);
      if (existing) {
        existing.characters.push(dynChar);
        return;
      }

      if (!extraSeriesMap[seriesName]) {
        extraSeriesMap[seriesName] = {
          id: `custom-series-${seriesName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: seriesName,
          logoUrl: 'https://placehold.co/400x200/transparent/333333?text=' + encodeURIComponent(seriesName),
          color: 'hover:shadow-pink-400/50',
          hoverText: 'group-hover:text-pink-500',
          icon: <Sparkles className="text-pink-500" />,
          characters: []
        };
      }
      extraSeriesMap[seriesName].characters.push(dynChar);
    });

    return [...cloned, ...Object.values(extraSeriesMap)];
  }, [dynamicCharacters]);

  const currentLayoutData = layouts.find(l => l.id === selectedLayout);
  const currentAnimeData = allAnimeOptions.find(a => a.id === selectedAnime);
  const selectedCharacterData = currentAnimeData?.characters.find(c => c.id === selectedFrame);

  const isGenshinTemplate = (template = {}) => {
      const templateId = String(template.id || '').toLowerCase();
      const templateName = String(template.name || '').toLowerCase();
      const templateCategory = String(template.category || '').toLowerCase();

      return (
          templateCategory === 'genshin' ||
          templateId.includes('citlali') ||
          templateId.includes('tartaglia') ||
          templateId.includes('genshin') ||
          templateName.includes('citlali') ||
          templateName.includes('tartaglia') ||
          templateName.includes('genshin') ||
          templateName.includes('teyvat')
      );
  };

  const getTemplateCategoryItems = (category) => {
      const cat = String(category || '').toLowerCase().trim();
      const curLayout = String(selectedLayout || 'classic-white').toLowerCase().trim();

      // Filter: sertakan template yang spesifik untuk curLayout ATAU universal (tanpa layoutId spesifik)
      const validTemplates = allTemplates.filter((t) => {
          if (!t.layoutId) return true; // Universal: bisa digunakan di layout mana pun
          return String(t.layoutId).toLowerCase().trim() === curLayout;
      });

      // Tab GENSHIN: semua frame dengan category/nama genshin (Citlali, Tartaglia, dll.)
      if (cat === 'genshin') {
          const genshinList = validTemplates.filter(isGenshinTemplate);
          return genshinList.length > 0 ? genshinList : allTemplates.filter(isGenshinTemplate);
      }

      // Tab AESTHO: semua frame selain genshin (termasuk category aestho & custom)
      if (cat === 'aestho') {
          const aesthoList = validTemplates.filter((t) => !isGenshinTemplate(t));
          return aesthoList.length > 0 ? aesthoList : allTemplates.filter((t) => !isGenshinTemplate(t));
      }

      return validTemplates;
  };

  const visibleTemplateOptions = selectedTemplateCategory ? getTemplateCategoryItems(selectedTemplateCategory) : [];
  const showSelectedShinhlinCredit = true;

  // Deteksi mobile hanya untuk mengatur skala preview/editor.
  // Desktop tetap memakai ukuran lama karena isMobile = false di layar md ke atas.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
      if (typeof document === 'undefined') return;

      const root = document.documentElement;
      root.classList.toggle('dark', isDarkMode);
      window.localStorage.setItem('aestho-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
      setIsDarkMode(prev => !prev);
  };

  // Load external scripts (html2canvas)
  useEffect(() => {
    const loadScript = (src, id) => {
        if (!document.getElementById(id)) {
            const script = document.createElement('script');
            script.src = src;
            script.id = id;
            script.crossOrigin = "anonymous";
            document.body.appendChild(script);
        }
    };
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas-script');
  }, []);

  const showToast = (message) => {
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3500);
  };

  const getOverlayImage = (character, photoIndex) => {
    if (!character || !character.overlayImg) return null;
    let img = null;
    if (Array.isArray(character.overlayImg)) {
        const poseIndex = Math.floor(photoIndex / 2);
        img = character.overlayImg[poseIndex % character.overlayImg.length];
    } else {
        img = character.overlayImg;
    }
    if (!img || (typeof img === 'string' && img.trim() === '')) {
        const name = encodeURIComponent(character.name || 'Character');
        return `https://placehold.co/600x800/transparent/3b82f6?text=${name}+Pose`;
    }
    return img;
  };

  const getOverlayWidth = (character, photoIndex) => {
      if (!character) return 'w-[60%]';
      let width = 'w-[60%]';
      if (Array.isArray(character.overlayImg)) {
          const poseIndex = Math.floor(photoIndex / 2) % character.overlayImg.length;
          if (character.styles && character.styles[poseIndex]) {
              width = character.styles[poseIndex];
          }
      }
      return width;
  };

  const getOverlayPoseIndex = (character, photoIndex) => {
      if (!character || !Array.isArray(character.overlayImg) || character.overlayImg.length === 0) return 0;
      return Math.floor(photoIndex / 2) % character.overlayImg.length;
  };

  const getOverlayHeightPercent = (character, photoIndex) => {
      if (!character || !character.heightStyles) return null;
      const poseIndex = getOverlayPoseIndex(character, photoIndex);
      return character.heightStyles[poseIndex] || null;
  };

  const getOverlayInlineStyle = (character, photoIndex) => {
      const heightPercent = getOverlayHeightPercent(character, photoIndex);
      if (!heightPercent) return {};

      return {
          height: `${heightPercent}%`,
          width: 'auto',
          maxWidth: 'none',
          objectFit: 'contain',
          objectPosition: character?.position === 'left' ? 'left bottom' : 'right bottom'
      };
  };

  const getCameraOverlay = (character, shotCount) => {
      if (!character || !character.overlayImg) return null;
      let img = null;
      if (Array.isArray(character.overlayImg)) {
          const poseIndex = Math.floor(shotCount / 2);
          img = character.overlayImg[poseIndex % character.overlayImg.length];
      } else {
          img = character.overlayImg;
      }
      if (!img || (typeof img === 'string' && img.trim() === '')) {
          const name = encodeURIComponent(character.name || 'Character');
          return `https://placehold.co/600x800/transparent/3b82f6?text=${name}+Pose`;
      }
      return img;
  };


  // --- CAMERA & RECORDING LOGIC ---
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [useMockCamera, setUseMockCamera] = useState(false);

  const startCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(false);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const shouldEnableAudio = selectedMode === 'together';
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: window.innerWidth < 768 ? 960 : 1280 },
            height: { ideal: window.innerWidth < 768 ? 720 : 960 }
          },
          audio: shouldEnableAudio ? {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } : false
        });
      } catch (audioErr) {
        if (shouldEnableAudio) {
          console.warn("Microphone not available, falling back to video only:", audioErr);
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: window.innerWidth < 768 ? 960 : 1280 },
              height: { ideal: window.innerWidth < 768 ? 720 : 960 }
            },
            audio: false
          });
        } else {
          throw audioErr;
        }
      }

      // Pastikan audio track disinkronkan dengan state isMicOn
      if (shouldEnableAudio) {
        mediaStream.getAudioTracks().forEach(track => {
          track.enabled = isMicOn;
        });
      }

      setStream(mediaStream);
    } catch (err) {
      console.error("Camera Error:", err);
      setCameraError(true);
    } finally {
      setIsCameraLoading(false);
    }
  };

  const toggleMic = async () => {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        const audioTrack = micStream.getAudioTracks()[0];
        if (audioTrack) {
          stream.addTrack(audioTrack);
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(audioTrack, stream);
          }
          setIsMicOn(true);
          showToast('Mikrofon aktif');
        }
      } catch (err) {
        console.error('Failed to enable mic:', err);
        showToast('Gagal menyalakan mikrofon: izin ditolak');
      }
      return;
    }

    const nextState = !isMicOn;
    audioTracks.forEach(track => {
      track.enabled = nextState;
    });
    setIsMicOn(nextState);
    showToast(nextState ? 'Mikrofon aktif' : 'Mikrofon dimatikan');
  };

  useEffect(() => {
    if (currentView === 'camera-session') {
      if (!useMockCamera) startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [currentView, useMockCamera, selectedMode]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(e => console.error("Auto-play blocked:", e));
      };
    }
  }, [stream]);

  // --- AESTHO TOGETHER: WEBRTC & REALTIME SESSION EFFECT ---
  const copyTogetherInviteLink = async () => {
    if (!togetherRoomId) return;
    const url = `${window.location.origin}/together/${togetherRoomId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link room disalin ke clipboard!');
    } catch {
      showToast('Gagal menyalin link.');
    }
  };

  const startTogetherCountdown = (duration) => {
    if (isCountingDown) return;
    setIsCountingDown(true);
    setCountdownValue(duration);
    startRecording();
    const timerInterval = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          takePhoto();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (currentView !== 'camera-session' || selectedMode !== 'together' || !togetherRoomId || !stream) {
      return;
    }

    let isMounted = true;
    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = pc;
    hasRemoteDescRef.current = false;
    togetherPendingIce.current = [];

    // Helper untuk memproses foto sinkronisasi dari Host
    const handleIncomingSyncedPhoto = (payload) => {
      if (!isMounted) return;
      setIsCountingDown(false);
      stopRecording();
      if (payload.photoUrl) {
        setCapturedPhotos((prev) => {
          const updated = [...prev];
          if (typeof payload.photoIndex === 'number') {
            updated[payload.photoIndex] = payload.photoUrl;
          } else if (!updated.includes(payload.photoUrl)) {
            updated.push(payload.photoUrl);
          }
          return updated;
        });
      }
      if (payload.isFinished || (typeof payload.photoIndex === 'number' && payload.photoIndex >= MAX_PHOTOS - 1)) {
        triggerTransition(() => setCurrentView('result-selection'));
      }
    };

    // Setup WebRTC DataChannel (P2P direct channel untuk sinkronisasi instan)
    if (togetherRole === 'host') {
      try {
        const dc = pc.createDataChannel('together-photos');
        dataChannelRef.current = dc;
        dc.onopen = () => console.log('[Together] DataChannel opened on Host');
        dc.onclose = () => console.log('[Together] DataChannel closed on Host');
      } catch (e) {
        console.warn('[Together] DataChannel create error:', e);
      }
    }

    pc.ondatachannel = (event) => {
      const dc = event.channel;
      dataChannelRef.current = dc;
      dc.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'photo-synced') {
            handleIncomingSyncedPhoto(data);
          } else if (data.type === 'session-finished') {
            if (data.layout_id) {
              setSelectedLayout(data.layout_id);
              setSelectedStripPhotos(Array(data.layout_id === 'grid-4r' ? 6 : 4).fill(null));
            }
            setIsCountingDown(false);
            stopRecording();
            triggerTransition(() => setCurrentView('result-selection'));
          } else if (data.type === 'sync-layout') {
            if (data.layout_id) {
              setSelectedLayout(data.layout_id);
              setSelectedStripPhotos(Array(data.layout_id === 'grid-4r' ? 6 : 4).fill(null));
            }
          }
        } catch (err) {
          console.error('[Together] DataChannel message error:', err);
        }
      };
    };

    stream.getTracks().forEach((track) => {
      try {
        pc.addTrack(track, stream);
      } catch (err) {
        console.warn('Gagal menambah track lokal:', err);
      }
    });

    pc.ontrack = (event) => {
      if (!isMounted) return;
      let streamToUse = event.streams && event.streams[0];
      if (!streamToUse) {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        remoteStreamRef.current.addTrack(event.track);
        streamToUse = remoteStreamRef.current;
      } else {
        remoteStreamRef.current = streamToUse;
      }

      setTogetherDiagnostic((prev) => ({ ...prev, hasRemoteTrack: true }));

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = streamToUse;
        remoteVideoRef.current.playsInline = true;
        remoteVideoRef.current.muted = true;
        const tryPlay = () => {
          remoteVideoRef.current.play().then(() => {
            setTogetherDiagnostic((prev) => ({ ...prev, remoteVideoPlaying: true }));
          }).catch((e) => console.warn('[Together] Remote video play blocked:', e));
        };
        remoteVideoRef.current.onloadedmetadata = tryPlay;
        tryPlay();
      }

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = streamToUse;
        remoteAudioRef.current.play().catch((e) => console.warn('[Together] Remote audio play blocked:', e));
      }

      setTogetherPeerConnected(true);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candStr = event.candidate.candidate || '';
        let type = 'unknown';
        if (candStr.includes('typ relay')) type = 'relay (TURN)';
        else if (candStr.includes('typ srflx')) type = 'srflx (STUN)';
        else if (candStr.includes('typ host')) type = 'host (LAN)';

        setTogetherDiagnostic((prev) => ({ ...prev, candidateType: type }));

        if (togetherRoomId) {
          sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'ice-candidate', event.candidate.toJSON());
        }
      }
    };

    const updateConnectionState = () => {
      if (!isMounted) return;
      const connState = pc.connectionState;
      const iceState = pc.iceConnectionState;
      console.log(`[Together RTC] State: conn=${connState}, ice=${iceState}`);

      setTogetherDiagnostic((prev) => ({
        ...prev,
        connState,
        iceState,
      }));

      const isConnected =
        connState === 'connected' ||
        iceState === 'connected' ||
        iceState === 'completed';

      const isDisconnected =
        ['disconnected', 'failed', 'closed'].includes(connState) &&
        ['disconnected', 'failed', 'closed'].includes(iceState);

      if (isConnected) {
        setTogetherPeerConnected(true);
      } else if (isDisconnected) {
        setTogetherPeerConnected(false);
      }
    };

    pc.onconnectionstatechange = updateConnectionState;
    pc.oniceconnectionstatechange = updateConnectionState;

    const unsubscribeSignals = subscribeTogetherSignals(
      supabase,
      togetherRoomId,
      togetherPeerId,
      async (signal) => {
        if (!isMounted) return;
        const { type, payload } = signal;

        try {
          if (type === 'guest-ready' && togetherRole === 'host') {
            if (pc.signalingState === 'stable' && pc.connectionState !== 'connected') {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              await sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'offer', {
                sdp: offer.sdp,
                type: offer.type,
                layout_id: selectedLayout,
              });
            }
          } else if (type === 'host-ready' && togetherRole === 'guest') {
            if (payload?.layout_id) {
              setSelectedLayout(payload.layout_id);
              setSelectedStripPhotos(Array(payload.layout_id === 'grid-4r' ? 6 : 4).fill(null));
            }
            if (pc.connectionState !== 'connected') {
              sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'guest-ready', {});
            }
          } else if (type === 'offer' && togetherRole === 'guest') {
            if (payload?.layout_id) {
              setSelectedLayout(payload.layout_id);
              setSelectedStripPhotos(Array(payload.layout_id === 'grid-4r' ? 6 : 4).fill(null));
            }
            if (pc.signalingState !== 'stable') {
              await Promise.all([
                pc.setLocalDescription({ type: 'rollback' }).catch(() => {}),
              ]);
            }
            await pc.setRemoteDescription(new RTCSessionDescription(payload));
            hasRemoteDescRef.current = true;
            for (const cand of togetherPendingIce.current) {
              try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch (e) {}
            }
            togetherPendingIce.current = [];

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'answer', {
              sdp: answer.sdp,
              type: answer.type,
            });
          } else if (type === 'answer' && togetherRole === 'host') {
            if (pc.signalingState === 'have-local-offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(payload));
              hasRemoteDescRef.current = true;
              for (const cand of togetherPendingIce.current) {
                try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch (e) {}
              }
              togetherPendingIce.current = [];
            }
          } else if (type === 'ice-candidate') {
            if (hasRemoteDescRef.current && pc.remoteDescription) {
              try { await pc.addIceCandidate(new RTCIceCandidate(payload)); } catch (e) {}
            } else {
              togetherPendingIce.current.push(payload);
            }
          } else if (type === 'capture-trigger') {
            startTogetherCountdown(payload.duration || timerDuration);
          } else if (type === 'sync-filter') {
            if (payload.filterId) {
              const matchedFilter = filters.find((f) => f.id === payload.filterId);
              if (matchedFilter) setCurrentFilter(matchedFilter);
            }
          } else if (type === 'sync-layout') {
            if (payload?.layout_id) {
              setSelectedLayout(payload.layout_id);
              setSelectedStripPhotos(Array(payload.layout_id === 'grid-4r' ? 6 : 4).fill(null));
            }
          } else if (type === 'guest-snapshot' && togetherRole === 'host') {
            if (payload?.photoIndex !== undefined && payload?.photoUrl) {
              pendingGuestSnapshotsRef.current.set(payload.photoIndex, payload.photoUrl);
              console.log(`[Together Host] Snapshot Guest diterima untuk photo #${payload.photoIndex}`);
              setTogetherDiagnostic((prev) => ({
                ...prev,
                lastHeartbeat: Date.now(),
              }));
            }
          } else if (type === 'photo-synced') {
            handleIncomingSyncedPhoto(payload);
          } else if (type === 'session-finished') {
            if (payload?.layout_id) {
              setSelectedLayout(payload.layout_id);
              setSelectedStripPhotos(Array(payload.layout_id === 'grid-4r' ? 6 : 4).fill(null));
            }
            setIsCountingDown(false);
            stopRecording();
            triggerTransition(() => setCurrentView('result-selection'));
          }
        } catch (err) {
          console.error('[Together] Signal error:', err);
        }
      }
    );

    // Kirim sinyal inisial + heartbeat agar tidak terlewat jika salah satu pihak belum subscribe
    if (togetherRole === 'guest') {
      sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'guest-ready', {});
    } else if (togetherRole === 'host') {
      sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'host-ready', { layout_id: selectedLayout });
    }

    const readyInterval = setInterval(() => {
      if (!isMounted) return;
      if (pc.connectionState !== 'connected' && pc.iceConnectionState !== 'connected') {
        if (togetherRole === 'guest') {
          sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'guest-ready', {});
        } else if (togetherRole === 'host') {
          sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'host-ready', { layout_id: selectedLayout });
        }
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(readyInterval);
      unsubscribeSignals?.();
      if (dataChannelRef.current) {
        try { dataChannelRef.current.close(); } catch (e) {}
        dataChannelRef.current = null;
      }
      pc.close();
      peerConnectionRef.current = null;
      setTogetherPeerConnected(false);
    };
  }, [currentView, selectedMode, togetherRoomId, togetherRole, stream, togetherPeerId, supabase, timerDuration]);

  useEffect(() => {
    if (remoteStreamRef.current) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play().catch((e) => console.error('Remote play blocked:', e));
        };
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStreamRef.current;
        remoteAudioRef.current.play().catch((e) => console.error('Remote audio blocked:', e));
      }
    }
  }, [togetherPeerConnected, currentView]);

  const triggerTransition = (callback) => {
    setIsViewTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => {
        setIsViewTransitioning(false);
      }, 30);
    }, 120);
  };
  const handleStart = () => triggerTransition(() => setCurrentView('layout'));
  const handleLayoutConfirm = () => selectedLayout && triggerTransition(() => setCurrentView('mode'));
  const handleModeConfirm = () => {
    setCapturedPhotos([]); 
    setCapturedClips([]); 
    setSelectedStripPhotos(Array(selectedLayout === 'grid-4r' ? 6 : 4).fill(null));
    setUseMockCamera(false);
    if (selectedMode === 'original') triggerTransition(() => setCurrentView('camera-session')); 
    else if (selectedMode === 'character') triggerTransition(() => setCurrentView('anime'));
    else if (selectedMode === 'together') triggerTransition(() => setCurrentView('together-setup'));
  };
  const handleAnimeSelect = (id) => { setSelectedAnime(id); triggerTransition(() => setCurrentView('frame')); };
  const handleFrameConfirm = () => triggerTransition(() => setCurrentView('camera-session'));
  const handleToTemplateSelection = () => {
      const defaultCat = (selectedMode === 'character' && selectedAnime === 'genshin') ? 'genshin' : 'aestho';
      setSelectedTemplateCategory(defaultCat);
      const categoryTemplates = getTemplateCategoryItems(defaultCat);
      if (categoryTemplates.length > 0) {
          setSelectedTemplate(categoryTemplates[0]);
      }
      triggerTransition(() => setCurrentView('template-selection'));
  };
  
  const handleToStickerEditor = () => {
      if (!selectedTemplateCategory) {
          showToast('Pilih koleksi frame dulu: Aestho atau Genshin.');
          return;
      }
      triggerTransition(() => setCurrentView('sticker-editor'));
  };
  
  const handleBackToTemplate = () => triggerTransition(() => setCurrentView('template-selection'));
  
  const handleToFinalResult = () => {
      setActiveStickerId(null);
      setQrResultUrl('');
      setQrGenerationMessage('');
      autoQRStartedRef.current = false;
      triggerTransition(() => setCurrentView('final-result')); 
  };
  const handleBackToHome = () => triggerTransition(() => { setCurrentView('home'); setSelectedLayout(null); });
  const handleBackToLayout = () => triggerTransition(() => { setCurrentView('layout'); setSelectedMode(null); });
  const handleBackToMode = () => triggerTransition(() => { setCurrentView('mode'); setSelectedAnime(null); });
  const handleBackToModeFromAnime = () => triggerTransition(() => { setCurrentView('mode'); setSelectedAnime(null); });
  const handleBackToAnimeFromFrame = () => triggerTransition(() => { setCurrentView('anime'); setSelectedFrame(null); });

  const handleBackFromCamera = () => {
      if (selectedMode === 'character') triggerTransition(() => setCurrentView('frame'));
      else if (selectedMode === 'together') triggerTransition(() => setCurrentView('together-setup'));
      else triggerTransition(() => setCurrentView('mode'));
  };

  const scrollCharacterList = (direction) => {
    if (characterListRef.current) {
        const scrollAmount = 200;
        if (direction === 'left') characterListRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        else characterListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollAnimeList = (direction) => {
    if (animeListRef.current) {
        const scrollAmount = 200;
        if (direction === 'left') animeListRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        else animeListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollTemplateList = (direction) => {
    if (templateListRef.current) {
        const scrollAmount = Math.max(220, templateListRef.current.clientWidth * 0.75);
        templateListRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  const handleTemplateCategorySelect = (category) => {
      setSelectedTemplateCategory(category);

      const categoryTemplates = getTemplateCategoryItems(category);
      if (categoryTemplates.length > 0) {
          setSelectedTemplate(categoryTemplates[0]);
      }

      requestAnimationFrame(() => {
          if (templateListRef.current) {
              templateListRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          }
      });
  };

  const startRecording = () => {
    if (!stream || useMockCamera) return;
    const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
    let selectedType = '';
    for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) { selectedType = type; break; }
    }
    if (!selectedType) return;
    try {
        let streamToRecord = stream;

        if (selectedMode === 'together') {
          const W = 640;
          const H = 480;
          const HALF = 320;
          if (!togetherCanvasRef.current) {
            togetherCanvasRef.current = document.createElement('canvas');
            togetherCanvasRef.current.width = W;
            togetherCanvasRef.current.height = H;
          }
          const canvas = togetherCanvasRef.current;
          const ctx = canvas.getContext('2d', { alpha: false });

          const hostVideo = togetherRole === 'host' ? videoRef.current : remoteVideoRef.current;
          const guestVideo = togetherRole === 'guest' ? videoRef.current : remoteVideoRef.current;

          const renderSide = (videoEl, xOffset) => {
            if (!videoEl || !videoEl.videoWidth || videoEl.videoWidth === 0) {
              ctx.fillStyle = '#18181b';
              ctx.fillRect(xOffset, 0, HALF, H);
              return;
            }
            const vw = videoEl.videoWidth;
            const vh = videoEl.videoHeight;
            const scale = Math.max(HALF / vw, H / vh);
            const dw = vw * scale;
            const dh = vh * scale;

            ctx.save();
            ctx.beginPath();
            ctx.rect(xOffset, 0, HALF, H);
            ctx.clip();
            ctx.translate(xOffset + HALF, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoEl, (HALF - dw) / 2, (H - dh) / 2, dw, dh);
            ctx.restore();
          };

          const drawTogetherFrame = () => {
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, W, H);
            renderSide(hostVideo, 0);
            renderSide(guestVideo, HALF);
          };

          drawTogetherFrame();
          if (togetherRecordIntervalRef.current) {
            clearInterval(togetherRecordIntervalRef.current);
          }
          togetherRecordIntervalRef.current = setInterval(drawTogetherFrame, 1000 / 25);

          streamToRecord = canvas.captureStream ? canvas.captureStream(25) : canvas.mozCaptureStream(25);
        }

        const recorder = new MediaRecorder(streamToRecord, { mimeType: selectedType });
        chunksRef.current = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: selectedType });
            const videoUrl = URL.createObjectURL(blob);
            setCapturedClips(prev => [...prev, videoUrl]);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
    } catch (e) { console.error("Recording error:", e); }
  };

  const stopRecording = () => {
      if (togetherRecordIntervalRef.current) {
          clearInterval(togetherRecordIntervalRef.current);
          togetherRecordIntervalRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
      } else if (useMockCamera) {
           setCapturedClips(prev => [...prev, "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"]);
      }
  };

  const handleShutterClick = () => {
    if (isCountingDown || capturedPhotos.length >= MAX_PHOTOS) return;

    if (selectedMode === 'together') {
      if (togetherRole === 'guest') {
        showToast('Hanya Host yang dapat memulai pengambilan foto.');
        return;
      }
      if (!togetherPeerConnected) {
        showToast('Menunggu teman terhubung terlebih dahulu (Status belum Connected).');
        return;
      }
      sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'capture-trigger', {
        duration: timerDuration,
      });
    }

    startTogetherCountdown(timerDuration);
  };

  const handleFilterSelect = (filter) => {
    setCurrentFilter(filter);
    if (selectedMode === 'together' && togetherRoomId) {
      sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'sync-filter', {
        filterId: filter.id,
      });
    }
  };

  const optimizeImageToDataUrl = (source, options = {}) => {
      const {
          mirror = false,
          filter = 'none',
          maxSize = getOptimizedPhotoMaxSize(),
          quality = PHOTO_JPEG_QUALITY
      } = options;

      return new Promise((resolve) => {
          try {
              const sw = source.videoWidth || source.naturalWidth || source.width || 640;
              const sh = source.videoHeight || source.naturalHeight || source.height || 480;
              const longestSide = Math.max(sw, sh);
              const resizeRatio = Math.min(1, maxSize / longestSide);
              const targetW = Math.max(1, Math.round(sw * resizeRatio));
              const targetH = Math.max(1, Math.round(sh * resizeRatio));

              const canvas = document.createElement('canvas');
              canvas.width = targetW;
              canvas.height = targetH;

              const ctx = canvas.getContext('2d', { alpha: false });
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, targetW, targetH);
              ctx.save();
              ctx.filter = filter || 'none';

              if (mirror) {
                  ctx.translate(targetW, 0);
                  ctx.scale(-1, 1);
              }

              ctx.drawImage(source, 0, 0, targetW, targetH);
              ctx.restore();


              resolve(canvas.toDataURL('image/jpeg', quality));
          } catch (err) {
              console.warn('Gagal optimasi foto, memakai cara biasa:', err);
              try {
                  const fallbackCanvas = document.createElement('canvas');
                  fallbackCanvas.width = source.videoWidth || source.naturalWidth || source.width || 640;
                  fallbackCanvas.height = source.videoHeight || source.naturalHeight || source.height || 480;
                  const fallbackCtx = fallbackCanvas.getContext('2d');
                  fallbackCtx.drawImage(source, 0, 0, fallbackCanvas.width, fallbackCanvas.height);
                  resolve(fallbackCanvas.toDataURL('image/jpeg', 0.82));
              } catch (fallbackErr) {
                  resolve(null);
              }
          }
      });
  };

  const takePhoto = async () => {
    setIsCountingDown(false);
    stopRecording();
    if (useMockCamera) {
        const mockUrl = `https://placehold.co/960x720/333/FFF.jpg?text=Photo+${capturedPhotos.length + 1}`;
        handlePhotoCaptured(mockUrl);
        return;
    }

    if (selectedMode === 'together') {
      const currentPhotoIndex = capturedPhotos.length;

      // 1. Ambil snapshot lokal dari kamera perangkat ini (baik Host maupun Guest)
      let localPhotoUrl = null;
      if (videoRef.current) {
        try {
          localPhotoUrl = await optimizeImageToDataUrl(videoRef.current, {
            mirror: true,
            filter: currentFilter.style || 'none',
          });
        } catch (e) {
          console.error('[Together] Gagal snapshot lokal:', e);
        }
      }

      if (togetherRole === 'guest') {
        // GUEST: Kirim snapshot lokal berkualitas penuh ke Host via Realtime signal
        if (localPhotoUrl) {
          sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'guest-snapshot', {
            photoIndex: currentPhotoIndex,
            photoUrl: localPhotoUrl,
          });
        }
        // Guest selesai mengambil foto lokalnya dan menunggu foto gabungan 'photo-synced' dari Host
        return;
      }

      // HOST: Menunggu snapshot dari Guest (atau fallback jika timeout), lalu menggabungkan kedua foto
      try {
        setTogetherDiagnostic((prev) => ({ ...prev, isWaitingSnapshot: true }));

        // Cek apakah snapshot dari Guest sudah diterima di pending map, atau tunggu hingga 2200ms
        let guestPhoto = pendingGuestSnapshotsRef.current.get(currentPhotoIndex);
        if (!guestPhoto) {
          const startTime = Date.now();
          while (!guestPhoto && Date.now() - startTime < 2200) {
            await new Promise((r) => setTimeout(r, 100));
            guestPhoto = pendingGuestSnapshotsRef.current.get(currentPhotoIndex);
          }
        }

        // Jika Guest snapshot tidak tiba via sinyal, fallback ke remoteVideoRef jika aktif
        if (!guestPhoto && remoteVideoRef.current && remoteVideoRef.current.videoWidth > 0) {
          guestPhoto = remoteVideoRef.current;
        }

        const combinedUrl = await combineTwoSnapshots(localPhotoUrl || videoRef.current, guestPhoto, {
          filter: currentFilter.style || 'none',
        });

        setTogetherDiagnostic((prev) => ({ ...prev, isWaitingSnapshot: false }));

        if (combinedUrl) {
          handlePhotoCaptured(combinedUrl);
        }
      } catch (err) {
        console.error('[Together] Host merge photo error:', err);
        setTogetherDiagnostic((prev) => ({ ...prev, isWaitingSnapshot: false }));
      }
      return;
    }

    if (videoRef.current) {
      try {
        // Preview filter hanya CSS di <video>, jadi filter tetap diterapkan ke canvas.
        // Bedanya sekarang hasil capture langsung di-resize + JPEG agar web tidak lemot.
        const imgUrl = await optimizeImageToDataUrl(videoRef.current, {
            mirror: true,
            filter: currentFilter.style || 'none'
        });
        if (imgUrl) handlePhotoCaptured(imgUrl);
      } catch (e) { console.error("Capture Failed:", e); }
    }
  };

  const handlePhotoCaptured = (imgUrl) => {
      const newPhotos = [...capturedPhotos, imgUrl];
      setCapturedPhotos(newPhotos);
      const isFinished = newPhotos.length >= MAX_PHOTOS;

      if (selectedMode === 'together' && togetherRole === 'host') {
        const photoIndex = newPhotos.length - 1;
        const syncPayload = {
          photoUrl: imgUrl,
          photoIndex,
          totalPhotos: newPhotos.length,
          isFinished,
        };

        // 1. Kirim via WebRTC DataChannel (P2P direct instan) jika terbuka
        if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
          try {
            dataChannelRef.current.send(JSON.stringify({
              type: 'photo-synced',
              ...syncPayload,
            }));
          } catch (e) {
            console.warn('[Together] DataChannel send failed:', e);
          }
        }

        // 2. Kirim via Realtime Broadcast & DB
        sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'photo-synced', syncPayload);

        // Jika sudah 8 foto, kirim sinyal session-finished
        if (isFinished) {
          if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
            try {
              dataChannelRef.current.send(JSON.stringify({
                type: 'session-finished',
                totalPhotos: newPhotos.length,
                layout_id: selectedLayout,
              }));
            } catch (e) {}
          }
          sendTogetherSignal(supabase, togetherRoomId, togetherPeerId, 'session-finished', {
            totalPhotos: newPhotos.length,
            layout_id: selectedLayout,
          });
        }
      }

      if (isFinished) {
          triggerTransition(() => setCurrentView('result-selection'));
      }
  };

  const handleUploadClick = () => { fileInputRef.current.click(); };

  const loadImageFromFile = (file) => {
      return new Promise((resolve) => {
          const objectUrl = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
              URL.revokeObjectURL(objectUrl);
              resolve(img);
          };
          img.onerror = () => {
              URL.revokeObjectURL(objectUrl);
              resolve(null);
          };
          img.src = objectUrl;
      });
  };

  const optimizeUploadedFile = async (file) => {
      const img = await loadImageFromFile(file);
      if (!img) return null;

      // Foto upload juga ikut filter aktif, tapi langsung diperkecil agar tidak membebani HP.
      return optimizeImageToDataUrl(img, {
          mirror: false,
          filter: currentFilter.style || 'none'
      });
  };

  const handleFileChange = async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const remaining = MAX_PHOTOS - capturedPhotos.length;
      if (remaining <= 0) {
          e.target.value = '';
          return;
      }

      const filesToProcess = files.slice(0, remaining);
      showToast('Sedang memproses foto agar lebih ringan...');

      try {
          const images = (await Promise.all(filesToProcess.map(optimizeUploadedFile))).filter(Boolean);
          if (!images.length) {
              showToast('Foto gagal diproses. Coba pilih foto lain.');
              e.target.value = '';
              return;
          }

          const updatedPhotos = [...capturedPhotos, ...images];
          setCapturedPhotos(updatedPhotos);
          setCapturedClips(prev => [...prev, ...new Array(images.length).fill(null)]);
          if (updatedPhotos.length >= MAX_PHOTOS) {
               setTimeout(() => triggerTransition(() => setCurrentView('result-selection')), 300);
          }
      } catch (err) {
          console.error('Upload processing failed:', err);
          showToast('Gagal memproses foto upload. Coba ulangi lagi.');
      } finally {
          e.target.value = '';
      }
  };

  const toggleTimer = () => {
    if (timerDuration === 3) setTimerDuration(5);
    else if (timerDuration === 5) setTimerDuration(10);
    else setTimerDuration(3);
  };

  const handleSelectPhoto = (photo, originalIndex) => {
      if (selectedStripPhotos.some(p => p && p.originalIndex === originalIndex)) return;
      const emptyIndex = selectedStripPhotos.findIndex(p => p === null);
      if (emptyIndex !== -1) {
          const newStrip = [...selectedStripPhotos];
          newStrip[emptyIndex] = { url: photo, originalIndex: originalIndex }; 
          setSelectedStripPhotos(newStrip);
      }
  };

  const handleRemoveFromStrip = (index) => {
      const newStrip = [...selectedStripPhotos];
      newStrip[index] = null;
      setSelectedStripPhotos(newStrip);
  };

  const handleDragStart = (e, index) => {
      setDraggedItemIndex(index);
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

  const handleDrop = (e, targetIndex) => {
      e.preventDefault();
      if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;
      const newStrip = [...selectedStripPhotos];
      const draggedItem = newStrip[draggedItemIndex];
      const targetItem = newStrip[targetIndex];
      newStrip[targetIndex] = draggedItem;
      newStrip[draggedItemIndex] = targetItem;
      setSelectedStripPhotos(newStrip);
      setDraggedItemIndex(null);
  };

  // --- STICKER LOGIC ---
  const handleAddSticker = (url) => {
      const config = getLayoutConfig(selectedLayout);
      const newSticker = {
          id: Date.now().toString(),
          url,
          x: config.W / 2 - 100, // Spawn di tengah
          y: config.H / 2 - 100,
          w: 200, // Ukuran dasar stiker relatif ke kanvas asli
          h: 200,
          rotation: 0,
          scale: 1
      };
      setPlacedStickers([...placedStickers, newSticker]);
      setActiveStickerId(newSticker.id);
  };

  const handleStickerUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          const url = event.target.result;
          setUserStickers(prev => [...prev, url]);
          handleAddSticker(url);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
  };

  const removeSticker = (id) => {
      setPlacedStickers(prev => prev.filter(s => s.id !== id));
      if (activeStickerId === id) setActiveStickerId(null);
  };

  const updateActiveSticker = (updates) => {
      if (!activeStickerId) return;
      setPlacedStickers(prev => prev.map(s =>
          s.id === activeStickerId ? { ...s, ...updates } : s
      ));
  };

  const handleRotateSticker = (dir) => {
      const stk = placedStickers.find(s => s.id === activeStickerId);
      if(stk) {
          updateActiveSticker({ rotation: (stk.rotation || 0) + (dir === 'right' ? 15 : -15) });
      }
  };

  const handleScaleSticker = (dir) => {
       const stk = placedStickers.find(s => s.id === activeStickerId);
       if(stk) {
           const newScale = dir === 'up' ? (stk.scale || 1) + 0.15 : Math.max(0.2, (stk.scale || 1) - 0.15);
           updateActiveSticker({ scale: newScale });
       }
  };

  const handleDuplicateSticker = () => {
       const stk = placedStickers.find(s => s.id === activeStickerId);
       if(stk) {
           const newSticker = {
               ...stk,
               id: Date.now().toString(),
               x: stk.x + 40, // Sedikit digeser agar terlihat ada duplikat
               y: stk.y + 40
           };
           setPlacedStickers([...placedStickers, newSticker]);
           setActiveStickerId(newSticker.id);
       }
  };

  // Logic Tarik Geser (Drag)
  const onStickerPointerDown = (e, id, currentX, currentY, scale) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveStickerId(id);
      setDragState({ isDragging: true, id, startX: e.clientX, startY: e.clientY, initX: currentX, initY: currentY, scale });
  };

  const onWorkspacePointerMove = (e) => {
      if (dragState.isDragging && dragState.id) {
          const dx = (e.clientX - dragState.startX) / dragState.scale;
          const dy = (e.clientY - dragState.startY) / dragState.scale;
          setPlacedStickers(prev => prev.map(s => 
              s.id === dragState.id ? { ...s, x: dragState.initX + dx, y: dragState.initY + dy } : s
          ));
      }
  };

  const onWorkspacePointerUp = () => {
      if (dragState.isDragging) setDragState(prev => ({ ...prev, isDragging: false }));
  };

  // --- EXPORT / DOWNLOAD LOGIC ---
  const waitForNextPaint = () => new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

  const waitForStripAssets = async (element) => {
      if (!element) return;
      const images = Array.from(element.querySelectorAll('img'));
      const backgroundElements = Array.from(element.querySelectorAll('[data-bg-src]'));

      await Promise.all(images.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          if (img.decode) return img.decode().catch(() => {});
          return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
              setTimeout(resolve, 1800);
          });
      }));

      // Foto strip sekarang dirender sebagai background-cover supaya rasio tidak gepeng
      // saat diambil oleh html2canvas. Bagian ini memastikan background image sudah preload.
      await Promise.all(backgroundElements.map((el) => loadCanvasImage(el.getAttribute('data-bg-src'))));
      await waitForNextPaint();
  };

  const canvasToBlob = (canvas, type = 'image/jpeg', quality = 0.92) => {
      return new Promise((resolve, reject) => {
          if (canvas.toBlob) {
              canvas.toBlob((blob) => {
                  if (blob) resolve(blob);
                  else reject(new Error('Canvas blob kosong'));
              }, type, quality);
              return;
          }

          try {
              const dataUrl = canvas.toDataURL(type, quality);
              fetch(dataUrl).then((res) => res.blob()).then(resolve).catch(reject);
          } catch (err) {
              reject(err);
          }
      });
  };

  const isIOSDevice = () => {
      if (typeof navigator === 'undefined') return false;
      return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

  const saveBlobToDevice = async (blob, filename, shareText = 'Aestho photobooth result') => {
      const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
      const shouldUseNativeShare = isIOSDevice() || window.innerWidth < 768;

      // Di beberapa browser HP, terutama iPhone/Safari, atribut download pada tag <a>
      // sering diabaikan. Native Share lebih stabil karena user bisa pilih Save to Files/Photos.
      if (shouldUseNativeShare && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
              await navigator.share({
                  files: [file],
                  title: filename,
                  text: shareText
              });
              showToast('Menu simpan/share berhasil dibuka. Pilih Save atau aplikasi tujuan.');
              return true;
          } catch (err) {
              if (err.name === 'AbortError') {
                  showToast('Proses download dibatalkan.');
                  return false;
              }
              console.warn('Native share gagal, mencoba download biasa:', err);
          }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.rel = 'noopener';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      }, 2500);

      showToast('File sedang didownload. Cek folder Downloads di HP kamu.');
      return true;
  };

  const loadCanvasImage = (src) => {
      if (!src) return Promise.resolve(null);
      return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.referrerPolicy = 'no-referrer';
          img.onload = () => resolve(img);
          img.onerror = () => {
              const fallback = new Image();
              fallback.referrerPolicy = 'no-referrer';
              fallback.onload = () => resolve(fallback);
              fallback.onerror = () => resolve(null);
              fallback.src = src;
          };
          img.src = src;
      });
  };

  const drawImageCover = (ctx, source, x, y, w, h) => {
      const sw = source.videoWidth || source.naturalWidth || source.width;
      const sh = source.videoHeight || source.naturalHeight || source.height;
      if (!sw || !sh) return;

      const sourceRatio = sw / sh;
      const targetRatio = w / h;
      let sx = 0;
      let sy = 0;
      let sWidth = sw;
      let sHeight = sh;

      if (sourceRatio > targetRatio) {
          sWidth = sh * targetRatio;
          sx = (sw - sWidth) / 2;
      } else {
          sHeight = sw / targetRatio;
          sy = (sh - sHeight) / 2;
      }

      ctx.drawImage(source, sx, sy, sWidth, sHeight, x, y, w, h);
  };

  const getSupportedRecorderMimeType = () => {
      if (!window.MediaRecorder) return '';

      // WebM dibuat prioritas untuk Chrome/Edge/Android karena lebih stabil di MediaRecorder.
      // MP4 tetap disiapkan sebagai fallback, terutama untuk Safari.
      const mimeTypes = [
          'video/webm;codecs=vp8',
          'video/webm;codecs=vp9',
          'video/webm',
          'video/mp4;codecs=h264',
          'video/mp4'
      ];

      return mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  };

  const createStaticJpgBlob = async () => {
      if (!window.html2canvas || !staticStripRef.current) {
          throw new Error('Sistem pemroses JPG belum siap. Coba tunggu sebentar.');
      }

      await Promise.all([
          ...selectedStripPhotos.map((photoData) => loadCanvasImage(photoData?.url)),
          loadCanvasImage(selectedTemplate?.overlayUrl),
          ...placedStickers.map((sticker) => loadCanvasImage(sticker.url))
      ]);

      await waitForStripAssets(staticStripRef.current);

      const canvas = await window.html2canvas(staticStripRef.current, {
          useCORS: true,
          allowTaint: true,
          scale: getExportScale(),
          backgroundColor: null,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: staticStripRef.current.scrollWidth,
          windowHeight: staticStripRef.current.scrollHeight
      });

      return canvasToBlob(canvas, 'image/jpeg', 0.92);
  };

  const downloadStaticJPG = async () => {
      setIsDownloadingJPG(true);

      try {
          const blob = await createStaticJpgBlob();
          await saveBlobToDevice(blob, 'Aestho-Strip.jpg', 'My Aestho photostrip 📸');
      } catch (err) {
          console.error('Failed to generate JPG', err);
          showToast(err.message || 'Gagal memproses JPG. Coba tunggu semua gambar tampil dulu lalu tekan lagi.');
      } finally {
          setIsDownloadingJPG(false);
      }
  };

  const createLiveVideoBlob = async () => {
      if (!window.html2canvas || !baseStripRef.current) {
          throw new Error('Sistem pemroses video belum siap. Coba tunggu sebentar lalu ulangi lagi.');
      }

      if (!HTMLCanvasElement.prototype.captureStream || !window.MediaRecorder) {
          throw new Error('Browser ini belum mendukung export Live Moment. Coba pakai Chrome Android, Edge, atau Safari terbaru.');
      }

      const config = getLayoutConfig(selectedLayout);
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const VIDEO_DURATION_MS = 3300;
      const TARGET_FPS = window.innerWidth < 768 ? 12 : 15;
      const FRAME_INTERVAL = Math.round(1000 / TARGET_FPS);

      await waitForStripAssets(baseStripRef.current);

      const baseCanvas = await window.html2canvas(baseStripRef.current, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: baseStripRef.current.scrollWidth,
          windowHeight: baseStripRef.current.scrollHeight
      });

      const photoImages = await Promise.all(selectedStripPhotos.map(async (photoData) => {
          if (!photoData?.url) return null;
          return loadCanvasImage(photoData.url);
      }));

      const videos = await Promise.all(selectedStripPhotos.map(async (photoData) => {
          if (!photoData || !capturedClips[photoData.originalIndex]) return null;

          return new Promise((resolve) => {
              const v = document.createElement('video');
              v.src = capturedClips[photoData.originalIndex];
              v.muted = true;
              v.loop = true;
              v.playsInline = true;
              v.preload = 'auto';

              const finish = () => resolve(v);
              v.onloadedmetadata = finish;
              v.onloadeddata = finish;
              v.oncanplay = finish;
              v.onerror = () => resolve(null);

              setTimeout(() => {
                  resolve(v.readyState >= 1 ? v : null);
              }, 1800);

              v.load();
          });
      }));

      const overlays = await Promise.all(selectedStripPhotos.map(async (photoData) => {
          if (!photoData || selectedMode !== 'character' || !selectedCharacterData) return null;
          const overlayUrl = getOverlayImage(selectedCharacterData, photoData.originalIndex);
          return loadCanvasImage(overlayUrl);
      }));

      // Frame template digambar ulang paling atas agar frame tidak ketutup foto/video.
      const frameOverlayImage = await loadCanvasImage(selectedTemplate?.overlayUrl);

      const stickersImages = await Promise.all(placedStickers.map(async (stk) => {
          const img = await loadCanvasImage(stk.url);
          return img ? { img, ...stk } : null;
      }));

      const recordCanvas = document.createElement('canvas');
      const videoRenderScale = getVideoRenderScale();

      recordCanvas.width = Math.max(240, Math.round(config.W * videoRenderScale));
      recordCanvas.height = Math.max(360, Math.round(config.H * videoRenderScale));

      const ctx = recordCanvas.getContext('2d', { alpha: false });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';

      const outputStream = recordCanvas.captureStream(TARGET_FPS);
      const canvasTrack = outputStream.getVideoTracks ? outputStream.getVideoTracks()[0] : null;
      const requestCanvasFrame = () => {
          if (canvasTrack && typeof canvasTrack.requestFrame === 'function') {
              canvasTrack.requestFrame();
          }
      };

      let selectedMimeType = getSupportedRecorderMimeType();
      if (!selectedMimeType) {
          throw new Error('Browser ini belum mendukung format video untuk Live Moment.');
      }

      let recorder;
      try {
          recorder = new MediaRecorder(outputStream, {
              mimeType: selectedMimeType,
              videoBitsPerSecond: window.innerWidth < 768 ? 1200000 : 1800000
          });
      } catch (err) {
          // Beberapa browser bilang support mimeType tertentu, tapi gagal saat dipakai.
          // Jadi kita fallback ke default MediaRecorder agar export tetap jalan.
          recorder = new MediaRecorder(outputStream);
          selectedMimeType = recorder.mimeType || selectedMimeType;
      }

      const chunks = [];

      recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      let r = 0;
      const rClass = selectedTemplate.photoRadius || '';

      if (rClass.includes('rounded-sm')) r = 2;
      else if (rClass.includes('rounded-md')) r = 6;
      else if (rClass.includes('rounded-lg')) r = 8;
      else if (rClass.includes('rounded-xl')) r = 12;
      else if (rClass.includes('rounded-2xl')) r = 16;
      else if (rClass.includes('rounded-3xl')) r = 24;
      else if (rClass.includes('rounded-[3rem]')) r = 48;
      else if (rClass.includes('rounded-[40px]')) r = 40;

      const clipRoundedSlot = (slot) => {
          ctx.beginPath();
          ctx.moveTo(slot.x + r, slot.y);
          ctx.lineTo(slot.x + slot.w - r, slot.y);
          ctx.quadraticCurveTo(slot.x + slot.w, slot.y, slot.x + slot.w, slot.y + r);
          ctx.lineTo(slot.x + slot.w, slot.y + slot.h - r);
          ctx.quadraticCurveTo(slot.x + slot.w, slot.y + slot.h, slot.x + slot.w - r, slot.y + slot.h);
          ctx.lineTo(slot.x + r, slot.y + slot.h);
          ctx.quadraticCurveTo(slot.x, slot.y + slot.h, slot.x, slot.y + slot.h - r);
          ctx.lineTo(slot.x, slot.y + r);
          ctx.quadraticCurveTo(slot.x, slot.y, slot.x + r, slot.y);
          ctx.closePath();
          ctx.clip();
      };

      const drawSingleFrame = () => {
          ctx.clearRect(0, 0, recordCanvas.width, recordCanvas.height);
          ctx.save();
          ctx.scale(videoRenderScale, videoRenderScale);
          ctx.filter = 'none';
          ctx.fillStyle = selectedTemplate?.bgColor || '#ffffff';
          ctx.fillRect(0, 0, config.W, config.H);
          ctx.drawImage(baseCanvas, 0, 0, config.W, config.H);

          for (let i = 0; i < config.slots.length; i++) {
              const photoData = selectedStripPhotos[i];
              if (!photoData) continue;

              const slot = config.slots[i];
              if (!slot) continue;

              const vx = slot.x;
              const vy = slot.y;
              const vw = slot.w;
              const vh = slot.h;

              ctx.save();
              clipRoundedSlot(slot);

              const slotVideo = videos[i];
              if (slotVideo && slotVideo.readyState >= 2) {
                  ctx.filter = currentFilter.style || 'none';
                  if (selectedMode === 'together') {
                      drawImageCover(ctx, slotVideo, vx, vy, vw, vh);
                  } else {
                      ctx.translate(vx + vw, vy);
                      ctx.scale(-1, 1);
                      drawImageCover(ctx, slotVideo, 0, 0, vw, vh);
                  }
              } else if (photoImages[i]) {
                  ctx.filter = 'none';
                  drawImageCover(ctx, photoImages[i], vx, vy, vw, vh);
              }

              ctx.restore();

              if (overlays[i]) {
                  ctx.save();

                  if (currentFilter.style !== 'none') {
                      ctx.filter = `${currentFilter.style} brightness(1.1)`;
                  }

                  const img = overlays[i];
                  const wClass = getOverlayWidth(selectedCharacterData, photoData.originalIndex);
                  const heightPercent = getOverlayHeightPercent(selectedCharacterData, photoData.originalIndex);

                  let ow;
                  let oh;

                  if (heightPercent) {
                      oh = vh * (Number(heightPercent) / 100);
                      ow = (img.width / img.height) * oh;
                  } else {
                      let pct = 0.6;
                      const widthMatch = wClass.match(/w-\[(\d+(?:\.\d+)?)%\]/);
                      if (widthMatch) {
                          pct = Number(widthMatch[1]) / 100;
                      }

                      ow = vw * pct;
                      oh = (img.height / img.width) * ow;
                  }

                  let ox = selectedCharacterData.position === 'right' ? vx + vw - ow : vx;

                  if (
                      selectedCharacterData.cameraStyles &&
                      selectedCharacterData.cameraStyles[Math.floor(photoData.originalIndex / 2)]
                  ) {
                      if (wClass.includes('w-[85%]')) ox += (ow * 0.15);
                  }

                  const oy = vy + vh - oh;

                  ctx.drawImage(img, ox, oy, ow, oh);
                  ctx.restore();
              }
          }

          if (frameOverlayImage) {
              ctx.save();
              ctx.filter = 'none';
              ctx.drawImage(frameOverlayImage, 0, 0, config.W, config.H);
              ctx.restore();
          }

          stickersImages.forEach((stk) => {
              if (stk && stk.img) {
                  ctx.save();

                  const cx = stk.x + stk.w / 2;
                  const cy = stk.y + stk.h / 2;

                  ctx.translate(cx, cy);
                  ctx.rotate((stk.rotation || 0) * Math.PI / 180);
                  ctx.scale(stk.scale || 1, stk.scale || 1);
                  ctx.drawImage(stk.img, -stk.w / 2, -stk.h / 2, stk.w, stk.h);

                  ctx.restore();
              }
          });

          ctx.restore();
          requestCanvasFrame();
      };

      return new Promise((resolve, reject) => {
          let hasResolved = false;

          const safeReject = (error) => {
              if (hasResolved) return;
              hasResolved = true;
              reject(error);
          };

          const cleanupVideos = () => {
              videos.forEach((v) => {
                  if (v) {
                      try {
                          v.pause();
                          v.removeAttribute('src');
                          v.load();
                      } catch {}
                  }
              });
          };

          recorder.onerror = () => {
              cleanupVideos();
              safeReject(new Error('Recorder video mengalami error. Coba ulangi atau pakai browser Chrome/Edge terbaru.'));
          };

          recorder.onstop = () => {
              try {
                  cleanupVideos();

                  if (!chunks.length) {
                      safeReject(new Error('Video gagal dibuat. Coba ulangi sekali lagi setelah preview Live Moment tampil.'));
                      return;
                  }

                  const mimeType = recorder.mimeType || selectedMimeType || 'video/webm';
                  const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
                  const blob = new Blob(chunks, { type: mimeType });

                  if (!blob.size) {
                      safeReject(new Error('Video berhasil diproses tapi filenya kosong. Coba ulangi lagi.'));
                      return;
                  }

                  if (hasResolved) return;
                  hasResolved = true;
                  resolve({ blob, mimeType, ext });
              } catch (err) {
                  safeReject(err);
              }
          };

          const run = async () => {
              try {
                  await Promise.all(videos.map((v) => {
                      if (!v) return Promise.resolve();
                      v.currentTime = 0;
                      return v.play().catch(() => {});
                  }));

                  drawSingleFrame();
                  recorder.start(250);

                  const startedAt = performance.now();
                  while (performance.now() - startedAt < VIDEO_DURATION_MS) {
                      drawSingleFrame();
                      await sleep(FRAME_INTERVAL);
                  }

                  // Beberapa frame tambahan supaya metadata durasi tidak kepotong jadi 1 detik.
                  for (let i = 0; i < 4; i++) {
                      drawSingleFrame();
                      await sleep(FRAME_INTERVAL);
                  }

                  if (recorder.state === 'recording') {
                      if (typeof recorder.requestData === 'function') recorder.requestData();
                      await sleep(180);
                      recorder.stop();
                  }
              } catch (err) {
                  if (recorder.state === 'recording') recorder.stop();
                  safeReject(err);
              }
          };

          run();
      });
  };
  const downloadLiveVideo = async () => {
      setIsDownloadingVideo(true);

      try {
          const { blob, ext } = await createLiveVideoBlob();
          await saveBlobToDevice(blob, `Aestho-Live-Strip.${ext}`, 'My Aestho Live Moment 🎞️');
      } catch (err) {
          console.error('Failed to generate Video', err);
          showToast(err.message || 'Gagal memproses Video. Coba pakai Chrome Android/Safari terbaru dan ulangi lagi.');
      } finally {
          setIsDownloadingVideo(false);
      }
  };

  const uploadBlobToCloudinary = async (blob, filename = 'aestho-file') => {
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
          throw new Error('Cloudinary belum disetting. Cek file .env atau Vercel Environment Variables.');
      }

      const file = new File([blob], filename, {
          type: blob.type || 'application/octet-stream'
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'aestho-results');

      const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
          {
              method: 'POST',
              body: formData
          }
      );

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data?.error?.message || 'Upload ke Cloudinary gagal.');
      }

      return data;
  };

  const saveResultToSupabase = async ({ photoUrl, videoUrl, videoMp4Url, videoMimeType }) => {
      if (!supabase) {
          throw new Error('Supabase belum disetting. Cek file .env atau Vercel Environment Variables.');
      }

      const resultId = generateResultId();

      const { error } = await supabase
          .from('aestho_results')
          .insert({
              id: resultId,
              photo_url: photoUrl,
              video_url: videoUrl,
              video_mp4_url: videoMp4Url,
              video_mime_type: videoMimeType,
              template_name: selectedTemplate?.name || null,
              layout_id: selectedLayout || null
          });

      if (error) {
          throw new Error(error.message || 'Gagal menyimpan data ke Supabase.');
      }

      return resultId;
  };

  const handleGenerateQRCode = async ({ force = false } = {}) => {
      if (isGeneratingQR) return;
      if (qrResultUrl && !force) return;

      setIsGeneratingQR(true);
      setQrResultUrl('');
      setQrGenerationMessage('Preparing your QR result...');

      try {
          setQrGenerationMessage('Processing JPG result...');

          const jpgBlob = await createStaticJpgBlob();

          let videoResult = null;
          let videoUpload = null;
          let videoMp4Url = null;

          try {
              setQrGenerationMessage('Processing Live Moment...');
              videoResult = await createLiveVideoBlob();
          } catch (videoErr) {
              console.warn('Live Moment gagal dibuat, QR akan tetap dibuat dengan JPG saja:', videoErr);
              setQrGenerationMessage('Live Moment skipped. Saving JPG result...');
          }

          setQrGenerationMessage('Saving result page...');

          const photoUpload = await uploadBlobToCloudinary(
              jpgBlob,
              `Aestho-Strip-${Date.now()}.jpg`
          );

          if (videoResult?.blob) {
              try {
                  videoUpload = await uploadBlobToCloudinary(
                      videoResult.blob,
                      `Aestho-Live-Moment-${Date.now()}.${videoResult.ext}`
                  );

                  videoMp4Url = toCloudinaryMp4Url(videoUpload.secure_url);
              } catch (uploadVideoErr) {
                  console.warn('Upload video gagal, QR tetap dibuat dengan JPG saja:', uploadVideoErr);
                  videoResult = null;
                  videoUpload = null;
                  videoMp4Url = null;
              }
          }

          const resultId = await saveResultToSupabase({
              photoUrl: photoUpload.secure_url,
              videoUrl: videoUpload?.secure_url || null,
              videoMp4Url,
              videoMimeType: videoResult?.mimeType || null
          });

          const finalUrl = `${window.location.origin}/id/summary/${resultId}`;

          setQrResultUrl(finalUrl);
          setQrGenerationMessage(videoUpload ? 'QR ready with JPG and Live Moment.' : 'QR ready with JPG only.');
      } catch (err) {
          console.error('QR generation failed:', err);
          setQrGenerationMessage(err.message || 'QR code gagal dibuat. Coba refresh halaman atau buka ulang Final Result.');
          autoQRStartedRef.current = false;
      } finally {
          setIsGeneratingQR(false);
      }
  };

  useEffect(() => {
      if (currentView !== 'final-result') return;
      if (qrResultUrl || isGeneratingQR || autoQRStartedRef.current) return;

      const timer = setTimeout(() => {
          if (autoQRStartedRef.current) return;
          autoQRStartedRef.current = true;
          handleGenerateQRCode();
      }, 450);

      return () => clearTimeout(timer);
  }, [currentView, qrResultUrl, isGeneratingQR]);

  const toCssImageUrl = (src) => `url("${String(src || '').replace(/"/g, '\\"')}")`;

  const CoverPhoto = ({ src, className = '', style = {}, alt = 'Photo' }) => (
      <div
          role="img"
          aria-label={alt}
          data-bg-src={src}
          className={`bg-center bg-cover bg-no-repeat ${className}`}
          style={{
              ...style,
              backgroundImage: toCssImageUrl(src)
          }}
      />
  );

  const AesthoStrip = ({ template, photos, clips, mode, characterData, scale = 1, shadow = true, stripRef, layoutConfig, isEditable = false, showPlacedStickers = true }) => {
    const config = layoutConfig || getLayoutConfig('classic-white');
    const wrapperStyle = { width: `${config.W * scale}px`, height: `${config.H * scale}px`, position: 'relative', flexShrink: 0 };
    const stripTransformStyle = { width: `${config.W}px`, height: `${config.H}px`, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 };
    const stripContentStyle = { width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: template.bgColor, ...template.styleContainer };

    return (
        <div style={wrapperStyle}>
            <div ref={stripRef} className={`${shadow ? 'shadow-2xl dark:shadow-[0_10px_40px_rgba(255,255,255,0.05)] dark:ring-1 dark:ring-zinc-800' : ''} bg-white transition-all duration-300`} style={stripTransformStyle}>
                <div style={stripContentStyle}>
                    {template.sticker && <div className="absolute top-4 right-4 z-10 pointer-events-none drop-shadow-md origin-top-right scale-150">{template.sticker}</div>}
                    
                    {photos.map((photoData, index) => {
                        const slot = config.slots[index];
                        if (!slot) return null;
                        
                        const photoStyle = { position: 'absolute', left: `${slot.x}px`, top: `${slot.y}px`, width: `${slot.w}px`, height: `${slot.h}px`, flexShrink: 0 };
                        return (
                            <div key={index} className={`relative overflow-hidden bg-gray-100 border border-transparent flex items-center justify-center z-0 ${template.photoRadius || ''}`} style={photoStyle}>
                                {photoData ? (
                                    <>
                                        {clips && clips[photoData.originalIndex] ? (
                                            <video
                                                crossOrigin="anonymous"
                                                src={clips[photoData.originalIndex]}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className={`w-full h-full object-cover ${mode === 'together' ? '' : 'transform scale-x-[-1]'}`}
                                                style={{ filter: currentFilter.style || 'none' }}
                                            />
                                        ) : (
                                            <CoverPhoto
                                                src={photoData.url}
                                                className="w-full h-full"
                                                alt={`Shot ${index}`}
                                            />
                                        )}
                                        {mode === 'character' && getOverlayImage(characterData, photoData.originalIndex) && (
                                            <img
                                                src={getOverlayImage(characterData, photoData.originalIndex)}
                                                className={`absolute bottom-0 ${characterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(characterData, photoData.originalIndex)} h-auto pointer-events-none z-10`}
                                                style={{
                                                    mixBlendMode: 'normal',
                                                    filter: currentFilter.style === 'none' ? 'none' : `${currentFilter.style} brightness(1.1)`,
                                                    ...getOverlayInlineStyle(characterData, photoData.originalIndex)
                                                }}
                                                alt="Overlay"
                                            />
                                        )}
                                    </>
                                ) : ( <div className="w-full h-full bg-white opacity-20"></div> )}
                            </div>
                        );
                    })}
                    
                    {!template.hideFooter && ( 
                        <div className="absolute bottom-[4%] w-full flex justify-center items-center pointer-events-none z-0">
                            <span className={`font-title ${template.id === 'aestho-signature' ? 'rotate-[-2deg]' : ''}`} style={{ color: template.textColor, fontSize: config.W === 1200 ? '96px' : '64px' }}> Aestho. </span> 
                        </div>
                    )}

                    {template.overlayUrl && (
                        <img
                            src={template.overlayUrl}
                            alt="Frame overlay"
                            className="absolute inset-0 z-30 pointer-events-none w-full h-full"
                            style={{ objectFit: 'fill' }}
                        />
                    )}

                    {/* RENDER PLACED STICKERS: z-index lebih tinggi dari frame */}
                    {showPlacedStickers && placedStickers.map(stk => (
                        <div
                            key={stk.id}
                            style={{
                                position: 'absolute',
                                left: `${stk.x}px`,
                                top: `${stk.y}px`,
                                width: `${stk.w}px`,
                                height: `${stk.h}px`,
                                cursor: isEditable ? (activeStickerId === stk.id ? 'grabbing' : 'grab') : 'default',
                                zIndex: 50,
                                border: isEditable && activeStickerId === stk.id ? '2px dashed rgba(0,0,0,0.5)' : 'none',
                                boxShadow: isEditable && activeStickerId === stk.id ? '0 0 0 2px white' : 'none',
                                transform: `rotate(${stk.rotation || 0}deg) scale(${stk.scale || 1})`,
                                transformOrigin: 'center'
                            }}
                            onPointerDown={(e) => isEditable && onStickerPointerDown(e, stk.id, stk.x, stk.y, scale)}
                        >
                            <img
                                src={stk.url}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    pointerEvents: 'none'
                                }}
                                alt="sticker"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="relative w-full min-h-[100dvh] md:h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-500 overflow-x-hidden overflow-y-auto md:overflow-hidden font-sans selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black"
           onPointerMove={currentView === 'sticker-editor' ? onWorkspacePointerMove : undefined}
           onPointerUp={currentView === 'sticker-editor' ? onWorkspacePointerUp : undefined}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Niconne&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Syncopate:wght@400;700&display=swap');
          .font-title { font-family: 'Niconne', cursive; }
          .font-serif { font-family: 'Cormorant Garamond', serif; }
          .font-modern { font-family: 'Syncopate', sans-serif; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* HEADER CONTROLS FOR INITIAL WORKFLOW VIEWS (LAYOUT, MODE, ANIME, FRAME) */}
        {['layout', 'mode', 'anime', 'frame'].includes(currentView) && (
          <div className="fixed top-0 left-0 w-full p-4 md:p-6 z-[60] pointer-events-none flex items-center justify-between">
             <div className="pointer-events-auto flex items-center gap-3">
               <button
                 onClick={
                   currentView === 'layout' ? handleBackToHome :
                   currentView === 'mode' ? handleBackToLayout :
                   currentView === 'anime' ? handleBackToModeFromAnime :
                   handleBackToAnimeFromFrame
                 }
                 className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0"
                 title="Kembali"
               >
                 <ArrowLeft size={18} />
               </button>
               <span className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-none select-none">Aestho.</span>
             </div>

             <div className="pointer-events-auto flex items-center gap-2">
               <LanguageSlider />

               <button
                 onClick={toggleDarkMode}
                 className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors shadow-sm flex items-center justify-center"
                 title="Toggle Theme"
               >
                 {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
               </button>
             </div>
          </div>
        )}

        {/* GLOBAL BRANDING / WATERMARK */}
        <div className="hidden md:block fixed bottom-6 left-6 z-[60] opacity-40 hover:opacity-100 transition-all duration-300 group cursor-default">
           <img src="https://lh3.googleusercontent.com/d/1FujM1yqU72AGrQbx-tShQBGSd8WQeXFW" alt="Dzev Logo" className="w-12 h-auto md:w-16 drop-shadow-sm grayscale group-hover:grayscale-0 transition-all dark:invert" />
        </div>

        {/* MAIN VIEWS CONTAINER WITH TRANSITION */}
        <div className={`w-full h-full min-h-full flex flex-col transition-all duration-200 ease-out ${isViewTransitioning ? 'opacity-0 scale-[0.992] translate-y-1 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}>
        {/* --- VIEW 1: HOME --- */}
        {currentView === 'home' && (
          <main className="animate-view-enter relative z-30 flex flex-col items-center justify-center min-h-[100dvh] md:h-full text-center px-4 py-10">
             
             {/* TOGGLE DARK MODE & LANGUAGE SLIDER */}
             <div className="absolute top-6 right-6 md:top-8 md:right-8 z-[70] flex items-center gap-2">
                <LanguageSlider />

                <button
                  onClick={toggleDarkMode}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all shadow-sm flex items-center justify-center group"
                  title="Toggle Theme"
                >
                  {isDarkMode ? <Sun size={15} className="group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={15} className="group-hover:-rotate-12 transition-transform duration-500" />}
                </button>
             </div>

             <div className="relative mb-4 cursor-default select-none">
                 <h1 className="font-title text-5xl md:text-[8rem] leading-none text-black dark:text-white z-10 relative">Aestho</h1>
                 <h1 className="font-title text-5xl md:text-[8rem] leading-none text-black/5 dark:text-white/5 absolute top-2 left-2 blur-sm">Aestho</h1>
             </div>
             <p className="font-serif text-sm md:text-xl text-black/70 dark:text-white/70 mb-12 italic tracking-wider">{t.home.tagline}</p>
             <button onClick={handleStart} className="group flex flex-col items-center gap-1 px-6 py-2 uppercase font-modern text-xs md:text-sm tracking-[0.3em] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
               <span>{t.home.enterStudio}</span>
               <div className="relative w-full h-[1px] mt-1">
                   <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-zinc-800"></div>
                   <div className="absolute top-0 left-0 h-full bg-black dark:bg-white w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
               </div>
             </button>

             {/* Footer Privacy Policy Link */}
             <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex items-center justify-center gap-4 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 z-40">
               <a
                 href="/privacy"
                 className="hover:text-black dark:hover:text-white underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 transition-colors"
               >
                 {t.home.privacyPolicy}
               </a>
             </div>
          </main>
        )}

        {/* --- VIEW 2: LAYOUT SELECTION --- */}
        {currentView === 'layout' && (
          <main className="animate-view-enter relative z-30 flex flex-col items-center justify-start md:justify-center min-h-[100dvh] md:h-full w-full px-5 md:px-6 pt-24 pb-10 md:py-0 overflow-y-auto md:overflow-visible">
              <h2 className="font-serif text-3xl md:text-4xl italic mb-8 md:mb-12">{t.layout.title}</h2>
              <div className="flex gap-8 md:gap-12 items-center justify-center mb-8 md:mb-16 flex-wrap">
                  {layouts.map((l) => (
                      <div key={l.id} onClick={() => !l.disabled && setSelectedLayout(l.id)} className={`flex flex-col items-center justify-center gap-6 transition-all duration-300 ${l.disabled ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer group opacity-60 hover:opacity-100'} ${selectedLayout === l.id ? '!opacity-100 scale-105' : ''}`}>
                          <div className={`${l.cssContainer} transition-transform ${!l.disabled ? 'group-hover:-translate-y-2' : ''} border border-gray-200 dark:border-zinc-700`}>
                               {!l.disabled ? (
                                 <>
                                   {[...Array(l.type === 'grid' ? 6 : 4)].map((_,i) => (
                                     <div key={i} className={`${l.cssPhoto} bg-gray-200 overflow-hidden relative grayscale opacity-80`}><div className="w-full h-full bg-gradient-to-tr from-gray-300 to-gray-200"></div></div>
                                   ))}
                                   {l.type === 'vertical' && <div className={`w-full h-auto pt-2 flex justify-center items-end opacity-50 ${l.textColor}`}><span className="font-title text-[10px]">Aestho.</span></div>}
                                 </>
                               ) : (
                                 <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400 dark:text-zinc-500">
                                     <span className="font-serif text-4xl md:text-6xl italic">?</span>
                                     <span className="font-modern text-[8px] tracking-widest uppercase text-center leading-relaxed whitespace-pre-line">{t.layout.comingSoon}</span>
                                 </div>
                               )}
                          </div>
                          <div className="text-center">
                            <span className={`font-modern text-xs tracking-widest uppercase block border-b border-transparent pb-1 ${!l.disabled ? 'group-hover:border-black dark:group-hover:border-white' : ''}`}>
                              {l.id === 'classic-white' ? t.layout.classicStripName : l.id === 'grid-4r' ? t.layout.poster4rName : l.name}
                            </span>
                            <span className="font-serif text-[10px] text-gray-500 dark:text-zinc-400 italic mt-1 block">
                              {l.id === 'classic-white' ? t.layout.classicStripDesc : l.id === 'grid-4r' ? t.layout.poster4rDesc : l.desc}
                            </span>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="flex justify-center">
                   {selectedLayout && <button onClick={handleLayoutConfirm} className="bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-full font-modern text-xs uppercase hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors shadow-md">{t.layout.next}</button>}
              </div>

               {/* WEBRTC DIAGNOSTIC MODAL */}
               {showDiagnosticModal && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                   <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col gap-4 text-xs font-mono">
                     <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                       <div className="flex items-center gap-2">
                         <div className={`w-2.5 h-2.5 rounded-full ${togetherPeerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                         <h3 className="font-bold text-sm text-zinc-900 dark:text-white">WebRTC Diagnostics</h3>
                       </div>
                       <button type="button" onClick={() => setShowDiagnosticModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white">
                         <X size={16} />
                       </button>
                     </div>

                     <div className="space-y-2 text-[11px]">
                       <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/80">
                         <span className="text-zinc-400">Room ID</span>
                         <span className="font-bold text-zinc-800 dark:text-zinc-200">{togetherRoomId}</span>
                       </div>
                       <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/80">
                         <span className="text-zinc-400">Role</span>
                         <span className="uppercase font-bold text-zinc-800 dark:text-zinc-200">{togetherRole}</span>
                       </div>
                       <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/80">
                         <span className="text-zinc-400">P2P Status</span>
                         <span className={`font-bold ${togetherPeerConnected ? 'text-emerald-500' : 'text-amber-500'}`}>
                           {togetherPeerConnected ? 'CONNECTED' : 'WAITING / CONNECTING'}
                         </span>
                       </div>
                       <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/80">
                         <span className="text-zinc-400">ICE State</span>
                         <span className="font-mono text-zinc-800 dark:text-zinc-200">{togetherDiagnostic.iceState}</span>
                       </div>
                       <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/80">
                         <span className="text-zinc-400">Connection State</span>
                         <span className="font-mono text-zinc-800 dark:text-zinc-200">{togetherDiagnostic.connState}</span>
                       </div>
                       <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/80">
                         <span className="text-zinc-400">Jalur NAT Traversal</span>
                         <span className="font-bold text-zinc-800 dark:text-zinc-200">{togetherDiagnostic.candidateType}</span>
                       </div>
                       <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/80">
                         <span className="text-zinc-400">Remote Video Track</span>
                         <span className={togetherDiagnostic.hasRemoteTrack ? 'text-emerald-500 font-bold' : 'text-zinc-400'}>
                           {togetherDiagnostic.hasRemoteTrack ? (togetherDiagnostic.remoteVideoPlaying ? 'PLAYING (LIVE)' : 'RECEIVED') : 'NO TRACK'}
                         </span>
                       </div>
                       <div className="flex justify-between py-1">
                         <span className="text-zinc-400">Snapshot Antrian</span>
                         <span className="text-zinc-800 dark:text-zinc-200">{pendingGuestSnapshotsRef.current.size} snapshot</span>
                       </div>
                     </div>

                     <div className="pt-2">
                       <button
                         type="button"
                         onClick={() => setShowDiagnosticModal(false)}
                         className="w-full py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold uppercase text-[10px] tracking-wider"
                       >
                         Tutup
                       </button>
                     </div>
                   </div>
                 </div>
               )}
          </main>
        )}

        {/* --- VIEW 3: MODE SELECTION --- */}
        {currentView === 'mode' && (
          <main className="animate-view-enter relative z-30 flex flex-col items-center justify-start md:justify-center min-h-[100dvh] md:h-full w-full px-5 md:px-6 pt-24 pb-10 md:py-0 overflow-y-auto md:overflow-visible">
              <h2 className="font-serif text-3xl md:text-4xl italic mb-8 md:mb-12">{t.mode.title}</h2>
              <div className="flex gap-4 md:gap-6 mb-8 md:mb-16 flex-wrap justify-center w-full">
                  {modes.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMode(m.id)}
                          className={`cursor-pointer border rounded-xl p-5 md:p-8 w-full max-w-xs md:w-64 text-center transition-all ${m.style} ${selectedMode === m.id ? 'ring-2 ring-offset-2 ring-gray-300 dark:ring-zinc-600 scale-105' : 'opacity-70 hover:opacity-100'}`}
                        >
                          <div className="mb-4 flex justify-center">{m.icon}</div>
                          <h3 className="font-modern text-sm font-bold uppercase mb-2">{m.name}</h3>
                          <p className="font-serif text-sm italic opacity-80">{m.desc}</p>
                      </div>
                  ))}
              </div>
              <div className="flex justify-center">
                   {selectedMode && <button onClick={handleModeConfirm} className="bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-full font-modern text-xs uppercase hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors shadow-md">{t.mode.next}</button>}
              </div>
          </main>
        )}

        {/* --- VIEW 4: ANIME SELECTION --- */}
        {currentView === 'anime' && (
          <main className="animate-view-enter relative z-30 flex flex-col items-center justify-start md:justify-center min-h-[100dvh] md:h-full w-full px-5 md:px-6 pt-24 pb-10 md:py-0 overflow-y-auto md:overflow-visible">
              <h2 className="font-serif text-3xl md:text-4xl italic mb-8 md:mb-12">Pick Partner</h2>
              <div className="w-full flex justify-center items-center relative max-w-4xl px-0 md:px-8 mb-8 md:mb-16">
                   <div ref={animeListRef} className="w-full overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory px-4 flex gap-6 items-center scroll-smooth justify-start md:justify-center">
                      {allAnimeOptions.map((a) => (
                          <div key={a.id} onClick={() => handleAnimeSelect(a.id)} className={`flex-shrink-0 snap-center cursor-pointer border border-gray-200 dark:border-zinc-700 rounded-xl p-5 md:p-6 w-32 h-40 md:w-40 md:h-48 flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-900 transition-all ${a.color} hover:border-black dark:hover:border-zinc-500 shadow-sm group`}>
                                <img src={a.logoUrl} referrerPolicy="no-referrer" alt={a.name} className="max-w-[80%] max-h-16 object-contain grayscale hover:grayscale-0 transition-all"/>
                                <span className={`font-modern text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 group-hover:text-black dark:group-hover:text-white`}>{a.name}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </main>
        )}

        {/* --- VIEW 5: FRAME SELECTION --- */}
        {currentView === 'frame' && currentAnimeData && (
          <main className="animate-view-enter relative z-30 flex flex-col items-center justify-start md:justify-center min-h-[100dvh] md:h-full w-full pt-24 md:pt-0 pb-32 md:pb-0 overflow-y-auto md:overflow-visible">
              <div className="text-center mb-6 md:mb-8 px-4">
                  <p className="font-modern text-[10px] tracking-[0.3em] text-gray-400 dark:text-zinc-500 uppercase mb-2">Selected Layout: {currentLayoutData?.name}</p>
                  <h2 className="font-serif text-3xl md:text-4xl italic">Choose Character</h2>
                  <p className="font-sans text-[10px] text-gray-400 dark:text-zinc-500 mt-2 flex items-center justify-center gap-1 animate-pulse"><ArrowRight size={10}/> Swipe to browse <ArrowLeft size={10}/></p>
              </div>
              <div className="w-full flex justify-center items-center relative max-w-4xl px-4 md:px-8">
                   <button onClick={() => scrollCharacterList('left')} className="absolute left-2 md:left-0 z-20 w-10 h-10 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black transition-all duration-300 hidden md:flex"><ChevronLeft size={16} /></button>
                   <div ref={characterListRef} className="w-full overflow-x-auto pb-8 md:pb-12 hide-scrollbar snap-x snap-mandatory px-5 md:px-4 flex gap-4 md:gap-8 items-center scroll-smooth">
                        {currentAnimeData.characters.map((char) => (
                            <div key={char.id} onClick={() => setSelectedFrame(char.id)} className="group cursor-pointer flex flex-col items-center gap-4 md:gap-6 flex-shrink-0 snap-center">
                                <div className={`relative transition-all duration-500 ease-out w-[88px] h-[292px] md:w-[120px] md:h-[400px] flex flex-col bg-white dark:bg-zinc-100 ${selectedFrame === char.id ? 'shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] scale-105 rotate-0 z-10 ring-1 ring-black/5 dark:ring-white/10' : 'shadow-lg hover:shadow-xl hover:-translate-y-2 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 rotate-1'}`}>
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#FDFDFD] dark:bg-zinc-200 rounded-full shadow-inner z-20 border border-gray-200 dark:border-zinc-300"></div>
                                    <div className="flex-1 flex flex-col p-3 gap-2">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="flex-1 bg-zinc-50 dark:bg-white relative overflow-hidden border border-zinc-100 shadow-inner">
                                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]"></div>
                                                {getOverlayImage(char, i * 2) && ( <img src={getOverlayImage(char, i * 2)} referrerPolicy="no-referrer" alt={char.name} className={`absolute bottom-0 ${char.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(char, i * 2)} h-auto object-contain z-10 mix-blend-darken`} style={{ pointerEvents: 'none', ...getOverlayInlineStyle(char, i * 2) }} /> )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-8 flex items-center justify-center pb-2"><span className="font-title text-[10px] text-zinc-400">Aestho.</span></div>
                                </div>
                                <span className={`font-modern text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${selectedFrame === char.id ? 'text-black dark:text-white font-semibold' : 'text-gray-300 dark:text-zinc-600 group-hover:text-gray-500 dark:group-hover:text-zinc-400'}`}>{char.name}</span>
                            </div>
                        ))}
                   </div>
                   <button onClick={() => scrollCharacterList('right')} className="absolute right-2 md:right-0 z-20 w-10 h-10 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black transition-all duration-300 hidden md:flex"><ChevronRight size={16} /></button>
              </div>
              <div className="fixed bottom-0 left-0 w-full flex justify-center items-center bg-gradient-to-t from-white via-white dark:from-[#0a0a0a] dark:via-[#0a0a0a] to-transparent pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-8 px-4">
                  {selectedFrame && ( <button onClick={handleFrameConfirm} className="bg-black text-white dark:bg-white dark:text-black px-10 py-3 rounded-full font-modern text-xs tracking-[0.2em] uppercase hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all flex items-center gap-3 w-full md:w-auto justify-center border border-black dark:border-white shadow-lg">Start Session</button> )}
              </div>
          </main>
        )}

        {/* --- VIEW: TOGETHER SETUP --- */}
        {currentView === 'together-setup' && (
          <TogetherSetupView
            supabase={supabase}
            peerId={togetherPeerId}
            initialRoomCode={initialTogetherCode}
            selectedLayout={selectedLayout || 'classic-white'}
            onBack={() => {
              if (isTogetherPath) {
                window.location.href = '/';
              } else {
                triggerTransition(() => setCurrentView('mode'));
              }
            }}
            onConnected={({ roomId, role, layoutId }) => {
              setTogetherRoomId(roomId);
              setTogetherRole(role);
              if (layoutId) {
                setSelectedLayout(layoutId);
                const targetCount = layoutId === 'grid-4r' ? 6 : 4;
                setSelectedStripPhotos(Array(targetCount).fill(null));
              }
              triggerTransition(() => setCurrentView('camera-session'));
            }}
            showToast={showToast}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            t={t}
          />
        )}

        {/* --- VIEW 6: CAMERA SESSION --- */}
        {currentView === 'camera-session' && (
          <main className="animate-view-enter relative z-30 flex flex-col min-h-[100dvh] md:h-full w-full bg-zinc-50 dark:bg-[#0a0a0a] overflow-y-auto md:overflow-hidden justify-start md:justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-100 via-zinc-50 to-white dark:hidden pointer-events-none"></div>
              <div className="w-full p-4 md:p-6 z-20 flex justify-between items-center text-zinc-400 dark:text-zinc-500">
                  <div className="flex gap-4 items-center">
                      <button onClick={handleBackFromCamera} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0" title="Kembali"><ArrowLeft size={18} /></button>
                      <span className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-none select-none">Aestho.</span>
                      <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 hidden md:block"></div>
                      <span className="font-modern text-[10px] uppercase tracking-[0.3em] hidden md:block">{currentLayoutData?.name}</span>
                      {selectedMode === 'together' && (
                        <>
                          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 hidden sm:block"></div>
                          <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 hidden sm:inline-flex items-center gap-1.5">
                            <span>Room: {togetherRoomId}</span>
                            <button type="button" onClick={copyTogetherInviteLink} className="hover:text-black dark:hover:text-white transition-colors" title="Salin Link">
                              <Copy size={11} />
                            </button>
                          </span>
                          {togetherPeerConnected ? (
                            <button
                              type="button"
                              onClick={() => setShowDiagnosticModal(true)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-[9px] font-mono font-bold hover:scale-105 transition-transform"
                              title="Klik untuk info diagnostik WebRTC"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Connected ({togetherDiagnostic.candidateType === 'relay (TURN)' ? 'TURN' : 'P2P'})</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowDiagnosticModal(true)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 text-[9px] font-mono hover:scale-105 transition-transform"
                              title="Klik untuk info diagnostik WebRTC"
                            >
                              <Loader2 size={9} className="animate-spin" />
                              <span>{togetherDiagnostic.iceState === 'checking' ? 'Connecting...' : 'Waiting Friend...'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={toggleMic}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold transition-all border shadow-sm ${
                              isMicOn
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                            }`}
                            title={isMicOn ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon'}
                          >
                            {isMicOn ? <Mic size={11} className="text-emerald-500" /> : <MicOff size={11} className="text-rose-500" />}
                            <span>{isMicOn ? 'Mic ON' : 'Muted'}</span>
                          </button>
                        </>
                      )}
                  </div>
                  <div className="flex items-center gap-2">
                    <LanguageSlider />
                    <button
                      onClick={toggleDarkMode}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors shadow-sm flex items-center justify-center shrink-0"
                      title="Toggle Theme"
                    >
                      {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                    <button onClick={() => window.location.reload()} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-black dark:hover:text-white transition-colors" title="Reload"><RefreshCw size={16}/></button>
                  </div>
              </div>
              <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-start md:justify-center px-3 py-2 md:p-4 gap-3 md:gap-4 relative z-10 min-h-0 md:h-full overflow-visible md:overflow-hidden">
                  <div className="flex flex-col items-center justify-center w-full md:w-auto h-auto md:h-full shrink-0">
                       <div className="mb-2 md:mb-4 text-center z-20">
                          <span className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-black dark:text-white border border-zinc-200 dark:border-zinc-700 shadow-sm">SHOT {capturedPhotos.length} / {MAX_PHOTOS}</span>
                      </div>
                      <div className="relative shadow-2xl rounded-sm overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white w-full max-w-[92vw] md:max-w-none md:w-auto h-auto md:h-[65vh] max-h-[42dvh] sm:max-h-[48dvh] md:max-h-none aspect-[3/4] md:aspect-[4/3] flex-shrink-0 ring-1 ring-zinc-100 dark:ring-zinc-900">
                          {useMockCamera ? ( <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-zinc-900 text-gray-500"><span className="font-mono text-xs">Mock Camera Active</span></div> ) : (
                              <>
                                  {isCameraLoading && <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-zinc-900 z-20"><Loader2 className="animate-spin text-zinc-300 dark:text-zinc-600"/></div>}
                                  {!cameraError ? (
                                    selectedMode === 'together' ? (
                                      <div className="absolute inset-0 flex bg-zinc-950">
                                        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
                                        {/* Sisi Kiri: HOST */}
                                        <div className="relative w-1/2 h-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                                          <video
                                            ref={togetherRole === 'host' ? videoRef : remoteVideoRef}
                                            autoPlay
                                            playsInline
                                            muted={true}
                                            className="w-full h-full object-cover transform -scale-x-100"
                                            style={{ filter: currentFilter.style }}
                                          />
                                          {togetherRole === 'guest' && !togetherPeerConnected && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-zinc-950/90 text-white p-4 text-center z-10">
                                              <Loader2 size={26} className="text-zinc-400 animate-spin" />
                                              <div>
                                                <p className="font-modern text-[9px] tracking-widest uppercase font-bold text-zinc-200">Menghubungkan ke Host...</p>
                                                <p className="font-mono text-[9px] text-zinc-400 mt-0.5">Room: {togetherRoomId}</p>
                                              </div>
                                            </div>
                                          )}
                                          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono text-white/90 border border-white/10 select-none shadow-sm z-10">
                                            {togetherRole === 'host' ? 'YOU (HOST)' : 'HOST'}
                                          </div>
                                        </div>

                                        {/* Garis Pemisah Tengah */}
                                        <div className="w-[1.5px] h-full bg-white/20 dark:bg-zinc-700/50 z-10 pointer-events-none" />

                                        {/* Sisi Kanan: GUEST */}
                                        <div className="relative w-1/2 h-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                                          <video
                                            ref={togetherRole === 'guest' ? videoRef : remoteVideoRef}
                                            autoPlay
                                            playsInline
                                            muted={true}
                                            className="w-full h-full object-cover transform -scale-x-100"
                                            style={{ filter: currentFilter.style }}
                                          />
                                          {togetherRole === 'host' && !togetherPeerConnected && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-zinc-950/90 text-white p-4 text-center z-10">
                                              <Users size={30} className="text-zinc-400 animate-pulse" />
                                              <div>
                                                <p className="font-modern text-[9px] tracking-widest uppercase font-bold text-zinc-200">Menunggu Teman...</p>
                                                <p className="font-mono text-[9px] text-zinc-400 mt-0.5">Room: {togetherRoomId}</p>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={copyTogetherInviteLink}
                                                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[9px] font-mono flex items-center gap-1.5 border border-white/20 transition-all text-white active:scale-95 shadow-sm"
                                              >
                                                <Copy size={11} /> Salin Link
                                              </button>
                                            </div>
                                          )}
                                          <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono text-white/90 border border-white/10 select-none shadow-sm z-10">
                                            {togetherRole === 'guest' ? 'YOU' : 'GUEST'}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-0" style={{ filter: currentFilter.style }} />
                                    )
                                  ) : (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2 bg-zinc-50 dark:bg-zinc-900 z-0">
                                      <Camera size={32} />
                                      <p className="font-modern text-[10px]">Camera Error</p>
                                      <button onClick={() => setUseMockCamera(true)} className="mt-2 px-4 py-1 border border-zinc-300 dark:border-zinc-700 text-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Use Mock Camera</button>
                                  </div> )}
                              </>
                          )}
                          {selectedMode === 'character' && (
                          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                              {getCameraOverlay(selectedCharacterData, capturedPhotos.length) && (
                                  <img src={getCameraOverlay(selectedCharacterData, capturedPhotos.length)} referrerPolicy="no-referrer" alt="Frame Overlay" 
                                      className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, capturedPhotos.length)} ${selectedCharacterData.cameraStyles?.[Math.floor(capturedPhotos.length/2)] || ''} h-auto object-contain object-bottom-left`}
                                      style={{ mixBlendMode: 'normal', filter: currentFilter.style === 'none' ? 'none' : `${currentFilter.style} brightness(1.1)`, ...getOverlayInlineStyle(selectedCharacterData, capturedPhotos.length) }} />
                              )}
                          </div>
                          )}
                          {isCountingDown && ( <div className="absolute top-8 right-10 z-100 flex flex-col items-center justify-center pointer-events-none"><span className="font-title text-[5rem] md:text-[8rem] leading-none text-zinc-900 dark:text-white drop-shadow-[0_4px_4px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] animate-pulse">{countdownValue}</span></div> )}
                          {togetherDiagnostic.isWaitingSnapshot && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white gap-2 pointer-events-none animate-fade-in">
                              <Loader2 size={32} className="animate-spin text-white" />
                              <p className="font-mono text-xs uppercase tracking-wider font-bold">Menyinkronkan foto dari Guest...</p>
                              <span className="text-[10px] text-zinc-400 font-mono">Menggabungkan 2 kamera HD</span>
                            </div>
                          )}
                      </div>
                  </div>
                  <div className="flex md:flex-col flex-row w-full max-w-[92vw] md:max-w-none md:w-32 h-16 sm:h-20 md:h-[450px] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 gap-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto hide-scrollbar shadow-inner flex-shrink-0 mt-0 md:mt-8">
                      {capturedPhotos.map((photo, i) => (
                          <div key={i} className="w-16 sm:w-20 md:w-full aspect-[4/3] rounded overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm relative bg-white flex-shrink-0">
                               <div className="absolute top-1 right-1 bg-black/50 text-white text-[8px] px-1 rounded backdrop-blur-sm z-20">#{i+1}</div>
                               <CoverPhoto src={photo} className="w-full h-full z-0 relative" alt={`Captured ${i}`} />
                               {selectedMode === 'character' && getOverlayImage(selectedCharacterData, i) && ( <img src={getOverlayImage(selectedCharacterData, i)} referrerPolicy="no-referrer" className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, i)} h-auto object-contain pointer-events-none z-10`} style={{ mixBlendMode: 'normal', ...getOverlayInlineStyle(selectedCharacterData, i) }} alt="Overlay Mini" /> )}
                          </div>
                      ))}
                      {[...Array(Math.max(0, 8 - capturedPhotos.length))].map((_, i) => ( <div key={`empty-${i}`} className="w-16 sm:w-20 md:w-full aspect-[4/3] rounded border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-300 dark:text-zinc-600 bg-white/50 dark:bg-zinc-800/50 flex-shrink-0"><span className="text-[8px]">{capturedPhotos.length + i + 1}</span></div> ))}
                  </div>
              </div>
              <div className="w-full px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 md:pb-8 md:pt-4 flex justify-center items-center gap-3 sm:gap-6 md:gap-12 z-20">
                   <div className="flex flex-col items-center gap-2 md:gap-3">
                       <div className="flex gap-2 md:gap-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          {filters.map(f => ( <button key={f.id} onClick={() => handleFilterSelect(f)} className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all text-[8px] md:text-[10px] font-bold font-mono border ${currentFilter.id === f.id ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white scale-110 shadow-md' : 'text-zinc-400 dark:text-zinc-500 border-transparent hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800'}`}>{f.name[0]}</button> ))}
                       </div>
                       <span className="font-modern text-[8px] md:text-[10px] tracking-[0.2em] text-zinc-600 dark:text-zinc-400 font-semibold uppercase">Tone</span>
                   </div>
                   {selectedMode === 'together' && (
                       <div className="flex flex-col items-center gap-2 md:gap-3">
                           <button
                               type="button"
                               onClick={toggleMic}
                               className={`h-10 w-10 md:h-12 md:w-12 rounded-full border flex items-center justify-center transition-all shadow-sm active:scale-95 ${
                                   isMicOn
                                       ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                                       : 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25'
                               }`}
                               title={isMicOn ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon'}
                           >
                               {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                           </button>
                           <span className="font-modern text-[8px] md:text-[10px] tracking-[0.2em] text-zinc-600 dark:text-zinc-400 font-semibold uppercase">{isMicOn ? 'Mic ON' : 'Muted'}</span>
                       </div>
                   )}
                   <div className="flex flex-col items-center gap-2 md:gap-3">
                       <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                       <button onClick={handleUploadClick} className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all text-zinc-600 dark:text-zinc-400 shadow-sm"><Upload size={16} className="md:w-5 md:h-5"/></button>
                       <span className="font-modern text-[8px] md:text-[10px] tracking-[0.2em] text-zinc-600 dark:text-zinc-400 font-semibold uppercase">Upload</span>
                   </div>
                   {selectedMode === 'together' && togetherRole === 'guest' ? (
                       <div className="flex flex-col items-center gap-1.5 px-5 py-3 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center">
                           <div className="flex items-center gap-2">
                               <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                               <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Menunggu Host</span>
                           </div>
                           <span className="text-[9px] text-zinc-500 dark:text-zinc-400">Host yang mengontrol shutter</span>
                       </div>
                   ) : (
                       <div className="relative group">
                           <button
                               onClick={handleShutterClick}
                               disabled={(selectedMode === 'together' && !togetherPeerConnected) || capturedPhotos.length >= MAX_PHOTOS}
                               className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white dark:hover:bg-zinc-700 hover:scale-105 active:scale-95 shadow-lg ${
                                 (selectedMode === 'together' && !togetherPeerConnected) || capturedPhotos.length >= MAX_PHOTOS
                                   ? 'opacity-40 cursor-not-allowed'
                                   : ''
                               }`}
                               title={selectedMode === 'together' && !togetherPeerConnected ? 'Menunggu teman terhubung...' : 'Ambil Foto'}
                            >
                              <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 ${capturedPhotos.length >= MAX_PHOTOS ? 'border-green-500/50' : 'border-zinc-800 dark:border-zinc-200'} flex items-center justify-center`}>
                                  {capturedPhotos.length >= MAX_PHOTOS ? <Check className="text-green-500 opacity-80" size={24}/> : <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-zinc-900 dark:bg-white transition-transform duration-300 group-hover:scale-90"></div>}
                              </div>
                           </button>
                       </div>
                   )}
                   <div className="flex flex-col items-center gap-2 md:gap-3">
                       <button onClick={toggleTimer} className="h-10 md:h-12 px-4 md:px-6 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center gap-2 md:gap-3 hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all font-mono text-xs md:text-sm text-zinc-700 dark:text-zinc-300 font-bold shadow-sm"><Clock size={14} className="opacity-70 md:w-4 md:h-4"/><span>{timerDuration}s</span></button>
                       <span className="font-modern text-[8px] md:text-[10px] tracking-[0.2em] text-zinc-600 dark:text-zinc-400 font-semibold uppercase">Delay</span>
                   </div>
              </div>
          </main>
        )}

        {/* --- VIEW 7: RESULT SELECTION --- */}
        {currentView === 'result-selection' && (
            <main className="animate-view-enter relative z-30 flex flex-col min-h-[100dvh] md:h-full w-full overflow-y-auto md:overflow-hidden">
                <div className="w-full p-3 md:p-6 flex justify-between items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 md:relative md:top-auto z-40">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleBackFromCamera}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0"
                        title="Kembali"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <span className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-none select-none">Aestho.</span>
                      <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 hidden sm:block"></div>
                      <span className="font-modern text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 hidden sm:inline">Select & Arrange</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <button onClick={handleToTemplateSelection} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-[10px] md:text-xs font-mono hover:bg-zinc-800 dark:hover:bg-zinc-200 tracking-wider">CHOOSE FRAME <ArrowRight size={12}/></button>
                      <LanguageSlider />
                      <button
                        onClick={toggleDarkMode}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors shadow-sm flex items-center justify-center shrink-0"
                        title="Toggle Theme"
                      >
                        {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                      </button>
                    </div>
                </div>
                <div className="flex-1 flex flex-col md:flex-row w-full h-auto md:h-full p-4 md:p-8 gap-6 md:gap-12 justify-start md:justify-center items-center overflow-y-visible md:overflow-y-auto pb-10">
                    <div className="flex flex-col gap-2 md:gap-4 flex-shrink-0">
                        <div className="font-modern text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500 text-center">YOUR STRIP</div>
                        
                        {selectedLayout === 'grid-4r' ? (
                            <div className="w-[180px] md:w-[240px] h-[270px] md:h-[360px] bg-white dark:ring-1 dark:ring-zinc-700 shadow-2xl p-2 border border-zinc-200 dark:border-transparent grid grid-cols-2 grid-rows-3 gap-2 mx-auto">
                                {selectedStripPhotos.map((photoData, index) => (
                                    <div key={index} className="bg-zinc-100 relative overflow-hidden group border border-zinc-100" draggable={!!photoData} onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)}>
                                        {photoData ? (
                                            <>
                                              <CoverPhoto src={photoData.url} className="w-full h-full transition-all duration-300 group-hover:brightness-50" alt="Selected" />
                                              {selectedMode === 'character' && getOverlayImage(selectedCharacterData, photoData.originalIndex) && (
                                                  <img src={getOverlayImage(selectedCharacterData, photoData.originalIndex)} referrerPolicy="no-referrer" className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, photoData.originalIndex)} h-auto pointer-events-none z-10`} style={{ mixBlendMode: 'normal', ...getOverlayInlineStyle(selectedCharacterData, photoData.originalIndex) }} alt="Strip Overlay" />
                                              )}
                                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30" onClick={() => handleRemoveFromStrip(index)}><Trash2 className="text-white w-6 h-6 md:w-8 md:h-8 drop-shadow-md hover:scale-110 transition-transform" /></div>
                                            </>
                                        ) : ( <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[10px] font-mono border-2 border-dashed border-zinc-300">{index + 1}</div> )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-[100px] md:w-[140px] h-[340px] md:h-[480px] bg-white dark:ring-1 dark:ring-zinc-700 shadow-2xl p-2 border border-zinc-200 dark:border-transparent flex flex-col gap-2 overflow-y-auto hide-scrollbar mx-auto">
                                {selectedStripPhotos.map((photoData, index) => (
                                    <div key={index} className="flex-1 bg-zinc-100 relative overflow-hidden group border border-zinc-100 flex-shrink-0" draggable={!!photoData} onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)}>
                                        {photoData ? (
                                            <>
                                              <CoverPhoto src={photoData.url} className="w-full h-full transition-all duration-300 group-hover:brightness-50" alt="Selected" />
                                              {selectedMode === 'character' && getOverlayImage(selectedCharacterData, photoData.originalIndex) && (
                                                  <img src={getOverlayImage(selectedCharacterData, photoData.originalIndex)} referrerPolicy="no-referrer" className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, photoData.originalIndex)} h-auto pointer-events-none z-10`} style={{ mixBlendMode: 'normal', ...getOverlayInlineStyle(selectedCharacterData, photoData.originalIndex) }} alt="Strip Overlay" />
                                              )}
                                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30" onClick={() => handleRemoveFromStrip(index)}><Trash2 className="text-white w-8 h-8 drop-shadow-md hover:scale-110 transition-transform" /></div>
                                            </>
                                        ) : ( <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[10px] font-mono border-2 border-dashed border-zinc-300">{index + 1}</div> )}
                                    </div>
                                ))}
                                <div className="mt-auto text-center font-title text-[10px] text-black pt-1">Aestho.</div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-4 w-full md:max-w-4xl h-auto md:h-full overflow-y-auto">
                        <div className="font-modern text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500 text-center md:text-left">CAPTURED SHOTS</div>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 pr-0 md:pr-2 pb-20">
                            {capturedPhotos.map((photo, i) => {
                                const isSelected = selectedStripPhotos.some(p => p && p.originalIndex === i);
                                return (
                                    <div key={i} onClick={() => !isSelected && handleSelectPhoto(photo, i)} className={`w-full aspect-[4/3] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 relative transition-all overflow-hidden rounded-lg group ${isSelected ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:ring-2 ring-black dark:hover:ring-white hover:shadow-lg'}`}>
                                        <CoverPhoto src={photo} className="w-full h-full" alt={`Shot ${i}`} />
                                        {selectedMode === 'character' && getOverlayImage(selectedCharacterData, i) && ( <img src={getOverlayImage(selectedCharacterData, i)} referrerPolicy="no-referrer" className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, i)} h-auto object-contain pointer-events-none`} style={{ ...getOverlayInlineStyle(selectedCharacterData, i) }} alt="Grid Overlay" /> )}
                                        {isSelected && ( <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-white/10"><Check className="text-white w-8 h-8 drop-shadow-md" /></div> )}
                                        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity">SHOT #{i+1}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        )}

        {/* --- VIEW 8: TEMPLATE SELECTION --- */}
        {currentView === 'template-selection' && (
            <main className="animate-view-enter relative z-30 flex flex-col min-h-[100dvh] md:h-full w-full overflow-y-auto md:overflow-hidden">
                <div className="w-full p-3 md:p-6 flex justify-between items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 md:relative md:top-auto z-40">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => triggerTransition(() => setCurrentView('result-selection'))}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0"
                        title="Kembali"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <span className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-none select-none">Aestho.</span>
                      <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 hidden sm:block"></div>
                      <span className="font-modern text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 hidden sm:inline">Choose Frame</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <button onClick={handleToStickerEditor} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-[10px] md:text-xs font-mono hover:bg-zinc-800 dark:hover:bg-zinc-200 tracking-wider">NEXT <ArrowRight size={12}/></button>
                      <LanguageSlider />
                      <button
                        onClick={toggleDarkMode}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors shadow-sm flex items-center justify-center shrink-0"
                        title="Toggle Theme"
                      >
                        {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                      </button>
                    </div>
                </div>
                <div className="flex-1 flex flex-col md:flex-row w-full h-auto md:h-full justify-start md:justify-center items-center gap-4 md:gap-10 p-4 overflow-y-auto md:overflow-hidden pb-8">
                    <div className="flex-none flex flex-col items-center justify-center w-full md:w-auto h-auto md:h-full relative order-1 md:order-1">
                        <span className="font-modern text-[10px] md:text-[11px] tracking-[0.22em] text-zinc-400 dark:text-zinc-500 mb-3 md:mb-8">YOUR RESULT</span>
                        <div className="transform scale-100 origin-center">
                          <AesthoStrip template={selectedTemplate} photos={selectedStripPhotos} mode={selectedMode} characterData={selectedCharacterData} scale={isMobile ? (selectedLayout === 'grid-4r' ? 0.22 : 0.21) : (selectedLayout === 'grid-4r' ? 0.31 : 0.29)} layoutConfig={getLayoutConfig(selectedLayout)} />
                        </div>
                    </div>
                    <div className="flex-none flex flex-col items-center justify-start w-full md:w-auto min-h-[400px] h-auto md:h-full relative bg-gray-50/30 dark:bg-[#111] rounded-2xl border border-gray-100/50 dark:border-zinc-800 order-2 md:order-2 pt-5 pb-5 md:pt-8 md:pb-3 overflow-visible">
                        <span className="font-modern text-[10px] md:text-[11px] tracking-[0.22em] text-zinc-400 dark:text-zinc-500 mb-4">SELECT FRAME</span>

                        <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6 px-4">
                            <button
                                type="button"
                                onClick={() => handleTemplateCategorySelect('aestho')}
                                className={`h-9 md:h-10 px-5 md:px-7 rounded-xl border text-[9px] md:text-[10px] font-modern font-bold tracking-[0.18em] transition-all active:scale-95 ${selectedTemplateCategory === 'aestho' ? 'bg-black text-white border-black shadow-lg dark:bg-white dark:text-black dark:border-white' : 'bg-white/80 text-zinc-500 border-zinc-200 hover:border-black hover:text-black dark:bg-zinc-900/80 dark:text-zinc-400 dark:border-zinc-700 dark:hover:text-white dark:hover:border-white'}`}
                            >
                                AESTHO
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTemplateCategorySelect('genshin')}
                                className={`h-9 md:h-10 px-5 md:px-7 rounded-xl border text-[9px] md:text-[10px] font-modern font-bold tracking-[0.18em] transition-all active:scale-95 ${selectedTemplateCategory === 'genshin' ? 'bg-black text-white border-black shadow-lg dark:bg-white dark:text-black dark:border-white' : 'bg-white/80 text-zinc-500 border-zinc-200 hover:border-black hover:text-black dark:bg-zinc-900/80 dark:text-zinc-400 dark:border-zinc-700 dark:hover:text-white dark:hover:border-white'}`}
                            >
                                GENSHIN
                            </button>
                        </div>

                        {selectedTemplateCategory && visibleTemplateOptions.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => scrollTemplateList('left')}
                                    aria-label="Previous frame"
                                    className="absolute left-2 md:left-4 top-[58%] -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 shadow-lg backdrop-blur-md flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95 transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => scrollTemplateList('right')}
                                    aria-label="Next frame"
                                    className="absolute right-2 md:right-4 top-[58%] -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 shadow-lg backdrop-blur-md flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95 transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>

                                <div className="pointer-events-none absolute left-0 top-[120px] bottom-0 w-16 bg-gradient-to-r from-gray-50/80 to-transparent dark:from-[#111]/80 z-10 rounded-l-2xl" />
                                <div className="pointer-events-none absolute right-0 top-[120px] bottom-0 w-16 bg-gradient-to-l from-gray-50/80 to-transparent dark:from-[#111]/80 z-10 rounded-r-2xl" />
                            </>
                        )}

                        {!selectedTemplateCategory ? (
                            <div className="w-full md:w-[560px] h-[300px] md:h-full flex flex-col items-center justify-center px-10 text-center">
                                <div className="w-16 h-16 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center mb-5 text-zinc-300 dark:text-zinc-600">
                                    <LayoutTemplate size={22} />
                                </div>
                                <p className="font-modern text-[10px] tracking-[0.24em] text-zinc-400 dark:text-zinc-500 uppercase leading-relaxed">
                                    Choose frame category first
                                </p>
                            </div>
                        ) : visibleTemplateOptions.length === 0 ? (
                            <div className="w-full md:w-[560px] h-[300px] md:h-full flex flex-col items-center justify-center px-10 text-center">
                                <p className="font-modern text-[10px] tracking-[0.24em] text-zinc-400 dark:text-zinc-500 uppercase leading-relaxed">
                                    No frame available in this collection
                                </p>
                            </div>
                        ) : (
                            <div ref={templateListRef} className="w-full md:max-w-xl h-[300px] md:h-full overflow-x-auto overflow-y-visible snap-x snap-mandatory flex items-center gap-9 md:gap-12 hide-scrollbar px-14 md:px-24 py-5 md:py-16 scroll-smooth">
                                {visibleTemplateOptions.map((tpl) => (
                                    <div key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`cursor-pointer flex-shrink-0 flex flex-col items-center gap-2 md:gap-4 transition-all duration-500 snap-center ${selectedTemplate?.id === tpl.id ? 'opacity-100 z-20 drop-shadow-xl scale-105 md:scale-110' : 'opacity-60 hover:opacity-100 scale-90'}`}>
                                        <div className="pointer-events-none border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white overflow-visible transform scale-90 md:scale-105 origin-center">
                                             <AesthoStrip template={tpl} photos={selectedStripPhotos} mode={selectedMode} characterData={selectedCharacterData} scale={isMobile ? (selectedLayout === 'grid-4r' ? 0.12 : 0.16) : (selectedLayout === 'grid-4r' ? 0.12 : 0.18)} shadow={false} layoutConfig={getLayoutConfig(selectedLayout)} />
                                        </div>
                                        <span className="font-modern text-[8px] uppercase text-center mt-1 tracking-widest text-zinc-500 dark:text-zinc-400 max-w-[90px] leading-relaxed">{tpl.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        )}

        {/* --- VIEW 8.5: STICKER EDITOR --- */}
        {currentView === 'sticker-editor' && (
            <main className="animate-view-enter relative z-30 flex flex-col min-h-[100dvh] md:h-full w-full overflow-y-auto md:overflow-hidden" onClick={() => setActiveStickerId(null)}>
                <div className="w-full p-3 md:p-6 flex justify-between items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111] z-40 sticky top-0 md:relative md:top-auto shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleBackToTemplate}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0"
                        title="Kembali"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <span className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-none select-none">Aestho.</span>
                      <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 hidden sm:block"></div>
                      <span className="font-modern text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 hidden sm:inline">Decorate Strip</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <button onClick={handleToFinalResult} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-[10px] md:text-xs font-mono hover:bg-zinc-800 dark:hover:bg-zinc-200 tracking-wider shadow-md hover:shadow-lg transition-all">FINISH <Check size={12}/></button>
                      <LanguageSlider />
                      <button
                        onClick={toggleDarkMode}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors shadow-sm flex items-center justify-center shrink-0"
                        title="Toggle Theme"
                      >
                        {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                      </button>
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col md:flex-row w-full h-auto md:h-full overflow-y-auto md:overflow-hidden">
                    {/* Kiri: Canvas */}
                    <div className="flex-1 flex items-center justify-center bg-zinc-100 dark:bg-[#050505] p-3 md:p-4 relative overflow-auto border-r border-zinc-200 dark:border-zinc-800 hide-scrollbar cursor-crosshair min-h-[430px] md:min-h-0">
                        <div className="transform origin-center flex items-center justify-center my-auto transition-transform duration-300" 
                             onClick={(e) => e.stopPropagation()}>
                            <AesthoStrip 
                               template={selectedTemplate} 
                               photos={selectedStripPhotos} 
                               mode={selectedMode} 
                               characterData={selectedCharacterData} 
                               scale={isMobile ? (selectedLayout === 'grid-4r' ? 0.28 : 0.22) : (selectedLayout === 'grid-4r' ? 0.42 : 0.33)} 
                               layoutConfig={getLayoutConfig(selectedLayout)}
                               isEditable={true} 
                            />
                        </div>
                        
                        {!activeStickerId && (
                            <span className="absolute bottom-6 left-1/2 transform -translate-x-1/2 font-modern text-[10px] text-zinc-500 dark:text-zinc-400 bg-white/90 dark:bg-zinc-800/90 px-6 py-2 rounded-full shadow-sm backdrop-blur-md pointer-events-none border border-zinc-200 dark:border-zinc-700 uppercase tracking-widest hidden md:block">Click & Drag Stickers to Move</span>
                        )}

                        {/* Toolbar Kontrol Stiker Aktual */}
                        {activeStickerId && (
                            <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md px-3 py-2 md:px-6 md:py-3 rounded-full shadow-2xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1 md:gap-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300" onClick={e => e.stopPropagation()}>
                                <button onClick={() => handleScaleSticker('down')} className="p-1.5 md:p-2 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors" title="Perkecil"><ZoomOut size={18}/></button>
                                <button onClick={() => handleScaleSticker('up')} className="p-1.5 md:p-2 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors" title="Perbesar"><ZoomIn size={18}/></button>
                                
                                <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1"></div>
                                
                                <button onClick={() => handleRotateSticker('left')} className="p-1.5 md:p-2 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors" title="Putar Kiri"><RotateCcw size={18}/></button>
                                <button onClick={() => handleRotateSticker('right')} className="p-1.5 md:p-2 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors" title="Putar Kanan"><RotateCw size={18}/></button>
                                
                                <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1"></div>
                                
                                <button onClick={handleDuplicateSticker} className="p-1.5 md:p-2 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors" title="Duplikat"><Copy size={18}/></button>
                                <button onClick={() => removeSticker(activeStickerId)} className="p-1.5 md:p-2 text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors" title="Hapus"><Trash2 size={18}/></button>
                            </div>
                        )}
                    </div>
                    
                    {/* Kanan: Sidebar Sticker Palette */}
                    <div className="w-full md:w-[380px] bg-white dark:bg-[#111] h-[42dvh] md:h-full flex flex-col z-10 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 md:p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#0a0a0a]">
                            <h3 className="font-modern text-xs font-bold tracking-[0.2em] text-zinc-800 dark:text-zinc-100 uppercase">Stickers</h3>
                            <button onClick={() => {setPlacedStickers([]); setActiveStickerId(null);}} className="text-[10px] font-modern tracking-widest text-red-500 hover:text-red-700 dark:hover:text-red-400 uppercase bg-red-50 dark:bg-red-950/30 px-3 py-1 rounded-full transition-colors">Clear All</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 md:p-5 hide-scrollbar grid grid-cols-4 md:grid-cols-3 gap-3 md:gap-4 content-start bg-[#FDFDFD] dark:bg-[#111]">
                            {/* Upload User Button */}
                            <div onClick={() => stickerUploadRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-md">
                                <ImagePlus size={20} />
                                <span className="text-[8px] font-modern uppercase tracking-wider">Upload</span>
                                <input type="file" ref={stickerUploadRef} onChange={handleStickerUpload} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp" />
                            </div>
                            
                            {/* User Stickers */}
                            {userStickers.map((url, i) => (
                                <div key={`user-${i}`} onClick={() => handleAddSticker(url)} className="aspect-square rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2 md:p-3 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center justify-center group relative overflow-hidden">
                                    <img src={url} alt="User Sticker" className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform" />
                                </div>
                            ))}

                            {/* Default Theme Stickers */}
                            {defaultStickers.map((url, i) => (
                                <div key={`def-${i}`} onClick={() => handleAddSticker(url)} className="aspect-square rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2 md:p-3 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center justify-center group relative overflow-hidden">
                                    <img src={url} alt="Sticker" className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform opacity-90 group-hover:opacity-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        )}

        {/* --- VIEW 9: FINAL RESULT --- */}
        {currentView === 'final-result' && (
          <main className="animate-view-enter relative z-30 flex flex-col h-[100dvh] md:h-full w-full overflow-hidden">
               <div className="w-full p-3 md:p-6 flex justify-between items-center gap-2 md:gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111] z-20 shadow-sm shrink-0">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleToStickerEditor}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0"
                        title="Kembali ke Editor Stiker"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <span className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-none select-none">Aestho.</span>
                      <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 hidden sm:block"></div>
                      <span className="font-modern text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 hidden sm:inline">{t.finalResult.title}</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
                        <button onClick={downloadStaticJPG} disabled={isDownloadingJPG} className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-5 md:py-2 bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-[9px] md:text-xs font-mono hover:bg-zinc-800 tracking-wider disabled:opacity-50 transition-all border border-transparent">
                            {isDownloadingJPG ? <Loader2 size={12} className="animate-spin"/> : <Download size={12}/>} {t.finalResult.downloadJpg}
                        </button>
                        <button onClick={downloadLiveVideo} disabled={isDownloadingVideo} className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-5 md:py-2 bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-[9px] md:text-xs font-mono hover:bg-zinc-800 tracking-wider disabled:opacity-50 transition-all border border-transparent">
                            {isDownloadingVideo ? <Loader2 size={12} className="animate-spin"/> : <Download size={12}/>} {t.finalResult.downloadVideo}
                        </button>
                        <LanguageSlider />
                        <button
                          onClick={toggleDarkMode}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors shadow-sm flex items-center justify-center shrink-0"
                          title="Toggle Theme"
                        >
                          {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                    </div>
                </div>
                
                                {/* HIDDEN RENDER */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '1px',
                        height: '1px',
                        overflow: 'visible',
                        pointerEvents: 'none',
                        zIndex: -9999
                    }}
                >
                    <AesthoStrip stripRef={staticStripRef} template={selectedTemplate} photos={selectedStripPhotos} mode={selectedMode} characterData={selectedCharacterData} scale={1} shadow={false} layoutConfig={getLayoutConfig(selectedLayout)} />
                </div>
                
                {/* HIDDEN RENDER */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '1px',
                        height: '1px',
                        overflow: 'visible',
                        pointerEvents: 'none',
                        zIndex: -9999
                    }}
                >
                    <AesthoStrip stripRef={baseStripRef} template={selectedTemplate} photos={Array(selectedLayout === 'grid-4r' ? 6 : 4).fill(null)} mode="original" scale={1} shadow={false} layoutConfig={getLayoutConfig(selectedLayout)} showPlacedStickers={false} />
                </div>

                <div className="flex-1 min-h-0 w-full px-4 pt-7 pb-[calc(11rem+env(safe-area-inset-bottom))] md:px-8 md:pt-10 md:pb-28 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-[#050505] relative z-0">
                    <div className="min-h-full w-full flex items-center justify-center">
                        <div className="w-full max-w-[1120px] grid grid-cols-1 md:grid-cols-[minmax(190px,250px)_auto_minmax(240px,290px)] items-center gap-7 md:gap-7 lg:gap-8">
                            {/* Spacer kanan-kiri agar dua strip tetap terasa tepat di tengah halaman */}
                            <div className="hidden md:block" aria-hidden="true" />

                            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-8 lg:gap-9 md:-translate-x-10 lg:-translate-x-16 transition-transform">
                                <div className="w-full sm:w-auto flex flex-col items-center gap-3 md:gap-4 shrink-0 overflow-visible">
                                    <span className="font-modern text-[10px] tracking-[0.2em] text-zinc-400 dark:text-zinc-500">{t.finalResult.staticResult}</span>
                                    <div className="transform scale-100 origin-top">
                                      <AesthoStrip template={selectedTemplate} photos={selectedStripPhotos} mode={selectedMode} characterData={selectedCharacterData} scale={isMobile ? (selectedLayout === 'grid-4r' ? 0.24 : 0.205) : (selectedLayout === 'grid-4r' ? 0.32 : 0.34)} layoutConfig={getLayoutConfig(selectedLayout)} />
                                    </div>
                                </div>

                                <div className="w-full sm:w-auto flex flex-col items-center gap-3 md:gap-4 shrink-0 overflow-visible">
                                    <span className="font-modern text-[10px] tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2">{t.finalResult.liveMoment} <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div></span>
                                    <div className="transform scale-100 origin-top">
                                      <AesthoStrip template={selectedTemplate} photos={selectedStripPhotos} clips={capturedClips} mode={selectedMode} characterData={selectedCharacterData} scale={isMobile ? (selectedLayout === 'grid-4r' ? 0.24 : 0.205) : (selectedLayout === 'grid-4r' ? 0.32 : 0.34)} layoutConfig={getLayoutConfig(selectedLayout)} />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full max-w-[300px] md:w-[300px] lg:w-[310px] mx-auto md:mx-0 flex flex-col items-center gap-3 md:gap-4 shrink-0">
                                <span className="font-modern text-[10px] tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                                    {t.finalResult.scanResult}
                                    {isGeneratingQR && <Loader2 size={12} className="animate-spin" />}
                                </span>

                                <div className="w-full rounded-[1.75rem] bg-white/90 dark:bg-zinc-950/80 border border-white/80 dark:border-zinc-800 shadow-[0_18px_55px_rgba(0,0,0,0.09)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.42)] overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-28 h-28 bg-pink-100/70 dark:bg-pink-500/10 blur-3xl rounded-full -translate-x-10 -translate-y-10 pointer-events-none" />
                                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100/80 dark:bg-blue-500/10 blur-3xl rounded-full translate-x-10 translate-y-10 pointer-events-none" />

                                    <div className="relative z-10 p-4 md:p-5 text-center">
                                        <p className="font-modern text-[8px] tracking-[0.28em] text-zinc-400 uppercase mb-1">
                                            {t.finalResult.yourQrCode}
                                        </p>

                                        <h3 className="font-title text-3xl md:text-[2.15rem] text-black dark:text-white mb-2">
                                            {t.finalResult.scanResult}
                                        </h3>

                                        <p className="text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400 mb-3">
                                            {t.finalResult.qrDesc}
                                        </p>

                                        <div className="min-h-[198px] md:min-h-[210px] rounded-[1.35rem] bg-white border border-zinc-100 shadow-inner flex items-center justify-center p-3">
                                            {qrResultUrl ? (
                                                <QRCodeSVG
                                                    value={qrResultUrl}
                                                    size={isMobile ? 176 : 188}
                                                    bgColor="#ffffff"
                                                    fgColor="#000000"
                                                    level="M"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-3 text-zinc-400">
                                                    {isGeneratingQR ? (
                                                        <>
                                                            <Loader2 size={24} className="animate-spin" />
                                                            <span className="font-modern text-[9px] tracking-[0.18em] uppercase">{t.finalResult.preparingQr}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <QrCode size={26} />
                                                            <button
                                                                onClick={() => handleGenerateQRCode({ force: true })}
                                                                className="px-4 py-2 rounded-full bg-black text-white text-[9px] font-mono tracking-widest hover:bg-zinc-800 transition-colors"
                                                            >
                                                                {t.finalResult.createQr}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {qrGenerationMessage && (
                                            <p className="mt-2.5 text-[8.5px] text-zinc-400 dark:text-zinc-500 font-modern tracking-[0.12em] uppercase leading-relaxed">
                                                {qrGenerationMessage}
                                            </p>
                                        )}

                                        <div className="mt-3 grid grid-cols-1 gap-2">
                                            {qrResultUrl && (
                                                <>
                                                    <a
                                                        href={qrResultUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[8.5px] tracking-widest hover:opacity-80 transition-opacity"
                                                    >
                                                        {t.finalResult.openResultPage}
                                                    </a>

                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await navigator.clipboard.writeText(qrResultUrl);
                                                                showToast(t.finalResult.toastCopied);
                                                            } catch {
                                                                showToast(t.finalResult.toastCopyFailed);
                                                            }
                                                        }}
                                                        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 font-mono text-[8.5px] tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                                    >
                                                        <Copy size={11} />
                                                        {t.finalResult.copyLink}
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {qrResultUrl && (
                                            <p className="mt-2.5 text-[7.5px] text-zinc-300 dark:text-zinc-600 font-mono break-all leading-relaxed">
                                                {qrResultUrl}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === CREDIT FINAL RESULT === */}
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:bottom-6 md:right-7 md:left-auto md:translate-x-0 z-50 pointer-events-none px-3 w-full md:w-auto flex justify-center md:justify-end">
                    <div className="pointer-events-auto max-w-[calc(100vw-1.5rem)] rounded-[1.45rem] bg-white/78 dark:bg-zinc-950/72 backdrop-blur-2xl border border-white/70 dark:border-zinc-800/80 shadow-[0_18px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45)] p-1 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(175px,auto)] gap-1 items-stretch">
                        <div className="flex flex-col gap-0.5 min-w-[185px]">
                            <a 
                                href="https://www.instagram.com/dzev.c/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                            >
                                <Instagram size={12} className="text-zinc-400 group-hover:text-pink-400 transition-colors" />
                                <span className="font-modern text-[8px] md:text-[8.5px] tracking-[0.16em] uppercase font-bold whitespace-nowrap">
                                    <span className="text-zinc-400 dark:text-zinc-500 group-hover:text-white/70 dark:group-hover:text-black/60">Dev</span> @dzev.c
                                </span>
                            </a>

                            {showSelectedShinhlinCredit && (
                                <a
                                    href={SHINHLIN_INSTAGRAM_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                                >
                                    <Instagram size={12} className="text-zinc-400 group-hover:text-pink-400 transition-colors" />
                                    <span className="font-modern text-[8px] md:text-[8.5px] tracking-[0.16em] uppercase font-bold whitespace-nowrap">
                                        <span className="text-zinc-400 dark:text-zinc-500 group-hover:text-white/70 dark:group-hover:text-black/60">Artist</span> @shinhlin
                                    </span>
                                </a>
                            )}
                        </div>

                        <div className="flex flex-col gap-0.5 min-w-[175px]">
                            <a
                                href={REQUEST_CHARACTER_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-transparent transition-all duration-300 shadow-sm"
                                title="Request a new character for Aestho"
                            >
                                <Sparkles size={12} className="text-zinc-400 group-hover:text-yellow-300 dark:group-hover:text-yellow-500 transition-colors" />
                                <span className="font-modern text-[8px] md:text-[8.5px] tracking-[0.16em] uppercase font-bold whitespace-nowrap">Request Character</span>
                            </a>

                            <a
                                href={TRAKTEER_SUPPORT_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 bg-zinc-950 text-white dark:bg-white dark:text-black hover:opacity-90 transition-all duration-300 shadow-sm"
                                title="Support Aestho on Trakteer"
                            >
                                <Heart size={12} className="fill-current" />
                                <span className="font-modern text-[8px] md:text-[8.5px] tracking-[0.16em] uppercase font-bold whitespace-nowrap">Support Aestho</span>
                            </a>
                        </div>
                    </div>
                </div>

          </main>
        )}
        </div>

        {/* --- GLOBAL TOAST NOTIFICATION --- */}
        {toastMessage && (
            <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[110] animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="bg-zinc-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-sans text-xs border border-zinc-700 max-w-sm text-center md:max-w-md">
                    <span className="flex-1 leading-relaxed">{toastMessage}</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
