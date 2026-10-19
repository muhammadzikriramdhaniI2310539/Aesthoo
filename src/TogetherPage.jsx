import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Users, Copy, Check, Loader2, Camera,
  Sun, Moon, Download, QrCode, Link2, Clock, RefreshCw, Globe
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import LanguageSlider from './LanguageSlider';

// ─────────────────────────────────────────────────────────
// KONSTANTA
// ─────────────────────────────────────────────────────────
const MAX_SHOTS    = 4;
const COUNTDOWN_S  = 3;
const RTC_CONFIG   = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

// ─────────────────────────────────────────────────────────
// HELPERS — ID GENERATION
// ─────────────────────────────────────────────────────────
const makeRoomId = () => {
  const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'ASTH-' + Array.from({ length: 4 }, () => ch[Math.floor(Math.random() * ch.length)]).join('');
};
const makePeerId = () => `p_${Math.random().toString(36).slice(2, 10)}`;

// ─────────────────────────────────────────────────────────
// HELPERS — CANVAS / STRIP
// ─────────────────────────────────────────────────────────

/** Gabungkan 2 video element menjadi 1 slot 510×383 (host kiri, guest kanan) */
const combineFrames = (leftEl, rightEl) => {
  const W = 510, H = 383, HALF = 255;
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  const drawHalf = (el, xOffset) => {
    if (!el || !el.videoWidth || el.videoWidth === 0) return;
    const vW = el.videoWidth, vH = el.videoHeight;
    const scale = Math.max(HALF / vW, H / vH);
    const dw = vW * scale, dh = vH * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(xOffset, 0, HALF, H);
    ctx.clip();
    ctx.drawImage(el, xOffset + (HALF - dw) / 2, (H - dh) / 2, dw, dh);
    ctx.restore();
  };

  drawHalf(leftEl,  0);    // host side
  drawHalf(rightEl, HALF); // guest side

  // Garis pemisah tipis
  ctx.strokeStyle = 'rgba(0,0,0,0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(HALF, 0);
  ctx.lineTo(HALF, H);
  ctx.stroke();

  return canvas.toDataURL('image/jpeg', 0.92);
};

/** Bangun strip 600×2000 dari array slot dataURL */
const buildStrip = (slots) =>
  new Promise(async (resolve) => {
    const W = 600, H = 2000;
    const SLOT_DEFS = [
      { x: 45, y: 60,   w: 510, h: 383 },
      { x: 45, y: 473,  w: 510, h: 383 },
      { x: 45, y: 886,  w: 510, h: 383 },
      { x: 45, y: 1299, w: 510, h: 383 },
    ];

    const canvas = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < Math.min(slots.length, 4); i++) {
      const img = await new Promise(res => {
        const im = new Image();
        im.onload  = () => res(im);
        im.onerror = () => res(null);
        im.src = slots[i];
      });
      if (img) ctx.drawImage(img, SLOT_DEFS[i].x, SLOT_DEFS[i].y, SLOT_DEFS[i].w, SLOT_DEFS[i].h);
    }

    // Footer branding
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.font      = 'italic 400 30px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('Aestho.', W / 2, H - 50);

    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.font      = '500 10px -apple-system, system-ui, sans-serif';
    ctx.fillText('TOGETHER', W / 2, H - 26);

    resolve(canvas.toDataURL('image/jpeg', 0.93));
  });

/** Upload ke Cloudinary (unsigned) — hanya jika env var tersedia */
const uploadToCloudinary = async (dataUrl) => {
  const cloud  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) return null;

  const fd = new FormData();
  fd.append('file',           dataUrl);
  fd.append('upload_preset',  preset);
  fd.append('folder',         'aestho-together');

  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: fd,
  });
  const json = await res.json();
  return json.secure_url || null;
};

// ─────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────
const TogetherPage = ({ supabase, initialRoomCode }) => {
  // ── Dark mode ────────────────────────────────────────
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const s = localStorage.getItem('aestho-theme');
    return s === 'dark' || (!s && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('aestho-theme', dark ? 'dark' : 'light');
  }, [dark]);

  // ── Page / session state ─────────────────────────────
  const [view,       setView]       = useState('setup'); // setup | waiting | session | result
  const [role,       setRole]       = useState(null);    // 'host' | 'guest'
  const [roomId,     setRoomId]     = useState(null);
  const [joinInput,  setJoinInput]  = useState(initialRoomCode || '');
  const [statusLabel,setStatusLabel]= useState('idle');  // idle | loading | error | connected | disconnected
  const [errorMsg,   setErrorMsg]   = useState('');
  const [peerConnected, setPeerConnected] = useState(false);

  // ── Capture state ─────────────────────────────────────
  const [capturedSlots, setCapturedSlots] = useState([]); // max 4 dataURLs
  const [countdown,     setCountdown]     = useState(0);
  const [isCapturing,   setIsCapturing]   = useState(false);

  // ── Result state ──────────────────────────────────────
  const [stripUrl,   setStripUrl]   = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [qrUrl,      setQrUrl]      = useState('');
  const [isUploading,setIsUploading]= useState(false);
  const [copied,     setCopied]     = useState(false);
  const [copiedRoom, setCopiedRoom] = useState(false);

  // ── Refs ─────────────────────────────────────────────
  const localVideoRef     = useRef(null);
  const remoteVideoRef    = useRef(null);
  const localStreamRef    = useRef(null);
  const pcRef             = useRef(null);
  const peerIdRef         = useRef(makePeerId());
  const channelRef        = useRef(null);
  const pendingIceRef     = useRef([]);
  const hasRemoteDescRef  = useRef(false);
  const roomIdRef         = useRef(null);
  const roleRef           = useRef(null);
  const capturedSlotsRef  = useRef([]);
  const isCapturingRef    = useRef(false);
  const countdownTimerRef = useRef(null);
  const signalHandlerRef  = useRef(null); // stale-closure-safe handler

  // Sinkronkan ref dengan state
  useEffect(() => { roomIdRef.current   = roomId;        }, [roomId]);
  useEffect(() => { roleRef.current     = role;          }, [role]);
  useEffect(() => { capturedSlotsRef.current = capturedSlots; }, [capturedSlots]);
  useEffect(() => { isCapturingRef.current   = isCapturing;   }, [isCapturing]);

  // Pasang stream ke <video> saat view berubah ke session
  useEffect(() => {
    if (view === 'session' && localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [view]);

  // ─────────────────────────────────────────────────────
  // CORE FUNCTIONS
  // ─────────────────────────────────────────────────────

  /** Init kamera lokal */
  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch {
      setErrorMsg('Kamera tidak dapat diakses. Periksa izin browser kamu.');
      setStatusLabel('error');
      return null;
    }
  }, []);

  /** Kirim signal Supabase */
  const sendSignal = useCallback(async (rId, type, payload) => {
    if (!supabase || !rId) return;
    await supabase.from('aestho_together_signals').insert({
      room_id:   rId,
      from_peer: peerIdRef.current,
      type,
      payload,
    });
  }, [supabase]);

  /** Buat RTCPeerConnection baru */
  const createPC = useCallback((stream, rId) => {
    if (pcRef.current) { pcRef.current.close(); }
    hasRemoteDescRef.current = false;
    pendingIceRef.current    = [];

    const pc = new RTCPeerConnection(RTC_CONFIG);
    stream.getTracks().forEach(t => pc.addTrack(t, stream));

    pc.ontrack = (evt) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = evt.streams[0];
      setPeerConnected(true);
      setStatusLabel('connected');
    };

    pc.onicecandidate = (evt) => {
      if (evt.candidate) sendSignal(rId, 'ice-candidate', evt.candidate.toJSON());
    };

    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        setPeerConnected(false);
        setStatusLabel('disconnected');
      }
    };

    pcRef.current = pc;
    return pc;
  }, [sendSignal]);

  /** Lakukan capture & gabungkan frame */
  const doCapture = useCallback(() => {
    const isHostRole  = roleRef.current === 'host';
    // Host: local(kiri) + remote(kanan)
    // Guest: remote(kiri/host) + local(kanan/guest) → hasil strip selalu host kiri, guest kanan
    const leftEl  = isHostRole ? localVideoRef.current  : remoteVideoRef.current;
    const rightEl = isHostRole ? remoteVideoRef.current : localVideoRef.current;

    const dataUrl  = combineFrames(leftEl, rightEl);
    const newSlots = [...capturedSlotsRef.current, dataUrl];
    capturedSlotsRef.current = newSlots;
    setCapturedSlots(newSlots);
    setIsCapturing(false);
    setCountdown(0);

    if (newSlots.length >= MAX_SHOTS) {
      setIsBuilding(true);
      buildStrip(newSlots).then(url => {
        setStripUrl(url);
        setIsBuilding(false);
        setView('result');
      });
    }
  }, []);

  /** Mulai countdown dari timestamp captureAt (ms) */
  const startCountdown = useCallback((captureAt) => {
    if (isCapturingRef.current) return;
    setIsCapturing(true);
    isCapturingRef.current = true;

    const tick = () => {
      const rem = captureAt - Date.now();
      if (rem <= 0) {
        setCountdown(0);
        doCapture();
        return;
      }
      setCountdown(Math.ceil(rem / 1000));
      countdownTimerRef.current = setTimeout(tick, 80);
    };
    tick();
  }, [doCapture]);

  // ─── Signal Handler (ref pattern: selalu fresh setiap render) ───
  signalHandlerRef.current = async (signal) => {
    const { type, payload } = signal;
    const rId    = roomIdRef.current || signal.room_id;
    const stream = localStreamRef.current;

    if (type === 'guest-ready') {
      // Host: guest sudah siap → buat offer WebRTC
      setPeerConnected(false);
      setStatusLabel('loading');
      setView('session');
      if (!stream) return;
      const pc    = createPC(stream, rId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal(rId, 'offer', { sdp: offer.sdp, type: offer.type });

    } else if (type === 'offer') {
      // Guest: terima offer → buat answer
      if (!stream) return;
      const pc = createPC(stream, rId);
      await pc.setRemoteDescription(new RTCSessionDescription(payload));
      hasRemoteDescRef.current = true;
      for (const c of pendingIceRef.current) {
        try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
      }
      pendingIceRef.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal(rId, 'answer', { sdp: answer.sdp, type: answer.type });

    } else if (type === 'answer') {
      // Host: terima answer
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload));
      hasRemoteDescRef.current = true;
      for (const c of pendingIceRef.current) {
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(c)); } catch {}
      }
      pendingIceRef.current = [];

    } else if (type === 'ice-candidate') {
      if (pcRef.current && hasRemoteDescRef.current) {
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(payload)); } catch {}
      } else {
        pendingIceRef.current.push(payload);
      }

    } else if (type === 'capture-trigger') {
      // Guest: sync countdown dengan host
      startCountdown(payload.captureAt);

    } else if (type === 'room-closed') {
      setStatusLabel('disconnected');
      setErrorMsg('Room telah ditutup oleh host.');
    }
  };

  /** Subscribe ke Supabase Realtime signals */
  const subscribeToSignals = useCallback((rId) => {
    if (!supabase) return;
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const ch = supabase
      .channel(`tg_${rId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'aestho_together_signals',
        filter: `room_id=eq.${rId}`,
      }, ({ new: sig }) => {
        if (sig.from_peer === peerIdRef.current) return; // abaikan milik sendiri
        signalHandlerRef.current?.(sig);
      })
      .subscribe();

    channelRef.current = ch;
  }, [supabase]);

  /** Cleanup semua resource */
  const cleanup = useCallback(() => {
    clearTimeout(countdownTimerRef.current);
    if (channelRef.current) {
      supabase?.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
  }, [supabase]);

  useEffect(() => () => cleanup(), [cleanup]);

  // ─────────────────────────────────────────────────────
  // ACTION HANDLERS
  // ─────────────────────────────────────────────────────

  /** HOST — Buat room baru */
  const handleCreateRoom = async () => {
    if (!supabase) {
      setErrorMsg('Supabase belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.');
      return;
    }
    setStatusLabel('loading');
    setErrorMsg('');

    const newId = makeRoomId();
    const { error } = await supabase.from('aestho_together_rooms').insert({
      id:        newId,
      host_id:   peerIdRef.current,
      status:    'waiting',
      layout_id: 'classic-white',
    });

    if (error) {
      setErrorMsg('Gagal membuat room. Pastikan tabel aestho_together_rooms sudah dibuat.');
      setStatusLabel('error');
      return;
    }

    setRoomId(newId);
    setRole('host');
    subscribeToSignals(newId);

    const stream = await initCamera();
    if (!stream) return;

    setStatusLabel('idle');
    setView('waiting');
  };

  /** GUEST — Join room dengan kode */
  const handleJoinRoom = async () => {
    if (!supabase) {
      setErrorMsg('Supabase belum dikonfigurasi.');
      return;
    }
    const code = joinInput.toUpperCase().replace(/\s/g, '');
    if (!code.startsWith('ASTH-') || code.length !== 9) {
      setErrorMsg('Format kode tidak valid. Contoh: ASTH-7K29');
      return;
    }
    setStatusLabel('loading');
    setErrorMsg('');

    const { data, error } = await supabase
      .from('aestho_together_rooms')
      .select('*')
      .eq('id', code)
      .single();

    if (error || !data) {
      setErrorMsg('Room tidak ditemukan. Periksa kode kamu.');
      setStatusLabel('error');
      return;
    }
    if (data.status === 'closed') {
      setErrorMsg('Room sudah ditutup.');
      setStatusLabel('error');
      return;
    }
    if (data.guest_id) {
      setErrorMsg('Room sudah penuh (2/2 peserta).');
      setStatusLabel('error');
      return;
    }

    const { error: upErr } = await supabase
      .from('aestho_together_rooms')
      .update({ guest_id: peerIdRef.current, status: 'active' })
      .eq('id', code);

    if (upErr) {
      setErrorMsg('Gagal bergabung. Coba lagi.');
      setStatusLabel('error');
      return;
    }

    setRoomId(code);
    setRole('guest');
    subscribeToSignals(code);

    const stream = await initCamera();
    if (!stream) return;

    // Beritahu host bahwa guest sudah siap
    await sendSignal(code, 'guest-ready', { guestId: peerIdRef.current });
    setView('session');
    setStatusLabel('idle');
  };

  /** HOST — Trigger capture + countdown tersinkron */
  const handleCapture = useCallback(async () => {
    if (isCapturingRef.current || capturedSlotsRef.current.length >= MAX_SHOTS) return;
    const captureAt = Date.now() + COUNTDOWN_S * 1000 + 300; // +300ms buffer
    // Kirim ke guest agar countdown sinkron
    await sendSignal(roomIdRef.current, 'capture-trigger', { captureAt });
    // Host mulai countdown yang sama
    startCountdown(captureAt);
  }, [sendSignal, startCountdown]);

  /** Download strip sebagai JPG */
  const handleDownload = useCallback(() => {
    if (!stripUrl) return;
    const a = document.createElement('a');
    a.href     = stripUrl;
    a.download = `Aestho-Together-${roomId || 'strip'}.jpg`;
    a.click();
  }, [stripUrl, roomId]);

  /** Upload ke Cloudinary → simpan ke Supabase → generate QR */
  const handleGenerateQR = useCallback(async () => {
    if (!stripUrl || isUploading) return;
    setIsUploading(true);
    setErrorMsg('');

    try {
      const photoUrl = await uploadToCloudinary(stripUrl);
      if (!photoUrl) {
        setErrorMsg('Cloudinary belum dikonfigurasi (VITE_CLOUDINARY_CLOUD_NAME / UPLOAD_PRESET). Gunakan download JPG saja.');
        setIsUploading(false);
        return;
      }

      if (supabase) {
        const { data: saved } = await supabase
          .from('aestho_results')
          .insert({ photo_url: photoUrl, layout_id: 'classic-white', template_name: 'Aestho Together' })
          .select('id')
          .single();

        if (saved?.id) {
          setQrUrl(`${window.location.origin}/id/summary/${saved.id}`);
        }
      }
    } catch {
      setErrorMsg('Gagal membuat QR. Gunakan download JPG saja.');
    }
    setIsUploading(false);
  }, [stripUrl, isUploading, supabase]);

  /** Salin link room ke clipboard */
  const handleCopyRoom = useCallback(async () => {
    const rId = roomIdRef.current || joinInput;
    if (!rId) return;
    await navigator.clipboard.writeText(`${window.location.origin}/together/${rId}`);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  }, [joinInput]);

  /** Host menutup room */
  const handleCloseRoom = useCallback(async () => {
    const rId = roomIdRef.current;
    if (rId && supabase) {
      await sendSignal(rId, 'room-closed', {});
      await supabase.from('aestho_together_rooms').update({ status: 'closed' }).eq('id', rId);
    }
    cleanup();
    window.location.href = '/';
  }, [supabase, sendSignal, cleanup]);

  // ─────────────────────────────────────────────────────
  // UI HELPERS
  // ─────────────────────────────────────────────────────
  const DarkBtn = () => (
    <button
      onClick={() => setDark(d => !d)}
      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors shadow-sm flex items-center justify-center"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );

  const HeaderControls = () => (
    <div className="flex items-center gap-2">
      <LanguageSlider />
      <DarkBtn />
    </div>
  );

  const BackPill = ({ href = '/', label = 'Kembali' }) => (
    <a
      href={href}
      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all shadow-sm"
    >
      <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
      <span>{label}</span>
    </a>
  );

  const errBox = errorMsg ? (
    <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs text-center">
      {errorMsg}
    </div>
  ) : null;

  // ═══════════════════════════════════════════════════
  // VIEW: SETUP
  // ═══════════════════════════════════════════════════
  if (view === 'setup') {
    return (
      <div className={dark ? 'dark' : ''}>
        <main className="min-h-[100dvh] bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white flex flex-col items-center justify-center px-4 py-10 relative font-sans transition-colors duration-500 selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black">
          {/* Ambient glow */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-violet-100/30 dark:bg-violet-500/5 blur-3xl rounded-full -translate-x-16 -translate-y-16 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/30 dark:bg-blue-500/5 blur-3xl rounded-full translate-x-16 translate-y-16 pointer-events-none" />

          <div className="absolute top-5 left-5 sm:top-6 sm:left-6"><BackPill href="/" label="Studio" /></div>
          <div className="absolute top-5 right-5 sm:top-6 sm:right-6"><HeaderControls /></div>

          <div className="relative z-10 w-full max-w-sm">
            {/* Hero text */}
            <div className="text-center mb-8">
              <p className="font-modern text-[9px] tracking-[0.35em] text-zinc-400 dark:text-zinc-500 uppercase mb-3 flex items-center justify-center gap-1.5">
                <Globe size={10} />
                Aestho Together
              </p>
              <h1 className="font-title text-5xl sm:text-6xl text-zinc-900 dark:text-white leading-none mb-2">
                Together.
              </h1>
              <p className="font-serif text-sm italic text-zinc-400 dark:text-zinc-500">
                Capture moments, even miles apart.
              </p>
            </div>

            {errBox}

            {/* Card: Buat Room */}
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-zinc-200/70 dark:border-zinc-800 shadow-xl p-6 mb-3">
              <h2 className="font-modern text-[10px] tracking-[0.22em] uppercase font-bold text-zinc-800 dark:text-zinc-100 mb-1">
                Buat Room Baru
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
                Kamu jadi host dan kirim link ke temanmu.
              </p>
              <button
                onClick={handleCreateRoom}
                disabled={statusLabel === 'loading'}
                className="w-full py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-modern text-[10px] tracking-[0.22em] uppercase font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
              >
                {statusLabel === 'loading'
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Camera size={13} />}
                Buat Room
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-3">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <span className="font-mono text-[10px] text-zinc-400">atau</span>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Card: Join Room */}
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-zinc-200/70 dark:border-zinc-800 shadow-xl p-6">
              <h2 className="font-modern text-[10px] tracking-[0.22em] uppercase font-bold text-zinc-800 dark:text-zinc-100 mb-1">
                Masuk Room
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
                Tempel kode atau link dari temanmu.
              </p>
              <input
                type="text"
                placeholder="ASTH-XXXX"
                value={joinInput}
                onChange={e => setJoinInput(e.target.value.toUpperCase().slice(0, 9))}
                onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm font-mono text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white mb-3 transition-all text-center tracking-[0.35em]"
              />
              <button
                onClick={handleJoinRoom}
                disabled={statusLabel === 'loading' || joinInput.length < 4}
                className="w-full py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-modern text-[10px] tracking-[0.22em] uppercase font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {statusLabel === 'loading'
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Users size={13} />}
                Bergabung
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // VIEW: WAITING (Host menunggu guest)
  // ═══════════════════════════════════════════════════
  if (view === 'waiting') {
    return (
      <div className={dark ? 'dark' : ''}>
        <main className="min-h-[100dvh] bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white flex flex-col items-center justify-center px-4 py-10 relative font-sans transition-colors duration-500">
          <div className="absolute top-0 left-0 w-72 h-72 bg-violet-100/20 dark:bg-violet-500/5 blur-3xl rounded-full -translate-x-16 -translate-y-16 pointer-events-none" />
          <div className="absolute top-5 left-5 sm:top-6 sm:left-6">
            <button
              onClick={handleCloseRoom}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Batalkan
            </button>
          </div>
          <div className="absolute top-5 right-5 sm:top-6 sm:right-6"><HeaderControls /></div>

          <div className="relative z-10 w-full max-w-sm text-center">
            <h1 className="font-title text-4xl sm:text-5xl text-zinc-900 dark:text-white mb-2">
              Aestho Together.
            </h1>
            <p className="font-serif text-sm italic text-zinc-400 dark:text-zinc-500 mb-8">
              Menunggu temanmu bergabung...
            </p>

            {/* Room code card */}
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-zinc-200/70 dark:border-zinc-800 shadow-xl p-7 mb-5">
              <p className="font-modern text-[9px] tracking-[0.28em] uppercase text-zinc-400 dark:text-zinc-500 mb-3">
                Kode Room Kamu
              </p>
              <div className="font-mono text-[2rem] sm:text-[2.4rem] tracking-[0.3em] text-zinc-900 dark:text-white font-bold mb-5">
                {roomId}
              </div>

              <button
                onClick={handleCopyRoom}
                className="w-full py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-mono flex items-center justify-center gap-2 transition-all text-zinc-600 dark:text-zinc-300"
              >
                {copiedRoom
                  ? <><Check size={13} className="text-emerald-500" /> Link tersalin!</>
                  : <><Link2 size={13} /> Salin Link Undangan</>}
              </button>
            </div>

            {/* Spinner waiting */}
            <div className="flex items-center justify-center gap-2.5 text-zinc-400 dark:text-zinc-500 mb-2">
              <Loader2 size={15} className="animate-spin" />
              <span className="text-xs font-mono">Menunggu peserta...</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-300 dark:text-zinc-700">
              Bagikan kode atau link di atas ke temanmu.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // VIEW: SESSION (Kamera live + capture)
  // ═══════════════════════════════════════════════════
  if (view === 'session') {
    const isHostRole  = role === 'host';
    const shotsDone   = capturedSlots.length;
    const canCapture  = isHostRole && peerConnected && !isCapturing && shotsDone < MAX_SHOTS;
    const displayRoom = roomId || joinInput;

    return (
      <div className={dark ? 'dark' : ''}>
        <main className="min-h-[100dvh] bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white flex flex-col font-sans transition-colors duration-500">

          {/* ── Header ── */}
          <header className="w-full px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-30 gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCloseRoom}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-all shadow-sm"
                title="Keluar dari sesi"
              >
                <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Keluar</span>
              </button>
              <div className="flex flex-col">
                <span className="font-title text-xl sm:text-2xl text-zinc-900 dark:text-white leading-none">
                  Aestho Together.
                </span>
                <span className="font-serif text-[11px] italic text-zinc-400 dark:text-zinc-500 hidden sm:block">
                  Capture moments, even miles apart.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {peerConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-mono">
                  <Loader2 size={10} className="animate-spin" />
                  {role === 'host' ? 'Waiting...' : 'Connecting...'}
                </span>
              )}
              <HeaderControls />
            </div>
          </header>

          {/* ── Kamera ── */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 gap-4">
            <div className="w-full max-w-2xl grid grid-cols-2 gap-3 sm:gap-4">
              {/* You */}
              <div className="flex flex-col gap-2">
                <span className="font-modern text-[9px] sm:text-[10px] tracking-[0.22em] uppercase text-center text-zinc-400 dark:text-zinc-500">
                  You {isHostRole ? '· Host' : ''}
                </span>
                <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Countdown overlay */}
                  {countdown > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-black/40 rounded-2xl">
                      <span className="font-title text-6xl sm:text-8xl text-white drop-shadow-xl animate-pulse select-none">
                        {countdown}
                      </span>
                    </div>
                  )}
                  {countdown === 0 && isCapturing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-white/20 rounded-2xl animate-ping-once" />
                  )}
                </div>
              </div>

              {/* Your Friend */}
              <div className="flex flex-col gap-2">
                <span className="font-modern text-[9px] sm:text-[10px] tracking-[0.22em] uppercase text-center text-zinc-400 dark:text-zinc-500">
                  Your Friend {!isHostRole ? '· Host' : ''}
                </span>
                <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center justify-center">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!peerConnected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-300 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900">
                      <Users size={26} strokeWidth={1.5} />
                      <span className="text-[10px] font-mono">
                        {role === 'host' ? 'Menunggu teman...' : 'Menyambungkan...'}
                      </span>
                    </div>
                  )}
                  {countdown > 0 && peerConnected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-black/40 rounded-2xl">
                      <span className="font-title text-6xl sm:text-8xl text-white drop-shadow-xl animate-pulse select-none">
                        {countdown}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shot thumbnails */}
            {(capturedSlots.length > 0 || true) && (
              <div className="flex gap-2 justify-center flex-wrap">
                {capturedSlots.map((slot, i) => (
                  <img
                    key={i}
                    src={slot}
                    alt={`Shot ${i + 1}`}
                    className="h-10 w-[54px] sm:h-12 sm:w-16 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm"
                  />
                ))}
                {Array.from({ length: MAX_SHOTS - capturedSlots.length }).map((_, i) => (
                  <div
                    key={`e-${i}`}
                    className="h-10 w-[54px] sm:h-12 sm:w-16 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-300 dark:text-zinc-700 text-[9px] font-mono"
                  >
                    {capturedSlots.length + i + 1}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Bottom bar ── */}
          <div className="border-t border-zinc-100 dark:border-zinc-900 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md px-4 py-4 shrink-0">
            {/* Room code */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <Link2 size={11} className="text-zinc-400" />
              <span className="font-mono text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 tracking-wider">
                Room: {displayRoom}
              </span>
              <button
                onClick={handleCopyRoom}
                className="p-1 hover:text-black dark:hover:text-white text-zinc-400 transition-colors"
                title="Salin link"
              >
                {copiedRoom
                  ? <Check size={12} className="text-emerald-500" />
                  : <Copy size={12} />}
              </button>
            </div>

            {/* Capture / Status */}
            {isHostRole ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleCapture}
                  disabled={!canCapture}
                  className={`h-13 px-10 py-3.5 rounded-full font-modern text-[11px] tracking-[0.22em] uppercase font-bold flex items-center gap-3 transition-all active:scale-95 shadow-md select-none ${
                    canCapture
                      ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 cursor-pointer'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {isCapturing ? (
                    <><Clock size={15} />{countdown > 0 ? `${countdown}` : 'Smile!'}</>
                  ) : (
                    <><Camera size={15} />
                      {shotsDone < MAX_SHOTS
                        ? `Capture  ${shotsDone}/${MAX_SHOTS}`
                        : 'Semua foto diambil ✓'}
                    </>
                  )}
                </button>
                <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                  {peerConnected
                    ? 'Klik untuk mengambil foto bersama'
                    : 'Menunggu teman tersambung...'}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                  {isCapturing
                    ? (countdown > 0 ? `Siap-siap... ${countdown} 📸` : 'Smile!')
                    : `Host akan memulai foto (${shotsDone}/${MAX_SHOTS})`}
                </p>
              </div>
            )}
          </div>

          {/* Building overlay */}
          {isBuilding && (
            <div className="fixed inset-0 bg-white/85 dark:bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-4">
              <Loader2 size={30} className="animate-spin text-zinc-500" />
              <p className="font-modern text-[11px] tracking-[0.28em] uppercase text-zinc-500">
                Building your strip...
              </p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // VIEW: RESULT
  // ═══════════════════════════════════════════════════
  if (view === 'result') {
    return (
      <div className={dark ? 'dark' : ''}>
        <main className="min-h-[100dvh] bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white font-sans transition-colors duration-500 overflow-y-auto">
          <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20"><HeaderControls /></div>

          <div className="w-full max-w-4xl mx-auto px-4 pt-8 pb-16">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <button
                onClick={() => { cleanup(); window.location.href = '/'; }}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-all shadow-sm"
              >
                <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                Studio
              </button>
              <span className="font-title text-2xl text-zinc-900 dark:text-white">
                Aestho Together.
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Done
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Strip preview */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3 mx-auto md:mx-0">
                <span className="font-modern text-[10px] tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-500">
                  Your Together Strip
                </span>
                {stripUrl ? (
                  <img
                    src={stripUrl}
                    alt="Together Strip"
                    className="w-[160px] sm:w-[200px] shadow-2xl rounded-sm border border-zinc-200/60 dark:border-zinc-800"
                  />
                ) : (
                  <div className="w-[160px] h-[536px] bg-zinc-100 dark:bg-zinc-900 rounded-sm flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-zinc-400" />
                  </div>
                )}
              </div>

              {/* Action panel */}
              <div className="flex-1 w-full max-w-sm mx-auto md:mx-0">
                <div className="bg-white/85 dark:bg-zinc-900/65 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-zinc-800 shadow-xl p-6 sm:p-7 flex flex-col gap-4">
                  <div>
                    <h2 className="font-title text-3xl sm:text-4xl text-zinc-900 dark:text-white mb-1">
                      Masterpiece!
                    </h2>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      Foto bersama {roomId} sudah siap.
                    </p>
                  </div>

                  {/* Download JPG */}
                  <button
                    onClick={handleDownload}
                    disabled={!stripUrl}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-modern text-[10px] tracking-[0.2em] uppercase font-bold hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-40"
                  >
                    <Download size={14} />
                    Download JPG
                  </button>

                  {/* QR / Upload */}
                  {!qrUrl ? (
                    <button
                      onClick={handleGenerateQR}
                      disabled={!stripUrl || isUploading}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white font-modern text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all disabled:opacity-40"
                    >
                      {isUploading
                        ? <><Loader2 size={14} className="animate-spin" /> Mengunggah...</>
                        : <><QrCode size={14} /> Buat QR &amp; Link</>}
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-2">
                      <QRCodeSVG value={qrUrl} size={160} bgColor="#ffffff" fgColor="#000000" level="M" />
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(qrUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-[10px] font-mono text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        {copied
                          ? <><Check size={11} className="text-emerald-500" /> Tersalin!</>
                          : <><Copy size={11} /> Salin Link</>}
                      </button>
                    </div>
                  )}

                  {errorMsg && (
                    <p className="text-[11px] text-red-400 text-center leading-relaxed">{errorMsg}</p>
                  )}

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <a
                      href="/"
                      className="w-full flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-400 hover:text-black dark:hover:text-white transition-colors py-1"
                    >
                      <RefreshCw size={11} />
                      Sesi Baru
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default TogetherPage;
