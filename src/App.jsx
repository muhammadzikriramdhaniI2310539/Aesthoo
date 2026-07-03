import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, Plus, Star, Users, Camera, RefreshCw, Sliders, Clock, Download, Check, Loader2, Play, VideoOff, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Printer, LayoutTemplate, Sparkles, Image as ImageIcon, Palette, Flame, Swords, Heart, Cloud, Moon, Zap, Music, Ghost, Sun, Upload, Trash2, Film, ImagePlus, Copy, RotateCcw, RotateCw, ZoomIn, ZoomOut, Instagram, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const SHINHLIN_INSTAGRAM_URL = 'https://www.instagram.com/shinhlin/';
const TRAKTEER_SUPPORT_URL = 'https://trakteer.id/dzev';

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

const SummaryResultPage = () => {
  const [result, setResult] = useState(null);
  const [isLoadingResult, setIsLoadingResult] = useState(true);
  const [resultError, setResultError] = useState('');

  const resultId = getSummaryIdFromPath();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const savedTheme = window.localStorage.getItem('aestho-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  useEffect(() => {
    const loadResult = async () => {
      if (!resultId) {
        setResultError('Link hasil tidak valid.');
        setIsLoadingResult(false);
        return;
      }

      if (!supabase) {
        setResultError('Supabase belum disetting.');
        setIsLoadingResult(false);
        return;
      }

      const { data, error } = await supabase
        .from('aestho_results')
        .select('*')
        .eq('id', resultId)
        .single();

      if (error || !data) {
        setResultError('Hasil tidak ditemukan atau sudah tidak tersedia.');
        setIsLoadingResult(false);
        return;
      }

      setResult(data);
      setIsLoadingResult(false);
    };

    loadResult();
  }, [resultId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin.');
    } catch {
      alert('Gagal menyalin link.');
    }
  };

  if (isLoadingResult) {
    return (
      <main className="min-h-screen bg-[#f7f5f2] text-black flex items-center justify-center p-6">
        <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl p-8 text-center max-w-sm w-full">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-zinc-500" />
          <h1 className="font-title text-3xl mb-2">Aestho.</h1>
          <p className="font-modern text-[10px] tracking-[0.2em] text-zinc-400 uppercase">Loading your result</p>
        </div>
      </main>
    );
  }

  if (resultError) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 rounded-[2rem] border border-zinc-800 shadow-xl p-8 text-center max-w-sm w-full">
          <h1 className="font-title text-3xl mb-3">Aestho.</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">{resultError}</p>
          <a href="/" className="mt-6 inline-flex px-5 py-3 rounded-full bg-white text-black text-[10px] font-mono tracking-widest">MAKE ANOTHER</a>
        </div>
      </main>
    );
  }

  const mp4Url = result.video_mp4_url || toCloudinaryMp4Url(result.video_url);

  return (
    <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative transition-colors duration-500">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-200/40 dark:bg-pink-500/10 blur-3xl rounded-full -translate-x-20 -translate-y-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200/40 dark:bg-blue-500/10 blur-3xl rounded-full translate-x-20 translate-y-20 pointer-events-none" />

      <section className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 md:gap-12 items-center">
        {/* Left Panel: Text & Actions */}
        <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] border border-white/50 dark:border-zinc-800 shadow-2xl p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <p className="font-modern text-[10px] tracking-[0.3em] text-zinc-400 dark:text-zinc-500 uppercase mb-3 flex items-center gap-2">
              <Star className="w-3 h-3" /> Aestho Photobooth
            </p>
           <h1
                className="text-6xl md:text-7xl leading-[0.95] mb-5 text-zinc-900 dark:text-white font-normal"
            style={{ fontFamily: "'Great Vibes', cursive" }}
            >
            Your Masterpiece <br />
            is Ready 
            </h1>
            <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Save your captured moments. Download your high-res JPG strip, get the Live Moment video, or share this page directly with your friends.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={result.photo_url}
              target="_blank"
              rel="noopener noreferrer"
              download="Aestho-Strip.jpg"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-modern font-bold tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              <Download className="w-4 h-4" /> STATIC JPG
            </a>

            {mp4Url && (
              <a
                href={mp4Url}
                target="_blank"
                rel="noopener noreferrer"
                download="Aestho-Live-Moment.mp4"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-modern font-bold tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <Film className="w-4 h-4" /> LIVE MOMENT
              </a>
            )}

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white text-[10px] font-modern font-bold tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <Copy className="w-4 h-4" /> COPY LINK
            </button>
            
            <a
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white text-[10px] font-modern font-bold tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> NEW SESSION
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-1">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase">
              Result ID: <span className="text-zinc-600 dark:text-zinc-300 font-bold">{result.id}</span>
            </p>
            {result.template_name && (
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase">
                Frame Style: <span className="text-zinc-600 dark:text-zinc-300 font-bold">{result.template_name}</span>
              </p>
            )}

          </div>
        </div>

        {/* Right Panel: Display Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* JPG Preview */}
          <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 dark:border-zinc-800 shadow-xl p-5 flex flex-col gap-4 transform transition-transform duration-300 hover:-translate-y-2">
            <div className="flex items-center justify-center gap-2">
              <ImageIcon className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
              <p className="font-modern text-[10px] tracking-[0.2em] text-zinc-500 dark:text-zinc-400 text-center font-bold">STATIC RESULT</p>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-2 rounded-[2rem] shadow-inner border border-zinc-100 dark:border-zinc-800">
              <img
                src={result.photo_url}
                alt="Aestho Photobooth Result"
                className="max-h-[60vh] w-auto mx-auto rounded-[1.5rem] object-contain"
              />
            </div>
          </div>

          {/* MP4 Preview */}
          {result.video_url && (
            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 dark:border-zinc-800 shadow-xl p-5 flex flex-col gap-4 transform transition-transform duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="font-modern text-[10px] tracking-[0.2em] text-zinc-500 dark:text-zinc-400 text-center font-bold">LIVE MOMENT</p>
              </div>
              <div className="bg-black p-2 rounded-[2rem] shadow-inner border border-zinc-800 relative overflow-hidden flex-1 flex flex-col">
                <video
                  src={result.video_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full max-h-[60vh] rounded-[1.5rem] object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

const App = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/id/summary')) {
    return <SummaryResultPage />;
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
    }
  ];

  // C. Filter Presets
  const filters = [
    { id: 'normal', name: 'Normal', style: 'none' },
    { id: 'bw', name: 'BW', style: 'grayscale(100%) contrast(1.1)' },
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
        { id: 'zhongli', name: 'Zhongli', overlayImg: 'https://placehold.co/600x800/transparent/d97706?text=Zhongli+Pose', theme: 'bg-yellow-50' },
        { id: 'raiden', name: 'Raiden Shogun', overlayImg: 'https://placehold.co/600x800/transparent/9333ea?text=Raiden+Pose', theme: 'bg-purple-50' },
        { id: 'nahida', name: 'Nahida', overlayImg: 'https://placehold.co/600x800/transparent/22c55e?text=Nahida+Pose', theme: 'bg-green-50' },
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
        { id: 'tartaglia', name: 'Tartaglia', overlayImg: 'https://placehold.co/600x800/transparent/ef4444?text=Tartaglia+Pose', theme: 'bg-red-50' },
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
              sticker: <img crossOrigin="anonymous" src="https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Genshin_Impact_logo.svg/2560px-Genshin_Impact_logo.svg.png" className="w-32 h-auto opacity-80" alt="Genshin" />
          },
          { 
              id: 'frame-hsr', 
              name: 'Astral Express', 
              type: 'css', 
              bgColor: '#1e1b4b', 
              textColor: '#e0e7ff', 
              styleContainer: { background: 'linear-gradient(to bottom, #0f172a, #312e81)', border: '4px solid rgba(99, 102, 241, 0.3)' },
              photoRadius: 'rounded-sm',
              sticker: <img crossOrigin="anonymous" src="https://preview.redd.it/what-is-the-font-for-the-hsr-logo-v0-06d75o5cvn3b1.png?width=1290&format=png&auto=webp&s=6f720d993f23ba56cb4ab7931320f091d45c9973" className="w-24 h-auto opacity-90 invert" alt="HSR" />
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

  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [currentView, setCurrentView] = useState('home'); 
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(stripTemplates[0]);

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
  const [showQRModal, setShowQRModal] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

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
      if (typeof window === 'undefined') return 1;
      // Live Moment dibuat lebih ringan supaya video tidak patah-patah, terutama di HP.
      if (window.innerWidth < 768) return selectedLayout === 'grid-4r' ? 0.48 : 0.62;
      return selectedLayout === 'grid-4r' ? 0.75 : 0.9;
  };

  const videoRef = useRef(null);
  const characterListRef = useRef(null); 
  const animeListRef = useRef(null); 
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);
  
  const staticStripRef = useRef(null); // Ref untuk export Canvas ke JPG
  const baseStripRef = useRef(null); // Ref untuk base background saat render Video

  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const currentLayoutData = layouts.find(l => l.id === selectedLayout);
  const currentAnimeData = animeOptions.find(a => a.id === selectedAnime);
  const selectedCharacterData = currentAnimeData?.characters.find(c => c.id === selectedFrame);
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
    if (Array.isArray(character.overlayImg)) {
        const poseIndex = Math.floor(photoIndex / 2);
        return character.overlayImg[poseIndex % character.overlayImg.length];
    }
    return character.overlayImg;
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

  const getCameraOverlay = (character, shotCount) => {
      if (!character || !character.overlayImg) return null;
      if (Array.isArray(character.overlayImg)) {
          const poseIndex = Math.floor(shotCount / 2);
          return character.overlayImg[poseIndex % character.overlayImg.length];
      }
      return character.overlayImg;
  }

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
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: window.innerWidth < 768 ? 960 : 1280 },
          height: { ideal: window.innerWidth < 768 ? 720 : 960 }
        },
        audio: false
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera Error:", err);
      setCameraError(true);
    } finally {
      setIsCameraLoading(false);
    }
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
  }, [currentView, useMockCamera]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(e => console.error("Auto-play blocked:", e));
      };
    }
  }, [stream]);

  const triggerTransition = (callback) => { callback(); };
  const handleStart = () => triggerTransition(() => setCurrentView('layout'));
  const handleLayoutConfirm = () => selectedLayout && triggerTransition(() => setCurrentView('mode'));
  const handleModeConfirm = () => {
    setCapturedPhotos([]); 
    setCapturedClips([]); 
    setSelectedStripPhotos(Array(selectedLayout === 'grid-4r' ? 6 : 4).fill(null));
    setUseMockCamera(false);
    if (selectedMode === 'original') triggerTransition(() => setCurrentView('camera-session')); 
    else if (selectedMode === 'character') triggerTransition(() => setCurrentView('anime'));
  };
  const handleAnimeSelect = (id) => { setSelectedAnime(id); triggerTransition(() => setCurrentView('frame')); };
  const handleFrameConfirm = () => triggerTransition(() => setCurrentView('camera-session'));
  const handleToTemplateSelection = () => {
      const validTemplates = stripTemplates.filter(t => t.layoutId === selectedLayout);
      if (validTemplates.length > 0 && selectedTemplate.layoutId !== selectedLayout) {
          setSelectedTemplate(validTemplates[0]);
      }
      setCurrentView('template-selection');
  };
  
  const handleToStickerEditor = () => setCurrentView('sticker-editor');
  
  const handleBackToTemplate = () => setCurrentView('template-selection');
  
  const handleToFinalResult = () => {
      setActiveStickerId(null);
      setCurrentView('final-result'); 
  };
  const handleBackToHome = () => { setCurrentView('home'); setSelectedLayout(null); };
  const handleBackToLayout = () => { setCurrentView('layout'); setSelectedMode(null); };
  const handleBackToMode = () => { setCurrentView('mode'); setSelectedAnime(null); };
  const handleBackToModeFromAnime = () => { setCurrentView('mode'); setSelectedAnime(null); };
  const handleBackToAnimeFromFrame = () => { setCurrentView('anime'); setSelectedFrame(null); };

  const handleBackFromCamera = () => {
      if (selectedMode === 'character') setCurrentView('frame');
      else setCurrentView('mode');
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

  const startRecording = () => {
    if (!stream || useMockCamera) return;
    const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
    let selectedType = '';
    for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) { selectedType = type; break; }
    }
    if (!selectedType) return;
    try {
        const recorder = new MediaRecorder(stream, { mimeType: selectedType });
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
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
      } else if (useMockCamera) {
           setCapturedClips(prev => [...prev, "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"]);
      }
  };

  const handleShutterClick = () => {
    if (isCountingDown || capturedPhotos.length >= MAX_PHOTOS) return;
    setIsCountingDown(true);
    setCountdownValue(timerDuration);
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
      if (newPhotos.length >= MAX_PHOTOS) {
          triggerTransition(() => setCurrentView('result-selection'));
      }
  }

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
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
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
      const mimeTypes = [
          'video/mp4;codecs=h264',
          'video/mp4',
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm'
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
          throw new Error('Sistem pemroses video belum siap. Coba tunggu sebentar.');
      }

      if (!HTMLCanvasElement.prototype.captureStream || !window.MediaRecorder) {
          throw new Error('Browser ini belum mendukung export Live Moment. Coba pakai Chrome Android atau Safari terbaru.');
      }

      const config = getLayoutConfig(selectedLayout);

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
              v.crossOrigin = 'anonymous';

              const finish = () => resolve(v);
              v.onloadeddata = finish;
              v.oncanplay = finish;
              v.onerror = () => resolve(null);
              setTimeout(() => resolve(v.readyState >= 2 ? v : null), 2200);
              v.load();
          });
      }));

      const overlays = await Promise.all(selectedStripPhotos.map(async (photoData) => {
          if (!photoData || selectedMode !== 'character' || !selectedCharacterData) return null;
          const overlayUrl = getOverlayImage(selectedCharacterData, photoData.originalIndex);
          return loadCanvasImage(overlayUrl);
      }));

      // Frame template harus digambar ulang setelah foto/video dan karakter.
      // Kalau tidak, foto/video akan menindih frame saat Live Moment dirender ke canvas.
      const frameOverlayImage = await loadCanvasImage(selectedTemplate?.overlayUrl);

      const stickersImages = await Promise.all(placedStickers.map(async (stk) => {
          const img = await loadCanvasImage(stk.url);
          return img ? { img, ...stk } : null;
      }));

      const recordCanvas = document.createElement('canvas');
      const videoRenderScale = getVideoRenderScale();

      recordCanvas.width = Math.round(config.W * videoRenderScale);
      recordCanvas.height = Math.round(config.H * videoRenderScale);

      const ctx = recordCanvas.getContext('2d', { alpha: false });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const outputStream = recordCanvas.captureStream(window.innerWidth < 768 ? 20 : 24);

      const selectedMimeType = getSupportedRecorderMimeType();

      if (!selectedMimeType) {
          throw new Error('Browser ini belum mendukung format video untuk Live Moment.');
      }

      const options = { mimeType: selectedMimeType };
      const recorder = new MediaRecorder(outputStream, options);
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

      await Promise.all(videos.map((v) => {
          if (!v) return Promise.resolve();
          return v.play().catch(() => {});
      }));

      let isRecording = true;

      const drawFrame = () => {
          if (!isRecording) return;

          ctx.clearRect(0, 0, recordCanvas.width, recordCanvas.height);
          ctx.save();
          ctx.scale(videoRenderScale, videoRenderScale);
          ctx.filter = 'none';
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

              if (videos[i] && videos[i].readyState >= 2) {
                  if (currentFilter.style !== 'none') ctx.filter = currentFilter.style;
                  ctx.translate(vx + vw, vy);
                  ctx.scale(-1, 1);
                  drawImageCover(ctx, videos[i], 0, 0, vw, vh);
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

                  let pct = 0.6;
                  if (wClass.includes('w-[50%]')) pct = 0.5;
                  if (wClass.includes('w-[85%]')) pct = 0.85;
                  if (wClass.includes('w-[95%]')) pct = 0.95;

                  const ow = vw * pct;
                  const oh = (img.height / img.width) * ow;

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
          requestAnimationFrame(drawFrame);
      };

      return new Promise((resolve, reject) => {
          recorder.onerror = () => {
              isRecording = false;
              reject(new Error('Recorder video mengalami error.'));
          };

          recorder.onstop = () => {
              try {
                  isRecording = false;

                  videos.forEach((v) => {
                      if (v) {
                          v.pause();
                          v.removeAttribute('src');
                          v.load();
                      }
                  });

                  if (!chunks.length) {
                      reject(new Error('Video gagal dibuat. Coba ulangi sekali lagi setelah Live Moment tampil.'));
                      return;
                  }

                  const mimeType = recorder.mimeType || selectedMimeType;
                  const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
                  const blob = new Blob(chunks, { type: mimeType });

                  resolve({ blob, mimeType, ext });
              } catch (err) {
                  reject(err);
              }
          };

          recorder.start(150);
          drawFrame();

          setTimeout(() => {
              if (recorder.state === 'recording') recorder.stop();
          }, 3500);
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

  const handleGenerateQRCode = async () => {
      if (isGeneratingQR) return;

      setIsGeneratingQR(true);
      setQrResultUrl('');

      try {
          showToast('Membuat JPG hasil photobooth...');

          const jpgBlob = await createStaticJpgBlob();

          showToast('Membuat Live Moment video... tunggu sekitar 4 detik.');

          const videoResult = await createLiveVideoBlob();

          showToast('Mengupload JPG ke Cloudinary...');

          const photoUpload = await uploadBlobToCloudinary(
              jpgBlob,
              `Aestho-Strip-${Date.now()}.jpg`
          );

          showToast('Mengupload Live Moment ke Cloudinary...');

          const videoUpload = await uploadBlobToCloudinary(
              videoResult.blob,
              `Aestho-Live-Moment-${Date.now()}.${videoResult.ext}`
          );

          const videoMp4Url = toCloudinaryMp4Url(videoUpload.secure_url);

          showToast('Menyimpan halaman hasil...');

          const resultId = await saveResultToSupabase({
              photoUrl: photoUpload.secure_url,
              videoUrl: videoUpload.secure_url,
              videoMp4Url,
              videoMimeType: videoResult.mimeType
          });

          const finalUrl = `${window.location.origin}/id/summary/${resultId}`;

          setQrResultUrl(finalUrl);
          setShowQRModal(true);

          showToast('QR code berhasil dibuat. Scan untuk membuka hasil.');
      } catch (err) {
          console.error('QR generation failed:', err);
          showToast(err.message || 'Gagal membuat QR code.');
      } finally {
          setIsGeneratingQR(false);
      }
  };

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
                                                className="w-full h-full object-cover transform scale-x-[-1]"
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
                                                crossOrigin="anonymous"
                                                src={getOverlayImage(characterData, photoData.originalIndex)}
                                                className={`absolute bottom-0 ${characterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(characterData, photoData.originalIndex)} h-auto pointer-events-none z-10`}
                                                style={{
                                                    mixBlendMode: 'normal',
                                                    filter: currentFilter.style === 'none' ? 'none' : `${currentFilter.style} brightness(1.1)`
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
                            crossOrigin="anonymous"
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
                                crossOrigin="anonymous"
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

        {/* HEADER LOGO */}
        {currentView !== 'home' && currentView !== 'camera-session' && (
          <div className="fixed top-0 left-0 w-full p-4 md:p-6 z-[60] pointer-events-none flex items-center justify-between">
             <img crossOrigin="anonymous" src="https://lh3.googleusercontent.com/d/1FujM1yqU72AGrQbx-tShQBGSd8WQeXFW" alt="Logo" className="h-8 md:h-12 w-auto object-contain pointer-events-auto dark:invert" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        )}

        {/* GLOBAL BRANDING / WATERMARK */}
        <div className="hidden md:block fixed bottom-6 left-6 z-[60] opacity-40 hover:opacity-100 transition-all duration-300 group cursor-default">
           <img src="https://lh3.googleusercontent.com/d/1FujM1yqU72AGrQbx-tShQBGSd8WQeXFW" alt="Dzev Logo" className="w-12 h-auto md:w-16 drop-shadow-sm grayscale group-hover:grayscale-0 transition-all dark:invert" />
        </div>

        {/* --- VIEW 1: HOME --- */}
        {currentView === 'home' && (
          <main className="relative z-30 flex flex-col items-center justify-center min-h-[100dvh] md:h-full text-center px-4 py-10">
             
             {/* TOGGLE DARK MODE */}
             <div className="absolute top-6 right-6 md:top-8 md:right-8 z-[70]">
                <button
                  onClick={toggleDarkMode}
                  className="p-3 md:p-4 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-all backdrop-blur-md border border-black/10 dark:border-white/10 flex items-center justify-center group shadow-sm"
                  title="Toggle Theme"
                >
                  {isDarkMode ? <Sun size={20} className="group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-500" />}
                </button>
             </div>

             <div className="relative mb-4 cursor-default select-none">
                 <h1 className="font-title text-5xl md:text-[8rem] leading-none text-black dark:text-white z-10 relative">Aestho</h1>
                 <h1 className="font-title text-5xl md:text-[8rem] leading-none text-black/5 dark:text-white/5 absolute top-2 left-2 blur-sm">Aestho</h1>
             </div>
             <p className="font-serif text-sm md:text-xl text-black/70 dark:text-white/70 mb-12 italic tracking-wider">"Collecting moments, frame by frame."</p>
             <button onClick={handleStart} className="group flex flex-col items-center gap-1 px-6 py-2 uppercase font-modern text-xs md:text-sm tracking-[0.3em] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
               <span>Enter Studio</span>
               <div className="relative w-full h-[1px] mt-1">
                   <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-zinc-800"></div>
                   <div className="absolute top-0 left-0 h-full bg-black dark:bg-white w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
               </div>
             </button>
          </main>
        )}

        {/* --- VIEW 2: LAYOUT SELECTION --- */}
        {currentView === 'layout' && (
          <main className="relative z-30 flex flex-col items-center justify-start md:justify-center min-h-[100dvh] md:h-full w-full px-5 md:px-6 pt-24 pb-10 md:py-0 overflow-y-auto md:overflow-visible">
              <h2 className="font-serif text-3xl md:text-4xl italic mb-8 md:mb-12">Choose Canvas</h2>
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
                                     <span className="font-modern text-[8px] tracking-widest uppercase text-center leading-relaxed">Coming<br/>Soon</span>
                                 </div>
                               )}
                          </div>
                          <div className="text-center">
                            <span className={`font-modern text-xs tracking-widest uppercase block border-b border-transparent pb-1 ${!l.disabled ? 'group-hover:border-black dark:group-hover:border-white' : ''}`}>{l.name}</span>
                            <span className="font-serif text-[10px] text-gray-500 dark:text-zinc-400 italic mt-1 block">{l.desc}</span>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="flex gap-8">
                   <button onClick={handleBackToHome} className="font-modern text-[10px] text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white uppercase transition-colors">Back</button>
                   {selectedLayout && <button onClick={handleLayoutConfirm} className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 font-modern text-[10px] uppercase hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors">Next</button>}
              </div>
          </main>
        )}

        {/* --- VIEW 3: MODE SELECTION --- */}
        {currentView === 'mode' && (
          <main className="relative z-30 flex flex-col items-center justify-start md:justify-center min-h-[100dvh] md:h-full w-full px-5 md:px-6 pt-24 pb-10 md:py-0 overflow-y-auto md:overflow-visible">
              <h2 className="font-serif text-3xl md:text-4xl italic mb-8 md:mb-12">Select Style</h2>
              <div className="flex gap-4 md:gap-6 mb-8 md:mb-16 flex-wrap justify-center w-full">
                  {modes.map((m) => (
                        <div key={m.id} onClick={() => setSelectedMode(m.id)} className={`cursor-pointer border rounded-xl p-5 md:p-8 w-full max-w-xs md:w-64 text-center transition-all ${m.style} ${selectedMode === m.id ? 'ring-2 ring-offset-2 ring-gray-300 dark:ring-zinc-600 scale-105' : 'opacity-70 hover:opacity-100'}`}>
                          <div className="mb-4 flex justify-center">{m.icon}</div>
                          <h3 className="font-modern text-sm font-bold uppercase mb-2">{m.name}</h3>
                          <p className="font-serif text-sm italic opacity-80">{m.desc}</p>
                      </div>
                  ))}
              </div>
              <div className="flex gap-8">
                   <button onClick={handleBackToLayout} className="font-modern text-[10px] text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white uppercase transition-colors">Back</button>
                   {selectedMode && <button onClick={handleModeConfirm} className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 font-modern text-[10px] uppercase hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors">Next</button>}
              </div>
          </main>
        )}

        {/* --- VIEW 4: ANIME SELECTION --- */}
        {currentView === 'anime' && (
          <main className="relative z-30 flex flex-col items-center justify-start md:justify-center min-h-[100dvh] md:h-full w-full px-5 md:px-6 pt-24 pb-10 md:py-0 overflow-y-auto md:overflow-visible">
              <h2 className="font-serif text-3xl md:text-4xl italic mb-8 md:mb-12">Pick Partner</h2>
              <div className="w-full flex justify-center items-center relative max-w-4xl px-0 md:px-8 mb-8 md:mb-16">
                   <div ref={animeListRef} className="w-full overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory px-4 flex gap-6 items-center scroll-smooth justify-start md:justify-center">
                      {animeOptions.map((a) => (
                          <div key={a.id} onClick={() => handleAnimeSelect(a.id)} className={`flex-shrink-0 snap-center cursor-pointer border border-gray-200 dark:border-zinc-700 rounded-xl p-5 md:p-6 w-32 h-40 md:w-40 md:h-48 flex flex-col items-center justify-between bg-white dark:bg-zinc-900 transition-all ${a.color} hover:border-black dark:hover:border-zinc-500 shadow-sm group`}>
                               <div className="opacity-50">{a.icon}</div>
                               <img crossOrigin="anonymous" src={a.logoUrl} alt={a.name} className="max-w-[80%] max-h-16 object-contain grayscale hover:grayscale-0 transition-all"/>
                               <span className={`font-modern text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 group-hover:text-black dark:group-hover:text-white`}>{a.name}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <button onClick={handleBackToModeFromAnime} className="font-modern text-[10px] text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white uppercase transition-colors">Back</button>
          </main>
        )}

        {/* --- VIEW 5: FRAME SELECTION --- */}
        {currentView === 'frame' && currentAnimeData && (
          <main className="relative z-30 flex flex-col items-center justify-start md:justify-center min-h-[100dvh] md:h-full w-full pt-24 md:pt-0 pb-32 md:pb-0 overflow-y-auto md:overflow-visible">
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
                                                {getOverlayImage(char, i * 2) && ( <img crossOrigin="anonymous" src={getOverlayImage(char, i * 2)} alt={char.name} className={`absolute bottom-0 ${char.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(char, i * 2)} h-auto object-contain z-10 mix-blend-darken`} style={{ pointerEvents: 'none' }} /> )}
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
              <div className="fixed bottom-0 left-0 w-full flex flex-col md:flex-row justify-center gap-3 md:gap-8 items-center bg-gradient-to-t from-white via-white dark:from-[#0a0a0a] dark:via-[#0a0a0a] to-transparent pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-8 px-4">
                   <button onClick={handleBackToAnimeFromFrame} className="font-modern text-[10px] text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white uppercase flex items-center gap-2 order-2 md:order-1 transition-colors"><ArrowLeft size={12}/> Select Series</button>
                  {selectedFrame && ( <button onClick={handleFrameConfirm} className="bg-black text-white dark:bg-white dark:text-black px-10 py-3 font-modern text-xs tracking-[0.2em] uppercase hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all flex items-center gap-3 order-1 md:order-2 w-full md:w-auto justify-center border border-black dark:border-white hover:invert dark:hover:invert-0">Start Session</button> )}
              </div>
          </main>
        )}

        {/* --- VIEW 6: CAMERA SESSION --- */}
        {currentView === 'camera-session' && (
          <main className="relative z-30 flex flex-col min-h-[100dvh] md:h-full w-full bg-zinc-50 dark:bg-[#0a0a0a] overflow-y-auto md:overflow-hidden justify-start md:justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-100 via-zinc-50 to-white dark:hidden pointer-events-none"></div>
              <div className="w-full p-4 md:p-6 z-20 flex justify-between items-center text-zinc-400 dark:text-zinc-500">
                  <div className="flex gap-4 items-center">
                      <button onClick={handleBackFromCamera} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"><ArrowLeft size={20} /></button>
                      <span className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tighter">Aestho.</span>
                      <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 hidden md:block"></div>
                      <span className="font-modern text-[10px] uppercase tracking-[0.3em] hidden md:block">{currentLayoutData?.name}</span>
                  </div>
                  <button onClick={() => window.location.reload()} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors opacity-50 hover:opacity-100"><RefreshCw size={16}/></button>
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
                                  {!cameraError ? ( <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-0" style={{ filter: currentFilter.style }} /> ) : (
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
                                  <img crossOrigin="anonymous" src={getCameraOverlay(selectedCharacterData, capturedPhotos.length)} alt="Frame Overlay" 
                                      className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, capturedPhotos.length)} ${selectedCharacterData.cameraStyles?.[Math.floor(capturedPhotos.length/2)] || ''} h-auto object-contain object-bottom-left`}
                                      style={{ mixBlendMode: 'normal', filter: currentFilter.style === 'none' ? 'none' : `${currentFilter.style} brightness(1.1)` }} />
                              )}
                          </div>
                          )}
                          {isCountingDown && ( <div className="absolute top-8 right-10 z-100 flex flex-col items-center justify-center pointer-events-none"><span className="font-title text-[5rem] md:text-[8rem] leading-none text-zinc-900 dark:text-white drop-shadow-[0_4px_4px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] animate-pulse">{countdownValue}</span></div> )}
                      </div>
                  </div>
                  <div className="flex md:flex-col flex-row w-full max-w-[92vw] md:max-w-none md:w-32 h-16 sm:h-20 md:h-[450px] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 gap-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto hide-scrollbar shadow-inner flex-shrink-0 mt-0 md:mt-8">
                      {capturedPhotos.map((photo, i) => (
                          <div key={i} className="w-16 sm:w-20 md:w-full aspect-[4/3] rounded overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm relative bg-white flex-shrink-0">
                               <div className="absolute top-1 right-1 bg-black/50 text-white text-[8px] px-1 rounded backdrop-blur-sm z-20">#{i+1}</div>
                               <CoverPhoto src={photo} className="w-full h-full z-0 relative" alt={`Captured ${i}`} />
                               {selectedMode === 'character' && getOverlayImage(selectedCharacterData, i) && ( <img crossOrigin="anonymous" src={getOverlayImage(selectedCharacterData, i)} className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, i)} h-auto object-contain pointer-events-none z-10`} style={{ mixBlendMode: 'normal' }} alt="Overlay Mini" /> )}
                          </div>
                      ))}
                      {[...Array(Math.max(0, 8 - capturedPhotos.length))].map((_, i) => ( <div key={`empty-${i}`} className="w-16 sm:w-20 md:w-full aspect-[4/3] rounded border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-300 dark:text-zinc-600 bg-white/50 dark:bg-zinc-800/50 flex-shrink-0"><span className="text-[8px]">{capturedPhotos.length + i + 1}</span></div> ))}
                  </div>
              </div>
              <div className="w-full px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 md:pb-8 md:pt-4 flex justify-center items-center gap-3 sm:gap-6 md:gap-12 z-20">
                   <div className="flex flex-col items-center gap-2 md:gap-3">
                       <div className="flex gap-2 md:gap-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          {filters.map(f => ( <button key={f.id} onClick={() => setCurrentFilter(f)} className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all text-[8px] md:text-[10px] font-bold font-mono border ${currentFilter.id === f.id ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white scale-110 shadow-md' : 'text-zinc-400 dark:text-zinc-500 border-transparent hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800'}`}>{f.name[0]}</button> ))}
                       </div>
                       <span className="font-modern text-[8px] md:text-[10px] tracking-[0.2em] text-zinc-600 dark:text-zinc-400 font-semibold uppercase">Tone</span>
                   </div>
                   <div className="flex flex-col items-center gap-2 md:gap-3">
                       <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                       <button onClick={handleUploadClick} className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all text-zinc-600 dark:text-zinc-400 shadow-sm"><Upload size={16} className="md:w-5 md:h-5"/></button>
                       <span className="font-modern text-[8px] md:text-[10px] tracking-[0.2em] text-zinc-600 dark:text-zinc-400 font-semibold uppercase">Upload</span>
                   </div>
                   <div className="relative group">
                       <button onClick={handleShutterClick} className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white dark:hover:bg-zinc-700 hover:scale-105 active:scale-95 shadow-lg ${capturedPhotos.length >= MAX_PHOTOS ? 'opacity-50 cursor-default' : ''}`}>
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 ${capturedPhotos.length >= MAX_PHOTOS ? 'border-green-500/50' : 'border-zinc-800 dark:border-zinc-200'} flex items-center justify-center`}>
                              {capturedPhotos.length >= MAX_PHOTOS ? <Check className="text-green-500 opacity-80" size={24}/> : <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-zinc-900 dark:bg-white transition-transform duration-300 group-hover:scale-90"></div>}
                          </div>
                       </button>
                   </div>
                   <div className="flex flex-col items-center gap-2 md:gap-3">
                       <button onClick={toggleTimer} className="h-10 md:h-12 px-4 md:px-6 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center gap-2 md:gap-3 hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all font-mono text-xs md:text-sm text-zinc-700 dark:text-zinc-300 font-bold shadow-sm"><Clock size={14} className="opacity-70 md:w-4 md:h-4"/><span>{timerDuration}s</span></button>
                       <span className="font-modern text-[8px] md:text-[10px] tracking-[0.2em] text-zinc-600 dark:text-zinc-400 font-semibold uppercase">Delay</span>
                   </div>
              </div>
          </main>
        )}

        {/* --- VIEW 7: RESULT SELECTION --- */}
        {currentView === 'result-selection' && (
            <main className="relative z-30 flex flex-col min-h-[100dvh] md:h-full w-full overflow-y-auto md:overflow-hidden">
                <div className="w-full p-3 md:p-6 flex justify-between items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 md:relative md:top-auto z-40">
                    <h1 className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100">Select & Arrange</h1>
                    <button onClick={handleToTemplateSelection} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-black text-white dark:bg-white dark:text-black rounded-full text-[10px] md:text-xs font-mono hover:bg-zinc-800 dark:hover:bg-zinc-200 tracking-wider">CHOOSE FRAME <ArrowRight size={12}/></button>
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
                                                  <img crossOrigin="anonymous" src={getOverlayImage(selectedCharacterData, photoData.originalIndex)} className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, photoData.originalIndex)} h-auto pointer-events-none z-10`} style={{ mixBlendMode: 'normal' }} alt="Strip Overlay" />
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
                                                  <img crossOrigin="anonymous" src={getOverlayImage(selectedCharacterData, photoData.originalIndex)} className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, photoData.originalIndex)} h-auto pointer-events-none z-10`} style={{ mixBlendMode: 'normal' }} alt="Strip Overlay" />
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
                                        {selectedMode === 'character' && getOverlayImage(selectedCharacterData, i) && ( <img crossOrigin="anonymous" src={getOverlayImage(selectedCharacterData, i)} className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, i)} h-auto object-contain pointer-events-none`} alt="Grid Overlay" /> )}
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
            <main className="relative z-30 flex flex-col min-h-[100dvh] md:h-full w-full overflow-y-auto md:overflow-hidden">
                <div className="w-full p-3 md:p-6 flex justify-between items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pl-20 md:pl-48 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 md:relative md:top-auto z-40">
                    <h1 className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100">Choose Frame</h1>
                    <button onClick={handleToStickerEditor} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-black text-white dark:bg-white dark:text-black rounded-full text-[10px] md:text-xs font-mono hover:bg-zinc-800 dark:hover:bg-zinc-200 tracking-wider">NEXT <ArrowRight size={12}/></button>
                </div>
                <div className="flex-1 flex flex-col md:flex-row w-full h-auto md:h-full justify-start md:justify-center items-center gap-4 md:gap-10 p-4 overflow-y-auto md:overflow-hidden pb-8">
                    <div className="flex-none flex flex-col items-center justify-center w-full md:w-auto h-auto md:h-full relative order-1 md:order-1">
                        <span className="font-modern text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 md:mb-8">YOUR RESULT</span>
                        <div className="transform scale-100 origin-center">
                          <AesthoStrip template={selectedTemplate} photos={selectedStripPhotos} mode={selectedMode} characterData={selectedCharacterData} scale={isMobile ? (selectedLayout === 'grid-4r' ? 0.18 : 0.18) : (selectedLayout === 'grid-4r' ? 0.25 : 0.25)} layoutConfig={getLayoutConfig(selectedLayout)} />
                        </div>
                    </div>
                    <div className="flex-none flex flex-col items-center justify-center w-full md:w-auto min-h-[320px] h-auto md:h-full relative bg-gray-50/30 dark:bg-[#111] rounded-xl border border-gray-100/50 dark:border-zinc-800 order-2 md:order-2 py-4 md:py-2 overflow-visible">
                        <span className="font-modern text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500 mb-3 md:absolute md:top-10">SELECT FRAME</span>
                        <div className="w-full md:max-w-lg h-[275px] md:h-full overflow-x-auto overflow-y-visible snap-x snap-mandatory flex items-center gap-8 md:gap-10 hide-scrollbar px-10 md:px-20 py-4 md:py-20">
                            {stripTemplates.filter(t => t.layoutId === selectedLayout).map((tpl) => (
                                <div key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`cursor-pointer flex-shrink-0 flex flex-col items-center gap-2 md:gap-4 transition-all duration-500 snap-center ${selectedTemplate.id === tpl.id ? 'opacity-100 z-10 drop-shadow-xl scale-105 md:scale-110' : 'opacity-60 hover:opacity-100 scale-90'}`}>
                                    <div className="pointer-events-none border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white overflow-visible transform scale-75 md:scale-100 origin-center">
                                         <AesthoStrip template={tpl} photos={selectedStripPhotos} mode={selectedMode} characterData={selectedCharacterData} scale={isMobile ? (selectedLayout === 'grid-4r' ? 0.1 : 0.13) : (selectedLayout === 'grid-4r' ? 0.1 : 0.15)} shadow={false} layoutConfig={getLayoutConfig(selectedLayout)} />
                                    </div>
                                    <span className="font-modern text-[8px] uppercase text-center mt-1 tracking-widest text-zinc-500 dark:text-zinc-400 max-w-[90px] leading-relaxed">{tpl.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        )}

        {/* --- VIEW 8.5: STICKER EDITOR --- */}
        {currentView === 'sticker-editor' && (
            <main className="relative z-30 flex flex-col min-h-[100dvh] md:h-full w-full overflow-y-auto md:overflow-hidden" onClick={() => setActiveStickerId(null)}>
                <div className="w-full p-3 md:p-6 flex justify-between items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pl-20 md:pl-48 bg-white dark:bg-[#111] z-40 sticky top-0 md:relative md:top-auto shadow-sm">
                    <h1 className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100">Decorate Strip</h1>
                    <div className="flex gap-2 md:gap-4">
                        <button onClick={handleBackToTemplate} className="text-zinc-500 hover:text-black dark:hover:text-white font-modern text-[10px] uppercase hidden md:block transition-colors">Back</button>
                        <button onClick={handleToFinalResult} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-black text-white dark:bg-white dark:text-black rounded-full text-[10px] md:text-xs font-mono hover:bg-zinc-800 dark:hover:bg-zinc-200 tracking-wider shadow-md hover:shadow-lg transition-all">FINISH <Check size={12}/></button>
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
                               scale={isMobile ? (selectedLayout === 'grid-4r' ? 0.24 : 0.18) : (selectedLayout === 'grid-4r' ? 0.35 : 0.25)} 
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
          <main className="relative z-30 flex flex-col h-[100dvh] md:h-full w-full overflow-hidden">
               <div className="w-full p-3 md:p-6 flex justify-between items-center gap-2 md:gap-3 border-b border-zinc-200 dark:border-zinc-800 pl-16 md:pl-48 bg-white dark:bg-[#111] z-20 shadow-sm shrink-0">
                    <div className="flex gap-4 items-center">
                      <span className="font-title text-2xl md:text-3xl hidden md:block text-zinc-900 dark:text-zinc-100">Aestho.</span>
                      <span className="font-modern text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">FINAL RESULT</span>
                    </div>
                    <div className="flex gap-1.5 md:gap-4 flex-wrap justify-end">
                        <button onClick={handleToStickerEditor} className="text-zinc-500 hover:text-black dark:hover:text-white font-modern text-[10px] hidden md:block mt-2 md:mt-0 mr-2 transition-colors">BACK</button>
                        
                        <button
                            onClick={handleGenerateQRCode}
                            disabled={isGeneratingQR}
                            className="flex items-center gap-1.5 md:gap-2 px-2.5 py-2 md:px-5 md:py-2 bg-white text-black border border-zinc-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 rounded-full text-[9px] md:text-xs font-mono hover:bg-zinc-100 dark:hover:bg-zinc-800 tracking-wider disabled:opacity-50 transition-all shadow-sm"
                        >
                            {isGeneratingQR ? <Loader2 size={12} className="animate-spin" /> : <QrCode size={12} />}
                            QR CODE
                        </button>

                        <button onClick={downloadStaticJPG} disabled={isDownloadingJPG} className="flex items-center gap-1.5 md:gap-2 px-2.5 py-2 md:px-5 md:py-2 bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-[9px] md:text-xs font-mono hover:bg-zinc-800 tracking-wider disabled:opacity-50 transition-all border border-transparent">
                            {isDownloadingJPG ? <Loader2 size={12} className="animate-spin"/> : <Download size={12}/>} JPG
                        </button>
                        <button onClick={downloadLiveVideo} disabled={isDownloadingVideo} className="flex items-center gap-1.5 md:gap-2 px-2.5 py-2 md:px-5 md:py-2 bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-[9px] md:text-xs font-mono hover:bg-zinc-800 tracking-wider disabled:opacity-50 transition-all border border-transparent">
                            {isDownloadingVideo ? <Loader2 size={12} className="animate-spin"/> : <Download size={12}/>} VIDEO
                        </button>
                    </div>
                </div>
                
                {showQRModal && qrResultUrl && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-md">
                        <div className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-[2rem] border border-white/80 dark:border-zinc-800 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200/60 dark:bg-pink-500/20 blur-3xl rounded-full -translate-x-12 -translate-y-12" />
                            <div className="absolute bottom-0 right-0 w-36 h-36 bg-blue-200/70 dark:bg-blue-500/20 blur-3xl rounded-full translate-x-12 translate-y-12" />

                            <button
                                onClick={() => setShowQRModal(false)}
                                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-500 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors"
                            >
                                <X size={16} />
                            </button>

                            <div className="relative z-10 p-6 text-center">
                                <p className="font-modern text-[10px] tracking-[0.3em] text-zinc-400 uppercase mb-2">
                                    Scan Result
                                </p>

                                <h2 className="font-title text-4xl text-black dark:text-white mb-2">
                                    Your QR Code
                                </h2>

                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                                    Scan this code to open your Aestho result page with JPG and Live Moment.
                                </p>

                                <div className="bg-white rounded-[1.5rem] p-4 border border-zinc-100 shadow-inner flex items-center justify-center">
                                    <QRCodeSVG
                                        value={qrResultUrl}
                                        size={210}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                        level="M"
                                    />
                                </div>


                                <div className="mt-5 grid grid-cols-1 gap-3">
                                    <a
                                        href={qrResultUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full px-5 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] tracking-widest hover:opacity-80 transition-opacity"
                                    >
                                        OPEN RESULT PAGE
                                    </a>

                                    <button
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(qrResultUrl);
                                                showToast('Link QR berhasil disalin.');
                                            } catch {
                                                showToast('Gagal menyalin link QR.');
                                            }
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <Copy size={12} />
                                        COPY LINK
                                    </button>
                                </div>

                                <p className="mt-4 text-[9px] text-zinc-400 font-mono break-all leading-relaxed">
                                    {qrResultUrl}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

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

                <div className="flex-1 min-h-0 flex flex-col md:flex-row w-full justify-start md:justify-center items-center gap-8 md:gap-16 px-4 pt-5 md:p-8 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-[#050505] pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-8 relative z-0">
                    <div className="w-full md:w-auto flex flex-col items-center gap-3 md:gap-4 shrink-0 overflow-visible">
                        <span className="font-modern text-[10px] tracking-[0.2em] text-zinc-400 dark:text-zinc-500">STATIC RESULT</span>
                        <div className="transform scale-100 origin-top">
                          <AesthoStrip template={selectedTemplate} photos={selectedStripPhotos} mode={selectedMode} characterData={selectedCharacterData} scale={isMobile ? (selectedLayout === 'grid-4r' ? 0.20 : 0.18) : (selectedLayout === 'grid-4r' ? 0.30 : 0.30)} layoutConfig={getLayoutConfig(selectedLayout)} />
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex flex-col items-center gap-3 md:gap-4 shrink-0 overflow-visible">
                        <span className="font-modern text-[10px] tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2">LIVE MOMENT <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div></span>
                        <div className="transform scale-100 origin-top">
                          <AesthoStrip template={selectedTemplate} photos={selectedStripPhotos} clips={capturedClips} mode={selectedMode} characterData={selectedCharacterData} scale={isMobile ? (selectedLayout === 'grid-4r' ? 0.20 : 0.18) : (selectedLayout === 'grid-4r' ? 0.30 : 0.30)} layoutConfig={getLayoutConfig(selectedLayout)} />
                        </div>
                    </div>

                </div>

                {/* === CREDIT FINAL RESULT === */}
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:bottom-8 md:right-8 md:left-auto md:translate-x-0 z-50 pointer-events-none px-3 w-full md:w-auto flex justify-center md:justify-end">
                    <div className="pointer-events-auto max-w-[calc(100vw-1.5rem)] rounded-[1.75rem] md:rounded-full bg-white/75 dark:bg-zinc-950/70 backdrop-blur-2xl border border-white/70 dark:border-zinc-800/80 shadow-[0_18px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45)] p-1.5 flex flex-wrap items-center justify-center gap-1">
                        <a 
                            href="https://www.instagram.com/dzev.c/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                        >
                            <Instagram size={13} className="text-zinc-400 group-hover:text-pink-400 transition-colors" />
                            <span className="font-modern text-[8.5px] md:text-[9.5px] tracking-[0.18em] uppercase font-bold whitespace-nowrap">
                                <span className="text-zinc-400 dark:text-zinc-500 group-hover:text-white/70 dark:group-hover:text-black/60">Dev</span> @dzev.c
                            </span>
                        </a>

                        <span className="hidden sm:block w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

                        {showSelectedShinhlinCredit && (
                            <a
                                href={SHINHLIN_INSTAGRAM_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                            >
                                <Instagram size={13} className="text-zinc-400 group-hover:text-pink-400 transition-colors" />
                                <span className="font-modern text-[8.5px] md:text-[9.5px] tracking-[0.18em] uppercase font-bold whitespace-nowrap">
                                    <span className="text-zinc-400 dark:text-zinc-500 group-hover:text-white/70 dark:group-hover:text-black/60">Artist</span> @shinhlin
                                </span>
                            </a>
                        )}

                        <span className="hidden sm:block w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

                        <a
                            href={TRAKTEER_SUPPORT_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2 rounded-full px-3.5 py-2 bg-zinc-950 text-white dark:bg-white dark:text-black hover:opacity-90 transition-all duration-300 shadow-sm"
                        >
                            <Heart size={13} className="fill-current" />
                            <span className="font-modern text-[8.5px] md:text-[9.5px] tracking-[0.18em] uppercase font-bold whitespace-nowrap">Support Aestho</span>
                        </a>
                    </div>
                </div>
          </main>
        )}

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
