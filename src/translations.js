import { useState, useEffect } from 'react';

export const translations = {
  en: {
    common: {
      langCode: 'EN',
      switchLang: 'ID',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      close: 'Close',
      privacyPolicy: 'Privacy & Data Policy',
      loading: 'Loading...'
    },
    home: {
      tagline: '"Collecting moments, frame by frame."',
      enterStudio: 'Enter Studio',
      privacyPolicy: 'Privacy & Data Policy',
      devCredit: 'Dev',
      requestCharacter: 'Request Character',
      supportAestho: 'Support Aestho'
    },
    layout: {
      title: 'Choose Canvas',
      classicStripName: 'Classic Strip',
      classicStripDesc: 'Classic 3-photo vertical strip',
      poster4rName: 'Poster 4R',
      poster4rDesc: '4R 6-photo modern grid',
      comingSoon: 'Coming\nSoon',
      back: 'Back',
      next: 'Next'
    },
    mode: {
      title: 'Select Style',
      back: 'Back',
      next: 'Next'
    },
    finalResult: {
      title: 'FINAL RESULT',
      staticResult: 'STATIC RESULT',
      liveMoment: 'LIVE MOMENT',
      scanResult: 'SCAN RESULT',
      yourQrCode: 'YOUR QR CODE',
      qrDesc: 'Scan this code to open your Aestho result page with JPG and Live Moment.',
      openResultPage: 'OPEN RESULT PAGE',
      copyLink: 'COPY LINK',
      linkCopied: 'LINK COPIED',
      downloadJpg: 'JPG',
      downloadVideo: 'VIDEO',
      preparingQr: 'Preparing QR',
      createQr: 'CREATE QR',
      toastCopied: 'QR link copied to clipboard.',
      toastCopyFailed: 'Failed to copy QR link.'
    },
    summary: {
      loadingSession: 'Loading your session',
      resultNotFound: 'Result not found or no longer available.',
      invalidLink: 'Invalid result link.',
      supabaseMissing: 'Supabase is not configured yet.',
      startNewSession: 'Start New Session',
      sessionExpiredBadge: 'Session Expired',
      sessionExpiredTitle: 'Result No Longer Available',
      sessionExpiredDesc: 'This session has exceeded the 72-hour retention limit. To preserve user privacy, photos and videos are no longer accessible.',
      activeBadge: 'Active',
      masterpieceTitle: 'Your Masterpiece is Ready',
      masterpieceDesc: 'Save your moments. Download the static photo strip (JPG) or motion Live Moment (MP4), and share with friends.',
      available72Hours: 'Available for 72 Hours',
      remainingText: (h, m) => `Remaining ${h}h ${m}m`,
      retentionNotice: 'This result will expire after 72 hours. Save your photos and videos before the session ends.',
      staticResultJpg: 'Static Result (JPG)',
      staticResultDesc: 'High-res printable strip',
      liveMomentVideo: 'Live Moment (Video)',
      liveMomentDesc: 'Motion video clip of the moment',
      downloadJpgBtn: 'STATIC JPG',
      downloadVideoBtn: 'LIVE MOMENT',
      copyLinkBtn: 'COPY LINK',
      linkCopiedBtn: 'LINK COPIED',
      makeAnotherBtn: 'MAKE ANOTHER',
      resultId: 'RESULT ID',
      frameStyle: 'FRAME STYLE',
      layoutLabel: 'LAYOUT',
      createdAtLabel: 'CREATED AT',
      statusLabel: 'STATUS',
      expiredStatus: 'EXPIRED (> 72 Hours)',
      retentionPolicyLabel: '72-Hour Auto Expire',
      privacyLink: 'Privacy & Data Policy'
    },
    privacy: {
      badge: 'Data Governance & Privacy',
      title: 'Privacy & Data Policy',
      subtitle: 'Clear, transparent principles on how your photobooth media is stored and protected at Aestho.',
      backStudio: 'Studio',
      lastUpdated: 'Last updated: October 2026 • Aestho Photobooth',
      enterStudio: 'Enter Studio Photobooth',
      policies: [
        {
          title: 'Temporary Media Storage',
          desc: 'Photos and Live Moment clips are stored temporarily to facilitate QR code downloads to your personal device.'
        },
        {
          title: '72-Hour Automatic Expiration',
          desc: 'Each session remains available for exactly 72 hours. Once this window closes, links expire automatically and media is no longer publicly accessible.'
        },
        {
          title: 'Direct Link & QR Access',
          desc: 'Your photobooth results are accessible exclusively via your unique session URL or QR code. Aestho does not list sessions in any public directory.'
        },
        {
          title: 'User Media Ownership',
          desc: 'Sessions are processed directly on your device. You maintain full ownership and control over your poses, images, and created strips.'
        },
        {
          title: 'No Personal Identification Required',
          desc: 'Aestho operates without account registration and does not collect personal identifiers such as names, email addresses, or phone numbers.'
        }
      ]
    }
  },
  id: {
    common: {
      langCode: 'ID',
      switchLang: 'EN',
      back: 'Kembali',
      next: 'Lanjut',
      finish: 'Selesai',
      close: 'Tutup',
      privacyPolicy: 'Kebijakan Privasi & Data',
      loading: 'Memuat...'
    },
    home: {
      tagline: '"Mengabadikan momen, bingkai demi bingkai."',
      enterStudio: 'Masuk Studio',
      privacyPolicy: 'Kebijakan Privasi & Data',
      devCredit: 'Dev',
      requestCharacter: 'Request Karakter',
      supportAestho: 'Dukung Aestho'
    },
    layout: {
      title: 'Pilih Kanvas',
      classicStripName: 'Classic Strip',
      classicStripDesc: 'Strip vertikal 3 foto klasik',
      poster4rName: 'Poster 4R',
      poster4rDesc: 'Grid modern 6 foto 4R',
      comingSoon: 'Segera\nHadir',
      back: 'Kembali',
      next: 'Lanjut'
    },
    mode: {
      title: 'Pilih Gaya',
      back: 'Kembali',
      next: 'Lanjut'
    },
    finalResult: {
      title: 'HASIL AKHIR',
      staticResult: 'HASIL STATIS',
      liveMoment: 'LIVE MOMENT',
      scanResult: 'PINDAI HASIL',
      yourQrCode: 'KODE QR ANDA',
      qrDesc: 'Pindai kode ini untuk membuka halaman hasil Aestho beserta foto JPG dan Live Moment.',
      openResultPage: 'BUKA HALAMAN HASIL',
      copyLink: 'SALIN TAUTAN',
      linkCopied: 'TAUTAN DISALIN',
      downloadJpg: 'JPG',
      downloadVideo: 'VIDEO',
      preparingQr: 'Menyiapkan QR',
      createQr: 'BUAT QR',
      toastCopied: 'Link QR berhasil disalin ke clipboard.',
      toastCopyFailed: 'Gagal menyalin link QR.'
    },
    summary: {
      loadingSession: 'Memuat sesi foto Anda',
      resultNotFound: 'Hasil tidak ditemukan atau sudah tidak tersedia.',
      invalidLink: 'Link hasil tidak valid.',
      supabaseMissing: 'Supabase belum dikonfigurasi.',
      startNewSession: 'Mulai Sesi Baru',
      sessionExpiredBadge: 'Sesi Kedaluwarsa',
      sessionExpiredTitle: 'Result Tidak Lagi Tersedia',
      sessionExpiredDesc: 'Sesi ini telah melewati batas masa simpan 72 jam. Demi menjaga privasi pengguna, foto dan video sesi ini sudah tidak dapat diakses atau diunduh lagi.',
      activeBadge: 'Aktif',
      masterpieceTitle: 'Karya Anda Siap Diunduh',
      masterpieceDesc: 'Simpan kenangan foto kamu. Unduh foto strip statis (JPG) atau klip Live Moment (MP4), lalu bagikan dengan teman-temanmu.',
      available72Hours: 'Tersedia selama 72 Jam',
      remainingText: (h, m) => `Tersisa ${h}j ${m}m`,
      retentionNotice: 'Result ini akan kedaluwarsa setelah 72 jam. Simpan file foto dan videomu sebelum masa aktif berakhir.',
      staticResultJpg: 'Hasil Statis (JPG)',
      staticResultDesc: 'Foto strip cetak siap simpan',
      liveMomentVideo: 'Live Moment (Video)',
      liveMomentDesc: 'Klip video bergerak momen foto',
      downloadJpgBtn: 'UNDUH JPG',
      downloadVideoBtn: 'LIVE MOMENT',
      copyLinkBtn: 'SALIN TAUTAN',
      linkCopiedBtn: 'TAUTAN DISALIN',
      makeAnotherBtn: 'BUAT LAGI',
      resultId: 'ID SESI',
      frameStyle: 'GAYA FRAME',
      layoutLabel: 'TATA LETAK',
      createdAtLabel: 'WAKTU DIBUAT',
      statusLabel: 'STATUS',
      expiredStatus: 'KEDALUWARSA (> 72 Jam)',
      retentionPolicyLabel: 'Kedaluwarsa Otomatis 72 Jam',
      privacyLink: 'Kebijakan Privasi & Data'
    },
    privacy: {
      badge: 'Tata Kelola Data & Privasi',
      title: 'Kebijakan Privasi & Data',
      subtitle: 'Prinsip transparan tentang bagaimana media photobooth Anda dikelola dan dilindungi di Aestho.',
      backStudio: 'Studio',
      lastUpdated: 'Terakhir diperbarui: Oktober 2026 • Aestho Photobooth',
      enterStudio: 'Masuk Studio Photobooth',
      policies: [
        {
          title: 'Penyimpanan Media Sementara',
          desc: 'Foto dan klip Live Moment disimpan secara sementara untuk memfasilitasi pembuatan kode QR dan pengunduhan hasil ke perangkat Anda.'
        },
        {
          title: 'Masa Aktif Otomatis 72 Jam',
          desc: 'Setiap sesi foto aktif selama 72 jam. Setelah masa aktif berakhir, tautan otomatis kedaluwarsa dan media tidak lagi dapat diakses secara publik.'
        },
        {
          title: 'Akses Tautan Langsung & QR',
          desc: 'Hasil sesi photobooth Anda hanya dapat diakses melalui URL unik atau kode QR sesi. Aestho tidak menampilkan sesi Anda di direktori publik mana pun.'
        },
        {
          title: 'Kendali & Kepemilikan Pengguna',
          desc: 'Sesi foto diproses langsung pada perangkat Anda. Anda memegang kendali dan kepemilikan penuh atas setiap foto, pose, dan strip yang dihasilkan.'
        },
        {
          title: 'Bebas Informasi Pribadi',
          desc: 'Aestho tidak membutuhkan pendaftaran akun dan tidak mengumpulkan informasi identitas pribadi seperti nama, email, atau nomor telepon.'
        }
      ]
    }
  }
};

const LANG_STORAGE_KEY = 'aestho-lang';
const LANG_CHANGE_EVENT = 'aestho-lang-change';

export const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'id' || saved === 'en') return saved;
    // Default to 'id' if user browser locale is Indonesian, otherwise 'en'
    const navLang = navigator.language || '';
    return navLang.toLowerCase().startsWith('id') ? 'id' : 'en';
  } catch {
    return 'en';
  }
};

export const setGlobalLanguage = (lang) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT, { detail: lang }));
  } catch (err) {
    console.error('Failed to save language preference', err);
  }
};

export const useTranslation = () => {
  const [lang, setLangState] = useState(getInitialLanguage);

  useEffect(() => {
    const handler = (e) => {
      const newLang = e?.detail || getInitialLanguage();
      setLangState(newLang);
    };

    window.addEventListener(LANG_CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener(LANG_CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const changeLanguage = (newLang) => {
    setLangState(newLang);
    setGlobalLanguage(newLang);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'id' : 'en';
    changeLanguage(nextLang);
  };

  return {
    lang,
    setLang: changeLanguage,
    toggleLanguage,
    t: translations[lang] || translations.en
  };
};
