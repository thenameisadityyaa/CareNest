import React, { useState } from 'react';
import { Search, UserCheck, AlertCircle, ChevronRight, Activity } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

/**
 * PatientLookup — gating page for Parents, Children, and Managers
 *
 * Props:
 *   onFound(patient) — called when a valid patient code is resolved
 *   token           — JWT for the Authorization header
 */
const PatientLookup = ({ onFound, token, onLogout }) => {
  const { user } = useAuth();
  const userRole = user?.role;
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [found,   setFound]   = useState(null);   // preview before confirm

  const BACKEND = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setFound(null);
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND}/api/patients/lookup?code=${encodeURIComponent(code.trim())}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Patient not found.');
      } else {
        setFound(data);
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F0F4FF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif', padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '16px',
            background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(37,99,235,0.35)'
          }}>
            <Search size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px' }}>
            {userRole === 'parent' ? 'Find Your Child' : userRole === 'child' ? 'Access Your Records' : 'Patient Lookup'}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            {userRole === 'parent' ? "Enter your child's unique ID to view their health metrics" : 
             userRole === 'child' ? 'Enter your unique patient ID to access your dashboard' :
             'Enter a patient code to access their health records'}
          </p>
        </div>

        {/* Search card */}
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '28px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #E8EEFF'
        }}>
          <form onSubmit={handleSearch}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              {userRole === 'parent' ? 'Child ID' : userRole === 'child' ? 'Patient ID' : 'Patient Code'}
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); setFound(null); }}
                placeholder="e.g. CN-0001"
                maxLength={8}
                style={{
                  flex: 1, padding: '12px 16px',
                  fontSize: '16px', fontWeight: 600, fontFamily: 'monospace',
                  border: `2px solid ${error ? '#FCA5A5' : '#E2E8F0'}`,
                  borderRadius: '12px', outline: 'none',
                  background: '#F8FAFC', color: '#1E293B',
                  letterSpacing: '0.08em',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { if (!error) e.target.style.borderColor = '#2563EB'; }}
                onBlur={e => { e.target.style.borderColor = error ? '#FCA5A5' : '#E2E8F0'; }}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !code.trim()}
                style={{
                  padding: '12px 20px', borderRadius: '12px', border: 'none',
                  background: loading || !code.trim() ? '#CBD5E1' : '#2563EB',
                  color: '#fff', fontWeight: 700, fontSize: '14px',
                  cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                {loading ? (
                  <Activity size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Search size={16} />
                )}
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 14, padding: '12px 14px', borderRadius: '10px',
                background: '#FEF2F2', border: '1px solid #FCA5A5',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <AlertCircle size={15} color="#EF4444" />
                <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: 600 }}>{error}</span>
              </div>
            )}
          </form>

          {/* Found patient preview */}
          {found && (
            <div style={{ marginTop: 20, borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748B',
                textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>
                Patient Found
              </p>

              <div style={{
                background: '#F0F9FF', border: '1px solid #BAE6FD',
                borderRadius: '14px', padding: '16px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px',
                    background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <UserCheck size={20} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', margin: 0 }}>{found.name}</p>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                      Code: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                        {found.patientCode}
                      </span>
                      {found.age ? `  ·  Age ${found.age}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onFound(found)}
                style={{
                  marginTop: 14, width: '100%', padding: '13px',
                  borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
                  color: '#fff', fontWeight: 700, fontSize: '14px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6,
                  boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                View Patient Dashboard <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Hint */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: 20 }}>
          Patient codes are assigned automatically on registration (e.g. CN-0001)
        </p>

        {onLogout && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button 
              onClick={onLogout}
              style={{
                background: 'none', border: 'none', color: '#64748B', 
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                textDecoration: 'underline', transition: 'color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.color = '#1E293B'}
              onMouseOut={e => e.currentTarget.style.color = '#64748B'}
            >
              Log out and switch account
            </button>
          </div>
        )}

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
};

export default PatientLookup;
