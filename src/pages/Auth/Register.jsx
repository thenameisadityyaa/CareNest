import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Parent', patientId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Convert 'Manager' to 'Care Manager' to match backend Enum
    const submitRole = form.role === 'Manager' ? 'Care Manager' : form.role;

    const res = await register(form.name, form.email, form.password, submitRole, form.patientId || null);
    if (res.success) {
      
    } else {
      setError(res.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0F0F5', fontFamily: 'Lato, sans-serif', padding: '40px 0' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center' }}>
        <Heart size={32} color="#14BEF0" className="mr-2" />
        <span style={{ fontSize: '30px', fontWeight: 900, color: '#28328C', letterSpacing: '-0.5px' }}>care<span style={{ color: '#14BEF0' }}>nest</span></span>
      </div>

      <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(40,50,140,0.08)', width: '100%', maxWidth: '480px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#28328C', marginBottom: '8px' }}>Create an Account</h2>
        <p style={{ fontSize: '14px', color: '#787887', marginBottom: '24px' }}>Set up role-based access for your family</p>

        {error && <div style={{ padding: '12px', background: '#FFF5F5', borderLeft: '4px solid #E53E3E', color: '#C53030', fontSize: '13px', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#414146', textTransform: 'uppercase', marginBottom: '8px' }}>Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={{ width: '100%', padding: '12px', border: '1.5px solid #E0E0EA', borderRadius: '4px', fontSize: '15px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#414146', textTransform: 'uppercase', marginBottom: '8px' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required style={{ width: '100%', padding: '12px', border: '1.5px solid #E0E0EA', borderRadius: '4px', fontSize: '15px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#414146', textTransform: 'uppercase', marginBottom: '8px' }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required style={{ width: '100%', padding: '12px', border: '1.5px solid #E0E0EA', borderRadius: '4px', fontSize: '15px' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#414146', textTransform: 'uppercase', marginBottom: '8px' }}>Role</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} required style={{ width: '100%', padding: '12px', border: '1.5px solid #E0E0EA', borderRadius: '4px', fontSize: '15px', background: '#fff' }}>
              <option value="Parent">Parent (Elder / Owner)</option>
              <option value="Child">Child (Read-only)</option>
              <option value="Manager">Care Manager (Data Entry)</option>
            </select>
          </div>

          {form.role !== 'Parent' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#414146', textTransform: 'uppercase', marginBottom: '8px' }}>Patient ID (User ID of the Parent)</label>
              <input type="text" value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} style={{ width: '100%', padding: '12px', border: '1.5px solid #E0E0EA', borderRadius: '4px', fontSize: '15px' }} placeholder="Optional for this assignment demo" />
              <p style={{ fontSize: '11px', color: '#787887', marginTop: '4px' }}>Leave blank to auto-create a sandbox patient for testing.</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-cyan" style={{ padding: '14px', marginTop: '8px', fontSize: '15px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#787887' }}>
          Already have an account? <Link to="/login" style={{ color: '#14BEF0', fontWeight: 700, textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
