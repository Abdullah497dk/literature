import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';
import { Footer } from '../common/Footer';
import { ConfigNoticeBanner } from '../common/ConfigNoticeBanner';
import { useAuth } from '../../context/AuthContext';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSupabaseConfigured, role, switchDemoRole, user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Notice Banner when credentials are pending */}
      <ConfigNoticeBanner
        isConfigured={isSupabaseConfigured}
        currentRole={role}
        onSwitchDemoRole={switchDemoRole}
        currentUser={user}
      />

      {/* Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2rem 1.5rem 0 1.5rem',
            marginLeft: 0,
            transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="dvlp-main-content"
        >
          <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', paddingBottom: '3rem' }}>
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .dvlp-main-content {
            margin-left: 260px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AppLayout;
