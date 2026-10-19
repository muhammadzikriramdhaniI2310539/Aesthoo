import React, { useState } from 'react';
import { Copy, Check, X, Database } from 'lucide-react';

export const SQL_SCHEMA_SCRIPT = `-- ==============================================================================
-- SKEMA SUPABASE AMAN DENGAN SUPABASE AUTH & ROW LEVEL SECURITY (RLS) - AESTHO
-- ==============================================================================

-- 1. TABEL FRAMES
CREATE TABLE IF NOT EXISTS public.aestho_frames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    category TEXT DEFAULT 'aestho', -- 'aestho', 'genshin', 'custom'
    layout_id TEXT DEFAULT 'classic-white', -- 'classic-white', 'grid-4r'
    overlay_url TEXT NOT NULL,
    bg_color TEXT DEFAULT '#ffffff',
    photo_radius TEXT DEFAULT 'rounded-xl',
    hide_footer BOOLEAN DEFAULT true,
    artist_credit TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true
);

-- 2. TABEL CHARACTERS
CREATE TABLE IF NOT EXISTS public.aestho_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    series TEXT NOT NULL, -- 'Genshin Impact', 'Honkai: Star Rail', dll
    position TEXT DEFAULT 'right', -- 'left' atau 'right'
    default_width TEXT DEFAULT 'w-[60%]',
    default_height INT DEFAULT 100,
    x_offset INT DEFAULT 0,
    y_offset INT DEFAULT 0,
    artist_credit TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true
);

-- 3. TABEL CHARACTER POSES (Multi-pose 1-4)
CREATE TABLE IF NOT EXISTS public.aestho_character_poses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    character_id UUID REFERENCES public.aestho_characters(id) ON DELETE CASCADE,
    pose_index INT NOT NULL, -- 0, 1, 2, 3
    image_url TEXT NOT NULL,
    width_percent INT DEFAULT 60,
    height_percent INT DEFAULT 100,
    x_offset INT DEFAULT 0,
    y_offset INT DEFAULT 0
);

-- 4. AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.aestho_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aestho_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aestho_character_poses ENABLE ROW LEVEL SECURITY;

-- 5. HAPUS POLICY ANON MANAGE YANG RENTAN/BERBAHAYA (CLEANUP)
DROP POLICY IF EXISTS "Allow anon manage frames" ON public.aestho_frames;
DROP POLICY IF EXISTS "Allow anon manage characters" ON public.aestho_characters;
DROP POLICY IF EXISTS "Allow anon manage character poses" ON public.aestho_character_poses;
DROP POLICY IF EXISTS "Allow public read active frames" ON public.aestho_frames;
DROP POLICY IF EXISTS "Allow public read frames" ON public.aestho_frames;
DROP POLICY IF EXISTS "Allow authenticated manage frames" ON public.aestho_frames;
DROP POLICY IF EXISTS "Allow public read active characters" ON public.aestho_characters;
DROP POLICY IF EXISTS "Allow public read characters" ON public.aestho_characters;
DROP POLICY IF EXISTS "Allow authenticated manage characters" ON public.aestho_characters;
DROP POLICY IF EXISTS "Allow public read character poses" ON public.aestho_character_poses;
DROP POLICY IF EXISTS "Allow authenticated manage character poses" ON public.aestho_character_poses;

-- 6. PUBLIC READ POLICY (Aman: Publik/Anon hanya bisa membaca frame & karakter)
CREATE POLICY "Allow public read frames" 
ON public.aestho_frames FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public read characters" 
ON public.aestho_characters FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public read character poses" 
ON public.aestho_character_poses FOR SELECT 
TO anon, authenticated 
USING (true);

-- 7. ADMIN-ONLY WRITE POLICY (HANYA user terotentikasi Supabase Auth yang dapat INSERT, UPDATE, DELETE)
CREATE POLICY "Allow authenticated manage frames" 
ON public.aestho_frames FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated manage characters" 
ON public.aestho_characters FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated manage character poses" 
ON public.aestho_character_poses FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 8. PENGATURAN KEAMANAN TABEL HASIL (AESTHO_RESULTS)
ALTER TABLE IF EXISTS public.aestho_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read results" ON public.aestho_results;
CREATE POLICY "Allow public read results"
ON public.aestho_results FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow public insert results" ON public.aestho_results;
CREATE POLICY "Allow public insert results"
ON public.aestho_results FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated manage results" ON public.aestho_results;
CREATE POLICY "Allow authenticated manage results"
ON public.aestho_results FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
`;

const SqlSchemaModal = ({ isOpen, onClose, onShowToast }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
      setCopied(true);
      if (onShowToast) onShowToast('Script SQL berhasil disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (onShowToast) onShowToast('Gagal menyalin script SQL.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Skema SQL Supabase
              </h3>
              <p className="text-[11px] text-zinc-400">
                Jalankan script ini di SQL Editor pada Supabase dashboard kamu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Code View */}
        <div className="flex-1 overflow-y-auto my-4 rounded-xl bg-zinc-950 p-4 border border-zinc-800 text-zinc-200 font-mono text-[11px] leading-relaxed select-text">
          <pre>{SQL_SCHEMA_SCRIPT}</pre>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <span className="text-[11px] text-zinc-400">
            Tabel: <code className="text-emerald-500">aestho_frames</code>, <code className="text-emerald-500">aestho_characters</code>, <code className="text-emerald-500">aestho_character_poses</code>
          </span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-mono font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin Script SQL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SqlSchemaModal;
