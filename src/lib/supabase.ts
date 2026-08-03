import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-supabase-project.supabase.co' && supabaseAnonKey !== 'sua_chave_anon_aqui') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[EBD] Supabase client initialized OK:', supabaseUrl);
  } catch (err) {
    console.warn('[EBD] Supabase initialization error:', err);
  }
} else {
  console.warn('[EBD] Supabase DISABLED — check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

/**
 * Resizes and converts image file to compressed Data URL
 */
export function convertFileToCompressedDataUrl(file: File, maxWidth = 800, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Falha ao processar arquivo de imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads file to Supabase Storage bucket with fallback to local compressed Data URL.
 */
export async function uploadImageFile(file: File, folder = 'uploads'): Promise<string> {
  // 1. If Supabase client is available, attempt real cloud storage upload
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const bucketName = 'ebd-media';

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload fallback triggered:', error?.message);
      }
    } catch (e) {
      console.warn('Supabase upload exception fallback:', e);
    }
  }

  // 2. Fallback: Process local file as optimized Data URL for local persistence
  return await convertFileToCompressedDataUrl(file);
}
