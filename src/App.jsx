import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, Plus, Star, Users, Camera, RefreshCw, Sliders, Clock, Download, Check, Loader2, Play, VideoOff, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Printer, LayoutTemplate, Sparkles, Image, Palette, Flame, Swords, Heart, Cloud, Moon, Zap, Music, Ghost, Sun } from 'lucide-react';

const App = () => {
  // ==================================================================================
  // 1. KONFIGURASI DATA
  // ==================================================================================

  // A. Pilihan Layout
  const layouts = [
    { 
      id: 'classic-white', 
      name: 'Classic White', 
      type: 'vertical', 
      desc: 'Clean white vertical strip.',
      cssContainer: 'w-24 h-[320px] flex-col p-2 gap-2 bg-white shadow-xl',
      cssPhoto: 'w-full h-16',
      bgColor: 'bg-white',
      textColor: 'text-black'
    },
    { 
      id: 'classic-black', 
      name: 'Classic Black',
      type: 'vertical', 
      desc: 'Bold black vertical strip.',
      cssContainer: 'w-24 h-[320px] flex-col p-2 gap-2 bg-zinc-900 shadow-xl border-gray-800',
      cssPhoto: 'w-full h-16',
      bgColor: 'bg-black',
      textColor: 'text-white'
    }
  ];

  // B. Pilihan Mode
  const modes = [
    { 
      id: 'original', 
      name: 'Aestho Original', 
      desc: 'Minimalist blank canvas.', 
      icon: <Star className="w-8 h-8"/>, 
      style: 'bg-white text-black border-gray-200' 
    },
    { 
      id: 'character', 
      name: 'Character Collab', 
      desc: 'Pose with idols & anime chars.', 
      icon: <Users className="w-8 h-8"/>, 
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Genshin_Impact_logo.svg/2560px-Genshin_Impact_logo.svg.png',
      color: 'hover:shadow-blue-400/50', 
      icon: <Star className="text-blue-500"/>,
      characters: [
        { 
            id: 'furina', 
            name: 'Furina', 
            // Gambar Overlay (ARRAY 4 POSE)
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
                'https://lh3.googleusercontent.com/d/1bXuCo6unhBdlIGXPXV7GW3W2wI4NAEwz',
                'https://lh3.googleusercontent.com/d/1lZE-TRE2OqVMH7Y0j5EyjEEwDMTOXCls',
                'https://lh3.googleusercontent.com/d/1rlhTH22wlx_LNUbpemamPMngQN-mpXqq',
                'https://lh3.googleusercontent.com/d/1IJ2jk4acSeMyToisLfoQieB2GI8hWa_R'
            ],
            theme: 'bg-pink-50' 
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
            theme: 'bg-yellow-100' 
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
          { id: 'silverwolf', name: 'Silver Wolf', overlayImg: 'https://placehold.co/600x800/transparent/8b5cf6?text=Silver+Wolf', theme: 'bg-purple-100' },
          { id: 'sparkle', name: 'Sparkle', overlayImg: 'https://placehold.co/600x800/transparent/be185d?text=Sparkle', theme: 'bg-pink-200' }
      ]
    },
    {
      id: 'jjk',
      name: 'Jujutsu Kaisen',
      logoUrl: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a44778ea-3457-40e0-8979-b7e3685d23d0/dekiqwv-be5d6933-0cc6-40e1-9b67-60b3affb002b.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2E0NDc3OGVhLTM0NTctNDBlMC04OTc5LWI3ZTM2ODVkMjNkMFwvZGVraXF3di1iZTVkNjkzMy0wY2M2LTQwZTEtOWI2Ny02MGIzYWZmYjAwMmIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.MTyBudLEGmNsCm4sYllShvFfo8MopGfgIQseKhejx00',
      color: 'hover:shadow-purple-900/50',
      icon: <Flame className="text-purple-800"/>,
      characters: [
          { id: 'gojo', name: 'Satoru Gojo', overlayImg: 'https://placehold.co/600x800/transparent/3b82f6?text=Gojo', theme: 'bg-blue-50' },
          { id: 'nobara', name: 'Nobara Kugisaki', overlayImg: 'https://placehold.co/600x800/transparent/f97316?text=Nobara', theme: 'bg-orange-50' },
          { id: 'yuji', name: 'Yuji Itadori', overlayImg: 'https://placehold.co/600x800/transparent/ef4444?text=Yuji', theme: 'bg-red-50' },
          { id: 'megumi', name: 'Megumi Fushiguro', overlayImg: 'https://placehold.co/600x800/transparent/1e293b?text=Megumi', theme: 'bg-slate-200' }
      ]
    },
    {
        id: 'aot',
        name: 'Attack on Titan',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2022/01/Attack-on-Titan-Logo.png',
        color: 'hover:shadow-amber-900/50',
        icon: <Swords className="text-amber-900"/>,
        characters: [
            { id: 'eren', name: 'Eren Yeager', overlayImg: 'https://placehold.co/600x800/transparent/451a03?text=Eren', theme: 'bg-amber-50' },
            { id: 'mikasa', name: 'Mikasa Ackerman', overlayImg: 'https://placehold.co/600x800/transparent/7f1d1d?text=Mikasa', theme: 'bg-red-900' },
            { id: 'armin', name: 'Armin Arlert', overlayImg: 'https://placehold.co/600x800/transparent/fcd34d?text=Armin', theme: 'bg-yellow-100' },
            { id: 'jean', name: 'Jean Kirstein', overlayImg: 'https://placehold.co/600x800/transparent/a8a29e?text=Jean', theme: 'bg-stone-200' }
        ]
    }
  ];

  // E. Template Strip (Updated)
  const stripTemplates = [
      { 
          id: 'aestho-signature', 
          name: 'Aestho Signature', 
          type: 'css', 
          bgColor: '#ffffff', 
          textColor: 'black',
          cssContainer: 'p-3 gap-3 bg-white', 
          photoRadius: 'rounded-xl' 
      },
      { 
          id: 'cinnamon-roll', 
          name: 'Cloudy Frame', 
          type: 'css', 
          bgColor: '#ffffff', 
          textColor: '#0ea5e9', // sky-500
          // Grid pattern background created with CSS gradient
          cssContainer: 'p-4 gap-3',
          customStyle: {
              backgroundImage: 'linear-gradient(#bae6fd 2px, transparent 2px), linear-gradient(90deg, #bae6fd 2px, transparent 2px)',
              backgroundSize: '20px 20px',
              backgroundColor: 'white'
          },
          photoRadius: 'rounded-2xl border-4 border-sky-100 shadow-sm', // Rounded corner for photos
          sticker: <Cloud className="text-sky-300 w-8 h-8 fill-sky-100 drop-shadow-sm" />
      },
      // 1. GENSHIN THEME (Hydro/Blue)
      { 
          id: 'frame-genshin', 
          name: 'Teyvat Blue', 
          type: 'css', 
          bgColor: '#eff6ff', 
          textColor: '#1e40af', 
          cssContainer: 'p-3 gap-3 bg-gradient-to-b from-blue-50 to-blue-100 border-2 border-blue-200', 
          photoRadius: 'rounded-lg',
          sticker: <img src="https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Genshin_Impact_logo.svg/2560px-Genshin_Impact_logo.svg.png" className="w-12 h-auto opacity-80" alt="Genshin" />
      },
      // 2. HSR THEME (Space/Dark)
      { 
          id: 'frame-hsr', 
          name: 'Astral Express', 
          type: 'css', 
          bgColor: '#1e1b4b', 
          textColor: '#e0e7ff', 
          cssContainer: 'p-3 gap-3 bg-gradient-to-b from-slate-900 to-indigo-900 border-2 border-indigo-500/30', 
          photoRadius: 'rounded-sm',
          sticker: <img src="https://preview.redd.it/what-is-the-font-for-the-hsr-logo-v0-06d75o5cvn3b1.png?width=1290&format=png&auto=webp&s=6f720d993f23ba56cb4ab7931320f091d45c9973" className="w-10 h-auto opacity-90 invert" alt="HSR" />
      },
      // 3. JJK THEME (Cursed/RedBlack)
      { 
          id: 'frame-jjk', 
          name: 'Jujutsu High', 
          type: 'css', 
          bgColor: '#000000', 
          textColor: '#f87171', 
          cssContainer: 'p-3 gap-3 bg-black border-2 border-red-900', 
          photoRadius: 'rounded-none',
          sticker: <Flame className="text-red-600 w-6 h-6 animate-pulse" />
      },
      // 4. AOT THEME (Scout/GreenBrown)
      { 
          id: 'frame-aot', 
          name: 'Survey Corps', 
          type: 'css', 
          bgColor: '#3f6212', 
          textColor: '#fef3c7', 
          cssContainer: 'p-3 gap-3 bg-[#2d4025] border-2 border-[#5c4d3c]', 
          photoRadius: 'rounded-sm',
          sticker: <Swords className="text-amber-100 w-6 h-6" />
      },
      // 5. PINK COQUETTE
      { 
          id: 'frame-pink', 
          name: 'Coquette Bow', 
          type: 'css', 
          bgColor: '#fdf2f8', 
          textColor: '#db2777', 
          cssContainer: 'p-4 gap-2 bg-pink-50 border-dashed border-2 border-pink-300', 
          photoRadius: 'rounded-[2rem]',
          sticker: <Heart className="text-pink-400 w-6 h-6 fill-pink-200" />
      },
      // 6. RETRO YELLOW
      { 
          id: 'frame-retro', 
          name: 'Retro 90s', 
          type: 'css', 
          bgColor: '#fef08a', 
          textColor: '#854d0e', 
          cssContainer: 'p-3 gap-3 bg-yellow-200 border-4 border-orange-400', 
          photoRadius: 'rounded-lg',
          sticker: <Sun className="text-orange-500 w-8 h-8" />
      },
      // 7. MINT FRESH
      { 
          id: 'frame-mint', 
          name: 'Minty Fresh', 
          type: 'css', 
          bgColor: '#ecfdf5', 
          textColor: '#047857', 
          cssContainer: 'p-3 gap-3 bg-emerald-100 border border-emerald-300', 
          photoRadius: 'rounded-xl',
          sticker: <Sparkles className="text-emerald-500 w-5 h-5" />
      },
      // 8. CYBERPUNK NEON
      { 
          id: 'frame-neon', 
          name: 'Neon City', 
          type: 'css', 
          bgColor: '#09090b', 
          textColor: '#22d3ee', 
          cssContainer: 'p-3 gap-3 bg-zinc-950 border border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]', 
          photoRadius: 'rounded-sm',
          sticker: <Zap className="text-yellow-400 w-6 h-6 fill-yellow-400" />
      },
      // 9. PURPLE DREAM
      { 
          id: 'frame-purple', 
          name: 'Lavender Haze', 
          type: 'css', 
          bgColor: '#f3e8ff', 
          textColor: '#7e22ce', 
          cssContainer: 'p-3 gap-3 bg-purple-100 border-2 border-white ring-2 ring-purple-200', 
          photoRadius: 'rounded-2xl',
          sticker: <Moon className="text-purple-400 w-5 h-5" />
      },
      // 10. CLOUDY BLUE
      { 
          id: 'frame-cloud', 
          name: 'Sky Blue', 
          type: 'css', 
          bgColor: '#e0f2fe', 
          textColor: '#0369a1', 
          cssContainer: 'p-3 gap-3 bg-sky-100 border-4 border-white', 
          photoRadius: 'rounded-3xl',
          sticker: <Cloud className="text-white w-8 h-8 fill-white drop-shadow-md" />
      },
      // 11. HALLOWEEN GHOST
       { 
          id: 'frame-spooky', 
          name: 'Spooky Cute', 
          type: 'css', 
          bgColor: '#27272a', 
          textColor: '#a78bfa', 
          cssContainer: 'p-3 gap-3 bg-zinc-800 border-dashed border-2 border-zinc-600', 
          photoRadius: 'rounded-md',
          sticker: <Ghost className="text-white w-6 h-6" />
      }
  ];

  // ==================================================================================
  // 2. LOGIC APLIKASI
  // ==================================================================================

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
  const [selectedStripPhotos, setSelectedStripPhotos] = useState([null, null, null, null]); 
  
  const MAX_PHOTOS = 8;
  const videoRef = useRef(null);
  const characterListRef = useRef(null); 

  const currentLayoutData = layouts.find(l => l.id === selectedLayout);
  const currentAnimeData = animeOptions.find(a => a.id === selectedAnime);
  const selectedCharacterData = currentAnimeData?.characters.find(c => c.id === selectedFrame);

  // Helper: Get Overlay Image
  const getOverlayImage = (character, photoIndex) => {
    if (!character || !character.overlayImg) return null;
    if (Array.isArray(character.overlayImg)) {
        const poseIndex = Math.floor(photoIndex / 2);
        return character.overlayImg[poseIndex % character.overlayImg.length];
    }
    return character.overlayImg;
  };

  const getCameraOverlay = (character, shotCount) => {
      if (!character || !character.overlayImg) return null;
      if (Array.isArray(character.overlayImg)) {
          const poseIndex = Math.floor(shotCount / 2);
          return character.overlayImg[poseIndex % character.overlayImg.length];
      }
      return character.overlayImg;
  }

  // --- CAMERA LOGIC ---
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
        video: true,
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
    let currentStream = null;
    if (currentView === 'camera-session') {
      if (!useMockCamera) startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
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
    setSelectedStripPhotos([null, null, null, null]);
    setUseMockCamera(false);
    if (selectedMode === 'original') triggerTransition(() => setCurrentView('camera-session')); 
    else if (selectedMode === 'character') triggerTransition(() => setCurrentView('anime'));
  };
  const handleAnimeSelect = (id) => { setSelectedAnime(id); triggerTransition(() => setCurrentView('frame')); };
  const handleFrameConfirm = () => triggerTransition(() => setCurrentView('camera-session'));
  const handleToTemplateSelection = () => setCurrentView('template-selection');
  const handleBackToHome = () => { setCurrentView('home'); setSelectedLayout(null); };
  const handleBackToLayout = () => { setCurrentView('layout'); setSelectedMode(null); };
  const handleBackToMode = () => { setCurrentView('mode'); setSelectedAnime(null); };
  const handleBackToModeFromAnime = () => { setCurrentView('mode'); setSelectedAnime(null); };
  const handleBackToAnimeFromFrame = () => { setCurrentView('anime'); setSelectedFrame(null); };


  const scrollCharacterList = (direction) => {
    if (characterListRef.current) {
        const { current } = characterListRef;
        const scrollAmount = 200;
        if (direction === 'left') current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        else current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleShutterClick = () => {
    if (isCountingDown || capturedPhotos.length >= MAX_PHOTOS) return;
    setIsCountingDown(true);
    setCountdownValue(timerDuration);
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
      } catch (e) {
        console.error("Capture Failed:", e);
      }
    }
  };

  const handlePhotoCaptured = (imgUrl) => {
      const newPhotos = [...capturedPhotos, imgUrl];
      setCapturedPhotos(newPhotos);
      if (newPhotos.length >= MAX_PHOTOS) {
          triggerTransition(() => setCurrentView('result-selection'));
      }
  }

  const toggleTimer = () => {
    if (timerDuration === 3) setTimerDuration(5);
    else if (timerDuration === 5) setTimerDuration(10);
    else setTimerDuration(3);
  };

  const handleSelectPhoto = (photo, originalIndex) => {
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

  const handleMoveUp = (index) => {
      if (index === 0) return;
      const newStrip = [...selectedStripPhotos];
      const temp = newStrip[index];
      newStrip[index] = newStrip[index - 1];
      newStrip[index - 1] = temp;
      setSelectedStripPhotos(newStrip);
  }

  const handleMoveDown = (index) => {
      if (index === 3) return;
      const newStrip = [...selectedStripPhotos];
      const temp = newStrip[index];
      newStrip[index] = newStrip[index + 1];
      newStrip[index + 1] = temp;
      setSelectedStripPhotos(newStrip);
  }

  return (
    <div className="relative w-full h-screen bg-[#FDFDFD] overflow-hidden font-sans selection:bg-black selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Niconne&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Syncopate:wght@400;700&display=swap');
        .font-title { font-family: 'Niconne', cursive; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-modern { font-family: 'Syncopate', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- VIEW 1 to 7 are identical to previous, included here for completeness --- */}
      
      {currentView === 'home' && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full text-center p-4 bg-[#FDFDFD] text-black">
           <div className="relative mb-4 cursor-default select-none">
               <h1 className="font-title text-[5rem] md:text-[8rem] leading-none text-black z-10 relative">Aestho</h1>
               <h1 className="font-title text-[5rem] md:text-[8rem] leading-none text-black/5 absolute top-2 left-2 blur-sm">Aestho</h1>
           </div>
           <p className="font-serif text-lg md:text-xl text-black/70 mb-12 italic tracking-wider">"Collecting moments, frame by frame."</p>
           <button onClick={handleStart} className="group relative px-6 py-2 uppercase font-modern text-xs md:text-sm tracking-[0.3em] border-b border-black/20 hover:border-black transition-all">
             Enter Studio
           </button>
        </main>
      )}

      {currentView === 'layout' && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full w-full px-6 bg-[#FDFDFD] text-black">
            <h2 className="font-serif text-3xl md:text-4xl italic text-black mb-12">Choose Canvas</h2>
            <div className="flex gap-12 items-center justify-center mb-16 flex-wrap">
                {layouts.map((l) => (
                    <div key={l.id} onClick={() => setSelectedLayout(l.id)} className={`cursor-pointer group flex flex-col items-center justify-center gap-6 transition-all duration-300 ${selectedLayout === l.id ? 'scale-105 opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                        <div className={`${l.cssContainer} transition-transform group-hover:-translate-y-2 border ${l.id === 'classic-white' ? 'border-gray-200' : 'border-gray-800'}`}>
                             {[...Array(4)].map((_,i) => (
                               <div key={i} className={`${l.cssPhoto} bg-gray-200 overflow-hidden relative grayscale opacity-80`}>
                                  <div className="w-full h-full bg-gradient-to-tr from-gray-300 to-gray-200"></div>
                               </div>
                             ))}
                             <div className={`w-full h-auto pt-2 flex justify-center items-end opacity-50 ${l.textColor}`}>
                                <span className="font-title text-[10px]">Aestho.</span>
                             </div>
                        </div>
                        <div className="text-center">
                          <span className="font-modern text-xs tracking-widest uppercase block border-b border-transparent group-hover:border-black pb-1">{l.name}</span>
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

      {currentView === 'mode' && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full w-full px-6 bg-[#FDFDFD] text-black">
            <h2 className="font-serif text-3xl md:text-4xl italic text-black mb-12">Select Style</h2>
            <div className="flex gap-6 mb-16 flex-wrap justify-center">
                {modes.map((m) => (
                      <div key={m.id} onClick={() => setSelectedMode(m.id)} className={`cursor-pointer border rounded-xl p-8 w-64 text-center transition-all ${m.style} ${selectedMode === m.id ? 'ring-2 ring-offset-2 ring-gray-300 scale-105' : 'opacity-70 hover:opacity-100'}`}>
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

      {currentView === 'anime' && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full w-full px-6 bg-[#FDFDFD] text-black">
            <h2 className="font-serif text-3xl md:text-4xl italic text-black mb-12">Pick Partner</h2>
            <div className="flex gap-6 mb-16 flex-wrap justify-center">
                {animeOptions.map((a) => (
                    <div key={a.id} onClick={() => handleAnimeSelect(a.id)} className={`cursor-pointer border border-gray-200 rounded-xl p-6 w-40 h-48 md:w-48 md:h-56 flex flex-col items-center justify-between bg-white transition-all ${a.color} hover:border-black hover:scale-105`}>
                         <div className="opacity-50">{a.icon}</div>
                         <img src={a.logoUrl} alt={a.name} className="max-w-[80%] max-h-16 object-contain grayscale hover:grayscale-0 transition-all"/>
                         <span className="font-modern text-[10px] font-bold uppercase tracking-widest">{a.name}</span>
                    </div>
                ))}
            </div>
            <button onClick={handleBackToModeFromAnime} className="font-modern text-[10px] text-gray-400 hover:text-black uppercase">Back</button>
        </main>
      )}

      {currentView === 'frame' && currentAnimeData && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full w-full bg-[#FDFDFD] text-black">
            <div className="text-center mb-8 px-4">
                <p className="font-modern text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-2">Selected Layout: {currentLayoutData?.name}</p>
                <h2 className="font-serif text-3xl md:text-4xl italic text-black">Choose Character</h2>
                <p className="font-sans text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1 animate-pulse">Swipe to browse or use arrows</p>
            </div>
            <div className="w-full flex justify-center items-center relative max-w-4xl px-8">
                 <button onClick={() => scrollCharacterList('left')} className="absolute left-2 md:left-0 z-20 w-10 h-10 rounded-full border border-gray-200 bg-white shadow-lg flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 hidden md:flex">
                    <ChevronLeft size={16} />
                 </button>
                 <div ref={characterListRef} className="w-full overflow-x-auto pb-12 hide-scrollbar snap-x snap-mandatory px-4 flex gap-8 items-center scroll-smooth">
                      {currentAnimeData.characters.map((char) => (
                          <div key={char.id} onClick={() => setSelectedFrame(char.id)} className="group cursor-pointer flex flex-col items-center gap-6 flex-shrink-0 snap-center">
                              <div className={`relative transition-all duration-500 ease-out w-[100px] h-[340px] md:w-[120px] md:h-[400px] flex flex-col bg-white ${selectedFrame === char.id ? 'shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] scale-105 rotate-0 z-10 ring-1 ring-black/5' : 'shadow-lg hover:shadow-xl hover:-translate-y-2 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 rotate-1'}`}>
                                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#FDFDFD] rounded-full shadow-inner z-20 border border-gray-200"></div>
                                  <div className="flex-1 flex flex-col p-3 gap-2">
                                      {[...Array(4)].map((_, i) => (
                                          <div key={i} className="flex-1 bg-zinc-50 relative overflow-hidden border border-zinc-100 shadow-inner">
                                              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]"></div>
                                              {getOverlayImage(char, i * 2) && ( 
                                                  <img src={getOverlayImage(char, i * 2)} alt={char.name} className="absolute bottom-0 left-0 w-[60%] h-auto object-contain z-10 mix-blend-darken" onError={(e) => { e.target.style.display = 'none'; }} style={{ pointerEvents: 'none' }} />
                                              )}
                                          </div>
                                      ))}
                                  </div>
                                  <div className="h-8 flex items-center justify-center pb-2">
                                      <span className="font-title text-[10px] text-zinc-400">Aestho.</span>
                                  </div>
                              </div>
                              <span className={`font-modern text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${selectedFrame === char.id ? 'text-black font-semibold' : 'text-gray-300 group-hover:text-gray-500'}`}>{char.name}</span>
                          </div>
                      ))}
                 </div>
                 <button onClick={() => scrollCharacterList('right')} className="absolute right-2 md:right-0 z-20 w-10 h-10 rounded-full border border-gray-200 bg-white shadow-lg flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 hidden md:flex">
                    <ChevronRight size={16} />
                 </button>
            </div>
            <div className="fixed bottom-0 left-0 w-full flex flex-col md:flex-row justify-center gap-4 md:gap-8 items-center bg-gradient-to-t from-white via-white to-transparent pt-8 pb-8 px-4">
                 <button onClick={handleBackToAnimeFromFrame} className="font-modern text-[10px] text-gray-400 hover:text-black uppercase flex items-center gap-2 order-2 md:order-1"><ArrowLeft size={12}/> Select Series</button>
                {selectedFrame && (
                    <button onClick={handleFrameConfirm} className="bg-black text-white px-10 py-3 font-modern text-xs tracking-[0.2em] uppercase hover:bg-gray-800 transition-all flex items-center gap-3 order-1 md:order-2 w-full md:w-auto justify-center shadow-none border border-black hover:invert">Start Session</button>
                )}
            </div>
        </main>
      )}

      {/* --- VIEW 6: CAMERA SESSION --- */}
      {currentView === 'camera-session' && (
        <main className="relative z-30 flex flex-col h-full w-full bg-zinc-50 text-zinc-900 overflow-hidden justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-100 via-zinc-50 to-white pointer-events-none"></div>
            <div className="w-full p-6 z-20 flex justify-between items-center text-zinc-400">
                <div className="flex gap-4 items-center">
                    <span className="font-title text-3xl text-zinc-900 tracking-tighter">Aestho.</span>
                    <div className="h-4 w-px bg-zinc-300"></div>
                    <span className="font-modern text-[10px] uppercase tracking-[0.3em]">{currentLayoutData?.name}</span>
                </div>
                <button onClick={() => window.location.reload()} className="hover:text-zinc-900 transition-colors opacity-50 hover:opacity-100"><RefreshCw size={16}/></button>
            </div>
            <div className="flex-1 w-full flex flex-col items-center justify-center p-4 relative z-10">
                <div className="mb-6 text-center z-20">
                     <span className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-mono text-black border border-zinc-200 shadow-sm">SHOT {capturedPhotos.length} / {MAX_PHOTOS}</span>
                </div>
                <div className="relative shadow-2xl rounded-sm overflow-hidden border border-zinc-200 bg-white w-full max-w-xl aspect-[4/3] flex-shrink-0 ring-1 ring-zinc-100">
                    {useMockCamera ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500"><span className="font-mono text-xs">Mock Camera Active</span></div>
                    ) : (
                        <>
                            {isCameraLoading && (<div className="absolute inset-0 flex items-center justify-center bg-white z-20"><Loader2 className="animate-spin text-zinc-300"/></div>)}
                            {!cameraError ? (
                              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-0" style={{ filter: currentFilter.style }} />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2 bg-zinc-50 z-0">
                                <Camera size={32} />
                                <p className="font-modern text-[10px]">Camera Error</p>
                                <button onClick={() => setUseMockCamera(true)} className="mt-2 px-4 py-1 border border-zinc-300 text-[10px] hover:bg-zinc-100">Use Mock Camera</button>
                              </div>
                            )}
                        </>
                    )}
                    {selectedMode === 'character' && (
                      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                          {getCameraOverlay(selectedCharacterData, capturedPhotos.length) && (
                              <img src={getCameraOverlay(selectedCharacterData, capturedPhotos.length)} alt="Frame Overlay" className="absolute bottom-0 left-0 w-[60%] h-auto object-contain object-bottom-left transition-all duration-500" style={{ mixBlendMode: 'normal', filter: currentFilter.style === 'none' ? 'none' : `${currentFilter.style} brightness(1.1)` }} />
                          )}
                      </div>
                    )}
                    {isCountingDown && (
                        <div className="absolute top-8 right-10 z-50 flex flex-col items-center justify-center pointer-events-none">
                             <span className="font-title text-[8rem] leading-none text-zinc-900 drop-shadow-[0_4px_4px_rgba(255,255,255,0.8)] animate-pulse">{countdownValue}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full pb-8 pt-4 flex justify-center items-center gap-8 md:gap-16 z-20">
                 <div className="flex flex-col items-center gap-3">
                     <div className="flex gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200 shadow-sm">
                        {filters.map(f => (
                            <button key={f.id} onClick={() => setCurrentFilter(f)} className={`w-6 h-6 rounded-full flex items-center justify-center transition-all text-[8px] font-mono border ${currentFilter.id === f.id ? 'bg-black text-white border-black' : 'text-zinc-400 border-transparent hover:text-black hover:border-zinc-300'}`}>{f.name[0]}</button>
                        ))}
                     </div>
                     <span className="font-modern text-[8px] tracking-[0.2em] text-zinc-400 uppercase">Tone</span>
                 </div>
                 <div className="relative group">
                     <button onClick={handleShutterClick} className={`w-24 h-24 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 shadow-lg ${capturedPhotos.length >= MAX_PHOTOS ? 'opacity-50 cursor-default' : ''}`}>
                        <div className={`w-20 h-20 rounded-full border-2 ${capturedPhotos.length >= MAX_PHOTOS ? 'border-green-500/50' : 'border-zinc-800'} flex items-center justify-center`}>
                            {capturedPhotos.length >= MAX_PHOTOS ? <Check className="text-green-500 opacity-80" size={32}/> : <div className="w-16 h-16 rounded-full bg-zinc-900 transition-transform duration-300 group-hover:scale-90"></div>}
                        </div>
                     </button>
                 </div>
                 <div className="flex flex-col items-center gap-3">
                     <button onClick={toggleTimer} className="h-10 px-6 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-md flex items-center gap-3 hover:bg-white hover:border-zinc-400 transition-all font-mono text-xs text-zinc-600">
                        <Clock size={14} className="opacity-70"/>
                        <span>{timerDuration}s</span>
                     </button>
                     <span className="font-modern text-[8px] tracking-[0.2em] text-zinc-400 uppercase">Delay</span>
                 </div>
            </div>
        </main>
      )}

      {/* --- VIEW 7: RESULT SELECTION --- */}
      {currentView === 'result-selection' && (
          <main className="relative z-30 flex flex-col h-full w-full bg-zinc-50 text-zinc-900 overflow-hidden">
              <div className="w-full p-6 flex justify-between items-center border-b border-zinc-200">
                  <h1 className="font-title text-3xl">Select & Arrange</h1>
                  <button onClick={handleToTemplateSelection} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-xs font-mono hover:bg-zinc-800 tracking-wider">
                      CHOOSE FRAME <ArrowRight size={14}/>
                  </button>
              </div>
              <div className="flex-1 flex w-full h-full p-8 gap-12 justify-center items-center">
                  <div className="flex flex-col gap-4">
                      <div className="font-modern text-[10px] tracking-widest text-zinc-400 text-center">YOUR STRIP</div>
                      
                      {/* CONTAINER STRIP: Tinggi otomatis (h-auto) & lebar tetap (w-[160px]) */}
                      <div className={`relative w-[160px] shadow-2xl overflow-hidden bg-white ring-1 ring-zinc-200 flex flex-col h-auto`}>
                          
                          {/* FRAME OVERLAY (IMAGE) */}
                          {selectedTemplate.type === 'image' && (
                              <div className="relative z-20 pointer-events-none">
                                  <img src={selectedTemplate.url} className="w-full h-full object-fill" alt="Frame" />
                              </div>
                          )}

                          {/* PHOTO LAYER (STACKED BEHIND FRAME) */}
                          <div className={`w-full z-10 ${selectedTemplate.cssContainer || (selectedTemplate.type === 'image' ? (selectedTemplate.cssPhotos || '') : 'p-1.5 gap-1.5 bg-white')}`}>
                             
                             {selectedTemplate.sticker && (
                                 <div className="absolute top-1 right-1 z-30 pointer-events-none drop-shadow-md">
                                     {selectedTemplate.sticker}
                                 </div>
                             )}

                             {selectedStripPhotos.map((photoData, index) => (
                                  <div key={index} className={`relative overflow-hidden bg-gray-100 group border border-transparent w-full ${selectedTemplate.photoStyle || 'aspect-[4/3]'} ${selectedTemplate.photoRadius || ''}`}>
                                      {photoData ? (
                                          <>
                                            <img src={photoData.url} className="w-full h-full object-cover" />
                                            {selectedMode === 'character' && getOverlayImage(selectedCharacterData, photoData.originalIndex) && (
                                                <img src={getOverlayImage(selectedCharacterData, photoData.originalIndex)} className="absolute bottom-0 left-0 w-[60%] h-auto pointer-events-none z-10" style={{ mixBlendMode: 'normal' }} />
                                            )}
                                            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                <button onClick={() => handleMoveUp(index)} className="bg-black/50 text-white p-1 rounded hover:bg-black"><ChevronUp size={10}/></button>
                                                <button onClick={() => handleRemoveFromStrip(index)} className="bg-red-500/80 text-white p-1 rounded hover:bg-red-600"><X size={10}/></button>
                                                <button onClick={() => handleMoveDown(index)} className="bg-black/50 text-white p-1 rounded hover:bg-black"><ChevronDown size={10}/></button>
                                            </div>
                                          </>
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px] font-mono border-2 border-dashed border-zinc-200">{index + 1}</div>
                                      )}
                                  </div>
                              ))}
                          </div>
                          
                          {/* WATERMARK FOOTER (CSS ONLY) */}
                          {selectedTemplate.type === 'css' && (
                             <div className={`text-center pt-2 pb-2 ${selectedTemplate.id === 'aestho-signature' ? 'flex items-center justify-center min-h-[40px]' : ''}`}>
                                 <span className={`font-title ${selectedTemplate.id === 'aestho-signature' ? 'text-lg rotate-[-2deg]' : 'text-[10px]'} text-black`}>Aestho.</span>
                             </div>
                          )}
                      </div>
                  </div>
                  <div className="flex flex-col gap-4 max-w-4xl h-full overflow-y-auto">
                      <div className="font-modern text-[10px] tracking-widest text-zinc-400">CAPTURED SHOTS (CLICK TO ADD)</div>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 pr-2">
                          {capturedPhotos.map((photo, i) => (
                              <div key={i} onClick={() => handleSelectPhoto(photo, i)} className="w-full aspect-[4/3] bg-white border border-zinc-200 relative cursor-pointer hover:ring-2 ring-black hover:shadow-lg transition-all overflow-hidden rounded-lg group">
                                  <img src={photo} className="w-full h-full object-cover" />
                                  {selectedMode === 'character' && getOverlayImage(selectedCharacterData, i) && (
                                     <img src={getOverlayImage(selectedCharacterData, i)} className="absolute bottom-0 left-0 w-[60%] h-auto object-contain pointer-events-none" />
                                  )}
                                  <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity">SHOT #{i+1}</div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </main>
      )}

      {/* --- VIEW 8: TEMPLATE SELECTION (CLOSE & CENTERED) --- */}
      {currentView === 'template-selection' && (
          <main className="relative z-30 flex flex-col h-full w-full bg-zinc-50 text-zinc-900 overflow-hidden">
              <div className="w-full p-6 flex justify-between items-center border-b border-zinc-200">
                  <h1 className="font-title text-3xl">Choose Frame</h1>
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-xs font-mono hover:bg-zinc-800 tracking-wider">
                      <Printer size={14}/> PRINT
                  </button>
              </div>
              
              {/* CONTAINER: GAP LEBIH KECIL (gap-10), CENTERED */}
              <div className="flex-1 flex flex-col md:flex-row w-full h-full justify-center items-center gap-10 p-4 overflow-hidden">
                  
                  {/* KIRI: RESULT PREVIEW (LARGE & CENTERED) */}
                  <div className="flex-none flex flex-col items-center justify-center h-full w-full md:w-auto">
                      <span className="font-modern text-[10px] tracking-widest text-zinc-400 mb-8">YOUR RESULT</span>
                      
                      <div className={`relative w-[180px] shadow-2xl overflow-hidden bg-white ring-1 ring-zinc-200 flex flex-col h-auto scale-110 origin-center`}>
                          {/* FRAME OVERLAY */}
                          {selectedTemplate.type === 'image' && (
                              <div className="relative z-20 pointer-events-none">
                                  <img src={selectedTemplate.url} className="w-full h-auto" alt="Frame" />
                              </div>
                          )}

                          {/* PHOTO STACK */}
                          <div className={`w-full z-10 ${selectedTemplate.cssContainer || (selectedTemplate.type === 'image' ? (selectedTemplate.cssPhotos || '') : 'p-1.5 gap-1.5 bg-white')}`}>
                              
                              {selectedTemplate.sticker && (
                                 <div className="absolute top-1 right-1 z-30 pointer-events-none drop-shadow-sm">
                                     {selectedTemplate.sticker}
                                 </div>
                              )}

                              {selectedStripPhotos.map((photoData, index) => (
                                  <div key={index} className={`relative overflow-hidden bg-gray-100 border border-transparent w-full ${selectedTemplate.photoStyle || 'aspect-[4/3]'} ${selectedTemplate.photoRadius || ''}`}>
                                      {photoData ? (
                                          <>
                                            <img src={photoData.url} className="w-full h-full object-cover" />
                                            {selectedMode === 'character' && getOverlayImage(selectedCharacterData, photoData.originalIndex) && (
                                                <img src={getOverlayImage(selectedCharacterData, photoData.originalIndex)} className="absolute bottom-0 left-0 w-[60%] h-auto pointer-events-none z-10" style={{ mixBlendMode: 'normal' }} />
                                            )}
                                          </>
                                      ) : (
                                          <div className="w-full h-full bg-white"></div>
                                      )}
                                  </div>
                              ))}
                          </div>

                          {/* FOOTER */}
                          {(selectedTemplate.type === 'css') && (
                             <div className={`text-center pt-2 pb-3 ${selectedTemplate.id === 'aestho-signature' ? 'h-16 flex items-center justify-center' : 'h-auto'}`} style={{ backgroundColor: selectedTemplate.bgColor }}>
                                 <span className={`font-title ${selectedTemplate.id === 'aestho-signature' ? 'text-2xl rotate-[-2deg]' : 'text-[10px]'}`} style={{ color: selectedTemplate.textColor }}>Aestho.</span>
                             </div>
                          )}
                      </div>
                  </div>

                  {/* KANAN: HORIZONTAL SLIDER (ONE AT A TIME, PARTIALLY VISIBLE NEIGHBORS) */}
                  <div className="flex-none flex flex-col items-center justify-center h-full w-full md:w-auto relative bg-gray-50/30 rounded-xl border border-gray-100/50">
                      <span className="font-modern text-[10px] tracking-widest text-zinc-400 mb-4 absolute top-10">SELECT FRAME</span>
                      
                      {/* INCREASED WIDTH (w-full max-w-lg) so neighbors are visible. NO MASKING. */}
                      <div className="w-full max-w-lg h-[70vh] overflow-x-auto snap-x snap-mandatory flex items-center gap-10 hide-scrollbar px-20 py-20">
                          {stripTemplates.map((tpl) => (
                              <div key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`cursor-pointer flex-shrink-0 flex flex-col items-center gap-4 p-4 rounded-xl transition-all duration-500 snap-center ${selectedTemplate.id === tpl.id ? 'scale-110 opacity-100 z-10 drop-shadow-xl bg-white' : 'scale-90 opacity-60 hover:opacity-100'}`}>
                                  <div className={`w-[120px] bg-white shadow-sm relative overflow-hidden rounded-sm border border-zinc-100 mx-auto flex flex-col pointer-events-none h-auto ring-1 ring-black/5`}>
                                      {/* TAMPILKAN GAMBAR FRAME DI PREVIEW */}
                                      {tpl.type === 'image' && (
                                          <div className="relative z-20">
                                              <img src={tpl.url} className="w-full h-auto" alt="Frame Preview" />
                                          </div>
                                      )}
                                      
                                      {/* PHOTO PLACEHOLDERS (AUTO FILL FOR IMAGE TYPE) */}
                                      <div className={`flex flex-col w-full ${tpl.cssContainer || (tpl.type === 'image' ? 'absolute inset-0 z-10' : 'p-1 gap-1')}`}>
                                          {tpl.sticker && (
                                             <div className="absolute top-1 right-1 z-30 scale-50 origin-top-right">
                                                 {tpl.sticker}
                                             </div>
                                          )}

                                          {[...Array(4)].map((_,i) => (
                                              <div key={i} className={`bg-gray-100 border border-transparent w-full ${tpl.photoStyle || 'aspect-[4/3]'} ${tpl.photoRadius || ''} flex items-center justify-center`}>
                                                  {/* Jika image type & auto-fill, kotak ini transparan/hidden tertutup frame, tapi ada logic flex-1 */}
                                                  {tpl.type === 'css' && <div className="w-full h-full bg-gray-200 opacity-50"></div>}
                                              </div>
                                          ))}
                                      </div>

                                      {tpl.type === 'css' && (
                                          <div className={`text-center pt-1 pb-2 ${tpl.id === 'aestho-signature' ? 'h-8 flex items-center justify-center' : 'h-auto'}`}>
                                              <span className={`font-title ${tpl.id === 'aestho-signature' ? 'text-xs rotate-[-2deg]' : 'text-[6px]'} text-black`}>Aestho.</span>
                                          </div>
                                      )}
                                  </div>
                                  <span className="font-modern text-[8px] uppercase text-center mt-2 tracking-widest text-zinc-500">{tpl.name}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </main>
      )}
    </div>
  );
};

export default App;