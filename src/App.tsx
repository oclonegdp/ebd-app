import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/Auth/LoginModal';
import { RegisterTenantModal } from './components/Auth/RegisterTenantModal';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PublicVitrine } from './components/Customer/PublicVitrine';
import { SuperAdminDashboard } from './components/SuperAdmin/SuperAdminDashboard';
import { OwnerDashboard } from './components/Owner/OwnerDashboard';
import { WeeklySchedule } from './components/Owner/WeeklySchedule';
import { ServicesManager } from './components/Owner/ServicesManager';
import { StaffManager } from './components/Owner/StaffManager';
import { BusinessHoursManager } from './components/Owner/BusinessHoursManager';
import { StaffDashboard } from './components/Staff/StaffDashboard';

const MainAppContent: React.FC = () => {
  const { currentUser, loading, viewMode, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentUser?.role === 'super_admin') return 'superadmin_dashboard';
    if (currentUser?.role === 'staff') return 'staff_dashboard';
    return 'owner_dashboard';
  });

  React.useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      setActiveTab('superadmin_dashboard');
    } else if (currentUser?.role === 'staff') {
      setActiveTab('staff_dashboard');
    } else if (currentUser?.role === 'owner') {
      setActiveTab('owner_dashboard');
    }
  }, [currentUser?.id, currentUser?.role]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0F1115] text-white">
        <p className="text-sm font-mono tracking-wider animate-pulse">CARREGANDO SISTEMA...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="relative h-screen w-screen bg-[#0F1115] flex items-center justify-center overflow-hidden">
        <LoginModal
          onClose={() => {}}
          onOpenRegister={() => setShowRegister(true)}
        />
        {showRegister && (
          <RegisterTenantModal onClose={() => setShowRegister(false)} />
        )}
      </div>
    );
  }

  if (viewMode === 'client') {
    return (
      <div className="min-h-screen bg-[#0F1115] text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1">
          <PublicVitrine />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-slate-100 flex flex-col">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main key={activeTab} className="flex-1 overflow-y-auto animate-fade-in">
          {activeTab === 'superadmin_dashboard' && <SuperAdminDashboard />}
          {activeTab === 'owner_dashboard' && <OwnerDashboard />}
          {activeTab === 'weekly_schedule' && <WeeklySchedule />}
          {activeTab === 'services_manager' && <ServicesManager />}
          {activeTab === 'staff_manager' && <StaffManager />}
          {activeTab === 'business_hours' && <BusinessHoursManager />}
          {activeTab === 'staff_dashboard' && <StaffDashboard />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
