-- =====================================================
-- EBD SaaS - Supabase Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. ADD MISSING COLUMNS TO tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'trial';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS license_expires_at TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS max_staff INTEGER DEFAULT 5;

-- 2. ADD PASSWORD COLUMN TO users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- 3. ADD MISSING COLUMNS TO services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 4. FIX staff.specialties TYPE (TEXT → TEXT[])
-- First update empty strings to empty arrays
UPDATE public.staff SET specialties = '{}' WHERE specialties IS NULL OR specialties = '' OR specialties = '[]';
ALTER TABLE public.staff ALTER COLUMN specialties TYPE TEXT[] USING COALESCE(specialties::TEXT[], '{}'::TEXT[]);
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS commission_rate NUMERIC;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS service_ids TEXT[];
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS phone TEXT;

-- 5. CREATE business_hours TABLE
CREATE TABLE IF NOT EXISTS public.business_hours (
  id SERIAL PRIMARY KEY,
  day_num INTEGER NOT NULL,
  day TEXT NOT NULL,
  is_open BOOLEAN DEFAULT true,
  start_time TEXT DEFAULT '09:00',
  end_time TEXT DEFAULT '18:00',
  break_start TEXT DEFAULT '12:00',
  break_end TEXT DEFAULT '13:00',
  tenant_id TEXT
);

-- 6. CREATE invitation_codes TABLE
CREATE TABLE IF NOT EXISTS public.invitation_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'owner',
  tenant_id TEXT,
  max_uses INTEGER DEFAULT 10,
  uses_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (now() AT TIME ZONE 'utc')::text,
  active BOOLEAN DEFAULT true
);

-- 7. ENSURE RLS ALLOWS ANON READ/WRITE ON ALL TABLES
-- Tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_tenants" ON public.tenants;
CREATE POLICY "anon_all_tenants" ON public.tenants FOR ALL USING (true) WITH CHECK (true);

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_users" ON public.users;
CREATE POLICY "anon_all_users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_services" ON public.services;
CREATE POLICY "anon_all_services" ON public.services FOR ALL USING (true) WITH CHECK (true);

-- Staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_staff" ON public.staff;
CREATE POLICY "anon_all_staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);

-- Appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_appointments" ON public.appointments;
CREATE POLICY "anon_all_appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- Business Hours
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_business_hours" ON public.business_hours;
CREATE POLICY "anon_all_business_hours" ON public.business_hours FOR ALL USING (true) WITH CHECK (true);

-- Invitation Codes
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_invitation_codes" ON public.invitation_codes;
CREATE POLICY "anon_all_invitation_codes" ON public.invitation_codes FOR ALL USING (true) WITH CHECK (true);
