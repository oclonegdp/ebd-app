import { Tenant, User, Service, StaffMember, Appointment, BusinessHours, InvitationCode } from '../types';
import { supabaseEngine } from './supabaseEngine';

const STORAGE_KEYS = {
  TENANTS: 'ebd_tenants_v1',
  USERS: 'ebd_users_v1',
  SERVICES: 'ebd_services_v1',
  STAFF: 'ebd_staff_v1',
  APPOINTMENTS: 'ebd_appointments_v1',
  BUSINESS_HOURS: 'ebd_business_hours_v1',
  INVITATION_CODES: 'ebd_invitations_v1',
  ACTIVE_TENANT_ID: 'ebd_active_tenant_id_v1',
  CURRENT_USER_ID: 'ebd_current_user_id_v1',
};

// Initial Default Data
const DEFAULT_TENANTS: Tenant[] = [
  {
    id: 'ebd-tenant-001',
    name: 'EBD BarberShop',
    slug: 'ebd-barbershop',
    logo_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80',
    description: 'A EBD BarberShop é uma barbearia com mais de 12 anos de tradição. Os melhores barbeiros da cidade ao seu dispor.',
    address: 'Avenida Sapopemba, 1020 - São Paulo, SP',
    phone: '(11) 98765-4321',
    created_at: new Date().toISOString(),
    active: true,
    plan: 'pro',
    license_expires_at: '2026-12-31',
    max_staff: 10,
  },
  {
    id: 'ebd-tenant-002',
    name: 'El Bravo Studio Hair',
    slug: 'elbravo-studio',
    logo_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&auto=format&fit=crop&q=80',
    description: 'Estúdio de alta performance para cortes contemporâneos, coloração e tratamentos estéticos.',
    address: 'Rua Augusta, 450 - São Paulo, SP',
    phone: '(11) 91234-5678',
    created_at: new Date().toISOString(),
    active: true,
    plan: 'trial',
    license_expires_at: '2026-09-30',
    max_staff: 5,
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-superadmin',
    email: 'superadmin@ebd.com',
    password: 'admin123',
    full_name: 'Super Admin Mestre',
    role: 'super_admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-owner-001',
    email: 'anamaria@ebdbarber.com',
    password: '123456',
    full_name: 'Ana Maria Dantas',
    role: 'owner',
    tenant_id: 'ebd-tenant-001',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    phone: '(11) 98888-7777'
  },
  {
    id: 'usr-staff-001',
    email: 'mariana@ebdbarber.com',
    password: '123456',
    full_name: 'Mariana Silva',
    role: 'staff',
    tenant_id: 'ebd-tenant-001',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    phone: '(11) 97777-6666'
  },
  {
    id: 'usr-staff-002',
    email: 'carlos@ebdbarber.com',
    password: '123456',
    full_name: 'Carlos Eduardo (Kadu)',
    role: 'staff',
    tenant_id: 'ebd-tenant-001',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    phone: '(11) 98765-1111'
  },
  {
    id: 'usr-staff-003',
    email: 'gabriel@ebdbarber.com',
    password: '123456',
    full_name: 'Gabriel Santos',
    role: 'staff',
    tenant_id: 'ebd-tenant-001',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    phone: '(11) 98888-2222'
  }
];

const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-001',
    tenant_id: 'ebd-tenant-001',
    name: 'Corte Degradê Premium',
    description: 'Corte moderno com técnica navalhada, lavagem e finalização com pomada modeladora.',
    duration_minutes: 45,
    price: 65.0,
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80',
    category: 'Barbearia'
  },
  {
    id: 'srv-002',
    tenant_id: 'ebd-tenant-001',
    name: 'Barba Terapia com Toalha Quente',
    description: 'Desenho da barba, alinhamento, óleo de hidratação e massagem relaxante facial.',
    duration_minutes: 35,
    price: 45.0,
    image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&auto=format&fit=crop&q=80',
    category: 'Barba'
  },
  {
    id: 'srv-003',
    tenant_id: 'ebd-tenant-001',
    name: 'Combo VIP (Corte + Barba + Sobrancelha)',
    description: 'Serviço completo para o homem moderno com direito a bebida cortesia da casa.',
    duration_minutes: 75,
    price: 100.0,
    image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&auto=format&fit=crop&q=80',
    category: 'Combos'
  }
];

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'st-001',
    tenant_id: 'ebd-tenant-001',
    name: 'Carlos Eduardo (Kadu)',
    email: 'carlos@ebdbarber.com',
    phone: '(11) 98765-1111',
    bio: 'Especialista em tesoura e cortes clássicos há mais de 8 anos.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    specialties: ['Corte Clássico', 'Barba Terapia']
  },
  {
    id: 'st-002',
    tenant_id: 'ebd-tenant-001',
    name: 'Mariana Silva',
    email: 'mariana@ebdbarber.com',
    phone: '(11) 97777-6666',
    bio: 'Mestre em degradê, freestyle e tratamentos capilares masculinos.',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    specialties: ['Degradê Navalhado', 'Platinado / Coloração']
  },
  {
    id: 'st-003',
    tenant_id: 'ebd-tenant-001',
    name: 'Gabriel Santos',
    email: 'gabriel@ebdbarber.com',
    phone: '(11) 98888-2222',
    bio: 'Barbeiro especialista em barboterapia e visagismo facial.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    specialties: ['Visagismo', 'Barba Terapia']
  }
];

const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    tenant_id: 'ebd-tenant-001',
    service_id: 'srv-001',
    staff_id: 'st-002',
    customer_name: 'Lucas Ferreira',
    customer_email: 'lucas@gmail.com',
    customer_phone: '(11) 99887-1122',
    date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '10:45',
    price: 65.0,
    status: 'confirmed',
    payment_method: 'local',
    created_at: new Date().toISOString()
  },
  {
    id: 'apt-002',
    tenant_id: 'ebd-tenant-001',
    service_id: 'srv-003',
    staff_id: 'st-001',
    customer_name: 'Roberto Dantas',
    customer_email: 'roberto@gmail.com',
    customer_phone: '(11) 98822-3344',
    date: new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '15:15',
    price: 100.0,
    status: 'confirmed',
    payment_method: 'online_simulated',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { dayNum: 0, day: 'Domingo', isOpen: false, startTime: '09:00', endTime: '14:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 1, day: 'Segunda-feira', isOpen: true, startTime: '09:00', endTime: '20:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 2, day: 'Terça-feira', isOpen: true, startTime: '09:00', endTime: '20:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 3, day: 'Quarta-feira', isOpen: true, startTime: '09:00', endTime: '20:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 4, day: 'Quinta-feira', isOpen: true, startTime: '09:00', endTime: '20:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 5, day: 'Sexta-feira', isOpen: true, startTime: '08:00', endTime: '21:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 6, day: 'Sábado', isOpen: true, startTime: '08:00', endTime: '21:00', breakStart: '12:00', breakEnd: '13:00' }
];

const DEFAULT_INVITATIONS: InvitationCode[] = [
  {
    id: 'inv-001',
    code: 'EBD-DONO-2026',
    role: 'owner',
    max_uses: 10,
    uses_count: 1,
    created_at: new Date().toISOString(),
    active: true
  },
  {
    id: 'inv-002',
    code: 'EBD-STAFF-2026',
    role: 'staff',
    tenant_id: 'ebd-tenant-001',
    max_uses: 20,
    uses_count: 2,
    created_at: new Date().toISOString(),
    active: true
  }
];

// Helper Storage Functions
function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Error reading key ${key}:`, e);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error setting key ${key}:`, e);
  }
}

// Initialize default storage state if empty
export function initStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
    setItem(STORAGE_KEYS.TENANTS, DEFAULT_TENANTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    setItem(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
    setItem(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    setItem(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUSINESS_HOURS)) {
    setItem(STORAGE_KEYS.BUSINESS_HOURS, DEFAULT_BUSINESS_HOURS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVITATION_CODES)) {
    setItem(STORAGE_KEYS.INVITATION_CODES, DEFAULT_INVITATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT_ID)) {
    setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, 'ebd-tenant-001');
  }
}

// Data API Engine
export const storageEngine = {
  // SUPABASE SYNC
  async syncFromSupabase(): Promise<boolean> {
    const data = await supabaseEngine.syncAllFromSupabase();
    let hasChanges = false;

    function mergeById<T extends { id: string }>(remote: T[], local: T[]): T[] {
      const merged = [...remote];
      for (const l of local) {
        if (!merged.find((r) => r.id === l.id)) merged.push(l);
      }
      return merged;
    }
    function mergeByDayNum(remote: BusinessHours[], local: BusinessHours[]): BusinessHours[] {
      const merged = [...remote];
      for (const l of local) {
        if (!merged.find((r) => r.dayNum === l.dayNum)) merged.push(l);
      }
      return merged;
    }

    if (data.tenants && data.tenants.length > 0) {
      const local = getItem<Tenant[]>(STORAGE_KEYS.TENANTS, DEFAULT_TENANTS);
      setItem(STORAGE_KEYS.TENANTS, mergeById(data.tenants, local));
      hasChanges = true;
    }
    if (data.users && data.users.length > 0) {
      const local = getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
      setItem(STORAGE_KEYS.USERS, mergeById(data.users, local));
      hasChanges = true;
    }
    if (data.services && data.services.length > 0) {
      const local = getItem<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
      setItem(STORAGE_KEYS.SERVICES, mergeById(data.services, local));
      hasChanges = true;
    }
    if (data.staff && data.staff.length > 0) {
      const local = getItem<StaffMember[]>(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
      setItem(STORAGE_KEYS.STAFF, mergeById(data.staff, local));
      hasChanges = true;
    }
    if (data.appointments && data.appointments.length > 0) {
      const local = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
      setItem(STORAGE_KEYS.APPOINTMENTS, mergeById(data.appointments, local));
      hasChanges = true;
    }
    if (data.businessHours && data.businessHours.length > 0) {
      const local = getItem<BusinessHours[]>(STORAGE_KEYS.BUSINESS_HOURS, DEFAULT_BUSINESS_HOURS);
      setItem(STORAGE_KEYS.BUSINESS_HOURS, mergeByDayNum(data.businessHours, local));
      hasChanges = true;
    }
    if (data.invitations && data.invitations.length > 0) {
      const local = getItem<InvitationCode[]>(STORAGE_KEYS.INVITATION_CODES, DEFAULT_INVITATIONS);
      setItem(STORAGE_KEYS.INVITATION_CODES, mergeById(data.invitations, local));
      hasChanges = true;
    }

    if (hasChanges) {
      window.dispatchEvent(new CustomEvent('ebd_storage_synced'));
    } else {
      // Seed default data if remote is empty
      supabaseEngine.seedDefaultsIfEmpty({
        tenants: DEFAULT_TENANTS,
        users: DEFAULT_USERS,
        services: DEFAULT_SERVICES,
        staff: DEFAULT_STAFF,
        invitations: DEFAULT_INVITATIONS,
      });
    }

    return hasChanges;
  },

  async fetchAndSyncTenantBySlug(slug: string): Promise<Tenant | undefined> {
    const clean = slug.trim().toLowerCase();
    const local = this.getTenantBySlug(clean);

    const remoteTenant = await supabaseEngine.fetchTenantBySlug(clean);
    if (remoteTenant) {
      const tenants = this.getTenants();
      const idx = tenants.findIndex((t) => t.id === remoteTenant.id || t.slug.toLowerCase() === clean);
      if (idx !== -1) {
        tenants[idx] = remoteTenant;
      } else {
        tenants.push(remoteTenant);
      }
      setItem(STORAGE_KEYS.TENANTS, tenants);
      window.dispatchEvent(new CustomEvent('ebd_storage_synced'));
      return remoteTenant;
    }

    return local;
  },

  // TENANTS
  getTenants(): Tenant[] {
    return getItem<Tenant[]>(STORAGE_KEYS.TENANTS, DEFAULT_TENANTS);
  },
  getTenantById(id: string): Tenant | undefined {
    return this.getTenants().find((t) => t.id === id);
  },
  getTenantBySlug(slug: string): Tenant | undefined {
    const clean = slug.trim().toLowerCase();
    return this.getTenants().find((t) => t.slug.toLowerCase() === clean);
  },
  getActiveTenantId(): string {
    return getItem<string>(STORAGE_KEYS.ACTIVE_TENANT_ID, 'ebd-tenant-001');
  },
  setActiveTenantId(id: string): void {
    setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, id);
  },
  toggleTenantStatus(id: string): Tenant[] {
    const tenants = this.getTenants().map((t) =>
      t.id === id ? { ...t, active: !t.active } : t
    );
    setItem(STORAGE_KEYS.TENANTS, tenants);

    const updated = tenants.find((t) => t.id === id);
    if (updated) {
      supabaseEngine.upsertTenant(updated).catch(() => {});
    }
    return tenants;
  },

  // SUPER ADMIN DIRECT TENANT CREATION
  createTenantBySuperAdmin(params: {
    name: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    ownerPassword?: string;
    description?: string;
    address?: string;
    phone?: string;
  }): { tenant: Tenant; owner: User } {
    const tenants = this.getTenants();
    const users = this.getUsers();

    // Check slug uniqueness
    const normalizedSlug = params.slug.toLowerCase().replace(/\s+/g, '-');
    if (tenants.some((t) => t.slug === normalizedSlug)) {
      throw new Error('Já existe uma loja cadastrada com este slug / URL.');
    }

    const future30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newTenant: Tenant = {
      id: `ebd-tenant-${Date.now()}`,
      name: params.name,
      slug: normalizedSlug,
      logo_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80',
      description: params.description || `Unidade ${params.name} cadastrada pelo Super Admin.`,
      address: params.address || 'Endereço Comercial',
      phone: params.phone || '(11) 90000-0000',
      created_at: new Date().toISOString(),
      active: true,
      plan: 'pro',
      license_expires_at: future30Days,
      max_staff: 10,
    };

    let newOwner: User;
    const existingUserIdx = users.findIndex(
      (u) => u.email.toLowerCase() === params.ownerEmail.toLowerCase()
    );

    if (existingUserIdx !== -1) {
      users[existingUserIdx] = {
        ...users[existingUserIdx],
        full_name: params.ownerName,
        role: 'owner',
        tenant_id: newTenant.id,
        phone: params.phone || users[existingUserIdx].phone,
        ...(params.ownerPassword ? { password: params.ownerPassword } : {}),
      };
      newOwner = users[existingUserIdx];
    } else {
      newOwner = {
        id: `usr-owner-${Date.now()}`,
        email: params.ownerEmail,
        password: params.ownerPassword || '123456',
        full_name: params.ownerName,
        role: 'owner',
        tenant_id: newTenant.id,
        phone: params.phone,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      };
      users.push(newOwner);
    }

    tenants.push(newTenant);

    setItem(STORAGE_KEYS.TENANTS, tenants);
    setItem(STORAGE_KEYS.USERS, users);

    // Initialize basic default service for the new tenant
    const services = this.getServices();
    const defaultService: Service = {
      id: `srv-${Date.now()}`,
      tenant_id: newTenant.id,
      name: 'Corte de Cabelo Básico',
      description: 'Serviço inicial cadastrado automaticamente.',
      duration_minutes: 30,
      price: 50.0,
      image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80',
      category: 'Cabelo',
    };
    services.push(defaultService);
    setItem(STORAGE_KEYS.SERVICES, services);

    // Save to Supabase
    supabaseEngine.upsertTenant(newTenant).catch(() => {});
    supabaseEngine.upsertUser(newOwner).catch(() => {});
    supabaseEngine.upsertService(defaultService).catch(() => {});

    return { tenant: newTenant, owner: newOwner };
  },

  // REGISTER TENANT VIA INVITATION CODE (Strictly required for self-registration)
  registerTenantWithInvite(params: {
    invitationCode: string;
    name: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    phone?: string;
    address?: string;
  }): { tenant: Tenant; owner: User } {
    const invitations = this.getInvitationCodes();
    const cleanCode = params.invitationCode.trim().toUpperCase();

    const invite = invitations.find((i) => i.code.toUpperCase() === cleanCode && i.active);

    if (!invite) {
      throw new Error('Código de convite inválido ou inativo. Apenas lojas com código emitido pelo Super Admin podem se registrar.');
    }

    if (invite.role !== 'owner') {
      throw new Error('O código informado não pertence ao nível de permissão de Dono de Loja (Owner).');
    }

    if (invite.uses_count >= invite.max_uses) {
      throw new Error('Este código de convite atingiu o limite máximo de utilizações.');
    }

    // Slug check
    const tenants = this.getTenants();
    const normalizedSlug = params.slug.toLowerCase().replace(/\s+/g, '-');
    if (tenants.some((t) => t.slug === normalizedSlug)) {
      throw new Error('Já existe uma loja registrada com este Slug / URL.');
    }

    // Create Tenant and Owner
    const newTenant: Tenant = {
      id: `ebd-tenant-${Date.now()}`,
      name: params.name,
      slug: normalizedSlug,
      logo_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80',
      description: `Unidade ${params.name} registrada via convite oficial.`,
      address: params.address || 'Endereço Principal',
      phone: params.phone || '(11) 99999-9999',
      created_at: new Date().toISOString(),
      active: true,
    };

    const newOwner: User = {
      id: `usr-owner-${Date.now()}`,
      email: params.ownerEmail,
      full_name: params.ownerName,
      password: '123456',
      role: 'owner',
      tenant_id: newTenant.id,
      phone: params.phone,
    };

    tenants.push(newTenant);
    const users = this.getUsers();
    users.push(newOwner);

    // Consume 1 use of invitation code
    invite.uses_count += 1;

    setItem(STORAGE_KEYS.TENANTS, tenants);
    setItem(STORAGE_KEYS.USERS, users);
    setItem(STORAGE_KEYS.INVITATION_CODES, invitations);

    // Save to Supabase
    supabaseEngine.upsertTenant(newTenant).catch(() => {});
    supabaseEngine.upsertUser(newOwner).catch(() => {});
    supabaseEngine.upsertInvitationCode(invite).catch(() => {});

    return { tenant: newTenant, owner: newOwner };
  },

  // INVITATION CODES
  getInvitationCodes(): InvitationCode[] {
    return getItem<InvitationCode[]>(STORAGE_KEYS.INVITATION_CODES, DEFAULT_INVITATIONS);
  },
  generateInvitationCode(role: 'owner' | 'staff', tenantId?: string, maxUses = 10): InvitationCode {
    const invitations = this.getInvitationCodes();
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const prefix = role === 'owner' ? 'EBD-DONO' : 'EBD-STAFF';
    const newCode: InvitationCode = {
      id: `inv-${Date.now()}`,
      code: `${prefix}-${randomHex}`,
      role,
      tenant_id: tenantId,
      max_uses: maxUses,
      uses_count: 0,
      created_at: new Date().toISOString(),
      active: true,
    };
    invitations.unshift(newCode);
    setItem(STORAGE_KEYS.INVITATION_CODES, invitations);

    supabaseEngine.upsertInvitationCode(newCode).catch(() => {});
    return newCode;
  },

  // USERS & AUTH
  getUsers(): User[] {
    return getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },
  authenticateUser(email: string, password?: string): User | undefined {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return undefined;

    // Check password if set on user
    if (user.password && user.password !== cleanPass) {
      return undefined;
    }

    // Persist session
    setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    return user;
  },
  getCurrentUserFromSession(): User | null {
    const userId = getItem<string | null>(STORAGE_KEYS.CURRENT_USER_ID, null);
    if (!userId) return null;
    const users = this.getUsers();
    return users.find((u) => u.id === userId) || null;
  },
  logoutSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch (e) {
      console.error('Error logging out session:', e);
    }
  },
  loginByEmail(email: string): User | undefined {
    const users = this.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setItem(STORAGE_KEYS.CURRENT_USER_ID, found.id);
    }
    return found;
  },
  updateUserProfile(userId: string, updates: Partial<User> & { bio?: string }): User {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      throw new Error('Usuário não encontrado.');
    }

    const updatedUser = { ...users[idx], ...updates };
    users[idx] = updatedUser;
    setItem(STORAGE_KEYS.USERS, users);

    supabaseEngine.upsertUser(updatedUser).catch(() => {});

    // If staff user, update StaffMember record as well
    if (updatedUser.role === 'staff' || updatedUser.role === 'owner') {
      const staffList = getItem<StaffMember[]>(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
      const staffIdx = staffList.findIndex(
        (s) => s.email.toLowerCase() === updatedUser.email.toLowerCase()
      );
      if (staffIdx !== -1) {
        staffList[staffIdx] = {
          ...staffList[staffIdx],
          name: updatedUser.full_name,
          avatar_url: updatedUser.avatar_url || staffList[staffIdx].avatar_url,
          phone: updatedUser.phone || staffList[staffIdx].phone,
          ...(updates.bio ? { bio: updates.bio } : {}),
        };
        setItem(STORAGE_KEYS.STAFF, staffList);
        supabaseEngine.upsertStaff(staffList[staffIdx]).catch(() => {});
      }
    }

    return updatedUser;
  },

  updateTenant(tenantId: string, updates: Partial<Tenant>): Tenant {
    const tenants = this.getTenants();
    const idx = tenants.findIndex((t) => t.id === tenantId);
    if (idx === -1) {
      throw new Error('Loja não encontrada.');
    }

    const updatedTenant = { ...tenants[idx], ...updates };
    tenants[idx] = updatedTenant;
    setItem(STORAGE_KEYS.TENANTS, tenants);

    supabaseEngine.upsertTenant(updatedTenant).catch(() => {});
    return updatedTenant;
  },

  deleteTenant(tenantId: string): void {
    const tenants = this.getTenants();
    setItem(STORAGE_KEYS.TENANTS, tenants.filter((t) => t.id !== tenantId));
    supabaseEngine.deleteTenant(tenantId).catch(() => {});

    const users = getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    setItem(STORAGE_KEYS.USERS, users.filter((u) => u.tenant_id !== tenantId));

    const services = getItem<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    setItem(STORAGE_KEYS.SERVICES, services.filter((s) => s.tenant_id !== tenantId));

    const staff = getItem<StaffMember[]>(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
    setItem(STORAGE_KEYS.STAFF, staff.filter((s) => s.tenant_id !== tenantId));
  },

  // SERVICES
  getServices(tenantId?: string): Service[] {
    const services = getItem<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    if (tenantId) {
      return services.filter((s) => s.tenant_id === tenantId);
    }
    return services;
  },
  saveService(service: Omit<Service, 'id'> & { id?: string }): Service {
    const services = getItem<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    let updated: Service;
    if (service.id) {
      updated = service as Service;
      const idx = services.findIndex((s) => s.id === service.id);
      if (idx !== -1) services[idx] = updated;
    } else {
      updated = { ...service, id: `srv-${Date.now()}` };
      services.push(updated);
    }
    setItem(STORAGE_KEYS.SERVICES, services);

    supabaseEngine.upsertService(updated).catch(() => {});
    return updated;
  },
  deleteService(id: string): void {
    const services = getItem<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    setItem(STORAGE_KEYS.SERVICES, services.filter((s) => s.id !== id));

    supabaseEngine.deleteService(id).catch(() => {});
  },

  // STAFF
  getStaff(tenantId?: string): StaffMember[] {
    const staff = getItem<StaffMember[]>(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
    if (tenantId) {
      return staff.filter((s) => s.tenant_id === tenantId);
    }
    return staff;
  },
  saveStaffMember(member: Omit<StaffMember, 'id'> & { id?: string }, password?: string): StaffMember {
    const staff = getItem<StaffMember[]>(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
    let updated: StaffMember;
    if (member.id) {
      updated = member as StaffMember;
      const idx = staff.findIndex((s) => s.id === member.id);
      if (idx !== -1) staff[idx] = updated;
    } else {
      updated = { ...member, id: `st-${Date.now()}` };
      staff.push(updated);
    }
    setItem(STORAGE_KEYS.STAFF, staff);

    // Register or update corresponding User in Auth store with role 'staff' and tenant_id
    const users = getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const existingUserIdx = users.findIndex(
      (u) => u.email.toLowerCase() === member.email.toLowerCase()
    );

    let correspondingUser: User;
    if (existingUserIdx !== -1) {
      users[existingUserIdx] = {
        ...users[existingUserIdx],
        full_name: member.name,
        role: 'staff',
        tenant_id: member.tenant_id,
        avatar_url: member.avatar_url,
        phone: member.phone,
        ...(password ? { password } : {}),
      };
      correspondingUser = users[existingUserIdx];
    } else {
      correspondingUser = {
        id: `usr-staff-${Date.now()}`,
        email: member.email,
        password: password || '123456',
        full_name: member.name,
        role: 'staff',
        tenant_id: member.tenant_id,
        avatar_url: member.avatar_url,
        phone: member.phone,
      };
      users.push(correspondingUser);
    }
    setItem(STORAGE_KEYS.USERS, users);

    supabaseEngine.upsertStaff(updated).catch(() => {});
    supabaseEngine.upsertUser(correspondingUser).catch(() => {});

    return updated;
  },
  deleteStaffMember(id: string): void {
    const staff = getItem<StaffMember[]>(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
    const target = staff.find((s) => s.id === id);
    if (target) {
      // Remove staff record
      setItem(STORAGE_KEYS.STAFF, staff.filter((s) => s.id !== id));
      supabaseEngine.deleteStaff(id).catch(() => {});
      
      // Optionally remove corresponding staff user
      const users = getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
      const targetUser = users.find((u) => u.email.toLowerCase() === target.email.toLowerCase());
      if (targetUser) {
        setItem(
          STORAGE_KEYS.USERS,
          users.filter((u) => u.email.toLowerCase() !== target.email.toLowerCase())
        );
        supabaseEngine.deleteUser(targetUser.id).catch(() => {});
      }
    }
  },

  // APPOINTMENTS
  getAppointments(tenantId?: string): Appointment[] {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
    if (tenantId) {
      return appointments.filter((a) => a.tenant_id === tenantId);
    }
    return appointments;
  },
  hasScheduleConflict(staffId: string, date: string, startTime: string, endTime: string, tenantId?: string, excludeId?: string): boolean {
    const all = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
    const appointments = tenantId ? all.filter((a) => a.tenant_id === tenantId) : all;
    return appointments.some((a) => {
      if (a.id === excludeId) return false;
      if (a.staff_id !== staffId || a.date !== date) return false;
      if (a.status === 'cancelled') return false;
      return startTime < a.end_time && endTime > a.start_time;
    });
  },
  createAppointment(apt: Omit<Appointment, 'id' | 'created_at'>): Appointment {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);

    if (this.hasScheduleConflict(apt.staff_id, apt.date, apt.start_time, apt.end_time, apt.tenant_id)) {
      throw new Error('Conflito de horário: este profissional já possui agendamento neste horário.');
    }

    const newApt: Appointment = {
      ...apt,
      id: `apt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    appointments.unshift(newApt);
    setItem(STORAGE_KEYS.APPOINTMENTS, appointments);

    supabaseEngine.upsertAppointment(newApt).catch(() => {});
    return newApt;
  },
  updateAppointmentStatus(id: string, status: 'confirmed' | 'completed' | 'cancelled'): void {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
    const updated = appointments.map((a) => (a.id === id ? { ...a, status } : a));
    setItem(STORAGE_KEYS.APPOINTMENTS, updated);

    const target = updated.find((a) => a.id === id);
    if (target) {
      supabaseEngine.upsertAppointment(target).catch(() => {});
    }
  },
  updateAppointment(id: string, updates: Partial<Appointment>): Appointment {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
    const idx = appointments.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new Error('Agendamento não encontrado.');
    }
    const updated = { ...appointments[idx], ...updates };
    appointments[idx] = updated;
    setItem(STORAGE_KEYS.APPOINTMENTS, appointments);

    supabaseEngine.upsertAppointment(updated).catch(() => {});
    return updated;
  },
  deleteAppointment(id: string): void {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
    setItem(STORAGE_KEYS.APPOINTMENTS, appointments.filter((a) => a.id !== id));

    supabaseEngine.deleteAppointment(id).catch(() => {});
  },

  // BUSINESS HOURS (per-tenant)
  getBusinessHours(tenantId?: string): BusinessHours[] {
    const all = getItem<BusinessHours[]>(STORAGE_KEYS.BUSINESS_HOURS, DEFAULT_BUSINESS_HOURS);
    if (tenantId) {
      const filtered = all.filter((h) => h.tenant_id === tenantId);
      if (filtered.length > 0) return filtered;
    }
    return all.filter((h) => !h.tenant_id);
  },
  saveBusinessHours(hours: BusinessHours[], tenantId?: string): void {
    const all = getItem<BusinessHours[]>(STORAGE_KEYS.BUSINESS_HOURS, DEFAULT_BUSINESS_HOURS);
    const tagged = hours.map((h) => ({ ...h, tenant_id: tenantId || h.tenant_id }));
    const others = all.filter((h) => h.tenant_id && h.tenant_id !== tenantId);
    setItem(STORAGE_KEYS.BUSINESS_HOURS, [...others, ...tagged]);

    supabaseEngine.saveBusinessHours(tagged);
  }
};

initStorage();
