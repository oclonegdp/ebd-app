import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TenantHeaderBadge } from './components/TenantHeaderBadge';
import { DashboardView } from './components/DashboardView';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { StorefrontView } from './components/StorefrontView';
import { ServicesManagementView } from './components/ServicesManagementView';
import { StaffSection } from './components/StaffSection';
import { StaffPortalView } from './components/StaffPortalView';
import { WorkScheduleManagementView } from './components/WorkScheduleManagementView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { BookingModal } from './components/BookingModal';
import { SuperAdminModal } from './components/SuperAdminModal';
import { InviteCodeModal } from './components/InviteCodeModal';
import { Toast } from './components/Toast';

const MainLayout: React.FC = () => {
  const { activeTab, viewMode, currentUser } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isClient = !currentUser || currentUser.role === 'client' || viewMode === 'client';
  const isStaff = currentUser?.role === 'staff';

  const renderContent = () => {
    if (isClient) {
      if (activeTab === 'notifications') return <NotificationsView />;
      return <StorefrontView />;
    }

    if (isStaff) {
      if (activeTab === 'expediente') return <WorkScheduleManagementView />;
      if (activeTab === 'storefront') return <StorefrontView />;
      if (activeTab === 'notifications') return <NotificationsView />;
      return <StaffPortalView />;
    }

    // Owner / Super Admin
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'schedule':
        return <WeeklyScheduleView />;
      case 'expediente':
        return <WorkScheduleManagementView />;
      case 'storefront':
        return <StorefrontView />;
      case 'services':
        return <ServicesManagementView />;
      case 'staff':
        return <StaffSection />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Dark Sidebar Menu */}
      <Sidebar 
        isOpenMobile={mobileSidebarOpen} 
        onCloseMobile={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        
        {/* Multi-Tenant Active Banner */}
        <TenantHeaderBadge />

        {/* Dynamic Tab Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <AuthModal />
      <BookingModal />
      <SuperAdminModal />
      <InviteCodeModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
