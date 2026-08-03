import React, { createContext, useContext, useState, useEffect } from 'react';
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
  login: (email: string) => boolean;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Default to Super Admin on fresh session for quick inspection or client
    return storageEngine.loginByEmail('superadmin@ebd.com') || null;
  });

  const [allTenants, setAllTenants] = useState<Tenant[]>(() => storageEngine.getTenants());

  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(() => {
    const activeId = storageEngine.getActiveTenantId();
    return storageEngine.getTenantById(activeId) || allTenants[0] || null;
  });

  const [viewMode, setViewMode] = useState<'admin' | 'client'>('admin');
  const [isIsolatedVitrine, setIsIsolatedVitrine] = useState(false);
  const [urlSlugError, setUrlSlugError] = useState<string | null>(null);

  // Check URL slug for direct showcase link access
  useEffect(() => {
    const handleUrlSlugCheck = () => {
      const urlSlug = getSlugFromURL();
      if (urlSlug) {
        const found = storageEngine.getTenantBySlug(urlSlug);
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
    if (currentTenant) {
      const updated = tenants.find((t) => t.id === currentTenant.id);
      if (updated) setCurrentTenant(updated);
    }
  };

  const switchTenant = (tenantId: string) => {
    const t = storageEngine.getTenantById(tenantId);
    if (t) {
      setCurrentTenant(t);
      storageEngine.setActiveTenantId(t.id);
    }
  };

  const login = (email: string): boolean => {
    const user = storageEngine.loginByEmail(email);
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
