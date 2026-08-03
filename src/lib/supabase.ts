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
 * End-to-end Supabase diagnostic. Runs on boot.
 * Tests: client init → SELECT → INSERT → DELETE
 * Check browser console for [EBD-DIAG] prefixed results.
 */
export async function runSupabaseDiagnostics(): Promise<void> {
  const tag = '[EBD-DIAG]';
  const line = '─'.repeat(50);

  console.log(`${tag} STARTING SUPABASE DIAGNOSTICS ${line}`);
  console.log(`${tag} URL:`, import.meta.env.VITE_SUPABASE_URL || '(missing)');
  console.log(`${tag} KEY:`, import.meta.env.VITE_SUPABASE_ANON_KEY ? `SET (${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...)` : '(MISSING!)');

  // STEP 1: Client init
  if (!supabase) {
    console.error(`${tag} FATAL: supabase client is NULL. Env vars not set or invalid.`);
    console.error(`${tag} FIX: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Vercel → Settings → Environment Variables`);
    console.log(`${tag} END — BLOCKED AT STEP 1 ${line}`);
    return;
  }
  console.log(`${tag} STEP 1 OK: Supabase client initialized`);

  // STEP 2: SELECT (read)
  try {
    const { data: readData, error: readError } = await supabase
      .from('tenants')
      .select('id, name')
      .limit(3);

    if (readError) {
      console.error(`${tag} STEP 2 FAIL (SELECT):`, readError.message, readError.details);
    } else {
      console.log(`${tag} STEP 2 OK (SELECT):`, readData?.length, 'tenants found', readData);
    }
  } catch (e: any) {
    console.error(`${tag} STEP 2 EXCEPTION (SELECT):`, e.message);
  }

  // STEP 3: INSERT (write)
  const testId = `diag-${Date.now()}`;
  try {
    const { data: writeData, error: writeError } = await supabase
      .from('tenants')
      .insert([{ id: testId, name: 'DIAG_TEST', slug: 'diag-test', active: false, plan: 'trial', created_at: new Date().toISOString() }])
      .select()
      .single();

    if (writeError) {
      console.error(`${tag} STEP 3 FAIL (INSERT):`, writeError.message, writeError.details);
      console.error(`${tag} This means RLS or schema is blocking writes`);
    } else {
      console.log(`${tag} STEP 3 OK (INSERT):`, writeData?.id, writeData?.name);
    }
  } catch (e: any) {
    console.error(`${tag} STEP 3 EXCEPTION (INSERT):`, e.message);
  }

  // STEP 4: DELETE (cleanup)
  try {
    const { error: delError } = await supabase
      .from('tenants')
      .delete()
      .eq('id', testId);

    if (delError) {
      console.error(`${tag} STEP 4 FAIL (DELETE):`, delError.message);
    } else {
      console.log(`${tag} STEP 4 OK (DELETE): test record cleaned up`);
    }
  } catch (e: any) {
    console.error(`${tag} STEP 4 EXCEPTION (DELETE):`, e.message);
  }

  console.log(`${tag} END — ALL STEPS COMPLETE ${line}`);
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
