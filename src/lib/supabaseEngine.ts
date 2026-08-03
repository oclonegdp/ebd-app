import { supabase } from './supabase';
import { Tenant, User, Service, StaffMember, Appointment, BusinessHours, InvitationCode } from '../types';

export const supabaseEngine = {
  /**
   * Sync all tables from Supabase into localStorage and return fetched data.
   */
  async syncAllFromSupabase(): Promise<{
    tenants?: Tenant[];
    users?: User[];
    services?: Service[];
    staff?: StaffMember[];
    appointments?: Appointment[];
    businessHours?: BusinessHours[];
    invitations?: InvitationCode[];
  }> {
    if (!supabase) return {};

    const result: {
      tenants?: Tenant[];
      users?: User[];
      services?: Service[];
      staff?: StaffMember[];
      appointments?: Appointment[];
      businessHours?: BusinessHours[];
      invitations?: InvitationCode[];
    } = {};

    try {
      // 1. Tenants
      const { data: tenantsData, error: tenantsError } = await supabase.from('tenants').select('*');
      if (tenantsError) console.error('[EBD] sync tenants ERROR:', tenantsError.message);
      else if (tenantsData) result.tenants = tenantsData as Tenant[];

      // 2. Users
      const { data: usersData, error: usersError } = await supabase.from('users').select('*');
      if (usersError) console.error('[EBD] sync users ERROR:', usersError.message);
      else if (usersData) result.users = usersData as User[];

      // 3. Services
      const { data: servicesData, error: servicesError } = await supabase.from('services').select('*');
      if (servicesError) console.error('[EBD] sync services ERROR:', servicesError.message);
      else if (servicesData) result.services = servicesData as Service[];

      // 4. Staff
      const { data: staffData, error: staffError } = await supabase.from('staff').select('*');
      if (staffError) console.error('[EBD] sync staff ERROR:', staffError.message);
      else if (staffData) result.staff = staffData as StaffMember[];

      // 5. Appointments
      const { data: aptData, error: aptError } = await supabase.from('appointments').select('*');
      if (aptError) console.error('[EBD] sync appointments ERROR:', aptError.message);
      else if (aptData) result.appointments = aptData as Appointment[];

      // 6. Business Hours (snake_case → camelCase)
      const { data: bhData, error: bhError } = await supabase.from('business_hours').select('*');
      if (bhError) console.error('[EBD] sync business_hours ERROR:', bhError.message);
      else if (bhData) {
        result.businessHours = bhData.map((h: any) => ({
          dayNum: h.day_num,
          day: h.day,
          isOpen: h.is_open,
          startTime: h.start_time,
          endTime: h.end_time,
          breakStart: h.break_start,
          breakEnd: h.break_end,
          tenant_id: h.tenant_id,
        })) as BusinessHours[];
      }

      // 7. Invitations
      const { data: invData, error: invError } = await supabase.from('invitation_codes').select('*');
      if (invError) console.error('[EBD] sync invitation_codes ERROR:', invError.message);
      else if (invData) result.invitations = invData as InvitationCode[];

      console.log('[EBD] syncAllFromSupabase done:', Object.keys(result).length, 'tables fetched');
    } catch (err) {
      console.error('[EBD] syncAllFromSupabase FATAL:', err);
    }

    return result;
  },

  /**
   * Fetch tenant and related data by slug directly from Supabase
   */
  async fetchTenantBySlug(slug: string): Promise<Tenant | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('tenants').select('*').eq('slug', slug).single();
      if (!error && data) {
        return data as Tenant;
      }
    } catch (err) {
      console.warn('Erro ao buscar loja do Supabase por slug:', err);
    }
    return null;
  },

  // WRITE OPERATIONS TO SUPABASE

  async upsertTenant(tenant: Tenant): Promise<void> {
    if (!supabase) { console.warn('[EBD] upsertTenant skipped: no Supabase client'); return; }
    try {
      const { data, error } = await supabase.from('tenants').upsert([tenant]).select();
      if (error) console.error('[EBD] upsertTenant ERROR:', error.message, error.details);
      else console.log('[EBD] upsertTenant OK:', tenant.id);
    } catch (e) {
      console.error('[EBD] upsertTenant EXCEPTION:', e);
    }
  },

  async upsertUser(user: User): Promise<void> {
    if (!supabase) { console.warn('[EBD] upsertUser skipped: no Supabase client'); return; }
    try {
      const { data, error } = await supabase.from('users').upsert([user]).select();
      if (error) console.error('[EBD] upsertUser ERROR:', error.message, error.details);
      else console.log('[EBD] upsertUser OK:', user.id);
    } catch (e) {
      console.error('[EBD] upsertUser EXCEPTION:', e);
    }
  },

  async upsertService(service: Service): Promise<void> {
    if (!supabase) { console.warn('[EBD] upsertService skipped: no Supabase client'); return; }
    try {
      const { data, error } = await supabase.from('services').upsert([service]).select();
      if (error) console.error('[EBD] upsertService ERROR:', error.message, error.details);
      else console.log('[EBD] upsertService OK:', service.id);
    } catch (e) {
      console.error('[EBD] upsertService EXCEPTION:', e);
    }
  },

  async deleteService(id: string): Promise<void> {
    if (!supabase) { console.warn('[EBD] deleteService skipped: no Supabase client'); return; }
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) console.error('[EBD] deleteService ERROR:', error.message, error.details);
      else console.log('[EBD] deleteService OK:', id);
    } catch (e) {
      console.error('[EBD] deleteService EXCEPTION:', e);
    }
  },

  async deleteUser(id: string): Promise<void> {
    if (!supabase) { console.warn('[EBD] deleteUser skipped: no Supabase client'); return; }
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) console.error('[EBD] deleteUser ERROR:', error.message, error.details);
      else console.log('[EBD] deleteUser OK:', id);
    } catch (e) {
      console.error('[EBD] deleteUser EXCEPTION:', e);
    }
  },

  async deleteTenant(id: string): Promise<void> {
    if (!supabase) { console.warn('[EBD] deleteTenant skipped: no Supabase client'); return; }
    try {
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) console.error('[EBD] deleteTenant ERROR:', error.message, error.details);
      else console.log('[EBD] deleteTenant OK:', id);
    } catch (e) {
      console.error('[EBD] deleteTenant EXCEPTION:', e);
    }
  },

  async upsertStaff(staffMember: StaffMember): Promise<void> {
    if (!supabase) { console.warn('[EBD] upsertStaff skipped: no Supabase client'); return; }
    try {
      const { data, error } = await supabase.from('staff').upsert([staffMember]).select();
      if (error) console.error('[EBD] upsertStaff ERROR:', error.message, error.details);
      else console.log('[EBD] upsertStaff OK:', staffMember.id);
    } catch (e) {
      console.error('[EBD] upsertStaff EXCEPTION:', e);
    }
  },

  async deleteStaff(id: string): Promise<void> {
    if (!supabase) { console.warn('[EBD] deleteStaff skipped: no Supabase client'); return; }
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) console.error('[EBD] deleteStaff ERROR:', error.message, error.details);
      else console.log('[EBD] deleteStaff OK:', id);
    } catch (e) {
      console.error('[EBD] deleteStaff EXCEPTION:', e);
    }
  },

  async upsertAppointment(appointment: Appointment): Promise<void> {
    if (!supabase) { console.warn('[EBD] upsertAppointment skipped: no Supabase client'); return; }
    try {
      const { data, error } = await supabase.from('appointments').upsert([appointment]).select();
      if (error) console.error('[EBD] upsertAppointment ERROR:', error.message, error.details);
      else console.log('[EBD] upsertAppointment OK:', appointment.id);
    } catch (e) {
      console.error('[EBD] upsertAppointment EXCEPTION:', e);
    }
  },

  async deleteAppointment(id: string): Promise<void> {
    if (!supabase) { console.warn('[EBD] deleteAppointment skipped: no Supabase client'); return; }
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) console.error('[EBD] deleteAppointment ERROR:', error.message, error.details);
      else console.log('[EBD] deleteAppointment OK:', id);
    } catch (e) {
      console.error('[EBD] deleteAppointment EXCEPTION:', e);
    }
  },

  async saveBusinessHours(hours: BusinessHours[]): Promise<void> {
    if (!supabase) { console.warn('[EBD] saveBusinessHours skipped: no Supabase client'); return; }
    try {
      // Map camelCase → snake_case for DB columns
      const mapped = hours.map((h) => ({
        day_num: h.dayNum,
        day: h.day,
        is_open: h.isOpen,
        start_time: h.startTime,
        end_time: h.endTime,
        break_start: h.breakStart,
        break_end: h.breakEnd,
        tenant_id: (h as any).tenant_id || null,
      }));
      const { error } = await supabase.from('business_hours').upsert(mapped);
      if (error) console.error('[EBD] saveBusinessHours ERROR:', error.message, error.details);
      else console.log('[EBD] saveBusinessHours OK');
    } catch (e) {
      console.error('[EBD] saveBusinessHours EXCEPTION:', e);
    }
  },

  async upsertInvitationCode(invitation: InvitationCode): Promise<void> {
    if (!supabase) { console.warn('[EBD] upsertInvitationCode skipped: no Supabase client'); return; }
    try {
      const { data, error } = await supabase.from('invitation_codes').upsert([invitation]).select();
      if (error) console.error('[EBD] upsertInvitationCode ERROR:', error.message, error.details);
      else console.log('[EBD] upsertInvitationCode OK:', invitation.id);
    } catch (e) {
      console.error('[EBD] upsertInvitationCode EXCEPTION:', e);
    }
  },

  /**
   * Seed defaults into Supabase if tables are currently empty
   */
  async seedDefaultsIfEmpty(defaults: {
    tenants: Tenant[];
    users: User[];
    services: Service[];
    staff: StaffMember[];
    invitations: InvitationCode[];
  }): Promise<void> {
    if (!supabase) return;
    try {
      const { data: existingTenants } = await supabase.from('tenants').select('id').limit(1);
      if (!existingTenants || existingTenants.length === 0) {
        await supabase.from('tenants').upsert(defaults.tenants);
        await supabase.from('users').upsert(defaults.users);
        await supabase.from('services').upsert(defaults.services);
        await supabase.from('staff').upsert(defaults.staff);
        await supabase.from('invitation_codes').upsert(defaults.invitations);
      }
    } catch (e) {
      console.warn('Error seeding defaults into Supabase:', e);
    }
  },
};
