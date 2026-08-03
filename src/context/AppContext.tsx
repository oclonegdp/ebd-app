import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Business, 
  Service, 
  StaffMember, 
  Appointment, 
  NotificationItem, 
  User, 
  UserAccount,
  ActiveTab,
  AppointmentStatus,
  BlockedSlot 
} from '../types';
import { 
  INITIAL_USER, 
  INITIAL_BUSINESSES, 
  INITIAL_SERVICES, 
  INITIAL_STAFF, 
  INITIAL_APPOINTMENTS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_BLOCKED_SLOTS 
} from '../data/mockData';
import { isSupabaseConfigured, syncCollection, fetchAll } from '../db/supabaseClient';

interface BookingModalOptions {
  isOpen: boolean;
  serviceId?: string;
  staffId?: string;
  date?: string;
  timeSlot?: string;
}

// Loaded from environment only (never hardcoded / never shown in the UI)
const getSuperAdminCredentials = () => {
  const env = (import.meta as unknown as { env: Record<string, string> }).env || {};
  return {
    login: (env.VITE_SUPER_ADMIN_EMAIL || '').toLowerCase().trim(),
    password: env.VITE_SUPER_ADMIN_PASSWORD || ''
  };
};

export const isSuperAdminCredential = (emailInput: string, passwordInput: string): boolean => {
  const { login, password } = getSuperAdminCredentials();
  if (!login || !password) return false;
  return emailInput.trim().toLowerCase() === login && passwordInput === password;
};

const hashPassword = (pw: string): string => {
  let hash = 5381;
  for (let i = 0; i < pw.length; i++) {
    hash = ((hash << 5) + hash + pw.charCodeAt(i)) >>> 0;
  }
  return `h${hash.toString(16)}`;
};

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  viewMode: 'admin' | 'client';
  setViewMode: (mode: 'admin' | 'client') => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  // RBAC helpers
  isClient: boolean;
  isStaff: boolean;
  isOwner: boolean;
  isSuperAdminUser: boolean;
  // Account auth
  userAccounts: UserAccount[];
  registerUserAccount: (account: Omit<UserAccount, 'id' | 'createdAt' | 'passwordHash'> & { password: string }) => UserAccount;
  loginWithCredentials: (email: string, password: string) => { user: User | null; error: string | null };
  businesses: Business[];
  selectedBusiness: Business;
  setSelectedBusinessId: (id: string) => void;
  connectByInviteCode: (code: string) => boolean;
  addBusiness: (b: Omit<Business, 'id'>) => Business;
  updateBusiness: (id: string, info: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;
  extendBusinessPlan: (id: string, days: number) => void;
  
  services: Service[];
  staff: StaffMember[];
  appointments: Appointment[];
  notifications: NotificationItem[];
  blockedSlots: BlockedSlot[];
  
  // Modals & Drawers
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSuperAdminModalOpen: boolean;
  setIsSuperAdminModalOpen: (open: boolean) => void;
  isInviteModalOpen: boolean;
  setIsInviteModalOpen: (open: boolean) => void;

  bookingModal: BookingModalOptions;
  openBookingModal: (options?: Partial<BookingModalOptions>) => void;
  closeBookingModal: () => void;
  
  selectedStaffForAgenda: StaffMember | null;
  setSelectedStaffForAgenda: (staff: StaffMember | null) => void;

  // Actions
  addAppointment: (newApp: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addStaffMember: (member: Omit<StaffMember, 'id'>) => StaffMember;
  updateStaffMember: (id: string, member: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;

  // Schedule & Time Blocks
  addBlockedSlot: (slot: Omit<BlockedSlot, 'id' | 'createdAt'>) => void;
  deleteBlockedSlot: (id: string) => void;
  updateStaffSchedule: (staffId: string, schedule: { availableDays: string[]; workStart: string; workEnd: string; lunchStart?: string; lunchEnd?: string }) => void;
  
  updateBusinessInfo: (info: Partial<Business>) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wally_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [viewMode, setViewMode] = useState<'admin' | 'client'>('admin');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem('wally_businesses');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
  });

  const [selectedBusinessId, setSelectedBusinessIdState] = useState<string>('biz_barber');

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || businesses[0];

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('wally_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('wally_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('wally_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('wally_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() => {
    const saved = localStorage.getItem('wally_blocked_slots');
    return saved ? JSON.parse(saved) : INITIAL_BLOCKED_SLOTS;
  });

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('wally_user_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [bookingModal, setBookingModal] = useState<BookingModalOptions>({ isOpen: false });
  const [selectedStaffForAgenda, setSelectedStaffForAgenda] = useState<StaffMember | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('wally_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('wally_businesses', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem('wally_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('wally_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('wally_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('wally_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('wally_blocked_slots', JSON.stringify(blockedSlots));
  }, [blockedSlots]);

  useEffect(() => {
    localStorage.setItem('wally_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  // ---- Supabase: hidratação inicial + write-through (fallback localStorage) ----
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      hydratedRef.current = true;
      return;
    }
    let active = true;
    (async () => {
      const [biz, srv, stf, apps, blks, accts] = await Promise.all([
        fetchAll('businesses'),
        fetchAll('services'),
        fetchAll('staff'),
        fetchAll('appointments'),
        fetchAll('blockedSlots'),
        fetchAll('userAccounts'),
      ]);
      if (!active) return;
      if (biz.length) setBusinesses(biz as unknown as Business[]);
      if (srv.length) setServices(srv as unknown as Service[]);
      if (stf.length) setStaff(stf as unknown as StaffMember[]);
      if (apps.length) setAppointments(apps as unknown as Appointment[]);
      if (blks.length) setBlockedSlots(blks as unknown as BlockedSlot[]);
      if (accts.length) setUserAccounts(accts as unknown as UserAccount[]);
      hydratedRef.current = true;
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => { if (hydratedRef.current) syncCollection('businesses', businesses as unknown as Record<string, unknown>[]); }, [businesses]);
  useEffect(() => { if (hydratedRef.current) syncCollection('services', services as unknown as Record<string, unknown>[]); }, [services]);
  useEffect(() => { if (hydratedRef.current) syncCollection('staff', staff as unknown as Record<string, unknown>[]); }, [staff]);
  useEffect(() => { if (hydratedRef.current) syncCollection('appointments', appointments as unknown as Record<string, unknown>[]); }, [appointments]);
  useEffect(() => { if (hydratedRef.current) syncCollection('blockedSlots', blockedSlots as unknown as Record<string, unknown>[]); }, [blockedSlots]);
  useEffect(() => { if (hydratedRef.current) syncCollection('userAccounts', userAccounts as unknown as Record<string, unknown>[]); }, [userAccounts]);

  // URL boot parsing for multi-tenant invite links or tenant slug/code
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const codeParam = searchParams.get('code') || searchParams.get('invite') || searchParams.get('tenant') || searchParams.get('b');
      if (codeParam) {
        const found = businesses.find(
          b => 
            b.inviteCode.toLowerCase() === codeParam.toLowerCase() ||
            b.slug.toLowerCase() === codeParam.toLowerCase() ||
            b.id.toLowerCase() === codeParam.toLowerCase()
        );
        if (found) {
          setSelectedBusinessIdState(found.id);
        }
      }
    } catch (e) {
      console.error('Error parsing tenant URL params', e);
    }
  }, [businesses]);

  // If user is a salon owner (admin) bound to a specific businessId, lock selectedBusiness to their businessId
  useEffect(() => {
    if (currentUser?.role === 'admin' && currentUser.businessId) {
      const exists = businesses.some(b => b.id === currentUser.businessId);
      if (exists && selectedBusinessId !== currentUser.businessId) {
        setSelectedBusinessIdState(currentUser.businessId);
      }
    }
  }, [currentUser, businesses, selectedBusinessId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const registerUserAccount = (
    account: Omit<UserAccount, 'id' | 'createdAt' | 'passwordHash'> & { password: string }
  ): UserAccount => {
    const cleanEmail = account.email.trim().toLowerCase();
    const existing = userAccounts.find(u => u.email.toLowerCase() === cleanEmail);
    const created: UserAccount = {
      id: existing ? existing.id : `acc_${Date.now()}`,
      name: account.name,
      email: cleanEmail,
      passwordHash: hashPassword(account.password || '1234'),
      role: account.role,
      businessId: account.businessId,
      staffId: account.staffId,
      createdAt: existing ? existing.createdAt : new Date().toISOString()
    };
    setUserAccounts(prev => {
      const others = prev.filter(u => u.email.toLowerCase() !== cleanEmail);
      return [created, ...others];
    });
    return created;
  };

  const authenticateUser = (email: string, password: string): User | null => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Super Admin (somente via variáveis de ambiente, nunca hardcoded)
    if (isSuperAdminCredential(cleanEmail, password)) {
      const superAdminUser: User = {
        id: 'usr_superadmin',
        name: 'El Bravo Dantas (Super Admin)',
        email: cleanEmail,
        role: 'superadmin',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        phone: '(11) 98000-0000'
      };
      return superAdminUser;
    }

    // 2. Contas registradas (cliente, dono ou profissional)
    const account = userAccounts.find(u => u.email.toLowerCase() === cleanEmail);
    if (account) {
      if (account.passwordHash !== hashPassword(password)) return null;
      if (account.role === 'staff') {
        const stf = staff.find(s => s.id === account.staffId);
        const user: User = {
          id: `usr_${account.id}`,
          name: account.name,
          email: account.email,
          role: 'staff',
          businessId: account.businessId || stf?.businessId,
          staffId: account.staffId || stf?.id,
          avatarUrl: stf?.avatarUrl
        };
        return user;
      }
      const user: User = {
        id: `usr_${account.id}`,
        name: account.name,
        email: account.email,
        role: account.role === 'admin' ? 'admin' : 'client',
        businessId: account.businessId,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        phone: '(11) 99888-7766'
      };
      return user;
    }

    return null;
  };

  const loginWithCredentials = (email: string, password: string): { user: User | null; error: string | null } => {
    if (!email || !password) return { user: null, error: 'Informe e-mail e senha.' };
    const user = authenticateUser(email, password);
    if (!user) return { user: null, error: 'Credenciais inválidas. Verifique e-mail e senha.' };
    setCurrentUser(user);
    if (user.businessId) setSelectedBusinessIdState(user.businessId);
    return { user, error: null };
  };

  const isClient = !currentUser || currentUser.role === 'client' || viewMode === 'client';
  const isStaff = currentUser?.role === 'staff';
  const isOwner = currentUser?.role === 'admin';
  const isSuperAdminUser = currentUser?.role === 'superadmin';

  const setSelectedBusinessId = (id: string) => {
    setSelectedBusinessIdState(id);
    const biz = businesses.find(b => b.id === id);
    if (biz) {
      showToast(`Ambiente alternado para: ${biz.name} (Isolado)`);
    }
  };

  const connectByInviteCode = (code: string): boolean => {
    const trimmed = code.trim().toLowerCase();
    const found = businesses.find(
      b => b.inviteCode.toLowerCase() === trimmed || b.slug.toLowerCase() === trimmed || b.id.toLowerCase() === trimmed
    );
    if (found) {
      setSelectedBusinessIdState(found.id);
      showToast(`Conectado com sucesso ao estabelecimento: ${found.name}`);
      return true;
    }
    showToast('Código de convite ou link do estabelecimento não encontrado.');
    return false;
  };

  const addBusiness = (newBizData: Omit<Business, 'id'>): Business => {
    const newId = `biz_${Date.now()}`;
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const defaultPlanExpires = future.toISOString().split('T')[0];

    const created: Business = {
      ...newBizData,
      id: newId,
      planExpiresAt: newBizData.planExpiresAt || defaultPlanExpires
    };
    setBusinesses(prev => [created, ...prev]);
    setSelectedBusinessIdState(newId);

    // Cria a conta de acesso do proprietário (dono/super admin)
    if (created.ownerEmail && created.ownerPassword) {
      registerUserAccount({
        name: created.ownerName || 'Proprietário',
        email: created.ownerEmail,
        password: created.ownerPassword,
        role: 'admin',
        businessId: created.id
      });
    }

    showToast(`Empresa "${created.name}" criada com sucesso!`);
    return created;
  };

  const updateBusiness = (id: string, info: Partial<Business>) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...info } : b));
    showToast('Dados da empresa atualizados com sucesso!');
  };

  const deleteBusiness = (id: string) => {
    const total = businesses.length;
    if (total <= 1) {
      showToast('Não é possível excluir a última empresa cadastrada.');
      return;
    }
    setBusinesses(prev => {
      const filtered = prev.filter(b => b.id !== id);
      if (selectedBusinessId === id && filtered.length > 0) {
        setSelectedBusinessIdState(filtered[0].id);
      }
      return filtered;
    });
    // Clean up associated resources
    setServices(prev => prev.filter(s => s.businessId !== id));
    setStaff(prev => prev.filter(s => s.businessId !== id));
    setAppointments(prev => prev.filter(a => a.businessId !== id));
    setBlockedSlots(prev => prev.filter(b => b.businessId !== id));
    setUserAccounts(prev => prev.filter(u => u.businessId !== id));
    showToast('Empresa e todos os seus registros foram excluídos.');
  };

  const extendBusinessPlan = (id: string, additionalDays: number) => {
    setBusinesses(prev => prev.map(b => {
      if (b.id !== id) return b;
      let currentExp = b.planExpiresAt ? new Date(b.planExpiresAt) : new Date();
      if (isNaN(currentExp.getTime()) || currentExp < new Date()) {
        currentExp = new Date();
      }
      currentExp.setDate(currentExp.getDate() + additionalDays);
      const newExpStr = currentExp.toISOString().split('T')[0];
      return { ...b, planExpiresAt: newExpStr };
    }));
    showToast(`Plano estendido em +${additionalDays} dias com sucesso!`);
  };

  const openBookingModal = (options?: Partial<BookingModalOptions>) => {
    setBookingModal({
      isOpen: true,
      serviceId: options?.serviceId,
      staffId: options?.staffId,
      date: options?.date,
      timeSlot: options?.timeSlot,
    });
  };

  const closeBookingModal = () => {
    setBookingModal({ isOpen: false });
  };

  const addAppointment = (newApp: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const created: Appointment = {
      ...newApp,
      id: `app_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [created, ...prev]);

    // Create notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Novo Agendamento Confirmado',
      message: `${created.clientName} agendou ${created.serviceName} para ${created.date} às ${created.timeSlot} com ${created.staffName}.`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'booking'
    };

    setNotifications(prev => [newNotif, ...prev]);
    showToast(`Agendamento de ${created.clientName} realizado com sucesso!`);
    return created;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    const statusLabels: Record<AppointmentStatus, string> = {
      confirmed: 'Confirmado',
      pending: 'Pendente',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    showToast(`Status do agendamento alterado para ${statusLabels[status]}`);
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    showToast('Agendamento removido.');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Notificações limpas');
  };

  const addService = (srv: Omit<Service, 'id'>) => {
    const created: Service = { ...srv, id: `srv_${Date.now()}` };
    setServices(prev => [...prev, created]);
    showToast(`Serviço "${created.name}" adicionado com sucesso!`);
  };

  const updateService = (id: string, updated: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    showToast('Serviço atualizado.');
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    showToast('Serviço removido.');
  };

  const addStaffMember = (stf: Omit<StaffMember, 'id'>): StaffMember => {
    const created: StaffMember = { ...stf, id: `stf_${Date.now()}` };
    setStaff(prev => [...prev, created]);
    showToast(`Profissional "${created.name}" cadastrado!`);
    return created;
  };

  const updateStaffMember = (id: string, updated: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    showToast('Dados do profissional atualizados.');
  };

  const deleteStaffMember = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    showToast('Profissional removido.');
  };

  const updateBusinessInfo = (info: Partial<Business>) => {
    setBusinesses(prev => prev.map(b => b.id === selectedBusiness.id ? { ...b, ...info } : b));
    showToast('Informações do negócio atualizadas!');
  };

  const addBlockedSlot = (slot: Omit<BlockedSlot, 'id' | 'createdAt'>) => {
    const created: BlockedSlot = {
      ...slot,
      id: `blk_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setBlockedSlots(prev => [created, ...prev]);
    showToast(`Horário ${created.timeSlot} (${created.date}) bloqueado na agenda!`);
  };

  const deleteBlockedSlot = (id: string) => {
    setBlockedSlots(prev => prev.filter(b => b.id !== id));
    showToast('Bloqueio removido da agenda.');
  };

  const updateStaffSchedule = (staffId: string, schedule: { availableDays: string[]; workStart: string; workEnd: string; lunchStart?: string; lunchEnd?: string }) => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, ...schedule } : s));
    showToast('Expediente do profissional atualizado!');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        isClient,
        isStaff,
        isOwner,
        isSuperAdminUser,
        userAccounts,
        registerUserAccount,
        loginWithCredentials,
        businesses,
        selectedBusiness,
        setSelectedBusinessId,
        connectByInviteCode,
        addBusiness,
        updateBusiness,
        deleteBusiness,
        extendBusinessPlan,
        services,
        staff,
        appointments,
        notifications,
        blockedSlots,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSuperAdminModalOpen,
        setIsSuperAdminModalOpen,
        isInviteModalOpen,
        setIsInviteModalOpen,
        bookingModal,
        openBookingModal,
        closeBookingModal,
        selectedStaffForAgenda,
        setSelectedStaffForAgenda,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        markNotificationAsRead,
        clearNotifications,
        addService,
        updateService,
        deleteService,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        addBlockedSlot,
        deleteBlockedSlot,
        updateStaffSchedule,
        updateBusinessInfo,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
