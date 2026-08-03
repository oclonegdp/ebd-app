import { Tenant, User, Service, StaffMember, Appointment, BusinessHours, InvitationCode } from '../types';

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
    full_name: 'Super Admin Mestre',
    role: 'super_admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-owner-001',
    email: 'anamaria@ebdbarber.com',
    full_name: 'Ana Maria Dantas',
    role: 'owner',
    tenant_id: 'ebd-tenant-001',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    phone: '(11) 98888-7777'
  },
  {
    id: 'usr-staff-001',
    email: 'mariana@ebdbarber.com',
    full_name: 'Mariana Silva',
    role: 'staff',
    tenant_id: 'ebd-tenant-001',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    phone: '(11) 97777-6666'
  },
  {
    id: 'usr-staff-002',
    email: 'carlos@ebdbarber.com',
    full_name: 'Carlos Eduardo (Kadu)',
    role: 'staff',
    tenant_id: 'ebd-tenant-001',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    phone: '(11) 98765-1111'
  },
  {
    id: 'usr-staff-003',
    email: 'gabriel@ebdbarber.com',
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
      };
      newOwner = users[existingUserIdx];
    } else {
      newOwner = {
        id: `usr-owner-${Date.now()}`,
        email: params.ownerEmail,
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
    services.push({
      id: `srv-${Date.now()}`,
      tenant_id: newTenant.id,
      name: 'Corte de Cabelo Básico',
      description: 'Serviço inicial cadastrado automaticamente.',
      duration_minutes: 30,
      price: 50.0,
      image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80',
      category: 'Cabelo',
    });
    setItem(STORAGE_KEYS.SERVICES, services);

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
    return newCode;
  },

  // USERS & AUTH
  getUsers(): User[] {
    return getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },
  loginByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
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
    return updatedTenant;
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
    return updated;
  },
  deleteService(id: string): void {
    const services = getItem<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    setItem(STORAGE_KEYS.SERVICES, services.filter((s) => s.id !== id));
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

    if (existingUserIdx !== -1) {
      users[existingUserIdx] = {
        ...users[existingUserIdx],
        full_name: member.name,
        role: 'staff',
        tenant_id: member.tenant_id,
        avatar_url: member.avatar_url,
        phone: member.phone,
      };
    } else {
      users.push({
        id: `usr-staff-${Date.now()}`,
        email: member.email,
        full_name: member.name,
        role: 'staff',
        tenant_id: member.tenant_id,
        avatar_url: member.avatar_url,
        phone: member.phone,
      });
    }
    setItem(STORAGE_KEYS.USERS, users);

    return updated;
  },
  deleteStaffMember(id: string): void {
    const staff = getItem<StaffMember[]>(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
    const target = staff.find((s) => s.id === id);
    if (target) {
      // Remove staff record
      setItem(STORAGE_KEYS.STAFF, staff.filter((s) => s.id !== id));
      
      // Optionally remove corresponding staff user
      const users = getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
      setItem(
        STORAGE_KEYS.USERS,
        users.filter((u) => u.email.toLowerCase() !== target.email.toLowerCase())
      );
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
  createAppointment(apt: Omit<Appointment, 'id' | 'created_at'>): Appointment {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
    const newApt: Appointment = {
      ...apt,
      id: `apt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    appointments.unshift(newApt);
    setItem(STORAGE_KEYS.APPOINTMENTS, appointments);
    return newApt;
  },
  updateAppointmentStatus(id: string, status: 'confirmed' | 'completed' | 'cancelled'): void {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
    const updated = appointments.map((a) => (a.id === id ? { ...a, status } : a));
    setItem(STORAGE_KEYS.APPOINTMENTS, updated);
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
    return updated;
  },
  deleteAppointment(id: string): void {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
    setItem(STORAGE_KEYS.APPOINTMENTS, appointments.filter((a) => a.id !== id));
  },

  // BUSINESS HOURS
  getBusinessHours(): BusinessHours[] {
    return getItem<BusinessHours[]>(STORAGE_KEYS.BUSINESS_HOURS, DEFAULT_BUSINESS_HOURS);
  },
  saveBusinessHours(hours: BusinessHours[]): void {
    setItem(STORAGE_KEYS.BUSINESS_HOURS, hours);
  }
};

initStorage();
