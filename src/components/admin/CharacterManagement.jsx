import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Upload,
  Trash2,
  RefreshCw,
  Sparkles,
  X,
  ExternalLink,
  Layers,
  User,
  Sliders,
  CheckCircle2,
  XCircle,
  ImageIcon
} from 'lucide-react';
import {
  fetchAdminCharacters,
  createCharacterWithPoses,
  toggleCharacterStatus,
  deleteCharacter,
  uploadAssetToCloudinary
} from '../../services/dynamicContent';

const DEFAULT_SERIES_OPTIONS = [
  'Genshin Impact',
  'Honkai: Star Rail',
  'Jujutsu Kaisen',
  'Custom Anime / Idol'
];

const CharacterManagement = ({ supabase, onShowToast }) => {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    series: 'Genshin Impact',
    customSeries: '',
    position: 'right',
    default_width: 'w-[60%]',
    default_height: 100,
    x_offset: 0,
    y_offset: 0,
    artist_credit: '',
    is_active: true
  });

  // Poses State: 4 slots for poses (0 to 3)
  const [poses, setPoses] = useState([
    { pose_index: 0, file: null, preview: '', url: '', width_percent: 60, height_percent: 100 },
    { pose_index: 1, file: null, preview: '', url: '', width_percent: 60, height_percent: 100 },
    { pose_index: 2, file: null, preview: '', url: '', width_percent: 60, height_percent: 100 },
    { pose_index: 3, file: null, preview: '', url: '', width_percent: 60, height_percent: 100 }
  ]);

  const loadCharacters = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchAdminCharacters(supabase);
      setCharacters(data || []);
    } catch (err) {
      setErrorMsg('Gagal memuat data karakter.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, [supabase]);

  const existingSeriesList = useMemo(() => {
    const set = new Set(DEFAULT_SERIES_OPTIONS);
    characters.forEach((c) => {
      if (c.series) set.add(c.series);
    });
    return Array.from(set);
  }, [characters]);

  const filteredCharacters = useMemo(() => {
    return characters.filter((c) => {
      const matchSearch =
        !searchTerm ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.series?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.artist_credit?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSeries =
        seriesFilter === 'all' || c.series === seriesFilter;

      return matchSearch && matchSeries;
    });
  }, [characters, searchTerm, seriesFilter]);

  const handleOpenModal = () => {
    setFormData({
      name: '',
      series: 'Genshin Impact',
      customSeries: '',
      position: 'right',
      default_width: 'w-[60%]',
      default_height: 100,
      x_offset: 0,
      y_offset: 0,
      artist_credit: '',
      is_active: true
    });
    setPoses([
      { pose_index: 0, file: null, preview: '', url: '', width_percent: 60, height_percent: 100 },
      { pose_index: 1, file: null, preview: '', url: '', width_percent: 60, height_percent: 100 },
      { pose_index: 2, file: null, preview: '', url: '', width_percent: 60, height_percent: 100 },
      { pose_index: 3, file: null, preview: '', url: '', width_percent: 60, height_percent: 100 }
    ]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    poses.forEach((p) => {
      if (p.preview && p.preview.startsWith('blob:')) {
        URL.revokeObjectURL(p.preview);
      }
    });
  };

  const handlePoseFileChange = (index, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('Pilih file gambar PNG transparan.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPoses((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, file, preview: previewUrl } : item
      )
    );
  };

  const handlePoseUrlChange = (index, url) => {
    setPoses((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, url, preview: url } : item
      )
    );
  };

  const handleApplyPose0ToAll = () => {
    const basePose = poses[0];
    if (!basePose.file && !basePose.url) {
      onShowToast('Pilih gambar untuk Pose 1 terlebih dahulu.');
      return;
    }
    setPoses((prev) =>
      prev.map((item, idx) =>
        idx === 0
          ? item
          : {
              ...item,
              file: basePose.file,
              preview: basePose.preview,
              url: basePose.url,
              width_percent: basePose.width_percent,
              height_percent: basePose.height_percent
            }
      )
    );
    onShowToast('Pose 1 disalin ke semua 4 slot pose!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onShowToast('Nama karakter wajib diisi.');
      return;
    }

    const hasAnyPose = poses.some((p) => p.file || p.url.trim());
    if (!hasAnyPose) {
      onShowToast('Minimal upload 1 gambar pose karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalSeries =
        formData.series === 'Custom Anime / Idol' && formData.customSeries.trim()
          ? formData.customSeries.trim()
          : formData.series;

      // 1. Upload pose files to Cloudinary
      setUploadProgress('Mengunggah gambar pose karakter ke Cloudinary...');
      const uploadedPoses = [];

      for (let i = 0; i < poses.length; i++) {
        const p = poses[i];
        let finalImageUrl = p.url.trim();

        if (p.file) {
          setUploadProgress(`Mengunggah Pose ${i + 1} ke Cloudinary...`);
          const uploadRes = await uploadAssetToCloudinary(p.file, 'aestho-characters');
          finalImageUrl = uploadRes.secure_url;
        }

        if (finalImageUrl) {
          uploadedPoses.push({
            pose_index: i,
            image_url: finalImageUrl,
            width_percent: Number(p.width_percent) || 60,
            height_percent: Number(p.height_percent) || 100,
            x_offset: 0,
            y_offset: 0
          });
        }
      }

      // If only pose 0 uploaded, fill other poses with pose 0
      if (uploadedPoses.length === 1) {
        const first = uploadedPoses[0];
        for (let i = 1; i < 4; i++) {
          uploadedPoses.push({
            ...first,
            pose_index: i
          });
        }
      }

      setUploadProgress('Menyimpan metadata karakter ke Supabase...');
      await createCharacterWithPoses(
        supabase,
        {
          name: formData.name.trim(),
          series: finalSeries,
          position: formData.position,
          default_width: formData.default_width,
          default_height: Number(formData.default_height) || 100,
          x_offset: Number(formData.x_offset) || 0,
          y_offset: Number(formData.y_offset) || 0,
          artist_credit: formData.artist_credit.trim(),
          is_active: formData.is_active
        },
        uploadedPoses
      );

      onShowToast(`Karakter "${formData.name}" berhasil ditambahkan!`);
      handleCloseModal();
      loadCharacters();
    } catch (err) {
      console.error(err);
      onShowToast(err.message || 'Gagal menyimpan karakter.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  const handleToggleStatus = async (char) => {
    const newStatus = !char.is_active;
    try {
      await toggleCharacterStatus(supabase, char.id, newStatus);
      setCharacters((prev) =>
        prev.map((c) => (c.id === char.id ? { ...c, is_active: newStatus } : c))
      );
      onShowToast(`Karakter "${char.name}" sekarang ${newStatus ? 'AKTIF' : 'NONAKTIF'}.`);
    } catch {
      onShowToast('Gagal mengubah status karakter.');
    }
  };

  const handleDelete = async (char) => {
    if (!window.confirm(`Yakin ingin menghapus karakter "${char.name}" beserta posenya?`)) return;
    try {
      await deleteCharacter(supabase, char.id);
      setCharacters((prev) => prev.filter((c) => c.id !== char.id));
      onShowToast(`Karakter "${char.name}" berhasil dihapus.`);
    } catch {
      onShowToast('Gagal menghapus karakter.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles size={20} className="text-zinc-600 dark:text-zinc-300" />
            <span>Kelola Karakter Dinamis</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Tambah karakter dan multi-pose PNG untuk tampil di sesi Character Collab photobooth
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCharacters}
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
            <span>Tambah Karakter</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900/60 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari karakter berdasarkan nama, series, atau artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-transparent focus:border-zinc-400 dark:focus:border-zinc-600 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={seriesFilter}
            onChange={(e) => setSeriesFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
          >
            <option value="all">Semua Series</option>
            {existingSeriesList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Character Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-zinc-400 text-xs font-mono flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin" />
          <span>Memuat data karakter...</span>
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto mb-3 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Belum ada karakter dinamis di database
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Karakter bawaan hardcoded tetap berjalan di Character Collab. Tambah karakter baru kapan saja lewat dashboard ini.
          </p>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-modern text-[9.5px] font-bold tracking-wider uppercase inline-flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <Plus size={13} />
            <span>Tambah Karakter Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCharacters.map((char) => {
            const posesList = char.poses || [];
            return (
              <div
                key={char.id}
                className={`bg-white dark:bg-zinc-900/70 rounded-2xl border transition-all duration-300 p-4 flex flex-col justify-between shadow-sm hover:shadow-md ${
                  char.is_active
                    ? 'border-zinc-200/80 dark:border-zinc-800'
                    : 'border-zinc-200/50 dark:border-zinc-800/50 opacity-60'
                }`}
              >
                <div>
                  {/* Poses Preview Gallery */}
                  <div className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden mb-3 border border-zinc-200/60 dark:border-zinc-800/60 p-2 flex items-center justify-center">
                    <div
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)',
                        backgroundSize: '10px 10px'
                      }}
                    />

                    {posesList.length > 0 ? (
                      <div className="grid grid-cols-4 gap-1.5 w-full h-full relative z-10">
                        {posesList.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            className="bg-white/70 dark:bg-zinc-900/70 rounded-lg p-1 border border-zinc-200/50 dark:border-zinc-800 flex items-end justify-center overflow-hidden"
                          >
                            <img
                              src={p.image_url}
                              alt={`Pose ${pIdx + 1}`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-zinc-400 text-xs flex flex-col items-center gap-1">
                        <ImageIcon size={20} />
                        <span>Belum Ada Pose</span>
                      </div>
                    )}

                    {/* Active Status Badge */}
                    <span
                      className={`absolute top-2 right-2 z-20 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        char.is_active
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-zinc-400 text-white'
                      }`}
                    >
                      {char.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  {/* Character Name & Series */}
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate mb-1">
                    {char.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                      {char.series}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      Posisi: {char.position === 'left' ? 'Kiri' : 'Kanan'}
                    </span>
                  </div>

                  <p className="text-[10px] font-mono text-zinc-400 mb-2">
                    {posesList.length} Pose • Tinggi {char.default_height}%
                  </p>

                  {char.artist_credit && (
                    <p className="text-[10px] font-mono text-zinc-400 truncate mb-2">
                      Artist: <span className="text-zinc-600 dark:text-zinc-300">{char.artist_credit}</span>
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(char)}
                    className={`text-[10.5px] font-mono font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      char.is_active
                        ? 'text-zinc-500 hover:text-amber-600 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                    }`}
                  >
                    {char.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>

                  <button
                    onClick={() => handleDelete(char)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Hapus Karakter"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Karakter */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Tambah Karakter Baru
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Upload pose PNG transparan dan sesuaikan skala tampilan di photobooth
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
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
              {/* Nama & Series */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Karakter *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Raiden Shogun, Gojo Satoru"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Series / Anime
                  </label>
                  <select
                    value={formData.series}
                    onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none cursor-pointer"
                  >
                    {existingSeriesList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Series Input if selected */}
              {formData.series === 'Custom Anime / Idol' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Ketik Nama Series Custom
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Spy x Family, Blue Lock, BTS"
                    value={formData.customSeries}
                    onChange={(e) => setFormData({ ...formData, customSeries: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none"
                  />
                </div>
              )}

              {/* Posisi & Skala */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Posisi Karakter di Photobooth
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="right">Kanan (Right) - Standar</option>
                    <option value="left">Kiri (Left)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tinggi Skala (%)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="120"
                    value={formData.default_height}
                    onChange={(e) => setFormData({ ...formData, default_height: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Upload 4 Pose Slots */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Upload Pose Karakter (Maksimal 4 Pose Slot)
                  </label>
                  <button
                    type="button"
                    onClick={handleApplyPose0ToAll}
                    className="text-[10px] font-mono text-zinc-500 hover:text-black dark:hover:text-white underline"
                  >
                    Gunakan Pose 1 untuk Semua Slot
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {poses.map((p, idx) => (
                    <div
                      key={idx}
                      className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2.5 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col items-center justify-between text-center relative"
                    >
                      <span className="font-mono text-[10px] font-bold text-zinc-400 mb-1.5">
                        Pose #{idx + 1}
                      </span>

                      <div className="relative w-full aspect-[3/4] bg-white dark:bg-zinc-900 rounded-xl overflow-hidden mb-2 border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center p-1">
                        <input
                          type="file"
                          accept="image/png,image/webp"
                          onChange={(e) => handlePoseFileChange(idx, e.target.files?.[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {p.preview ? (
                          <img
                            src={p.preview}
                            alt={`Preview ${idx}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-zinc-400">
                            <Upload size={16} />
                            <span className="text-[9px] font-mono">Pilih PNG</span>
                          </div>
                        )}
                      </div>

                      <input
                        type="url"
                        placeholder="Atau URL..."
                        value={p.url}
                        onChange={(e) => handlePoseUrlChange(idx, e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono text-zinc-900 dark:text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Artist Credit */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Credit Artist (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: @ArtistName, Mihoyo / Hoyoverse"
                  value={formData.artist_credit}
                  onChange={(e) => setFormData({ ...formData, artist_credit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none"
                />
              </div>

              {/* Is Active */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-zinc-300 text-black focus:ring-0"
                  />
                  <span className="text-[11px] text-zinc-700 dark:text-zinc-300">
                    Aktifkan karakter langsung di photobooth
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
                  <span>Simpan Karakter</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterManagement;
