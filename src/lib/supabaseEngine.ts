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
      if (!tenantsError && tenantsData) {
        result.tenants = tenantsData as Tenant[];
      }

      // 2. Users
      const { data: usersData, error: usersError } = await supabase.from('users').select('*');
      if (!usersError && usersData) {
        result.users = usersData as User[];
      }

      // 3. Services
      const { data: servicesData, error: servicesError } = await supabase.from('services').select('*');
      if (!servicesError && servicesData) {
        result.services = servicesData as Service[];
      }

      // 4. Staff
      const { data: staffData, error: staffError } = await supabase.from('staff').select('*');
      if (!staffError && staffData) {
        result.staff = staffData as StaffMember[];
      }

      // 5. Appointments
      const { data: aptData, error: aptError } = await supabase.from('appointments').select('*');
      if (!aptError && aptData) {
        result.appointments = aptData as Appointment[];
      }

      // 6. Business Hours
      const { data: bhData, error: bhError } = await supabase.from('business_hours').select('*');
      if (!bhError && bhData) {
        result.businessHours = bhData as BusinessHours[];
      }

      // 7. Invitations
      const { data: invData, error: invError } = await supabase.from('invitation_codes').select('*');
      if (!invError && invData) {
        result.invitations = invData as InvitationCode[];
      }
    } catch (err) {
      console.warn('Erro ao sincronizar dados do Supabase:', err);
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
    if (!supabase) return;
    try {
      const { error } = await supabase.from('tenants').upsert([tenant]);
      if (error) console.warn('Supabase upsertTenant error:', error.message);
    } catch (e) {
      console.warn('Supabase upsertTenant exception:', e);
    }
  },

  async upsertUser(user: User): Promise<void> {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('users').upsert([user]);
      if (error) console.warn('Supabase upsertUser error:', error.message);
    } catch (e) {
      console.warn('Supabase upsertUser exception:', e);
    }
  },

  async upsertService(service: Service): Promise<void> {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('services').upsert([service]);
      if (error) console.warn('Supabase upsertService error:', error.message);
    } catch (e) {
      console.warn('Supabase upsertService exception:', e);
    }
  },

  async deleteService(id: string): Promise<void> {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) console.warn('Supabase deleteService error:', error.message);
    } catch (e) {
      console.warn('Supabase deleteService exception:', e);
    }
  },

  async upsertStaff(staffMember: StaffMember): Promise<void> {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('staff').upsert([staffMember]);
      if (error) console.warn('Supabase upsertStaff error:', error.message);
    } catch (e) {
      console.warn('Supabase upsertStaff exception:', e);
    }
  },

  async deleteStaff(id: string): Promise<void> {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) console.warn('Supabase deleteStaff error:', error.message);
    } catch (e) {
      console.warn('Supabase deleteStaff exception:', e);
    }
  },

  async upsertAppointment(appointment: Appointment): Promise<void> {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('appointments').upsert([appointment]);
      if (error) console.warn('Supabase upsertAppointment error:', error.message);
    } catch (e) {
      console.warn('Supabase upsertAppointment exception:', e);
    }
  },

  async deleteAppointment(id: string): Promise<void> {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) console.warn('Supabase deleteAppointment error:', error.message);
    } catch (e) {
      console.warn('Supabase deleteAppointment exception:', e);
    }
  },

  async saveBusinessHours(hours: BusinessHours[]): Promise<void> {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('business_hours').upsert(hours);
      if (error) console.warn('Supabase saveBusinessHours error:', error.message);
    } catch (e) {
      console.warn('Supabase saveBusinessHours exception:', e);
    }
  },

  async upsertInvitationCode(invitation: InvitationCode): Promise<void> {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('invitation_codes').upsert([invitation]);
      if (error) console.warn('Supabase upsertInvitationCode error:', error.message);
    } catch (e) {
      console.warn('Supabase upsertInvitationCode exception:', e);
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
