import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, Plus, Star, Users, Camera, RefreshCw, Sliders, Clock, Download, Check, Loader2, Play, VideoOff, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Printer, LayoutTemplate, Sparkles, Image as ImageIcon, Palette, Flame, Swords, Heart, Cloud, Moon, Zap, Music, Ghost, Sun, Share, Upload, Trash2 } from 'lucide-react';

const App = () => {
  // ==================================================================================
  // 1. KONFIGURASI DATA
  // ==================================================================================

  // --- STANDARD DIMENSIONS ---
  // Ukuran ini presisi untuk cetak 2x6 inchi atau 600x2000px
  const STD = {
      W: 600,
      H: 2000,
      PHOTO_W: 510,
      PHOTO_H: 383,
      MARGIN_X: 45,
      MARGIN_TOP: 60,
      GAP: 30
  };

  // A. Pilihan Layout (Canvas Types)
  const layouts = [
    { 
      id: 'classic-white', 
      name: 'Classic White', 
      type: 'vertical', 
      desc: 'Clean white vertical strip.',
      cssContainer: 'w-24 h-[320px] flex-col p-2 gap-2 bg-white shadow-xl',
      cssPhoto: 'w-full h-16',
      bgColor: 'bg-white',
      textColor: 'text-black',
      disabled: false
    },
    { 
      id: 'coming-soon', 
      name: 'Coming Soon', 
      type: 'placeholder', 
      desc: 'More styles coming soon.',
      cssContainer: 'w-24 h-[320px] flex items-center justify-center bg-zinc-50 border border-dashed border-zinc-300 shadow-sm',
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

  // E. Template Strip (UPDATED: Added overlayUrl for top layer frames)
  const stripTemplates = [
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
  const [capturedClips, setCapturedClips] = useState([]);
  const [selectedStripPhotos, setSelectedStripPhotos] = useState([null, null, null, null]); 
  
  const MAX_PHOTOS = 8;
  const videoRef = useRef(null);
  const characterListRef = useRef(null); 
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // NEW STATE: DRAG AND DROP
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const currentLayoutData = layouts.find(l => l.id === selectedLayout);
  const currentAnimeData = animeOptions.find(a => a.id === selectedAnime);
  const selectedCharacterData = currentAnimeData?.characters.find(c => c.id === selectedFrame);

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
    setCapturedClips([]); 
    setSelectedStripPhotos([null, null, null, null]);
    setUseMockCamera(false);
    if (selectedMode === 'original') triggerTransition(() => setCurrentView('camera-session')); 
    else if (selectedMode === 'character') triggerTransition(() => setCurrentView('anime'));
  };
  const handleAnimeSelect = (id) => { setSelectedAnime(id); triggerTransition(() => setCurrentView('frame')); };
  const handleFrameConfirm = () => triggerTransition(() => setCurrentView('camera-session'));
  const handleToTemplateSelection = () => setCurrentView('template-selection');
  const handleToFinalResult = () => setCurrentView('final-result'); 
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

  const handleUploadClick = () => {
      fileInputRef.current.click();
  };

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
      const isAlreadySelected = selectedStripPhotos.some(p => p && p.originalIndex === originalIndex);
      if (isAlreadySelected) return;

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

  const handleDragStart = (e, index) => {
      setDraggedItemIndex(index);
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
      e.preventDefault(); 
      e.dataTransfer.dropEffect = "move";
  };

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

  const AesthoStrip = ({ template, photos, clips, mode, characterData, scale = 1, shadow = true }) => {
    const wrapperStyle = {
        width: `${STD.W * scale}px`,
        height: `${STD.H * scale}px`,
        position: 'relative',
        flexShrink: 0
    };

    const stripTransformStyle = {
        width: `${STD.W}px`,
        height: `${STD.H}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left', 
        position: 'absolute',
        top: 0,
        left: 0
    };

    const stripContentStyle = {
        width: '100%',
        height: '100%',
        paddingTop: `${STD.MARGIN_TOP}px`,
        paddingLeft: `${STD.MARGIN_X}px`,
        paddingRight: `${STD.MARGIN_X}px`,
        gap: `${STD.GAP}px`,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor: template.bgColor,
        ...template.styleContainer
    };

    const photoStyle = {
        width: `${STD.PHOTO_W}px`,
        height: `${STD.PHOTO_H}px`,
        flexShrink: 0 
    };

    return (
        <div style={wrapperStyle}>
            <div 
                className={`${shadow ? 'shadow-2xl' : ''} bg-white transition-all duration-300`}
                style={stripTransformStyle}
            >
                <div style={stripContentStyle}>
                    {template.sticker && (
                        <div className="absolute top-4 right-4 z-10 pointer-events-none drop-shadow-md origin-top-right scale-150">
                            {template.sticker}
                        </div>
                    )}

                    {photos.map((photoData, index) => (
                        <div key={index} 
                            className={`relative overflow-hidden bg-gray-100 border border-transparent flex items-center justify-center z-0 ${template.photoRadius || ''}`}
                            style={photoStyle}
                        >
                            {photoData ? (
                                <>
                                    {clips && clips[photoData.originalIndex] ? (
                                        <video 
                                            src={clips[photoData.originalIndex]} 
                                            autoPlay loop muted playsInline 
                                            className="w-full h-full object-cover transform scale-x-[-1]" 
                                        />
                                    ) : (
                                        <img src={photoData.url} className="w-full h-full object-cover" alt={`Shot ${index}`}/>
                                    )}
                                    
                                    {mode === 'character' && getOverlayImage(characterData, photoData.originalIndex) && (
                                        <img 
                                            src={getOverlayImage(characterData, photoData.originalIndex)} 
                                            className="absolute bottom-0 left-0 w-[60%] h-auto pointer-events-none z-10" 
                                            style={{ mixBlendMode: 'normal' }} 
                                            alt="Overlay"
                                        />
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full bg-white opacity-20"></div>
                            )}
                        </div>
                    ))}

                    <div className="flex-1 flex items-center justify-center relative overflow-hidden z-0">
                        {!template.hideFooter && (
                            <span 
                                className={`font-title ${template.id === 'aestho-signature' ? 'rotate-[-2deg]' : ''}`} 
                                style={{ 
                                    color: template.textColor, 
                                    fontSize: '64px' 
                                }}
                            >
                                Aestho.
                            </span>
                        )}
                        {template.id === 'frame-retro' && <div className="absolute bottom-4 w-full h-4 bg-orange-400 opacity-50"></div>}
                    </div>
                </div>

                {template.overlayUrl && (
                    <div 
                        className="absolute inset-0 z-20 pointer-events-none"
                        style={{ 
                            backgroundImage: `url(${template.overlayUrl})`,
                            backgroundSize: '100% 100%',
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                )}
            </div>
        </div>
    );
  };

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

      {/* GLOBAL BRANDING / WATERMARK */}
      <div className="fixed bottom-6 left-6 z-[60] opacity-40 hover:opacity-100 transition-all duration-300 group cursor-default">
         <img 
           src="https://lh3.googleusercontent.com/d/1FujM1yqU72AGrQbx-tShQBGSd8WQeXFW" 
           alt="Dzev Logo" 
           className="w-16 h-auto drop-shadow-sm grayscale group-hover:grayscale-0 transition-all"
         />
      </div>

      {/* --- VIEW 1: HOME --- */}
      {currentView === 'home' && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full text-center p-4 bg-[#FDFDFD] text-black">
           <div className="relative mb-4 cursor-default select-none">
               <h1 className="font-title text-[5rem] md:text-[8rem] leading-none text-black z-10 relative">Aestho</h1>
               <h1 className="font-title text-[5rem] md:text-[8rem] leading-none text-black/5 absolute top-2 left-2 blur-sm">Aestho</h1>
           </div>
           <p className="font-serif text-lg md:text-xl text-black/70 mb-12 italic tracking-wider">"Collecting moments, frame by frame."</p>
           
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
                    <div key={l.id} onClick={() => !l.disabled && setSelectedLayout(l.id)} 
                      className={`
                        flex flex-col items-center justify-center gap-6 transition-all duration-300 
                        ${l.disabled ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer group opacity-60 hover:opacity-100'}
                        ${selectedLayout === l.id ? '!opacity-100 scale-105' : ''}
                      `}>
                        <div className={`${l.cssContainer} transition-transform ${!l.disabled ? 'group-hover:-translate-y-2' : ''} border ${l.id === 'classic-white' ? 'border-gray-200' : 'border-gray-200'}`}>
                             {!l.disabled ? (
                               <>
                                 {[...Array(4)].map((_,i) => (
                                   <div key={i} className={`${l.cssPhoto} bg-gray-200 overflow-hidden relative grayscale opacity-80`}>
                                      <div className="w-full h-full bg-gradient-to-tr from-gray-300 to-gray-200"></div>
                                   </div>
                                 ))}
                                 <div className={`w-full h-auto pt-2 flex justify-center items-end opacity-50 ${l.textColor}`}>
                                    <span className="font-title text-[10px]">Aestho.</span>
                                 </div>
                               </>
                             ) : (
                               <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400">
                                   <span className="font-serif text-6xl italic">?</span>
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
                      <div key={m.id} onClick={() => setSelectedMode(m.id)} 
                        className={`cursor-pointer border rounded-xl p-8 w-64 text-center transition-all ${m.style} ${selectedMode === m.id ? 'ring-2 ring-offset-2 ring-gray-300 scale-105' : 'opacity-70 hover:opacity-100'}`}>
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
            <div className="flex gap-6 mb-16 flex-wrap justify-center">
                {animeOptions.map((a) => (
                    <div key={a.id} onClick={() => handleAnimeSelect(a.id)} 
                        className={`cursor-pointer border border-gray-200 rounded-xl p-6 w-40 h-48 md:w-48 md:h-56 flex flex-col items-center justify-between bg-white transition-all ${a.color} hover:border-black hover:scale-105`}>
                         <div className="opacity-50">{a.icon}</div>
                         <img src={a.logoUrl} alt={a.name} className="max-w-[80%] max-h-16 object-contain grayscale hover:grayscale-0 transition-all"/>
                         <span className="font-modern text-[10px] font-bold uppercase tracking-widest">{a.name}</span>
                    </div>
                ))}
            </div>
            <button onClick={handleBackToModeFromAnime} className="font-modern text-[10px] text-gray-400 hover:text-black uppercase">Back</button>
        </main>
      )}

      {/* --- VIEW 5: FRAME SELECTION (STRIP PREVIEW) --- */}
      {currentView === 'frame' && currentAnimeData && (
        <main className="relative z-30 flex flex-col items-center justify-center h-full w-full bg-[#FDFDFD] text-black">
            <div className="text-center mb-8 px-4">
                <p className="font-modern text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-2">Selected Layout: {currentLayoutData?.name}</p>
                <h2 className="font-serif text-3xl md:text-4xl italic text-black">Choose Character</h2>
                <p className="font-sans text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1 animate-pulse">
                    <ArrowRight size={10}/> Swipe to browse <ArrowLeft size={10}/>
                </p>
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
                <button onClick={() => window.location.reload()} className="hover:text-zinc-900 transition-colors opacity-50 hover:opacity-100">
                    <RefreshCw size={16}/>
                </button>
            </div>
            <div className="flex-1 w-full flex flex-col items-center justify-center p-4 relative z-10">
                <div className="mb-6 text-center z-20">
                     <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-black border border-zinc-200 shadow-sm">
                        SHOT {capturedPhotos.length} / {MAX_PHOTOS}
                     </span>
                </div>
                <div className="relative shadow-2xl rounded-sm overflow-hidden border border-zinc-200 bg-white w-full max-w-xl aspect-[4/3] flex-shrink-0 ring-1 ring-zinc-100">
                    {useMockCamera ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
                            <span className="font-mono text-xs">Mock Camera Active</span>
                        </div>
                    ) : (
                        <>
                            {isCameraLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
                                    <Loader2 className="animate-spin text-zinc-300"/>
                                </div>
                            )}
                            {!cameraError ? (
                              <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-0"
                                style={{ filter: currentFilter.style }} 
                              />
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
                              <img 
                                src={getCameraOverlay(selectedCharacterData, capturedPhotos.length)} 
                                alt="Frame Overlay" 
                                className="absolute bottom-0 left-0 w-[60%] h-auto object-contain object-bottom-left transition-all duration-500" 
                                style={{ 
                                  mixBlendMode: 'normal',
                                  filter: currentFilter.style === 'none' ? 'none' : `${currentFilter.style} brightness(1.1)` 
                                }}
                              />
                          )}
                      </div>
                    )}
                    {isCountingDown && (
                        <div className="absolute top-8 right-10 z-50 flex flex-col items-center justify-center pointer-events-none">
                             <span className="font-title text-[8rem] leading-none text-zinc-900 drop-shadow-[0_4px_4px_rgba(255,255,255,0.8)] animate-pulse">
                                {countdownValue}
                             </span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Controls Bar */}
            <div className="w-full pb-8 pt-4 flex justify-center items-center gap-8 md:gap-12 z-20">
                 {/* 1. TONE (FILTER) */}
                 <div className="flex flex-col items-center gap-3">
                     <div className="flex gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200 shadow-sm">
                        {filters.map(f => (
                            <button key={f.id} onClick={() => setCurrentFilter(f)} 
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all text-[8px] font-mono border ${currentFilter.id === f.id ? 'bg-black text-white border-black' : 'text-zinc-400 border-transparent hover:text-black hover:border-zinc-300'}`}>
                                {f.name[0]}
                            </button>
                        ))}
                     </div>
                     <span className="font-modern text-[8px] tracking-[0.2em] text-zinc-400 uppercase">Tone</span>
                 </div>

                 {/* 2. UPLOAD BUTTON (NEW) */}
                 <div className="flex flex-col items-center gap-3">
                     <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange} 
                        className="hidden" 
                        multiple 
                        accept="image/*"
                     />
                     <button onClick={handleUploadClick} className="h-10 w-10 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-md flex items-center justify-center hover:bg-white hover:border-zinc-400 transition-all text-zinc-600">
                        <Upload size={16} />
                     </button>
                     <span className="font-modern text-[8px] tracking-[0.2em] text-zinc-400 uppercase">Upload</span>
                 </div>

                 {/* 3. SHUTTER BUTTON */}
                 <div className="relative group">
                     <button onClick={handleShutterClick} 
                        className={`
                            w-24 h-24 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-sm flex items-center justify-center 
                            transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 shadow-lg
                            ${capturedPhotos.length >= MAX_PHOTOS ? 'opacity-50 cursor-default' : ''}
                        `}>
                        <div className={`w-20 h-20 rounded-full border-2 ${capturedPhotos.length >= MAX_PHOTOS ? 'border-green-500/50' : 'border-zinc-800'} flex items-center justify-center`}>
                            {capturedPhotos.length >= MAX_PHOTOS ? 
                                <Check className="text-green-500 opacity-80" size={32}/> : 
                                <div className="w-16 h-16 rounded-full bg-zinc-900 transition-transform duration-300 group-hover:scale-90"></div>
                            }
                        </div>
                     </button>
                 </div>

                 {/* 4. DELAY (TIMER) */}
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
                      <div className="font-modern text-[10px] tracking-widest text-zinc-400 text-center">YOUR STRIP (DRAG TO REORDER)</div>
                      <div className={`
                          w-[140px] h-[480px] bg-white shadow-2xl p-2 border border-zinc-200 flex flex-col gap-2
                      `}>
                          {selectedStripPhotos.map((photoData, index) => (
                              <div 
                                  key={index} 
                                  className="flex-1 bg-zinc-100 relative overflow-hidden group border border-zinc-100"
                                  draggable={!!photoData}
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, index)}
                              >
                                  {photoData ? (
                                      <>
                                        <img src={photoData.url} className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-50" />
                                        {selectedMode === 'character' && getOverlayImage(selectedCharacterData, photoData.originalIndex) && (
                                            <img 
                                                src={getOverlayImage(selectedCharacterData, photoData.originalIndex)} 
                                                className="absolute bottom-0 left-0 w-[60%] h-auto pointer-events-none z-10"
                                                style={{ mixBlendMode: 'normal' }}
                                            />
                                        )}
                                        {/* DELETE OVERLAY */}
                                        <div 
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30"
                                            onClick={() => handleRemoveFromStrip(index)}
                                        >
                                            <Trash2 className="text-white w-8 h-8 drop-shadow-md hover:scale-110 transition-transform" />
                                        </div>
                                      </>
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px] font-mono border-2 border-dashed border-zinc-200">
                                          {index + 1}
                                      </div>
                                  )}
                              </div>
                          ))}
                          <div className="mt-auto text-center font-title text-[10px] text-black pt-1">Aestho.</div>
                      </div>
                  </div>

                  <div className="flex flex-col gap-4 max-w-4xl h-full overflow-y-auto">
                      <div className="font-modern text-[10px] tracking-widest text-zinc-400">CAPTURED SHOTS (CLICK TO ADD)</div>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 pr-2">
                          {capturedPhotos.map((photo, i) => {
                              const isSelected = selectedStripPhotos.some(p => p && p.originalIndex === i);
                              return (
                                  <div key={i} 
                                      onClick={() => !isSelected && handleSelectPhoto(photo, i)}
                                      className={`
                                        w-full aspect-[4/3] bg-white border border-zinc-200 relative transition-all overflow-hidden rounded-lg group
                                        ${isSelected ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:ring-2 ring-black hover:shadow-lg'}
                                      `}
                                  >
                                      <img src={photo} className="w-full h-full object-cover" />
                                      {selectedMode === 'character' && getOverlayImage(selectedCharacterData, i) && (
                                         <img 
                                            src={getOverlayImage(selectedCharacterData, i)}
                                            className="absolute bottom-0 left-0 w-[60%] h-auto object-contain pointer-events-none"
                                         />
                                      )}
                                      {isSelected && (
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                              <Check className="text-white w-8 h-8 drop-shadow-md" />
                                          </div>
                                      )}
                                      <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                        SHOT #{i+1}
                                      </div>
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
              <div className="w-full p-6 flex justify-between items-center border-b border-zinc-200">
                  <h1 className="font-title text-3xl">Choose Frame</h1>
                  <button onClick={handleToFinalResult} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-xs font-mono hover:bg-zinc-800 tracking-wider">
                      NEXT <ArrowRight size={14}/>
                  </button>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row w-full h-full justify-center items-center gap-10 p-4 overflow-hidden">
                  
                  {/* LEFT: LIVE PREVIEW (LARGE) */}
                  <div className="flex-none flex flex-col items-center justify-center h-full w-full md:w-auto relative">
                      <span className="font-modern text-[10px] tracking-widest text-zinc-400 mb-8">YOUR RESULT</span>
                      {/* Scale down to fit comfortably */}
                      <AesthoStrip 
                        template={selectedTemplate} 
                        photos={selectedStripPhotos} 
                        mode={selectedMode} 
                        characterData={selectedCharacterData} 
                        scale={0.28}
                      />
                  </div>

                  {/* RIGHT: TEMPLATE CHOOSER */}
                  <div className="flex-none flex flex-col items-center justify-center h-full w-full md:w-auto relative bg-gray-50/30 rounded-xl border border-gray-100/50">
                      <span className="font-modern text-[10px] tracking-widest text-zinc-400 mb-4 absolute top-10">SELECT FRAME</span>
                      
                      <div className="w-full max-w-lg h-[70vh] overflow-x-auto snap-x snap-mandatory flex items-center gap-10 hide-scrollbar px-20 py-20">
                          {stripTemplates.map((tpl) => (
                              <div key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`cursor-pointer flex-shrink-0 flex flex-col items-center gap-4 transition-all duration-500 snap-center ${selectedTemplate.id === tpl.id ? 'opacity-100 z-10 drop-shadow-xl scale-110' : 'opacity-60 hover:opacity-100 scale-90'}`}>
                                  <div className="pointer-events-none border border-zinc-200 shadow-sm bg-white overflow-hidden">
                                       <AesthoStrip 
                                            template={tpl} 
                                            photos={selectedStripPhotos} 
                                            mode={selectedMode} 
                                            characterData={selectedCharacterData}
                                            scale={0.2} // Fits nicely in thumbnail
                                            shadow={false}
                                       />
                                  </div>
                                  <span className="font-modern text-[8px] uppercase text-center mt-2 tracking-widest text-zinc-500">{tpl.name}</span>
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
             {/* Header */}
             <div className="w-full p-6 flex justify-between items-center border-b border-zinc-200">
                  <div className="flex gap-4 items-center">
                    <span className="font-title text-3xl">Aestho.</span>
                    <span className="font-modern text-[10px] tracking-widest text-zinc-400">FINAL RESULT</span>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={handleToTemplateSelection} className="text-zinc-500 hover:text-black font-modern text-[10px]">BACK</button>
                      <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full text-xs font-mono hover:bg-zinc-800 tracking-wider">
                          <Download size={14}/> SAVE
                      </button>
                  </div>
              </div>

              {/* Main Content: Side-by-Side */}
              <div className="flex-1 flex flex-col md:flex-row w-full h-full justify-center items-center gap-16 p-8 overflow-y-auto bg-gray-50">
                  
                  {/* LEFT: STATIC RESULT */}
                  <div className="flex flex-col items-center gap-4">
                      <span className="font-modern text-[10px] tracking-[0.2em] text-zinc-400">STATIC RESULT</span>
                      <AesthoStrip 
                        template={selectedTemplate} 
                        photos={selectedStripPhotos} 
                        mode={selectedMode} 
                        characterData={selectedCharacterData} 
                        scale={0.25} 
                      />
                  </div>

                  {/* RIGHT: LIVE MOMENT (MOVING STRIP) */}
                  <div className="flex flex-col items-center gap-4">
                      <span className="font-modern text-[10px] tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                        LIVE MOMENT <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      </span>
                      <AesthoStrip 
                            template={selectedTemplate} 
                            photos={selectedStripPhotos} 
                            clips={capturedClips} 
                            mode={selectedMode} 
                            characterData={selectedCharacterData} 
                            scale={0.25}
                       />
                  </div>

              </div>
        </main>
      )}

    </div>
  );
};

export default App;
