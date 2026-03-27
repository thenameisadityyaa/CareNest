import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Bell, Heart, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import RedPanicButton from '../Emergency/RedPanicButton';

const Sidebar = ({ onClose }) => {
  const { userRole } = useAuth();
  const { patientInfo, switchPatient } = useHealthData();

  const navItems = [
    { name: 'Dashboard',       path: '/dashboard', icon: LayoutDashboard, roles: ['parent', 'child', 'manager', 'caremanager'] },
    { name: 'Log Health Data', path: '/add-data',  icon: Activity,        roles: ['child', 'manager', 'caremanager'] },
    { name: 'Alerts',          path: '/alerts',    icon: Bell,            roles: ['parent', 'child', 'manager', 'caremanager'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  const handleSwitchPatient = () => {
    switchPatient(null);
    onClose?.();
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    onClose?.();
  };

  return (
    <aside style={{ width: '250px', background: '#28328C', minHeight: '100vh', fontFamily: 'Lato, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Logo + mobile close button */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heart size={22} color="#14BEF0" />
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
            care<span style={{ color: '#14BEF0' }}>nest</span>
          </span>
        </div>
        {/* Close button — only visible on mobile via CSS */}
        <button
          onClick={onClose}
          className="sidebar-close-btn"
          aria-label="Close menu"
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
            borderRadius: '8px', padding: '6px', display: 'none',
            alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Role Badge */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div style={{ background: 'rgba(20,190,240,0.15)', borderRadius: '6px', padding: '8px 14px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Signed in as
          </p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textTransform: 'capitalize', margin: '2px 0 0' }}>
            {userRole === 'caremanager' ? 'Care Manager' : userRole === 'parent' ? 'Parent' : 'Child (Read-only)'}
          </p>
        </div>
      </div>

      {/* Active patient code badge (Care Manager only) */}
      {userRole === 'caremanager' && patientInfo?.patientCode && (
        <div style={{ padding: '0 20px 8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '7px 14px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
              Active Patient
            </p>
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#14BEF0', fontFamily: 'monospace', margin: '2px 0 0' }}>
              {patientInfo.patientCode}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ padding: '12px 12px 0', flex: 1 }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px', marginBottom: '8px' }}>
          Navigation
        </p>

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleNavClick}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'background 0.15s',
                background: isActive ? '#14BEF0' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
              })}
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}

        {/* Switch Patient — Care Manager only */}
        {userRole === 'caremanager' && (
          <button
            onClick={handleSwitchPatient}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', borderRadius: '8px', marginTop: '8px',
              width: '100%', fontSize: '14px', fontWeight: 700,
              background: 'rgba(20,190,240,0.12)', color: '#14BEF0',
              border: '1px dashed rgba(20,190,240,0.4)', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(20,190,240,0.22)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(20,190,240,0.12)'}
          >
            <Search size={16} />
            Switch Patient
          </button>
        )}
      </nav>

      {/* Emergency panic button (Parent only) */}
      {userRole === 'parent' && (
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <RedPanicButton />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
