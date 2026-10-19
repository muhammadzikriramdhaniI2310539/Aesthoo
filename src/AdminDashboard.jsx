import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Unlock,
  LogOut,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  Film,
  Image as ImageIcon,
  Clock,
  Trophy,
  X,
  Sun,
  Moon,
  ArrowLeft,
  AlertCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Layers,
  Layout,
  LayoutTemplate,
  Sparkles,
  Database,
  Mail,
  Loader2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import FrameManagement from './components/admin/FrameManagement';
import CharacterManagement from './components/admin/CharacterManagement';
import SqlSchemaModal from './components/admin/SqlSchemaModal';

const EXPIRATION_HOURS = 72;
const EXPIRATION_MS = EXPIRATION_HOURS * 60 * 60 * 1000;

const formatAdminDate = (dateString) => {
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

const getResultStatus = (createdAt) => {
  if (!createdAt) return { isExpired: false, label: 'Active', hoursLeft: 72 };
  try {
    const createdTime = new Date(createdAt).getTime();
    if (isNaN(createdTime)) return { isExpired: false, label: 'Active', hoursLeft: 72 };

    const elapsed = Date.now() - createdTime;
    const isExpired = elapsed > EXPIRATION_MS;
    const remaining = Math.max(0, EXPIRATION_MS - elapsed);
    const hoursLeft = Math.floor(remaining / (1000 * 60 * 60));

    return {
      isExpired,
      label: isExpired ? 'Expired' : 'Active',
      hoursLeft
    };
  } catch {
    return { isExpired: false, label: 'Active', hoursLeft: 72 };
  }
};

const AdminDashboard = ({ supabase }) => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const savedTheme = window.localStorage.getItem('aestho-theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Supabase Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Data & Filter State
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // DEFAULT FILTER: 'active' (sesuai instruksi: default AKTIF saat dibuka)
  const [statusFilter, setStatusFilter] = useState('active'); 
  const [layoutFilter, setLayoutFilter] = useState('all'); // 'all', 'classic-white', 'grid-4r'
  const [mediaFilter, setMediaFilter] = useState('all'); // 'all', 'video', 'static'
  const [previewItem, setPreviewItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Admin Tab Navigation: 'results' | 'frames' | 'characters'
  const [activeAdminTab, setActiveAdminTab] = useState('results');
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Sync Dark Mode class
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem('aestho-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Check Supabase Auth Session on mount
  useEffect(() => {
    let isMounted = true;
    if (!supabase) {
      setIsCheckingAuth(false);
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[Admin Auth] Error fetching session:', error);
        }
        if (isMounted) {
          if (session?.user) {
            setCurrentUser(session.user);
            setIsAuthenticated(true);
          } else {
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.warn('[Admin Auth] Init session exception:', err);
      } finally {
        if (isMounted) setIsCheckingAuth(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        if (session?.user) {
          setCurrentUser(session.user);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setAuthError('Koneksi Supabase belum aktif atau URL di .env belum disetting.');
      return;
    }

    if (!emailInput.trim() || !passwordInput) {
      setAuthError('Silakan masukkan email dan password admin.');
      return;
    }

    setIsLoggingIn(true);
    setAuthError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.trim(),
        password: passwordInput,
      });

      if (error) {
        setAuthError(error.message || 'Login gagal. Periksa email dan password admin Anda.');
      } else if (data?.user) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setPasswordInput('');
        showToast(`Selamat datang, ${data.user.email}`);
      }
    } catch (err) {
      setAuthError('Terjadi kesalahan saat otentikasi dengan Supabase.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[Admin Auth] Sign out error:', err);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setResults([]);
    setPreviewItem(null);
    showToast('Berhasil keluar dari sesi admin.');
  };

  // Fetch data dari Supabase
  const loadResults = async () => {
    if (!supabase) {
      setDataError('Koneksi Supabase belum aktif atau URL di .env masih placeholder (isi_supabase_url_kamu). Data belum dapat dimuat dari tabel aestho_results.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setDataError('');

    try {
      let queryResponse = await supabase
        .from('aestho_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryResponse.error) {
        const fallbackResponse = await supabase
          .from('aestho_results')
          .select('*');

        if (fallbackResponse.error) {
          throw fallbackResponse.error;
        }
        queryResponse = fallbackResponse;
      }

      setResults(queryResponse.data || []);
    } catch (err) {
      console.error('Admin fetch error:', err);
      setDataError(err.message || 'Gagal memuat data dari Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadResults();
    }
  }, [isAuthenticated]);

  // Statistik Calculation
  const stats = useMemo(() => {
    if (!Array.isArray(results)) {
      return { total: 0, activeCount: 0, expiredCount: 0, videoCount: 0, staticCount: 0, topTemplate: null, topLayout: null };
    }

    const total = results.length;
    let videoCount = 0;
    let staticCount = 0;
    let activeCount = 0;
    let expiredCount = 0;
    const templateCounts = {};
    const layoutCounts = {};

    results.forEach((row) => {
      if (!row) return;
      const hasVideo = !!(row.video_url || row.video_mp4_url);
      if (hasVideo) videoCount++;
      else staticCount++;

      const status = getResultStatus(row.created_at);
      if (status.isExpired) expiredCount++;
      else activeCount++;

      const tName = row.template_name?.trim() || 'Tanpa Template';
      templateCounts[tName] = (templateCounts[tName] || 0) + 1;

      const lId = row.layout_id?.trim() || 'classic-white';
      layoutCounts[lId] = (layoutCounts[lId] || 0) + 1;
    });

    const sortedTemplates = Object.entries(templateCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const sortedLayouts = Object.entries(layoutCounts)
      .map(([id, count]) => ({
        id,
        name: id === 'grid-4r' ? 'Poster Grid 4R' : 'Classic White Strip',
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      activeCount,
      expiredCount,
      videoCount,
      staticCount,
      topTemplate: sortedTemplates[0] || null,
      topLayout: sortedLayouts[0] || null
    };
  }, [results]);

  // Filtered Results
  const filteredResults = useMemo(() => {
    if (!Array.isArray(results)) return [];

    return results.filter((item) => {
      if (!item) return false;
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        (item.id && item.id.toLowerCase().includes(search)) ||
        (item.template_name && item.template_name.toLowerCase().includes(search)) ||
        (item.layout_id && item.layout_id.toLowerCase().includes(search));

      const status = getResultStatus(item.created_at);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !status.isExpired) ||
        (statusFilter === 'expired' && status.isExpired);

      const matchLayout =
        layoutFilter === 'all' ||
        (item.layout_id === layoutFilter);

      const hasVideo = !!(item.video_url || item.video_mp4_url);
      const matchMedia =
        mediaFilter === 'all' ||
        (mediaFilter === 'video' && hasVideo) ||
        (mediaFilter === 'static' && !hasVideo);

      return matchSearch && matchStatus && matchLayout && matchMedia;
    });
  }, [results, searchTerm, statusFilter, layoutFilter, mediaFilter]);

  const handleCopyLink = async (resultId) => {
    const link = `${window.location.origin}/id/summary/${resultId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(resultId);
      showToast('Link hasil disalin ke clipboard.');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Gagal menyalin link.');
    }
  };

  // =========================================================================
  // VIEW: CHECKING AUTH SESSION / LOGIN ADMIN (SUPABASE AUTH)
  // =========================================================================
  if (isCheckingAuth) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-zinc-500" />
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Memeriksa Sesi Admin...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white flex items-center justify-center p-4 transition-colors duration-500 font-sans">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black mx-auto mb-4 flex items-center justify-center">
              <Lock size={20} />
            </div>

            <h1 className="font-title text-3xl text-zinc-900 dark:text-white mb-1">
              Aestho Admin
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Masuk dengan akun Supabase Auth terdaftar
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email Admin"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white font-mono"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password Admin"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  required
                  className="w-full px-4 py-3 pr-14 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white text-[10px] font-mono uppercase"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {authError && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs text-left">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-modern text-[10px] font-bold tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all mt-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoggingIn && <Loader2 size={13} className="animate-spin" />}
                <span>{isLoggingIn ? 'Memverifikasi...' : 'Masuk sebagai Admin'}</span>
              </button>

              <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Terproteksi Supabase Auth & RLS</span>
              </div>

              <a
                href="/"
                className="inline-flex items-center justify-center gap-1.5 text-[10px] font-modern tracking-wider text-zinc-400 hover:text-black dark:hover:text-white transition-colors uppercase pt-2"
              >
                <ArrowLeft size={11} /> Kembali ke Photobooth
              </a>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW: DASHBOARD ADMIN (CLEAN, TIDAK RAMAI, STRUKTUR RAPI)
  // =========================================================================
  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-300 font-sans selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black">
        {/* 1. HEADER SEDERHANA */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex items-center justify-center"
              title="Kembali ke Studio"
            >
              <ArrowLeft size={18} />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-title text-2xl text-zinc-900 dark:text-white leading-none">Aestho.</span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 hidden sm:block">
                Monitoring hasil photobooth & dynamic asset manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser?.email && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
                <UserCheck size={12} className="text-emerald-500" />
                <span className="truncate max-w-[160px]">{currentUser.email}</span>
              </div>
            )}

            <button
              onClick={loadResults}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-mono flex items-center gap-1.5 transition-colors text-zinc-600 dark:text-zinc-300"
              title="Refresh Data"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Ganti Tema"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-600 hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400 text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Keluar"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* 2. TAB NAVIGATION BAR */}
        <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 flex items-center justify-between gap-3 overflow-x-auto hide-scrollbar sticky top-[61px] z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveAdminTab('results')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
                activeAdminTab === 'results'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Layers size={13} />
              <span>Sesi Photobooth</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {results.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('frames')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
                activeAdminTab === 'frames'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <LayoutTemplate size={13} />
              <span>Kelola Frame</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('characters')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
                activeAdminTab === 'characters'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Sparkles size={13} />
              <span>Kelola Karakter</span>
            </button>
          </div>

          {/* SQL Setup Helper */}
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-[11px] font-mono text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 shrink-0 transition-colors"
            title="Buka Skema SQL Supabase"
          >
            <Database size={12} />
            <span className="hidden sm:inline">Skema SQL Supabase</span>
            <span className="sm:hidden">SQL</span>
          </button>
        </div>

        {/* 3. MAIN CONTENT */}
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {activeAdminTab === 'frames' && (
            <FrameManagement supabase={supabase} onShowToast={showToast} />
          )}

          {activeAdminTab === 'characters' && (
            <CharacterManagement supabase={supabase} onShowToast={showToast} />
          )}

          {activeAdminTab === 'results' && (
            <>
              {/* NOTICE BANNER JIKA KONEKSI SUPABASE BELUM AKTIF */}
              {dataError && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                    <span className="leading-relaxed">{dataError}</span>
                  </div>
                  <button onClick={loadResults} className="font-mono underline font-bold shrink-0">
                    Coba Lagi
                  </button>
                </div>
              )}

          {/* 3. SECTION STATISTIK: MAKSIMAL 4 KARTU UTAMA */}
          <section className="mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Active Result */}
              <div className="bg-white dark:bg-zinc-900/70 rounded-2xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-modern text-[9px] tracking-wider text-zinc-400 uppercase font-semibold">
                    Active Result
                  </span>
                  <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={13} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                  {isLoading ? '...' : stats.activeCount}
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">Masa simpan &le; 72 jam</p>
              </div>

              {/* Card 2: Expired Result */}
              <div className="bg-white dark:bg-zinc-900/70 rounded-2xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-modern text-[9px] tracking-wider text-zinc-400 uppercase font-semibold">
                    Expired Result
                  </span>
                  <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center">
                    <Clock size={13} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-zinc-700 dark:text-zinc-300">
                  {isLoading ? '...' : stats.expiredCount}
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">Lewat batas 72 jam</p>
              </div>

              {/* Card 3: Live Moment */}
              <div className="bg-white dark:bg-zinc-900/70 rounded-2xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-modern text-[9px] tracking-wider text-zinc-400 uppercase font-semibold">
                    Live Moment
                  </span>
                  <div className="w-6 h-6 rounded-md bg-red-50 dark:bg-red-950/50 text-red-500 flex items-center justify-center">
                    <Film size={13} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-zinc-900 dark:text-white">
                  {isLoading ? '...' : stats.videoCount}
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">Format dengan video</p>
              </div>

              {/* Card 4: Top Frame */}
              <div className="bg-white dark:bg-zinc-900/70 rounded-2xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-modern text-[9px] tracking-wider text-zinc-400 uppercase font-semibold">
                    Top Frame
                  </span>
                  <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
                    <Trophy size={13} />
                  </div>
                </div>
                <div className="text-sm sm:text-base font-bold truncate text-zinc-900 dark:text-white" title={stats.topTemplate?.name || '-'}>
                  {isLoading ? '...' : stats.topTemplate?.name || 'Belum ada data'}
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">
                  {stats.topTemplate ? `${stats.topTemplate.count} sesi (${stats.topTemplate.percentage}%)` : '-'}
                </p>
              </div>
            </div>

            {/* SECTION TAMBAHAN: INFO BAR KECIL SATU BARIS */}
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-4">
                <span>Total Semua Sesi: <strong className="text-zinc-800 dark:text-zinc-200">{stats.total}</strong></span>
                <span>•</span>
                <span>Static JPG Saja: <strong className="text-zinc-800 dark:text-zinc-200">{stats.staticCount}</strong></span>
              </div>
              {stats.topLayout && (
                <div>
                  Top Layout: <strong className="text-zinc-800 dark:text-zinc-200">{stats.topLayout.name}</strong> ({stats.topLayout.count}x)
                </div>
              )}
            </div>
          </section>

          {/* 4. SECTION FILTER & SEARCH (RAPI, TIDAK TERLALU PANJANG) */}
          <section className="mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Tab Pill: AKTIF (Default), EXPIRED, SEMUA */}
            <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200/80 dark:border-zinc-800 shrink-0 self-start">
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider transition-all ${
                  statusFilter === 'active'
                    ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                AKTIF ({stats.activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider transition-all ${
                  statusFilter === 'expired'
                    ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                EXPIRED ({stats.expiredCount})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                SEMUA ({stats.total})
              </button>
            </div>

            {/* Filter Sejajar: Search + Dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar Ringkas */}
              <div className="relative w-full sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari ID atau frame..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-7 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all font-mono"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Layout Dropdown */}
              <select
                value={layoutFilter}
                onChange={(e) => setLayoutFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-300 focus:outline-none shrink-0"
              >
                <option value="all">Semua Layout</option>
                <option value="classic-white">Classic Strip</option>
                <option value="grid-4r">Poster 4R</option>
              </select>

              {/* Media Dropdown */}
              <select
                value={mediaFilter}
                onChange={(e) => setMediaFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-300 focus:outline-none shrink-0"
              >
                <option value="all">Semua Media</option>
                <option value="video">Hanya Video</option>
                <option value="static">Hanya JPG</option>
              </select>
            </div>
          </section>

          {/* 5. TABEL & DAFTAR HASIL (SPACING LEGA, MUDAH DIBACA) */}
          {isLoading ? (
            <div className="py-20 text-center bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2.5 text-zinc-400" />
              <p className="text-xs font-mono text-zinc-400">Memuat data sesi...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            /* 6. EMPTY STATE YANG KOMUNIKATIF */
            <div className="py-16 px-6 text-center bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
                <Clock size={22} className="opacity-70" />
              </div>

              {statusFilter === 'active' ? (
                <>
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                    Belum Ada Result Aktif
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed mb-4">
                    Belum ada sesi baru dalam 72 jam terakhir. Result yang sudah melewati 72 jam tetap tersimpan dan bisa dilihat di tab Expired.
                  </p>
                  <button
                    onClick={() => setStatusFilter('expired')}
                    className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-semibold hover:opacity-85 transition-opacity"
                  >
                    Buka Tab Expired ({stats.expiredCount})
                  </button>
                </>
              ) : statusFilter === 'expired' ? (
                <>
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                    Tidak Ada Result Expired
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                    Semua sesi yang tersimpan masih berada dalam masa aktif 72 jam.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                    Result Tidak Ditemukan
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                    Tidak ada data yang sesuai dengan kata kunci pencarian atau filter yang dipilih.
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                        <th className="px-5 py-3.5">Preview</th>
                        <th className="px-5 py-3.5">Result ID</th>
                        <th className="px-5 py-3.5">Frame / Style</th>
                        <th className="px-5 py-3.5">Layout</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Created At</th>
                        <th className="px-5 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans">
                      {filteredResults.map((item) => {
                        const status = getResultStatus(item.created_at);
                        const hasVideo = !!(item.video_url || item.video_mp4_url);
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                          >
                            {/* 1. Preview Thumbnail */}
                            <td className="px-5 py-4">
                              <div
                                onClick={() => setPreviewItem(item)}
                                className="w-10 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-700 shadow-sm relative group"
                              >
                                {item.photo_url ? (
                                  <img
                                    src={item.photo_url}
                                    alt={item.id}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-400">
                                    No Pic
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* 2. Result ID */}
                            <td className="px-5 py-4 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                              {item.id}
                            </td>

                            {/* 3. Frame / Template + Format Badge */}
                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                  {item.template_name || 'Tanpa Template'}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-zinc-400">
                                  {hasVideo ? (
                                    <span className="text-red-500 font-semibold flex items-center gap-0.5">
                                      <Film size={10} /> Live Moment
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-0.5">
                                      <ImageIcon size={10} /> Static JPG
                                    </span>
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* 4. Layout */}
                            <td className="px-5 py-4">
                              <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                {item.layout_id === 'grid-4r' ? 'Poster 4R' : 'Classic Strip'}
                              </span>
                            </td>

                            {/* 5. Status */}
                            <td className="px-5 py-4">
                              {status.isExpired ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-mono">
                                  <XCircle size={10} className="text-zinc-400" /> Expired
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-200 dark:border-emerald-900/40">
                                  <CheckCircle2 size={10} className="text-emerald-500" /> Aktif ({status.hoursLeft}h)
                                </span>
                              )}
                            </td>

                            {/* 6. Created At */}
                            <td className="px-5 py-4 text-zinc-500 text-[11px] font-mono whitespace-nowrap">
                              {formatAdminDate(item.created_at)}
                            </td>

                            {/* 7. Action: Detail, Open, Copy Link */}
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setPreviewItem(item)}
                                  className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] transition-colors"
                                  title="Detail Sesi"
                                >
                                  Detail
                                </button>
                                <button
                                  onClick={() => handleCopyLink(item.id)}
                                  className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                                  title="Salin Link"
                                >
                                  {copiedId === item.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                </button>
                                <a
                                  href={`/id/summary/${item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-semibold hover:opacity-85 transition-opacity inline-flex items-center gap-1"
                                >
                                  Open <ExternalLink size={10} />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="md:hidden flex flex-col gap-3">
                {filteredResults.map((item) => {
                  const status = getResultStatus(item.created_at);
                  const hasVideo = !!(item.video_url || item.video_mp4_url);
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-zinc-900/80 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-3"
                    >
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        <div
                          onClick={() => setPreviewItem(item)}
                          className="w-14 h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 cursor-pointer border border-zinc-200 dark:border-zinc-700"
                        >
                          {item.photo_url ? (
                            <img
                              src={item.photo_url}
                              alt={item.id}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-400">
                              No Pic
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono font-bold text-sm text-zinc-900 dark:text-white truncate">
                              ID: {item.id}
                            </span>
                            {status.isExpired ? (
                              <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[9px] font-mono shrink-0">
                                Expired
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-semibold shrink-0">
                                Aktif ({status.hoursLeft}h)
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate mb-1">
                            {item.template_name || 'Tanpa Template'}
                          </p>

                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mb-1">
                            <span>{item.layout_id === 'grid-4r' ? 'Poster 4R' : 'Classic Strip'}</span>
                            {hasVideo && <span className="text-red-500 font-bold">• Video</span>}
                          </div>

                          <p className="text-[10px] text-zinc-400 font-mono">
                            {formatAdminDate(item.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-mono text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-all"
                        >
                          <Eye size={12} /> Detail
                        </button>

                        <button
                          onClick={() => handleCopyLink(item.id)}
                          className="py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-mono text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-all"
                        >
                          {copiedId === item.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Link
                        </button>

                        <a
                          href={`/id/summary/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                        >
                          Open <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-4 text-center text-[11px] font-mono text-zinc-400">
            Menampilkan {filteredResults.length} result
          </div>
            </>
          )}
        </main>

        {/* 6. DETAIL RESULT MODAL */}
        {previewItem && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={() => setPreviewItem(null)}
          >
            <div
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-xl w-full p-6 sm:p-7 my-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X size={16} />
              </button>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                    Detail Sesi
                  </span>
                  {getResultStatus(previewItem.created_at).isExpired ? (
                    <span className="px-2 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[9px] font-mono">
                      Expired
                    </span>
                  ) : (
                    <span className="px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-bold">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
                  ID: {previewItem.id}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Dibuat: {formatAdminDate(previewItem.created_at)}
                </p>
              </div>

              {/* Media Preview Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Static JPG */}
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-zinc-400 mb-2">Static Result (JPG)</span>
                  {previewItem.photo_url ? (
                    <img
                      src={previewItem.photo_url}
                      alt="Photostrip"
                      className="max-h-60 w-auto object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="h-40 flex items-center justify-center text-xs text-zinc-400">
                      Foto tidak tersedia
                    </div>
                  )}
                </div>

                {/* Live Moment Video */}
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-mono text-zinc-400 mb-2">Live Moment Video</span>
                  {previewItem.video_url || previewItem.video_mp4_url ? (
                    <video
                      src={previewItem.video_mp4_url || previewItem.video_url}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-h-60 w-auto object-contain rounded-lg shadow-sm bg-black"
                    />
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-xs text-zinc-400 gap-1.5">
                      <Film size={20} className="opacity-30" />
                      <span>Tidak ada video</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Box */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 text-xs font-mono">
                <div>
                  <span className="text-zinc-400 block text-[9px]">FRAME / TEMPLATE</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{previewItem.template_name || '-'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px]">LAYOUT</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{previewItem.layout_id || 'classic-white'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <a
                  href={`/id/summary/${previewItem.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <ExternalLink size={13} /> Open Result
                </a>

                <button
                  onClick={() => handleCopyLink(previewItem.id)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Copy size={13} /> Copy Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SQL SCHEMA SETUP MODAL */}
        <SqlSchemaModal
          isOpen={isSqlModalOpen}
          onClose={() => setIsSqlModalOpen(false)}
          onShowToast={showToast}
        />

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-200">
            <div className="bg-zinc-900 text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs font-mono border border-zinc-700 dark:border-zinc-300">
              <Check size={13} className="text-emerald-500 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Admin Panel Runtime Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-black dark:text-white flex items-center justify-center p-6 font-sans">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-8 max-w-sm w-full text-center">
            <h1 className="font-title text-3xl mb-2 text-zinc-900 dark:text-white">Aestho Admin</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Terjadi kendala saat merender dashboard.
            </p>
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-left text-[11px] font-mono text-red-600 dark:text-red-400 mb-5 break-words">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold"
              >
                Reload
              </button>
              <a
                href="/"
                className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-mono text-xs text-zinc-600 dark:text-zinc-300"
              >
                Photobooth
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminDashboardWrapper = (props) => (
  <AdminErrorBoundary>
    <AdminDashboard {...props} />
  </AdminErrorBoundary>
);

export default AdminDashboardWrapper;
