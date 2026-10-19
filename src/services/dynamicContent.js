// ==================================================================================
// DYNAMIC CONTENT SERVICE: Cloudinary Upload & Supabase Frame / Character Management
// ==================================================================================

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload single image (PNG/JPG) to Cloudinary via client-safe unsigned preset
 */
export const uploadAssetToCloudinary = async (file, folder = 'aestho-frames') => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary environment variables (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET) belum disetting.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Gagal mengunggah file ke Cloudinary.');
  }

  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height
  };
};

// ==================================================================================
// FRAME MANAGEMENT HELPERS
// ==================================================================================

export const fetchAdminFrames = async (supabase) => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('aestho_frames')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Fetch admin frames notice (tabel aestho_frames mungkin belum dibuat):', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Fetch admin frames error:', err);
    return [];
  }
};

export const fetchActiveFrames = async (supabase) => {
  if (!supabase) return [];
  try {
    // 1. Coba select dengan filter is_active = true
    let { data, error } = await supabase
      .from('aestho_frames')
      .select('*')
      .or('is_active.eq.true,is_active.is.null');

    // 2. Jika filter gagal (misal RLS / syntax), fallback query select all
    if (error) {
      console.warn('[Aestho] Notice query aestho_frames:', error.message);
      const fallbackRes = await supabase.from('aestho_frames').select('*');
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      console.warn('[Aestho] Gagal memuat tabel aestho_frames dari Supabase:', error.message);
      return [];
    }

    // 3. Filter di JavaScript: hanya ambil yang is_active = true
    const activeFrames = (data || []).filter((row) => {
      if (row.is_active === false || row.is_active === 'false' || row.is_active === 0) {
        return false;
      }
      return true;
    });

    console.log(`[Aestho Dynamic Frames] Berhasil memuat ${activeFrames.length} frame aktif dari Supabase.`);
    return activeFrames;
  } catch (err) {
    console.warn('[Aestho] Exception saat fetchActiveFrames:', err);
    return [];
  }
};

export const createFrame = async (supabase, frameData) => {
  if (!supabase) throw new Error('Supabase client tidak tersedia.');
  const { data, error } = await supabase
    .from('aestho_frames')
    .insert([
      {
        name: frameData.name,
        category: frameData.category || 'aestho',
        layout_id: frameData.layout_id || 'classic-white',
        overlay_url: frameData.overlay_url,
        bg_color: frameData.bg_color || '#ffffff',
        photo_radius: frameData.photo_radius || 'rounded-xl',
        hide_footer: frameData.hide_footer !== false,
        artist_credit: frameData.artist_credit || '',
        is_active: frameData.is_active !== false
      }
    ])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const toggleFrameStatus = async (supabase, frameId, isActive) => {
  if (!supabase) throw new Error('Supabase client tidak tersedia.');
  const { error } = await supabase
    .from('aestho_frames')
    .update({ is_active: isActive })
    .eq('id', frameId);

  if (error) throw error;
};

export const deleteFrame = async (supabase, frameId) => {
  if (!supabase) throw new Error('Supabase client tidak tersedia.');
  const { error } = await supabase
    .from('aestho_frames')
    .delete()
    .eq('id', frameId);

  if (error) throw error;
};

// ==================================================================================
// CHARACTER MANAGEMENT HELPERS
// ==================================================================================

export const fetchAdminCharacters = async (supabase) => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('aestho_characters')
      .select(`
        *,
        poses:aestho_character_poses(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Fetch admin characters notice (tabel aestho_characters mungkin belum dibuat):', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Fetch admin characters error:', err);
    return [];
  }
};

export const fetchActiveCharacters = async (supabase) => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('aestho_characters')
      .select(`
        *,
        poses:aestho_character_poses(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
};

export const createCharacterWithPoses = async (supabase, characterData, posesData = []) => {
  if (!supabase) throw new Error('Supabase client tidak tersedia.');

  // 1. Insert Character Head
  const { data: charData, error: charError } = await supabase
    .from('aestho_characters')
    .insert([
      {
        name: characterData.name,
        series: characterData.series || 'Custom',
        position: characterData.position || 'right',
        default_width: characterData.default_width || 'w-[60%]',
        default_height: Number(characterData.default_height) || 100,
        x_offset: Number(characterData.x_offset) || 0,
        y_offset: Number(characterData.y_offset) || 0,
        artist_credit: characterData.artist_credit || '',
        is_active: characterData.is_active !== false
      }
    ])
    .select();

  if (charError) throw charError;
  const newChar = charData?.[0];
  if (!newChar) throw new Error('Gagal membuat data karakter.');

  // 2. Insert Poses if available
  if (Array.isArray(posesData) && posesData.length > 0) {
    const rowsToInsert = posesData
      .filter((p) => p.image_url)
      .map((p, idx) => ({
        character_id: newChar.id,
        pose_index: typeof p.pose_index === 'number' ? p.pose_index : idx,
        image_url: p.image_url,
        width_percent: Number(p.width_percent) || 60,
        height_percent: Number(p.height_percent) || 100,
        x_offset: Number(p.x_offset) || 0,
        y_offset: Number(p.y_offset) || 0
      }));

    if (rowsToInsert.length > 0) {
      const { error: posesError } = await supabase
        .from('aestho_character_poses')
        .insert(rowsToInsert);

      if (posesError) {
        console.warn('Gagal menyimpan poses:', posesError);
      }
    }
  }

  return newChar;
};

export const toggleCharacterStatus = async (supabase, charId, isActive) => {
  if (!supabase) throw new Error('Supabase client tidak tersedia.');
  const { error } = await supabase
    .from('aestho_characters')
    .update({ is_active: isActive })
    .eq('id', charId);

  if (error) throw error;
};

export const deleteCharacter = async (supabase, charId) => {
  if (!supabase) throw new Error('Supabase client tidak tersedia.');
  const { error } = await supabase
    .from('aestho_characters')
    .delete()
    .eq('id', charId);

  if (error) throw error;
};

// ==================================================================================
// FORMATTERS FOR APP.JSX INTEGRATION
// ==================================================================================

export const formatDbFrameToTemplate = (dbFrame) => {
  // Normalisasi layoutId: 'classic-white' vs 'grid-4r'
  const rawLayout = String(
    dbFrame.layout_id || dbFrame.layoutId || 'classic-white'
  ).toLowerCase().trim();
  const layoutId = rawLayout.includes('4r') || rawLayout.includes('1200') || rawLayout.includes('grid')
    ? 'grid-4r'
    : 'classic-white';

  // Normalisasi category: 'genshin' atau 'aestho'
  const rawCat = String(
    dbFrame.category || 'aestho'
  ).toLowerCase().trim();
  const category = rawCat.includes('genshin') ? 'genshin' : 'aestho';

  const bgColor = dbFrame.bg_color || dbFrame.bgColor || '#ffffff';
  const photoRadius = dbFrame.photo_radius || dbFrame.photoRadius || 'rounded-xl';
  const overlayUrl = (dbFrame.overlay_url || dbFrame.overlayUrl || '').trim();
  const hideFooter = dbFrame.hide_footer !== false && dbFrame.hideFooter !== false;

  return {
    id: `dyn-frame-${dbFrame.id || Math.random().toString(36).slice(2)}`,
    rawId: dbFrame.id,
    layoutId,
    name: dbFrame.name || 'Custom Frame',
    category,
    type: 'css',
    bgColor,
    textColor: 'black',
    overlayUrl,
    styleContainer: { backgroundColor: bgColor },
    photoRadius,
    hideFooter,
    artistCredit: dbFrame.artist_credit || dbFrame.artistCredit || '',
    isDynamic: true
  };
};

export const formatDbCharacterToAppCharacter = (dbChar) => {
  const poses = Array.isArray(dbChar.poses) ? [...dbChar.poses] : [];
  poses.sort((a, b) => (a.pose_index || 0) - (b.pose_index || 0));

  const overlayImg = poses.map((p) => p.image_url);

  const styles = {};
  const heightStyles = {};

  poses.forEach((p, idx) => {
    const widthVal = p.width_percent || 60;
    styles[idx] = `w-[${widthVal}%]`;
    heightStyles[idx] = p.height_percent || 100;
  });

  return {
    id: `dyn-char-${dbChar.id}`,
    rawId: dbChar.id,
    name: dbChar.name,
    series: dbChar.series || 'Custom Series',
    overlayImg: overlayImg.length > 0 ? overlayImg : (dbChar.default_image || ''),
    theme: 'bg-zinc-50',
    position: dbChar.position || 'right',
    styles: Object.keys(styles).length > 0 ? styles : { 0: dbChar.default_width || 'w-[60%]' },
    heightStyles: Object.keys(heightStyles).length > 0 ? heightStyles : { 0: dbChar.default_height || 100 },
    xOffset: dbChar.x_offset || 0,
    yOffset: dbChar.y_offset || 0,
    artistCredit: dbChar.artist_credit || '',
    isDynamic: true
  };
};
