import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { Clock, Menu } from 'lucide-react';

const Navbar = ({ onHamburgerClick }) => {
  const { user, logout } = useAuth();
  const { lastUpdated } = useHealthData();
  const [timeAgo, setTimeAgo] = useState('just now');

  useEffect(() => {
    const update = () => {
      if (lastUpdated) setTimeAgo(formatDistanceToNow(lastUpdated, { addSuffix: true }));
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  return (
    <header
      className="navbar-padding"
      style={{
        height: '64px',
        background: '#fff',
        borderBottom: '1px solid #E0E0EA',
        fontFamily: 'Lato, sans-serif',
        padding: '0 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(40,50,140,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        gap: 12,
      }}
    >
      {/* ── Left: hamburger (mobile only) + last updated ─────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Hamburger — visible only when sidebar is hidden (CSS handles it) */}
        <button
          onClick={onHamburgerClick}
          aria-label="Open menu"
          className="hamburger-btn"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px', borderRadius: '8px', display: 'none',
            alignItems: 'center', justifyContent: 'center',
            color: '#28328C',
          }}
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Clock size={14} color="#787887" />
          <span className="navbar-time-label" style={{ fontSize: '13px', color: '#787887', fontWeight: 400 }}>
            Last updated:{' '}
            <strong style={{ color: '#414146', fontWeight: 700 }}>{timeAgo}</strong>
          </span>
        </div>
      </div>

      {/* ── Right: user info + logout ───────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="navbar-user-text" style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#28328C', lineHeight: 1.2 }}>{user.name}</p>
              <p style={{ fontSize: '11px', color: '#787887', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ID: {user._id?.slice(-6) || '------'}
              </p>
            </div>
            <button onClick={logout} className="btn-outline" style={{ fontFamily: 'Lato, sans-serif', whiteSpace: 'nowrap' }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
