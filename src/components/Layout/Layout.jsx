import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Lato, sans-serif', overflow: 'hidden', background: '#F0F4FF' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div className={`sidebar-wrapper${sidebarOpen ? ' open' : ''}`}>
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* ── Mobile overlay backdrop ──────────────────────────────────────────── */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={closeSidebar}
        aria-label="Close sidebar"
      />

      {/* ── Main content area ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Navbar onHamburgerClick={openSidebar} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div className="layout-main" style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
