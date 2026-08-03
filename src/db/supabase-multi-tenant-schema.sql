-- =========================================================================
-- ISOLAMENTO ESTRITO MULTI-TENANT NO SUPABASE COM ROW LEVEL SECURITY (RLS)
-- =========================================================================
-- Este arquivo define as tabelas e políticas RLS para garantir que os dados de
-- cada estabelecimento fiquem isolados. Idempotente: pode ser re-executado.

-- Extensão necessária para gen_random_uuid() em versões antigas do PG
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABELA DE ESTABELECIMENTOS / EMPRESAS (TENANTS)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'barbearia',
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL, -- Ex: TONI2026, CORTEARTES
  slug TEXT UNIQUE NOT NULL,        -- Ex: toni-do-corte, corte-artes
  owner_name TEXT,
  owner_email TEXT,
  logo_url TEXT,
  cover_banner_url TEXT,
  address TEXT,
  city TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  instagram TEXT,
  rating NUMERIC DEFAULT 5.0,
  total_reviews INT DEFAULT 0,
  is_open BOOLEAN DEFAULT true,
  working_hours TEXT DEFAULT 'Segunda a Sábado, 09:00 às 19:00',
  slot_interval_minutes INT DEFAULT 30,
  plan_days INT DEFAULT 30,
  plan_expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  plan_created_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas adicionadas em versões posteriores (idempotente)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS plan_days INT DEFAULT 30;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS plan_created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Política RLS: Todos podem consultar estabelecimentos por código de convite ou ID
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'businesses' AND policyname = 'Permitir leitura pública de estabelecimentos por código') THEN
    CREATE POLICY "Permitir leitura pública de estabelecimentos por código"
      ON public.businesses FOR SELECT
      USING (true);
  END IF;
END $$;

-- 2. TABELA DE USUÁRIOS VINCULADOS AO TENANT
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'client', -- 'superadmin', 'admin', 'staff', 'client'
  staff_id UUID,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS staff_id UUID;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. TABELA DE SERVIÇOS DO TENANT
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  price NUMERIC(10, 2) NOT NULL,
  icon_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS icon_name TEXT;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Política RLS Estrita: Leitura e escrita isoladas estritamente por business_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Isolamento Estrito por Tenant - Services Select') THEN
    CREATE POLICY "Isolamento Estrito por Tenant - Services Select"
      ON public.services FOR SELECT
      USING (business_id = (current_setting('app.current_business_id', true))::uuid OR auth.jwt() ->> 'business_id' = business_id::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Isolamento Estrito por Tenant - Services Insert/Update/Delete') THEN
    CREATE POLICY "Isolamento Estrito por Tenant - Services Insert/Update/Delete"
      ON public.services FOR ALL
      USING (business_id = (current_setting('app.current_business_id', true))::uuid OR auth.jwt() ->> 'business_id' = business_id::text);
  END IF;
END $$;

-- 4. TABELA DE PROFISSIONAIS DO TENANT
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  rating NUMERIC DEFAULT 5.0,
  specialties TEXT[],
  available_days TEXT[],
  work_start TEXT DEFAULT '09:00',
  work_end TEXT DEFAULT '19:00',
  lunch_start TEXT,
  lunch_end TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_members' AND policyname = 'Isolamento Estrito por Tenant - Staff All') THEN
    CREATE POLICY "Isolamento Estrito por Tenant - Staff All"
      ON public.staff_members FOR ALL
      USING (business_id = (current_setting('app.current_business_id', true))::uuid OR auth.jwt() ->> 'business_id' = business_id::text);
  END IF;
END $$;

-- 5. TABELA DE AGENDAMENTOS DO TENANT
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  service_price NUMERIC(10, 2) NOT NULL,
  duration_minutes INT NOT NULL,
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  staff_name TEXT NOT NULL,
  staff_avatar TEXT,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'pending', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS staff_avatar TEXT;

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Isolamento Estrito por Tenant - Appointments All') THEN
    CREATE POLICY "Isolamento Estrito por Tenant - Appointments All"
      ON public.appointments FOR ALL
      USING (business_id = (current_setting('app.current_business_id', true))::uuid OR auth.jwt() ->> 'business_id' = business_id::text);
  END IF;
END $$;

-- 6. TABELA DE HORÁRIOS BLOQUEADOS DA AGENDA
CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  staff_id TEXT NOT NULL, -- 'all' ou ID do profissional
  staff_name TEXT,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.blocked_slots ADD COLUMN IF NOT EXISTS staff_name TEXT;

ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blocked_slots' AND policyname = 'Isolamento Estrito por Tenant - Blocked Slots All') THEN
    CREATE POLICY "Isolamento Estrito por Tenant - Blocked Slots All"
      ON public.blocked_slots FOR ALL
      USING (business_id = (current_setting('app.current_business_id', true))::uuid OR auth.jwt() ->> 'business_id' = business_id::text);
  END IF;
END $$;

-- Notas importantes para ativação completa:
-- 1) As políticas acima exigem que cada requisição informe o tenant via
--    current_setting('app.current_business_id') ou claim JWT 'business_id'.
--    Para o cliente rodar com a anon key, ou ative o Supabase Auth e emita
--    JWTs com a claim business_id, ou relaxe as políticas conforme o nível
--    de confiança desejado (o app já aplica RBAC na camada de UI).
-- 2) A tabela users guarda password_hash para as contas criadas no app.
-- 3) Para executar este script: npm run db:schema  (usa DIRECT_URL)
