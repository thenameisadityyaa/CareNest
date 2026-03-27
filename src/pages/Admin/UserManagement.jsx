import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, MoreHorizontal, 
  Trash2, Shield, User, UserCheck, 
  ToggleLeft, ToggleRight, Loader2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const BACKEND = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Connection error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers(); // Refresh list
      } else {
        const data = await res.json();
        alert(data.message || 'Error updating status');
      }
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this user? This cannot be undone.')) return;
    
    try {
      const res = await fetch(`${BACKEND}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
      } else {
        const data = await res.json();
        alert(data.message || 'Error deleting user');
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading && users.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748B' }}>
        <Loader2 className="animate-spin" size={40} />
        <p style={{ marginTop: 16, fontWeight: 600 }}>Loading User Directory...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', margin: 0 }}>User Management</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Monitor and control system accessibility</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ 
            background: '#2563EB', color: '#fff', padding: '10px 18px', 
            borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'not-allowed', opacity: 0.8
          }}>
            <Users size={18} /> Add User
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{ 
        background: '#fff', padding: '16px 24px', borderRadius: '16px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '20px', 
        alignItems: 'center', marginBottom: '24px', border: '1px solid #E2E8F0'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={18} />
          <input 
            type="text" 
            placeholder="Search User, Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px',
              border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none',
              background: '#F8FAFC'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Role</span>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ 
              padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0',
              fontSize: '14px', outline: 'none', background: '#fff', fontWeight: 500
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="caremanager">Care Manager</option>
            <option value="parent">Parent</option>
            <option value="child">Child</option>
          </select>
        </div>

        <button style={{ 
          padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0',
          background: '#fff', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '14px', fontWeight: 600
        }}>
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Users Table */}
      <div style={{ 
        background: '#fff', borderRadius: '16px', overflow: 'hidden', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>User Info</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Joined</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B'
                    }}>
                      {user.role === 'admin' ? <Shield size={20} /> : <User size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '14px' }}>{user.name}</div>
                      <div style={{ color: '#64748B', fontSize: '12px' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.02em',
                    background: user.role === 'admin' ? '#FEF2F2' : user.role === 'caremanager' ? '#F0F9FF' : '#F0FDF4',
                    color: user.role === 'admin' ? '#991B1B' : user.role === 'caremanager' ? '#075985' : '#166534'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <button 
                    onClick={() => handleToggleStatus(user._id)}
                    style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', gap: '8px',
                      color: user.isActive ? '#10B981' : '#94A3B8',
                      fontWeight: 600, fontSize: '13px'
                    }}
                  >
                    {user.isActive ? (
                      <><ToggleRight size={28} /> Active</>
                    ) : (
                      <><ToggleLeft size={28} /> Inactive</>
                    )}
                  </button>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleDeleteUser(user._id)}
                      title="Delete User"
                      style={{ 
                        background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444',
                        padding: '6px', borderRadius: '6px', transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >
                      <Trash2 size={18} />
                    </button>
                    <button title="More Options" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>
      
      {/* Footer info */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '12px' }}>
        <div>Showing {filteredUsers.length} of {users.length} users</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Page 1 of 1</span>
        </div>
      </div>

    </div>
  );
};

export default UserManagement;
