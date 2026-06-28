import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, Plus, Star, Users, Camera, RefreshCw, Sliders, Clock, Download, Check, Loader2, Play, VideoOff, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Printer, LayoutTemplate, Sparkles, Image as ImageIcon, Palette, Flame, Swords, Heart, Cloud, Moon, Zap, Music, Ghost, Sun, Share, Upload, Trash2, Film, ImagePlus, Copy, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

const App = () => {
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
      cssContainer: 'w-16 h-[240px] md:w-24 md:h-[320px] flex-col p-2 gap-2 bg-white shadow-xl flex',
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
      cssContainer: 'w-[120px] h-[180px] md:w-[160px] md:h-[240px] pt-2.5 px-2.5 pb-6 bg-white shadow-xl grid grid-cols-2 gap-x-1 gap-y-1.5 content-start',
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
      cssContainer: 'w-16 h-[240px] md:w-24 md:h-[320px] flex items-center justify-center bg-zinc-50 border border-dashed border-zinc-300 shadow-sm',
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
      style: 'bg-white text-black border-gray-200' 
    },
    { 
      id: 'character', 
      name: 'Character Collab', 
      desc: 'Pose with idols & anime chars.', 
      icon: <Users className="w-6 h-6 md:w-8 md:h-8"/>, 
      style: 'bg-black text-white border-black hover:shadow-xl' 
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
                'https://lh3.googleusercontent.com/d/1V8zQmWfsT_E-2Mc9saw8ATKbnLfBgl3j',
                'https://lh3.googleusercontent.com/d/1fNeMCvMdZTUlyGqScPPJWi6aSfDb4lC8',
                'https://lh3.googleusercontent.com/d/1VhsEemnLSyNcdjUW2AFyjCCCijiXtw_U',
                'https://lh3.googleusercontent.com/d/1B53UXD3yWMsouHTSwUpn4vP_T8oRyvvU'
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
                'https://lh3.googleusercontent.com/d/1zyYfTf7ERipNpki16jizFPBaeI_jsyl0',
                'https://lh3.googleusercontent.com/d/13Tsrw59z0BsRGWB6ByYvCl9lDu1w0lIu',
                'https://lh3.googleusercontent.com/d/1vrkdlhBgfkWJ1WW3o4TnuLF495aYuXbo',
                'https://lh3.googleusercontent.com/d/1Adb38lJxh3uoRxjG8Iihe8ZoNOP9R4ah'
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
                  'https://lh3.googleusercontent.com/d/18Bgd9-lYxFhNRfzIdAFBUYyN9jjUtMA7',
                  'https://lh3.googleusercontent.com/d/1GAgjZkKAR7pgcGKDwBL3RMhfTR1y2B7b',
                  'https://lh3.googleusercontent.com/d/1lWGdmQCXzuCIh_eX_95uSx_cJP9_36TE',
                  'https://lh3.googleusercontent.com/d/1jt-yV5I8m1O7-GmTXw3qVm3SoyRS0s6K'
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
                'https://lh3.googleusercontent.com/d/1T0uTImpAy1oXrSYUO4GeBWwpH1vPsvxG',
                'https://lh3.googleusercontent.com/d/1OlRAMD2fe3s7bN7y4EfwpD_53CiTVpF1',
                'https://lh3.googleusercontent.com/d/1-Sc-sYQSJOfcLGArfz_OSciLVGsbJeC-',
                'https://lh3.googleusercontent.com/d/1EwtUpa1ZVQsJYYaIJ9oZ15c4C5AEuk3T'
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
                  'https://lh3.googleusercontent.com/d/1l40KbK72A885O9VwcmTemvECZ64lvdjI',
                  'https://lh3.googleusercontent.com/d/19SpklAEzrhGX8ZnQQAM1qAgY2idg4Srb',
                  'https://lh3.googleusercontent.com/d/1jxCPN3l30zd5_jwL0zOGggPmM6DvpUnx',
                  'https://lh3.googleusercontent.com/d/1BDfcJwO1QG-czUuv48_h0qff-rHRaLd4'
              ],
              theme: 'bg-blue-50',
              styles: { 0: 'w-[50%]', 1: 'w-[50%]', 2: 'w-[50%]', 3: 'w-[50%]' }
          },
          { 
              id: 'nobara', 
              name: 'Nobara Kugisaki', 
              overlayImg: [
                  'https://lh3.googleusercontent.com/d/1PxL5ajHWYhdrjqLFW9_-olau5PqnKCuX',
                  'https://lh3.googleusercontent.com/d/1ISfVxep7RWK2Sq1oSnwktjq80O1t99z8',
                  'https://lh3.googleusercontent.com/d/1fZTm5aDwVrdqaZBtN3WvQkwq_O-Zg6Et',
                  'https://lh3.googleusercontent.com/d/1l9iruV19bncgBUX4tSivk07fnoENyKpO'
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

  // Notification & Share State
  const [toastMessage, setToastMessage] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSharingProcess, setIsSharingProcess] = useState(false);

  const MAX_PHOTOS = 8;
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
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

  const takePhoto = () => {
    setIsCountingDown(false);
    stopRecording();
    if (useMockCamera) {
        const mockUrl = `https://placehold.co/640x480/333/FFF.png?text=Photo+${capturedPhotos.length + 1}`;
        handlePhotoCaptured(mockUrl);
        return;
    } 
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imgUrl = canvas.toDataURL('image/png');
        handlePhotoCaptured(imgUrl);
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

  const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      const remaining = MAX_PHOTOS - capturedPhotos.length;
      if (remaining <= 0) return;
      const filesToProcess = files.slice(0, remaining);
      Promise.all(filesToProcess.map(file => {
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (event) => resolve(event.target.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
          });
      })).then(images => {
          const updatedPhotos = [...capturedPhotos, ...images];
          setCapturedPhotos(updatedPhotos);
          setCapturedClips(prev => [...prev, ...new Array(images.length).fill(null)]);
          if (updatedPhotos.length >= MAX_PHOTOS) {
               setTimeout(() => triggerTransition(() => setCurrentView('result-selection')), 500);
          }
      });
      e.target.value = '';
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
  const downloadStaticJPG = async () => {
      if (!window.html2canvas || !staticStripRef.current) {
          showToast("Sistem sedang memuat pemroses gambar. Silakan tunggu sebentar.");
          return;
      }
      setIsDownloadingJPG(true);
      try {
          const canvas = await window.html2canvas(staticStripRef.current, {
              useCORS: true,
              allowTaint: true,
              scale: 2, 
              backgroundColor: null,
          });
          const link = document.createElement('a');
          link.download = 'Aestho-Strip.jpg';
          link.href = canvas.toDataURL('image/jpeg', 0.9);
          link.click();
      } catch (err) {
          console.error("Failed to generate JPG", err);
          showToast("Gagal memproses gambar. Pastikan koneksi internet Anda stabil.");
      } finally {
          setIsDownloadingJPG(false);
      }
  };

  // --- SHARE LOGIC ---
  const handleShareToPlatform = async (platformName) => {
      if (!window.html2canvas || !staticStripRef.current) {
          showToast("Sistem sedang menyiapkan gambar, silakan tunggu...");
          return;
      }
      
      setIsSharingProcess(true);
      
      try {
          // Render the high-res canvas first
          const canvas = await window.html2canvas(staticStripRef.current, {
              useCORS: true,
              allowTaint: true,
              scale: 2, 
              backgroundColor: null,
          });

          // Convert to blob for sharing
          canvas.toBlob(async (blob) => {
              if (!blob) {
                  showToast("Gagal merender gambar.");
                  setIsSharingProcess(false);
                  return;
              }

              const file = new File([blob], 'Aestho-Masterpiece.jpg', { type: 'image/jpeg' });
              
              const shareData = {
                  files: [file],
                  title: 'My Aestho Photostrip',
                  text: `Check out my awesome photostrip created with Aestho! 📸✨ #AesthoApp #${platformName}`
              };

              // Check if browser supports Web Share API with files
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  try {
                      await navigator.share(shareData);
                      showToast(`Berhasil membuka menu share untuk ${platformName}!`);
                      setShowShareModal(false);
                  } catch (err) {
                      // AbortError is typical when user cancels the native share dialog
                      if (err.name !== 'AbortError') {
                          console.error("Share failed:", err);
                          showToast(`Gagal membagikan langsung. Silakan unduh gambar untuk dibagikan ke ${platformName}.`);
                      }
                  }
              } else {
                  // Fallback for browsers that don't support file sharing
                  showToast(`Browser ini tidak mendukung share langsung. Unduh gambar dan bagikan manual ke ${platformName}.`);
                  setShowShareModal(false);
              }
              setIsSharingProcess(false);
          }, 'image/jpeg', 0.9);

      } catch (err) {
          console.error("Failed to prepare share", err);
          showToast("Terjadi kesalahan saat memproses gambar.");
          setIsSharingProcess(false);
      }
  };

  const downloadLiveVideo = async () => {
      if (!window.html2canvas || !baseStripRef.current) {
          showToast("Sistem belum siap, mohon tunggu sebentar.");
          return;
      }
      setIsDownloadingVideo(true);
      const config = getLayoutConfig(selectedLayout);
      
      try {
          const baseCanvas = await window.html2canvas(baseStripRef.current, { 
              scale: 1, 
              useCORS: true, 
              backgroundColor: null 
          });

          const videos = await Promise.all(selectedStripPhotos.map(async (photoData) => {
              if(!photoData || !capturedClips[photoData.originalIndex]) return null;
              return new Promise((resolve) => {
                  const v = document.createElement('video');
                  v.src = capturedClips[photoData.originalIndex];
                  v.muted = true;
                  v.loop = true;
                  v.crossOrigin = "anonymous";
                  v.oncanplay = () => resolve(v);
                  setTimeout(() => resolve(v), 1500); 
              });
          }));

          const overlays = await Promise.all(selectedStripPhotos.map(async (photoData) => {
              if(!photoData || selectedMode !== 'character' || !selectedCharacterData) return null;
              
              const overlayUrl = getOverlayImage(selectedCharacterData, photoData.originalIndex);
              if(!overlayUrl) return null;

              return new Promise((resolve) => {
                  const img = new Image();
                  img.crossOrigin = "anonymous";
                  img.onload = () => resolve(img);
                  img.onerror = () => { resolve(null); };
                  img.src = overlayUrl;
              });
          }));

          const stickersImages = await Promise.all(placedStickers.map(async (stk) => {
              return new Promise((resolve) => {
                  const img = new Image();
                  img.crossOrigin = "anonymous";
                  img.onload = () => resolve({ img, ...stk });
                  img.onerror = () => resolve(null);
                  img.src = stk.url;
              });
          }));

          const recordCanvas = document.createElement('canvas');
          recordCanvas.width = config.W;
          recordCanvas.height = config.H;
          const ctx = recordCanvas.getContext('2d');
          
          const stream = recordCanvas.captureStream(30); 
          let options = { mimeType: 'video/webm' };
          if (MediaRecorder.isTypeSupported('video/mp4')) {
              options = { mimeType: 'video/mp4' };
          }
          const recorder = new MediaRecorder(stream, options); 
          const chunks = [];
          recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

          let r = 0;
          const rClass = selectedTemplate.photoRadius || '';
          if(rClass.includes('rounded-sm')) r = 2;
          else if(rClass.includes('rounded-md')) r = 6;
          else if(rClass.includes('rounded-lg')) r = 8;
          else if(rClass.includes('rounded-xl')) r = 12;
          else if(rClass.includes('rounded-2xl')) r = 16;
          else if(rClass.includes('rounded-3xl')) r = 24;
          else if(rClass.includes('rounded-[3rem]')) r = 48;
          else if(rClass.includes('rounded-[40px]')) r = 40;

          videos.forEach(v => { if(v) v.play().catch(console.warn); });

          let isRecording = true;
          const drawFrame = () => {
              if(!isRecording) return;
              
              ctx.clearRect(0, 0, recordCanvas.width, recordCanvas.height);
              ctx.drawImage(baseCanvas, 0, 0, config.W, config.H);
              
              for(let i=0; i<config.slots.length; i++){
                  const photoData = selectedStripPhotos[i];
                  if(!photoData) continue;
                  
                  const slot = config.slots[i];
                  if(!slot) continue;

                  const vx = slot.x;
                  const vy = slot.y;
                  const vw = slot.w;
                  const vh = slot.h;

                  if(videos[i]) {
                      ctx.save();
                      
                      ctx.beginPath();
                      ctx.moveTo(vx + r, vy);
                      ctx.lineTo(vx + vw - r, vy);
                      ctx.quadraticCurveTo(vx + vw, vy, vx + vw, vy + r);
                      ctx.lineTo(vx + vw, vy + vh - r);
                      ctx.quadraticCurveTo(vx + vw, vy + vh, vx + vw - r, vy + vh);
                      ctx.lineTo(vx + r, vy + vh);
                      ctx.quadraticCurveTo(vx, vy + vh, vx, vy + vh - r);
                      ctx.lineTo(vx, vy + r);
                      ctx.quadraticCurveTo(vx, vy, vx + r, vy);
                      ctx.closePath();
                      ctx.clip();
                      
                      if(currentFilter.style !== 'none') {
                          ctx.filter = currentFilter.style;
                      }

                      ctx.translate(vx + vw, vy);
                      ctx.scale(-1, 1);
                      ctx.drawImage(videos[i], 0, 0, vw, vh);
                      ctx.restore();
                  }
                  
                  if(overlays[i]) {
                      ctx.save();
                      if(currentFilter.style !== 'none') {
                          ctx.filter = `${currentFilter.style} brightness(1.1)`;
                      }

                      const img = overlays[i];
                      const wClass = getOverlayWidth(selectedCharacterData, photoData.originalIndex);
                      let pct = 0.6;
                      if(wClass.includes('w-[50%]')) pct = 0.5;
                      if(wClass.includes('w-[85%]')) pct = 0.85;
                      
                      const ow = vw * pct;
                      const oh = (img.height / img.width) * ow;
                      
                      let ox = selectedCharacterData.position === 'right' ? vx + vw - ow : vx;
                      if(selectedCharacterData.cameraStyles && selectedCharacterData.cameraStyles[Math.floor(photoData.originalIndex/2)]) {
                         if(wClass.includes('w-[85%]')) ox += (ow * 0.15); 
                      }
                      const oy = vy + vh - oh;
                      
                      ctx.drawImage(img, ox, oy, ow, oh);
                      ctx.restore();
                  }
              }
              
              // Gambar Stickers diatas semuanya
              stickersImages.forEach(stk => {
                  if (stk && stk.img) {
                      ctx.save();
                      // Pindahkan context ke titik tengah stiker untuk di scale & rotasi dengan akurat
                      const cx = stk.x + stk.w / 2;
                      const cy = stk.y + stk.h / 2;
                      ctx.translate(cx, cy);
                      ctx.rotate((stk.rotation || 0) * Math.PI / 180);
                      ctx.scale(stk.scale || 1, stk.scale || 1);
                      // Gambar di titik pusat
                      ctx.drawImage(stk.img, -stk.w / 2, -stk.h / 2, stk.w, stk.h);
                      ctx.restore();
                  }
              });
              
              requestAnimationFrame(drawFrame);
          };

          // 7. Pengaturan Stop Record -> Download
          recorder.onstop = () => {
              isRecording = false;
              // Berhentikan semua video background memory
              videos.forEach(v => { if(v) { v.pause(); v.src = ""; }});
              
              const ext = options.mimeType === 'video/mp4' ? 'mp4' : 'webm';
              const blob = new Blob(chunks, { type: options.mimeType });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Aestho-Live-Strip.${ext}`; 
              a.click();
              
              setIsDownloadingVideo(false);
          };

          recorder.start();
          drawFrame(); 
          
          setTimeout(() => {
              if (recorder.state === 'recording') {
                 recorder.stop();
              }
          }, 3500);

      } catch (err) {
          console.error("Failed to generate Video", err);
          showToast("Gagal memproses Video. Pastikan resource dimuat dengan benar.");
          setIsDownloadingVideo(false);
      }
  };

  const AesthoStrip = ({ template, photos, clips, mode, characterData, scale = 1, shadow = true, stripRef, layoutConfig, isEditable = false, showPlacedStickers = true }) => {
    const config = layoutConfig || getLayoutConfig('classic-white');
    const wrapperStyle = { width: `${config.W * scale}px`, height: `${config.H * scale}px`, position: 'relative', flexShrink: 0 };
    const stripTransformStyle = { width: `${config.W}px`, height: `${config.H}px`, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 };
    const stripContentStyle = { width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: template.bgColor, ...template.styleContainer };

    return (
        <div style={wrapperStyle}>
            <div ref={stripRef} className={`${shadow ? 'shadow-2xl' : ''} bg-white transition-all duration-300`} style={stripTransformStyle}>
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
                                            <video crossOrigin="anonymous" src={clips[photoData.originalIndex]} autoPlay loop muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                        ) : ( <img crossOrigin="anonymous" src={photoData.url} className="w-full h-full object-cover" alt={`Shot ${index}`}/> )}
                                        {mode === 'character' && getOverlayImage(characterData, photoData.originalIndex) && (
                                            <img crossOrigin="anonymous" src={getOverlayImage(characterData, photoData.originalIndex)} className={`absolute bottom-0 ${characterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(characterData, photoData.originalIndex)} h-auto pointer-events-none z-10`} style={{ mixBlendMode: 'normal' }} alt="Overlay" />
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
                        <div
                            className="absolute inset-0 z-30 pointer-events-none"
                            style={{
                                backgroundImage: `url(${template.overlayUrl})`,
                                backgroundSize: '100% 100%',
                                backgroundRepeat: 'no-repeat'
                            }}
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
    <div className="relative w-full h-screen bg-[#FDFDFD] overflow-hidden font-sans selection:bg-black selection:text-white"
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
           <img crossOrigin="anonymous" src="https://lh3.googleusercontent.com/d/1FujM1yqU72AGrQbx-tShQBGSd8WQeXFW" alt="Logo" className="h-8 md:h-12 w-auto object-contain pointer-events-auto" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}

      {/* GLOBAL BRANDING / WATERMARK */}
      <div className="fixed bottom-6 left-6 z-[60] opacity-40 hover:opacity-100 transition-all duration-300 group cursor-default">
         <img src="https://lh3.googleusercontent.com/d/1FujM1yqU72AGrQbx-tShQBGSd8WQeXFW" alt="Dzev Logo" className="w-12 h-auto md:w-16 drop-shadow-sm grayscale group-hover:grayscale-0 transition-all" />
      </div>

      {/* --- VIEW 1: HOME --- */}
      {currentView === 'home' && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full text-center p-4 bg-[#FDFDFD] text-black">
           <div className="relative mb-4 cursor-default select-none">
               <h1 className="font-title text-5xl md:text-[8rem] leading-none text-black z-10 relative">Aestho</h1>
               <h1 className="font-title text-5xl md:text-[8rem] leading-none text-black/5 absolute top-2 left-2 blur-sm">Aestho</h1>
           </div>
           <p className="font-serif text-sm md:text-xl text-black/70 mb-12 italic tracking-wider">"Collecting moments, frame by frame."</p>
           <button onClick={handleStart} className="group flex flex-col items-center gap-1 px-6 py-2 uppercase font-modern text-xs md:text-sm tracking-[0.3em] text-black/60 hover:text-black transition-colors cursor-pointer">
             <span>Enter Studio</span>
             <div className="relative w-full h-[1px] mt-1">
                 <div className="absolute inset-0 w-full h-full bg-gray-200"></div>
                 <div className="absolute top-0 left-0 h-full bg-black w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
             </div>
           </button>
        </main>
      )}

      {/* --- VIEW 2: LAYOUT SELECTION --- */}
      {currentView === 'layout' && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full w-full px-6 bg-[#FDFDFD] text-black">
            <h2 className="font-serif text-3xl md:text-4xl italic text-black mb-12">Choose Canvas</h2>
            <div className="flex gap-12 items-center justify-center mb-16 flex-wrap">
                {layouts.map((l) => (
                    <div key={l.id} onClick={() => !l.disabled && setSelectedLayout(l.id)} className={`flex flex-col items-center justify-center gap-6 transition-all duration-300 ${l.disabled ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer group opacity-60 hover:opacity-100'} ${selectedLayout === l.id ? '!opacity-100 scale-105' : ''}`}>
                        <div className={`${l.cssContainer} transition-transform ${!l.disabled ? 'group-hover:-translate-y-2' : ''} border border-gray-200`}>
                             {!l.disabled ? (
                               <>
                                 {[...Array(l.type === 'grid' ? 6 : 4)].map((_,i) => (
                                   <div key={i} className={`${l.cssPhoto} bg-gray-200 overflow-hidden relative grayscale opacity-80`}><div className="w-full h-full bg-gradient-to-tr from-gray-300 to-gray-200"></div></div>
                                 ))}
                                 {l.type === 'vertical' && <div className={`w-full h-auto pt-2 flex justify-center items-end opacity-50 ${l.textColor}`}><span className="font-title text-[10px]">Aestho.</span></div>}
                               </>
                             ) : (
                               <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400">
                                   <span className="font-serif text-4xl md:text-6xl italic">?</span>
                                   <span className="font-modern text-[8px] tracking-widest uppercase text-center leading-relaxed">Coming<br/>Soon</span>
                               </div>
                             )}
                        </div>
                        <div className="text-center">
                          <span className={`font-modern text-xs tracking-widest uppercase block border-b border-transparent pb-1 ${!l.disabled ? 'group-hover:border-black' : ''}`}>{l.name}</span>
                          <span className="font-serif text-[10px] text-gray-500 italic mt-1 block">{l.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-8">
                 <button onClick={handleBackToHome} className="font-modern text-[10px] text-gray-400 hover:text-black uppercase">Back</button>
                 {selectedLayout && <button onClick={handleLayoutConfirm} className="bg-black text-white px-6 py-2 font-modern text-[10px] uppercase hover:bg-gray-800 transition-colors">Next</button>}
            </div>
        </main>
      )}

      {/* --- VIEW 3: MODE SELECTION --- */}
      {currentView === 'mode' && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full w-full px-6 bg-[#FDFDFD] text-black">
            <h2 className="font-serif text-3xl md:text-4xl italic text-black mb-12">Select Style</h2>
            <div className="flex gap-6 mb-16 flex-wrap justify-center">
                {modes.map((m) => (
                      <div key={m.id} onClick={() => setSelectedMode(m.id)} className={`cursor-pointer border rounded-xl p-6 md:p-8 w-64 text-center transition-all ${m.style} ${selectedMode === m.id ? 'ring-2 ring-offset-2 ring-gray-300 scale-105' : 'opacity-70 hover:opacity-100'}`}>
                        <div className="mb-4 flex justify-center">{m.icon}</div>
                        <h3 className="font-modern text-sm font-bold uppercase mb-2">{m.name}</h3>
                        <p className="font-serif text-sm italic opacity-80">{m.desc}</p>
                    </div>
                ))}
            </div>
            <div className="flex gap-8">
                 <button onClick={handleBackToLayout} className="font-modern text-[10px] text-gray-400 hover:text-black uppercase">Back</button>
                 {selectedMode && <button onClick={handleModeConfirm} className="bg-black text-white px-6 py-2 font-modern text-[10px] uppercase hover:bg-gray-800 transition-colors">Next</button>}
            </div>
        </main>
      )}

      {/* --- VIEW 4: ANIME SELECTION --- */}
      {currentView === 'anime' && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full w-full px-6 bg-[#FDFDFD] text-black">
            <h2 className="font-serif text-3xl md:text-4xl italic text-black mb-12">Pick Partner</h2>
            <div className="w-full flex justify-center items-center relative max-w-4xl px-4 md:px-8 mb-16">
                 <div ref={animeListRef} className="w-full overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory px-4 flex gap-6 items-center scroll-smooth justify-start md:justify-center">
                    {animeOptions.map((a) => (
                        <div key={a.id} onClick={() => handleAnimeSelect(a.id)} className={`flex-shrink-0 snap-center cursor-pointer border border-gray-200 rounded-xl p-6 w-36 h-44 md:w-40 md:h-48 flex flex-col items-center justify-between bg-white transition-all ${a.color} hover:border-black shadow-sm group`}>
                             <div className="opacity-50">{a.icon}</div>
                             <img crossOrigin="anonymous" src={a.logoUrl} alt={a.name} className="max-w-[80%] max-h-16 object-contain grayscale hover:grayscale-0 transition-all"/>
                             <span className={`font-modern text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 group-hover:text-black`}>{a.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={handleBackToModeFromAnime} className="font-modern text-[10px] text-gray-400 hover:text-black uppercase">Back</button>
        </main>
      )}

      {/* --- VIEW 5: FRAME SELECTION --- */}
      {currentView === 'frame' && currentAnimeData && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full w-full bg-[#FDFDFD] text-black">
            <div className="text-center mb-8 px-4">
                <p className="font-modern text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-2">Selected Layout: {currentLayoutData?.name}</p>
                <h2 className="font-serif text-3xl md:text-4xl italic text-black">Choose Character</h2>
                <p className="font-sans text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1 animate-pulse"><ArrowRight size={10}/> Swipe to browse <ArrowLeft size={10}/></p>
            </div>
            <div className="w-full flex justify-center items-center relative max-w-4xl px-4 md:px-8">
                 <button onClick={() => scrollCharacterList('left')} className="absolute left-2 md:left-0 z-20 w-10 h-10 rounded-full border border-gray-200 bg-white shadow-lg flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 hidden md:flex"><ChevronLeft size={16} /></button>
                 <div ref={characterListRef} className="w-full overflow-x-auto pb-12 hide-scrollbar snap-x snap-mandatory px-4 flex gap-4 md:gap-8 items-center scroll-smooth">
                      {currentAnimeData.characters.map((char) => (
                          <div key={char.id} onClick={() => setSelectedFrame(char.id)} className="group cursor-pointer flex flex-col items-center gap-6 flex-shrink-0 snap-center">
                              <div className={`relative transition-all duration-500 ease-out w-[100px] h-[340px] md:w-[120px] md:h-[400px] flex flex-col bg-white ${selectedFrame === char.id ? 'shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] scale-105 rotate-0 z-10 ring-1 ring-black/5' : 'shadow-lg hover:shadow-xl hover:-translate-y-2 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 rotate-1'}`}>
                                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#FDFDFD] rounded-full shadow-inner z-20 border border-gray-200"></div>
                                  <div className="flex-1 flex flex-col p-3 gap-2">
                                      {[...Array(4)].map((_, i) => (
                                          <div key={i} className="flex-1 bg-zinc-50 relative overflow-hidden border border-zinc-100 shadow-inner">
                                              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]"></div>
                                              {getOverlayImage(char, i * 2) && ( <img crossOrigin="anonymous" src={getOverlayImage(char, i * 2)} alt={char.name} className={`absolute bottom-0 ${char.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(char, i * 2)} h-auto object-contain z-10 mix-blend-darken`} style={{ pointerEvents: 'none' }} /> )}
                                          </div>
                                      ))}
                                  </div>
                                  <div className="h-8 flex items-center justify-center pb-2"><span className="font-title text-[10px] text-zinc-400">Aestho.</span></div>
                              </div>
                              <span className={`font-modern text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${selectedFrame === char.id ? 'text-black font-semibold' : 'text-gray-300 group-hover:text-gray-500'}`}>{char.name}</span>
                          </div>
                      ))}
                 </div>
                 <button onClick={() => scrollCharacterList('right')} className="absolute right-2 md:right-0 z-20 w-10 h-10 rounded-full border border-gray-200 bg-white shadow-lg flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 hidden md:flex"><ChevronRight size={16} /></button>
            </div>
            <div className="fixed bottom-0 left-0 w-full flex flex-col md:flex-row justify-center gap-4 md:gap-8 items-center bg-gradient-to-t from-white via-white to-transparent pt-8 pb-8 px-4">
                 <button onClick={handleBackToAnimeFromFrame} className="font-modern text-[10px] text-gray-400 hover:text-black uppercase flex items-center gap-2 order-2 md:order-1"><ArrowLeft size={12}/> Select Series</button>
                {selectedFrame && ( <button onClick={handleFrameConfirm} className="bg-black text-white px-10 py-3 font-modern text-xs tracking-[0.2em] uppercase hover:bg-gray-800 transition-all flex items-center gap-3 order-1 md:order-2 w-full md:w-auto justify-center border border-black hover:invert">Start Session</button> )}
            </div>
        </main>
      )}

      {/* --- VIEW 6: CAMERA SESSION --- */}
      {currentView === 'camera-session' && (
        <main className="relative z-30 flex flex-col h-full w-full bg-zinc-50 text-zinc-900 overflow-hidden justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-100 via-zinc-50 to-white pointer-events-none"></div>
            <div className="w-full p-4 md:p-6 z-20 flex justify-between items-center text-zinc-400">
                <div className="flex gap-4 items-center">
                    <button onClick={handleBackFromCamera} className="p-2 rounded-full hover:bg-zinc-100 text-black transition-colors border border-transparent hover:border-zinc-200"><ArrowLeft size={20} /></button>
                    <span className="font-title text-2xl md:text-3xl text-zinc-900 tracking-tighter">Aestho.</span>
                    <div className="h-4 w-px bg-zinc-300 hidden md:block"></div>
                    <span className="font-modern text-[10px] uppercase tracking-[0.3em] hidden md:block">{currentLayoutData?.name}</span>
                </div>
                <button onClick={() => window.location.reload()} className="hover:text-zinc-900 transition-colors opacity-50 hover:opacity-100"><RefreshCw size={16}/></button>
            </div>
            <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center p-2 md:p-4 gap-4 relative z-10 h-full overflow-hidden">
                <div className="flex flex-col items-center justify-center w-full md:w-auto h-auto md:h-full shrink-0">
                     <div className="mb-2 md:mb-4 text-center z-20">
                        <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-black border border-zinc-200 shadow-sm">SHOT {capturedPhotos.length} / {MAX_PHOTOS}</span>
                    </div>
                    <div className="relative shadow-2xl rounded-sm overflow-hidden border border-zinc-200 bg-white w-full md:w-auto h-auto md:h-[65vh] max-h-[50vh] md:max-h-none aspect-[3/4] md:aspect-[4/3] flex-shrink-0 ring-1 ring-zinc-100">
                        {useMockCamera ? ( <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500"><span className="font-mono text-xs">Mock Camera Active</span></div> ) : (
                            <>
                                {isCameraLoading && <div className="absolute inset-0 flex items-center justify-center bg-white z-20"><Loader2 className="animate-spin text-zinc-300"/></div>}
                                {!cameraError ? ( <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-0" style={{ filter: currentFilter.style }} /> ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2 bg-zinc-50 z-0">
                                    <Camera size={32} />
                                    <p className="font-modern text-[10px]">Camera Error</p>
                                    <button onClick={() => setUseMockCamera(true)} className="mt-2 px-4 py-1 border border-zinc-300 text-[10px] hover:bg-zinc-100">Use Mock Camera</button>
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
                        {isCountingDown && ( <div className="absolute top-8 right-10 z-100 flex flex-col items-center justify-center pointer-events-none"><span className="font-title text-[5rem] md:text-[8rem] leading-none text-zinc-900 drop-shadow-[0_4px_4px_rgba(255,255,255,0.8)] animate-pulse">{countdownValue}</span></div> )}
                    </div>
                </div>
                <div className="flex md:flex-col flex-row w-full md:w-32 h-20 md:h-[450px] bg-white/40 backdrop-blur-md border border-zinc-200 rounded-xl p-2 gap-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto hide-scrollbar shadow-inner flex-shrink-0 mt-0 md:mt-8">
                    {capturedPhotos.map((photo, i) => (
                        <div key={i} className="w-20 md:w-full aspect-[4/3] rounded overflow-hidden border border-zinc-200 shadow-sm relative bg-white flex-shrink-0">
                             <div className="absolute top-1 right-1 bg-black/50 text-white text-[8px] px-1 rounded backdrop-blur-sm z-20">#{i+1}</div>
                             <img crossOrigin="anonymous" src={photo} className="w-full h-full object-cover z-0 relative" alt={`Captured ${i}`}/>
                             {selectedMode === 'character' && getOverlayImage(selectedCharacterData, i) && ( <img crossOrigin="anonymous" src={getOverlayImage(selectedCharacterData, i)} className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, i)} h-auto object-contain pointer-events-none z-10`} style={{ mixBlendMode: 'normal' }} alt="Overlay Mini" /> )}
                        </div>
                    ))}
                    {[...Array(Math.max(0, 8 - capturedPhotos.length))].map((_, i) => ( <div key={`empty-${i}`} className="w-20 md:w-full aspect-[4/3] rounded border border-dashed border-zinc-300 flex items-center justify-center text-zinc-300 bg-white/50 flex-shrink-0"><span className="text-[8px]">{capturedPhotos.length + i + 1}</span></div> ))}
                </div>
            </div>
            <div className="w-full pb-6 pt-2 md:pb-8 md:pt-4 flex justify-center items-center gap-6 md:gap-12 z-20">
                 <div className="flex flex-col items-center gap-2 md:gap-3">
                     <div className="flex gap-2 md:gap-3 bg-white/50 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full border border-zinc-200 shadow-sm">
                        {filters.map(f => ( <button key={f.id} onClick={() => setCurrentFilter(f)} className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all text-[8px] md:text-[10px] font-bold font-mono border ${currentFilter.id === f.id ? 'bg-black text-white border-black scale-110 shadow-md' : 'text-zinc-400 border-transparent hover:text-black hover:border-zinc-300 hover:bg-white'}`}>{f.name[0]}</button> ))}
                     </div>
                     <span className="font-modern text-[8px] md:text-[10px] tracking-[0.2em] text-zinc-600 font-semibold uppercase">Tone</span>
                 </div>
                 <div className="flex flex-col items-center gap-2 md:gap-3">
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                     <button onClick={handleUploadClick} className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-md flex items-center justify-center hover:bg-white hover:border-zinc-400 transition-all text-zinc-600 shadow-sm"><Upload size={16} className="md:w-5 md:h-5"/></button>
                     <span className="font-modern text-[8px] md:text-[10px] tracking-[0.2em] text-zinc-600 font-semibold uppercase">Upload</span>
                 </div>
                 <div className="relative group">
                     <button onClick={handleShutterClick} className={`w-20 h-20 md:w-24 md:h-24 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 shadow-lg ${capturedPhotos.length >= MAX_PHOTOS ? 'opacity-50 cursor-default' : ''}`}>
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 ${capturedPhotos.length >= MAX_PHOTOS ? 'border-green-500/50' : 'border-zinc-800'} flex items-center justify-center`}>
                            {capturedPhotos.length >= MAX_PHOTOS ? <Check className="text-green-500 opacity-80" size={24}/> : <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-zinc-900 transition-transform duration-300 group-hover:scale-90"></div>}
                        </div>
                     </button>
                 </div>
                 <div className="flex flex-col items-center gap-2 md:gap-3">
                     <button onClick={toggleTimer} className="h-10 md:h-12 px-4 md:px-6 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-md flex items-center gap-2 md:gap-3 hover:bg-white hover:border-zinc-400 transition-all font-mono text-xs md:text-sm text-zinc-700 font-bold shadow-sm"><Clock size={14} className="opacity-70 md:w-4 md:h-4"/><span>{timerDuration}s</span></button>
                     <span className="font-modern text-[8px] md:text-[10px] tracking-[0.2em] text-zinc-600 font-semibold uppercase">Delay</span>
                 </div>
            </div>
        </main>
      )}

      {/* --- VIEW 7: RESULT SELECTION --- */}
      {currentView === 'result-selection' && (
          <main className="relative z-30 flex flex-col h-full w-full bg-zinc-50 text-zinc-900 overflow-hidden">
              <div className="w-full p-4 md:p-6 flex justify-between items-center border-b border-zinc-200">
                  <h1 className="font-title text-2xl md:text-3xl">Select & Arrange</h1>
                  <button onClick={handleToTemplateSelection} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-black text-white rounded-full text-[10px] md:text-xs font-mono hover:bg-zinc-800 tracking-wider">CHOOSE FRAME <ArrowRight size={12}/></button>
              </div>
              <div className="flex-1 flex flex-col md:flex-row w-full h-full p-4 md:p-8 gap-8 md:gap-12 justify-evenly md:justify-center items-center overflow-y-auto">
                  <div className="flex flex-col gap-2 md:gap-4 flex-shrink-0">
                      <div className="font-modern text-[10px] tracking-widest text-zinc-400 text-center">YOUR STRIP</div>
                      
                      {selectedLayout === 'grid-4r' ? (
                          <div className="w-[180px] md:w-[240px] h-[270px] md:h-[360px] bg-white shadow-2xl p-2 border border-zinc-200 grid grid-cols-2 grid-rows-3 gap-2 mx-auto">
                              {selectedStripPhotos.map((photoData, index) => (
                                  <div key={index} className="bg-zinc-100 relative overflow-hidden group border border-zinc-100" draggable={!!photoData} onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)}>
                                      {photoData ? (
                                          <>
                                            <img crossOrigin="anonymous" src={photoData.url} className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-50" alt="Selected" />
                                            {selectedMode === 'character' && getOverlayImage(selectedCharacterData, photoData.originalIndex) && (
                                                <img crossOrigin="anonymous" src={getOverlayImage(selectedCharacterData, photoData.originalIndex)} className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, photoData.originalIndex)} h-auto pointer-events-none z-10`} style={{ mixBlendMode: 'normal' }} alt="Strip Overlay" />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30" onClick={() => handleRemoveFromStrip(index)}><Trash2 className="text-white w-6 h-6 md:w-8 md:h-8 drop-shadow-md hover:scale-110 transition-transform" /></div>
                                          </>
                                      ) : ( <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px] font-mono border-2 border-dashed border-zinc-200">{index + 1}</div> )}
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="w-[100px] md:w-[140px] h-[340px] md:h-[480px] bg-white shadow-2xl p-2 border border-zinc-200 flex flex-col gap-2 overflow-y-auto hide-scrollbar mx-auto">
                              {selectedStripPhotos.map((photoData, index) => (
                                  <div key={index} className="flex-1 bg-zinc-100 relative overflow-hidden group border border-zinc-100 flex-shrink-0" draggable={!!photoData} onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)}>
                                      {photoData ? (
                                          <>
                                            <img crossOrigin="anonymous" src={photoData.url} className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-50" alt="Selected" />
                                            {selectedMode === 'character' && getOverlayImage(selectedCharacterData, photoData.originalIndex) && (
                                                <img crossOrigin="anonymous" src={getOverlayImage(selectedCharacterData, photoData.originalIndex)} className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, photoData.originalIndex)} h-auto pointer-events-none z-10`} style={{ mixBlendMode: 'normal' }} alt="Strip Overlay" />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30" onClick={() => handleRemoveFromStrip(index)}><Trash2 className="text-white w-8 h-8 drop-shadow-md hover:scale-110 transition-transform" /></div>
                                          </>
                                      ) : ( <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px] font-mono border-2 border-dashed border-zinc-200">{index + 1}</div> )}
                                  </div>
                              ))}
                              <div className="mt-auto text-center font-title text-[10px] text-black pt-1">Aestho.</div>
                          </div>
                      )}
                  </div>
                  <div className="flex flex-col gap-4 w-full md:max-w-4xl h-auto md:h-full overflow-y-auto">
                      <div className="font-modern text-[10px] tracking-widest text-zinc-400 text-center md:text-left">CAPTURED SHOTS</div>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 pr-0 md:pr-2 pb-20">
                          {capturedPhotos.map((photo, i) => {
                              const isSelected = selectedStripPhotos.some(p => p && p.originalIndex === i);
                              return (
                                  <div key={i} onClick={() => !isSelected && handleSelectPhoto(photo, i)} className={`w-full aspect-[4/3] bg-white border border-zinc-200 relative transition-all overflow-hidden rounded-lg group ${isSelected ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:ring-2 ring-black hover:shadow-lg'}`}>
                                      <img crossOrigin="anonymous" src={photo} className="w-full h-full object-cover" alt={`Shot ${i}`} />
                                      {selectedMode === 'character' && getOverlayImage(selectedCharacterData, i) && ( <img crossOrigin="anonymous" src={getOverlayImage(selectedCharacterData, i)} className={`absolute bottom-0 ${selectedCharacterData.position === 'right' ? 'right-0' : 'left-0'} ${getOverlayWidth(selectedCharacterData, i)} h-auto object-contain pointer-events-none`} alt="Grid Overlay" /> )}
                                      {isSelected && ( <div className="absolute inset-0 flex items-center justify-center bg-black/10"><Check className="text-white w-8 h-8 drop-shadow-md" /></div> )}
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
          <main className="relative z-30 flex flex-col h-full w-full bg-zinc-50 text-zinc-900 overflow-hidden">
              <div className="w-full p-4 md:p-6 flex justify-between items-center border-b border-zinc-200 pl-24 md:pl-48">
                  <h1 className="font-title text-2xl md:text-3xl">Choose Frame</h1>
                  <button onClick={handleToStickerEditor} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-black text-white rounded-full text-[10px] md:text-xs font-mono hover:bg-zinc-800 tracking-wider">NEXT <ArrowRight size={12}/></button>
              </div>
              <div className="flex-1 flex flex-col md:flex-row w-full h-full justify-evenly md:justify-center items-center gap-4 md:gap-10 p-4 overflow-hidden">
                  <div className="flex-none flex flex-col items-center justify-center w-full md:w-auto h-[50%] md:h-full relative order-1 md:order-1">
                      <span className="font-modern text-[10px] tracking-widest text-zinc-400 mb-2 md:mb-8">YOUR RESULT</span>
                      <div className="transform scale-[0.6] md:scale-100 origin-center">
                        <AesthoStrip template={selectedTemplate} photos={selectedStripPhotos} mode={selectedMode} characterData={selectedCharacterData} scale={selectedLayout === 'grid-4r' ? 0.25 : 0.25} layoutConfig={getLayoutConfig(selectedLayout)} />
                      </div>
                  </div>
                  <div className="flex-none flex flex-col items-center justify-center w-full md:w-auto h-[40%] md:h-full relative bg-gray-50/30 rounded-xl border border-gray-100/50 order-2 md:order-2 py-2">
                      <span className="font-modern text-[10px] tracking-widest text-zinc-400 mb-2 md:absolute md:top-10">SELECT FRAME</span>
                      <div className="w-full md:max-w-lg h-full overflow-x-auto snap-x snap-mandatory flex items-center gap-6 md:gap-10 hide-scrollbar px-8 md:px-20 py-2 md:py-20">
                          {stripTemplates.filter(t => t.layoutId === selectedLayout).map((tpl) => (
                              <div key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`cursor-pointer flex-shrink-0 flex flex-col items-center gap-2 md:gap-4 transition-all duration-500 snap-center ${selectedTemplate.id === tpl.id ? 'opacity-100 z-10 drop-shadow-xl scale-110' : 'opacity-60 hover:opacity-100 scale-90'}`}>
                                  <div className="pointer-events-none border border-zinc-200 shadow-sm bg-white overflow-hidden transform scale-75 md:scale-100 origin-center">
                                       <AesthoStrip template={tpl} photos={selectedStripPhotos} mode={selectedMode} characterData={selectedCharacterData} scale={selectedLayout === 'grid-4r' ? 0.1 : 0.15} shadow={false} layoutConfig={getLayoutConfig(selectedLayout)} />
                                  </div>
                                  <span className="font-modern text-[8px] uppercase text-center mt-1 tracking-widest text-zinc-500">{tpl.name}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </main>
      )}

      {/* --- VIEW 8.5: STICKER EDITOR --- */}
      {currentView === 'sticker-editor' && (
          <main className="relative z-30 flex flex-col h-full w-full bg-zinc-50 text-zinc-900 overflow-hidden" onClick={() => setActiveStickerId(null)}>
              <div className="w-full p-4 md:p-6 flex justify-between items-center border-b border-zinc-200 pl-24 md:pl-48 bg-white z-40 relative shadow-sm">
                  <h1 className="font-title text-2xl md:text-3xl">Decorate Strip</h1>
                  <div className="flex gap-2 md:gap-4">
                      <button onClick={handleBackToTemplate} className="text-zinc-500 hover:text-black font-modern text-[10px] uppercase hidden md:block">Back</button>
                      <button onClick={handleToFinalResult} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-black text-white rounded-full text-[10px] md:text-xs font-mono hover:bg-zinc-800 tracking-wider shadow-md hover:shadow-lg transition-all">FINISH <Check size={12}/></button>
                  </div>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden">
                  {/* Kiri: Canvas */}
                  <div className="flex-1 flex items-center justify-center bg-zinc-100 p-4 relative overflow-auto border-r border-zinc-200 hide-scrollbar cursor-crosshair">
                      <div className="transform origin-center flex items-center justify-center my-auto transition-transform duration-300" 
                           onClick={(e) => e.stopPropagation()}>
                          <AesthoStrip 
                             template={selectedTemplate} 
                             photos={selectedStripPhotos} 
                             mode={selectedMode} 
                             characterData={selectedCharacterData} 
                             scale={selectedLayout === 'grid-4r' ? 0.35 : 0.25} 
                             layoutConfig={getLayoutConfig(selectedLayout)}
                             isEditable={true} 
                          />
                      </div>
                      
                      {!activeStickerId && (
                          <span className="absolute bottom-6 left-1/2 transform -translate-x-1/2 font-modern text-[10px] text-zinc-500 bg-white/90 px-6 py-2 rounded-full shadow-sm backdrop-blur-md pointer-events-none border border-zinc-200 uppercase tracking-widest hidden md:block">Click & Drag Stickers to Move</span>
                      )}

                      {/* Toolbar Kontrol Stiker Aktual */}
                      {activeStickerId && (
                          <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-full shadow-2xl border border-zinc-200 flex items-center gap-2 md:gap-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300" onClick={e => e.stopPropagation()}>
                              <button onClick={() => handleScaleSticker('down')} className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-full transition-colors" title="Perkecil"><ZoomOut size={18}/></button>
                              <button onClick={() => handleScaleSticker('up')} className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-full transition-colors" title="Perbesar"><ZoomIn size={18}/></button>
                              
                              <div className="w-px h-6 bg-zinc-300 mx-1"></div>
                              
                              <button onClick={() => handleRotateSticker('left')} className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-full transition-colors" title="Putar Kiri"><RotateCcw size={18}/></button>
                              <button onClick={() => handleRotateSticker('right')} className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-full transition-colors" title="Putar Kanan"><RotateCw size={18}/></button>
                              
                              <div className="w-px h-6 bg-zinc-300 mx-1"></div>
                              
                              <button onClick={handleDuplicateSticker} className="p-2 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Duplikat"><Copy size={18}/></button>
                              <button onClick={() => removeSticker(activeStickerId)} className="p-2 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Hapus"><Trash2 size={18}/></button>
                          </div>
                      )}
                  </div>
                  
                  {/* Kanan: Sidebar Sticker Palette */}
                  <div className="w-full md:w-[380px] bg-white h-full flex flex-col z-10 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                          <h3 className="font-modern text-xs font-bold tracking-[0.2em] text-zinc-800 uppercase">Stickers</h3>
                          <button onClick={() => {setPlacedStickers([]); setActiveStickerId(null);}} className="text-[10px] font-modern tracking-widest text-red-500 hover:text-red-700 uppercase bg-red-50 px-3 py-1 rounded-full">Clear All</button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-5 hide-scrollbar grid grid-cols-3 gap-4 content-start bg-[#FDFDFD]">
                          {/* Upload User Button */}
                          <div onClick={() => stickerUploadRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-50 hover:border-zinc-400 transition-all text-zinc-400 bg-white shadow-sm hover:shadow-md">
                              <ImagePlus size={20} />
                              <span className="text-[8px] font-modern uppercase tracking-wider">Upload</span>
                              <input type="file" ref={stickerUploadRef} onChange={handleStickerUpload} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp" />
                          </div>
                          
                          {/* User Stickers */}
                          {userStickers.map((url, i) => (
                              <div key={`user-${i}`} onClick={() => handleAddSticker(url)} className="aspect-square rounded-2xl bg-white border border-zinc-100 p-3 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center justify-center group relative overflow-hidden">
                                  <img src={url} alt="User Sticker" className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform" />
                              </div>
                          ))}

                          {/* Default Theme Stickers */}
                          {defaultStickers.map((url, i) => (
                              <div key={`def-${i}`} onClick={() => handleAddSticker(url)} className="aspect-square rounded-2xl bg-white border border-zinc-100 p-3 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center justify-center group relative overflow-hidden">
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
        <main className="relative z-30 flex flex-col h-full w-full bg-zinc-50 text-zinc-900 overflow-hidden">
             <div className="w-full p-4 md:p-6 flex justify-between items-center border-b border-zinc-200 pl-24 md:pl-48 bg-white z-10 shadow-sm relative">
                  <div className="flex gap-4 items-center">
                    <span className="font-title text-2xl md:text-3xl hidden md:block">Aestho.</span>
                    <span className="font-modern text-[10px] tracking-widest text-zinc-400">FINAL RESULT</span>
                  </div>
                  <div className="flex gap-2 md:gap-4 flex-wrap justify-end">
                      <button onClick={handleToStickerEditor} className="text-zinc-500 hover:text-black font-modern text-[10px] hidden md:block mt-2 md:mt-0 mr-2">BACK</button>
                      
                      {/* Tombol Share Baru */}
                      <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-[10px] md:text-xs font-mono hover:shadow-lg hover:-translate-y-0.5 transition-all">
                          <Share size={12} className="hidden md:block"/> SHARE
                      </button>

                      <button onClick={downloadStaticJPG} disabled={isDownloadingJPG} className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2 bg-black text-white rounded-full text-[10px] md:text-xs font-mono hover:bg-zinc-800 tracking-wider disabled:opacity-50 transition-all border border-transparent">
                          {isDownloadingJPG ? <Loader2 size={12} className="animate-spin"/> : <Download size={12}/>} JPG
                      </button>
                      <button onClick={downloadLiveVideo} disabled={isDownloadingVideo} className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2 bg-black text-white rounded-full text-[10px] md:text-xs font-mono hover:bg-zinc-800 tracking-wider disabled:opacity-50 transition-all border border-transparent">
                          {isDownloadingVideo ? <Loader2 size={12} className="animate-spin"/> : <Download size={12}/>} VIDEO
                      </button>
                  </div>
              </div>
              
              {/* HIDDEN RENDER: Untuk mendapatkan resolusi maksimal Canvas JPG */}
              <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
                  <AesthoStrip stripRef={staticStripRef} template={selectedTemplate} photos={selectedStripPhotos} mode={selectedMode} characterData={selectedCharacterData} scale={1} shadow={false} layoutConfig={getLayoutConfig(selectedLayout)} />
              </div>
              
              {/* HIDDEN RENDER: Untuk mendapatkan Frame kosong Video */}
              <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
                  <AesthoStrip stripRef={baseStripRef} template={selectedTemplate} photos={Array(selectedLayout === 'grid-4r' ? 6 : 4).fill(null)} mode="original" scale={1} shadow={false} layoutConfig={getLayoutConfig(selectedLayout)} showPlacedStickers={false} />
              </div>

              <div className="flex-1 flex flex-col md:flex-row w-full h-full justify-start md:justify-center items-center gap-8 md:gap-16 p-8 overflow-y-auto bg-gray-50 pb-32 md:pb-8 relative z-0">
                  <div className="flex flex-col items-center gap-4 shrink-0">
                      <span className="font-modern text-[10px] tracking-[0.2em] text-zinc-400">STATIC RESULT</span>
                      <div className="transform scale-[0.85] md:scale-100 origin-top">
                        <AesthoStrip template={selectedTemplate} photos={selectedStripPhotos} mode={selectedMode} characterData={selectedCharacterData} scale={selectedLayout === 'grid-4r' ? 0.30 : 0.30} layoutConfig={getLayoutConfig(selectedLayout)} />
                      </div>
                  </div>
                  <div className="flex flex-col items-center gap-4 shrink-0">
                      <span className="font-modern text-[10px] tracking-[0.2em] text-zinc-400 flex items-center gap-2">LIVE MOMENT <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div></span>
                      <div className="transform scale-[0.85] md:scale-100 origin-top">
                        <AesthoStrip template={selectedTemplate} photos={selectedStripPhotos} clips={capturedClips} mode={selectedMode} characterData={selectedCharacterData} scale={selectedLayout === 'grid-4r' ? 0.30 : 0.30} layoutConfig={getLayoutConfig(selectedLayout)} />
                      </div>
                  </div>
              </div>
        </main>
      )}

      {/* --- SHARE MODAL --- */}
      {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-md transition-opacity">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 relative text-center">
                      <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-black bg-zinc-50 hover:bg-zinc-100 p-2 rounded-full transition-colors">
                          <X size={16} />
                      </button>
                      <h2 className="font-title text-3xl text-black mb-1">Share Masterpiece</h2>
                      <p className="font-modern text-[10px] text-zinc-500 uppercase tracking-widest mb-8">Pilih platform tujuan</p>

                      <div className="grid grid-cols-2 gap-4">
                          {/* Instagram */}
                          <button onClick={() => handleShareToPlatform('Instagram')} disabled={isSharingProcess} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white hover:scale-105 transition-transform shadow-md disabled:opacity-50">
                              {isSharingProcess ? <Loader2 className="animate-spin" size={28}/> : (
                                  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                              )}
                              <span className="font-modern text-[10px] tracking-wider uppercase font-bold">Instagram</span>
                          </button>

                          {/* X (Twitter) */}
                          <button onClick={() => handleShareToPlatform('X (Twitter)')} disabled={isSharingProcess} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-black text-white hover:scale-105 transition-transform shadow-md disabled:opacity-50">
                              {isSharingProcess ? <Loader2 className="animate-spin" size={28}/> : (
                                  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
                              )}
                              <span className="font-modern text-[10px] tracking-wider uppercase font-bold">X (Twitter)</span>
                          </button>

                          {/* Facebook */}
                          <button onClick={() => handleShareToPlatform('Facebook')} disabled={isSharingProcess} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-blue-600 text-white hover:scale-105 transition-transform shadow-md disabled:opacity-50">
                              {isSharingProcess ? <Loader2 className="animate-spin" size={28}/> : (
                                  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                              )}
                              <span className="font-modern text-[10px] tracking-wider uppercase font-bold">Facebook</span>
                          </button>

                          {/* WhatsApp */}
                          <button onClick={() => handleShareToPlatform('WhatsApp')} disabled={isSharingProcess} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-green-500 text-white hover:scale-105 transition-transform shadow-md disabled:opacity-50">
                               {isSharingProcess ? <Loader2 className="animate-spin" size={28}/> : (
                                  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                               )}
                              <span className="font-modern text-[10px] tracking-wider uppercase font-bold">WhatsApp</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
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
  );
};

export default App;
