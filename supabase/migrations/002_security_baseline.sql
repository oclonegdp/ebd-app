-- Security baseline. Apply only after backing up the project.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.users DROP COLUMN IF EXISTS password;

CREATE INDEX IF NOT EXISTS users_auth_user_id_idx ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS users_tenant_id_idx ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS appointments_tenant_date_idx ON public.appointments(tenant_id, date);

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Remove the previous policies that granted anonymous full access.
DO $$
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname LIKE 'anon_all_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, policy_record.tablename);
  END LOOP;
END $$;

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenants_select_secure ON public.tenants;
DROP POLICY IF EXISTS tenants_write_secure ON public.tenants;
CREATE POLICY tenants_select_secure ON public.tenants FOR SELECT
  USING (active = true OR public.is_super_admin() OR id = public.current_tenant_id());
CREATE POLICY tenants_write_secure ON public.tenants FOR ALL
  USING (public.is_super_admin() OR id = public.current_tenant_id())
  WITH CHECK (public.is_super_admin() OR id = public.current_tenant_id());

DROP POLICY IF EXISTS users_select_secure ON public.users;
DROP POLICY IF EXISTS users_insert_secure ON public.users;
DROP POLICY IF EXISTS users_update_secure ON public.users;
DROP POLICY IF EXISTS users_delete_secure ON public.users;
CREATE POLICY users_select_secure ON public.users FOR SELECT
  USING (public.is_super_admin() OR auth_user_id = auth.uid() OR tenant_id = public.current_tenant_id());
CREATE POLICY users_insert_secure ON public.users FOR INSERT
  WITH CHECK (public.is_super_admin() OR (tenant_id = public.current_tenant_id() AND role <> 'super_admin'));
CREATE POLICY users_update_secure ON public.users FOR UPDATE
  USING (public.is_super_admin() OR (tenant_id = public.current_tenant_id() AND role <> 'super_admin'))
  WITH CHECK (public.is_super_admin() OR (tenant_id = public.current_tenant_id() AND role <> 'super_admin'));
CREATE POLICY users_delete_secure ON public.users FOR DELETE
  USING (public.is_super_admin() OR (tenant_id = public.current_tenant_id() AND role <> 'super_admin'));

DROP POLICY IF EXISTS services_public_read ON public.services;
DROP POLICY IF EXISTS services_tenant_write ON public.services;
CREATE POLICY services_public_read ON public.services FOR SELECT USING (active = true);
CREATE POLICY services_tenant_write ON public.services FOR ALL
  USING (public.is_super_admin() OR tenant_id = public.current_tenant_id())
  WITH CHECK (public.is_super_admin() OR tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS staff_tenant_access ON public.staff;
CREATE POLICY staff_tenant_access ON public.staff FOR ALL
  USING (public.is_super_admin() OR tenant_id = public.current_tenant_id())
  WITH CHECK (public.is_super_admin() OR tenant_id = public.current_tenant_id());

CREATE OR REPLACE FUNCTION public.is_valid_public_booking(target_tenant_id TEXT, target_service_id TEXT, target_staff_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff st
    WHERE st.id = target_staff_id AND st.tenant_id = target_tenant_id
  );
$$;

DROP POLICY IF EXISTS appointments_public_insert ON public.appointments;
DROP POLICY IF EXISTS appointments_tenant_access ON public.appointments;
CREATE POLICY appointments_public_insert ON public.appointments FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND t.active = true)
    AND EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_id AND s.tenant_id = tenant_id AND s.active = true)
    AND public.is_valid_public_booking(tenant_id, service_id, staff_id)
  );
CREATE POLICY appointments_tenant_access ON public.appointments FOR ALL
  USING (public.is_super_admin() OR tenant_id = public.current_tenant_id())
  WITH CHECK (public.is_super_admin() OR tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS business_hours_public_read ON public.business_hours;
DROP POLICY IF EXISTS business_hours_tenant_write ON public.business_hours;
CREATE POLICY business_hours_public_read ON public.business_hours FOR SELECT USING (true);
CREATE POLICY business_hours_tenant_write ON public.business_hours FOR ALL
  USING (public.is_super_admin() OR tenant_id = public.current_tenant_id())
  WITH CHECK (public.is_super_admin() OR tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS invitation_codes_admin_only ON public.invitation_codes;
CREATE POLICY invitation_codes_admin_only ON public.invitation_codes FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Public staff data excludes email and phone. The application must use this view for the vitrine.
CREATE OR REPLACE VIEW public.public_staff
AS
SELECT id, tenant_id, name, bio, avatar_url, specialties, service_ids
FROM public.staff;

GRANT SELECT ON public.public_staff TO anon, authenticated;
