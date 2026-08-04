import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Tenant } from '../types';
import { storageEngine } from '../lib/storageEngine';
import { getSlugFromURL } from '../lib/urlUtils';

interface AuthContextType {
  currentUser: User | null;
  currentTenant: Tenant | null;
  allTenants: Tenant[];
  viewMode: 'admin' | 'client';
  isIsolatedVitrine: boolean;
  urlSlugError: string | null;
  setViewMode: (mode: 'admin' | 'client') => void;
  switchTenant: (tenantId: string) => void;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  registerTenantWithInvite: (data: {
    invitationCode: string;
    name: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    phone?: string;
    address?: string;
  }) => void;
  createTenantSuperAdmin: (data: {
    name: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    ownerPassword?: string;
    description?: string;
    address?: string;
    phone?: string;
  }) => void;
  updateProfile: (updates: Partial<User> & { bio?: string }) => void;
  updateCurrentTenant: (updates: Partial<Tenant>) => void;
  refreshData: () => void;
  syncTenantData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return storageEngine.getCurrentUserFromSession();
  });

  const [allTenants, setAllTenants] = useState<Tenant[]>(() => storageEngine.getTenants());

  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(() => {
    const activeId = storageEngine.getActiveTenantId();
    return storageEngine.getTenantById(activeId) || allTenants[0] || null;
  });

  const [viewMode, setViewMode] = useState<'admin' | 'client'>(() => {
    const sessionUser = storageEngine.getCurrentUserFromSession();
    return sessionUser && sessionUser.role !== 'customer' ? 'admin' : 'client';
  });
  const [isIsolatedVitrine, setIsIsolatedVitrine] = useState(false);
  const [urlSlugError, setUrlSlugError] = useState<string | null>(null);

  const currentTenantRef = useRef(currentTenant);
  currentTenantRef.current = currentTenant;

  // Global sync on mount (tenants, users, invitations only)
  useEffect(() => {
    let isMounted = true;

    storageEngine.syncFromSupabase().then(() => {
      if (isMounted) {
        refreshData();
      }
    });

    const handleStorageSynced = () => {
      if (isMounted) {
        refreshData();
      }
    };

    window.addEventListener('ebd_storage_synced', handleStorageSynced);
    return () => {
      isMounted = false;
      window.removeEventListener('ebd_storage_synced', handleStorageSynced);
    };
  }, []);

  // Tenant-scoped sync when currentTenant changes
  useEffect(() => {
    if (currentTenant) {
      storageEngine.syncFromSupabase(currentTenant.id);
    }
  }, [currentTenant?.id]);

  // Check URL slug for direct showcase link access
  useEffect(() => {
    const handleUrlSlugCheck = async () => {
      const urlSlug = getSlugFromURL();
      if (urlSlug) {
        const found = await storageEngine.fetchAndSyncTenantBySlug(urlSlug);
        if (found) {
          setCurrentTenant(found);
          storageEngine.setActiveTenantId(found.id);
          setViewMode('client');
          setIsIsolatedVitrine(true);
          setUrlSlugError(null);
        } else {
          setUrlSlugError(`A loja de URL "${urlSlug}" não foi encontrada no sistema.`);
          setViewMode('client');
        }
      }
    };

    handleUrlSlugCheck();

    window.addEventListener('popstate', handleUrlSlugCheck);
    window.addEventListener('hashchange', handleUrlSlugCheck);

    return () => {
      window.removeEventListener('popstate', handleUrlSlugCheck);
      window.removeEventListener('hashchange', handleUrlSlugCheck);
    };
  }, []);

  const refreshData = () => {
    const tenants = storageEngine.getTenants();
    setAllTenants(tenants);
    if (currentTenantRef.current) {
      const updated = tenants.find((t) => t.id === currentTenantRef.current!.id);
      if (updated) setCurrentTenant(updated);
    }
  };

  const syncTenantData = () => {
    if (currentTenantRef.current) {
      storageEngine.syncFromSupabase(currentTenantRef.current.id);
    }
  };

  const switchTenant = (tenantId: string) => {
    const t = storageEngine.getTenantById(tenantId);
    if (t) {
      setCurrentTenant(t);
      storageEngine.setActiveTenantId(t.id);
    }
  };

  const login = (email: string, password?: string): boolean => {
    const user = storageEngine.authenticateUser(email, password);
    if (user) {
      setCurrentUser(user);
      if (user.tenant_id) {
        switchTenant(user.tenant_id);
      }
      if (user.role === 'customer') {
        setViewMode('client');
      } else {
        setViewMode('admin');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    storageEngine.logoutSession();
    setCurrentUser(null);
    setViewMode('client');
  };

  const registerTenantWithInvite = (data: {
    invitationCode: string;
    name: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    phone?: string;
    address?: string;
  }) => {
    const { tenant, owner } = storageEngine.registerTenantWithInvite(data);
    refreshData();
    setCurrentUser(owner);
    switchTenant(tenant.id);
    setViewMode('admin');
  };

  const createTenantSuperAdmin = (data: {
    name: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    ownerPassword?: string;
    description?: string;
    address?: string;
    phone?: string;
  }) => {
    if (currentUser?.role !== 'super_admin') {
      throw new Error('Apenas o Super Admin Mestre pode criar lojas diretamente sem convite.');
    }
    const { tenant } = storageEngine.createTenantBySuperAdmin(data);
    refreshData();
    switchTenant(tenant.id);
  };

  const updateProfile = (updates: Partial<User> & { bio?: string }) => {
    if (!currentUser) return;
    const updated = storageEngine.updateUserProfile(currentUser.id, updates);
    setCurrentUser(updated);
    refreshData();
  };

  const updateCurrentTenant = (updates: Partial<Tenant>) => {
    if (!currentTenant) return;
    const updated = storageEngine.updateTenant(currentTenant.id, updates);
    setCurrentTenant(updated);
    refreshData();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentTenant,
        allTenants,
        viewMode,
        isIsolatedVitrine,
        urlSlugError,
        setViewMode,
        switchTenant,
        login,
        logout,
        registerTenantWithInvite,
        createTenantSuperAdmin,
        updateProfile,
        updateCurrentTenant,
        refreshData,
        syncTenantData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
