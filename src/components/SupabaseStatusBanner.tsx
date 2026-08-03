import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Status = 'checking' | 'ok' | 'error';

export function SupabaseStatusBanner() {
  const [status, setStatus] = useState<Status>('checking');
  const [message, setMessage] = useState('Verificando conexão com Supabase...');

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!url || !key) {
        if (!cancelled) {
          setStatus('error');
          setMessage('❌ VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não encontradas. Adicione no Vercel → Settings → Env Vars e faça redeploy.');
        }
        return;
      }

      if (!supabase) {
        if (!cancelled) {
          setStatus('error');
          setMessage(`❌ Cliente Supabase não inicializou. URL="${url}" KEY="${key.substring(0, 15)}..."`);
        }
        return;
      }

      try {
        const { data, error } = await supabase.from('tenants').select('id').limit(1);

        if (error) {
          if (!cancelled) {
            setStatus('error');
            setMessage(`❌ SELECT falhou: ${error.message}`);
          }
          return;
        }

        if (!cancelled) {
          setStatus('ok');
          setMessage(`✅ Supabase OK — ${data?.length ?? 0} tenant(s) visível(is) via RLS`);
        }
      } catch (e: any) {
        if (!cancelled) {
          setStatus('error');
          setMessage(`❌ Exceção na conexão: ${e.message}`);
        }
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);

  if (status === 'checking') {
    return (
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-sm text-yellow-800 text-center">
        {message}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-100 border-b border-red-300 px-4 py-2 text-sm text-red-800 text-center font-medium">
        {message}
      </div>
    );
  }

  return (
    <div className="bg-green-100 border-b border-green-300 px-4 py-2 text-sm text-green-800 text-center">
      {message}
    </div>
  );
}
