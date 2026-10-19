// src/services/togetherRTC.js
// Utility and WebRTC / Realtime service for Aestho Together

export const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const generateRoomId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ASTH-${code}`;
};

export const generatePeerId = () => {
  return `peer_${Math.random().toString(36).substring(2, 10)}`;
};

/**
 * Buat room baru di Supabase dengan layout_id yang dipilih oleh Host
 */
export const createTogetherRoom = async (supabase, hostPeerId, layoutId = 'classic-white') => {
  if (!supabase) throw new Error('Supabase client tidak tersedia');
  const roomId = generateRoomId();

  const { error } = await supabase.from('aestho_together_rooms').insert({
    id: roomId,
    host_id: hostPeerId,
    status: 'waiting',
    layout_id: layoutId || 'classic-white',
  });

  if (error) throw error;
  return roomId;
};

/**
 * Bergabung ke room yang sudah ada
 */
export const joinTogetherRoom = async (supabase, roomId, guestPeerId) => {
  if (!supabase) throw new Error('Supabase client tidak tersedia');
  const cleanId = roomId.trim().toUpperCase();

  const { data: room, error: fetchErr } = await supabase
    .from('aestho_together_rooms')
    .select('*')
    .eq('id', cleanId)
    .single();

  if (fetchErr || !room) {
    throw new Error('Room tidak ditemukan. Pastikan kodenya benar.');
  }
  if (room.status === 'closed') {
    throw new Error('Room ini sudah ditutup.');
  }
  if (room.guest_id && room.guest_id !== guestPeerId) {
    throw new Error('Room sudah penuh (maksimal 2 peserta).');
  }

  const { error: updateErr } = await supabase
    .from('aestho_together_rooms')
    .update({ guest_id: guestPeerId, status: 'active' })
    .eq('id', cleanId);

  if (updateErr) throw updateErr;
  return room;
};

// Map channel aktif untuk pengiriman broadcast instan
const activeChannels = new Map();

/**
 * Kirim sinyal Realtime via Broadcast (ultra cepat) + tabel aestho_together_signals (fallback persisten)
 */
export const sendTogetherSignal = async (supabase, roomId, fromPeerId, type, payload = {}) => {
  if (!supabase || !roomId) return;
  const channel = activeChannels.get(roomId);
  const signalMsg = {
    room_id: roomId,
    from_peer: fromPeerId,
    type,
    payload,
    created_at: new Date().toISOString(),
    signal_id: `${fromPeerId}_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };

  // 1. Kirim via Realtime Broadcast (<50ms direct websocket)
  if (channel) {
    try {
      channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: signalMsg,
      });
    } catch (e) {
      console.warn('[Together] Broadcast send failed, relying on DB:', e);
    }
  }

  // 2. Simpan juga ke tabel aestho_together_signals sebagai fallback persisten
  try {
    await supabase.from('aestho_together_signals').insert({
      room_id: roomId,
      from_peer: fromPeerId,
      type,
      payload,
    });
  } catch (err) {
    console.error('[Together] Gagal menyimpan sinyal ke DB:', err);
  }
};

/**
 * Subscribe ke sinyal Realtime room (mendengarkan Broadcast instan & postgres_changes)
 */
export const subscribeTogetherSignals = (supabase, roomId, myPeerId, onSignal) => {
  if (!supabase || !roomId) return null;

  const channelName = `together_room_${roomId}`;
  const seenSignals = new Set();

  const handleIncomingSignal = (signal) => {
    if (!signal) return;
    if (signal.from_peer === myPeerId) return;

    // Deduplikasi sinyal (karena dikirim via broadcast + postgres_changes)
    const sigKey =
      signal.signal_id ||
      signal.id ||
      `${signal.from_peer}_${signal.type}_${signal.created_at || ''}_${JSON.stringify(signal.payload || {}).slice(0, 30)}`;
    if (seenSignals.has(sigKey)) return;
    seenSignals.add(sigKey);

    if (seenSignals.size > 200) {
      const first = seenSignals.values().next().value;
      seenSignals.delete(first);
    }

    onSignal(signal);
  };

  let channel = activeChannels.get(roomId);
  if (!channel) {
    channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
      },
    });
    activeChannels.set(roomId, channel);
  }

  channel
    .on('broadcast', { event: 'signal' }, (msg) => {
      handleIncomingSignal(msg.payload);
    })
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'aestho_together_signals',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        handleIncomingSignal(payload.new);
      }
    )
    .subscribe();

  return () => {
    activeChannels.delete(roomId);
    supabase.removeChannel(channel);
  };
};

/**
 * Gabungkan video Host (kiri 50%) dan Guest (kanan 50%) ke dalam 1 frame 4:3 proporsional
 * Output: JPEG dataURL standar rasio 4:3 (1024x768) yang pas ke dalam photostrip Aestho
 */
export const captureTogetherFrame = (hostVideo, guestVideo, options = {}) => {
  return new Promise((resolve) => {
    try {
      const W = 1024;
      const H = 768;
      const HALF = W / 2; // 512

      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d', { alpha: false });

      // Background dasar
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, W, H);

      // Helper untuk menggambar separuh frame (cover ratio)
      const renderHalf = (videoEl, xOffset) => {
        if (!videoEl || !videoEl.videoWidth || videoEl.videoWidth === 0) {
          // Placeholder jika salah satu video belum siap
          ctx.fillStyle = '#1f1f1f';
          ctx.fillRect(xOffset, 0, HALF, H);
          return;
        }

        const vw = videoEl.videoWidth;
        const vh = videoEl.videoHeight;
        // Hitung skala agar menutupi area HALF x H
        const scale = Math.max(HALF / vw, H / vh);
        const dw = vw * scale;
        const dh = vh * scale;

        ctx.save();
        ctx.beginPath();
        ctx.rect(xOffset, 0, HALF, H);
        ctx.clip();

        // Terapkan filter (tone) jika ada
        if (options.filter && options.filter !== 'none') {
          ctx.filter = options.filter;
        }

        // Mirror video (selfie view)
        ctx.translate(xOffset + HALF, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoEl, (HALF - dw) / 2, (H - dh) / 2, dw, dh);
        ctx.restore();
      };

      // Gambar Host di sisi KIRI
      renderHalf(hostVideo, 0);

      // Gambar Guest di sisi KANAN
      renderHalf(guestVideo, HALF);

      // Garis pemisah tengah yang halus dan bersih
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(HALF, 0);
      ctx.lineTo(HALF, H);
      ctx.stroke();


      const quality = options.quality || 0.82;
      resolve(canvas.toDataURL('image/jpeg', quality));
    } catch (err) {
      console.error('[Together] Gagal capture frame bersama:', err);
      resolve(null);
    }
  });
};
