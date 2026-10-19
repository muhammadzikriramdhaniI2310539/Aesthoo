import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Upload,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  LayoutTemplate,
  X,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  fetchAdminFrames,
  createFrame,
  toggleFrameStatus,
  deleteFrame,
  uploadAssetToCloudinary
} from '../../services/dynamicContent';

const FrameManagement = ({ supabase, onShowToast }) => {
  const [frames, setFrames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [layoutFilter, setLayoutFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'aestho',
    layout_id: 'classic-white',
    overlay_url: '',
    bg_color: '#ffffff',
    photo_radius: 'rounded-xl',
    hide_footer: true,
    artist_credit: '',
    is_active: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  const loadFrames = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchAdminFrames(supabase);
      setFrames(data || []);
    } catch (err) {
      setErrorMsg('Gagal memuat daftar frame dari Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFrames();
  }, [supabase]);

  const filteredFrames = useMemo(() => {
    return frames.filter((item) => {
      const matchSearch =
        !searchTerm ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.artist_credit?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        categoryFilter === 'all' || item.category === categoryFilter;

      const matchLayout =
        layoutFilter === 'all' || item.layout_id === layoutFilter;

      return matchSearch && matchCategory && matchLayout;
    });
  }, [frames, searchTerm, categoryFilter, layoutFilter]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Pilih file gambar (PNG / JPG).');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      category: 'aestho',
      layout_id: 'classic-white',
      overlay_url: '',
      bg_color: '#ffffff',
      photo_radius: 'rounded-xl',
      hide_footer: true,
      artist_credit: '',
      is_active: true
    });
    setSelectedFile(null);
    setFilePreview('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview('');
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onShowToast('Nama frame wajib diisi.');
      return;
    }

    if (!selectedFile && !formData.overlay_url.trim()) {
      onShowToast('Upload file PNG overlay atau masukkan URL gambar frame.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalOverlayUrl = formData.overlay_url.trim();

      // Upload file to Cloudinary if file selected
      if (selectedFile) {
        setUploadProgress('Mengunggah gambar overlay ke Cloudinary...');
        const uploadResult = await uploadAssetToCloudinary(selectedFile, 'aestho-frames');
        finalOverlayUrl = uploadResult.secure_url;
      }

      setUploadProgress('Menyimpan metadata frame ke Supabase...');
      await createFrame(supabase, {
        ...formData,
        overlay_url: finalOverlayUrl
      });

      onShowToast(`Frame "${formData.name}" berhasil ditambahkan!`);
      handleCloseModal();
      loadFrames();
    } catch (err) {
      console.error(err);
      onShowToast(err.message || 'Gagal menyimpan frame.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  const handleToggleStatus = async (frame) => {
    const newStatus = !frame.is_active;
    try {
      await toggleFrameStatus(supabase, frame.id, newStatus);
      setFrames((prev) =>
        prev.map((f) => (f.id === frame.id ? { ...f, is_active: newStatus } : f))
      );
      onShowToast(`Frame "${frame.name}" sekarang ${newStatus ? 'AKTIF' : 'NONAKTIF'}.`);
    } catch (err) {
      onShowToast('Gagal mengubah status frame.');
    }
  };

  const handleDelete = async (frame) => {
    if (!window.confirm(`Yakin ingin menghapus frame "${frame.name}"?`)) return;
    try {
      await deleteFrame(supabase, frame.id);
      setFrames((prev) => prev.filter((f) => f.id !== frame.id));
      onShowToast(`Frame "${frame.name}" berhasil dihapus.`);
    } catch (err) {
      onShowToast('Gagal menghapus frame.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <LayoutTemplate size={20} className="text-zinc-600 dark:text-zinc-300" />
            <span>Kelola Frame Dinamis</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Tambah frame baru untuk langsung tampil di pilihan template photobooth
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadFrames}
            disabled={isLoading}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-mono transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-modern text-[9.5px] font-bold tracking-wider uppercase flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            <Plus size={14} />
            <span>Tambah Frame</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-zinc-900/60 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari frame berdasarkan nama atau artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-transparent focus:border-zinc-400 dark:focus:border-zinc-600 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            <option value="aestho">Aestho</option>
            <option value="genshin">Genshin</option>
            <option value="custom">Custom</option>
          </select>

          {/* Layout Filter */}
          <select
            value={layoutFilter}
            onChange={(e) => setLayoutFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
          >
            <option value="all">Semua Layout</option>
            <option value="classic-white">Classic White Strip</option>
            <option value="grid-4r">Poster Grid 4R</option>
          </select>
        </div>
      </div>

      {/* Frame Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-zinc-400 text-xs font-mono flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin" />
          <span>Memuat data frame...</span>
        </div>
      ) : filteredFrames.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto mb-3 flex items-center justify-center">
            <LayoutTemplate size={20} />
          </div>
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Belum ada frame dinamis di database
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Frame bawaan hardcoded tetap berjalan di photobooth. Klik "Tambah Frame" untuk mengunggah frame baru dari dashboard.
          </p>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-modern text-[9px] font-bold tracking-wider uppercase inline-flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <Plus size={13} />
            <span>Tambah Frame Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFrames.map((frame) => (
            <div
              key={frame.id}
              className={`bg-white dark:bg-zinc-900/70 rounded-2xl border transition-all duration-300 p-4 flex flex-col justify-between shadow-sm hover:shadow-md ${
                frame.is_active
                  ? 'border-zinc-200/80 dark:border-zinc-800'
                  : 'border-zinc-200/50 dark:border-zinc-800/50 opacity-60'
              }`}
            >
              <div>
                {/* Frame Image Preview */}
                <div className="relative w-full aspect-[3/4] bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden mb-3 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-center p-2">
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)',
                      backgroundSize: '12px 12px'
                    }}
                  />
                  {frame.overlay_url ? (
                    <img
                      src={frame.overlay_url}
                      alt={frame.name}
                      className="max-h-full max-w-full object-contain relative z-10 drop-shadow-sm"
                    />
                  ) : (
                    <div className="text-zinc-400 text-xs flex flex-col items-center gap-1">
                      <ImageIcon size={20} />
                      <span>Tanpa Overlay</span>
                    </div>
                  )}

                  {/* Active Badge */}
                  <span
                    className={`absolute top-2 right-2 z-20 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      frame.is_active
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-zinc-400 text-white'
                    }`}
                  >
                    {frame.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate mb-1">
                  {frame.name}
                </h3>

                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">
                    {frame.category || 'aestho'}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {frame.layout_id === 'grid-4r' ? 'Grid 4R' : 'Classic White'}
                  </span>
                </div>

                {frame.artist_credit && (
                  <p className="text-[10px] font-mono text-zinc-400 truncate mb-2">
                    Artist: <span className="text-zinc-600 dark:text-zinc-300">{frame.artist_credit}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(frame)}
                  className={`text-[10.5px] font-mono font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    frame.is_active
                      ? 'text-zinc-500 hover:text-amber-600 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                      : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                  }`}
                >
                  {frame.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>

                <div className="flex items-center gap-1">
                  {frame.overlay_url && (
                    <a
                      href={frame.overlay_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Lihat Gambar Asli"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(frame)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Hapus Frame"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Frame */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Tambah Frame Baru
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Upload file PNG overlay transparan dan simpan ke Supabase
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 text-xs">
              {/* Nama Frame */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Frame *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pastel Blossom, Vintage Noir"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              {/* Kategori & Layout */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="aestho">Aestho</option>
                    <option value="genshin">Genshin</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Layout Kanvas
                  </label>
                  <select
                    value={formData.layout_id}
                    onChange={(e) => setFormData({ ...formData, layout_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="classic-white">Classic White Strip (600x2000)</option>
                    <option value="grid-4r">Poster Grid 4R (1200x1800)</option>
                  </select>
                </div>
              </div>

              {/* Upload PNG Overlay */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Upload File PNG Overlay Frame
                </label>
                <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-4 text-center hover:border-black dark:hover:border-white transition-colors">
                  <input
                    type="file"
                    accept="image/png,image/webp,image/jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {filePreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="max-h-28 object-contain rounded-lg border border-zinc-200 dark:border-zinc-800"
                      />
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {selectedFile?.name || 'File dipilih'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-2 text-zinc-400">
                      <Upload size={22} />
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Klik atau seret file gambar PNG ke sini
                      </span>
                      <span className="text-[10px]">Format PNG transparan diutamakan</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Atau URL Overlay Manual */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Atau URL Overlay Gambar (Opsional jika sudah upload)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.overlay_url}
                  onChange={(e) => setFormData({ ...formData, overlay_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors text-xs font-mono"
                />
              </div>

              {/* Background Color & Photo Radius */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Warna Background Strip
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.bg_color}
                      onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={formData.bg_color}
                      onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Kelengkungan Foto (Radius)
                  </label>
                  <select
                    value={formData.photo_radius}
                    onChange={(e) => setFormData({ ...formData, photo_radius: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="rounded-none">Tanpa Lengkungan (rounded-none)</option>
                    <option value="rounded-md">Sedang (rounded-md)</option>
                    <option value="rounded-xl">Standar (rounded-xl)</option>
                    <option value="rounded-2xl">Besar (rounded-2xl)</option>
                    <option value="rounded-3xl">Sangat Bulat (rounded-3xl)</option>
                  </select>
                </div>
              </div>

              {/* Artist Credit */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Credit Artist / Kolaborator (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: @Shinhlin, Aestho Studio"
                  value={formData.artist_credit}
                  onChange={(e) => setFormData({ ...formData, artist_credit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none"
                />
              </div>

              {/* Checkbox Options */}
              <div className="flex items-center gap-5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.hide_footer}
                    onChange={(e) => setFormData({ ...formData, hide_footer: e.target.checked })}
                    className="rounded border-zinc-300 text-black focus:ring-0"
                  />
                  <span className="text-[11px] text-zinc-700 dark:text-zinc-300">
                    Sembunyikan footer teks bawaan
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-zinc-300 text-black focus:ring-0"
                  />
                  <span className="text-[11px] text-zinc-700 dark:text-zinc-300">
                    Aktifkan langsung
                  </span>
                </label>
              </div>

              {uploadProgress && (
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 flex items-center gap-2 animate-pulse">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>{uploadProgress}</span>
                </div>
              )}
            </form>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-mono font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Frame</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameManagement;
