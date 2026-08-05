import { supabase } from './supabase';
import { Tenant, User, Service, StaffMember, Appointment, BusinessHours, InvitationCode } from '../types';

export const supabaseEngine = {
  /**
   * Sync data from Supabase.
   * - Global sync (no tenantId): tenants, users, invitation_codes (small, auth-related)
   * - Tenant-scoped sync (with tenantId): services, staff, appointments, business_hours
   */
  async syncAllFromSupabase(tenantId?: string): Promise<{
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
      // Global tables (always sync, small size)
      const globalQueries = await Promise.allSettled([
        supabase.from('tenants').select('*'),
        supabase.from('users').select('*'),
        supabase.from('invitation_codes').select('*'),
      ]);

      if (globalQueries[0].status === 'fulfilled' && !globalQueries[0].value.error && globalQueries[0].value.data) {
        result.tenants = globalQueries[0].value.data as Tenant[];
      } else if (globalQueries[0].status === 'fulfilled' && globalQueries[0].value.error) {
        console.error('[EBD] sync tenants ERROR:', globalQueries[0].value.error.message);
      }

      if (globalQueries[1].status === 'fulfilled' && !globalQueries[1].value.error && globalQueries[1].value.data) {
        result.users = globalQueries[1].value.data as User[];
      } else if (globalQueries[1].status === 'fulfilled' && globalQueries[1].value.error) {
        console.error('[EBD] sync users ERROR:', globalQueries[1].value.error.message);
      }

      if (globalQueries[2].status === 'fulfilled' && !globalQueries[2].value.error && globalQueries[2].value.data) {
        result.invitations = globalQueries[2].value.data as InvitationCode[];
      } else if (globalQueries[2].status === 'fulfilled' && globalQueries[2].value.error) {
        console.error('[EBD] sync invitations ERROR:', globalQueries[2].value.error.message);
      }

      // Tenant-scoped tables (filtered by tenant_id when provided)
      const tenantQueries = await Promise.allSettled([
        tenantId
          ? supabase.from('services').select('*').eq('tenant_id', tenantId)
          : supabase.from('services').select('*'),
        tenantId
          ? supabase.from('staff').select('*').eq('tenant_id', tenantId)
          : supabase.from('staff').select('*'),
        tenantId
          ? supabase.from('appointments').select('*').eq('tenant_id', tenantId)
          : supabase.from('appointments').select('*'),
        tenantId
          ? supabase.from('business_hours').select('*').eq('tenant_id', tenantId)
          : supabase.from('business_hours').select('*'),
      ]);

      if (tenantQueries[0].status === 'fulfilled' && !tenantQueries[0].value.error && tenantQueries[0].value.data) {
        result.services = tenantQueries[0].value.data as Service[];
      } else if (tenantQueries[0].status === 'fulfilled' && tenantQueries[0].value.error) {
        console.error('[EBD] sync services ERROR:', tenantQueries[0].value.error.message);
      }

      if (tenantQueries[1].status === 'fulfilled' && !tenantQueries[1].value.error && tenantQueries[1].value.data) {
        result.staff = tenantQueries[1].value.data as StaffMember[];
      } else if (tenantQueries[1].status === 'fulfilled' && tenantQueries[1].value.error) {
        console.error('[EBD] sync staff ERROR:', tenantQueries[1].value.error.message);
      }

      if (tenantQueries[2].status === 'fulfilled' && !tenantQueries[2].value.error && tenantQueries[2].value.data) {
        result.appointments = tenantQueries[2].value.data as Appointment[];
      } else if (tenantQueries[2].status === 'fulfilled' && tenantQueries[2].value.error) {
        console.error('[EBD] sync appointments ERROR:', tenantQueries[2].value.error.message);
      }

      if (tenantQueries[3].status === 'fulfilled' && !tenantQueries[3].value.error && tenantQueries[3].value.data) {
        result.businessHours = tenantQueries[3].value.data.map((h: any) => ({
          dayNum: h.day_num,
          day: h.day,
          isOpen: h.is_open,
          startTime: h.start_time,
          endTime: h.end_time,
          breakStart: h.break_start,
          breakEnd: h.break_end,
          tenant_id: h.tenant_id,
        })) as BusinessHours[];
      } else if (tenantQueries[3].status === 'fulfilled' && tenantQueries[3].value.error) {
        console.error('[EBD] sync business_hours ERROR:', tenantQueries[3].value.error.message);
      }

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
      await supabase.from('business_hours').delete().eq('tenant_id', id);
      await supabase.from('appointments').delete().eq('tenant_id', id);
      await supabase.from('services').delete().eq('tenant_id', id);
      await supabase.from('staff').delete().eq('tenant_id', id);
      await supabase.from('users').delete().eq('tenant_id', id);
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) console.error('[EBD] deleteTenant ERROR:', error.message, error.details);
      else console.log('[EBD] deleteTenant OK (all tables cleaned):', id);
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

  async checkConflictInSupabase(staffId: string, date: string, startTime: string, endTime: string, tenantId?: string, excludeId?: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      let query = supabase.from('appointments').select('id').eq('staff_id', staffId).eq('date', date).neq('status', 'cancelled');
      if (tenantId) query = query.eq('tenant_id', tenantId);
      if (excludeId) query = query.neq('id', excludeId);
      const { data, error } = await query;
      if (error || !data) return false;
      return data.some((a: any) => startTime < a.end_time && endTime > a.start_time);
    } catch {
      return false;
    }
  },

  async upsertAppointment(appointment: Appointment): Promise<void> {
    if (!supabase) { console.warn('[EBD] upsertAppointment skipped: no Supabase client'); return; }
    const { error } = await supabase.from('appointments').upsert([appointment]).select();
    if (error) throw error;
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
