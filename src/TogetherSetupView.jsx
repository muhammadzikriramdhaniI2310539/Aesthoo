// src/TogetherSetupView.jsx
import React, { useState } from 'react';
import { Camera, Users, ArrowLeft, Copy, Check, Loader2, Globe, Sparkles, Sun, Moon } from 'lucide-react';
import LanguageSlider from './LanguageSlider';
import { createTogetherRoom, joinTogetherRoom } from './services/togetherRTC';

const TogetherSetupView = ({
  supabase,
  peerId,
  selectedLayout = 'classic-white',
  initialRoomCode = '',
  onBack,
  onConnected,
  showToast,
  isDarkMode,
  toggleDarkMode,
  t,
}) => {
  const [tab, setTab] = useState(initialRoomCode ? 'join' : 'create');
  const [createdRoomId, setCreatedRoomId] = useState('');
  const [joinCode, setJoinCode] = useState(initialRoomCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!supabase) {
      showToast?.('Supabase belum terhubung. Cek konfigurasi env.');
      return;
    }
    setIsLoading(true);
    try {
      const roomId = await createTogetherRoom(supabase, peerId, selectedLayout);
      setCreatedRoomId(roomId);
      showToast?.(`Room ${roomId} berhasil dibuat!`);
    } catch (err) {
      console.error(err);
      showToast?.('Gagal membuat room. Pastikan tabel Supabase sudah siap.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdRoomId) return;
    const url = `${window.location.origin}/together/${createdRoomId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast?.('Link room disalin ke clipboard!');
    } catch {
      showToast?.('Gagal menyalin link.');
    }
  };

  const handleEnterAsHost = () => {
    if (!createdRoomId) return;
    onConnected({ roomId: createdRoomId, role: 'host', layoutId: selectedLayout });
  };

  const handleJoin = async () => {
    const clean = joinCode.trim().toUpperCase();
    if (!clean) {
      showToast?.('Masukkan kode room terlebih dahulu.');
      return;
    }
    if (!supabase) {
      showToast?.('Supabase belum terhubung.');
      return;
    }
    setIsLoading(true);
    try {
      const room = await joinTogetherRoom(supabase, clean, peerId);
      showToast?.(`Berhasil bergabung ke room ${clean}!`);
      onConnected({ roomId: clean, role: 'guest', layoutId: room?.layout_id || 'classic-white' });
    } catch (err) {
      console.error(err);
      showToast?.(err.message || 'Gagal masuk ke room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="animate-view-enter relative z-30 flex flex-col items-center justify-center min-h-[100dvh] w-full px-4 py-8 bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-500 font-sans">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-violet-100/30 dark:bg-violet-500/5 blur-3xl rounded-full -translate-x-20 -translate-y-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 dark:bg-blue-500/5 blur-3xl rounded-full translate-x-20 translate-y-20 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-40 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0"
          title="Kembali"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="font-title text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-none select-none">
          Aestho.
        </span>
      </div>

      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-40 flex items-center gap-2">
        <LanguageSlider />
        <button
          onClick={toggleDarkMode}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all shadow-sm flex items-center justify-center"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Main Content Box */}
      <div className="relative z-10 w-full max-w-md bg-white/85 dark:bg-zinc-900/75 backdrop-blur-2xl rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 flex flex-col items-center">
        <h1 className="font-title text-3xl sm:text-4xl text-zinc-900 dark:text-white text-center mb-1">
          Foto Bersama Online
        </h1>
        <p className="font-serif text-xs italic text-zinc-500 dark:text-zinc-400 text-center mb-6">
          Capture moments, even miles apart.
        </p>

        {/* Tab Switcher */}
        <div className="w-full grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`py-2 text-[10px] font-modern font-bold tracking-wider uppercase rounded-xl transition-all ${
              tab === 'create'
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Buat Room (Host)
          </button>
          <button
            type="button"
            onClick={() => setTab('join')}
            className={`py-2 text-[10px] font-modern font-bold tracking-wider uppercase rounded-xl transition-all ${
              tab === 'join'
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Gabung Room (Teman)
          </button>
        </div>

        {/* Tab 1: Buat Room */}
        {tab === 'create' && (
          <div className="w-full flex flex-col items-center">
            {!createdRoomId ? (
              <div className="w-full text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
                  Kamu akan menjadi Host. Buat room dan bagikan link undangan ke temanmu untuk foto berdua secara langsung.
                </p>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-modern text-[10px] tracking-[0.2em] uppercase font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  <span>Buat Room Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center text-center">
                <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
                  Kode Room Kamu
                </span>
                <div className="font-mono text-3xl font-bold tracking-[0.25em] text-zinc-900 dark:text-white mb-4 bg-zinc-50 dark:bg-zinc-950 px-6 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 select-all">
                  {createdRoomId}
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-mono flex items-center justify-center gap-1.5 transition-all text-zinc-700 dark:text-zinc-300"
                  >
                    {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEnterAsHost}
                    className="w-full py-2.5 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-modern text-[10px] font-bold tracking-wider uppercase hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Masuk Kamera →</span>
                  </button>
                </div>

                <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
                  Bagikan link ke temanmu. Teman bisa langsung membuka link untuk bergabung di sebelah kanan layarmu.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Gabung Room */}
        {tab === 'join' && (
          <div className="w-full flex flex-col items-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-4 leading-relaxed">
              Masukkan kode room dari temanmu untuk langsung bergabung ke sesi kamera berdua.
            </p>

            <input
              type="text"
              placeholder="ASTH-XXXX"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 9))}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-base font-mono text-center tracking-[0.3em] font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white mb-4"
            />

            <button
              type="button"
              onClick={handleJoin}
              disabled={isLoading || !joinCode.trim()}
              className="w-full py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-modern text-[10px] tracking-[0.2em] uppercase font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-40"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
              <span>Bergabung ke Sesi</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default TogetherSetupView;
